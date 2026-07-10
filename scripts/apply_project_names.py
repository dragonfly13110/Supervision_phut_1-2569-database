# Add getProjectDisplayName function and update JSX display in SectionBudgetDetailed.tsx
with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionBudgetDetailed.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert helper function getProjectDisplayName
old_helper = """// Helper: strip number after "กิจกรรม:" like "กิจกรรม: 1.1 กิจกรรม..." -> "กิจกรรม: กิจกรรม..."
const stripActivityNumber = (name: string): string => {
    return name.replace(/(กิจกรรม:\\s*)[\\d.]+\\s*/i, '$1');
};"""

new_helper = """// Helper: strip number after "กิจกรรม:" like "กิจกรรม: 1.1 กิจกรรม..." -> "กิจกรรม: กิจกรรม..."
const stripActivityNumber = (name: string): string => {
    return name.replace(/(กิจกรรม:\\s*)[\\d.]+\\s*/i, '$1');
};

// Helper: Get formatted display name with numbers prepended if not already present
const getProjectDisplayName = (projectName: string, groupId: string, index: number): string => {
    if (/^\\d+(\\.\\d+)?[\\s\\.:]/.test(projectName.trim())) {
        return projectName;
    }
    if (groupId === '1') {
        return `1.${index + 1} ${projectName}`;
    } else {
        return `${index + 1}. ${projectName}`;
    }
};"""

assert old_helper in content, "stripActivityNumber helper not found"
content = content.replace(old_helper, new_helper)

# 2. Update rendering of project.name for Round 2
old_span = """                                                {selectedRound === 'round2' ? (
                                                    <div style={{
                                                        fontWeight: 600,
                                                        color: hasNoTarget ? '#64748b' : '#065f46',
                                                        fontSize: '1.15rem',
                                                        lineHeight: '1.5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%'
                                                    }}>
                                                        <span>{project.name}</span>"""

new_span = """                                                {selectedRound === 'round2' ? (
                                                    <div style={{
                                                        fontWeight: 600,
                                                        color: hasNoTarget ? '#64748b' : '#065f46',
                                                        fontSize: '1.15rem',
                                                        lineHeight: '1.5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%'
                                                    }}>
                                                        <span>{getProjectDisplayName(project.name, group.id, index)}</span>"""

assert old_span in content, "Project name span not found"
content = content.replace(old_span, new_span)

with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionBudgetDetailed.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Project displayName updated successfully!")
