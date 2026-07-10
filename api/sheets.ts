import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1dT94hJ4ec4AKUJMB5-5DupSysW6qchrjZfUJIPT2tgY';

// Sheet name to column headers mapping
const SHEET_CONFIGS: Record<string, { headers: string[], dataKey?: string }> = {
    'otherIssues': {
        headers: ['ID', 'หัวข้อ', 'เนื้อหา'],
    },
    'generalAssets': {
        headers: ['ID', 'ชื่อ', 'จำนวน', 'รายละเอียด', 'สถานะ', 'สถานะ (ข้อความ)', 'ปัญหา', 'แนวทางแก้ไข', 'รูปภาพ'],
    },
    'projectAssets': {
        headers: ['ID', 'ลำดับ', 'ชื่อ', 'จำนวน', 'สถานะ', 'สถานะ (ข้อความ)', 'ปัญหา', 'แนวทางแก้ไข', 'รูปภาพ'],
    },
    'detailedBudgetProjects': {
        headers: ['รหัส', 'ชื่อโครงการ', 'กิจกรรม', 'กิจกรรมย่อย', 'นโยบายที่เกี่ยวข้อง', 'เป้าหมาย', 'งบประมาณ', 'ผลการดำเนินงาน', 'ปัญหา', 'แนวทางแก้ไข', 'สถานะ', 'รูปภาพ'],
    },
    'budgetData': {
        headers: ['ประเภท', 'หมวดหมู่', 'งบประมาณ', 'เบิกจ่าย'],
    },
};

// Thai sheet names
const SHEET_NAME_MAP: Record<string, string> = {
    'otherIssues': 'ประเด็นอื่นๆ (Other Issues)',
    'generalAssets': 'ทรัพย์สินทั่วไป (General Assets)',
    'projectAssets': 'ทรัพย์สินโครงการ (Project Assets)',
    'detailedBudgetProjects': 'โครงการ/กิจกรรม (Projects)',
    'budgetData': 'งบประมาณ (Budget)',
};

