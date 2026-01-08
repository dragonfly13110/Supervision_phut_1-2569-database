import { FiUsers, FiShield, FiHome } from 'react-icons/fi'
import { GiPlantWatering, GiFarmer } from 'react-icons/gi'
import { departments } from '../data/assetData'

// Map icon names to components
const iconMap: Record<number, React.ReactNode> = {
    0: <GiFarmer />,
    1: <GiPlantWatering />,
    2: <FiShield />,
    3: <FiHome />,
}

export function SectionDepartments() {
    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiUsers /></div>
                <div>
                    <h2 className="section-title">หัวข้อที่ 4: รายงานจากกลุ่มงานต่างๆ</h2>
                    <p className="section-subtitle">ตามโครงสร้างสำนักงานจังหวัด</p>
                </div>
            </div>

            <div className="department-grid">
                {departments.map((dept, idx) => (
                    <div className="department-card" key={idx}>
                        <div className="department-icon">{iconMap[idx]}</div>
                        <h3 className="department-name">{dept.name}</h3>
                        <p className="department-desc">{dept.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
