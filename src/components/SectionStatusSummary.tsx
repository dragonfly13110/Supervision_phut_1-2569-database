import { useState, useEffect } from 'react';
import detailedBudgetProjectsData from '../data/detailedBudgetProjects.json';
import { FaCheck, FaClock, FaCircle, FaFilter, FaChartPie } from 'react-icons/fa';

interface DetailedProject {
    name: string;
    subActivity: string;
    relevantPolicies?: string;
    target: string;
    budget: string;
    result: string;
    problem: string;
    solution: string;
    status?: 'pending' | 'in_progress' | 'completed';
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
    const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>(detailedBudgetProjectsData as BudgetGroup[]);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Load from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('detailedBudgetProjects');
        if (savedData) {
            setBudgetGroups(JSON.parse(savedData));
        }
    }, []);

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
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                {/* Total */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #cbd5e1'
                }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>
                        <FaChartPie style={{ marginRight: '6px' }} /> กิจกรรมทั้งหมด
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                        {stats.total}
                    </div>
                </div>

                {/* Completed */}
                <div style={{
                    background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #86efac',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    transform: filterStatus === 'completed' ? 'scale(1.02)' : 'scale(1)'
                }} onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}>
                    <div style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '8px' }}>
                        <FaCheck style={{ marginRight: '6px' }} /> เสร็จแล้ว
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#166534' }}>
                        {stats.completed}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '4px' }}>
                        {completionRate}% ของทั้งหมด
                    </div>
                </div>

                {/* In Progress */}
                <div style={{
                    background: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #facc15',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    transform: filterStatus === 'in_progress' ? 'scale(1.02)' : 'scale(1)'
                }} onClick={() => setFilterStatus(filterStatus === 'in_progress' ? 'all' : 'in_progress')}>
                    <div style={{ fontSize: '0.9rem', color: '#a16207', marginBottom: '8px' }}>
                        <FaClock style={{ marginRight: '6px' }} /> กำลังดำเนินการ
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#a16207' }}>
                        {stats.inProgress}
                    </div>
                </div>

                {/* Pending */}
                <div style={{
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    transform: filterStatus === 'pending' ? 'scale(1.02)' : 'scale(1)'
                }} onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>
                        <FaCircle style={{ marginRight: '6px' }} /> ยังไม่เริ่ม
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#64748b' }}>
                        {stats.pending}
                    </div>
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
                    กำลังแสดง: {filterStatus === 'completed' ? 'เสร็จแล้ว' : filterStatus === 'in_progress' ? 'กำลังดำเนินการ' : 'ยังไม่เริ่ม'}
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
            <div style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
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
                                        background: project.status === 'completed' ? '#dcfce7' : project.status === 'in_progress' ? '#fef9c3' : '#f1f5f9',
                                        color: project.status === 'completed' ? '#166534' : project.status === 'in_progress' ? '#a16207' : '#64748b',
                                        border: `1px solid ${project.status === 'completed' ? '#bbf7d0' : project.status === 'in_progress' ? '#fde047' : '#e2e8f0'}`
                                    }}>
                                        {project.status === 'completed' ? <><FaCheck size={12} /> เสร็จแล้ว</> :
                                            project.status === 'in_progress' ? <><FaClock size={12} /> กำลังดำเนินการ</> :
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