async function getAuthClient() {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (!privateKey || !clientEmail) {
        throw new Error('Missing Google credentials in environment variables');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth;
}

// Transform flat row data to structured objects
function rowsToObjects(sheetName: string, rows: any[][]): any[] {
    if (!rows || rows.length === 0) return [];

    const _headers = rows[0];
    const dataRows = rows.slice(1);

    if (sheetName === 'otherIssues') {
        return dataRows.map(row => ({
            id: row[0] || '',
            title: row[1] || '',
            content: row[2] || '',
        }));
    }

    if (sheetName === 'generalAssets') {
        return dataRows.map(row => {
            let images: any[] = [];
            try {
                if (row[8]) images = JSON.parse(row[8]);
            } catch (e) { images = []; }
            return {
                id: parseInt(row[0]) || 0,
                name: row[1] || '',
                amount: row[2] || '',
                details: row[3] || '',
                status: row[4] || 'good',
                statusText: row[5] || '',
                problem: row[6] || '-',
                solution: row[7] || '-',
                images: images,
            };
        });
    }

    if (sheetName === 'projectAssets') {
        return dataRows.map(row => {
            let images: any[] = [];
            try {
                if (row[8]) images = JSON.parse(row[8]);
            } catch (e) { images = []; }
            return {
                id: parseInt(row[0]) || 0,
                formOrder: parseInt(row[1]) || 0,
                name: row[2] || '',
                amount: row[3] || '',
                status: row[4] || 'good',
                statusText: row[5] || '',
                problem: row[6] || '-',
                solution: row[7] || '-',
                images: images,
            };
        });
    }

    if (sheetName === 'detailedBudgetProjects') {
        // This one is more complex - grouped by project
        const groupedData: Record<string, any> = {};

        for (const row of dataRows) {
            const groupId = row[0] || '';
            const groupTitle = row[1] || '';

            if (!groupedData[groupId]) {
                groupedData[groupId] = {
                    id: groupId,
                    title: groupTitle,
                    projects: [],
                };
            }

            // Parse images from JSON string
            let images: any[] = [];
            try {
                if (row[11]) {
                    images = JSON.parse(row[11]);
                }
            } catch (e) {
                images = [];
            }

            groupedData[groupId].projects.push({
                name: row[2] || '',
                subActivity: row[3] || '',
                relevantPolicies: row[4] || '',
                target: row[5] || '',
                budget: row[6] || '',
                result: row[7] || '',
                problem: row[8] || '',
                solution: row[9] || '',
                status: translateStatusReverse(row[10]) || 'pending',
                images: images,
            });
        }

        return Object.values(groupedData);
    }

    if (sheetName === 'budgetData') {
        // Transform rows to the budgetData structure expected by SectionBudget
        const result: any = {
            investment: { construction: { budget: '0', disbursed: '0' } },
            operation: {},
            project: {},
        };

        for (const row of dataRows) {
            const type = row[0] || '';
            const category = row[1] || '';
            const budget = row[2] || '0';
            const disbursed = row[3] || '0';

            if (type === 'งบลงทุน' && category === 'construction') {
                result.investment.construction = { budget, disbursed };
            } else if (type === 'งบดำเนินงาน') {
                if (category === 'ค่าสาธารณูปโภค') {
                    result.operation.utilities = { budget, disbursed };
                } else if (category === 'ค่าวัสดุ') {
                    result.operation.officeSupplies = { budget, disbursed };
                } else if (category === 'ค่าเช่าบ้าน') {
                    result.operation.houseRent = { budget, disbursed };
                } else if (category === 'ค่าใช้สอย' || category === 'ค่าจ้างเหมาบริการ') {
                    result.operation.service = { budget, disbursed };
                } else if (category === 'ค่าเดินทาง' || category === 'เบี้ยเลี้ยง') {
                    result.operation.travel = { budget, disbursed };
                } else {
                    // Dynamic fallback
                    result.operation[category] = { budget, disbursed };
                }
            } else if (type === 'งบโครงการ') {
                const projectKey = category || `project_${Object.keys(result.project).length + 1}`;
                result.project[projectKey] = { name: category, budget, disbursed };
            }
        }

        return [result]; // Return as array with single object
    }


    return dataRows;
}

// Transform objects back to flat rows for writing
function objectsToRows(sheetName: string, data: any[]): any[][] {
    if (sheetName === 'otherIssues') {
        return data.map(item => [
            item.id || '',
            item.title || '',
            item.content || '',
        ]);
    }

    if (sheetName === 'generalAssets') {
        return data.map(item => {
            const imagesJson = item.images && item.images.length > 0
                ? JSON.stringify(item.images)
                : '';
            return [
                item.id || '',
                item.name || '',
                item.amount || '',
                item.details || '',
                item.status || 'good',
                item.statusText || '',
                item.problem || '-',
                item.solution || '-',
                imagesJson,
            ];
        });
    }

    if (sheetName === 'projectAssets') {
        return data.map(item => {
            const imagesJson = item.images && item.images.length > 0
                ? JSON.stringify(item.images)
                : '';
            return [
                item.id || '',
                item.formOrder || '',
                item.name || '',
                item.amount || '',
                item.status || 'good',
                item.statusText || '',
                item.problem || '-',
                item.solution || '-',
                imagesJson,
            ];
        });
    }

    if (sheetName === 'detailedBudgetProjects') {
        const rows: any[][] = [];
        for (const group of data) {
            for (const project of group.projects || []) {
                // Serialize images to JSON string
                const imagesJson = project.images && project.images.length > 0
                    ? JSON.stringify(project.images)
                    : '';

                rows.push([
                    group.id || '',
                    group.title || '',
                    project.name || '',
                    project.subActivity || '',
                    project.relevantPolicies || '',
                    project.target || '',
                    project.budget || '',
                    project.result || '',
                    project.problem || '',
                    project.solution || '',
                    translateStatus(project.status) || '',
                    imagesJson,
                ]);
            }
        }
        return rows;
    }

    if (sheetName === 'budgetData') {
        const rows: any[][] = [];
        const budgetData = data[0]; // Single object
        if (budgetData) {
            // Investment
            if (budgetData.investment?.construction) {
                rows.push(['งบลงทุน', 'construction', budgetData.investment.construction.budget || '0', budgetData.investment.construction.disbursed || '0']);
            }
            // Operation
            if (budgetData.operation) {
                if (budgetData.operation.utilities) {
                    rows.push(['งบดำเนินงาน', 'ค่าสาธารณูปโภค', budgetData.operation.utilities.budget || '0', budgetData.operation.utilities.disbursed || '0']);
                }
                if (budgetData.operation.officeSupplies) {
                    rows.push(['งบดำเนินงาน', 'ค่าวัสดุ', budgetData.operation.officeSupplies.budget || '0', budgetData.operation.officeSupplies.disbursed || '0']);
                }
                if (budgetData.operation.houseRent) {
                    rows.push(['งบดำเนินงาน', 'ค่าเช่าบ้าน', budgetData.operation.houseRent.budget || '0', budgetData.operation.houseRent.disbursed || '0']);
                }
                if (budgetData.operation.service) {
                    rows.push(['งบดำเนินงาน', 'ค่าจ้างเหมาบริการ', budgetData.operation.service.budget || '0', budgetData.operation.service.disbursed || '0']);
                }
                if (budgetData.operation.travel) {
                    rows.push(['งบดำเนินงาน', 'เบี้ยเลี้ยง', budgetData.operation.travel.budget || '0', budgetData.operation.travel.disbursed || '0']);
                }
                // Any other dynamic keys
                const standardKeys = ['utilities', 'officeSupplies', 'houseRent', 'service', 'travel'];
                for (const [key, val] of Object.entries(budgetData.operation)) {
                    if (!standardKeys.includes(key)) {
                        const v = val as any;
                        rows.push(['งบดำเนินงาน', key, v.budget || '0', v.disbursed || '0']);
                    }
                }
            }

            // Projects
            if (budgetData.project) {
                for (const [key, proj] of Object.entries(budgetData.project)) {
                    const p = proj as any;
                    rows.push(['งบโครงการ', p.name || key, p.budget || '0', p.disbursed || '0']);
                }
            }
        }
        return rows;
    }

    return [];
}

function translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'completed': 'เสร็จสิ้น',
        'in_progress': 'กำลังดำเนินการ',
        'scheduled': 'กำหนดวันแล้ว',
        'pending': 'รอดำเนินการ',
    };
    return statusMap[status] || status || '-';
}

