import type { VercelRequest, VercelResponse } from '@vercel/node';

type UploadBody = { projectName?: string; filename?: string; fileData?: string };

export const validateUpload = ({ projectName, filename, fileData }: UploadBody) => {
    if (!projectName || !fileData || !filename || !/\.(png|jpe?g)$/i.test(filename)) {
        return { error: 'รองรับเฉพาะไฟล์ PNG, JPG และ JPEG' };
    }
    return null;
};

const cleanName = (value: string) => value.replace(/[\r\n\x00-\x1f\\/:*?"<>|]/g, '_').trim();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const upload = validateUpload(req.body || {});
    if (upload) return res.status(400).json(upload);

    const { projectName, filename, fileData } = req.body as Required<UploadBody>;
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token || !owner || !repo) {
        return res.status(500).json({ error: 'ยังไม่ได้ตั้งค่า GitHub สำหรับอัปโหลดรูปภาพ' });
    }

    const folder = cleanName(projectName);
    const safeFilename = cleanName(filename);
    const filePath = `public/project-images/${folder}/${safeFilename}`;

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
            body: JSON.stringify({ message: `feat: add project image ${safeFilename}`, content: fileData, branch }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return res.status(response.status).json({ error: data.message || 'อัปโหลดรูปภาพไป GitHub ไม่สำเร็จ' });
        }

        return res.status(201).json({ success: true, url: `/project-images/${encodeURIComponent(folder)}/${encodeURIComponent(safeFilename)}` });
    } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'ไม่สามารถเชื่อมต่อ GitHub เพื่ออัปโหลดรูปภาพได้' });
    }
}
