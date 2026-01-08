import { FiDollarSign, FiTrendingUp, FiPackage } from 'react-icons/fi'

export function SectionBudget() {
    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiDollarSign /></div>
                <div>
                    <h2 className="section-title">หัวข้อที่ 1: การเบิกจ่ายงบประมาณ</h2>
                    <p className="section-subtitle">ตัดยอดตามความก้าวหน้าปัจจุบัน</p>
                </div>
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
                                <div className="list-item-desc">รอกรอกข้อมูล...</div>
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
                            { title: 'ค่าสาธารณูปโภค', desc: 'ค่าน้ำ/ค่าไฟ' },
                            { title: 'ค่าเช่าบ้าน', desc: 'รอกรอกข้อมูล...' },
                            { title: 'ค่าจ้างเหมาบริการ', desc: 'รอกรอกข้อมูล...' },
                            { title: 'เบี้ยเลี้ยง/ค่าเดินทาง', desc: 'รอกรอกข้อมูล...' },
                        ].map((item, idx) => (
                            <div className="list-item" key={idx}>
                                <div className="list-item-number">{idx + 1}</div>
                                <div className="list-item-content">
                                    <div className="list-item-title">{item.title}</div>
                                    <div className="list-item-desc">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
