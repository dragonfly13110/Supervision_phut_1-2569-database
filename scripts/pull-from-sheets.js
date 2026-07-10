/**
 * Google Sheets Pull Script
 * ดึงข้อมูลจาก Google Sheets ลงมาบันทึกเป็นไฟล์ JSON ในโฟลเดอร์ src/data/
 * 
 * วิธีใช้: node scripts/pull-from-sheets.js
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables manually from .env.local or .env
const loadEnv = () => {
    for (const envFile of ['.env.local', '.env']) {
        const envPath = path.join(__dirname, '..', envFile);
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

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const SHEET_CONFIGS = {
    budgetData: {
        name: 'งบประมาณ (Budget)',
        file: 'budgetData.json',
    },
    detailedBudgetProjects: {
        name: 'โครงการ/กิจกรรม (Projects)',
        file: 'detailedBudgetProjects.json',
    },
    generalAssets: {
        name: 'ทรัพย์สินทั่วไป (General Assets)',
        file: 'generalAssets.json',
    },
    projectAssets: {
        name: 'ทรัพย์สินโครงการ (Project Assets)',
        file: 'projectAssets.json',
    },
    otherIssues: {
        name: 'ประเด็นอื่นๆ (Other Issues)',
        file: 'otherIssues.json',
    }
};

function translateStatusReverse(status) {
    const statusMap = {
        'เสร็จสิ้น': 'completed',
        'กำลังดำเนินการ': 'in_progress',
        'กำหนดวันแล้ว': 'scheduled',
        'รอดำเนินการ': 'pending',
    };
    return statusMap[status] || 'pending';
}

function rowsToObjects(sheetName, rows) {
    if (!rows || rows.length === 0) return [];

    const dataRows = rows.slice(1); // skip headers

    if (sheetName === 'otherIssues') {
        return dataRows.map(row => ({
            id: row[0] || '',
            title: row[1] || '',
            content: row[2] || '',
        }));
    }

    if (sheetName === 'generalAssets') {
        return dataRows.map(row => {
            let images = [];
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
            let images = [];
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
        const groupedData = {};

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

            let images = [];
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
        const result = {
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
                    result.operation[category] = { budget, disbursed };
                }
            } else if (type === 'งบโครงการ') {
                const projectKey = category || `project_${Object.keys(result.project).length + 1}`;
                result.project[projectKey] = { name: category, budget, disbursed };
            }
        }

        return result; // return single object
    }

    return dataRows;
}

async function pullFromSheets() {
    console.log('📥 เริ่มดึงข้อมูลจาก Google Sheets เข้าสู่โปรเจกต์ (Offline/Hardcoded)...\n');

    if (!SPREADSHEET_ID) {
        console.error('❌ ไม่พบ GOOGLE_SPREADSHEET_ID ใน Environment Variables');
        process.exit(1);
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (!privateKey || !clientEmail) {
        console.error('❌ ไม่พบ GOOGLE_PRIVATE_KEY หรือ GOOGLE_SERVICE_ACCOUNT_EMAIL ใน Environment Variables');
        process.exit(1);
    }

    // Authenticate
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Define rounds (Only pull Round 1 from Google Sheets, Round 2 is hardcoded from MS Word)
    const ROUNDS = [
        { fileSuffix: '', sheetSuffix: '' }
    ];

    // Create src/data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Process each configuration for each round
    for (const round of ROUNDS) {
        for (const [key, config] of Object.entries(SHEET_CONFIGS)) {
            const fileName = config.file.replace('.json', `${round.fileSuffix}.json`);
            const sheetName = `${config.name}${round.sheetSuffix}`;
            console.log(`📥 กำลังดึง: ${sheetName} -> ${fileName}`);

            try {
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `'${sheetName}'!A:Z`,
                });

                const rows = response.data.values || [];
                if (rows.length === 0) {
                    console.log(`   ⚠️ ไม่มีข้อมูลใน Sheet หรือ Sheet ไม่มีอยู่จริง`);
                    continue;
                }

                const structuredData = rowsToObjects(key, rows);
                
                const filePath = path.join(DATA_DIR, fileName);
                fs.writeFileSync(filePath, JSON.stringify(structuredData, null, 4), 'utf8');
                console.log(`   ✅ บันทึกเสร็จเรียบร้อย: ${fileName} (${rows.length - 1} รายการ)`);
            } catch (error) {
                console.error(`   ❌ เกิดข้อผิดพลาดในการประมวลผล ${sheetName}:`, error.message);
            }
        }
    }

    console.log('\n✨ ดึงข้อมูลเสร็จสิ้น! ทุกข้อมูลถูกบันทึกเป็น JSON ใน src/data/ เรียบร้อยแล้ว');
}

pullFromSheets().catch(console.error);
