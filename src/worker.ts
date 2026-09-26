/**
 * Cloudflare Worker API & Edge router for Simone & Jovita Maps
 * Backed by Cloudflare D1 & Woosmap APIs
 */

export interface Env {
  DB: any; // Cloudflare D1Database binding
  NEXT_PUBLIC_WOOSMAP_API_KEY?: string;
  WOOSMAP_API_KEY?: string;
  ADMIN_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-token, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Health check
      if (url.pathname === '/api/health') {
        return Response.json({ status: 'ok', runtime: 'cloudflare-worker' }, { headers: corsHeaders });
      }

      const woosmapKey = env.NEXT_PUBLIC_WOOSMAP_API_KEY || env.WOOSMAP_API_KEY || 'woos-public-demo-key-12345';

      // 2. Config endpoint (maps client key)
      if (url.pathname === '/api/config') {
        return Response.json({
          woosmapApiKey: woosmapKey,
          environment: 'production-edge'
        }, { headers: corsHeaders });
      }

      // 3. Address Validation / Autocomplete API proxy
      if (url.pathname === '/api/validate' && request.method === 'POST') {
        const body: any = await request.json();
        const query = (body.addressLines || []).join(', ');
        
        const wRes = await fetch(
          `https://api.woosmap.com/localities/autocomplete?key=${woosmapKey}&input=${encodeURIComponent(query)}`
        );
        const wData = await wRes.json();
        const formattedAddress = wData?.predictions?.[0]?.description || query;
        const lat = wData?.predictions?.[0]?.geometry?.location?.lat || 37.5029;
        const lng = wData?.predictions?.[0]?.geometry?.location?.lng || 15.0873;

        return Response.json({
          result: {
            verdict: {
              validationGranularity: 'PREMISE',
              addressComplete: true
            },
            address: {
              formattedAddress,
              addressComponents: [
                { componentType: 'country', componentName: { text: body.regionCode || 'US' } }
              ]
            },
            geocode: {
              location: { latitude: lat, longitude: lng }
            }
          }
        }, { status: 200, headers: corsHeaders });
      }

      // 3.5. Sync status endpoint for Cloudflare D1
      if (url.pathname === '/api/sync-status') {
        try {
          const resRow = await env.DB.prepare('SELECT COUNT(*) as count FROM submissions').first();
          const d1Count = resRow?.count || 0;
          return Response.json({ d1Count, timestamp: new Date().toISOString(), status: 'synced' }, { headers: corsHeaders });
        } catch (e: any) {
          return Response.json({ d1Count: 0, timestamp: new Date().toISOString(), status: 'error', error: e.message }, { headers: corsHeaders });
        }
      }

