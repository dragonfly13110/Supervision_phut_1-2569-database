import { useState, useEffect } from 'react'
import { FiDollarSign, FiTrendingUp, FiPackage, FiEdit2, FiSave, FiBriefcase, FiPlus, FiTrash2 } from 'react-icons/fi'
import { FaGithub, FaCog } from 'react-icons/fa'
import budgetDataJson from '../data/budgetData.json'

interface BudgetItem {
    budget: string
    disbursed: string
}

interface ProjectItem {
    name: string
    budget: string
    disbursed: string
}

interface BudgetData {
    investment: {
        construction: BudgetItem
    }
    operation: {
        utilities: BudgetItem
        officeSupplies: BudgetItem
        service: BudgetItem
        travel: BudgetItem
    }
    project: {
        [key: string]: ProjectItem
    }
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

// Parse number from string
const parseNum = (value: string): number => {
    if (!value || value === '-') return 0
    const num = parseFloat(value.replace(/,/g, ''))
    return isNaN(num) ? 0 : num
}

export function SectionBudget() {
    const [isEditing, setIsEditing] = useState(false)
    const [showGithubSettings, setShowGithubSettings] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [data, setData] = useState<BudgetData>(() => {
        const saved = localStorage.getItem('budget_data_v2')
        return saved ? JSON.parse(saved) : budgetDataJson
    })

    const [githubConfig, setGithubConfig] = useState({
        owner: localStorage.getItem('gh_owner') || 'dragonfly13110',
        repo: localStorage.getItem('gh_repo') || 'Supervision_phut_1-2569',
        token: localStorage.getItem('gh_token') || '',
        path: 'src/data/budgetData.json'
    })

    useEffect(() => {
        localStorage.setItem('budget_data_v2', JSON.stringify(data))
    }, [data])

    const handleInvestmentChange = (subField: keyof BudgetItem, value: string) => {
        setData(prev => ({
            ...prev,
            investment: {
                ...prev.investment,
                construction: {
                    ...prev.investment.construction,
                    [subField]: value
                }
            }
        }))
    }

    const handleOperationChange = (field: keyof BudgetData['operation'], subField: keyof BudgetItem, value: string) => {
        setData(prev => ({
            ...prev,
            operation: {
                ...prev.operation,
                [field]: {
                    ...prev.operation[field],
                    [subField]: value
                }
            }
        }))
    }

    const handleProjectChange = (projectKey: string, field: keyof ProjectItem, value: string) => {
        setData(prev => ({
            ...prev,
            project: {
                ...prev.project,
                [projectKey]: {
                    ...prev.project[projectKey],
                    [field]: value
                }
            }
        }))
    }

    const addProject = () => {
        const newKey = `project${Date.now()}`
        setData(prev => ({
            ...prev,
            project: {
                ...prev.project,
                [newKey]: {
                    name: 'โครงการใหม่',
                    budget: '-',
                    disbursed: '-'
                }
            }
        }))
    }

    const removeProject = (projectKey: string) => {
        setData(prev => {
            const newProject = { ...prev.project }
            delete newProject[projectKey]
            return { ...prev, project: newProject }
        })
    }

    const handleSaveLocal = () => {
        localStorage.setItem('budget_data_v2', JSON.stringify(data))
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

    const operationItems = [
        { key: 'utilities' as keyof BudgetData['operation'], title: 'ค่าสาธารณูปโภค', sub: 'ค่าน้ำ/ค่าไฟ' },
        { key: 'officeSupplies' as keyof BudgetData['operation'], title: 'ค่าวัสดุสำนักงาน', sub: '' },
        { key: 'service' as keyof BudgetData['operation'], title: 'ค่าจ้างเหมาบริการ', sub: '' },
        { key: 'travel' as keyof BudgetData['operation'], title: 'เบี้ยเลี้ยง/ค่าเดินทาง', sub: '' },
    ]

    // Calculate section totals
    const investmentTotal = {
        budget: parseNum(data.investment.construction.budget),
        disbursed: parseNum(data.investment.construction.disbursed)
    }

    const operationTotal = Object.values(data.operation).reduce((acc, item) => ({
        budget: acc.budget + parseNum(item.budget),
        disbursed: acc.disbursed + parseNum(item.disbursed)
    }), { budget: 0, disbursed: 0 })

    const projectTotal = Object.values(data.project).reduce((acc, item) => ({
        budget: acc.budget + parseNum(item.budget),
        disbursed: acc.disbursed + parseNum(item.disbursed)
    }), { budget: 0, disbursed: 0 })

    const grandTotal = {
        budget: investmentTotal.budget + operationTotal.budget + projectTotal.budget,
        disbursed: investmentTotal.disbursed + operationTotal.disbursed + projectTotal.disbursed
    }

    // Summary Card Component
    const SummaryCard = ({ title, budget, disbursed, color }: { title: string, budget: number, disbursed: number, color: string }) => (
        <div style={{ background: color, padding: '18px 22px', borderRadius: '12px', minWidth: '220px', border: '1px solid rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>{title}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '18px' }}>
                <div>
                    <div style={{ fontSize: '1rem', color: '#475569' }}>งบประมาณ</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{budget.toLocaleString('th-TH')}</div>
                </div>
                <div>
                    <div style={{ fontSize: '1rem', color: '#475569' }}>เบิกจ่าย</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{disbursed.toLocaleString('th-TH')}</div>
                </div>
                <div>
                    <div style={{ fontSize: '1rem', color: '#475569' }}>%</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{budget > 0 ? ((disbursed / budget) * 100).toFixed(1) : '0'}%</div>
                </div>
            </div>
        </div>
    )

    // Budget Input Row Component
    const BudgetInputRow = ({ budget, disbursed, onBudgetChange, onDisbursedChange }: {
        budget: string,
        disbursed: string,
        onBudgetChange: (v: string) => void,
        onDisbursedChange: (v: string) => void
    }) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '10px' }}>
            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '4px' }}>งบประมาณ (บาท)</div>
                {isEditing ? (
                    <input
                        type="text"
                        value={budget}
                        onChange={e => onBudgetChange(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '1.3rem', fontWeight: 600 }}
                        placeholder="0"
                    />
                ) : (
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>{formatNumber(budget)}</div>
                )}
            </div>
            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '10px', border: '1px solid #fcd34d' }}>
                <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '4px' }}>เบิกจ่ายแล้ว (บาท)</div>
                {isEditing ? (
                    <input
                        type="text"
                        value={disbursed}
                        onChange={e => onDisbursedChange(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #fcd34d', borderRadius: '6px', fontSize: '1.3rem', fontWeight: 600 }}
                        placeholder="0"
                    />
                ) : (
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309' }}>{formatNumber(disbursed)}</div>
                )}
            </div>
            <div style={{ background: '#ede9fe', padding: '12px', borderRadius: '10px', border: '1px solid #c4b5fd' }}>
                <div style={{ fontSize: '0.85rem', color: '#5b21b6', marginBottom: '4px' }}>ร้อยละ</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>
                    {calculatePercentage(disbursed, budget)}
                </div>
            </div>
        </div>
    )

    // Section Summary Component
    const SectionSummary = ({ budget, disbursed }: { budget: number, disbursed: number }) => (
        <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '14px 20px',
            borderRadius: '10px',
            marginTop: '14px',
            border: '2px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>รวมงบประมาณ</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>{budget.toLocaleString('th-TH')} บาท</div>
            </div>
            <div style={{ width: '2px', height: '45px', background: '#cbd5e1' }}></div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>รวมเบิกจ่าย</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309' }}>{disbursed.toLocaleString('th-TH')} บาท</div>
            </div>
            <div style={{ width: '2px', height: '45px', background: '#cbd5e1' }}></div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>ร้อยละ</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>{budget > 0 ? ((disbursed / budget) * 100).toFixed(1) : '0'}%</div>
            </div>
        </div>
    )

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

            <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div className="section-icon" style={{ background: '#10b981', color: 'white', padding: '10px', borderRadius: '12px' }}>
                        <FiDollarSign size={24} />
                    </div>
                    <div>
                        <h2 className="section-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>หัวข้อที่ 1: การเบิกจ่ายงบประมาณ</h2>
                        <p className="section-subtitle" style={{ color: '#6b7280' }}>ตัดยอดตามความก้าวหน้าปัจจุบัน</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="edit-toggle-btn"
                        style={{
                            background: '#e5e7eb',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4b5563',
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowGithubSettings(true)}
                        title="ตั้งค่า GitHub"
                    >
                        <FaCog size={18} />
                    </button>
                    {isEditing ? (
                        <>
                            <button className="edit-toggle-btn" onClick={handleSaveLocal} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiSave /> บันทึก (Local)
                            </button>
                            <button className="edit-toggle-btn" style={{ background: '#24292e', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleSaveToGitHub}>
                                <FaGithub /> บันทึกขึ้น GitHub
                            </button>
                        </>
                    ) : (
                        <button className="edit-toggle-btn" onClick={() => setIsEditing(true)} style={{ background: '#1f2937', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiEdit2 size={14} /> แก้ไขข้อมูล
                        </button>
                    )}
                </div>
            </div>

            {/* Grand Summary */}
            {/* Grand Summary */}
            <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #10b981',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '28px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                color: '#1f2937'
            }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '24px', opacity: 1, color: '#1f2937' }}>📊 สรุปภาพรวมทั้งหมด</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
                    <SummaryCard title="1.1 งบลงทุน" budget={investmentTotal.budget} disbursed={investmentTotal.disbursed} color="#f9fafb" />
                    <SummaryCard title="1.2 งบดำเนินงาน" budget={operationTotal.budget} disbursed={operationTotal.disbursed} color="#f9fafb" />
                    <SummaryCard title="1.3 งบโครงการฯ" budget={projectTotal.budget} disbursed={projectTotal.disbursed} color="#f9fafb" />
                </div>
                <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '60px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', opacity: 0.95, color: '#64748b' }}>รวมงบประมาณทั้งหมด</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#10b981' }}>{grandTotal.budget.toLocaleString('th-TH')} บาท</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', opacity: 0.95, color: '#64748b' }}>รวมเบิกจ่ายทั้งหมด</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#b45309' }}>{grandTotal.disbursed.toLocaleString('th-TH')} บาท</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', opacity: 0.95, color: '#64748b' }}>ร้อยละรวม</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#7c3aed' }}>{grandTotal.budget > 0 ? ((grandTotal.disbursed / grandTotal.budget) * 100).toFixed(1) : '0'}%</div>
                    </div>
                </div>
            </div>

            {/* 1.1 งบลงทุน */}
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
                                <BudgetInputRow
                                    budget={data.investment.construction.budget}
                                    disbursed={data.investment.construction.disbursed}
                                    onBudgetChange={(v) => handleInvestmentChange('budget', v)}
                                    onDisbursedChange={(v) => handleInvestmentChange('disbursed', v)}
                                />
                            </div>
                        </div>
                    </div>
                    <SectionSummary budget={investmentTotal.budget} disbursed={investmentTotal.disbursed} />
                </div>
            </div>

            {/* 1.2 งบดำเนินงาน */}
            <div className="card">
                <div className="card-header">
                    <div className="card-icon"><FiPackage /></div>
                    <h3 className="card-title">1.2 งบดำเนินงาน</h3>
                </div>
                <div className="card-content">
                    <div className="list-group">
                        {operationItems.map((item, idx) => (
                            <div className="list-item" key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div className="list-item-number">{idx + 1}</div>
                                <div className="list-item-content" style={{ flex: 1 }}>
                                    <div className="list-item-title">
                                        {item.title} {item.sub && <span style={{ fontSize: '12px', color: '#666', fontWeight: 400 }}>({item.sub})</span>}
                                    </div>
                                    <BudgetInputRow
                                        budget={data.operation[item.key].budget}
                                        disbursed={data.operation[item.key].disbursed}
                                        onBudgetChange={(v) => handleOperationChange(item.key, 'budget', v)}
                                        onDisbursedChange={(v) => handleOperationChange(item.key, 'disbursed', v)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <SectionSummary budget={operationTotal.budget} disbursed={operationTotal.disbursed} />
                </div>
            </div>

            {/* 1.3 งบโครงการฯ */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="card-icon"><FiBriefcase /></div>
                        <h3 className="card-title">1.3 งบโครงการฯ</h3>
                    </div>
                    {isEditing && (
                        <button
                            onClick={addProject}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', background: '#ecfdf5', color: '#059669',
                                border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '0.9rem', fontWeight: 500
                            }}
                        >
                            <FiPlus /> เพิ่มโครงการ
                        </button>
                    )}
                </div>
                <div className="card-content">
                    <div className="list-group">
                        {Object.entries(data.project).map(([key, project], idx) => (
                            <div className="list-item" key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div className="list-item-number">{idx + 1}</div>
                                <div className="list-item-content" style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={project.name}
                                                onChange={e => handleProjectChange(key, 'name', e.target.value)}
                                                style={{
                                                    flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1',
                                                    borderRadius: '6px', fontSize: '1rem', fontWeight: 600
                                                }}
                                                placeholder="ชื่อโครงการ"
                                            />
                                        ) : (
                                            <div className="list-item-title">{project.name}</div>
                                        )}
                                        {isEditing && (
                                            <button
                                                onClick={() => removeProject(key)}
                                                style={{
                                                    marginLeft: '12px', padding: '6px 10px',
                                                    background: '#fef2f2', color: '#dc2626',
                                                    border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer'
                                                }}
                                                title="ลบโครงการ"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                    <BudgetInputRow
                                        budget={project.budget}
                                        disbursed={project.disbursed}
                                        onBudgetChange={(v) => handleProjectChange(key, 'budget', v)}
                                        onDisbursedChange={(v) => handleProjectChange(key, 'disbursed', v)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <SectionSummary budget={projectTotal.budget} disbursed={projectTotal.disbursed} />
                </div>
            </div>
        </section>
    )
}
