import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
// @ts-ignore
import { exec } from 'node:child_process';

import sheetsHandler from './api/sheets';

// Load env variables manually from .env.local or .env
const loadEnv = () => {
    for (const envFile of ['.env.local', '.env']) {
        const envPath = path.join(__dirname, envFile);
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split(/\r?\n/).forEach(line => {
                const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] || '';
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.substring(1, value.length - 1);
                    }
                    if (value.startsWith("'") && value.endsWith("'")) {
                        value = value.substring(1, value.length - 1);
                    }
                    process.env[key] = value;
                }
            });
            break;
        }
    }
};
loadEnv();

// Middleware plugin to handle API requests locally
const apiMiddleware = () => ({
    name: 'api-middleware',
    configureServer(server) {
        // 1. Mock Vercel serverless function for Google Sheets API
        server.middlewares.use('/api/sheets', async (req: any, res: any, next) => {
            try {
                // Mock Vercel query parsing
                const urlObj = new URL(req.url, `http://${req.headers.host}`);
                const query = Object.fromEntries(urlObj.searchParams.entries());
                req.query = query;

                // Mock Vercel response helpers
                res.status = (code: number) => {
                    res.statusCode = code;
                    return res;
                };
                res.json = (data: any) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return res;
                };

                // Parse body for POST requests
                if (req.method === 'POST') {
                    let body = '';
                    req.on('data', (chunk: any) => { body += chunk.toString(); });
                    req.on('end', async () => {
                        try {
                            req.body = JSON.parse(body);
                            await sheetsHandler(req, res);
                        } catch (err: any) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: err.message }));
                        }
                    });
                } else {
                    await sheetsHandler(req, res);
                }
            } catch (error: any) {
                console.error('[API Sheets Middleware Error]', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
            }
        });

        // 2. Intercept save data POST
        server.middlewares.use('/api/save-data', async (req, res, next) => {
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', () => {
                    try {
                        const { filename, content } = JSON.parse(body);
                        if (!filename || !content) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: 'Missing filename or content' }));
                            return;
                        }

                        const filePath = path.join(__dirname, 'src', 'data', filename);

                        // Write file
                        fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
                        console.log(`[Middleware] Saved ${filename}`);

                        // Trigger Sync Script
                        console.log('[Middleware] Triggering sync...');
                        exec('npm run sync', (error, stdout, stderr) => {
                            if (error) {
                                console.error(`[Sync Error] ${error.message}`);
                                return;
                            }
                            if (stderr) console.error(`[Sync Stderr] ${stderr}`);
                            console.log(`[Sync Output] ${stdout}`);
                        });

                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true, message: 'File saved and sync triggered' }));
                    } catch (error) {
                        console.error('[Middleware Error]', error);
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    }
                });
            } else {
                next();
            }
        });
    },
});

export default defineConfig({
    plugins: [react(), apiMiddleware()],
})
