import { useState, useEffect } from 'react'
import { FiTool, FiEdit2, FiSave, FiLoader, FiAlertTriangle, FiImage, FiPlus, FiX } from 'react-icons/fi'
import { fetchSheetData, updateSheetData } from '../utils/sheetsApi'
import { useAuth } from './AuthContext'
import { useRound } from './RoundContext'

interface ProjectAsset {
    id: number
    formOrder: number
    name: string
    amount: string
    status: string
    statusText: string
    problem: string
    solution: string
    images?: { url: string; caption?: string }[]
}

export function SectionEquipment() {
    const { isLoggedIn } = useAuth()
    const { selectedRound } = useRound()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [assets, setAssets] = useState<ProjectAsset[]>([])

    // Image Modal State
    const [imageModal, setImageModal] = useState<{ assetId: number } | null>(null)
    const [newImageUrl, setNewImageUrl] = useState('')
    const [newImageCaption, setNewImageCaption] = useState('')

    // Lightbox State
    const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null)

    useEffect(() => {
        loadData()
    }, [selectedRound])


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

    const handleAddImage = () => {
        if (imageModal && newImageUrl) {
            setAssets(prev => prev.map(asset => {
                if (asset.id !== imageModal.assetId) return asset
                const currentImages = asset.images || []
                return { ...asset, images: [...currentImages, { url: newImageUrl, caption: newImageCaption }] }
            }))
            setImageModal(null)
            setNewImageUrl('')
            setNewImageCaption('')
        }
    }

    const handleRemoveImage = (assetId: number, imgIndex: number) => {
        setAssets(prev => prev.map(asset => {
            if (asset.id !== assetId) return asset
            const currentImages = asset.images || []
            return { ...asset, images: currentImages.filter((_, i) => i !== imgIndex) }
        }))
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
            {/* Lightbox Modal */}
            {lightboxImage && (
                <div onClick={() => setLightboxImage(null)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.9)', zIndex: 2000,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    padding: '20px', cursor: 'pointer'
                }}>
                    <button onClick={() => setLightboxImage(null)} style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'rgba(255, 255, 255, 0.2)', border: 'none', borderRadius: '50%',
                        width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'white', fontSize: '24px'
                    }}><FiX /></button>
                    <img src={lightboxImage.url} alt={lightboxImage.caption || 'Full size'}
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '12px', cursor: 'default' }} />
                    {lightboxImage.caption && (
                        <div style={{ marginTop: '16px', color: 'white', fontSize: '1.1rem', textAlign: 'center' }}>
                            {lightboxImage.caption}
                        </div>
                    )}
                </div>
            )}

            {/* Image Modal */}
            {imageModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>🖼️ เพิ่มรูปภาพ</h3>
                            <button onClick={() => setImageModal(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                                <FiX />
                            </button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 500 }}>URL รูปภาพ *</label>
                            <input
                                type="url"
                                value={newImageUrl}
                                onChange={e => setNewImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 500 }}>คำอธิบาย (ไม่บังคับ)</label>
                            <input
                                type="text"
                                value={newImageCaption}
                                onChange={e => setNewImageCaption(e.target.value)}
                                placeholder="เช่น รูปครุภัณฑ์"
                                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                            />
                        </div>
                        {newImageUrl && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>ตัวอย่าง</div>
                                <div style={{ width: '160px', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                    <img src={newImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setImageModal(null)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleAddImage} disabled={!newImageUrl} style={{ padding: '10px 20px', background: newImageUrl ? '#2d7a32' : '#9ca3af', color: '#fff', border: 'none', borderRadius: '8px', cursor: newImageUrl ? 'pointer' : 'not-allowed', fontWeight: 500 }}>เพิ่มรูป</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="section-icon"><FiTool /></div>
                    <div>
                        <h2 className="section-title">ครุภัณฑ์โครงการงบยุทธศาสตร์การพัฒนาจังหวัด</h2>
                        <p className="section-subtitle">รายการที่มีจริง {assets.length} รายการ (จากแบบฟอร์ม 19 รายการ)</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isLoggedIn && (
                        isEditing ? (
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
                        )
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

                        {/* Images Section */}
                        {isEditing && (
                            <div style={{ marginLeft: '44px', marginTop: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <FiImage style={{ color: '#6b7280' }} />
                                    <span style={{ fontSize: '14px', color: '#6b7280' }}>รูปภาพ ({item.images?.length || 0})</span>
                                    <button
                                        onClick={() => setImageModal({ assetId: item.id })}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 10px', background: '#f0fdf4', color: '#16a34a',
                                            border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                                        }}
                                    >
                                        <FiPlus size={12} /> เพิ่มรูป
                                    </button>
                                </div>
                                {item.images && item.images.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {item.images.map((img, imgIdx) => (
                                            <div key={imgIdx} style={{ position: 'relative', width: '80px', height: '60px' }}>
                                                <img
                                                    src={img.url}
                                                    alt={img.caption || `Image ${imgIdx + 1}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                                />
                                                <button
                                                    onClick={() => handleRemoveImage(item.id, imgIdx)}
                                                    style={{
                                                        position: 'absolute', top: '-6px', right: '-6px',
                                                        width: '20px', height: '20px', borderRadius: '50%',
                                                        background: '#ef4444', color: 'white', border: 'none',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', fontSize: '10px'
                                                    }}
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Display Images (View Mode) */}
                        {!isEditing && item.images && item.images.length > 0 && (
                            <div style={{ marginLeft: '44px', marginTop: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {item.images.map((img, imgIdx) => (
                                        <div
                                            key={imgIdx}
                                            onClick={() => setLightboxImage(img)}
                                            style={{ width: '100px', height: '75px', cursor: 'pointer', transition: 'transform 0.2s' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.caption || `Image ${imgIdx + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
