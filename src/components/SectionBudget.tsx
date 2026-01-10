import { useState, useEffect } from 'react'
import { FiDollarSign, FiTrendingUp, FiPackage, FiEdit2, FiSave } from 'react-icons/fi'
import { FaGithub, FaCog } from 'react-icons/fa'
import budgetDataJson from '../data/budgetData.json'

interface BudgetData {
    construction: string
    utilities: string
    houseRent: string
    service: string
    travel: string
}

export function SectionBudget() {
    const [isEditing, setIsEditing] = useState(false)
    const [showGithubSettings, setShowGithubSettings] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [data, setData] = useState<BudgetData>(() => {
        const saved = localStorage.getItem('budget_data')
        return saved ? JSON.parse(saved) : budgetDataJson
    })

    const [githubConfig, setGithubConfig] = useState({
        owner: localStorage.getItem('gh_owner') || 'dragonfly13110',
        repo: localStorage.getItem('gh_repo') || 'tv-system-phutthamonthon',
        token: localStorage.getItem('gh_token') || '',
        path: 'src/data/budgetData.json'
    })

    useEffect(() => {
        localStorage.setItem('budget_data', JSON.stringify(data))
    }, [data])

    const handleChange = (field: keyof BudgetData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    const handleSaveLocal = () => {
        localStorage.setItem('budget_data', JSON.stringify(data))
        setIsEditing(false)
        alert('บันทึกข้อมูลลงเครื่องเรียบร้อยแล้ว')
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

            const jsonString = JSON.stringify(data, null, 4)
            const content = btoa(unescape(encodeURIComponent(jsonString)))

            const body: any = {
                message: 'Update budget data via App',
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
                    <div className="section-icon"><FiDollarSign /></div>
                    <div>
                        <h2 className="section-title">หัวข้อที่ 1: การเบิกจ่ายงบประมาณ</h2>
                        <p className="section-subtitle">ตัดยอดตามความก้าวหน้าปัจจุบัน</p>
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

            <div className="card">
                <div className="card-header">
                    <div className="card-icon"><FiTrendingUp /></div>
                    <h3 className="card-title">1.1 รายการงบลงทุน</h3>
                </div>
                <div className="card-content">
                    <div className="list-group">
                        <div className="list-group-title">การก่อสร้าง</div>
                        <div className="list-item">
                            <div className="list-item-number">1</div>
                            <div className="list-item-content">
                                <div className="list-item-title">จำนวน / งบประมาณ</div>
                                <div className="list-item-desc">
                                    {isEditing ? (
                                        <textarea
                                            className="edit-input"
                                            value={data.construction}
                                            onChange={e => handleChange('construction', e.target.value)}
                                            style={{ width: '100%', minHeight: '60px' }}
                                        />
                                    ) : (
                                        data.construction
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-icon"><FiPackage /></div>
                    <h3 className="card-title">1.2 งบดำเนินงาน</h3>
                </div>
                <div className="card-content">
                    <div className="list-group">
                        {[
                            { key: 'utilities', title: 'ค่าสาธารณูปโภค', sub: 'ค่าน้ำ/ค่าไฟ' },
                            { key: 'houseRent', title: 'ค่าเช่าบ้าน', sub: '' },
                            { key: 'service', title: 'ค่าจ้างเหมาบริการ', sub: '' },
                            { key: 'travel', title: 'เบี้ยเลี้ยง/ค่าเดินทาง', sub: '' },
                        ].map((item, idx) => (
                            <div className="list-item" key={idx}>
                                <div className="list-item-number">{idx + 1}</div>
                                <div className="list-item-content">
                                    <div className="list-item-title">
                                        {item.title} {item.sub && <span style={{ fontSize: '12px', color: '#666', fontWeight: 400 }}>({item.sub})</span>}
                                    </div>
                                    <div className="list-item-desc">
                                        {isEditing ? (
                                            <textarea
                                                className="edit-input"
                                                value={data[item.key as keyof BudgetData]}
                                                onChange={e => handleChange(item.key as keyof BudgetData, e.target.value)}
                                                style={{ width: '100%', minHeight: '60px' }}
                                            />
                                        ) : (
                                            data[item.key as keyof BudgetData]
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
