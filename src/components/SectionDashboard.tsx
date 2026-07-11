import { FiTrendingUp, FiCheckCircle, FiClock, FiCalendar, FiBarChart2, FiDollarSign, FiSettings, FiEdit2, FiActivity } from 'react-icons/fi';
import detailedBudgetProjectsDataRound1 from '../data/detailedBudgetProjects.json';
import detailedBudgetProjectsDataRound2 from '../data/detailedBudgetProjects.round2.json';
import budgetDataJsonRound1 from '../data/budgetData.json';
import budgetDataJsonRound2 from '../data/budgetData.round2.json';
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
    status?: 'pending' | 'scheduled' | 'in_progress' | 'completed';
    images?: { url: string; caption?: string }[];
}

interface BudgetGroup {
    id: string;
    title: string;
    strategicIssues?: string[];
    projects: DetailedProject[];
}

// Parse budget string to number
function parseBudget(budget: string): number {
    if (!budget || budget === '-') return 0;
    return parseFloat(budget.replace(/[^0-9.-]/g, '')) || 0;
}

// Format number with commas
function formatNumber(num: number): string {
    return num.toLocaleString('th-TH');
}

const getOperationLabel = (key: string) => {
    switch (key) {
        case 'utilities': return 'ค่าสาธารณูปโภค';
        case 'officeSupplies': return 'ค่าวัสดุสำนักงาน';
        case 'houseRent': return 'ค่าเช่าบ้าน';
        case 'service': return 'ค่าจ้างเหมาบริการ';
        case 'travel': return 'ค่าใช้สอยและเดินทาง';
        default: return key;
    }
};

