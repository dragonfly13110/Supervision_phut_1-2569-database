import assert from 'node:assert/strict';
import test from 'node:test';
import worker from './worker.ts';

test('upload endpoint always returns JSON', async () => {
    const response = await worker.fetch(new Request('https://example.com/api/upload-image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
    }), { ASSETS: { fetch: () => { throw new Error('assets should not handle uploads'); } } });

    assert.equal(response.status, 400);
    assert.match(response.headers.get('content-type') || '', /application\/json/);
    assert.ok((await response.json()).error);
});

test('includes the existing sha when replacing an image', async () => {
    const originalFetch = globalThis.fetch;
    const requests: RequestInit[] = [];
    globalThis.fetch = async (_input, init = {}) => {
        requests.push(init);
        if (!init.method) return Response.json({ sha: 'existing-sha' });
        return Response.json({}, { status: 200 });
    };
    try {
        const response = await worker.fetch(new Request('https://example.com/api/upload-image', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ projectName: 'project', filename: 'photo.jpg', fileData: 'Zg==' }),
        }), { ASSETS: { fetch: () => { throw new Error('unused'); } }, GITHUB_TOKEN: 'token' });

        assert.equal(response.status, 201);
        assert.equal(JSON.parse(requests[1].body as string).sha, 'existing-sha');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('loads a missing project image from GitHub', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async input => new Response(String(input), { status: 200, headers: { 'content-type': 'image/jpeg' } });
    try {
        const response = await worker.fetch(
            new Request('https://example.com/project-images/project/photo.jpg'),
            { ASSETS: { fetch: async () => { throw new Error('project images must bypass assets'); } } },
        );

        assert.equal(response.status, 200);
        assert.equal(await response.text(), 'https://raw.githubusercontent.com/dragonfly13110/Supervision_phut_1-2569-database/main/public/project-images/project/photo.jpg');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('saves an allowed data file to GitHub', async () => {
    const originalFetch = globalThis.fetch;
    const requests: { input: string; init: RequestInit }[] = [];
    globalThis.fetch = async (input, init = {}) => {
        requests.push({ input: String(input), init });
        return init.method === 'PUT' ? Response.json({}) : Response.json({ sha: 'existing-sha' });
    };
    try {
        const response = await worker.fetch(new Request('https://example.com/api/save-data', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ filename: 'budgetData.round2.json', content: [{ total: 1 }] }),
        }), { ASSETS: { fetch: () => { throw new Error('assets should not handle saves'); } }, GITHUB_TOKEN: 'token' });

        assert.equal(response.status, 200);
        assert.match(requests[1].input, /contents\/src\/data\/budgetData.round2.json/);
        assert.equal(JSON.parse(requests[1].init.body as string).sha, 'existing-sha');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('rejects a data file outside the allowlist', async () => {
    const response = await worker.fetch(new Request('https://example.com/api/save-data', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: '../secret.json', content: [] }),
    }), { ASSETS: { fetch: () => { throw new Error('assets should not handle saves'); } }, GITHUB_TOKEN: 'token' });

    assert.equal(response.status, 400);
});
