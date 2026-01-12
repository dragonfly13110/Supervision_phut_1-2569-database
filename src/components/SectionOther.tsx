import { useState, useEffect } from 'react'
import { FiAlertTriangle, FiEdit2, FiSave, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi'
import { fetchSheetData, updateSheetData } from '../utils/sheetsApi'

interface OtherIssue {
    id: string
    title: string
    content: string
}

export function SectionOther() {
    const [issues, setIssues] = useState<OtherIssue[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load data from Google Sheets on mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await fetchSheetData<OtherIssue>('otherIssues')
            setIssues(data)
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถโหลดข้อมูลได้')
            console.error('Error loading data:', err)
        } finally {
            setIsLoading(false)
        }
    }

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

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateSheetData('otherIssues', issues)
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
                    <div className="section-icon"><FiAlertTriangle /></div>
                    <div>
                        <h2 className="section-title">หัวข้อที่ 5: ประเด็นที่เกี่ยวข้อง / เรื่องอื่นๆ</h2>
                        <p className="section-subtitle">ปัญหาอุปสรรคและเรื่องที่ต้องการปรึกษา</p>
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