export function SectionDashboard() {
    const { selectedRound } = useRound();
    
    const budgetGroups = (selectedRound === 'round1'
        ? detailedBudgetProjectsDataRound1
        : detailedBudgetProjectsDataRound2) as unknown as BudgetGroup[];

    const budgetDataJson = selectedRound === 'round1'
        ? budgetDataJsonRound1
        : budgetDataJsonRound2;


    // Calculate statistics
    const stats = (() => {
        let totalProjects = 0;
        let completed = 0;
        let inProgress = 0;
        let scheduled = 0;
        let pending = 0;
        let totalBudget = 0;

        budgetGroups.forEach(group => {
            group.projects.forEach(project => {
                totalProjects++;
                totalBudget += parseBudget(project.budget);

                switch (project.status) {
                    case 'completed':
                        completed++;
                        break;
                    case 'in_progress':
                        inProgress++;
                        break;
                    case 'scheduled':
                        scheduled++;
                        break;
                    default:
                        pending++;
                }
            });
        });

        // Budget from budgetData.json
        const getBudgetVal = (obj: any, key: string, prop: 'budget' | 'disbursed') => {
            if (obj && obj[key] && obj[key][prop]) {
                const val = obj[key][prop];
                return val === '-' ? 0 : parseFloat(val) || 0;
            }
            return 0;
        };

        const op = (budgetDataJson as any).operation || {};
        const operationBudget =
            getBudgetVal(op, 'utilities', 'budget') +
            getBudgetVal(op, 'officeSupplies', 'budget') +
            getBudgetVal(op, 'houseRent', 'budget') +
            getBudgetVal(op, 'service', 'budget') +
            getBudgetVal(op, 'travel', 'budget');

        const operationDisbursed =
            getBudgetVal(op, 'utilities', 'disbursed') +
            getBudgetVal(op, 'officeSupplies', 'disbursed') +
            getBudgetVal(op, 'houseRent', 'disbursed') +
            getBudgetVal(op, 'service', 'disbursed') +
            getBudgetVal(op, 'travel', 'disbursed');

        // Project budget (งบโครงการฯ)
        let projectBudget = 0;
        let projectDisbursed = 0;
        if (budgetDataJson.project) {
            Object.values(budgetDataJson.project).forEach((p: any) => {
                projectBudget += parseBudget(p.budget || '0');
                projectDisbursed += parseBudget(p.disbursed || '0');
            });
        }
        const projectPercent = projectBudget > 0 ? Math.round((projectDisbursed / projectBudget) * 100 * 10) / 10 : 0;


        return {
            totalProjects,
            completed,
            inProgress,
            scheduled,
            pending,
            totalBudget,
            operationBudget,
            operationDisbursed,
            projectBudget,
            projectDisbursed,
            projectPercent,
            completionRate: totalProjects > 0 ? Math.round((completed / totalProjects) * 100) : 0
        };
    })();

    // Recent activities (projects with results)
    const recentActivities = budgetGroups
        .flatMap(group => group.projects.map(p => ({ ...p, groupTitle: group.title })))
        .filter(p => p.result && p.result !== '-' && p.result.trim() !== '')
        .slice(0, 5);

    // Get status color
    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'in_progress': return '#3b82f6';
            case 'scheduled': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'completed': return 'เสร็จสิ้น';
            case 'in_progress': return 'กำลังดำเนินการ';
            case 'scheduled': return 'กำหนดวันแล้ว';
            default: return 'รอดำเนินการ';
        }
    };

    return (
        <section className="section section-container">
            <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="section-icon" style={{ background: '#10b981', color: 'white', padding: '10px', borderRadius: '12px' }}>
                        <FiDollarSign size={24} />
                    </div>
                    <div>
                        <h2 className="section-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>หัวข้อที่ 1: การเบิกจ่ายงบประมาณ</h2>
                        <p className="section-subtitle" style={{ color: '#6b7280' }}>ตัดยอดตามความก้าวหน้าปัจจุบัน</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{
                        background: '#e5e7eb',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4b5563',
                        cursor: 'pointer'
                    }}>
                        <FiSettings size={18} />
                    </button>
                    <button style={{
                        background: '#1f2937',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <FiEdit2 size={14} /> แก้ไขข้อมูล
                    </button>
                </div>
            </div>

            {/* Budget Overview Section - Matching user request */}
            <div className="card budget-overview-card" style={{
                background: 'white',
                backgroundColor: 'white',
                backgroundImage: 'none',
                border: '2px solid #10b981',
                borderRadius: '16px',
                color: '#1f2937',
                marginBottom: '24px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
            }}>
                <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                    <div className="card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FiBarChart2 /></div>
                    <h3 className="card-title" style={{ color: '#1f2937' }}>สรุปภาพรวมทั้งหมด</h3>
                </div>

                <div className="budget-summary-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    padding: '20px'
                }}>
                    {/* 1.1 Investment */}
                    <div className="budget-mini-card">
                        <div className="budget-mini-header">1.1 งบลงทุน</div>
                        <div className="budget-mini-labels">
                            <span>งบประมาณ</span>
                            <span>เบิกจ่าย</span>
                            <span>%</span>
                        </div>
                        <div className="budget-mini-values">
                            <span className="val-budget">0</span>
                            <span className="val-disbursed">0</span>
                            <span className="val-percent">0%</span>
                        </div>
                    </div>

                    {/* 1.2 Operation */}
                    <div className="budget-mini-card">
                        <div className="budget-mini-header">1.2 งบดำเนินงาน</div>
                        <div className="budget-mini-labels">
                            <span>งบประมาณ</span>
                            <span>เบิกจ่าย</span>
                            <span>%</span>
                        </div>
                        <div className="budget-mini-values">
                            <span className="val-budget">{formatNumber(stats.operationBudget)}</span>
                            <span className="val-disbursed">{formatNumber(stats.operationDisbursed)}</span>
                            <span className="val-percent">
                                {stats.operationBudget > 0 ? ((stats.operationDisbursed / stats.operationBudget) * 100).toFixed(1) : '0'}%
                            </span>
                        </div>
                    </div>

                    {/* 1.3 Project */}
                    <div className="budget-mini-card">
                        <div className="budget-mini-header">1.3 งบโครงการฯ</div>
                        <div className="budget-mini-labels">
                            <span>งบประมาณ</span>
                            <span>เบิกจ่าย</span>
                            <span>%</span>
                        </div>
                        <div className="budget-mini-values">
                            <span className="val-budget">{formatNumber(stats.projectBudget)}</span>
                            <span className="val-disbursed">{formatNumber(stats.projectDisbursed)}</span>
                            <span className="val-percent">{stats.projectPercent}%</span>
                        </div>
                    </div>
                </div>

                {/* Total Footer */}
                <div className="budget-total-footer" style={{
                    borderTop: '1px solid #e5e7eb',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div className="total-item">
                        <div className="total-label">รวมงบประมาณทั้งหมด</div>
                        <div className="total-value">{formatNumber(stats.operationBudget + stats.projectBudget)} บาท</div>
                    </div>
                    <div className="total-item">
                        <div className="total-label">รวมเบิกจ่ายทั้งหมด</div>
                        <div className="total-value">{formatNumber(stats.operationDisbursed + stats.projectDisbursed)} บาท</div>
                    </div>
                    <div className="total-item">
                        <div className="total-label">ร้อยละรวม</div>
                        <div className="total-value">
                            {((stats.operationDisbursed + stats.projectDisbursed) / (stats.operationBudget + stats.projectBudget) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Original Summary Cards (Secondary) */}
            <div className="dashboard-summary-grid">
                <div className="dashboard-card dashboard-card-success">
                    <div className="dashboard-card-icon">
                        <FiCheckCircle />
                    </div>
                    <div className="dashboard-card-content">
                        <span className="dashboard-card-label">โครงการเสร็จสิ้น</span>
                        <span className="dashboard-card-value">{stats.completed} / {stats.totalProjects}</span>
                        <span className="dashboard-card-sub">{stats.completionRate}% complete</span>
                    </div>
                </div>

                <div className="dashboard-card dashboard-card-info">
                    <div className="dashboard-card-icon">
                        <FiClock />
                    </div>
                    <div className="dashboard-card-content">
                        <span className="dashboard-card-label">กำลังดำเนินการ</span>
                        <span className="dashboard-card-value">{stats.inProgress}</span>
                        <span className="dashboard-card-sub">กิจกรรม</span>
                    </div>
                </div>

                <div className="dashboard-card dashboard-card-warning">
                    <div className="dashboard-card-icon">
                        <FiCalendar />
                    </div>
                    <div className="dashboard-card-content">
                        <span className="dashboard-card-label">กำหนดวันแล้ว</span>
                        <span className="dashboard-card-value">{stats.scheduled}</span>
                        <span className="dashboard-card-sub">รอดำเนินการ</span>
                    </div>
                </div>

                <div className="dashboard-card dashboard-card-secondary" style={{ borderLeft: '4px solid #9ca3af', background: '#f9fafb' }}>
                    <div className="dashboard-card-icon" style={{ background: '#e5e7eb', color: '#4b5563' }}>
                        <FiClock />
                    </div>
                    <div className="dashboard-card-content">
                        <span className="dashboard-card-label" style={{ color: '#4b5563' }}>รอดำเนินการ</span>
                        <span className="dashboard-card-value" style={{ color: '#1f2937' }}>{stats.pending}</span>
                        <span className="dashboard-card-sub" style={{ color: '#6b7280' }}>กิจกรรม</span>
                    </div>
                </div>
            </div>

            {selectedRound === 'round2' ? (
                /* Detailed Budget Breakdown for Round 2 */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginTop: '24px' }}>
                    {/* 1.2 งบดำเนินงาน */}
                    <div className="card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                        <div className="card-header" style={{ padding: '0 0 12px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="card-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><FiSettings size={18} /></div>
                            <h3 className="card-title" style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#1f2937' }}>1.2 รายละเอียดงบดำเนินงาน</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            {Object.entries(budgetDataJson.operation || {}).map(([key, item]: [string, any]) => {
                                const budget = parseBudget(item.budget);
                                const disbursed = parseBudget(item.disbursed);
                                if (budget === 0) return null;
                                const percent = budget > 0 ? Math.round((disbursed / budget) * 100) : 0;
                                
                                return (
                                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>
                                            <span>{getOperationLabel(key)}</span>
                                            <span style={{ color: percent === 100 ? '#10b981' : '#3b82f6' }}>{percent}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                                            <span>เบิกจ่าย: <strong>{formatNumber(disbursed)}</strong> บาท</span>
                                            <span>งบประมาณ: {formatNumber(budget)} บาท</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 1.3 งบโครงการฯ */}
                    <div className="card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                        <div className="card-header" style={{ padding: '0 0 12px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FiActivity size={18} /></div>
                            <h3 className="card-title" style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#1f2937' }}>1.3 รายละเอียดงบโครงการฯ</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            {Object.entries(budgetDataJson.project || {}).map(([key, item]: [string, any]) => {
                                const budget = parseBudget(item.budget);
                                const disbursed = parseBudget(item.disbursed);
                                if (budget === 0) return null;
                                const percent = budget > 0 ? Math.round((disbursed / budget) * 100) : 0;
                                
                                return (
                                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.9rem', fontWeight: '500', color: '#334155', gap: '2px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '0.85rem', lineHeight: '1.3', maxWidth: '85%' }}>{item.name || key}</span>
                                                <span style={{ color: percent === 100 ? '#10b981' : '#3b82f6', fontWeight: 'bold' }}>{percent}%</span>
                                            </div>
                                        </div>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                                            <span>เบิกจ่าย: <strong>{formatNumber(disbursed)}</strong> บาท</span>
                                            <span>งบประมาณ: {formatNumber(budget)} บาท</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* Original Layout for Round 1 */
                <>
                    {/* Charts Row */}
                    <div className="dashboard-charts-row" style={{ display: 'flex', justifyContent: 'center' }}>
                        {/* Status Pie Chart */}
                        <div className="card dashboard-chart-card" style={{ maxWidth: '500px', width: '100%' }}>
                            <div className="card-header">
                                <div className="card-icon"><FiTrendingUp /></div>
                                <h3 className="card-title">สถานะโครงการ</h3>
                            </div>
                            <div className="dashboard-pie-container">
                                <div className="dashboard-pie" style={{
                                    background: `conic-gradient(
                                        #10b981 0deg ${(stats.completed / stats.totalProjects) * 360}deg,
                                        #3b82f6 ${(stats.completed / stats.totalProjects) * 360}deg ${((stats.completed + stats.inProgress) / stats.totalProjects) * 360}deg,
                                        #f59e0b ${((stats.completed + stats.inProgress) / stats.totalProjects) * 360}deg ${((stats.completed + stats.inProgress + stats.scheduled) / stats.totalProjects) * 360}deg,
                                        #6b7280 ${((stats.completed + stats.inProgress + stats.scheduled) / stats.totalProjects) * 360}deg 360deg
                                    )`
                                }}>
                                    <div className="dashboard-pie-center">
                                        <span className="dashboard-pie-value">{stats.totalProjects}</span>
                                        <span className="dashboard-pie-label">กิจกรรม</span>
                                    </div>
                                </div>
                                <div className="dashboard-legend">
                                    <div className="dashboard-legend-item">
                                        <span className="dashboard-legend-color" style={{ background: '#10b981' }}></span>
                                        <span>เสร็จสิ้น ({stats.completed})</span>
                                    </div>
                                    <div className="dashboard-legend-item">
                                        <span className="dashboard-legend-color" style={{ background: '#3b82f6' }}></span>
                                        <span>กำลังดำเนินการ ({stats.inProgress})</span>
                                    </div>
                                    <div className="dashboard-legend-item">
                                        <span className="dashboard-legend-color" style={{ background: '#f59e0b' }}></span>
                                        <span>กำหนดวันแล้ว ({stats.scheduled})</span>
                                    </div>
                                    <div className="dashboard-legend-item">
                                        <span className="dashboard-legend-color" style={{ background: '#6b7280' }}></span>
                                        <span>รอดำเนินการ ({stats.pending})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon"><FiActivity /></div>
                            <h3 className="card-title">กิจกรรมล่าสุด</h3>
                        </div>
                        <div className="dashboard-activities">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, index) => (
                                    <div key={index} className="dashboard-activity-item">
                                        <div
                                            className="dashboard-activity-status"
                                            style={{ background: getStatusColor(activity.status) }}
                                            title={getStatusLabel(activity.status)}
                                        ></div>
                                        <div className="dashboard-activity-content">
                                            <div className="dashboard-activity-title">{activity.subActivity || activity.name}</div>
                                            <div className="dashboard-activity-desc">{activity.result}</div>
                                            <div className="dashboard-activity-meta">
                                                <span className="status-badge" style={{
                                                    background: `${getStatusColor(activity.status)}20`,
                                                    color: getStatusColor(activity.status)
                                                }}>
                                                    {getStatusLabel(activity.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>ยังไม่มีกิจกรรมที่มีผลลัพธ์</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
