# Modify SectionBudgetDetailed.tsx for Round 2 and target styling
with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionBudgetDetailed.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add hasNoTarget to group.projects.map
old_map = "                            {group.projects.map((project, index) => {\n                                const isExpanded = isProjectExpanded(group.id, index);"
new_map = "                            {group.projects.map((project, index) => {\n                                const isExpanded = isProjectExpanded(group.id, index);\n                                const hasNoTarget = (project.result || '').includes('ไม่มีเป้าหมาย') || (project.progress || '').includes('ไม่มีเป้าหมาย') || (project.subActivity || '').includes('ไม่มีเป้าหมาย');"
assert old_map in content, "Map not found"
content = content.replace(old_map, new_map)

# 2. Update collapse header
old_header = """                                        <div
                                            className="project-collapse-header"
                                            onClick={() => toggleProjectCollapse(group.id, index)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 12px',
                                                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                                borderRadius: '6px',
                                                marginBottom: isExpanded ? '10px' : '0',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                border: '1px solid #d1fae5'
                                            }}
                                        >
                                            <span style={{ color: '#059669', fontSize: '14px' }}>
                                                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                            </span>"""

new_header = """                                        <div
                                            className="project-collapse-header"
                                            onClick={() => toggleProjectCollapse(group.id, index)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 12px',
                                                background: hasNoTarget 
                                                    ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                                                    : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                                borderRadius: '6px',
                                                marginBottom: isExpanded ? '10px' : '0',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                border: hasNoTarget ? '1px solid #cbd5e1' : '1px solid #d1fae5',
                                                opacity: hasNoTarget ? 0.85 : 1
                                            }}
                                        >
                                            <span style={{ color: hasNoTarget ? '#94a3b8' : '#059669', fontSize: '14px' }}>
                                                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                            </span>"""
assert old_header in content, "Header not found"
content = content.replace(old_header, new_header)

# 3. Update title area with round2 conditional rendering
old_title_area = """                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontWeight: 600,
                                                    color: '#065f46',
                                                    fontSize: '1.15rem',
                                                    marginBottom: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    กิจกรรมที่ {index + 1}: {stripActivityNumber(project.name)}
                                                    {/* Status Badge */}
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500,
                                                        background: project.status === 'completed' ? '#dcfce7' : project.status === 'in_progress' ? '#fef9c3' : project.status === 'scheduled' ? '#dbeafe' : '#f1f5f9',
                                                        color: project.status === 'completed' ? '#166534' : project.status === 'in_progress' ? '#a16207' : project.status === 'scheduled' ? '#1e40af' : '#64748b',
                                                        border: `1px solid ${project.status === 'completed' ? '#bbf7d0' : project.status === 'in_progress' ? '#fde047' : project.status === 'scheduled' ? '#60a5fa' : '#e2e8f0'}`
                                                    }}>
                                                        {project.status === 'completed' ? <><FaCheck size={10} /> เสร็จแล้ว</> :
                                                            project.status === 'in_progress' ? <><FaClock size={10} /> กำลังดำเนินการ</> :
                                                                project.status === 'scheduled' ? <><FaCalendarAlt size={10} /> กำหนดวันแล้ว</> :
                                                                    <><FaCircle size={8} /> ยังไม่เริ่ม</>}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    color: '#475569',
                                                    fontWeight: 400,
                                                    lineHeight: '1.5'
                                                }}>
                                                    📋 <strong>กิจกรรมย่อย:</strong> {stripLeadingNumber(project.subActivity)}
                                                </div>
                                            </div>"""

