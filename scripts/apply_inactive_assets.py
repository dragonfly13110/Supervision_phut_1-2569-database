# Apply distinct styling for inactive/no-system assets
with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionEquipment.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update card container with inactive class, lower opacity, background, dashed border, and no hover
old_card = """                    <div className="equipment-card" key={item.id} style={{ 
                        flexDirection: 'column', 
                        gap: '12px',
                        opacity: item.statusText === 'ไม่มีในระบบ' ? 0.6 : 1,
                        backgroundColor: item.statusText === 'ไม่มีในระบบ' ? '#f8fafc' : undefined,
                        border: item.statusText === 'ไม่มีในระบบ' ? '1px dashed #cbd5e1' : undefined,
                        transition: 'all 0.2s ease'
                    }}>"""

new_card = """                    <div 
                        className={`equipment-card ${item.statusText === 'ไม่มีในระบบ' ? 'inactive-asset' : ''}`} 
                        key={item.id} 
                        style={{ 
                            flexDirection: 'column', 
                            gap: '12px',
                            opacity: item.statusText === 'ไม่มีในระบบ' ? 0.45 : 1,
                            backgroundColor: item.statusText === 'ไม่มีในระบบ' ? '#f8fafc' : undefined,
                            border: item.statusText === 'ไม่มีในระบบ' ? '1px dashed #cbd5e1' : undefined,
                            boxShadow: item.statusText === 'ไม่มีในระบบ' ? 'none' : undefined,
                            pointerEvents: item.statusText === 'ไม่มีในระบบ' && !isEditing ? 'none' : undefined,
                            transition: 'all 0.2s ease'
                        }}
                    >"""

assert old_card in content, "Card container not found"
content = content.replace(old_card, new_card)

# 2. Update equipment number badge to look gray/inactive
old_number = """                            <div className="equipment-number">"""
new_number = """                            <div 
                                className="equipment-number"
                                style={item.statusText === 'ไม่มีในระบบ' ? {
                                    background: '#e2e8f0',
                                    color: '#94a3b8',
                                    boxShadow: 'none'
                                } : undefined}
                            >"""

assert old_number in content, "Number badge not found"
content = content.replace(old_number, new_number)

# 3. Update status badge styling for 'ไม่มีในระบบ'
old_badge = """                                <span className={`status-badge ${item.status}`}>{item.statusText}</span>"""
new_badge = """                                <span 
                                    className={`status-badge ${item.status}`}
                                    style={item.statusText === 'ไม่มีในระบบ' ? {
                                        background: '#f1f5f9',
                                        color: '#64748b',
                                        border: '1px solid #cbd5e1',
                                        fontWeight: 500
                                    } : undefined}
                                >
                                    {item.statusText}
                                </span>"""

assert old_badge in content, "Status badge not found"
content = content.replace(old_badge, new_badge)

with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionEquipment.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Inactive asset styling updated successfully!")
