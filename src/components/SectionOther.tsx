import { useState, useEffect } from 'react'
import { saveToDiskAndSync } from '../utils/sync'
import { FiAlertTriangle, FiEdit2, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'
import { FaGithub, FaCog } from 'react-icons/fa'
import otherIssuesData from '../data/otherIssues.json'

interface OtherIssue {
    id: string
    title: string
    content: string
}

export function SectionOther() {
    const [issues, setIssues] = useState<OtherIssue[]>(() => {
        const saved = localStorage.getItem('other_issues_data')
        return saved ? JSON.parse(saved) : otherIssuesData
    })
    const [isEditing, setIsEditing] = useState(false)
    const [showGithubSettings, setShowGithubSettings] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [githubConfig, setGithubConfig] = useState({
        owner: localStorage.getItem('gh_owner') || 'dragonfly13110',
        repo: localStorage.getItem('gh_repo') || 'Supervision_phut_1-2569',
        token: localStorage.getItem('gh_token') || '',
        path: 'src/data/otherIssues.json'
    })

    useEffect(() => {
        localStorage.setItem('other_issues_data', JSON.stringify(issues))
    }, [issues])

    const handleChange = (id: string, field: keyof OtherIssue, value: string) => {
        setIssues(prev => prev.map(issue =>
            issue.id === id ? { ...issue, [field]: value } : issue
        ))
    }

    const addIssue = () => {
        const newIssue: OtherIssue = {
            id: `issue-${Date.now()}`,
            title: 'ประเด็นใหม่',
            content: ''
        }
        setIssues(prev => [...prev, newIssue])
    }

    const removeIssue = (id: string) => {
        if (confirm('ต้องการลบประเด็นนี้หรือไม่?')) {
            setIssues(prev => prev.filter(issue => issue.id !== id))
        }
    }

    const handleSaveLocal = async () => {
        try {
            await saveToDiskAndSync('otherIssues.json', issues)
            localStorage.setItem('other_issues_data', JSON.stringify(issues))
            setIsEditing(false)
            alert('บันทึกข้อมูลลงเครื่องและซิงค์ไปยัง Google Sheets เรียบร้อยแล้ว')
        } catch (error) {
            console.error(error)
            alert('บันทึกข้อมูลสำเร็จ แต่ซิงค์ไม่สำเร็จ (ดู Console)')
        }
    }

    const handleSaveToGitHub = async () => {
        if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) {
            setShowGithubSettings(true)
            return
        }

        try {
            const apiUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.path}`
            const getRes = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            })

            let sha = undefined
            if (getRes.status === 200) {
                const fileData = await getRes.json()
                sha = fileData.sha
            } else if (getRes.status === 401) {
                throw new Error('Token ไม่ถูกต้อง (401 Unauthorized)')
            } else if (getRes.status !== 404) {
                throw new Error(`ดึงข้อมูลไฟล์ไม่สำเร็จ (${getRes.status})`)
            }

            const jsonString = JSON.stringify(issues, null, 4)
            const content = btoa(unescape(encodeURIComponent(jsonString)))

            const body: any = {
                message: 'Update other issues data via App',
                content: content
            }
            if (sha) body.sha = sha

            const putRes = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })

            if (!putRes.ok) {
                throw new Error(`บันทึกไม่สำเร็จ (${putRes.status})`)
            }

            alert('บันทึกข้อมูลไปยัง GitHub เรียบร้อยแล้ว!')
            setIsEditing(false)
        } catch (error) {
            console.error(error)
            alert('เกิดข้อผิดพลาด: ' + error)
        }
    }

    const saveGithubConfig = () => {
        localStorage.setItem('gh_owner', githubConfig.owner)
        localStorage.setItem('gh_repo', githubConfig.repo)
        localStorage.setItem('gh_token', githubConfig.token)
        setShowGithubSettings(false)
    }

    return (
        <section className="section">
            {/* GitHub Settings Modal */}
            {showGithubSettings && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1e293b', fontSize: '1.25rem' }}>ตั้งค่า GitHub</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.95rem', fontWeight: '500', color: '#334155' }}>
                                Personal Access Token <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="password"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                value={githubConfig.token}
                                onChange={e => setGithubConfig({ ...githubConfig, token: e.target.value })}
                                placeholder="ghp_xxxxxxxxxxxx"
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}
                            >
                                {showAdvanced ? '▼ ซ่อนตั้งค่าขั้นสูง' : '▶ แสดงตั้งค่าขั้นสูง'}
                            </button>
                        </div>

                        {showAdvanced && (
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Owner:</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                        value={githubConfig.owner}
                                        onChange={e => setGithubConfig({ ...githubConfig, owner: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Repo:</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                        value={githubConfig.repo}
                                        onChange={e => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowGithubSettings(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>ยกเลิก</button>
                            <button onClick={saveGithubConfig} style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>บันทึก</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="section-icon"><FiAlertTriangle /></div>
                    <div>
                        <h2 className="section-title">หัวข้อที่ 5: ประเด็นที่เกี่ยวข้อง / เรื่องอื่นๆ</h2>
                        <p className="section-subtitle">ปัญหาอุปสรรคและเรื่องที่ต้องการปรึกษา</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="edit-toggle-btn"
                        style={{ background: '#475569' }}
                        onClick={() => setShowGithubSettings(true)}
                        title="ตั้งค่า GitHub"
                    >
                        <FaCog />
                    </button>
                    {isEditing ? (
                        <>
                            <button className="edit-toggle-btn" onClick={handleSaveLocal} style={{ background: '#3b82f6' }}>
                                <FiSave /> บันทึก (Local)
                            </button>
                            <button className="edit-toggle-btn" style={{ background: '#24292e' }} onClick={handleSaveToGitHub}>
                                <FaGithub /> บันทึกขึ้น GitHub
                            </button>
                        </>
                    ) : (
                        <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>
                            <FiEdit2 /> แก้ไขข้อมูล
                        </button>
                    )}
                </div>
            </div>

            {issues.map((issue) => (
                <div key={issue.id} className="card" style={{ position: 'relative', marginBottom: '16px' }}>
                    {isEditing && (
                        <button
                            onClick={() => removeIssue(issue.id)}
                            style={{
                                position: 'absolute', top: '12px', right: '12px',
                                padding: '6px 10px', background: '#fef2f2', color: '#dc2626',
                                border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                            title="ลบประเด็น"
                        >
                            <FiTrash2 size={12} /> ลบ
                        </button>
                    )}
                    <div className="card-header">
                        <div className="card-icon"><FiAlertTriangle /></div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={issue.title}
                                onChange={(e) => handleChange(issue.id, 'title', e.target.value)}
                                style={{
                                    flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1',
                                    borderRadius: '6px', fontSize: '1rem', fontWeight: 600
                                }}
                                placeholder="หัวข้อประเด็น"
                            />
                        ) : (
                            <h3 className="card-title">{issue.title}</h3>
                        )}
                    </div>
                    <div className="card-content">
                        {isEditing ? (
                            <textarea
                                value={issue.content}
                                onChange={(e) => handleChange(issue.id, 'content', e.target.value)}
                                style={{
                                    width: '100%', padding: '12px', border: '1px solid #cbd5e1',
                                    borderRadius: '6px', fontSize: '0.95rem', minHeight: '120px',
                                    resize: 'vertical'
                                }}
                                placeholder="รายละเอียดประเด็น ปัญหา หรือข้อเสนอแนะ..."
                            />
                        ) : (
                            <div className="policy-placeholder" style={{ whiteSpace: 'pre-wrap' }}>
                                {issue.content || 'รอกรอกประเด็นปัญหาและข้อเสนอแนะ...'}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {isEditing && (
                <button
                    onClick={addIssue}
                    style={{
                        width: '100%', padding: '16px', marginTop: '8px',
                        background: '#ecfdf5', color: '#059669', border: '2px dashed #a7f3d0',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
                        fontWeight: 500, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px'
                    }}
                >
                    <FiPlus /> เพิ่มประเด็นใหม่
                </button>
            )}
        </section>
    )
}
