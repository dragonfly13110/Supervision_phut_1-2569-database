import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r"d:\code\Supervision_phut_1-2569-database\ประเด็นการนิเทศงาน ปี 69 จังหวัดนครปฐม รวม.docx"
output_path = r"d:\code\Supervision_phut_1-2569-database\scripts\word_content.txt"

NAMESPACE = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def parse_docx(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    
    with zipfile.ZipFile(file_path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        # We want to traverse the document and extract paragraphs and tables in order
        body = root.find('w:body', NAMESPACE)
        if body is None:
            print("No body found in XML")
            return
        
        with open(output_path, 'w', encoding='utf-8') as out:
            for child in body:
                tag = child.tag.split('}')[-1]
                
                if tag == 'p':
                    # Paragraph
                    texts = [node.text for node in child.findall('.//w:t', NAMESPACE) if node.text]
                    paragraph_text = "".join(texts).strip()
                    if paragraph_text:
                        out.write(f"[P] {paragraph_text}\n")
                        
                elif tag == 'tbl':
                    # Table
                    out.write("[TABLE START]\n")
                    rows = child.findall('w:tr', NAMESPACE)
                    for r_idx, row in enumerate(rows):
                        cells = row.findall('w:tc', NAMESPACE)
                        cell_texts = []
                        for cell in cells:
                            c_paragraphs = cell.findall('w:p', NAMESPACE)
                            c_text_parts = []
                            for p in c_paragraphs:
                                texts = [node.text for node in p.findall('.//w:t', NAMESPACE) if node.text]
                                c_text_parts.append("".join(texts))
                            cell_texts.append(" ".join(c_text_parts).strip())
                        out.write(f"  Row {r_idx}: " + " | ".join(cell_texts) + "\n")
                    out.write("[TABLE END]\n\n")

    print(f"Done parsing. Output written to {output_path}")

if __name__ == "__main__":
    parse_docx(docx_path)