function translateStatusReverse(status: string): string {
    const statusMap: Record<string, string> = {
        'เสร็จสิ้น': 'completed',
        'กำลังดำเนินการ': 'in_progress',
        'กำหนดวันแล้ว': 'scheduled',
        'รอดำเนินการ': 'pending',
    };
    return statusMap[status] || 'pending';
}

function getSheetName(sheetName: string, round?: string): string {
    const baseName = SHEET_NAME_MAP[sheetName];
    if (round === '2' || round === 'round2') {
        return `${baseName} - ครั้งที่ 2`;
    }
    return baseName;
}

async function ensureSheetExists(sheets: any, spreadsheetId: string, sheetTitle: string, headers: string[]) {
    try {
        await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${sheetTitle}'!A1:1`,
        });
    } catch (error: any) {
        // Sheet doesn't exist, create it
        if (error.status === 400 || error.message.includes('Unable to parse range')) {
            console.log(`Creating sheet: ${sheetTitle}`);
            try {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId,
                    requestBody: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: sheetTitle,
                                    }
                                }
                            }
                        ]
                    }
                });
                // Write headers
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `'${sheetTitle}'!A1`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [headers],
                    },
                });
            } catch (createError) {
                console.error(`Failed to create sheet "${sheetTitle}":`, createError);
            }
        } else {
            throw error;
        }
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        if (req.method === 'GET') {
            const sheetName = req.query.sheet as string;
            const round = req.query.round as string;

            if (!sheetName || !SHEET_NAME_MAP[sheetName]) {
                return res.status(400).json({ error: 'Invalid sheet name' });
            }

            const sheetTitle = getSheetName(sheetName, round);
            const config = SHEET_CONFIGS[sheetName];

            await ensureSheetExists(sheets, SPREADSHEET_ID, sheetTitle, config.headers);

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `'${sheetTitle}'!A:Z`,
            });

            const rows = response.data.values || [];
            const data = rowsToObjects(sheetName, rows);

            return res.status(200).json({ success: true, data });
        }

        if (req.method === 'POST') {
            const { sheet: sheetName, data, round } = req.body;

            if (!sheetName || !SHEET_NAME_MAP[sheetName]) {
                return res.status(400).json({ error: 'Invalid sheet name' });
            }

            if (!data) {
                return res.status(400).json({ error: 'No data provided' });
            }

            const config = SHEET_CONFIGS[sheetName];
            const sheetTitle = getSheetName(sheetName, round);

            await ensureSheetExists(sheets, SPREADSHEET_ID, sheetTitle, config.headers);

            // Clear existing data (except header)
            await sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: `'${sheetTitle}'!A2:Z`,
            });

            // Write new data
            const rows = objectsToRows(sheetName, data);

            if (rows.length > 0) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `'${sheetTitle}'!A2`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: rows,
                    },
                });
            }

            return res.status(200).json({ success: true, message: 'Data saved to Google Sheets' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Sheets API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

