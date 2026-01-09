import { useState, useEffect } from 'react'
import { FiUsers, FiImage, FiEdit3, FiCopy, FiCheck, FiUploadCloud, FiSettings, FiX, FiPlus } from 'react-icons/fi'
import { groupReports } from '../data/assetData'

// Helper function to get status color
const getStatusStyle = (status: string) => {
    if (status.includes('แล้ว')) {
        return { background: '#dcfce7', color: '#166534' }
    } else if (status.includes('ล่าช้า') || status.includes('เฝ้าระวัง')) {
        return { background: '#fef3c7', color: '#92400e' }
    } else if (status.includes('จัดซื้อ') || status.includes('กำลัง') || status.includes('เตรียม')) {
        return { background: '#dbeafe', color: '#1e40af' }
    } else {
        return { background: '#f3f4f6', color: '#4b5563' }
    }
}

// Type for responsibility item
type ResponsibilityItem = {
    topic: string
    detail: string
    status: string
    images?: { url: string; caption?: string }[]
    notes?: string
}

// Type for notes state
type NotesState = { [groupId: string]: { [topicIdx: number]: string } }

// Type for edits state (topic, detail, status, images)
type EditsState = {
    [groupId: string]: {
        [topicIdx: number]: {
            topic?: string
            detail?: string
            status?: string
            images?: { url: string; caption?: string }[]
        }
    }
}

// Type for editing mode state
type EditingState = { [key: string]: boolean }

// GitHub config
const GITHUB_OWNER = 'dragonfly13110'
const GITHUB_REPO = 'Supervision_phut_1-2569'
const GITHUB_FILE_PATH = 'src/data/assetData.ts'
const GITHUB_BRANCH = 'main'

