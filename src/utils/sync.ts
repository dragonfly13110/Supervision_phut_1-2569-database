/**
 * Utility to save data to local disk (via Vite server) and trigger sync
 */

export const saveToDiskAndSync = async (filename: string, data: any) => {
    try {
        console.log(`[Sync] Saving ${filename} to disk...`);

        // 1. Send data to Vite server to write file
        const response = await fetch('/api/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename,
                content: data
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to save data: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('[Sync] Save result:', result);

        return result;
    } catch (error) {
        console.error('[Sync] Error saving data:', error);
        throw error;
    }
};
