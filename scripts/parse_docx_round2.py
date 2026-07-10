import zipfile
import xml.etree.ElementTree as ET
import json
import os

docx_path = r"d:\code\Supervision_phut_1-2569-database\ประเด็นการนิเทศงาน ปี 69 จังหวัดนครปฐม รวม.docx"
output_json_path = r"d:\code\Supervision_phut_1-2569-database\src\data\detailedBudgetProjects.round2.json"

NAMESPACE = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def clean_text(text):
    # Normalize clean space/newlines
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Remove excessive backslashes or strange double quotes
    if text.startswith('"') and text.endswith('"'):
        text = text[1:-1]
    return text.strip()

def parse_docx():
    if not os.path.exists(docx_path):
        print(f"File not found: {docx_path}")
        return
    
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        body = root.find('w:body', NAMESPACE)
        if body is None:
            print("No body found in XML")
            return
        
        # Find the first table which contains projects
        tables = body.findall('.//w:tbl', NAMESPACE)
        if not tables:
            print("No tables found in XML")
            return
        
        project_table = tables[0]
        rows = project_table.findall('w:tr', NAMESPACE)
        
        # Parse table rows into cell texts
        table_data = []
        for row in rows:
            cells = row.findall('w:tc', NAMESPACE)
            cell_texts = []
            for cell in cells:
                c_paragraphs = cell.findall('w:p', NAMESPACE)
                c_text_parts = []
                for p in c_paragraphs:
                    texts = [node.text for node in p.findall('.//w:t', NAMESPACE) if node.text]
                    c_text_parts.append("".join(texts))
                cell_texts.append("\n".join(c_text_parts).strip())
            table_data.append(cell_texts)
        
        # Headers should be at row 0: ประเด็นการนิเทศงานและติดตาม | ผลการดำเนินงาน | ความก้าวหน้า | ปัญหา/อุปสรรค | แนวทางแก้ไข
        # Row 1 is: แนวทางการดำเนินงานส่งเสริมการเกษตร ปี 2569 Service Solution...
        # Rows 2 to 7 are sub-activities of Service Solution
        # Row 8 is: การขับเคลื่อนงานส่งเสริมการเกษตร (โครงการตามงบประมาณ ปี 2569) (ตามภารกิจของแต่ละอำเภอ)
        # Rows 9 to 26 are standard projects
        
        service_solution_projects = []
        for idx in range(2, 8):
            if idx < len(table_data):
                row = table_data[idx]
                if len(row) >= 5:
                    service_solution_projects.append({
                        "name": clean_text(row[0]),
                        "result": clean_text(row[1]),
                        "progress": clean_text(row[2]),
                        "problem": clean_text(row[3]),
                        "solution": clean_text(row[4]),
                        "images": []
                    })
                    
        budget_projects = []
        for idx in range(9, 27):
            if idx < len(table_data):
                row = table_data[idx]
                # Pad row to at least 5 elements if needed
                while len(row) < 5:
                    row.append("")
                budget_projects.append({
                    "name": clean_text(row[0]),
                    "result": clean_text(row[1]),
                    "progress": clean_text(row[2]),
                    "problem": clean_text(row[3]),
                    "solution": clean_text(row[4]),
                    "images": []
                })
        
        output_data = [
            {
                "id": "1",
                "title": "1. แนวทางการดำเนินงานส่งเสริมการเกษตร ปี 2569 (Service Solution)",
                "projects": service_solution_projects
            },
            {
                "id": "2",
                "title": "2. การขับเคลื่อนงานส่งเสริมการเกษตร (โครงการตามงบประมาณ ปี 2569)",
                "projects": budget_projects
            }
        ]
        
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=4)
            
        print(f"Successfully generated detailedBudgetProjects.round2.json with {len(service_solution_projects)} Service Solution and {len(budget_projects)} budget projects.")

if __name__ == "__main__":
    parse_docx()
