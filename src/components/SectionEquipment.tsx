import { FiTool } from 'react-icons/fi'
import { projectAssets } from '../data/assetData'

export function SectionEquipment() {
    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiTool /></div>
                <div>
                    <h2 className="section-title">ครุภัณฑ์โครงการงบยุทธศาสตร์การพัฒนาจังหวัด</h2>
                    <p className="section-subtitle">รายการที่มีจริง 11 รายการ (จากแบบฟอร์ม 19 รายการ)</p>
                </div>
            </div>

            <div className="equipment-grid">
                {projectAssets.map((item) => (
                    <div className="equipment-card" key={item.id} style={{ flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div className="equipment-number">{item.formOrder}</div>
                            <div className="equipment-info">
                                <div className="equipment-name">{item.name}</div>
                                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                    จำนวน: <strong>{item.amount}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="equipment-status" style={{ marginLeft: '44px' }}>
                            <span className={`status-badge ${item.status}`}>{item.statusText}</span>
                        </div>
                        {item.problem !== '-' && (
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
