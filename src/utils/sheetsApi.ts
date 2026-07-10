/**
 * Google Sheets API Utility
 * Frontend helper to interact with the serverless function
 */

const API_BASE = '/api/sheets';

export interface SheetResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

const getActiveRound = (): string => {
    const saved = localStorage.getItem('selected_round');
    return saved === 'round1' ? '1' : '2';
}

/**
 * Fetch data from a Google Sheet
 */
export async function fetchSheetData<T>(sheetName: string): Promise<T[]> {
    try {
        const round = getActiveRound();
        const response = await fetch(`${API_BASE}?sheet=${sheetName}&round=${round}`);
        const result: SheetResponse<T[]> = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch data');
        }

        return result.data || [];
    } catch (error) {
        console.error(`[SheetsAPI] Error fetching ${sheetName}:`, error);
        throw error;
    }
}

/**
 * Update data in a Google Sheet
 */
export async function updateSheetData<T>(sheetName: string, data: T[]): Promise<void> {
    try {
        const round = getActiveRound();
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sheet: sheetName, data, round }),
        });

        const result: SheetResponse<void> = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to save data');
        }
    } catch (error) {
        console.error(`[SheetsAPI] Error updating ${sheetName}:`, error);
        throw error;
    }
}

