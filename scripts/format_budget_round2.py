"""
Reformat Round 2 budget data to match BudgetData interface structure
"""
import json
import re

# Read the raw budget data
with open(r'd:\code\Supervision_phut_1-2569-database\src\data\budgetData.round2.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

# Parse the budget items from Word Table 1
# Item 1: "1. การเบิกจ่ายงบประมาณ..." contains:
# 1.1 งบลงทุน - construction: ไม่มี
# 1.2 งบดำเนินการ:
#   ค่าสาธารณูปโภค 10,000 / 7,054.03
#   ค่าเช่าบ้าน ไม่มี / ไม่มี  
#   ค่าจ้างเหมาบริการ 6,000 / 6,000
#   เบี้ยเลี้ยง 12,900 / 12,900
# Item 2: "1.3 งบโครงการ" contains various projects

# Parse from the raw topic text
item1_text = raw["budgetItems"][0]["topic"]
item2_text = raw["budgetItems"][1]["topic"]

print("=== Item 1 text ===")
print(item1_text)
print("\n=== Item 2 text ===")
print(item2_text)

# Extract budget figures from item 1
# Pattern: name \t จำนวน \t amount \t เบิกจ่ายแล้ว \t amount
budget_data = {
    "investment": {
        "construction": {"budget": "0", "disbursed": "-"}
    },
    "operation": {
        "utilities": {"budget": "10000", "disbursed": "7054.03"},
        "houseRent": {"budget": "0", "disbursed": "-"},
        "service": {"budget": "6000", "disbursed": "6000"},
        "travel": {"budget": "12900", "disbursed": "12900"}
    },
    "project": {}
}

# Parse project items from item 2
# Each line: - โครงการ... จำนวน amount เบิกจ่ายแล้ว amount
lines = item2_text.split('\n')
for line in lines:
    line = line.strip()
    if not line or line.startswith('1.3'):
        continue
    # Try to extract project name and amounts
    # Pattern: "- โครงการXXX\tจำนวน\tAMOUNT\tเบิกจ่ายแล้ว\tAMOUNT"
    # or: "\t\tจำนวน\tAMOUNT\tเบิกจ่ายแล้ว\tAMOUNT" (continuation)
    parts = re.split(r'\t+', line)
    name_parts = [p.strip() for p in parts if p.strip()]
    print(f"  Parts: {name_parts}")

# Manual parsing based on the Word data
projects = {
    "โครงการเพิ่มประสิทธิภาพฯ สารสนเทศ": {
        "name": "โครงการเพิ่มประสิทธิภาพการจัดทำสารสนเทศการเกษตรและการบริหารจัดการข้อมูลขนาดใหญ่",
        "budget": "1890",
        "disbursed": "1890"
    },
    "โครงการทะเบียนเกษตรกรฯ": {
        "name": "โครงการทะเบียนเกษตรกรและบริหารจัดการสารสนเทศการเกษตรด้านพืช",
        "budget": "518",
        "disbursed": "518"
    },
    "โครงการห่วงโซ่อุปทานฯ": {
        "name": "โครงการส่งเสริมและพัฒนาเพื่อเข้าสู่ห่วงโซ่อุปทานและบริการมูลค่าสูง",
        "budget": "750",
        "disbursed": "750"
    },
    "โครงการเกษตรที่เป็นมิตรฯ": {
        "name": "โครงการส่งเสริมการเกษตรที่เป็นมิตรกับสิ่งแวดล้อม",
        "budget": "500",
        "disbursed": "500"
    },
    "โครงการสุขภาพพืชฯ": {
        "name": "โครงการส่งเสริมการจัดการสุขภาพพืชเพื่อเพิ่มประสิทธิภาพการผลิตสินค้าเกษตร",
        "budget": "600",
        "disbursed": "600"
    },
    "โครงการแปลงใหญ่ฯ": {
        "name": "โครงการระบบส่งเสริมเกษตรแบบแปลงใหญ่เพื่อปรับเพิ่มผลิตภาพการผลิต",
        "budget": "1000",
        "disbursed": "600"
    }
}

budget_data["project"] = projects

with open(r'd:\code\Supervision_phut_1-2569-database\src\data\budgetData.round2.json', 'w', encoding='utf-8') as f:
    json.dump(budget_data, f, ensure_ascii=False, indent=4)

print("\nSaved formatted budgetData.round2.json")
print(json.dumps(budget_data, ensure_ascii=False, indent=2))
