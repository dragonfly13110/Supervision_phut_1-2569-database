import { useRef, useEffect, useState } from 'react'
import { FiDollarSign, FiFileText, FiUsers, FiChevronDown, FiChevronsLeft, FiChevronsRight, FiChevronUp, FiChevronDown as FiScrollDown, FiEdit2, FiSave, FiX } from 'react-icons/fi'
import { TbReportMoney } from "react-icons/tb";
import { policyProjects, detailedBudgetProjects } from '../data/assetData'

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

    // Reordering Logic
    const [projects, setProjects] = useState(detailedBudgetProjects)
    const [isEditMode, setIsEditMode] = useState(false)

    // Sync projects if source changes (optional, but good practice if data was dynamic)
    useEffect(() => {
        setProjects(detailedBudgetProjects)
    }, [])

    const moveProject = (index: number, direction: 'up' | 'down') => {
        const newProjects = [...projects]
        if (direction === 'up') {
            if (index === 0) return
            [newProjects[index - 1], newProjects[index]] = [newProjects[index], newProjects[index - 1]]
        } else {
            if (index === newProjects.length - 1) return
            [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]]
        }
        setProjects(newProjects)
    }

    const handleSaveOrder = () => {
        console.log('Saved Order:', JSON.stringify(projects, null, 4))
        alert('บันทึกลำดับเรียบร้อย! (ตรวจสอบใน Console สำหรับ JSON ใหม่)')
        setIsEditMode(false)
    }

    const handleCancelOrder = () => {
        setProjects(detailedBudgetProjects)
        setIsEditMode(false)
    }

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
                        <div className="nav-section-icon"><TbReportMoney /></div>
                        <div className="nav-section-title">ส่วนที่ 2: ข้อมูลโครงการงบประมาณ 69</div>
                        {isEditMode ? (
                            <div className="sidebar-actions" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '5px', marginLeft: 'auto', marginRight: '5px' }}>
                                <button
                                    onClick={handleSaveOrder}
                                    style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', padding: '2px' }}
                                    title="บันทึก"
                                >
                                    <FiSave />
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                                    title="ยกเลิก"
                                >
                                    <FiX />
                                </button>
                            </div>
                        ) : (
                            <div className="sidebar-actions" onClick={(e) => {
                                e.stopPropagation()
                                setIsEditMode(true)
                                if (expandedNav !== 'section2') onToggleNav('section2')
                            }} style={{ marginLeft: 'auto', marginRight: '5px', opacity: 0.5, cursor: 'pointer' }}>
                                <FiEdit2 size={14} />
                            </div>
                        )}
                        <FiChevronDown className={`nav-section-arrow ${expandedNav === 'section2' ? 'expanded' : ''}`} />
                    </div>
                    <div className={`nav-items ${expandedNav === 'section2' ? 'expanded' : ''}`}>
                        {projects.map((project, index) => {
                            const isActive = activeSection === `section2-${project.id}`;
                            return (
                                <div
                                    key={project.id}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => !isEditMode && onNavigateTo(`section2-${project.id}`)}
                                    title={project.title}
                                    style={{
                                        fontSize: '0.85rem',
                                        lineHeight: '1.3',
                                        lineHeight: '1.3',
                                        padding: '8px 12px 8px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: isEditMode ? 'default' : 'pointer'
                                    }}
                                >
                                    <div style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        flex: 1
                                    }}>
                                        {project.title}
                                    </div>
                                    {isEditMode && (
                                        <div className="item-actions" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '5px' }} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => moveProject(index, 'up')}
                                                disabled={index === 0}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                                    cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1,
                                                    fontSize: '10px', padding: '1px 4px', borderRadius: '2px'
                                                }}
                                            >
                                                ▲
                                            </button>
                                            <button
                                                onClick={() => moveProject(index, 'down')}
                                                disabled={index === projects.length - 1}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                                    cursor: index === projects.length - 1 ? 'default' : 'pointer', opacity: index === projects.length - 1 ? 0.3 : 1,
                                                    fontSize: '10px', padding: '1px 4px', borderRadius: '2px'
                                                }}
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
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
