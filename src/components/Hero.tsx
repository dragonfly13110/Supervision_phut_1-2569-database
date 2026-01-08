import { FiCalendar, FiMapPin } from 'react-icons/fi'

export function Hero() {
    return (
        <section className="hero">
            <div className="hero-content">
                <div className="hero-badge">
                    <FiCalendar /> ปีงบประมาณ พ.ศ. 2569 ครั้งที่ 1
                </div>
                <h1 className="hero-title">
                    แผนนิเทศงานตามระบบส่งเสริมการเกษตร<br />
                    (T&V System)
                </h1>
                <p className="hero-subtitle">
                    Training and Visit System - ระบบการส่งเสริมการเกษตรแบบฝึกอบรมและเยี่ยมเยียน
                </p>
                <div className="hero-org">
                    <div className="hero-org-icon"><FiMapPin /></div>
                    สำนักงานเกษตรอำเภอพุทธมณฑล จังหวัดนครปฐม
                </div>
            </div>
        </section>
    )
}
