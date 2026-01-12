import { useState, useEffect } from 'react'
import { FiPackage, FiHome, FiEdit2, FiSave, FiPlus, FiTrash2, FiLoader, FiAlertTriangle } from 'react-icons/fi'
import { fetchSheetData, updateSheetData } from '../utils/sheetsApi'

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
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [assets, setAssets] = useState<Asset[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await fetchSheetData<Asset>('generalAssets')
            setAssets(data)
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถโหลดข้อมูลได้')
            console.error('Error loading data:', err)
        } finally {
            setIsLoading(false)
        }
    }

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

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateSheetData('generalAssets', assets)
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
                    <div className="section-icon"><FiPackage /></div>
                    <div>
                        <h2 className="section-title">หัวข้อที่ 2: การตรวจสอบสินทรัพย์</h2>
                        <p className="section-subtitle">สินทรัพย์ของสำนักงานเกษตรอำเภอ</p>
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
