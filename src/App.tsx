import { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'

// Components
import { Hero } from './components/Hero'
import { Sidebar } from './components/Sidebar'
import { SectionBudget } from './components/SectionBudget'
import { SectionAssets } from './components/SectionAssets'
import { SectionEquipment } from './components/SectionEquipment'
// import { SectionPolicy } from './components/SectionPolicy' // Unused
import { SectionGroupReports } from './components/SectionGroupReports'
import { SectionOther } from './components/SectionOther'
import { SectionBudgetDetailed } from './components/SectionBudgetDetailed'
import { Footer } from './components/Footer'

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('section1')
    const [expandedNav, setExpandedNav] = useState<string | null>('section1')

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(300)

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
                <Hero />

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

                {/* Section 3: Group Reports */}
                {(activeSection === 'section3' || activeSection === 'section3-groups') && (
                    <SectionGroupReports />
                )}

                {/* Section 3: Other */}
                {activeSection === 'section3-other' && (
                    <SectionOther />
                )}


                <Footer />
            </main>
        </div>
    )
}

export default App
