import { FiFileText, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useState } from 'react'
import { policyProjects } from '../data/assetData'

export function SectionPolicy() {
    const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)

    const togglePolicy = (id: string) => {
        setExpandedPolicy(expandedPolicy === id ? null : id)
    }

    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiFileText /></div>
                <div>
                    <h2 className="section-title">ส่วนที่ 2: นโยบายและโครงการสำคัญ</h2>
                    <p className="section-subtitle">นโยบาย 6+3 และ 11 Quick Win</p>
                </div>
            </div>

            <div className="notes-box">
                <span className="notes-icon">📋</span>
                <div className="notes-text">
                    <strong>แนวทางการรายงาน</strong>
                    รายงานผลการดำเนินงาน ปัญหา และแผนงานในแต่ละข้อย่อย (คลิกเพื่อดูรายละเอียด)
                </div>
            </div>

            <div className="policy-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {policyProjects.map((policy) => (
                    <div
                        className="policy-card"
                        key={policy.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => togglePolicy(policy.id)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="policy-number">{policy.id}</div>
                                <div className="policy-title">{policy.title}</div>
                            </div>
                            <div style={{ color: '#2d7a32', fontSize: '20px' }}>
                                {expandedPolicy === policy.id ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                        </div>

                        {/* Projects detail - shown when expanded */}
                        {expandedPolicy === policy.id && (
                            <div style={{ marginTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                                {policy.projects.map((project, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            background: '#f0f7f1',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            marginBottom: idx < policy.projects.length - 1 ? '12px' : 0,
                                            borderLeft: '4px solid #2d7a32'
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, color: '#1a5a22', marginBottom: '12px', fontSize: '15px' }}>
                                            📌 {project.name}
                                        </div>

                                        <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                                            <div>
                                                <span style={{ color: '#666', fontWeight: 500 }}>กิจกรรม:</span>{' '}
                                                <span style={{ color: '#333' }}>{project.activity}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#166534', fontWeight: 500 }}>✓ ผลการดำเนินงาน:</span>{' '}
                                                <span style={{ color: '#166534' }}>{project.result}</span>
                                            </div>
                                            {project.problem !== '-' && (
                                                <>
                                                    <div style={{
                                                        background: '#fef3c7',
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        marginTop: '4px'
                                                    }}>
                                                        <div style={{ color: '#92400e', marginBottom: '4px' }}>
                                                            <strong>⚠ ปัญหา:</strong> {project.problem}
                                                        </div>
                                                        <div style={{ color: '#166534' }}>
                                                            <strong>💡 แนวทางแก้ไข:</strong> {project.solution}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
