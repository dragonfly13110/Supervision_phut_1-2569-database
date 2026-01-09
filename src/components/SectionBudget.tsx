import { useState, useEffect } from 'react'
import { FiDollarSign, FiTrendingUp, FiPackage, FiEdit2, FiSave } from 'react-icons/fi'

interface BudgetData {
    construction: string
    utilities: string
    houseRent: string
    service: string
    travel: string
}

const defaultBudget: BudgetData = {
    construction: '-',
    utilities: '-',
    houseRent: '-',
    service: '-',
    travel: '-'
}

export function SectionBudget() {
    const [isEditing, setIsEditing] = useState(false)
    const [data, setData] = useState<BudgetData>(() => {
        const saved = localStorage.getItem('budget_data')
        return saved ? JSON.parse(saved) : defaultBudget
    })

    useEffect(() => {
        localStorage.setItem('budget_data', JSON.stringify(data))
    }, [data])

    const handleChange = (field: keyof BudgetData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <section className="section">
            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="section-icon"><FiDollarSign /></div>
                    <div>
                        <h2 className="section-title">หัวข้อที่ 1: การเบิกจ่ายงบประมาณ</h2>
                        <p className="section-subtitle">ตัดยอดตามความก้าวหน้าปัจจุบัน</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
                >
                    {isEditing ? <><FiSave /> บันทึก</> : <><FiEdit2 /> แก้ไข</>}
                </button>
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
