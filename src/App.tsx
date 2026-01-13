import { useState } from 'react'
import { FiMenu, FiX, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi'

// Components
import { Hero } from './components/Hero'
import { Sidebar } from './components/Sidebar'
import { SectionBudget } from './components/SectionBudget'
import { SectionAssets } from './components/SectionAssets'
import { SectionEquipment } from './components/SectionEquipment'
import { SectionOther } from './components/SectionOther'
import { SectionBudgetDetailed } from './components/SectionBudgetDetailed'
import { SectionStatusSummary } from './components/SectionStatusSummary'
import { SectionDashboard } from './components/SectionDashboard'
import { SectionCalendar } from './components/SectionCalendar'
import { SearchFilter } from './components/SearchFilter'
import { Footer } from './components/Footer'
import { AuthProvider, useAuth } from './components/AuthContext'
import { LoginModal } from './components/LoginModal'

function AppContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('section1')
    const [expandedNav, setExpandedNav] = useState<string | null>('section1')

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(300)

    const [showLoginModal, setShowLoginModal] = useState(false)
    const { isLoggedIn, logout } = useAuth()

    const toggleNav = (section: string) => {
        setExpandedNav(expandedNav === section ? null : section)
    }

    const navigateTo = (section: string) => {
        setActiveSection(section)
        if (window.innerWidth <= 768) {
            setSidebarOpen(false)
        }
    }

    return (
        <div className="app-container">
            {/* Login Modal */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

            {/* Admin Login Button - Fixed Position */}
            <div style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                zIndex: 1000,
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
            }}>
                {isLoggedIn ? (
                    <>
                        <span style={{
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <FiUser size={14} /> ผู้ดูแลระบบ
                        </span>
                        <button
                            onClick={logout}
                            style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FiLogOut size={14} /> ออกจากระบบ
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setShowLoginModal(true)}
                        style={{
                            background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 12px rgba(22, 101, 52, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FiLogIn size={16} /> เข้าสู่ระบบ
                    </button>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                activeSection={activeSection}
                expandedNav={expandedNav}
                onToggleNav={toggleNav}
                onNavigateTo={navigateTo}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                width={sidebarWidth}
                setWidth={setSidebarWidth}
            />

            {/* Main Content */}
            <main
                className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}
                style={!isSidebarCollapsed ? { marginLeft: sidebarWidth } : {}}
            >
                {/* Search Bar */}
                <div className="main-search-wrapper">
                    <SearchFilter onNavigate={navigateTo} />
                </div>

                <Hero />

                {/* Dashboard */}
                {activeSection === 'dashboard' && (
                    <SectionDashboard />
                )}

                {/* Calendar */}
                {activeSection === 'calendar' && (
                    <SectionCalendar />
                )}

                {/* Section 1: Budget */}
                {(activeSection === 'section1' || activeSection === 'section1-budget') && (
                    <SectionBudget />
                )}

                {/* Section 1: Assets */}
                {activeSection === 'section1-assets' && (
                    <SectionAssets />
                )}

                {/* Section 1: Equipment */}
                {activeSection === 'section1-equipment' && (
                    <SectionEquipment />
                )}

                {/* Section 2: Detailed Budget */}
                {activeSection.startsWith('section2') && (
                    <SectionBudgetDetailed activeSection={activeSection} />
                )}

                {/* Section 3: Other */}
                {(activeSection === 'section3' || activeSection === 'section3-other') && (
                    <SectionOther />
                )}

                {/* Status Summary - ใน Section 2 */}
                {activeSection === 'section2-status' && (
                    <SectionStatusSummary />
                )}


                <Footer />
            </main>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App

