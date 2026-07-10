/**
 * Google Sheets Sync Script
 * ซิงค์ข้อมูลจาก JSON files ไปยัง Google Sheets
 * 
 * วิธีใช้: npm run sync
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

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1dT94hJ4ec4AKUJMB5-5DupSysW6qchrjZfUJIPT2tgY';
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');


// Sheet names for each data type
const SHEET_CONFIGS = {
    budget: {
        name: 'งบประมาณ (Budget)',
        file: 'budgetData.json',
        headers: ['ประเภท', 'หมวดหมู่', 'งบประมาณ', 'เบิกจ่าย'],
        transform: transformBudgetData
    },
    projects: {
        name: 'โครงการ/กิจกรรม (Projects)',
        file: 'detailedBudgetProjects.json',
        headers: ['รหัส', 'ชื่อโครงการ', 'กิจกรรม', 'กิจกรรมย่อย', 'นโยบายที่เกี่ยวข้อง', 'เป้าหมาย', 'งบประมาณ', 'ผลการดำเนินงาน', 'ปัญหา', 'แนวทางแก้ไข', 'สถานะ'],
        transform: transformProjectsData
    },
    generalAssets: {
        name: 'ทรัพย์สินทั่วไป (General Assets)',
        file: 'generalAssets.json',
        headers: ['ID', 'ชื่อ', 'จำนวน', 'รายละเอียด', 'สถานะ', 'สถานะ (ข้อความ)', 'ปัญหา', 'แนวทางแก้ไข'],
        transform: transformGeneralAssetsData
    },
    projectAssets: {
        name: 'ทรัพย์สินโครงการ (Project Assets)',
        file: 'projectAssets.json',
        headers: ['ID', 'ลำดับ', 'ชื่อ', 'จำนวน', 'สถานะ', 'สถานะ (ข้อความ)', 'ปัญหา', 'แนวทางแก้ไข'],
        transform: transformProjectAssetsData
    },
    otherIssues: {
        name: 'ประเด็นอื่นๆ (Other Issues)',
        file: 'otherIssues.json',
        headers: ['ID', 'หัวข้อ', 'เนื้อหา'],
        transform: transformOtherIssuesData
    }
};

// Transform functions
function transformBudgetData(data) {
    const rows = [];
    
    // Investment
    if (data.investment) {
        for (const [key, value] of Object.entries(data.investment)) {
            rows.push(['งบลงทุน', key, value.budget || '-', value.disbursed || '-']);
        }
    }
    
    // Operation
    if (data.operation) {
        for (const [key, value] of Object.entries(data.operation)) {
            const categoryMap = {
                utilities: 'ค่าสาธารณูปโภค',
                officeSupplies: 'ค่าวัสดุ',
                houseRent: 'ค่าเช่าบ้าน',
                service: 'ค่าจ้างเหมาบริการ',
                travel: 'เบี้ยเลี้ยง'
            };
            rows.push(['งบดำเนินงาน', categoryMap[key] || key, value.budget || '-', value.disbursed || '-']);
        }
    }
    
    // Project
    if (data.project) {
        for (const [key, value] of Object.entries(data.project)) {
            rows.push(['งบโครงการ', value.name || key, value.budget || '-', value.disbursed || '-']);
        }
    }
    
    return rows;
}

function transformProjectsData(data) {
    const rows = [];
    
    for (const group of data) {
        for (const project of group.projects || []) {
            rows.push([
                group.id || '-',
                group.title || '-',
                project.name || '-',
                project.subActivity || '-',
                project.relevantPolicies || '-',
                project.target || '-',
                project.budget || '-',
                project.result || '-',
                project.problem || '-',
                project.solution || '-',
                translateStatus(project.status) || '-'
            ]);
        }
    }
    
    return rows;
}

function transformGeneralAssetsData(data) {
    return data.map(item => [
        item.id || '-',
        item.name || '-',
        item.amount || '-',
        item.details || '-',
        item.status || '-',
        item.statusText || '-',
        item.problem || '-',
        item.solution || '-'
    ]);
}

function transformProjectAssetsData(data) {
    return data.map(item => [
        item.id || '-',
        item.formOrder || '-',
        item.name || '-',
        item.amount || '-',
        item.status || '-',
        item.statusText || '-',
        item.problem || '-',
        item.solution || '-'
    ]);
}

function transformOtherIssuesData(data) {
    return data.map(item => [
        item.id || '-',
        item.title || '-',
        item.content || '-'
    ]);
}

function translateStatus(status) {
    const statusMap = {
        'completed': 'เสร็จสิ้น',
        'in_progress': 'กำลังดำเนินการ',
        'scheduled': 'กำหนดวันแล้ว',
        'pending': 'รอดำเนินการ'
    };
    return statusMap[status] || status || '-';
}

// Main sync function
async function syncToSheets() {
    console.log('🚀 เริ่มซิงค์ข้อมูลไปยัง Google Sheets...\n');
    
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    
    // Authenticate
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    });
    
    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

    const ROUNDS = [
        { fileSuffix: '', sheetSuffix: '' },
        { fileSuffix: '.round2', sheetSuffix: ' - ครั้งที่ 2' }
    ];
    
    // Process each data type for each round
    for (const round of ROUNDS) {
        for (const [key, config] of Object.entries(SHEET_CONFIGS)) {
            const fileName = config.file.replace('.json', `${round.fileSuffix}.json`);
            const sheetName = `${config.name}${round.sheetSuffix}`;
            console.log(`📊 กำลังประมวลผล: ${sheetName} (ไฟล์: ${fileName})`);
            
            try {
                // Read JSON file
                const filePath = path.join(DATA_DIR, fileName);
                if (!fs.existsSync(filePath)) {
                    console.log(`   ⚠️ ไม่พบไฟล์: ${fileName}`);
                    continue;
                }
                
                const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const rows = config.transform(rawData);
                
                // Create sheet if not exists
                if (!existingSheets.includes(sheetName)) {
                    await sheets.spreadsheets.batchUpdate({
                        spreadsheetId: SPREADSHEET_ID,
                        requestBody: {
                            requests: [{
                                addSheet: {
                                    properties: {
                                        title: sheetName
                                    }
                                }
                            }]
                        }
                    });
                    console.log(`   ✅ สร้าง Sheet ใหม่: ${sheetName}`);
                }
                
                // Clear existing data
                await sheets.spreadsheets.values.clear({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `'${sheetName}'!A:Z`
                });
                
                // Write headers and data
                const allRows = [config.headers, ...rows];
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `'${sheetName}'!A1`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: allRows
                    }
                });
                
                // Format header row
                const sheetData = await sheets.spreadsheets.get({
                    spreadsheetId: SPREADSHEET_ID
                });
                const sheetId = sheetData.data.sheets.find(s => s.properties.title === sheetName)?.properties.sheetId;
                
                if (sheetId !== undefined) {
                    await sheets.spreadsheets.batchUpdate({
                        spreadsheetId: SPREADSHEET_ID,
                        requestBody: {
                            requests: [
                                {
                                    repeatCell: {
                                        range: {
                                            sheetId: sheetId,
                                            startRowIndex: 0,
                                            endRowIndex: 1
                                        },
                                        cell: {
                                            userEnteredFormat: {
                                                backgroundColor: { red: 0.2, green: 0.6, blue: 0.2 },
                                                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
                                            }
                                        },
                                        fields: 'userEnteredFormat(backgroundColor,textFormat)'
                                    }
                                },
                                {
                                    autoResizeDimensions: {
                                        dimensions: {
                                            sheetId: sheetId,
                                            dimension: 'COLUMNS',
                                            startIndex: 0,
                                            endIndex: config.headers.length
                                        }
                                    }
                                }
                            ]
                        }
                    });
                }
                
                console.log(`   ✅ อัพเดท ${rows.length} แถว`);
                
            } catch (error) {
                console.log(`   ❌ เกิดข้อผิดพลาด: ${error.message}`);
            }
        }
    }
    
    // Add sync timestamp to first sheet
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    
    // Check if "Sync Info" sheet exists
    if (!existingSheets.includes('ข้อมูลการซิงค์')) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    addSheet: {
                        properties: {
                            title: 'ข้อมูลการซิงค์',
                            index: 0
                        }
                    }
                }]
            }
        });
    }
    
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "'ข้อมูลการซิงค์'!A1",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [
                ['ข้อมูลการซิงค์ล่าสุด'],
                ['วันที่/เวลา', timestamp],
                [''],
                ['📋 รายการ Sheets'],
                ...Object.values(SHEET_CONFIGS).flatMap((c, i) => [
                    [`${i + 1}.1 ${c.name}`],
                    [`${i + 1}.2 ${c.name} - ครั้งที่ 2`]
                ])
            ]
        }
    });
    
    console.log(`\n✨ ซิงค์เสร็จสิ้น!`);
    console.log(`📅 เวลา: ${timestamp}`);
    console.log(`🔗 Google Sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
}

// Run
syncToSheets().catch(console.error);

