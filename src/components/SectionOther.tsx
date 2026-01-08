import { FiAlertTriangle } from 'react-icons/fi'

export function SectionOther() {
    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiAlertTriangle /></div>
                <div>
                    <h2 className="section-title">หัวข้อที่ 5: ประเด็นที่เกี่ยวข้อง / เรื่องอื่นๆ</h2>
                    <p className="section-subtitle">ปัญหาอุปสรรคและเรื่องที่ต้องการปรึกษา</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-icon"><FiAlertTriangle /></div>
                    <h3 className="card-title">ปัญหาอุปสรรคอื่นๆ หรือเรื่องที่อยากปรึกษาทีมคณะนิเทศ</h3>
                </div>
                <div className="card-content">
                    <div className="policy-placeholder">
                        รอกรอกประเด็นปัญหาและข้อเสนอแนะ...
                    </div>
                </div>
            </div>
        </section>
    )
}
