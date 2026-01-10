import { useState, useEffect } from 'react'
import { FiDollarSign, FiTrendingUp, FiPackage, FiEdit2, FiSave } from 'react-icons/fi'
import { FaGithub, FaCog } from 'react-icons/fa'
import budgetDataJson from '../data/budgetData.json'

interface BudgetItem {
    budget: string
    disbursed: string
}

interface BudgetData {
    construction: BudgetItem
    utilities: BudgetItem
    officeSupplies: BudgetItem
    service: BudgetItem
    travel: BudgetItem
}

// Helper function to format number with commas
const formatNumber = (value: string): string => {
    if (!value || value === '-') return value
    const num = parseFloat(value.replace(/,/g, ''))
    if (isNaN(num)) return value
    return num.toLocaleString('th-TH')
}

// Calculate percentage
const calculatePercentage = (disbursed: string, budget: string): string => {
    if (!disbursed || disbursed === '-' || !budget || budget === '-') return '-'
    const d = parseFloat(disbursed.replace(/,/g, ''))
    const b = parseFloat(budget.replace(/,/g, ''))
    if (isNaN(d) || isNaN(b) || b === 0) return '-'
    return ((d / b) * 100).toFixed(1) + '%'
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
        repo: localStorage.getItem('gh_repo') || 'Supervision_phut_1-2569',
        token: localStorage.getItem('gh_token') || '',
        path: 'src/data/budgetData.json'
    })

    useEffect(() => {
        localStorage.setItem('budget_data', JSON.stringify(data))
    }, [data])

    const handleChange = (field: keyof BudgetData, subField: keyof BudgetItem, value: string) => {
        setData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [subField]: value
            }
        }))
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

    const budgetItems = [
        { key: 'utilities' as keyof BudgetData, title: 'ค่าสาธารณูปโภค', sub: 'ค่าน้ำ/ค่าไฟ' },
        { key: 'officeSupplies' as keyof BudgetData, title: 'ค่าวัสดุสำนักงาน', sub: '' },
        { key: 'service' as keyof BudgetData, title: 'ค่าจ้างเหมาบริการ', sub: '' },
        { key: 'travel' as keyof BudgetData, title: 'เบี้ยเลี้ยง/ค่าเดินทาง', sub: '' },
    ]

    // Calculate totals
    const calculateTotals = () => {
        let totalBudget = 0
        let totalDisbursed = 0

        Object.values(data).forEach((item: BudgetItem) => {
            if (item.budget && item.budget !== '-') {
                const b = parseFloat(item.budget.replace(/,/g, ''))
                if (!isNaN(b)) totalBudget += b
            }
            if (item.disbursed && item.disbursed !== '-') {
                const d = parseFloat(item.disbursed.replace(/,/g, ''))
                if (!isNaN(d)) totalDisbursed += d
            }
        })

        return { totalBudget, totalDisbursed }
    }

    const totals = calculateTotals()

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

            {/* Summary Card */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '4px' }}>งบประมาณรวม</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totals.totalBudget.toLocaleString('th-TH')} บาท</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                    <div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '4px' }}>เบิกจ่ายแล้ว</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totals.totalDisbursed.toLocaleString('th-TH')} บาท</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                    <div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '4px' }}>เบิกจ่าย</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {totals.totalBudget > 0 ? ((totals.totalDisbursed / totals.totalBudget) * 100).toFixed(1) : '0'}%
                        </div>
                    </div>
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
                        <div className="list-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            <div className="list-item-number">1</div>
                            <div className="list-item-content" style={{ flex: 1 }}>
                                <div className="list-item-title">จำนวน / งบประมาณ</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
                                    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '4px' }}>งบประมาณ (บาท)</div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.construction.budget}
                                                onChange={e => handleChange('construction', 'budget', e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '1rem', fontWeight: 600 }}
                                                placeholder="0"
                                            />
                                        ) : (
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#15803d' }}>{formatNumber(data.construction.budget)}</div>
                                        )}
                                    </div>
                                    <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '4px' }}>เบิกจ่ายแล้ว (บาท)</div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.construction.disbursed}
                                                onChange={e => handleChange('construction', 'disbursed', e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #fcd34d', borderRadius: '6px', fontSize: '1rem', fontWeight: 600 }}
                                                placeholder="0"
                                            />
                                        ) : (
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#b45309' }}>{formatNumber(data.construction.disbursed)}</div>
                                        )}
                                    </div>
                                    <div style={{ background: '#ede9fe', padding: '12px', borderRadius: '8px', border: '1px solid #c4b5fd' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#5b21b6', marginBottom: '4px' }}>ร้อยละ</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#7c3aed' }}>
                                            {calculatePercentage(data.construction.disbursed, data.construction.budget)}
                                        </div>
                                    </div>
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
                        {budgetItems.map((item, idx) => (
                            <div className="list-item" key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div className="list-item-number">{idx + 1}</div>
                                <div className="list-item-content" style={{ flex: 1 }}>
                                    <div className="list-item-title">
                                        {item.title} {item.sub && <span style={{ fontSize: '12px', color: '#666', fontWeight: 400 }}>({item.sub})</span>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
                                        <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '4px' }}>งบประมาณ (บาท)</div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={data[item.key].budget}
                                                    onChange={e => handleChange(item.key, 'budget', e.target.value)}
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '1rem', fontWeight: 600 }}
                                                    placeholder="0"
                                                />
                                            ) : (
                                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#15803d' }}>{formatNumber(data[item.key].budget)}</div>
                                            )}
                                        </div>
                                        <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '4px' }}>เบิกจ่ายแล้ว (บาท)</div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={data[item.key].disbursed}
                                                    onChange={e => handleChange(item.key, 'disbursed', e.target.value)}
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #fcd34d', borderRadius: '6px', fontSize: '1rem', fontWeight: 600 }}
                                                    placeholder="0"
                                                />
                                            ) : (
                                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#b45309' }}>{formatNumber(data[item.key].disbursed)}</div>
                                            )}
                                        </div>
                                        <div style={{ background: '#ede9fe', padding: '12px', borderRadius: '8px', border: '1px solid #c4b5fd' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#5b21b6', marginBottom: '4px' }}>ร้อยละ</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#7c3aed' }}>
                                                {calculatePercentage(data[item.key].disbursed, data[item.key].budget)}
                                            </div>
                                        </div>
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
