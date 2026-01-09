import { useState, useEffect } from 'react';
import detailedBudgetProjectsData from '../data/detailedBudgetProjects.json';
import { FaEdit, FaSave, FaChartLine, FaExclamationTriangle, FaLightbulb, FaGithub, FaCog } from 'react-icons/fa';

interface DetailedProject {
    name: string;
    subActivity: string;
    target: string;
    budget: string;
    result: string;
    problem: string;
    solution: string;
}

interface BudgetGroup {
    id: string;
    title: string;
    strategicIssues?: string[];
    projects: DetailedProject[];
}

interface SectionBudgetDetailedProps {
    activeSection?: string;
}

export function SectionBudgetDetailed({ activeSection }: SectionBudgetDetailedProps) {
    const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>(detailedBudgetProjectsData);
    const [isEditing, setIsEditing] = useState(false);
    const [showGithubSettings, setShowGithubSettings] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [githubConfig, setGithubConfig] = useState({
        owner: localStorage.getItem('gh_owner') || 'dragonfly13110',
        repo: localStorage.getItem('gh_repo') || 'tv-system-phutthamonthon',
        token: localStorage.getItem('gh_token') || '',
        path: 'src/data/detailedBudgetProjects.json' // path to the file in repo
    });

    // Load from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('detailedBudgetProjects');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Sync with source
            const mergedData = [...parsedData];
            let hasNewData = false;

            detailedBudgetProjectsData.forEach(project => {
                if (!mergedData.find(p => p.id === project.id)) {
                    mergedData.push(project);
                    hasNewData = true;
                }
            });

            setBudgetGroups(mergedData);

            if (hasNewData) {
                localStorage.setItem('detailedBudgetProjects', JSON.stringify(mergedData));
            }
        }
    }, []);

    const handleChange = (
        groupId: string,
        projectIndex: number,
        field: keyof DetailedProject,
        value: string
    ) => {
        const newGroups = budgetGroups.map(group => {
            if (group.id !== groupId) return group;
            const newProjects = [...group.projects];
            newProjects[projectIndex] = { ...newProjects[projectIndex], [field]: value };
            return { ...group, projects: newProjects };
        });
        setBudgetGroups(newGroups);
    };

    const handleGroupTitleChange = (groupId: string, value: string) => {
        const newGroups = budgetGroups.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, title: value };
        });
        setBudgetGroups(newGroups);
    };

    const handleSaveLocal = () => {
        localStorage.setItem('detailedBudgetProjects', JSON.stringify(budgetGroups));
        setIsEditing(false);
        alert('บันทึกข้อมูลลงเครื่องเรียบร้อยแล้ว');
    };

    const handleSaveToGitHub = async () => {
        if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) {
            setShowGithubSettings(true);
            return;
        }

        try {
            // 1. Get current file SHA
            const apiUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.path}`;
            const getRes = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let sha = undefined;

            if (getRes.status === 200) {
                const fileData = await getRes.json();
                sha = fileData.sha;
            } else if (getRes.status === 404) {
                // File doesn't exist yet, we will create it.
                // No SHA needed.
            } else if (getRes.status === 401) {
                throw new Error('Token ไม่ถูกต้อง (401 Unauthorized)');
            } else {
                throw new Error(`ดึงข้อมูลไฟล์ไม่สำเร็จ (${getRes.status}: ${getRes.statusText})`);
            }

            // 2. Update file
            // Encode content to Base64 (handle UTF-8 strings correctly)
            const jsonString = JSON.stringify(budgetGroups, null, 4);
            const content = btoa(unescape(encodeURIComponent(jsonString)));

            const body: any = {
                message: 'Update budget projects data via App',
                content: content
            };
            if (sha) {
                body.sha = sha;
            }

            const putRes = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (!putRes.ok) {
                if (putRes.status === 401) throw new Error('Token ไม่ถูกต้อง หรือไม่มีสิทธิ์เขียนไฟล์ (401 Unauthorized)');
                if (putRes.status === 404) throw new Error('ไม่พบ Repository หรือ Path ที่ระบุ (404 Not Found)');
                throw new Error(`บันทึกไม่สำเร็จ (${putRes.status}: ${putRes.statusText})`);
            }

            alert('บันทึกข้อมูลไปยัง GitHub เรียบร้อยแล้ว!');
            localStorage.setItem('detailedBudgetProjects', JSON.stringify(budgetGroups)); // Sync local
            setIsEditing(false);

        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาด: ' + error);
        }
    };

    const saveGithubConfig = () => {
        localStorage.setItem('gh_owner', githubConfig.owner);
        localStorage.setItem('gh_repo', githubConfig.repo);
        localStorage.setItem('gh_token', githubConfig.token);
        setShowGithubSettings(false);
    };

    // Extract ID (e.g. section2-1 -> 1)
    const activeId = activeSection ? activeSection.replace(/^(section-budget-detailed-|section2-)/, '') : '';

    // Filter groups. 
    const displayedGroups = (activeId && activeId !== 'section2' && activeId !== 'section-budget-detailed')
        ? budgetGroups.filter(g => g.id === activeId)
        : budgetGroups;

    return (
        <div className="section-container fade-in">
            {showGithubSettings && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1e293b', fontSize: '1.25rem' }}>ตั้งค่า GitHub</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.95rem', fontWeight: '500', color: '#334155' }}>
                                Personal Access Token <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="password"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                value={githubConfig.token}
                                onChange={e => setGithubConfig({ ...githubConfig, token: e.target.value })}
                                placeholder="ghp_xxxxxxxxxxxx"
                            />
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                ใส่เฉพาะ Token ก็ใช้งานได้ (ถ้าชื่อ Repo ตรงกับค่าเริ่มต้น)
                            </p>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                {showAdvanced ? '▼ ซ่อนตั้งค่าขั้นสูง' : '▶ แสดงตั้งค่าขั้นสูง (Owner/Repo)'}
                            </button>
                        </div>

                        {showAdvanced && (
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Owner (ชื่อผู้ใช้):</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                        value={githubConfig.owner}
                                        onChange={e => setGithubConfig({ ...githubConfig, owner: e.target.value })}
                                        placeholder="dragonfly13110"
                                    />
                                </div>
                                <div style={{ marginBottom: '0' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Repo Name (ชื่อโปรเจค):</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                        value={githubConfig.repo}
                                        onChange={e => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                                        placeholder="tv-system-phutthamonthon"
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button onClick={() => setShowGithubSettings(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>ยกเลิก</button>
                            <button onClick={saveGithubConfig} style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>บันทึก</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="section-header">
                <div className="header-content">
                    <h2>ข้อมูลโครงการงบประมาณรายจ่ายประจำปี 2569 (รายละเอียด)</h2>
                    <p className="subtitle">
                        {displayedGroups.length === 1
                            ? displayedGroups[0].title
                            : 'ติดตามผลการดำเนินงาน ปัญหา และข้อเสนอแนะ'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className={`edit-toggle-btn`}
                        style={{ background: '#475569' }}
                        onClick={() => setShowGithubSettings(true)}
                        title="ตั้งค่า GitHub"
                    >
                        <FaCog />
                    </button>
                    {isEditing ? (
                        <>
                            <button className="edit-toggle-btn" onClick={handleSaveLocal} style={{ background: '#3b82f6' }}>
                                <FaSave /> บันทึก (Local)
                            </button>
                            <button className="edit-toggle-btn" style={{ background: '#24292e' }} onClick={handleSaveToGitHub}>
                                <FaGithub /> บันทึกขึ้น GitHub
                            </button>
                        </>
                    ) : (
                        <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>
                            <FaEdit /> แก้ไขข้อมูล
                        </button>
                    )}
                </div>
            </div>

            <div className="budget-detailed-list">
                {displayedGroups.map((group) => (
                    <div key={group.id} className="budget-group-card plain-card">
                        {isEditing ? (
                            <input
                                type="text"
                                value={group.title}
                                onChange={(e) => handleGroupTitleChange(group.id, e.target.value)}
                                style={{ width: '100%', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                        ) : (
                            <h3 className="group-title">{group.title}</h3>
                        )}

                        {/* Strategic Issues Box */}
                        {group.strategicIssues && group.strategicIssues.length > 0 && (
                            <div className="strategic-issues-box" style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginBottom: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#166534',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}>
                                    <FaLightbulb /> ความสอดคล้องกับ 13 ประเด็นเน้นย้ำ (Quick Win)
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {group.strategicIssues.map((issue, idx) => (
                                        <span key={idx} style={{
                                            background: '#fff',
                                            border: '1px solid #dcfce7',
                                            color: '#15803d',
                                            fontSize: '0.85rem',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}>
                                            {issue}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="projects-list">
                            {group.projects.map((project, index) => (
                                <div key={index} className="project-item">
                                    <div className="project-header">
                                        <div className="project-info">
                                            {isEditing ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>ชื่อโครงการ/กิจกรรม:</label>
                                                        <input
                                                            type="text"
                                                            value={project.name}
                                                            onChange={(e) => handleChange(group.id, index, 'name', e.target.value)}
                                                            style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>กิจกรรมย่อย:</label>
                                                        <textarea
                                                            value={project.subActivity}
                                                            onChange={(e) => handleChange(group.id, index, 'subActivity', e.target.value)}
                                                            style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical' }}
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4>{project.name}</h4>
                                                    <div className="sub-activity">
                                                        <strong>กิจกรรมย่อย:</strong> {project.subActivity}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="project-metrics">
                                            <div className="metric">
                                                <span className="label">เป้าหมาย:</span>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={project.target}
                                                        onChange={(e) => handleChange(group.id, index, 'target', e.target.value)}
                                                        style={{ width: '100px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                    />
                                                ) : (
                                                    <span className="value">{project.target}</span>
                                                )}
                                            </div>
                                            <div className="metric">
                                                <span className="label">งบประมาณ:</span>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={project.budget}
                                                        onChange={(e) => handleChange(group.id, index, 'budget', e.target.value)}
                                                        style={{ width: '100px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                    />
                                                ) : (
                                                    <span className="value">{project.budget}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-feedback">
                                        <div className="feedback-item">
                                            <div className="feedback-label">
                                                <FaChartLine className="icon" /> ผลการดำเนินงาน
                                            </div>
                                            {isEditing ? (
                                                <textarea
                                                    className="edit-textarea"
                                                    value={project.result}
                                                    onChange={(e) => handleChange(group.id, index, 'result', e.target.value)}
                                                    rows={3}
                                                    placeholder="ระบุผลการดำเนินงาน..."
                                                />
                                            ) : (
                                                <div className="feedback-content">{project.result}</div>
                                            )}
                                        </div>

                                        <div className="feedback-row">
                                            <div className="feedback-item half">
                                                <div className="feedback-label error">
                                                    <FaExclamationTriangle className="icon" /> ปัญหา/อุปสรรค
                                                </div>
                                                {isEditing ? (
                                                    <textarea
                                                        className="edit-textarea"
                                                        value={project.problem}
                                                        onChange={(e) => handleChange(group.id, index, 'problem', e.target.value)}
                                                        rows={2}
                                                        placeholder="ระบุปัญหา..."
                                                    />
                                                ) : (
                                                    <div className="feedback-content">{project.problem}</div>
                                                )}
                                            </div>
                                            <div className="feedback-item half">
                                                <div className="feedback-label success">
                                                    <FaLightbulb className="icon" /> ข้อเสนอแนะ
                                                </div>
                                                {isEditing ? (
                                                    <textarea
                                                        className="edit-textarea"
                                                        value={project.solution}
                                                        onChange={(e) => handleChange(group.id, index, 'solution', e.target.value)}
                                                        rows={2}
                                                        placeholder="ระบุข้อเสนอแนะ..."
                                                    />
                                                ) : (
                                                    <div className="feedback-content">{project.solution}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .budget-detailed-list {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .budget-group-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .group-title {
                    color: #059669;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 20px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #ecfdf5;
                }
                .project-item {
                    background: #f8fafc;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border: 1px solid #e2e8f0;
                }
                .project-item:last-child {
                    margin-bottom: 0;
                }
                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                .project-info {
                    flex: 1;
                    min-width: 300px;
                }
                .project-info h4 {
                    font-size: 1.1rem;
                    color: #1e293b;
                    margin-bottom: 8px;
                    line-height: 1.5;
                    font-weight: 600;
                }
                .sub-activity {
                    color: #475569;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .project-metrics {
                    display: flex;
                    gap: 16px;
                    background: #ecfdf5;
                    padding: 12px 16px;
                    border-radius: 8px;
                    border: 1px solid #d1fae5;
                }
                .metric {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .metric .label {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 2px;
                }
                .metric .value {
                    font-size: 1rem;
                    color: #059669;
                    font-weight: 600;
                }
                
                .project-feedback {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .feedback-row {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .feedback-item {
                    flex: 1;
                }
                .feedback-item.half {
                    min-width: 250px;
                }
                .feedback-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    color: #334155;
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                .feedback-label .icon {
                    color: #34d399;
                }
                .feedback-label.error .icon {
                    color: #f59e0b;
                }
                .feedback-label.success .icon {
                    color: #3b82f6;
                }
                .feedback-content {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 12px;
                    border-radius: 6px;
                    color: #1e293b;
                    font-size: 0.95rem;
                    min-height: 48px;
                    white-space: pre-wrap;
                    line-height: 1.6;
                }
                .edit-textarea {
                    width: 100%;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 12px;
                    color: #0f172a;
                    font-family: inherit;
                    font-size: 0.95rem;
                    resize: vertical;
                    transition: all 0.2s;
                    line-height: 1.6;
                }
                .edit-textarea:focus {
                    outline: none;
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }
            `}</style>
        </div>
    );
}