new_title_area = """                                            <div style={{ flex: 1 }}>
                                                {selectedRound === 'round2' ? (
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
                                                        <span>{project.name}</span>
                                                        {hasNoTarget && (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 500,
                                                                background: '#f1f5f9',
                                                                color: '#64748b',
                                                                border: '1px solid #e2e8f0',
                                                                marginLeft: 'auto',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                ไม่มีเป้าหมายในพื้นที่
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        fontWeight: 600,
                                                        color: hasNoTarget ? '#64748b' : '#065f46',
                                                        fontSize: '1.15rem',
                                                        marginBottom: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        <span>กิจกรรมที่ {index + 1}: {stripActivityNumber(project.name)}</span>
                                                        {/* Status Badge / No target Badge */}
                                                        {hasNoTarget ? (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 500,
                                                                background: '#f1f5f9',
                                                                color: '#64748b',
                                                                border: '1px solid #e2e8f0',
                                                            }}>
                                                                ไม่มีเป้าหมายในพื้นที่
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 500,
                                                                background: project.status === 'completed' ? '#dcfce7' : project.status === 'in_progress' ? '#fef9c3' : project.status === 'scheduled' ? '#dbeafe' : '#f1f5f9',
                                                                color: project.status === 'completed' ? '#166534' : project.status === 'in_progress' ? '#a16207' : project.status === 'scheduled' ? '#1e40af' : '#64748b',
                                                                border: `1px solid ${project.status === 'completed' ? '#bbf7d0' : project.status === 'in_progress' ? '#fde047' : project.status === 'scheduled' ? '#60a5fa' : '#e2e8f0'}`
                                                            }}>
                                                                {project.status === 'completed' ? <><FaCheck size={10} /> เสร็จแล้ว</> :
                                                                    project.status === 'in_progress' ? <><FaClock size={10} /> กำลังดำเนินการ</> :
                                                                        project.status === 'scheduled' ? <><FaCalendarAlt size={10} /> กำหนดวันแล้ว</> :
                                                                            <><FaCircle size={8} /> ยังไม่เริ่ม</>}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {selectedRound !== 'round2' && (
                                                    <div style={{
                                                        fontSize: '1rem',
                                                        color: hasNoTarget ? '#94a3b8' : '#475569',
                                                        fontWeight: 400,
                                                        lineHeight: '1.5'
                                                    }}>
                                                        📋 <strong>กิจกรรมย่อย:</strong> {stripLeadingNumber(project.subActivity || '')}
                                                    </div>
                                                )}
                                            </div>"""
assert old_title_area in content, "Title area not found"
content = content.replace(old_title_area, new_title_area)

# 4. Update budget display in header
old_budget = """                                            <span style={{
                                                fontSize: '0.85rem',
                                                color: '#10b981',
                                                fontWeight: 500,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {project.budget}
                                            </span>"""

new_budget = """                                            {selectedRound !== 'round2' && !hasNoTarget && (
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: '#10b981',
                                                    fontWeight: 500,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {project.budget}
                                                </span>
                                            )}"""
assert old_budget in content, "Budget not found"
content = content.replace(old_budget, new_budget)

# 5. Update collapsible content container style
old_content_container = """                                        {/* Collapsible Content */}
                                        <div style={{ display: !isExpanded ? 'none' : 'block' }}>"""
new_content_container = """                                        {/* Collapsible Content */}
                                        <div style={{ display: !isExpanded ? 'none' : 'block', opacity: hasNoTarget ? 0.75 : 1 }}>"""
assert old_content_container in content, "Content container not found"
content = content.replace(old_content_container, new_content_container)

# 6. Update isEditing form inputs (activities and status)
old_editing_form = """                                                            <div>
                                                                <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>กิจกรรมย่อย:</label>
                                                                <textarea
                                                                    value={project.subActivity}
                                                                    onChange={(e) => handleChange(group.id, index, 'subActivity', e.target.value)}
                                                                    style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical' }}
                                                                    rows={2}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>สถานะ:</label>
                                                                <select
                                                                    value={project.status || 'pending'}
                                                                    onChange={(e) => handleChange(group.id, index, 'status', e.target.value)}
                                                                    style={{
                                                                        width: '200px',
                                                                        padding: '8px 12px',
                                                                        border: '1px solid #cbd5e1',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.9rem',
                                                                        background: project.status === 'completed' ? '#dcfce7' : project.status === 'in_progress' ? '#fef9c3' : project.status === 'scheduled' ? '#dbeafe' : '#f8fafc',
                                                                        color: project.status === 'completed' ? '#166534' : project.status === 'in_progress' ? '#a16207' : project.status === 'scheduled' ? '#1e40af' : '#475569',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <option value="pending">⚪ ยังไม่เริ่ม</option>
                                                                    <option value="scheduled">🗓️ กำหนดวันแล้ว</option>
                                                                    <option value="in_progress">🟡 กำลังดำเนินการ</option>
                                                                    <option value="completed">🟢 เสร็จแล้ว</option>
                                                                </select>
                                                            </div>"""

new_editing_form = """                                                            {selectedRound !== 'round2' && (
                                                                <div>
                                                                    <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>กิจกรรมย่อย:</label>
                                                                    <textarea
                                                                        value={project.subActivity}
                                                                        onChange={(e) => handleChange(group.id, index, 'subActivity', e.target.value)}
                                                                        style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical' }}
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                            )}
                                                            {selectedRound !== 'round2' && (
                                                                <div>
                                                                    <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>สถานะ:</label>
                                                                    <select
                                                                        value={project.status || 'pending'}
                                                                        onChange={(e) => handleChange(group.id, index, 'status', e.target.value)}
                                                                        style={{
                                                                            width: '200px',
                                                                            padding: '8px 12px',
                                                                            border: '1px solid #cbd5e1',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.9rem',
                                                                            background: project.status === 'completed' ? '#dcfce7' : project.status === 'in_progress' ? '#fef9c3' : project.status === 'scheduled' ? '#dbeafe' : '#f8fafc',
                                                                            color: project.status === 'completed' ? '#166534' : project.status === 'in_progress' ? '#a16207' : project.status === 'scheduled' ? '#1e40af' : '#475569',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <option value="pending">⚪ ยังไม่เริ่ม</option>
                                                                        <option value="scheduled">🗓️ กำหนดวันแล้ว</option>
                                                                        <option value="in_progress">🟡 กำลังดำเนินการ</option>
                                                                        <option value="completed">🟢 เสร็จแล้ว</option>
                                                                    </select>
                                                                </div>
                                                            )}"""
