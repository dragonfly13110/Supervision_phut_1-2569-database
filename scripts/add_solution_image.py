# Add Service Solution image block above project 1.1 in SectionBudgetDetailed.tsx
with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionBudgetDetailed.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_list_start = """                        <div className="projects-list">
                            {group.projects.map((project, index) => {"""

new_list_start = """                        <div className="projects-list">
                            {selectedRound === 'round2' && group.id === '1' && (
                                <div style={{
                                    marginBottom: '20px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    background: '#fff',
                                    padding: '12px'
                                }}>
                                    <div style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#0f766e',
                                        marginBottom: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        🗺️ Service Solution Model
                                    </div>
                                    <img 
                                        src="/service_solution_model.png" 
                                        alt="Service Solution Model" 
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: '8px',
                                            display: 'block',
                                            cursor: 'zoom-in',
                                            border: '1px solid #cbd5e1'
                                        }}
                                        onClick={() => {
                                            window.open('/service_solution_model.png', '_blank');
                                        }}
                                    />
                                </div>
                            )}
                            {group.projects.map((project, index) => {"""

assert old_list_start in content, "Projects list start not found"
content = content.replace(old_list_start, new_list_start)

with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionBudgetDetailed.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Service Solution image block inserted successfully!")
