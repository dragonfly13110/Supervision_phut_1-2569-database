import detailedBudgetProjectsRound1 from '../data/detailedBudgetProjects.json';
import detailedBudgetProjectsRound2 from '../data/detailedBudgetProjects.round2.json';
import budgetDataRound1 from '../data/budgetData.json';
import budgetDataRound2 from '../data/budgetData.round2.json';
import generalAssetsRound1 from '../data/generalAssets.json';
import generalAssetsRound2 from '../data/generalAssets.round2.json';
import projectAssetsRound1 from '../data/projectAssets.json';
import projectAssetsRound2 from '../data/projectAssets.round2.json';
import otherIssuesRound1 from '../data/otherIssues.json';
import otherIssuesRound2 from '../data/otherIssues.round2.json';
import { saveToDiskAndSync } from './sync';

const getActiveRound = (): string => {
    const saved = localStorage.getItem('selected_round');
    if (!saved) return '2'; // Default to round2 to match RoundContext
    return saved === 'round1' ? '1' : '2';
}

const getStaticData = (sheetName: string, round: string): any => {
    const isRound2 = round === '2';
    switch (sheetName) {
        case 'detailedBudgetProjects':
            return isRound2 ? detailedBudgetProjectsRound2 : detailedBudgetProjectsRound1;
        case 'budgetData':
            const data = isRound2 ? budgetDataRound2 : budgetDataRound1;
            return Array.isArray(data) ? data : [data];
        case 'generalAssets':
            return isRound2 ? generalAssetsRound2 : generalAssetsRound1;
        case 'projectAssets':
            return isRound2 ? projectAssetsRound2 : projectAssetsRound1;
        case 'otherIssues':
            return isRound2 ? otherIssuesRound2 : otherIssuesRound1;
        default:
            return [];
    }
}

const getFilename = (sheetName: string, round: string): string => {
    const suffix = round === '2' ? '.round2.json' : '.json';
    return `${sheetName}${suffix}`;
}

/**
 * Fetch data from static JSON or localStorage
 */
export async function fetchSheetData<T>(sheetName: string): Promise<T[]> {
    try {
        const round = getActiveRound();
        const storageKey = `v3_${sheetName}_round_${round}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            return JSON.parse(saved) as T[];
        }
        
        // Fallback to static JSON file
        const staticData = getStaticData(sheetName, round);
        // Save to localStorage as the initial version
        localStorage.setItem(storageKey, JSON.stringify(staticData));
        return staticData as T[];
    } catch (error) {
        console.error(`[SheetsAPI] Error loading static data for ${sheetName}:`, error);
        throw error;
    }
}

/**
 * Update data in localStorage and save to disk
 */
export async function updateSheetData<T>(sheetName: string, data: T[]): Promise<void> {
    try {
        const round = getActiveRound();
        const storageKey = `v3_${sheetName}_round_${round}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        // In local development, write to disk when the Vite API is available.
        // localStorage remains the source of truth if the optional disk sync is unavailable.
        const filename = getFilename(sheetName, round);
        try {
            await saveToDiskAndSync(filename, data);
        } catch (syncError) {
            console.warn('[SheetsAPI] Disk sync unavailable; kept changes in localStorage.', syncError);
        }
    } catch (error) {
        console.error(`[SheetsAPI] Error updating data for ${sheetName}:`, error);
        throw error;
    }
}