assert old_editing_form in content, "Editing form not found"
content = content.replace(old_editing_form, new_editing_form)

# 7. Update metrics row
old_metrics = """                                                <div className="project-metrics">
                                                    <div className="metric">
                                                        <span className="label">เป้าหมาย:</span>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={project.target}
                                                                onChange={(e) => handleChange(group.id, index, 'target', e.target.value)}
                                                                style={{ width: '100px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                            />
                                                        ) : (
                                                            <span className="value">{project.target}</span>
                                                        )}
                                                    </div>
                                                    <div className="metric">
                                                        <span className="label">งบประมาณ:</span>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={project.budget}
                                                                onChange={(e) => handleChange(group.id, index, 'budget', e.target.value)}
                                                                style={{ width: '100px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                            />
                                                        ) : (
                                                            <span className="value">{project.budget}</span>
                                                        )}
                                                    </div>
                                                </div>"""

new_metrics = """                                                {selectedRound !== 'round2' && (
                                                    <div className="project-metrics">
                                                        <div className="metric">
                                                            <span className="label">เป้าหมาย:</span>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={project.target}
                                                                    onChange={(e) => handleChange(group.id, index, 'target', e.target.value)}
                                                                    style={{ width: '100px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                                />
                                                            ) : (
                                                                <span className="value">{project.target}</span>
                                                            )}
                                                        </div>
                                                        <div className="metric">
                                                            <span className="label">งบประมาณ:</span>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={project.budget}
                                                                    onChange={(e) => handleChange(group.id, index, 'budget', e.target.value)}
                                                                    style={{ width: '100px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                                />
                                                            ) : (
                                                                <span className="value">{project.budget}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}"""
assert old_metrics in content, "Metrics row not found"
content = content.replace(old_metrics, new_metrics)

# 8. Add progress field under feedback result
old_feedback = """                                            <div className="project-feedback">
                                                <div className="feedback-item">
                                                    <div className="feedback-label">
                                                        <FaChartLine className="icon" /> แผนการดำเนินงาน/ผลการดำเนินงาน
                                                    </div>
                                                    {isEditing ? (
                                                        <textarea
                                                            className="edit-textarea"
                                                            value={project.result}
                                                            onChange={(e) => handleChange(group.id, index, 'result', e.target.value)}
                                                            rows={3}
                                                            placeholder="ระบุผลการดำเนินงาน..."
                                                        />
                                                    ) : (
                                                        <div className="feedback-content">{project.result}</div>
                                                    )}
                                                </div>"""

new_feedback = """                                            <div className="project-feedback">
                                                <div className="feedback-item">
                                                    <div className="feedback-label">
                                                        <FaChartLine className="icon" /> แผนการดำเนินงาน/ผลการดำเนินงาน
                                                    </div>
                                                    {isEditing ? (
                                                        <textarea
                                                            className="edit-textarea"
                                                            value={project.result}
                                                            onChange={(e) => handleChange(group.id, index, 'result', e.target.value)}
                                                            rows={3}
                                                            placeholder="ระบุผลการดำเนินงาน..."
                                                        />
                                                    ) : (
                                                        <div className="feedback-content">{project.result}</div>
                                                    )}
                                                </div>
 
                                                {selectedRound === 'round2' && (
                                                    <div className="feedback-item" style={{ marginTop: '16px' }}>
                                                        <div className="feedback-label" style={{ color: '#0369a1' }}>
                                                            <FaChartLine className="icon" style={{ color: '#0369a1' }} /> ความก้าวหน้า
                                                        </div>
                                                        {isEditing ? (
                                                            <textarea
                                                                className="edit-textarea"
                                                                value={project.progress || ''}
                                                                onChange={(e) => handleChange(group.id, index, 'progress', e.target.value)}
                                                                rows={3}
                                                                placeholder="ระบุความก้าวหน้า..."
                                                            />
                                                        ) : (
                                                            <div className="feedback-content">{project.progress || '-'}</div>
                                                        )}
                                                    </div>
                                                )}"""
assert old_feedback in content, "Feedback not found"
content = content.replace(old_feedback, new_feedback)

with open(r'd:\code\Supervision_phut_1-2569-database\src\components\SectionBudgetDetailed.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete successfully!")