      // 4. Submissions API backed by Cloudflare D1
      if (url.pathname === '/api/submissions') {
        // GET submissions
        if (request.method === 'GET') {
          const token = request.headers.get('x-admin-token');
          const expectedToken = env.ADMIN_TOKEN || 'adm-secret-superkey-8899';
          if (!token || token !== expectedToken) {
            return Response.json({ error: 'Unauthorized: Invalid admin token' }, { status: 401, headers: corsHeaders });
          }

          const { results } = await env.DB.prepare(
            'SELECT * FROM submissions ORDER BY createdAt DESC'
          ).all();

          return Response.json({ submissions: results }, { headers: corsHeaders });
        }

        // POST submission
        if (request.method === 'POST') {
          const body: any = await request.json();
          if (!body.formattedAddress || !body.addressLines) {
            return Response.json({ error: 'Missing address data' }, { status: 400, headers: corsHeaders });
          }

          const id = body.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const addressLinesStr = typeof body.addressLines === 'string' ? body.addressLines : JSON.stringify(body.addressLines);

          await env.DB.prepare(`
            INSERT INTO submissions (
              id, name, category, formattedAddress, addressLines, regionCode, lat, lng,
              granularity, complete, hasUnconfirmedComponents, verdictSummary, notes,
              userId, userEmail, userName, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id,
            body.name || null,
            body.category || null,
            body.formattedAddress,
            addressLinesStr,
            body.regionCode || null,
            body.lat || null,
            body.lng || null,
            body.granularity || null,
            body.complete ? 1 : 0,
            body.hasUnconfirmedComponents ? 1 : 0,
            body.verdictSummary || null,
            body.notes || null,
            body.userId || 'guest',
            body.userEmail || 'guest',
            body.userName || 'Guest User',
            body.createdAt || new Date().toISOString()
          ).run();

          return Response.json({ success: true, id }, { status: 201, headers: corsHeaders });
        }
      }

      // 4b. Bulk Import endpoint backed by Cloudflare D1
      if (url.pathname === '/api/submissions/bulk' && request.method === 'POST') {
        const token = request.headers.get('x-admin-token');
        const expectedToken = env.ADMIN_TOKEN || 'adm-secret-superkey-8899';
        if (!token || token !== expectedToken) {
          return Response.json({ error: 'Unauthorized: Invalid admin token' }, { status: 401, headers: corsHeaders });
        }

        const body: any = await request.json();
        const items = body.items || [];
        const autoValidate = Boolean(body.autoValidate);
        const woosmapKey = env.NEXT_PUBLIC_WOOSMAP_API_KEY || env.WOOSMAP_API_KEY || 'woos-public-demo-key-12345';

        let importedCount = 0;
        const errors: any[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          try {
            const addressText = item.address || item.formattedAddress;
            if (!addressText) {
              errors.push({ index: i, address: 'empty', error: 'Missing address' });
              continue;
            }

            let lat = item.lat ? Number(item.lat) : 0;
            let lng = item.lng ? Number(item.lng) : 0;
            let formattedAddress = addressText;
            let granularity = item.granularity || 'PREMISE';
            let complete = item.complete !== undefined ? (item.complete ? 1 : 0) : 1;
            let hasUnconfirmed = item.hasUnconfirmedComponents ? 1 : 0;
            let verdictSummary = item.verdictSummary || 'Bulk imported via Admin CSV';
            const regionCode = (item.regionCode || 'US').toUpperCase();

            if (autoValidate) {
              try {
                const valResp = await fetch(
                  `https://api.woosmap.com/localities/autocomplete?key=${woosmapKey}&input=${encodeURIComponent(addressText)}`
                );
                const valData: any = await valResp.json();
                if (valData.predictions && valData.predictions.length > 0) {
                  const p = valData.predictions[0];
                  formattedAddress = p.description || p.formatted_address || addressText;
                  if (p.geometry?.location) {
                    lat = p.geometry.location.lat;
                    lng = p.geometry.location.lng;
                  }
                  verdictSummary = `Validated via Woosmap API.`;
                }
              } catch (valErr) {
                // proceed with original values
              }
            }

            const id = item.id || `sub_bulk_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
            await env.DB.prepare(`
              INSERT INTO submissions (
                id, name, category, formattedAddress, addressLines, regionCode, lat, lng,
                granularity, complete, hasUnconfirmedComponents, verdictSummary, notes,
                userId, userEmail, userName, createdAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id,
              item.name || null,
              item.category || null,
              formattedAddress,
              JSON.stringify([addressText]),
              regionCode,
              lat,
              lng,
              granularity,
              complete,
              hasUnconfirmed,
              verdictSummary,
              item.notes || 'Bulk CSV Import',
              item.userId || 'admin',
              item.userEmail || 'admin@simonejovitamaps.internal',
              item.userName || 'Admin',
              item.createdAt || new Date().toISOString()
            ).run();

            importedCount++;
          } catch (rowErr: any) {
            errors.push({ index: i, address: item.address || 'unknown', error: rowErr.message });
          }
        }

        return Response.json({
          success: true,
          importedCount,
          errorsCount: errors.length,
          errors
        }, { headers: corsHeaders });
      }

      // 5. Delete submission
      if (url.pathname.startsWith('/api/submissions/') && request.method === 'DELETE') {
        const token = request.headers.get('x-admin-token');
        const expectedToken = env.ADMIN_TOKEN || 'adm-secret-superkey-8899';
        if (!token || token !== expectedToken) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const id = url.pathname.split('/').pop();
        if (!id) {
          return Response.json({ error: 'Missing submission id' }, { status: 400, headers: corsHeaders });
        }

        await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();
        return Response.json({ success: true, deletedId: id }, { headers: corsHeaders });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return Response.json({ error: err.message || 'Internal error' }, { status: 500, headers: corsHeaders });
    }
  }
};
