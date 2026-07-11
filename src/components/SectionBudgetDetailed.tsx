import { useState, useEffect } from 'react';
import { fetchSheetData, updateSheetData } from '../utils/sheetsApi';
import { FaEdit, FaSave, FaChartLine, FaExclamationTriangle, FaLightbulb, FaImage, FaPlus, FaTimes, FaChevronDown, FaChevronRight, FaTrash, FaCheck, FaClock, FaCircle, FaCalendarAlt } from 'react-icons/fa';
import { FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import { useRound } from './RoundContext';
import { isImageUrl } from '../utils/imageUrl';


interface DetailedProject {
    name: string;
    subActivity?: string;
    relevantPolicies?: string;
    target?: string;
    budget?: string;
    result: string;
    progress?: string;
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

// Helper: Get formatted display name with numbers prepended if not already present
const getProjectDisplayName = (projectName: string, groupId: string, index: number): string => {
    if (/^\d+(\.\d+)?[\s\.:]/.test(projectName.trim())) {
        return projectName;
    }
    if (groupId === '1') {
        return `1.${index + 1} ${projectName}`;
    } else {
        return `${index + 1}. ${projectName}`;
    }
};

// Policy options for dropdown
const POLICY_OPTIONS = [
    { id: 1, label: 'ข้อ 1. การส่งเสริมระบบเกษตรที่เท่าทันต่อการเปลี่ยนแปลงสภาพภูมิอากาศ' },
    { id: 2, label: 'ข้อ 2. การป้องกัน ควบคุม กำจัด และแก้ไขปัญหาโรคและแมลงศัตรูพืช' },
    { id: 3, label: 'ข้อ 3. การส่งเสริมระบบเครือข่ายทางการเกษตร' },
    { id: 4, label: 'ข้อ 4. การให้บริการตามพระราชบัญญัติที่เกี่ยวข้อง' },
    { id: 5, label: 'ข้อ 5. การพัฒนางานอำนวยการเพื่อสร้างสภาพแวดล้อมทางเศรษฐกิจที่เอื้อต่อการเกษตร' },
    { id: 6, label: 'ข้อ 6. ส่งเสริมการผลิตและการตลาดสินค้าเกษตรมูลค่าสูง' },
    { id: 7, label: 'ข้อ 7. สถานการณ์เร่งด่วนที่เกิดขึ้นในพื้นที่' },
    { id: 8, label: 'ข้อ 8. การนำระบบส่งเสริมการเกษตรไปขับเคลื่อนงานในพื้นที่' },
    { id: 9, label: 'ข้อ 9. การจัดทำแผนพัฒนาการเกษตร' },
    { id: 10, label: 'ข้อ 10. การบริหารความเสี่ยง ตามหลักธรรมาภิบาล' },
    { id: 11, label: 'ข้อ 11. เกษตรเชิงพื้นที่' },
    { id: 12, label: 'ข้อ 12. ภูมิปัญญาท้องถิ่น / Handy Sense / Zoning' },
    { id: 13, label: 'ข้อ 13. แนวทางการนำเทคโนโลยีที่เหมาะสมขยายผลสู่พื้นที่' },
];

export function SectionBudgetDetailed({ activeSection }: SectionBudgetDetailedProps) {
    const { isLoggedIn } = useAuth();
    const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [uploadingStatus, setUploadingStatus] = useState<{[key: string]: boolean}>({});

    const uploadFile = (file: File, projectName: string, groupId: string, projectIndex: number) => {
        const key = `${groupId}-${projectIndex}`;
        setUploadingStatus(prev => ({ ...prev, [key]: true }));
        
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64Data = (reader.result as string).split(',')[1];
                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectName,
                        filename: file.name,
                        fileData: base64Data
                    })
                });
                const data = await response.json();
                if (data.success && data.url) {
                    setBudgetGroups(prevGroups => {
                        return prevGroups.map(group => {
                            if (group.id !== groupId) return group;
                            const newProjects = [...group.projects];
                            const currentImages = newProjects[projectIndex].images || [];
                            newProjects[projectIndex] = {
                                ...newProjects[projectIndex],
                                images: [...currentImages, { url: data.url, caption: '' }]
                            };
                            return { ...group, projects: newProjects };
                        });
                    });
                } else {
                    alert('อัปโหลดล้มเหลว: ' + (data.error || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'));
                }
            } catch (err: any) {
                console.error(err);
                if (import.meta.env.DEV && typeof reader.result === 'string') {
                    setBudgetGroups(prevGroups => prevGroups.map(group => {
                        if (group.id !== groupId) return group;
                        const newProjects = [...group.projects];
                        const currentImages = newProjects[projectIndex].images || [];
                        newProjects[projectIndex] = {
                            ...newProjects[projectIndex],
                            images: [...currentImages, { url: reader.result as string, caption: '' }]
                        };
                        return { ...group, projects: newProjects };
                    }));
                } else {
                    alert('อัปโหลดล้มเหลว: ' + err.message);
                }
            } finally {
                setUploadingStatus(prev => ({ ...prev, [key]: false }));
            }
        };
        reader.readAsDataURL(file);
    };

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
    const [imageUrl, setImageUrl] = useState('');

    // Lightbox State for viewing images in full screen
    const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

    const { selectedRound } = useRound();

    // Load from Google Sheets on mount and when round changes
    useEffect(() => {
        loadData();
    }, [selectedRound]);


    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchSheetData<BudgetGroup>('detailedBudgetProjects');
            setBudgetGroups(data);
        } catch (err: any) {
            setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
            console.error('Error loading data:', err);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleAddImageUrl = (groupId: string, projectIndex: number) => {
        if (!isImageUrl(imageUrl)) {
            alert('กรุณาใส่ URL รูปภาพที่ขึ้นต้นด้วย http:// หรือ https://');
            return;
        }
        const group = budgetGroups.find(item => item.id === groupId);
        const images = group?.projects[projectIndex]?.images || [];
        handleChange(groupId, projectIndex, 'images', [...images, { url: imageUrl.trim(), caption: '' }]);
        setImageUrl('');
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
        setIsSaving(true);
        try {
            await updateSheetData('detailedBudgetProjects', budgetGroups);
            setIsEditing(false);
            alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
        } catch (err: any) {
            console.error('Error saving:', err);
            alert('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถบันทึกได้'));
        } finally {
            setIsSaving(false);
        }
    };

    // Extract ID (e.g. section2-1 -> 1)
    const activeId = activeSection ? activeSection.replace(/^(section-budget-detailed-|section2-)/, '') : '';

    // Filter groups. 
    const displayedGroups = (activeId && activeId !== 'section2' && activeId !== 'section-budget-detailed')
        ? budgetGroups.filter(g => g.id === activeId)
        : budgetGroups;

    if (isLoading) {
        return (
            <div className="section-container fade-in">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px' }}>
                    <FiLoader className="spin" style={{ fontSize: '24px', color: '#3b82f6' }} />
                    <span style={{ fontSize: '1.1rem', color: '#64748b' }}>กำลังโหลดข้อมูล...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="section-container fade-in">
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '16px' }}>
                    <FiAlertTriangle style={{ fontSize: '48px', color: '#ef4444' }} />
                    <span style={{ fontSize: '1.1rem', color: '#ef4444' }}>{error}</span>
                    <button onClick={loadData} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

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
                    {isLoggedIn && (
                        isEditing ? (
                            <button className="edit-toggle-btn" onClick={handleSaveLocal} disabled={isSaving} style={{ background: isSaving ? '#94a3b8' : '#16a34a' }}>
                                {isSaving ? <><FiLoader className="spin" /> กำลังบันทึก...</> : <><FaSave /> บันทึก</>}
                            </button>
                        ) : (
                            <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>
                                <FaEdit /> แก้ไขข้อมูล
                            </button>
                        )
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
                            {selectedRound === 'round2' && group.id === '1' && (
                                <div style={{
                                    marginBottom: '20px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    background: '#fff',
                                    padding: '12px'
                                }}>
                                    <div style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#0f766e',
                                        marginBottom: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        🗺️ Service Solution Model
                                    </div>
                                    <img 
                                        src="/service_solution_model.png" 
                                        alt="Service Solution Model" 
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: '8px',
                                            display: 'block',
                                            cursor: 'zoom-in',
                                            border: '1px solid #cbd5e1'
                                        }}
                                        onClick={() => {
                                            window.open('/service_solution_model.png', '_blank');
                                        }}
                                    />
                                </div>
                            )}
                            {group.projects.map((project, index) => {
                                const isExpanded = isProjectExpanded(group.id, index);
                                const hasNoTarget = (project.result || '').includes('ไม่มีเป้าหมาย') || (project.progress || '').includes('ไม่มีเป้าหมาย') || (project.subActivity || '').includes('ไม่มีเป้าหมาย');
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
                                                background: hasNoTarget 
                                                    ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                                                    : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                                borderRadius: '6px',
                                                marginBottom: isExpanded ? '10px' : '0',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                border: hasNoTarget ? '1px solid #cbd5e1' : '1px solid #d1fae5',
                                                opacity: hasNoTarget ? 0.85 : 1
                                            }}
                                        >
                                            <span style={{ color: hasNoTarget ? '#94a3b8' : '#059669', fontSize: '14px' }}>
                                                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                {selectedRound === 'round2' ? (
                                                    <div style={{
                                                        fontWeight: 600,
                                                        color: hasNoTarget ? '#64748b' : '#065f46',
                                                        fontSize: '1.15rem',
                                                        lineHeight: '1.5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '100%'
                                                    }}>
                                                        <span>{getProjectDisplayName(project.name, group.id, index)}</span>
                                                        {hasNoTarget && (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 500,
                                                                background: '#f1f5f9',
                                                                color: '#64748b',
                                                                border: '1px solid #e2e8f0',
                                                                marginLeft: 'auto',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                ไม่มีเป้าหมายในพื้นที่
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        fontWeight: 600,
                                                        color: hasNoTarget ? '#64748b' : '#065f46',
                                                        fontSize: '1.15rem',
                                                        marginBottom: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        <span>กิจกรรมที่ {index + 1}: {stripActivityNumber(project.name)}</span>
                                                        {/* Status Badge / No target Badge */}
                                                        {hasNoTarget ? (
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 500,
                                                                background: '#f1f5f9',
                                                                color: '#64748b',
                                                                border: '1px solid #e2e8f0',
                                                            }}>
                                                                ไม่มีเป้าหมายในพื้นที่
                                                            </span>
                                                        ) : (
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
                                                        )}
                                                    </div>
                                                )}
                                                {selectedRound !== 'round2' && (
                                                    <div style={{
                                                        fontSize: '1rem',
                                                        color: hasNoTarget ? '#94a3b8' : '#475569',
                                                        fontWeight: 400,
                                                        lineHeight: '1.5'
                                                    }}>
                                                        📋 <strong>กิจกรรมย่อย:</strong> {stripLeadingNumber(project.subActivity || '')}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedRound !== 'round2' && !hasNoTarget && (
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: '#10b981',
                                                    fontWeight: 500,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {project.budget}
                                                </span>
                                            )}
                                        </div>

                                        {/* Collapsible Content */}
                                        <div style={{ display: !isExpanded ? 'none' : 'block', opacity: hasNoTarget ? 0.75 : 1 }}>
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
                                                            {selectedRound !== 'round2' && (
                                                                <div>
                                                                    <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>กิจกรรมย่อย:</label>
                                                                    <textarea
                                                                        value={project.subActivity}
                                                                        onChange={(e) => handleChange(group.id, index, 'subActivity', e.target.value)}
                                                                        style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical' }}
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                            )}
                                                            {selectedRound !== 'round2' && (
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
                                                            )}
                                                            <div style={{ gridColumn: '1 / -1' }}>
                                                                <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>ประเด็นเน้นย้ำ (เลือกได้หลายข้อ):</label>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: '6px',
                                                                    padding: '10px',
                                                                    background: '#f8fafc',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e2e8f0'
                                                                }}>
                                                                    {POLICY_OPTIONS.map(policy => {
                                                                        const isSelected = (project.relevantPolicies || '').includes(`ข้อ ${policy.id}.`);
                                                                        return (
                                                                            <button
                                                                                key={policy.id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const current = project.relevantPolicies || '';
                                                                                    const policyRef = `ข้อ ${policy.id}.`;
                                                                                    let newValue: string;
                                                                                    if (current.includes(policyRef)) {
                                                                                        // Remove
                                                                                        newValue = current
                                                                                            .split(' และ ')
                                                                                            .filter(p => !p.includes(policyRef))
                                                                                            .join(' และ ');
                                                                                    } else {
                                                                                        // Add
                                                                                        const parts = current ? current.split(' และ ').filter(p => p.trim()) : [];
                                                                                        parts.push(policyRef + ' ' + policy.label.replace(/^ข้อ \d+\. /, ''));
                                                                                        newValue = parts.join(' และ ');
                                                                                    }
                                                                                    handleChange(group.id, index, 'relevantPolicies', newValue || '-');
                                                                                }}
                                                                                style={{
                                                                                    padding: '4px 10px',
                                                                                    fontSize: '0.75rem',
                                                                                    borderRadius: '16px',
                                                                                    border: isSelected ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                                                                    background: isSelected ? '#dcfce7' : 'white',
                                                                                    color: isSelected ? '#166534' : '#475569',
                                                                                    cursor: 'pointer',
                                                                                    fontWeight: isSelected ? 600 : 400,
                                                                                    transition: 'all 0.15s ease'
                                                                                }}
                                                                            >
                                                                                {isSelected ? '✓ ' : ''}{policy.id}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {project.relevantPolicies && project.relevantPolicies !== '-' && (
                                                                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#059669', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px' }}>
                                                                        สอดคล้องกับ: {project.relevantPolicies}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {project.relevantPolicies && project.relevantPolicies !== '-' && (
                                                                <div className="relevant-policies-box">
                                                                    <span style={{ color: '#059669', fontWeight: 500 }}>🎯 สอดคล้องกับ:</span> {project.relevantPolicies}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                {selectedRound !== 'round2' && (
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
                                                )}
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
 
                                                {selectedRound === 'round2' && (
                                                    <div className="feedback-item" style={{ marginTop: '16px' }}>
                                                        <div className="feedback-label" style={{ color: '#0369a1' }}>
                                                            <FaChartLine className="icon" style={{ color: '#0369a1' }} /> ความก้าวหน้า
                                                        </div>
                                                        {isEditing ? (
                                                            <textarea
                                                                className="edit-textarea"
                                                                value={project.progress || ''}
                                                                onChange={(e) => handleChange(group.id, index, 'progress', e.target.value)}
                                                                rows={3}
                                                                placeholder="ระบุความก้าวหน้า..."
                                                            />
                                                        ) : (
                                                            <div className="feedback-content">{project.progress || '-'}</div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="feedback-row presentation-problems">
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
                                                <div className="presentation-gallery" style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                        <div className="feedback-label" style={{ marginBottom: 0 }}>
                                                            <FaImage className="icon" /> รูปภาพประกอบ
                                                        </div>
                                                        {isEditing && (
                                                            <button
                                                                onClick={() => {
                                                                    const input = document.createElement('input');
                                                                    input.type = 'file';
                                                                    input.accept = 'image/*';
                                                                    input.onchange = (event: any) => {
                                                                        if (event.target.files && event.target.files[0]) {
                                                                            uploadFile(event.target.files[0], project.name, group.id, index);
                                                                        }
                                                                    };
                                                                    input.click();
                                                                }}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                                                            >
                                                                <FaPlus size={12} /> อัปโหลดรูปภาพ
                                                            </button>
                                                        )}
                                                    </div>

                                                    {isEditing && (
                                                        <div
                                                            onDragOver={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.style.borderColor = '#059669';
                                                                e.currentTarget.style.background = '#f0fdf4';
                                                            }}
                                                            onDragLeave={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.style.borderColor = '#cbd5e1';
                                                                e.currentTarget.style.background = '#f8fafc';
                                                            }}
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.style.borderColor = '#cbd5e1';
                                                                e.currentTarget.style.background = '#f8fafc';
                                                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                                    const file = e.dataTransfer.files[0];
                                                                    if (file.type.startsWith('image/')) {
                                                                        uploadFile(file, project.name, group.id, index);
                                                                    } else {
                                                                        alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
                                                                    }
                                                                }
                                                            }}
                                                            onClick={() => {
                                                                const input = document.createElement('input');
                                                                input.type = 'file';
                                                                input.accept = 'image/*';
                                                                input.onchange = (event: any) => {
                                                                    if (event.target.files && event.target.files[0]) {
                                                                        uploadFile(event.target.files[0], project.name, group.id, index);
                                                                    }
                                                                };
                                                                input.click();
                                                            }}
                                                            style={{
                                                                border: '2px dashed #cbd5e1',
                                                                borderRadius: '8px',
                                                                padding: '20px',
                                                                textAlign: 'center',
                                                                background: '#f8fafc',
                                                                cursor: 'pointer',
                                                                transition: 'border-color 0.2s, background 0.2s',
                                                                marginBottom: '16px'
                                                            }}
                                                        >
                                                            {uploadingStatus[`${group.id}-${index}`] ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#059669' }}>
                                                                    <FiLoader className="spin" size={18} />
                                                                    <span>กำลังอัปโหลดรูปภาพ...</span>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <FaImage style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '6px' }} />
                                                                    <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
                                                                        ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่ออัปโหลดไฟล์จากเครื่อง
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                                                        รองรับไฟล์ PNG, JPG, JPEG
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {isEditing && (
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                                            <input
                                                                aria-label="URL รูปภาพ"
                                                                type="url"
                                                                value={imageUrl}
                                                                onChange={(e) => setImageUrl(e.target.value)}
                                                                placeholder="https://example.com/image.jpg"
                                                                style={{ flex: 1, padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddImageUrl(group.id, index)}
                                                                style={{ padding: '8px 12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                            >
                                                                เพิ่มจาก URL
                                                            </button>
                                                        </div>
                                                    )}

                                                    {project.images && project.images.length > 0 ? (
                                                        <div className="presentation-image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
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
                                                                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                                                                    }}
                                                                >
                                                                    <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
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
                                                                        {!isEditing && (
                                                                            <div style={{
                                                                                position: 'absolute',
                                                                                bottom: '8px',
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
                                                                    </div>
                                                                    {isEditing ? (
                                                                        <div style={{
                                                                            padding: '10px',
                                                                            background: '#f8fafc',
                                                                            borderTop: '1px solid #e2e8f0'
                                                                        }}>
                                                                            <input
                                                                                type="text"
                                                                                value={img.caption || ''}
                                                                                placeholder="พิมพ์คำอธิบายรูปภาพ..."
                                                                                onChange={(e) => {
                                                                                    const newImages = [...(project.images || [])];
                                                                                    newImages[imgIdx] = { ...newImages[imgIdx], caption: e.target.value };
                                                                                    handleChange(group.id, index, 'images', newImages);
                                                                                }}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    padding: '6px 8px',
                                                                                    border: '1px solid #cbd5e1',
                                                                                    borderRadius: '6px',
                                                                                    fontSize: '0.85rem',
                                                                                    color: '#334155',
                                                                                    boxSizing: 'border-box'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        img.caption && (
                                                                            <div style={{
                                                                                padding: '10px 12px',
                                                                                fontSize: '0.9rem',
                                                                                color: '#475569',
                                                                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                                                                borderTop: '1px solid #e2e8f0'
                                                                            }}>
                                                                                {img.caption}
                                                                            </div>
                                                                        )
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
                                                            {isEditing ? 'อัปโหลดรูปภาพเพื่อใส่รูปประกอบ' : 'ไม่มีรูปภาพประกอบ'}
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
                .presentation-gallery {
                    order: 2;
                }
                .presentation-problems {
                    order: 3;
                }
                @media (max-width: 900px) {
                    .presentation-image-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 600px) {
                    .presentation-image-grid {
                        grid-template-columns: 1fr !important;
                    }
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
