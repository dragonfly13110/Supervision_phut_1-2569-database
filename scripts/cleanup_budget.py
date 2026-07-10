# Clean up SectionBudgetDetailed.tsx
with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionBudgetDetailed.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Let's search for the duplicate block in lines
# We know the duplicate line has "</div>       <div"
target_line_idx = -1
for idx, line in enumerate(lines):
    if "</div>       <div className=\"feedback-label error\">" in line:
        target_line_idx = idx
        break

if target_line_idx != -1:
    print(f"Found duplicate block starting at line {target_line_idx + 1}")
    # We want to replace lines from target_line_idx to target_line_idx + 31
    # Let's check what those lines are
    print("Replacing lines:")
    for i in range(target_line_idx, target_line_idx + 32):
        print(f"  {i+1}: {lines[i].strip()}")
    
    # Replace the duplicate block with just "</div>"
    # Note that lines[target_line_idx] is the line with the duplicate, we will replace it with '                                                </div>\n'
    lines[target_line_idx] = '                                                </div>\n'
    del lines[target_line_idx+1:target_line_idx+32]
    
    with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionBudgetDetailed.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Cleanup successful!")
else:
    print("Duplicate block not found.")