export function SectionGroupReports() {
    const [notes, setNotes] = useState<NotesState>({})
    const [edits, setEdits] = useState<EditsState>({})
    const [editing, setEditing] = useState<EditingState>({})
    const [copied, setCopied] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [githubToken, setGithubToken] = useState('')
    const [pushing, setPushing] = useState(false)
    const [pushStatus, setPushStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [pushMessage, setPushMessage] = useState('')

    // Load notes, edits and token from localStorage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('groupReportsNotes')
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes))
        }
        const savedEdits = localStorage.getItem('groupReportsEdits')
        if (savedEdits) {
            setEdits(JSON.parse(savedEdits))
        }
        const savedToken = localStorage.getItem('githubToken')
        if (savedToken) {
            setGithubToken(savedToken)
        }
    }, [])

    // Save notes to localStorage when changed
    useEffect(() => {
        if (Object.keys(notes).length > 0) {
            localStorage.setItem('groupReportsNotes', JSON.stringify(notes))
        }
    }, [notes])

    // Save edits to localStorage when changed
    useEffect(() => {
        if (Object.keys(edits).length > 0) {
            localStorage.setItem('groupReportsEdits', JSON.stringify(edits))
        }
    }, [edits])

    // Save token to localStorage
    useEffect(() => {
        if (githubToken) {
            localStorage.setItem('githubToken', githubToken)
        }
    }, [githubToken])

    // Get editing key for item
    const getEditKey = (groupId: string, idx: number) => `${groupId}-${idx}`

    // Toggle edit mode
    const toggleEdit = (groupId: string, idx: number) => {
        const key = getEditKey(groupId, idx)
        setEditing(prev => ({ ...prev, [key]: !prev[key] }))
    }

    // Check if item is in edit mode
    const isEditing = (groupId: string, idx: number) => {
        return editing[getEditKey(groupId, idx)] || false
    }

    const updateNote = (groupId: string, topicIdx: number, value: string) => {
        setNotes(prev => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [topicIdx]: value
            }
        }))
    }

    const getNote = (groupId: string, topicIdx: number): string => {
        return notes[groupId]?.[topicIdx] || ''
    }

    // Update edit field (topic, detail, status)
    const updateEdit = (groupId: string, topicIdx: number, field: 'topic' | 'detail' | 'status', value: string) => {
        setEdits(prev => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [topicIdx]: {
                    ...prev[groupId]?.[topicIdx],
                    [field]: value
                }
            }
        }))
    }

    // Get edit value or original value
    const getEditValue = (groupId: string, topicIdx: number, field: 'topic' | 'detail' | 'status', originalValue: string): string => {
        const editedValue = edits[groupId]?.[topicIdx]?.[field]
        return editedValue !== undefined ? editedValue : originalValue
    }

    // Get images (edited or original)
    const getImages = (groupId: string, topicIdx: number, originalImages?: { url: string; caption?: string }[]): { url: string; caption?: string }[] => {
        const editedImages = edits[groupId]?.[topicIdx]?.images
        return editedImages !== undefined ? editedImages : (originalImages || [])
    }

    // Add image URL
    const addImage = (groupId: string, topicIdx: number, url: string, caption?: string) => {
        const currentImages = getImages(groupId, topicIdx, groupReports.find(g => g.id === groupId)?.responsibilities[topicIdx]?.images)
        setEdits(prev => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [topicIdx]: {
                    ...prev[groupId]?.[topicIdx],
                    images: [...currentImages, { url, caption }]
                }
            }
        }))
    }

    // Remove image
    const removeImage = (groupId: string, topicIdx: number, imgIdx: number) => {
        const currentImages = getImages(groupId, topicIdx, groupReports.find(g => g.id === groupId)?.responsibilities[topicIdx]?.images)
        setEdits(prev => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [topicIdx]: {
                    ...prev[groupId]?.[topicIdx],
                    images: currentImages.filter((_, i) => i !== imgIdx)
                }
            }
        }))
    }

    // Generate updated groupReports data with notes and edits
    const generateUpdatedData = () => {
        return groupReports.map(group => ({
            ...group,
            responsibilities: group.responsibilities.map((item: ResponsibilityItem, idx: number) => ({
                ...item,
                topic: getEditValue(group.id, idx, 'topic', item.topic),
                detail: getEditValue(group.id, idx, 'detail', item.detail),
                status: getEditValue(group.id, idx, 'status', item.status),
                images: getImages(group.id, idx, item.images),
                notes: getNote(group.id, idx) || item.notes || ''
            }))
        }))
    }

    // Generate full file content
    const generateFileContent = async () => {
        // Fetch current file to get the parts before groupReports
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`,
            {
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        )

        if (!response.ok) {
            throw new Error('ไม่สามารถดึงไฟล์จาก GitHub ได้')
        }

        const data = await response.json()
        // Properly decode UTF-8 from base64
        const currentContent = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))))

        // Find the groupReports section and replace it
        const groupReportsStart = currentContent.indexOf('export const groupReports = [')
        if (groupReportsStart === -1) {
            throw new Error('ไม่พบ groupReports ในไฟล์')
        }

        // Find the end of groupReports array
        let bracketCount = 0
        let groupReportsEnd = groupReportsStart
        let foundStart = false

        for (let i = groupReportsStart; i < currentContent.length; i++) {
            if (currentContent[i] === '[') {
                bracketCount++
                foundStart = true
            } else if (currentContent[i] === ']') {
                bracketCount--
                if (foundStart && bracketCount === 0) {
                    groupReportsEnd = i + 1
                    break
                }
            }
        }

        const beforeGroupReports = currentContent.substring(0, groupReportsStart)
        const afterGroupReports = currentContent.substring(groupReportsEnd)

        const updatedData = generateUpdatedData()
        const newGroupReportsContent = `export const groupReports = ${JSON.stringify(updatedData, null, 4)}`

        return {
            content: beforeGroupReports + newGroupReportsContent + afterGroupReports,
            sha: data.sha
        }
    }

    // Push to GitHub
    const pushToGitHub = async () => {
        if (!githubToken) {
            setPushStatus('error')
            setPushMessage('กรุณาใส่ GitHub Token ก่อน')
            setShowSettings(true)
            return
        }

        setPushing(true)
        setPushStatus('idle')

        try {
            const { content, sha } = await generateFileContent()

            const updateResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Update group reports - ${new Date().toLocaleString('th-TH')}`,
                        content: btoa(unescape(encodeURIComponent(content))),
                        sha: sha,
                        branch: GITHUB_BRANCH
                    })
                }
            )

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json()
                throw new Error(errorData.message || 'Push ไม่สำเร็จ')
            }

            setPushStatus('success')
            setPushMessage('บันทึกขึ้น GitHub สำเร็จ!')
            // Exit all edit modes after successful push
            setEditing({})
            setTimeout(() => setPushStatus('idle'), 3000)
        } catch (error) {
            setPushStatus('error')
            setPushMessage(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
        } finally {
            setPushing(false)
        }
    }

    const copyToClipboard = async () => {
        const data = generateUpdatedData()
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Image URL input modal state
    const [imageModal, setImageModal] = useState<{ groupId: string; topicIdx: number } | null>(null)
    const [newImageUrl, setNewImageUrl] = useState('')
    const [newImageCaption, setNewImageCaption] = useState('')

    const handleAddImage = () => {
        if (imageModal && newImageUrl) {
            addImage(imageModal.groupId, imageModal.topicIdx, newImageUrl, newImageCaption)
            setImageModal(null)
            setNewImageUrl('')
            setNewImageCaption('')
        }
    }

    return (
        <section className="section">
            <div className="section-header">
                <div className="section-icon"><FiUsers /></div>
                <div style={{ flex: 1 }}>
                    <h2 className="section-title">ส่วนที่ 3: รายงานจากกลุ่มงาน</h2>
                    <p className="section-subtitle">ผลการดำเนินงานของแต่ละกลุ่มงาน (จากไฟล์ T&V 2568)</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        title="ตั้งค่า GitHub Token"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px',
                            background: showSettings ? '#374151' : '#f3f4f6',
                            color: showSettings ? '#fff' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <FiSettings size={18} />
                    </button>
                    <button
                        onClick={copyToClipboard}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 14px',
                            background: copied ? '#166534' : '#f3f4f6',
                            color: copied ? '#fff' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '14px'
                        }}
                    >
                        {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy</>}
                    </button>
                    <button
                        onClick={pushToGitHub}
                        disabled={pushing}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: pushing ? '#9ca3af' : pushStatus === 'success' ? '#166534' : pushStatus === 'error' ? '#dc2626' : '#2d7a32',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: pushing ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            fontSize: '14px'
                        }}
                    >
                        <FiUploadCloud /> {pushing ? 'กำลังบันทึก...' : 'บันทึกขึ้น GitHub'}
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div style={{
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ marginBottom: '12px', fontWeight: 600, color: '#374151' }}>
                        ⚙️ ตั้งค่า GitHub Personal Access Token
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                        สร้าง Token ได้ที่: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>github.com/settings/tokens</a>
                        <br />⚠️ Token จะเก็บใน browser นี้เท่านั้น
                    </div>
                    <input
                        type="password"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>
            )}

            {/* Push Status Message */}
            {pushStatus !== 'idle' && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    background: pushStatus === 'success' ? '#dcfce7' : '#fee2e2',
                    color: pushStatus === 'success' ? '#166534' : '#991b1b',
                    fontWeight: 500
                }}>
                    {pushStatus === 'success' ? '✅' : '❌'} {pushMessage}
                </div>
            )}

            {/* Image URL Modal */}
            {imageModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>🖼️ เพิ่มรูปภาพ</h3>
                            <button
                                onClick={() => setImageModal(null)}
                                style={{
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 500 }}>
                                URL รูปภาพ *
                            </label>
                            <input
                                type="url"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 500 }}>
                                คำอธิบาย (ไม่บังคับ)
                            </label>
                            <input
                                type="text"
                                value={newImageCaption}
                                onChange={(e) => setNewImageCaption(e.target.value)}
                                placeholder="เช่น ภาพการประชุม"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        {newImageUrl && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>ตัวอย่าง (3:4)</div>
                                <div style={{
                                    width: '160px',
                                    aspectRatio: '4/3',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <img
                                        src={newImageUrl}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setImageModal(null)}
                                style={{
                                    padding: '10px 20px',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleAddImage}
                                disabled={!newImageUrl}
                                style={{
                                    padding: '10px 20px',
                                    background: newImageUrl ? '#2d7a32' : '#9ca3af',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: newImageUrl ? 'pointer' : 'not-allowed',
                                    fontWeight: 500
                                }}
                            >
                                เพิ่มรูป
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {groupReports.map((group) => (
                    <div
                        key={group.id}
                        className="card"
                        style={{ padding: '24px' }}
                    >
                        {/* Group Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px',
                            paddingBottom: '16px',
                            borderBottom: '2px solid #e5e7eb'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #2d7a32 0%, #1a5a22 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                            }}>
                                {group.icon}
                            </div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#1a5a22',
                                margin: 0
                            }}>
                                {group.groupName}
                            </h3>
                        </div>

                        {/* Responsibilities */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {group.responsibilities.map((item: ResponsibilityItem, idx: number) => {
                                const editMode = isEditing(group.id, idx)
                                const images = getImages(group.id, idx, item.images)

                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            background: editMode ? '#fffbeb' : '#f9fafb',
                                            borderRadius: '12px',
                                            padding: '16px 20px',
                                            borderLeft: `4px solid ${editMode ? '#f59e0b' : '#2d7a32'}`,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {/* Header with Edit Button */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '12px'
                                        }}>
                                            <span style={{
                                                ...getStatusStyle(getEditValue(group.id, idx, 'status', item.status)),
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                {getEditValue(group.id, idx, 'status', item.status)}
                                            </span>
                                            <button
                                                onClick={() => toggleEdit(group.id, idx)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    background: editMode ? '#f59e0b' : '#e5e7eb',
                                                    color: editMode ? '#fff' : '#374151',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 500,
                                                    fontSize: '13px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {editMode ? <><FiCheck size={14} /> บันทึก</> : <><FiEdit3 size={14} /> แก้ไข</>}
                                            </button>
                                        </div>

                                        {/* Topic */}
                                        {editMode ? (
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>📌 หัวข้อ</div>
                                                <input
                                                    type="text"
                                                    value={getEditValue(group.id, idx, 'topic', item.topic)}
                                                    onChange={(e) => updateEdit(group.id, idx, 'topic', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '2px solid #f59e0b',
                                                        borderRadius: '8px',
                                                        fontSize: '15px',
                                                        fontWeight: 600,
                                                        color: '#1f2937',
                                                        background: '#fff'
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <h4 style={{
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                color: '#1f2937',
                                                margin: '0 0 8px 0'
                                            }}>
                                                📌 {getEditValue(group.id, idx, 'topic', item.topic)}
                                            </h4>
                                        )}

                                        {/* Detail */}
                                        {editMode ? (
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>📝 รายละเอียด</div>
                                                <textarea
                                                    value={getEditValue(group.id, idx, 'detail', item.detail)}
                                                    onChange={(e) => updateEdit(group.id, idx, 'detail', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '80px',
                                                        padding: '10px 12px',
                                                        border: '2px solid #f59e0b',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        color: '#4b5563',
                                                        lineHeight: 1.6,
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit',
                                                        background: '#fff'
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#4b5563',
                                                lineHeight: 1.6,
                                                margin: '0 0 12px 0'
                                            }}>
                                                {getEditValue(group.id, idx, 'detail', item.detail)}
                                            </p>
                                        )}

                                        {/* Status Dropdown (only in edit mode) */}
                                        {editMode && (
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>🏷️ สถานะ</div>
                                                <select
                                                    value={getEditValue(group.id, idx, 'status', item.status)}
                                                    onChange={(e) => updateEdit(group.id, idx, 'status', e.target.value)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        border: '2px solid #f59e0b',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        background: '#fff'
                                                    }}
                                                >
                                                    <option value="ดำเนินการแล้ว">ดำเนินการแล้ว</option>
                                                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                                                    <option value="เตรียมการ">เตรียมการ</option>
                                                    <option value="รอจัดซื้อ">รอจัดซื้อ</option>
                                                    <option value="เฝ้าระวัง">เฝ้าระวัง</option>
                                                    <option value="ล่าช้า">ล่าช้า</option>
                                                    <option value={item.status}>{item.status}</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Image Gallery - 3:4 aspect ratio */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>🖼️ รูปภาพ</div>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                                gap: '12px'
                                            }}>
                                                {images.map((img, imgIdx) => (
                                                    <div key={imgIdx} style={{
                                                        position: 'relative',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        border: '1px solid #e5e7eb',
                                                        background: '#fff'
                                                    }}>
                                                        <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                                                            <img
                                                                src={img.url}
                                                                alt={img.caption || `ภาพที่ ${imgIdx + 1}`}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </div>
                                                        {img.caption && (
                                                            <div style={{
                                                                padding: '8px 10px',
                                                                fontSize: '12px',
                                                                color: '#6b7280',
                                                                background: '#f9fafb'
                                                            }}>
                                                                {img.caption}
                                                            </div>
                                                        )}
                                                        {editMode && (
                                                            <button
                                                                onClick={() => removeImage(group.id, idx, imgIdx)}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '6px',
                                                                    right: '6px',
                                                                    background: '#dc2626',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '50%',
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                                }}
                                                            >
                                                                <FiX size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Add Image Button (clickable) */}
                                                <div
                                                    onClick={() => setImageModal({ groupId: group.id, topicIdx: idx })}
                                                    style={{
                                                        aspectRatio: '4/3',
                                                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                                        borderRadius: '10px',
                                                        border: '2px dashed #d1d5db',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        color: '#9ca3af',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        minHeight: '100px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = '#2d7a32'
                                                        e.currentTarget.style.color = '#2d7a32'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = '#d1d5db'
                                                        e.currentTarget.style.color = '#9ca3af'
                                                    }}
                                                >
                                                    <FiPlus size={28} />
                                                    <span style={{ fontSize: '12px', fontWeight: 500 }}>คลิกเพิ่มรูป</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Field */}
                                        {editMode ? (
                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                    marginBottom: '6px'
                                                }}>
                                                    <FiEdit3 size={14} />
                                                    <span>โน้ตเพิ่มเติม</span>
                                                </div>
                                                <textarea
                                                    value={getNote(group.id, idx)}
                                                    onChange={(e) => updateNote(group.id, idx, e.target.value)}
                                                    placeholder="พิมพ์โน้ตที่นี่..."
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '60px',
                                                        padding: '10px 12px',
                                                        border: '2px solid #f59e0b',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit',
                                                        background: '#fff'
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            getNote(group.id, idx) && (
                                                <div style={{
                                                    background: '#fff',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>📝 โน้ต:</div>
                                                    <div style={{ fontSize: '14px', color: '#374151' }}>{getNote(group.id, idx)}</div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
