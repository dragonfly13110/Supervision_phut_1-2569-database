import { useState, useEffect } from 'react'
import { FiUsers, FiImage, FiEdit3, FiCopy, FiCheck, FiUploadCloud, FiSettings } from 'react-icons/fi'
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

// GitHub config
const GITHUB_OWNER = 'dragonfly13110'
const GITHUB_REPO = 'Supervision_phut_1-2569'
const GITHUB_FILE_PATH = 'src/data/assetData.ts'
const GITHUB_BRANCH = 'main'

export function SectionGroupReports() {
    const [notes, setNotes] = useState<NotesState>({})
    const [copied, setCopied] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [githubToken, setGithubToken] = useState('')
    const [pushing, setPushing] = useState(false)
    const [pushStatus, setPushStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [pushMessage, setPushMessage] = useState('')

    // Load notes and token from localStorage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('groupReportsNotes')
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes))
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

    // Save token to localStorage
    useEffect(() => {
        if (githubToken) {
            localStorage.setItem('githubToken', githubToken)
        }
    }, [githubToken])

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

    // Generate updated groupReports data with notes
    const generateUpdatedData = () => {
        return groupReports.map(group => ({
            ...group,
            responsibilities: group.responsibilities.map((item: ResponsibilityItem, idx: number) => ({
                ...item,
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
        const currentContent = atob(data.content)

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
                        message: `Update notes - ${new Date().toLocaleString('th-TH')}`,
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
                            {group.responsibilities.map((item: ResponsibilityItem, idx: number) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#f9fafb',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        borderLeft: '4px solid #2d7a32'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#1f2937',
                                            margin: 0
                                        }}>
                                            📌 {item.topic}
                                        </h4>
                                        <span style={{
                                            ...getStatusStyle(item.status),
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#4b5563',
                                        lineHeight: 1.6,
                                        margin: 0,
                                        marginBottom: '12px'
                                    }}>
                                        {item.detail}
                                    </p>

                                    {/* Image Gallery for each task */}
                                    <div style={{ marginBottom: '12px' }}>
                                        {item.images && item.images.length > 0 ? (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                                gap: '10px'
                                            }}>
                                                {item.images.map((img, imgIdx) => (
                                                    <div key={imgIdx} style={{
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        border: '1px solid #e5e7eb',
                                                        background: '#fff'
                                                    }}>
                                                        <img
                                                            src={img.url}
                                                            alt={img.caption || `ภาพที่ ${imgIdx + 1}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '120px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        {img.caption && (
                                                            <div style={{
                                                                padding: '6px 10px',
                                                                fontSize: '11px',
                                                                color: '#6b7280',
                                                                background: '#f9fafb'
                                                            }}>
                                                                {img.caption}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                gap: '10px'
                                            }}>
                                                {[1, 2].map((n) => (
                                                    <div key={n} style={{
                                                        width: '120px',
                                                        height: '80px',
                                                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                                        borderRadius: '8px',
                                                        border: '2px dashed #d1d5db',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '4px',
                                                        color: '#9ca3af',
                                                        flexShrink: 0
                                                    }}>
                                                        <FiImage size={20} />
                                                        <span style={{ fontSize: '10px' }}>รอใส่รูป</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Editable Notes Field - BELOW IMAGES */}
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            color: '#6b7280',
                                            marginBottom: '6px'
                                        }}>
                                            <FiEdit3 size={14} />
                                            <span>โน้ตเพิ่มเติม (กรอกได้เลย)</span>
                                        </div>
                                        <textarea
                                            value={getNote(group.id, idx)}
                                            onChange={(e) => updateNote(group.id, idx, e.target.value)}
                                            placeholder="พิมพ์โน้ตที่นี่... (บันทึกอัตโนมัติใน browser)"
                                            style={{
                                                width: '100%',
                                                minHeight: '60px',
                                                padding: '10px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                resize: 'vertical',
                                                fontFamily: 'inherit',
                                                background: '#fff'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
