import { FiDollarSign, FiFileText, FiUsers, FiChevronDown } from 'react-icons/fi'

interface SidebarProps {
    sidebarOpen: boolean
    activeSection: string
    expandedNav: string | null
    onToggleNav: (section: string) => void
    onNavigateTo: (section: string) => void
}

export function Sidebar({ sidebarOpen, activeSection, expandedNav, onToggleNav, onNavigateTo }: SidebarProps) {
    return (
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">🌾</div>
                <div className="sidebar-title">
                    <strong>แผนนิเทศงาน T&V System</strong>
                    ปีงบประมาณ พ.ศ. 2569 ครั้งที่ 1
                </div>
            </div>

            <nav className="sidebar-nav">
                {/* Section 1 */}
                <div className="nav-section">
                    <div
                        className={`nav-section-header ${activeSection.startsWith('section1') ? 'active' : ''}`}
                        onClick={() => onToggleNav('section1')}
                    >
                        <div className="nav-section-icon"><FiDollarSign /></div>
                        <div className="nav-section-title">ส่วนที่ 1: งบประมาณและทรัพย์สิน</div>
                        <FiChevronDown className={`nav-section-arrow ${expandedNav === 'section1' ? 'expanded' : ''}`} />
                    </div>
                    <div className={`nav-items ${expandedNav === 'section1' ? 'expanded' : ''}`}>
                        <div
                            className={`nav-item ${activeSection === 'section1-budget' ? 'active' : ''}`}
                            onClick={() => onNavigateTo('section1-budget')}
                        >
                            การเบิกจ่ายงบประมาณ
                        </div>
                        <div
                            className={`nav-item ${activeSection === 'section1-assets' ? 'active' : ''}`}
                            onClick={() => onNavigateTo('section1-assets')}
                        >
                            การตรวจสอบสินทรัพย์
                        </div>
                        <div
                            className={`nav-item ${activeSection === 'section1-equipment' ? 'active' : ''}`}
                            onClick={() => onNavigateTo('section1-equipment')}
                        >
                            ครุภัณฑ์งบยุทธศาสตร์ (11 รายการ)
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="nav-section">
                    <div
                        className={`nav-section-header ${activeSection.startsWith('section2') ? 'active' : ''}`}
                        onClick={() => onToggleNav('section2')}
                    >
                        <div className="nav-section-icon"><FiFileText /></div>
                        <div className="nav-section-title">ส่วนที่ 2: นโยบายและโครงการ</div>
                        <FiChevronDown className={`nav-section-arrow ${expandedNav === 'section2' ? 'expanded' : ''}`} />
                    </div>
                    <div className={`nav-items ${expandedNav === 'section2' ? 'expanded' : ''}`}>
                        <div
                            className={`nav-item ${activeSection === 'section2' ? 'active' : ''}`}
                            onClick={() => onNavigateTo('section2')}
                        >
                            นโยบาย 6+3 และ 11 Quick Win
                        </div>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="nav-section">
                    <div
                        className={`nav-section-header ${activeSection.startsWith('section3') ? 'active' : ''}`}
                        onClick={() => onToggleNav('section3')}
                    >
                        <div className="nav-section-icon"><FiUsers /></div>
                        <div className="nav-section-title">ส่วนที่ 3: กลุ่มงานและอื่นๆ</div>
                        <FiChevronDown className={`nav-section-arrow ${expandedNav === 'section3' ? 'expanded' : ''}`} />
                    </div>
                    <div className={`nav-items ${expandedNav === 'section3' ? 'expanded' : ''}`}>
                        <div
                            className={`nav-item ${activeSection === 'section3-groups' ? 'active' : ''}`}
                            onClick={() => onNavigateTo('section3-groups')}
                        >
                            รายงานจากกลุ่มงาน
                        </div>
                        <div
                            className={`nav-item ${activeSection === 'section3-other' ? 'active' : ''}`}
                            onClick={() => onNavigateTo('section3-other')}
                        >
                            ประเด็นอื่นๆ
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    )
}
