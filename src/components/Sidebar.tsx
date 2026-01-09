import { useRef, useEffect, useState } from 'react'
import { FiDollarSign, FiFileText, FiUsers, FiChevronDown, FiChevronsLeft, FiChevronsRight, FiChevronUp, FiChevronDown as FiScrollDown } from 'react-icons/fi'
import { policyProjects } from '../data/assetData'

interface SidebarProps {
    sidebarOpen: boolean
    activeSection: string
    expandedNav: string | null
    onToggleNav: (section: string) => void
    onNavigateTo: (section: string) => void
    isCollapsed: boolean
    onToggleCollapse: () => void
    width?: number
    setWidth?: (width: number) => void
}

export function Sidebar({ sidebarOpen, activeSection, expandedNav, onToggleNav, onNavigateTo, isCollapsed, onToggleCollapse, width = 300, setWidth }: SidebarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null)
    const navRef = useRef<HTMLDivElement>(null)
    const [isResizing, setIsResizing] = useState(false)
    const [showScrollUp, setShowScrollUp] = useState(false)
    const [showScrollDown, setShowScrollDown] = useState(false)

    // Resize Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !setWidth) return
            const newWidth = Math.min(Math.max(e.clientX, 240), 600)
            setWidth(newWidth)
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            document.body.style.cursor = 'default'
        }

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'col-resize'
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing, setWidth])

    // Scroll Logic
    const checkScroll = () => {
        if (!navRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = navRef.current
        setShowScrollUp(scrollTop > 0)
        setShowScrollDown(scrollTop + clientHeight < scrollHeight - 10)
    }

    useEffect(() => {
        const nav = navRef.current
        if (nav) {
            nav.addEventListener('scroll', checkScroll)
            checkScroll()
            window.addEventListener('resize', checkScroll)
        }
        return () => {
            if (nav) nav.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [expandedNav, isCollapsed, width])

    const scrollNav = (direction: 'up' | 'down') => {
        if (navRef.current) {
            navRef.current.scrollBy({ top: direction === 'up' ? -100 : 100, behavior: 'smooth' })
        }
    }

    return (
        <aside
            ref={sidebarRef}
            className={`sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            style={!isCollapsed ? { width: width } : {}}
        >
            <div className="sidebar-header">
                <div className="sidebar-logo">🌾</div>
                <div className="sidebar-title">
                    <strong>แผนนิเทศงาน T&V System</strong>
                    ปีงบประมาณ พ.ศ. 2569 ครั้งที่ 1
                </div>
            </div>

            <nav className="sidebar-nav" ref={navRef} style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
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
                            ภาพรวมนโยบาย
                        </div>
                        {policyProjects.map(policy => {
                            const hasContent = policy.projects.length > 0
                            const isActive = activeSection === `section2-${policy.id}`

                            return (
                                <div
                                    key={policy.id}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => onNavigateTo(`section2-${policy.id}`)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: hasContent ? '#d1fae5' : '#fcd34d',
                                        fontSize: '13px'
                                    }}
                                >
                                    <div style={{
                                        minWidth: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: hasContent ? '#34d399' : '#fbbf24'
                                    }} />
                                    <span style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {policy.id}. {policy.title}
                                    </span>
                                </div>
                            )
                        })}
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

            {/* Scroll Buttons */}
            {!isCollapsed && showScrollUp && (
                <button
                    className="scroll-btn up"
                    onClick={() => scrollNav('up')}
                    style={{
                        position: 'absolute', top: '130px', left: '50%', transform: 'translateX(-50%)',
                        zIndex: 20
                    }}
                >
                    <FiChevronUp />
                </button>
            )}

            {!isCollapsed && showScrollDown && (
                <button
                    className="scroll-btn down"
                    onClick={() => scrollNav('down')}
                    style={{
                        position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
                        zIndex: 20
                    }}
                >
                    <FiScrollDown />
                </button>
            )}

            {/* Collapse Toggle */}
            <button
                className="sidebar-collapse-btn"
                onClick={onToggleCollapse}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    zIndex: 20
                }}
            >
                {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
            </button>

            {/* Resize Handle */}
            {!isCollapsed && (
                <div
                    className="resize-handle"
                    onMouseDown={() => setIsResizing(true)}
                />
            )}
        </aside>
    )
}
