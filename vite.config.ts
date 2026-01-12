import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
// @ts-ignore
import { exec } from 'node:child_process';

// Middleware plugin to handle saving data locally
const saveJsonMiddleware = () => ({
    name: 'save-json-middleware',
    configureServer(server) {
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
    plugins: [react(), saveJsonMiddleware()],
})
