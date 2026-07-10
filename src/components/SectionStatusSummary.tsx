import { useState, useEffect } from 'react';
import detailedBudgetProjectsDataRound1 from '../data/detailedBudgetProjects.json';
import detailedBudgetProjectsDataRound2 from '../data/detailedBudgetProjects.round2.json';
import { FaCheck, FaClock, FaCircle, FaFilter, FaChartPie, FaCalendarAlt } from 'react-icons/fa';
import { useRound } from './RoundContext';


interface DetailedProject {
    name: string;
    subActivity: string;
    relevantPolicies?: string;
    target: string;
    budget: string;
    result: string;
    problem: string;
    solution: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'scheduled';
    images?: { url: string; caption?: string }[];
}

interface BudgetGroup {
    id: string;
    title: string;
    strategicIssues?: string[];
    projects: DetailedProject[];
}

// Helper: strip leading numbers
const stripActivityNumber = (name: string): string => {
    return name.replace(/(กิจกรรม:\s*)[\d.]+\s*/i, '$1');
};

export function SectionStatusSummary() {
    const { selectedRound } = useRound();
    const defaultData = selectedRound === 'round1' ? detailedBudgetProjectsDataRound1 : detailedBudgetProjectsDataRound2;
    const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>(defaultData as BudgetGroup[]);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Load from localStorage on mount and when round changes
    useEffect(() => {
        const key = selectedRound === 'round1' ? 'detailedBudgetProjects' : 'detailedBudgetProjects_round2';
        const savedData = localStorage.getItem(key);
        if (savedData) {
            setBudgetGroups(JSON.parse(savedData));
        } else {
            setBudgetGroups(defaultData as BudgetGroup[]);
        }
    }, [selectedRound]);


    // Flatten all projects with group info
    const allProjects = budgetGroups.flatMap(group =>
        group.projects.map((project, index) => ({
            ...project,
            groupId: group.id,
            groupTitle: group.title,
            projectIndex: index
        }))
    );

    // Filter projects
    const filteredProjects = filterStatus === 'all'
        ? allProjects
        : allProjects.filter(p => (p.status || 'pending') === filterStatus);

    // Calculate stats
    const stats = {
        total: allProjects.length,
        completed: allProjects.filter(p => p.status === 'completed').length,
        inProgress: allProjects.filter(p => p.status === 'in_progress').length,
        scheduled: allProjects.filter(p => p.status === 'scheduled').length,
        pending: allProjects.filter(p => !p.status || p.status === 'pending').length
    };

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <div className="section-container fade-in">
            <div className="section-header">
                <div className="header-content">
                    <h2 style={{ fontSize: '1.4rem' }}>สรุปสถานะการดำเนินงานกิจกรรม</h2>
                    <p className="subtitle" style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '8px' }}>
                        ติดตามความก้าวหน้าของกิจกรรมทั้งหมด
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards-grid" style={{ marginBottom: '24px' }}>
                {/* Total */}
                <div className="status-summary-card">
                    <div className="label">
                        <FaChartPie /> กิจกรรมทั้งหมด
                    </div>
                    <div className="value">{stats.total}</div>
                </div>

                {/* Completed */}
                <div
                    className={`status-summary-card completed ${filterStatus === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="label">
                        <FaCheck /> เสร็จแล้ว
                    </div>
                    <div className="value">{stats.completed}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.85 }}>
                        {completionRate}% ของทั้งหมด
                    </div>
                </div>

                {/* In Progress */}
                <div
                    className={`status-summary-card in-progress ${filterStatus === 'in_progress' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'in_progress' ? 'all' : 'in_progress')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="label">
                        <FaClock /> กำลังดำเนินการ
                    </div>
                    <div className="value">{stats.inProgress}</div>
                </div>

                {/* Scheduled */}
                <div
                    className={`status-summary-card scheduled ${filterStatus === 'scheduled' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'scheduled' ? 'all' : 'scheduled')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="label">
                        <FaCalendarAlt /> กำหนดวันแล้ว
                    </div>
                    <div className="value">{stats.scheduled}</div>
                </div>

                {/* Pending */}
                <div
                    className={`status-summary-card pending ${filterStatus === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="label">
                        <FaCircle /> ยังไม่เริ่ม
                    </div>
                    <div className="value">{stats.pending}</div>
                </div>
            </div>

            {/* Filter Info */}
            {filterStatus !== 'all' && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '0.9rem',
                    color: '#475569'
                }}>
                    <FaFilter size={12} />
                    กำลังแสดง: {filterStatus === 'completed' ? 'เสร็จแล้ว' : filterStatus === 'in_progress' ? 'กำลังดำเนินการ' : filterStatus === 'scheduled' ? 'กำหนดวันแล้ว' : 'ยังไม่เริ่ม'}
                    <button
                        onClick={() => setFilterStatus('all')}
                        style={{
                            marginLeft: 'auto',
                            background: '#e2e8f0',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        แสดงทั้งหมด
                    </button>
                </div>
            )}

            {/* Activities Table */}
            <div className="responsive-table-wrapper" style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0', width: '50px' }}>#</th>
                            <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>โครงการ / กิจกรรม</th>
                            <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0', width: '120px' }}>งบประมาณ</th>
                            <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0', width: '150px' }}>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project, idx) => (
                            <tr key={`${project.groupId}-${project.projectIndex}`} style={{
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.9rem' }}>{idx + 1}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#059669', marginBottom: '4px', fontWeight: 500 }}>
                                        {project.groupTitle}
                                    </div>
                                    <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.95rem' }}>
                                        {stripActivityNumber(project.name)}
                                    </div>
                                    {project.subActivity && (
                                        <div style={{ fontSize: '0.85rem', color: '#6366f1', marginTop: '4px', fontWeight: 400 }}>
                                            กิจกรรมย่อย: {project.subActivity}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.9rem' }}>
                                    {project.budget}
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        background: project.status === 'completed' ? '#dcfce7' : project.status === 'in_progress' ? '#fef9c3' : project.status === 'scheduled' ? '#dbeafe' : '#f1f5f9',
                                        color: project.status === 'completed' ? '#166534' : project.status === 'in_progress' ? '#a16207' : project.status === 'scheduled' ? '#1e40af' : '#64748b',
                                        border: `1px solid ${project.status === 'completed' ? '#bbf7d0' : project.status === 'in_progress' ? '#fde047' : project.status === 'scheduled' ? '#60a5fa' : '#e2e8f0'}`
                                    }}>
                                        {project.status === 'completed' ? <><FaCheck size={12} /> เสร็จแล้ว</> :
                                            project.status === 'in_progress' ? <><FaClock size={12} /> กำลังดำเนินการ</> :
                                                project.status === 'scheduled' ? <><FaCalendarAlt size={12} /> กำหนดวันแล้ว</> :
                                                    <><FaCircle size={10} /> ยังไม่เริ่ม</>}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProjects.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        ไม่พบกิจกรรม
                    </div>
                )}
            </div>
        </div>
    );
}
