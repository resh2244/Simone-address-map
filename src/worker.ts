/**
 * Cloudflare Worker API & edge router for Simone & Jovita Maps.
 * Static Vite assets are served through the ASSETS binding.
 */

type D1Database = any;
type Fetcher = { fetch: (request: Request | string, init?: any) => Promise<Response> };

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
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
      if (url.pathname === '/api/health') {
        return Response.json(
          { status: 'ok', runtime: 'cloudflare-worker' },
          { headers: corsHeaders },
        );
      }

      const woosmapKey =
        env.NEXT_PUBLIC_WOOSMAP_API_KEY ||
        env.WOOSMAP_API_KEY ||
        '';

      if (url.pathname === '/api/config') {
        return Response.json(
          {
            woosmapApiKey: woosmapKey,
            environment: 'production-edge',
          },
          { headers: corsHeaders },
        );
      }

      if (url.pathname === '/api/validate' && request.method === 'POST') {
        const body: any = await request.json();
        const addressLines = Array.isArray(body.addressLines) ? body.addressLines : [];
        const query = addressLines.join(', ');

        if (!query.trim()) {
          return Response.json(
            { error: 'addressLines is required' },
            { status: 400, headers: corsHeaders },
          );
        }

        if (!woosmapKey) {
          return Response.json(
            { error: 'Woosmap API key is not configured' },
            { status: 503, headers: corsHeaders },
          );
        }

        const wRes = await fetch(
          `https://api.woosmap.com/localities/autocomplete?key=${encodeURIComponent(woosmapKey)}&input=${encodeURIComponent(query)}`,
        );
        const wData: any = await wRes.json();

        if (!wRes.ok) {
          return Response.json(
            { error: wData?.error_message || 'Woosmap request failed' },
            { status: wRes.status, headers: corsHeaders },
          );
        }

        const prediction = wData?.predictions?.[0];
        const formattedAddress = prediction?.description || query;
        const lat = prediction?.geometry?.location?.lat ?? 0;
        const lng = prediction?.geometry?.location?.lng ?? 0;

        return Response.json(
          {
            result: {
              verdict: {
                validationGranularity: prediction ? 'PREMISE' : 'OTHER',
                addressComplete: Boolean(prediction),
              },
              address: {
                formattedAddress,
                addressComponents: [
                  {
                    componentType: 'country',
                    componentName: { text: body.regionCode || 'US' },
                  },
                ],
              },
              geocode: {
                location: { latitude: lat, longitude: lng },
              },
            },
          },
          { headers: corsHeaders },
        );
      }

      if (url.pathname === '/api/external-user' && request.method === 'GET') {
        const apiKey = request.headers.get('x-api-key') || url.searchParams.get('api_key') || '';
        const headers: Record<string, string> = {
          'Accept': 'application/json',
        };
        if (apiKey) {
          headers['x-api-key'] = apiKey;
        }
        try {
          const extRes = await fetch('https://api.apiverve.com/v1/mockserver/8570b3b99506aa1b/API/user', {
            headers,
          });
          const extData: any = await extRes.json();
          return Response.json(extData, { status: extRes.status, headers: corsHeaders });
        } catch (e: any) {
          return Response.json({ error: e.message || 'Failed to fetch external user' }, { status: 500, headers: corsHeaders });
        }
      }

      if (url.pathname === '/api/sync-status' && request.method === 'GET') {
        try {
          const resRow: any = await env.DB
            .prepare('SELECT COUNT(*) as count FROM submissions')
            .first();
          const d1Count = Number(resRow?.count || 0);
          return Response.json(
            {
              d1Count,
              timestamp: new Date().toISOString(),
              status: 'synced',
            },
            { headers: corsHeaders },
          );
        } catch (e: any) {
          return Response.json(
            {
              d1Count: 0,
              timestamp: new Date().toISOString(),
              status: 'error',
              error: e.message,
            },
            { status: 500, headers: corsHeaders },
          );
        }
      }

      if (url.pathname === '/api/submissions') {
        if (request.method === 'GET') {
          const token = request.headers.get('x-admin-token');
          if (!env.ADMIN_TOKEN || !token || token !== env.ADMIN_TOKEN) {
            return Response.json(
              { error: 'Unauthorized' },
              { status: 401, headers: corsHeaders },
            );
          }

          const { results } = await env.DB
            .prepare('SELECT * FROM submissions ORDER BY createdAt DESC')
            .all();

          return Response.json(
            { submissions: results, total: results.length },
            { headers: corsHeaders },
          );
        }

        if (request.method === 'POST') {
          const body: any = await request.json();
          if (!body.formattedAddress || !body.addressLines) {
            return Response.json(
              { error: 'Missing address data' },
              { status: 400, headers: corsHeaders },
            );
          }

          const id =
            body.id ||
            `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const addressLinesStr =
            typeof body.addressLines === 'string'
              ? body.addressLines
              : JSON.stringify(body.addressLines);

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
            body.lat ?? null,
            body.lng ?? null,
            body.granularity || null,
            body.complete ? 1 : 0,
            body.hasUnconfirmedComponents ? 1 : 0,
            body.verdictSummary || null,
            body.notes || null,
            body.userId || 'guest',
            body.userEmail || 'guest',
            body.userName || 'Guest User',
            body.createdAt || new Date().toISOString(),
          ).run();

          return Response.json(
            { success: true, id },
            { status: 201, headers: corsHeaders },
          );
        }
      }

      if (url.pathname === '/api/submissions/bulk' && request.method === 'POST') {
        const token = request.headers.get('x-admin-token');
        if (!env.ADMIN_TOKEN || !token || token !== env.ADMIN_TOKEN) {
          return Response.json(
            { error: 'Unauthorized' },
            { status: 401, headers: corsHeaders },
          );
        }

        const body: any = await request.json();
        const items = Array.isArray(body.items) ? body.items : [];
        const autoValidate = Boolean(body.autoValidate);

        if (items.length === 0) {
          return Response.json(
            { error: 'items must be a non-empty array' },
            { status: 400, headers: corsHeaders },
          );
        }

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
            let complete =
              item.complete !== undefined ? (item.complete ? 1 : 0) : 1;
            let hasUnconfirmed = item.hasUnconfirmedComponents ? 1 : 0;
            let verdictSummary =
              item.verdictSummary || 'Bulk imported via Admin CSV';
            const regionCode = (item.regionCode || 'US').toUpperCase();

            if (autoValidate && woosmapKey) {
              try {
                const valResp = await fetch(
                  `https://api.woosmap.com/localities/autocomplete?key=${encodeURIComponent(woosmapKey)}&input=${encodeURIComponent(addressText)}`,
                );
                const valData: any = await valResp.json();

                if (valData.predictions?.length) {
                  const p = valData.predictions[0];
                  formattedAddress =
                    p.description || p.formatted_address || addressText;
                  if (p.geometry?.location) {
                    lat = p.geometry.location.lat;
                    lng = p.geometry.location.lng;
                  }
                  verdictSummary = 'Validated via Woosmap API.';
                }
              } catch {
                // Keep the imported values when external validation fails.
              }
            }

            const id =
              item.id ||
              `sub_bulk_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;

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
              item.userEmail || 'admin',
              item.userName || 'Admin',
              item.createdAt || new Date().toISOString(),
            ).run();

            importedCount++;
          } catch (rowErr: any) {
            errors.push({
              index: i,
              address: item.address || 'unknown',
              error: rowErr.message,
            });
          }
        }

        return Response.json(
          {
            success: true,
            importedCount,
            errorsCount: errors.length,
            errors,
          },
          { headers: corsHeaders },
        );
      }

      if (url.pathname.startsWith('/api/submissions/') && request.method === 'DELETE') {
        const token = request.headers.get('x-admin-token');
        if (!env.ADMIN_TOKEN || !token || token !== env.ADMIN_TOKEN) {
          return Response.json(
            { error: 'Unauthorized' },
            { status: 401, headers: corsHeaders },
          );
        }

        const id = url.pathname.split('/').pop();
        if (!id) {
          return Response.json(
            { error: 'Missing submission id' },
            { status: 400, headers: corsHeaders },
          );
        }

        await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();

        return Response.json(
          { success: true, deletedId: id },
          { headers: corsHeaders },
        );
      }

      // Let Cloudflare Static Assets serve index.html, JS, CSS, images, etc.
      return env.ASSETS.fetch(request);
    } catch (err: any) {
      return Response.json(
        { error: err.message || 'Internal error' },
        { status: 500, headers: corsHeaders },
      );
    }
  },
};
