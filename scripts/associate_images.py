import os
import json
import re
import urllib.parse

# Paths relative to script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
detailed_projects_path = os.path.join(project_root, 'src', 'data', 'detailedBudgetProjects.round2.json')
images_dir = os.path.join(project_root, 'public', 'project-images')

print("Reading detailed projects from JSON...")
with open(detailed_projects_path, 'r', encoding='utf-8') as f:
    groups = json.load(f)

def clean_for_match(s):
    s = s.replace('\r', '').replace('\n', '')
    s = re.sub(r'[\s_()..:\-\[\]{}]+', '', s)
    return s

# Scan directory structure of project-images
if not os.path.exists(images_dir):
    print(f"Directory not found: {images_dir}")
    exit(1)

dir_entries = {}
for entry in os.listdir(images_dir):
    entry_path = os.path.join(images_dir, entry)
    if os.path.isdir(entry_path):
        cleaned = clean_for_match(entry)
        dir_entries[cleaned] = entry

print(f"Found {len(dir_entries)} project image directories.")

# Match and update images
updated_count = 0
for group in groups:
    for project in group['projects']:
        proj_name = project['name']
        cleaned_proj = clean_for_match(proj_name)
        
        if cleaned_proj in dir_entries:
            dir_name = dir_entries[cleaned_proj]
            dir_path = os.path.join(images_dir, dir_name)
            
            # Find all image files in this directory
            files = [f for f in os.listdir(dir_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))]
            
            if files:
                existing_images = project.get('images', [])
                existing_map = {}
                for img in existing_images:
                    if 'url' in img:
                        # Extract the filename from the url
                        url_parts = img['url'].split('/')
                        if url_parts:
                            filename_unquoted = urllib.parse.unquote(url_parts[-1])
                            existing_map[filename_unquoted] = img
                
                new_images = []
                for filename in sorted(files):
                    # Check if we already have this image registered
                    quoted_dir = urllib.parse.quote(dir_name)
                    quoted_file = urllib.parse.quote(filename)
                    existing_img = existing_map.get(filename)
                    
                    if existing_img:
                        new_images.append(existing_img)
                    else:
                        url = f"/project-images/{quoted_dir}/{quoted_file}"
                        new_images.append({
                            "url": url,
                            "caption": ""
                        })
                
                project['images'] = new_images
                updated_count += len(files)
                print(f"Associated {len(files)} images with project: {proj_name[:40]}...")

# Write back to JSON
with open(detailed_projects_path, 'w', encoding='utf-8') as f:
    json.dump(groups, f, indent=4, ensure_ascii=False)

print(f"Successfully updated {detailed_projects_path} with {updated_count} image associations!")
