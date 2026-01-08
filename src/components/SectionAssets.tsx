import { FiPackage, FiHome } from 'react-icons/fi'
import { generalAssets } from '../data/assetData'

export function SectionAssets() {
    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiPackage /></div>
                <div>
                    <h2 className="section-title">หัวข้อที่ 2: การตรวจสอบสินทรัพย์</h2>
                    <p className="section-subtitle">สินทรัพย์ของสำนักงานเกษตรอำเภอ</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-icon"><FiHome /></div>
                    <h3 className="card-title">สินทรัพย์ทั่วไป (4 รายการ)</h3>
                </div>
                <div className="card-content">
                    <div className="equipment-grid">
                        {generalAssets.map((asset) => (
                            <div className="equipment-card" key={asset.id}>
                                <div className="equipment-number">{asset.id}</div>
                                <div className="equipment-info">
                                    <div className="equipment-name">{asset.name}</div>
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                                        <strong>{asset.amount}</strong> | {asset.details}
                                    </div>
                                    <div className="equipment-status">
                                        <span className={`status-badge ${asset.status}`}>{asset.statusText}</span>
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
