"""
Reformat Round 2 project assets to match ProjectAsset interface
"""
import json

with open(r'd:\code\Supervision_phut_1-2569-database\src\data\projectAssets.round2.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

# Map "มีในระบบ"/"ไม่มีในระบบ" to status codes
# "มีในระบบ" + "ใช้งานปกติ" -> "active"
# "มีในระบบ" + "ไม่ได้ใช้งาน" -> "warning"
# "มีในระบบ" + "ชำรุด" -> "danger"
# "ไม่มีในระบบ" -> "inactive"

formatted = []
for item in raw:
    details = item.get("details", "-")
    status_text = item.get("statusText", "-")
    
    # Determine status code
    if "ไม่มีในระบบ" in status_text:
        status_code = "inactive"
    elif "ชำรุด" in details:
        status_code = "danger"
    elif "ไม่ได้ใช้งาน" in details:
        status_code = "warning"
    else:
        status_code = "active"
    
    # Extract amount from details or set default
    amount = details if details != "-" else "-"
    
    formatted_item = {
        "id": item["id"],
        "formOrder": item["id"],
        "name": item["name"],
        "amount": amount,
        "status": status_code,
        "statusText": status_text,
        "problem": item.get("problem", "-"),
        "solution": item.get("solution", "-"),
        "images": []
    }
    formatted.append(formatted_item)

with open(r'd:\code\Supervision_phut_1-2569-database\src\data\projectAssets.round2.json', 'w', encoding='utf-8') as f:
    json.dump(formatted, f, ensure_ascii=False, indent=4)

print(f"Formatted {len(formatted)} items")
for item in formatted:
    print(f"  [{item['status']}] {item['name'][:50]} - {item['amount'][:40]}")
