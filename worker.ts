type Env = { ASSETS: { fetch(request: Request): Promise<Response> }; GITHUB_TOKEN?: string };

const json = (body: object, status = 200) => Response.json(body, { status });
const clean = (value: string) => value.replace(/[\r\n\x00-\x1f\\/:*?"<>|]/g, '_').trim();

export default {
    async fetch(request: Request, env: Env) {
        const url = new URL(request.url);
        if (url.pathname !== '/api/upload-image') {
            const asset = await env.ASSETS.fetch(request);
            if (asset.status !== 404 || !url.pathname.startsWith('/project-images/')) return asset;
            return fetch(`https://raw.githubusercontent.com/dragonfly13110/Supervision_phut_1-2569-database/main/public${url.pathname}`);
        }
        if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

        const { projectName, filename, fileData } = await request.json().catch(() => ({})) as Record<string, string>;
        if (!projectName || !filename || !fileData || !/\.(png|jpe?g)$/i.test(filename)) {
            return json({ error: 'รองรับเฉพาะไฟล์ PNG, JPG และ JPEG' }, 400);
        }
        if (!env.GITHUB_TOKEN) return json({ error: 'ยังไม่ได้ตั้งค่า GITHUB_TOKEN บน Cloudflare' }, 500);

        const folder = clean(projectName);
        const safeFilename = clean(filename);
        const path = `public/project-images/${folder}/${safeFilename}`;
        const apiUrl = `https://api.github.com/repos/dragonfly13110/Supervision_phut_1-2569-database/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
        const headers = {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${env.GITHUB_TOKEN}`,
            'user-agent': 'supervision-phut-1-2569',
            'x-github-api-version': '2022-11-28',
        };
        const existingResponse = await fetch(apiUrl, { headers });
        const existing = existingResponse.ok ? await existingResponse.json() as { sha: string } : null;
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'content-type': 'application/json',
            },
            body: JSON.stringify({ message: `feat: add project image ${safeFilename}`, content: fileData, branch: 'main', ...(existing && { sha: existing.sha }) }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({})) as { message?: string };
            return json({ error: error.message || 'อัปโหลดรูปภาพไป GitHub ไม่สำเร็จ' }, response.status);
        }
        return json({ success: true, url: `/project-images/${encodeURIComponent(folder)}/${encodeURIComponent(safeFilename)}` }, 201);
    },
};
