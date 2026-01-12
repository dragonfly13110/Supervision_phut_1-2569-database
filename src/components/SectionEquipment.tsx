import { useState, useEffect } from 'react'
import { FiTool, FiEdit2, FiSave, FiLoader, FiAlertTriangle } from 'react-icons/fi'
import { fetchSheetData, updateSheetData } from '../utils/sheetsApi'

interface ProjectAsset {
    id: number
    formOrder: number
    name: string
    amount: string
    status: string
    statusText: string
    problem: string
    solution: string
}

export function SectionEquipment() {
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [assets, setAssets] = useState<ProjectAsset[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await fetchSheetData<ProjectAsset>('projectAssets')
            setAssets(data)
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถโหลดข้อมูลได้')
            console.error('Error loading data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (id: number, field: keyof ProjectAsset, value: string | number) => {
        setAssets(prev => prev.map(asset =>
            asset.id === id ? { ...asset, [field]: value } : asset
        ))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateSheetData('projectAssets', assets)
            setIsEditing(false)
            alert('บันทึกข้อมูลไปยัง Google Sheets เรียบร้อยแล้ว!')
        } catch (err: any) {
            console.error('Error saving:', err)
            alert('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถบันทึกได้'))
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <section className="section">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px' }}>
                    <FiLoader className="spin" style={{ fontSize: '24px', color: '#3b82f6' }} />
                    <span style={{ fontSize: '1.1rem', color: '#64748b' }}>กำลังโหลดข้อมูลจาก Google Sheets...</span>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="section">
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '16px' }}>
                    <FiAlertTriangle style={{ fontSize: '48px', color: '#ef4444' }} />
                    <span style={{ fontSize: '1.1rem', color: '#ef4444' }}>{error}</span>
                    <button onClick={loadData} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        ลองใหม่
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="section">
            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="section-icon"><FiTool /></div>
                    <div>
                        <h2 className="section-title">ครุภัณฑ์โครงการงบยุทธศาสตร์การพัฒนาจังหวัด</h2>
                        <p className="section-subtitle">รายการที่มีจริง {assets.length} รายการ (จากแบบฟอร์ม 19 รายการ)</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isEditing ? (
                        <button
                            className="edit-toggle-btn"
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{ background: isSaving ? '#94a3b8' : '#16a34a' }}
                        >
                            {isSaving ? <><FiLoader className="spin" /> กำลังบันทึก...</> : <><FiSave /> บันทึก</>}
                        </button>
                    ) : (
                        <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>
                            <FiEdit2 /> แก้ไขข้อมูล
                        </button>
                    )}
                </div>
            </div>

            <div className="equipment-grid">
                {assets.map((item) => (
                    <div className="equipment-card" key={item.id} style={{ flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div className="equipment-number">
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={item.formOrder}
                                        onChange={e => handleChange(item.id, 'formOrder', parseInt(e.target.value) || 0)}
                                        style={{ width: '40px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
                                    />
                                ) : (
                                    item.formOrder
                                )}
                            </div>
                            <div className="equipment-info" style={{ flex: 1 }}>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={e => handleChange(item.id, 'name', e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '8px' }}
                                    />
                                ) : (
                                    <div className="equipment-name">{item.name}</div>
                                )}
                                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                    จำนวน: {isEditing ? (
                                        <input
                                            type="text"
                                            value={item.amount}
                                            onChange={e => handleChange(item.id, 'amount', e.target.value)}
                                            style={{ width: '100px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                        />
                                    ) : (
                                        <strong>{item.amount}</strong>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="equipment-status" style={{ marginLeft: '44px' }}>
                            {isEditing ? (
                                <select
                                    value={item.status}
                                    onChange={e => {
                                        const newStatus = e.target.value
                                        const statusTextMap: Record<string, string> = {
                                            'good': 'ใช้งานปกติ',
                                            'warning': 'ไม่ได้ใช้งาน',
                                            'danger': 'ชำรุด'
                                        }
                                        handleChange(item.id, 'status', newStatus)
                                        handleChange(item.id, 'statusText', statusTextMap[newStatus] || newStatus)
                                    }}
                                    style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                >
                                    <option value="good">ใช้งานปกติ</option>
                                    <option value="warning">ไม่ได้ใช้งาน</option>
                                    <option value="danger">ชำรุด</option>
                                </select>
                            ) : (
                                <span className={`status-badge ${item.status}`}>{item.statusText}</span>
                            )}
                        </div>
                        {isEditing && (
                            <div style={{ marginLeft: '44px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#666' }}>ปัญหา:</label>
                                    <input
                                        type="text"
                                        value={item.problem}
                                        onChange={e => handleChange(item.id, 'problem', e.target.value)}
                                        style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#666' }}>แนวทางแก้ไข:</label>
                                    <input
                                        type="text"
                                        value={item.solution}
                                        onChange={e => handleChange(item.id, 'solution', e.target.value)}
                                        style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>
                        )}
                        {!isEditing && item.problem !== '-' && (
                            <div style={{ marginLeft: '44px', fontSize: '13px', background: '#fef3c7', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                                <div style={{ color: '#92400e', marginBottom: '4px' }}><strong>ปัญหา:</strong> {item.problem}</div>
                                <div style={{ color: '#166534' }}><strong>แนวทางแก้ไข:</strong> {item.solution}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
