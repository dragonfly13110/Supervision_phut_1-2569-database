import { FiFileText } from 'react-icons/fi'
import { policyItems } from '../data/assetData'

export function SectionPolicy() {
    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiFileText /></div>
                <div>
                    <h2 className="section-title">ส่วนที่ 2: นโยบายและโครงการสำคัญ</h2>
                    <p className="section-subtitle">นโยบาย 6+3 และ 11 Quick Win</p>
                </div>
            </div>

            <div className="notes-box">
                <span className="notes-icon">📋</span>
                <div className="notes-text">
                    <strong>แนวทางการรายงาน</strong>
                    รายงานผลการดำเนินงาน ปัญหา และแผนงานในแต่ละข้อย่อย
                </div>
            </div>

            <div className="policy-grid">
                {policyItems.map((item) => (
                    <div className="policy-card" key={item.id}>
                        <div className="policy-number">{item.id}</div>
                        <div className="policy-title">{item.title}</div>
                        <div className="policy-placeholder">
                            รอกรอกผลการดำเนินงาน ปัญหา และแผนงาน...
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
