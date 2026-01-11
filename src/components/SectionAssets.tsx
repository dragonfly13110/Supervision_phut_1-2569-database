import { useState, useEffect } from 'react'
import { FiPackage, FiHome, FiEdit2, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'
import { FaGithub, FaCog } from 'react-icons/fa'
import generalAssetsJson from '../data/generalAssets.json'

interface Asset {
    id: number
    name: string
    amount: string
    details: string
    status: string
    statusText: string
    problem: string
    solution: string
}

export function SectionAssets() {
    const [isEditing, setIsEditing] = useState(false)
    const [showGithubSettings, setShowGithubSettings] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [assets, setAssets] = useState<Asset[]>(() => {
        const saved = localStorage.getItem('general_assets')
        return saved ? JSON.parse(saved) : generalAssetsJson
    })

    const [githubConfig, setGithubConfig] = useState({
        owner: localStorage.getItem('gh_owner') || 'dragonfly13110',
        repo: localStorage.getItem('gh_repo') || 'Supervision_phut_1-2569',
        token: localStorage.getItem('gh_token') || '',
        path: 'src/data/generalAssets.json'
    })

    useEffect(() => {
        localStorage.setItem('general_assets', JSON.stringify(assets))
    }, [assets])

    const handleChange = (id: number, field: keyof Asset, value: string) => {
        setAssets(prev => prev.map(asset =>
            asset.id === id ? { ...asset, [field]: value } : asset
        ))
    }

    const addAsset = () => {
        const newId = Math.max(...assets.map(a => a.id), 0) + 1
        setAssets(prev => [...prev, {
            id: newId,
            name: 'รายการใหม่',
            amount: '-',
            details: '-',
            status: 'good',
            statusText: 'ใช้งานปกติ',
            problem: '-',
            solution: '-'
        }])
    }

    const removeAsset = (id: number) => {
        if (confirm('ต้องการลบรายการนี้หรือไม่?')) {
            setAssets(prev => prev.filter(a => a.id !== id))
        }
    }

    const handleStatusChange = (id: number, status: string) => {
        const statusTextMap: Record<string, string> = {
            'good': 'ใช้งานปกติ',
            'warning': 'ไม่ได้ใช้งาน',
            'danger': 'ชำรุด'
        }
        setAssets(prev => prev.map(asset =>
            asset.id === id ? { ...asset, status, statusText: statusTextMap[status] } : asset
        ))
    }

    const handleSaveLocal = () => {
        localStorage.setItem('general_assets', JSON.stringify(assets))
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

            const jsonString = JSON.stringify(assets, null, 4)
            const content = btoa(unescape(encodeURIComponent(jsonString)))

            const body: any = {
                message: 'Update general assets data via App',
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
                    <div className="section-icon"><FiPackage /></div>
                    <div>
                        <h2 className="section-title">หัวข้อที่ 2: การตรวจสอบสินทรัพย์</h2>
                        <p className="section-subtitle">สินทรัพย์ของสำนักงานเกษตรอำเภอ</p>
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
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="card-icon"><FiHome /></div>
                        <h3 className="card-title">สินทรัพย์ทั่วไป ({assets.length} รายการ)</h3>
                    </div>
                    {isEditing && (
                        <button
                            onClick={addAsset}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '10px 20px', background: '#ecfdf5', color: '#059669',
                                border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '1.1rem', fontWeight: 500
                            }}
                        >
                            <FiPlus /> เพิ่มรายการ
                        </button>
                    )}
                </div>
                <div className="card-content">
                    <div className="equipment-grid">
                        {assets.map((asset, idx) => (
                            <div className="equipment-card" key={asset.id} style={{ flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div className="equipment-number">{idx + 1}</div>
                                    <div className="equipment-info" style={{ flex: 1 }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                                <input
                                                    type="text"
                                                    className="edit-input"
                                                    value={asset.name}
                                                    onChange={e => handleChange(asset.id, 'name', e.target.value)}
                                                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                    placeholder="ชื่อสินทรัพย์"
                                                />
                                                <button
                                                    onClick={() => removeAsset(asset.id)}
                                                    style={{
                                                        padding: '6px 10px',
                                                        background: '#fef2f2', color: '#dc2626',
                                                        border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer'
                                                    }}
                                                    title="ลบรายการ"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="equipment-name">{asset.name}</div>
                                        )}
                                        <div style={{ fontSize: '20px', color: '#666', marginBottom: '10px' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={asset.amount}
                                                        onChange={e => handleChange(asset.id, 'amount', e.target.value)}
                                                        style={{ width: '80px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                        placeholder="จำนวน"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={asset.details}
                                                        onChange={e => handleChange(asset.id, 'details', e.target.value)}
                                                        style={{ flex: 1, padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                        placeholder="รายละเอียด"
                                                    />
                                                </div>
                                            ) : (
                                                <><strong>{asset.amount}</strong> | {asset.details}</>
                                            )}
                                        </div>
                                        <div className="equipment-status">
                                            {isEditing ? (
                                                <select
                                                    value={asset.status}
                                                    onChange={e => handleStatusChange(asset.id, e.target.value)}
                                                    style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                >
                                                    <option value="good">ใช้งานปกติ</option>
                                                    <option value="warning">ไม่ได้ใช้งาน</option>
                                                    <option value="danger">ชำรุด</option>
                                                </select>
                                            ) : (
                                                <span className={`status-badge ${asset.status}`}>{asset.statusText}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isEditing && (
                                    <div style={{ marginLeft: '44px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div>
                                            <label style={{ fontSize: '18px', color: '#666' }}>ปัญหา:</label>
                                            <input
                                                type="text"
                                                value={asset.problem}
                                                onChange={e => handleChange(asset.id, 'problem', e.target.value)}
                                                style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '18px', color: '#666' }}>แนวทางแก้ไข:</label>
                                            <input
                                                type="text"
                                                value={asset.solution}
                                                onChange={e => handleChange(asset.id, 'solution', e.target.value)}
                                                style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {!isEditing && asset.problem !== '-' && (
                                    <div style={{ marginLeft: '56px', fontSize: '20px', background: '#fef3c7', padding: '14px 18px', borderRadius: '10px', borderLeft: '5px solid #f59e0b' }}>
                                        <div style={{ color: '#92400e', marginBottom: '6px' }}><strong>ปัญหา:</strong> {asset.problem}</div>
                                        <div style={{ color: '#166534' }}><strong>แนวทางแก้ไข:</strong> {asset.solution}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
