import { useState, useEffect } from 'react'
import { FiFileText, FiEdit2, FiSave, FiPlus, FiTrash2, FiGithub } from 'react-icons/fi'
import { policyProjects } from '../data/assetData'

interface Project {
    name: string
    activity: string
    result: string
    problem: string
    solution: string
    [key: string]: string
}

interface Policy {
    id: string
    title: string
    projects: Project[]
}

export function SectionPolicy() {
    const [edits, setEdits] = useState<Policy[]>(() => {
        const saved = localStorage.getItem('policy_edits')
        return saved ? JSON.parse(saved) : policyProjects
    })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isPushing, setIsPushing] = useState(false)

    useEffect(() => {
        localStorage.setItem('policy_edits', JSON.stringify(edits))
    }, [edits])

    const handleEdit = (id: string) => {
        if (editingId === id) {
            setEditingId(null) // Save
        } else {
            setEditingId(id) // Edit
        }
    }

    const handleChange = (policyId: string, projectIndex: number, field: string, value: string) => {
        setEdits(prev => prev.map(policy => {
            if (policy.id !== policyId) return policy

            const newProjects = [...policy.projects]
            newProjects[projectIndex] = {
                ...newProjects[projectIndex],
                [field]: value
            }
            return { ...policy, projects: newProjects }
        }))
    }

    const handleAddProject = (policyId: string) => {
        setEdits(prev => prev.map(policy => {
            if (policy.id !== policyId) return policy
            return {
                ...policy,
                projects: [
                    ...policy.projects,
                    {
                        name: "โครงการใหม่",
                        activity: "-",
                        result: "-",
                        problem: "-",
                        solution: "-"
                    }
                ]
            }
        }))
    }

    const handleRemoveProject = (policyId: string, projectIndex: number) => {
        if (!confirm('ยืนยันการลบโครงการนี้?')) return
        setEdits(prev => prev.map(policy => {
            if (policy.id !== policyId) return policy
            return {
                ...policy,
                projects: policy.projects.filter((_, idx) => idx !== projectIndex)
            }
        }))
    }

    const handlePushToGithub = async () => {
        if (!confirm('ยืนยันการบันทึกข้อมูลขึ้น GitHub?')) return

        setIsPushing(true)
        try {
            const token = localStorage.getItem('github_pat')
            if (!token) {
                alert('กรุณาบันทึก GH_PAT ในส่วนรายงานกลุ่มก่อน')
                return
            }

            // 1. Get current file
            const response = await fetch('https://api.github.com/repos/dragonfly13110/--------/contents/src/data/assetData.ts', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            })
            const data = await response.json()
            const currentContent = decodeURIComponent(escape(atob(data.content)))

            // 2. Replace policyProjects section
            const newContent = currentContent.replace(
                /\/\/ ประเด็นเน้นย้ำ: นโยบายและแผนปฏิบัติการเร่งรัด \(Quick Win \/ Big Push Projects\)[\s\S]*?export const policyProjects = \[([\s\S]*?)\]/m,
                `// ประเด็นเน้นย้ำ: นโยบายและแผนปฏิบัติการเร่งรัด (Quick Win / Big Push Projects)\nexport const policyProjects = ${JSON.stringify(edits, null, 4)}`
            )

            // 3. Push back
            await fetch('https://api.github.com/repos/dragonfly13110/--------/contents/src/data/assetData.ts', {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update policy projects data via web',
                    content: btoa(unescape(encodeURIComponent(newContent))),
                    sha: data.sha,
                    branch: 'main' // or 'master' depending on repo
                })
            })

            alert('บันทึกข้อมูลสำเร็จ!')
        } catch (error: any) {
            console.error(error)
            alert('เกิดข้อผิดพลาด: ' + error.message)
        } finally {
            setIsPushing(false)
        }
    }

    return (
        <section className="section">
            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="section-icon"><FiFileText /></div>
                    <div>
                        <h2 className="section-title">ส่วนที่ 2: นโยบายและโครงการสำคัญ</h2>
                        <p className="section-subtitle">นโยบายและแผนปฏิบัติการเร่งรัด (Quick Win / Big Push Projects)</p>
                    </div>
                </div>
                <button
                    onClick={handlePushToGithub}
                    disabled={isPushing}
                    className="btn btn-github"
                >
                    <FiGithub /> {isPushing ? 'กำลังบันทึก...' : 'บันทึกขึ้น GitHub'}
                </button>
            </div>

            <div className="notes-box">
                <span className="notes-icon">📋</span>
                <div className="notes-text">
                    <strong>แนวทางการรายงาน</strong>
                    รายงานผลการดำเนินงาน ปัญหา และแผนงานในแต่ละข้อย่อย
                </div>
            </div>

            <div className="policy-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {edits.map((policy) => (
                    <div className="policy-card" key={policy.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="policy-number">{policy.id}</div>
                                <div className="policy-title">{policy.title}</div>
                            </div>
                            <button
                                onClick={() => handleEdit(policy.id)}
                                className={`edit-toggle-btn ${editingId === policy.id ? 'active' : ''}`}
                            >
                                {editingId === policy.id ? <><FiSave /> บันทึก</> : <><FiEdit2 /> แก้ไข</>}
                            </button>
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            {policy.projects.map((project, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#f0f7f1',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        borderLeft: '4px solid #2d7a32',
                                        position: 'relative'
                                    }}
                                >
                                    {editingId === policy.id ? (
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                                <button
                                                    onClick={() => handleRemoveProject(policy.id, idx)}
                                                    style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>ชื่อโครงการ</label>
                                                <input
                                                    className="edit-input"
                                                    value={project.name}
                                                    onChange={e => handleChange(policy.id, idx, 'name', e.target.value)}
                                                    style={{ width: '100%', fontWeight: 600, color: '#1a5a22' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>กิจกรรม</label>
                                                <textarea
                                                    className="edit-input"
                                                    value={project.activity}
                                                    onChange={e => handleChange(policy.id, idx, 'activity', e.target.value)}
                                                    style={{ width: '100%', minHeight: '60px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>ผลการดำเนินงาน</label>
                                                <textarea
                                                    className="edit-input"
                                                    value={project.result}
                                                    onChange={e => handleChange(policy.id, idx, 'result', e.target.value)}
                                                    style={{ width: '100%', minHeight: '60px' }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>ปัญหา</label>
                                                    <textarea
                                                        className="edit-input"
                                                        value={project.problem}
                                                        onChange={e => handleChange(policy.id, idx, 'problem', e.target.value)}
                                                        style={{ width: '100%', minHeight: '60px', background: '#fffbeb' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>แนวทางแก้ไข</label>
                                                    <textarea
                                                        className="edit-input"
                                                        value={project.solution}
                                                        onChange={e => handleChange(policy.id, idx, 'solution', e.target.value)}
                                                        style={{ width: '100%', minHeight: '60px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
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
                                                {(project.problem !== '-' || project.solution !== '-') && (
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
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {editingId === policy.id && (
                                <button
                                    onClick={() => handleAddProject(policy.id)}
                                    className="add-project-btn"
                                >
                                    <FiPlus /> เพิ่มโครงการ
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
