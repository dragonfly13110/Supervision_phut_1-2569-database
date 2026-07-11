import os
import json
import re

# Path to the JSON files
detailed_projects_path = r"d:\code\Supervision_phut_1-2569-database\src\data\detailedBudgetProjects.round2.json"
base_output_dir = r"d:\code\Supervision_phut_1-2569-database\รูปภาพโครงการ"

print("Reading detailed projects from JSON...")
with open(detailed_projects_path, 'r', encoding='utf-8') as f:
    groups = json.load(f)

active_projects = []

for group in groups:
    for idx, project in enumerate(group['projects']):
        name = project['name']
        result = project.get('result', '')
        progress = project.get('progress', '')
        sub_activity = project.get('subActivity', '')
        
        # Check if the project is marked as having "no target" in Phutthamonthon
        has_no_target = "ไม่มีเป้าหมาย" in result or "ไม่มีเป้าหมาย" in progress or "ไม่มีเป้าหมาย" in sub_activity
        
        if not has_no_target:
            # Clean up newlines and replace with spaces
            clean_name = name.replace('\r', ' ').replace('\n', ' ')
            # Remove invalid Windows folder name characters: \ / : * ? " < > |
            clean_name = re.sub(r'[\x00-\x1f\\/:*?"<>|]', '_', clean_name)
            # Replace multiple underscores/spaces with single space/underscore
            clean_name = re.sub(r'\s+', ' ', clean_name)
            clean_name = clean_name.strip()
            
            active_projects.append((group['id'], idx, clean_name))

print(f"Found {len(active_projects)} active projects with targets in the district.")
for gid, pidx, name in active_projects:
    # Create the folder path
    folder_path = os.path.join(base_output_dir, name)
    os.makedirs(folder_path, exist_ok=True)
    # Print to console safely in UTF-8 or using safe ascii-compatible text
    try:
        print(f" - Created folder: {name.encode('utf-8', errors='ignore').decode('utf-8')}")
    except Exception:
        print(f" - Created folder (UTF-8 safe index {pidx} in group {gid})")

print("All folders created successfully!")
