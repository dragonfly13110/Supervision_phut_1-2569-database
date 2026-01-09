import { useState, useEffect } from 'react'
import { FiFileText, FiEdit2, FiSave, FiPlus, FiTrash2, FiGithub, FiSettings, FiX } from 'react-icons/fi'
import { policyProjects } from '../data/assetData'

interface Project {
    name: string
    activity: string
    result: string
    problem: string
    solution: string
    images?: string[]
}

interface Policy {
    id: string
    title: string
    projects: Project[]
}

interface SectionPolicyProps {
    activeSection?: string
    onNavigateTo?: (section: string) => void
}

export function SectionPolicy({ activeSection, onNavigateTo }: SectionPolicyProps) {
    const [edits, setEdits] = useState<Policy[]>(() => {
        const saved = localStorage.getItem('policy_edits')
        return saved ? JSON.parse(saved) : policyProjects
    })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isPushing, setIsPushing] = useState(false)

    // GitHub Token State
    const [showSettings, setShowSettings] = useState(false)
    const [githubToken, setGithubToken] = useState('')

    // Image Input State
    const [newImageUrl, setNewImageUrl] = useState('')
    const [activeImageInput, setActiveImageInput] = useState<{ policyId: string, projectIdx: number } | null>(null)

    useEffect(() => {
        localStorage.setItem('policy_edits', JSON.stringify(edits))
    }, [edits])

    // Load/Save GitHub Token
    useEffect(() => {
        const savedToken = localStorage.getItem('githubToken')
        if (savedToken) setGithubToken(savedToken)
    }, [])

    useEffect(() => {
        if (activeSection && activeSection.startsWith('section2-')) {
            const policyId = activeSection.replace('section2-', '')
            const element = document.getElementById(`policy-${policyId}`)
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 100)
            }
        }
    }, [activeSection])

    useEffect(() => {
        if (githubToken) localStorage.setItem('githubToken', githubToken)
    }, [githubToken])

    const handleEdit = (id: string) => {
        if (editingId === id) {
            setEditingId(null) // Save
            setActiveImageInput(null)
            setNewImageUrl('')
        } else {
            setEditingId(id) // Edit
        }
    }

    const handleChange = (policyId: string, projectIndex: number, field: keyof Project, value: string) => {
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

    const handleAddImage = (policyId: string, projectIndex: number) => {
        if (!newImageUrl) return

        setEdits(prev => prev.map(policy => {
            if (policy.id !== policyId) return policy

            const newProjects = [...policy.projects]
            const currentImages = newProjects[projectIndex].images || []

            if (currentImages.length >= 2) return policy // Max 2 images

            newProjects[projectIndex] = {
                ...newProjects[projectIndex],
                images: [...currentImages, newImageUrl]
            }
            return { ...policy, projects: newProjects }
        }))
        setNewImageUrl('')
        setActiveImageInput(null)
    }

    const handleRemoveImage = (policyId: string, projectIndex: number, imageIndex: number) => {
        setEdits(prev => prev.map(policy => {
            if (policy.id !== policyId) return policy

            const newProjects = [...policy.projects]
            const currentImages = newProjects[projectIndex].images || []

            newProjects[projectIndex] = {
                ...newProjects[projectIndex],
                images: currentImages.filter((_, idx) => idx !== imageIndex)
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
        if (!githubToken) {
            alert('กรุณาตั้งค่า GitHub Token ก่อน (กดที่รูปฟันเฟือง)')
            setShowSettings(true)
            return
        }

        if (!confirm('ยืนยันการบันทึกข้อมูลขึ้น GitHub?')) return

        setIsPushing(true)
        try {
            // 1. Get current file
            const response = await fetch('https://api.github.com/repos/dragonfly13110/--------/contents/src/data/assetData.ts', {
                headers: {
                    'Authorization': `token ${githubToken}`,
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
                    'Authorization': `token ${githubToken}`,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="section-icon"><FiFileText /></div>
                    <div>
                        <h2 className="section-title">ส่วนที่ 2: นโยบายและโครงการสำคัญ</h2>
                        <p className="section-subtitle">นโยบายและแผนปฏิบัติการเร่งรัด (Quick Win / Big Push Projects)</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="btn btn-secondary"
                        title="ตั้งค่า GitHub Token"
                    >
                        <FiSettings />
                    </button>
                    <button
                        onClick={handlePushToGithub}
                        disabled={isPushing}
                        className="btn btn-github"
                    >
                        <FiGithub /> {isPushing ? 'กำลังบันทึก...' : 'บันทึกขึ้น GitHub'}
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div style={{
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ marginBottom: '12px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiSettings /> ตั้งค่า GitHub Personal Access Token
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                        Token จะถูกบันทึกใน Browser นี้เท่านั้น เพื่อใช้ในการบันทึกข้อมูลลง GitHub
                    </div>
                    <input
                        type="password"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    />
                </div>
            )}

            <div className="notes-box">
                <span className="notes-icon">📋</span>
                <div className="notes-text">
                    <strong>แนวทางการรายงาน</strong>
                    รายงานผลการดำเนินงาน ปัญหา และแผนงานในแต่ละข้อย่อย
                </div>
            </div>

            <div className="policy-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeSection?.startsWith('section2-') && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => onNavigateTo?.('section2')}
                        style={{ alignSelf: 'flex-start', marginBottom: '8px' }}
                    >
                        ← กลับไปภาพรวมนโยบาย
                    </button>
                )}

                {edits
                    .filter(policy => {
                        if (activeSection && activeSection.startsWith('section2-')) {
                            const targetId = activeSection.replace('section2-', '')
                            return policy.id === targetId
                        }
                        return true
                    })
                    .map((policy) => (
                        <div className="policy-card" key={policy.id} id={`policy-${policy.id}`}>
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

                                                {/* Image Management Section */}
                                                <div>
                                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#666', display: 'block', marginBottom: '8px' }}>
                                                        รูปภาพประกอบ (สูงสุด 2 รูป)
                                                    </label>

                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                                                        {project.images?.map((img, imgIdx) => (
                                                            <div key={imgIdx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', aspectRatio: '4/3' }}>
                                                                <img
                                                                    src={img}
                                                                    alt={`Project ${imgIdx}`}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                                <button
                                                                    onClick={() => handleRemoveImage(policy.id, idx, imgIdx)}
                                                                    style={{
                                                                        position: 'absolute', top: 4, right: 4,
                                                                        background: '#dc2626', color: 'white',
                                                                        border: 'none', borderRadius: '50%',
                                                                        width: '24px', height: '24px',
                                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                    }}
                                                                >
                                                                    <FiX size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {(project.images?.length || 0) < 2 && (
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <input
                                                                className="edit-input"
                                                                placeholder="URL รูปภาพ..."
                                                                value={activeImageInput?.policyId === policy.id && activeImageInput?.projectIdx === idx ? newImageUrl : ''}
                                                                onChange={e => {
                                                                    setActiveImageInput({ policyId: policy.id, projectIdx: idx })
                                                                    setNewImageUrl(e.target.value)
                                                                }}
                                                                style={{ flex: 1 }}
                                                            />
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => handleAddImage(policy.id, idx)}
                                                                disabled={!newImageUrl || (activeImageInput?.policyId !== policy.id || activeImageInput?.projectIdx !== idx)}
                                                            >
                                                                <FiPlus /> เพิ่มรูป
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ fontWeight: 600, color: '#1a5a22', marginBottom: '12px', fontSize: '15px' }}>
                                                    📌 {project.name}
                                                </div>

                                                {/* Display Images in Read Mode */}
                                                {project.images && project.images.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                        {project.images.map((img, imgIdx) => (
                                                            <div key={imgIdx} style={{
                                                                width: '200px',
                                                                aspectRatio: '4/3',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                border: '1px solid #e5e7eb',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                            }}>
                                                                <img
                                                                    src={img}
                                                                    alt={`Project Image ${imgIdx}`}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                                                    <div>
                                                        <span style={{ color: '#666', fontWeight: 500 }}>กิจกรรม:</span>{' '}
                                                        <span style={{ color: '#333' }}>{project.activity}</span>
                                                    </div>
                                                    <div style={{
                                                        background: '#f0fdf4',
                                                        padding: '10px',
                                                        borderRadius: '6px',
                                                        marginTop: '8px',
                                                        marginBottom: '8px',
                                                        borderLeft: '4px solid #166534'
                                                    }}>
                                                        <div style={{ color: '#166534', fontWeight: 600, marginBottom: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            📈 ผลการดำเนินงาน
                                                        </div>
                                                        <div style={{ color: '#333', fontSize: '14px' }}>
                                                            {project.result || '-'}
                                                        </div>
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
