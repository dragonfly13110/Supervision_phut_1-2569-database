import { FiUsers, FiImage } from 'react-icons/fi'
import { groupReports } from '../data/assetData'

// Helper function to get status color
const getStatusStyle = (status: string) => {
    if (status.includes('แล้ว')) {
        return { background: '#dcfce7', color: '#166534' }
    } else if (status.includes('ล่าช้า') || status.includes('เฝ้าระวัง')) {
        return { background: '#fef3c7', color: '#92400e' }
    } else if (status.includes('จัดซื้อ') || status.includes('กำลัง') || status.includes('เตรียม')) {
        return { background: '#dbeafe', color: '#1e40af' }
    } else {
        return { background: '#f3f4f6', color: '#4b5563' }
    }
}

export function SectionGroupReports() {
    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiUsers /></div>
                <div>
                    <h2 className="section-title">ส่วนที่ 3: รายงานจากกลุ่มงาน</h2>
                    <p className="section-subtitle">ผลการดำเนินงานของแต่ละกลุ่มงาน (จากไฟล์ T&V 2568)</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {groupReports.map((group) => (
                    <div
                        key={group.id}
                        className="card"
                        style={{ padding: '24px' }}
                    >
                        {/* Group Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px',
                            paddingBottom: '16px',
                            borderBottom: '2px solid #e5e7eb'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #2d7a32 0%, #1a5a22 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                            }}>
                                {group.icon}
                            </div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#1a5a22',
                                margin: 0
                            }}>
                                {group.groupName}
                            </h3>
                        </div>

                        {/* Responsibilities */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {group.responsibilities.map((item: { topic: string; detail: string; status: string; images?: { url: string; caption?: string }[] }, idx: number) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#f9fafb',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        borderLeft: '4px solid #2d7a32'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#1f2937',
                                            margin: 0
                                        }}>
                                            📌 {item.topic}
                                        </h4>
                                        <span style={{
                                            ...getStatusStyle(item.status),
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#4b5563',
                                        lineHeight: 1.6,
                                        margin: 0,
                                        marginBottom: '12px'
                                    }}>
                                        {item.detail}
                                    </p>

                                    {/* Image Gallery for each task */}
                                    <div style={{ marginTop: '12px' }}>
                                        {item.images && item.images.length > 0 ? (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                                gap: '10px'
                                            }}>
                                                {item.images.map((img, imgIdx) => (
                                                    <div key={imgIdx} style={{
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        border: '1px solid #e5e7eb',
                                                        background: '#fff'
                                                    }}>
                                                        <img
                                                            src={img.url}
                                                            alt={img.caption || `ภาพที่ ${imgIdx + 1}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '120px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        {img.caption && (
                                                            <div style={{
                                                                padding: '6px 10px',
                                                                fontSize: '11px',
                                                                color: '#6b7280',
                                                                background: '#f9fafb'
                                                            }}>
                                                                {img.caption}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                gap: '10px'
                                            }}>
                                                {[1, 2].map((n) => (
                                                    <div key={n} style={{
                                                        width: '120px',
                                                        height: '80px',
                                                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                                        borderRadius: '8px',
                                                        border: '2px dashed #d1d5db',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '4px',
                                                        color: '#9ca3af',
                                                        flexShrink: 0
                                                    }}>
                                                        <FiImage size={20} />
                                                        <span style={{ fontSize: '10px' }}>รอใส่รูป</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
