import { useState, useEffect } from 'react';
import { saveToDiskAndSync } from '../utils/sync';
import detailedBudgetProjectsData from '../data/detailedBudgetProjects.json';
import { FaEdit, FaSave, FaChartLine, FaExclamationTriangle, FaLightbulb, FaGithub, FaCog, FaImage, FaPlus, FaTimes, FaChevronDown, FaChevronRight, FaTrash, FaCheck, FaClock, FaCircle, FaCalendarAlt } from 'react-icons/fa';

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

interface SectionBudgetDetailedProps {
    activeSection?: string;
}

// Helper: strip leading numbers like "1.1)" or "1.2 " or "1) " from text
const stripLeadingNumber = (text: string): string => {
    return text.replace(/^[\d.]+\)\s*/, '').replace(/^[\d.]+\s+/, '');
};

// Helper: strip number after "กิจกรรม:" like "กิจกรรม: 1.1 กิจกรรม..." -> "กิจกรรม: กิจกรรม..."
const stripActivityNumber = (name: string): string => {
    return name.replace(/(กิจกรรม:\s*)[\d.]+\s*/i, '$1');
};

export function SectionBudgetDetailed({ activeSection }: SectionBudgetDetailedProps) {
    const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>(detailedBudgetProjectsData as BudgetGroup[]);
    const [isEditing, setIsEditing] = useState(false);
    const [showGithubSettings, setShowGithubSettings] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [githubConfig, setGithubConfig] = useState({
        owner: localStorage.getItem('gh_owner') || 'dragonfly13110',
        repo: localStorage.getItem('gh_repo') || 'Supervision_phut_1-2569',
        token: localStorage.getItem('gh_token') || '',
        path: 'src/data/detailedBudgetProjects.json' // path to the file in repo
    });

    // Collapsed Projects State (key: groupId-projectIndex) - Default: all collapsed
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    const toggleProjectCollapse = (groupId: string, projectIndex: number) => {
        const key = `${groupId}-${projectIndex}`;
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const isProjectExpanded = (groupId: string, projectIndex: number) => {
        return expandedProjects.has(`${groupId}-${projectIndex}`);
    };

    // Image Modal State
    const [imageModal, setImageModal] = useState<{ groupId: string; projectIndex: number } | null>(null);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCaption, setNewImageCaption] = useState('');

    // Lightbox State for viewing images in full screen
    const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('detailedBudgetProjects');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Sync with source
            const mergedData = [...parsedData];
            let hasNewData = false;

            detailedBudgetProjectsData.forEach(project => {
                const existingGroup = mergedData.find(p => p.id === project.id);
                if (!existingGroup) {
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
        value: any
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

    const handleAddImage = () => {
        if (imageModal && newImageUrl) {
            const group = budgetGroups.find(g => g.id === imageModal.groupId);
            if (group) {
                const project = group.projects[imageModal.projectIndex];
                const currentImages = project.images || [];
                const newImages = [...currentImages, { url: newImageUrl, caption: newImageCaption }];
                handleChange(imageModal.groupId, imageModal.projectIndex, 'images', newImages);
            }
            setImageModal(null);
            setNewImageUrl('');
            setNewImageCaption('');
        }
    };

    const handleRemoveImage = (groupId: string, projectIndex: number, imgIndex: number) => {
        const group = budgetGroups.find(g => g.id === groupId);
        if (group) {
            const project = group.projects[projectIndex];
            const currentImages = project.images || [];
            const newImages = currentImages.filter((_, i) => i !== imgIndex);
            handleChange(groupId, projectIndex, 'images', newImages);
        }
    };

    const handleAddProject = (groupId: string) => {
        const newGroups = budgetGroups.map(group => {
            if (group.id !== groupId) return group;
            const newProject: DetailedProject = {
                name: 'กิจกรรม: (รอระบุ)',
                subActivity: '-',
                relevantPolicies: '-',
                target: '-',
                budget: '-',
                result: '-',
                problem: '-',
                solution: '-',
                images: []
            };
            return { ...group, projects: [...group.projects, newProject] };
        });
        setBudgetGroups(newGroups);
    };

    const handleRemoveProject = (groupId: string, projectIndex: number) => {
        if (confirm('ต้องการลบกิจกรรมนี้หรือไม่?')) {
            const newGroups = budgetGroups.map(group => {
                if (group.id !== groupId) return group;
                const newProjects = group.projects.filter((_, i) => i !== projectIndex);
                return { ...group, projects: newProjects };
            });
            setBudgetGroups(newGroups);
        }
    };

    const handleSaveLocal = async () => {
        try {
            await saveToDiskAndSync('detailedBudgetProjects.json', budgetGroups);
            localStorage.setItem('detailedBudgetProjects', JSON.stringify(budgetGroups));
            setIsEditing(false);
            alert('บันทึกข้อมูลลงเครื่องและซิงค์ไปยัง Google Sheets เรียบร้อยแล้ว');
        } catch (error) {
            console.error(error);
            alert('บันทึกข้อมูลสำเร็จ แต่ซิงค์ไม่สำเร็จ (ดู Console)');
        }
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

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setLightboxImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 2000,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px',
                        cursor: 'pointer'
                    }}
                >
                    <button
                        onClick={() => setLightboxImage(null)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '24px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                    >
                        <FaTimes />
                    </button>
                    <img
                        src={lightboxImage.url}
                        alt={lightboxImage.caption || 'Full size image'}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '85vh',
                            width: 'auto',
                            height: 'auto',
                            borderRadius: '12px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                            cursor: 'default'
                        }}
                    />
                    {lightboxImage.caption && (
                        <div
                            style={{
                                marginTop: '16px',
                                color: 'white',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                maxWidth: '80vw'
                            }}
                        >
                            {lightboxImage.caption}
                        </div>
                    )}
                </div>
            )}

            {/* Image Modal */}
            {imageModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>🖼️ เพิ่มรูปภาพ</h3>
                            <button onClick={() => setImageModal(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                                <FaTimes />
                            </button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 500 }}>URL รูปภาพ *</label>
                            <input
                                type="url"
                                value={newImageUrl}
                                onChange={e => setNewImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 500 }}>คำอธิบาย (ไม่บังคับ)</label>
                            <input
                                type="text"
                                value={newImageCaption}
                                onChange={e => setNewImageCaption(e.target.value)}
                                placeholder="เช่น ภาพการประชุม"
                                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                            />
                        </div>
                        {newImageUrl && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>ตัวอย่าง</div>
                                <div style={{ width: '160px', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                    <img src={newImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setImageModal(null)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={handleAddImage} disabled={!newImageUrl} style={{ padding: '10px 20px', background: newImageUrl ? '#2d7a32' : '#9ca3af', color: '#fff', border: 'none', borderRadius: '8px', cursor: newImageUrl ? 'pointer' : 'not-allowed', fontWeight: 500 }}>เพิ่มรูป</button>
                        </div>
                    </div>
                </div>
            )}

            {/* GitHub Settings Modal */}
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
                                        placeholder="Supervision_phut_1-2569"
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
                    <h2 style={{ fontSize: '1.4rem' }}>ข้อมูลโครงการงบประมาณรายจ่ายประจำปี 2569 (รายละเอียด)</h2>
                    <p className="subtitle" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginTop: '8px' }}>
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
                            // Hide group title when only 1 group is displayed (already shown in subtitle)
                            displayedGroups.length > 1 && <h3 className="group-title">{group.title}</h3>
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
                            {group.projects.map((project, index) => {
                                const isExpanded = isProjectExpanded(group.id, index);
                                return (
                                    <div key={index} className="project-item" style={{ position: 'relative' }}>
                                        {/* Delete Project Button */}
                                        {isEditing && (
                                            <button
                                                onClick={() => handleRemoveProject(group.id, index)}
                                                style={{
                                                    position: 'absolute', top: '10px', right: '10px',
                                                    padding: '6px 10px', background: '#fef2f2', color: '#dc2626',
                                                    border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer',
                                                    fontSize: '12px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px'
                                                }}
                                                title="ลบกิจกรรม"
                                            >
                                                <FaTrash size={10} /> ลบ
                                            </button>
                                        )}
                                        {/* Collapsible Header */}
                                        {/* Collapsible Header - Show for all projects */}
                                        <div
                                            className="project-collapse-header"
                                            onClick={() => toggleProjectCollapse(group.id, index)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 12px',
                                                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                                borderRadius: '6px',
                                                marginBottom: isExpanded ? '10px' : '0',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                border: '1px solid #d1fae5'
                                            }}
                                        >
                                            <span style={{ color: '#059669', fontSize: '14px' }}>
                                                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontWeight: 600,
                                                    color: '#065f46',
                                                    fontSize: '1.15rem',
                                                    marginBottom: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    กิจกรรมที่ {index + 1}: {stripActivityNumber(project.name)}
                                                    {/* Status Badge */}
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500,
                                                        background: project.status === 'completed' ? '#dcfce7' : project.status === 'in_progress' ? '#fef9c3' : project.status === 'scheduled' ? '#dbeafe' : '#f1f5f9',
                                                        color: project.status === 'completed' ? '#166534' : project.status === 'in_progress' ? '#a16207' : project.status === 'scheduled' ? '#1e40af' : '#64748b',
                                                        border: `1px solid ${project.status === 'completed' ? '#bbf7d0' : project.status === 'in_progress' ? '#fde047' : project.status === 'scheduled' ? '#60a5fa' : '#e2e8f0'}`
                                                    }}>
                                                        {project.status === 'completed' ? <><FaCheck size={10} /> เสร็จแล้ว</> :
                                                            project.status === 'in_progress' ? <><FaClock size={10} /> กำลังดำเนินการ</> :
                                                                project.status === 'scheduled' ? <><FaCalendarAlt size={10} /> กำหนดวันแล้ว</> :
                                                                    <><FaCircle size={8} /> ยังไม่เริ่ม</>}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    color: '#475569',
                                                    fontWeight: 400,
                                                    lineHeight: '1.5'
                                                }}>
                                                    📋 <strong>กิจกรรมย่อย:</strong> {stripLeadingNumber(project.subActivity)}
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                color: '#10b981',
                                                fontWeight: 500,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {project.budget}
                                            </span>
                                        </div>

                                        {/* Collapsible Content */}
                                        <div style={{ display: !isExpanded ? 'none' : 'block' }}>
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
                                                            <div>
                                                                <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>สถานะ:</label>
                                                                <select
                                                                    value={project.status || 'pending'}
                                                                    onChange={(e) => handleChange(group.id, index, 'status', e.target.value)}
                                                                    style={{
                                                                        width: '200px',
                                                                        padding: '8px 12px',
                                                                        border: '1px solid #cbd5e1',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.9rem',
                                                                        background: project.status === 'completed' ? '#dcfce7' : project.status === 'in_progress' ? '#fef9c3' : project.status === 'scheduled' ? '#dbeafe' : '#f8fafc',
                                                                        color: project.status === 'completed' ? '#166534' : project.status === 'in_progress' ? '#a16207' : project.status === 'scheduled' ? '#1e40af' : '#475569',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <option value="pending">⚪ ยังไม่เริ่ม</option>
                                                                    <option value="scheduled">🗓️ กำหนดวันแล้ว</option>
                                                                    <option value="in_progress">🟡 กำลังดำเนินการ</option>
                                                                    <option value="completed">🟢 เสร็จแล้ว</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {project.relevantPolicies && project.relevantPolicies !== '-' && (
                                                                <div className="relevant-policies-box">
                                                                    {project.relevantPolicies}
                                                                </div>
                                                            )}
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
                                                        <FaChartLine className="icon" /> แผนการดำเนินงาน/ผลการดำเนินงาน
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

                                                {/* Image Gallery */}
                                                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                        <div className="feedback-label" style={{ marginBottom: 0 }}>
                                                            <FaImage className="icon" /> รูปภาพประกอบ
                                                        </div>
                                                        {isEditing && (
                                                            <button
                                                                onClick={() => setImageModal({ groupId: group.id, projectIndex: index })}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                                                            >
                                                                <FaPlus size={12} /> เพิ่มรูปภาพ
                                                            </button>
                                                        )}
                                                    </div>

                                                    {project.images && project.images.length > 0 ? (
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                                            {project.images.map((img, imgIdx) => (
                                                                <div
                                                                    key={imgIdx}
                                                                    style={{
                                                                        position: 'relative',
                                                                        borderRadius: '12px',
                                                                        overflow: 'hidden',
                                                                        border: '1px solid #e2e8f0',
                                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                                        cursor: isEditing ? 'default' : 'pointer'
                                                                    }}
                                                                    onClick={() => !isEditing && setLightboxImage(img)}
                                                                    onMouseEnter={(e) => {
                                                                        if (!isEditing) {
                                                                            e.currentTarget.style.transform = 'scale(1.02)';
                                                                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.transform = 'scale(1)';
                                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                                                                    }}
                                                                >
                                                                    <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                                                                        <img
                                                                            src={img.url}
                                                                            alt={img.caption || 'Project Image'}
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                objectFit: 'cover',
                                                                                transition: 'transform 0.3s'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    {img.caption && (
                                                                        <div style={{
                                                                            padding: '10px 12px',
                                                                            fontSize: '0.9rem',
                                                                            color: '#475569',
                                                                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                                                            borderTop: '1px solid #e2e8f0'
                                                                        }}>
                                                                            {img.caption}
                                                                        </div>
                                                                    )}
                                                                    {!isEditing && (
                                                                        <div style={{
                                                                            position: 'absolute',
                                                                            bottom: img.caption ? '40px' : '8px',
                                                                            right: '8px',
                                                                            background: 'rgba(0, 0, 0, 0.6)',
                                                                            color: 'white',
                                                                            padding: '4px 8px',
                                                                            borderRadius: '4px',
                                                                            fontSize: '0.75rem',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            opacity: 0.8
                                                                        }}>
                                                                            🔍 คลิกเพื่อขยาย
                                                                        </div>
                                                                    )}
                                                                    {isEditing && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRemoveImage(group.id, index, imgIdx);
                                                                            }}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: '8px',
                                                                                right: '8px',
                                                                                background: '#ef4444',
                                                                                color: 'white',
                                                                                border: 'none',
                                                                                borderRadius: '50%',
                                                                                width: '32px',
                                                                                height: '32px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                cursor: 'pointer',
                                                                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                                                                            }}
                                                                        >
                                                                            <FaTimes size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.95rem', color: '#94a3b8', fontStyle: 'italic', padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>
                                                            {isEditing ? 'กด "เพิ่มรูปภาพ" เพื่อใส่รูปประกอบ' : 'ไม่มีรูปภาพประกอบ'}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Add Project Button */}
                            {isEditing && (
                                <button
                                    onClick={() => handleAddProject(group.id)}
                                    style={{
                                        width: '100%', padding: '14px', marginTop: '16px',
                                        background: '#ecfdf5', color: '#059669', border: '2px dashed #a7f3d0',
                                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem',
                                        fontWeight: 500, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <FaPlus /> เพิ่มกิจกรรม
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .budget-detailed-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .budget-group-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 16px;
                    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
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
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 12px;
                    border: 1px solid #e2e8f0;
                }
                .project-item:last-child {
                    margin-bottom: 0;
                }
                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .project-info {
                    flex: 1;
                    min-width: 300px;
                }
                .project-info h4 {
                    font-size: 1.35rem;
                    color: #1e293b;
                    margin-bottom: 8px;
                    line-height: 1.5;
                    font-weight: 700;
                }
                .sub-activity {
                    color: #475569;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .relevant-policies-box {
                    margin-top: 10px;
                    padding: 10px 14px;
                    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                    border-left: 4px solid #10b981;
                    border-radius: 0 8px 8px 0;
                    font-size: 0.9rem;
                    color: #065f46;
                    line-height: 1.6;
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
        </div >
    );
}
