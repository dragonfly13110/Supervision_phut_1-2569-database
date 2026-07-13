# บันทึกข้อมูลขึ้น GitHub และ deploy อัตโนมัติ

## เป้าหมาย

เมื่อผู้ใช้กดบันทึกในทุกหน้าข้อมูล เว็บจะบันทึก JSON ที่เกี่ยวข้องขึ้น GitHub แล้วให้ GitHub Actions build และ deploy Cloudflare Workers อัตโนมัติ

## ขอบเขต

- ใช้ API เดียว `POST /api/save-data` สำหรับ `detailedBudgetProjects`, `budgetData`, `generalAssets`, `projectAssets` และ `otherIssues` ของทั้งสองรอบ
- Worker ตรวจชื่อไฟล์จาก allowlist, รับข้อมูล JSON, อ่าน SHA เดิมจาก GitHub และสร้างหรืออัปเดตไฟล์บน branch `main`
- Browser เก็บ localStorage เป็นสำเนาทันที แต่ถือว่าบันทึกสำเร็จเมื่อ Worker ตอบกลับจาก GitHub เท่านั้น
- เพิ่ม GitHub Actions ให้ build แล้ว deploy Worker ทุก push เข้า `main`

## ความปลอดภัยและข้อผิดพลาด

- `GITHUB_TOKEN` อยู่เป็น Cloudflare Worker secret ไม่ส่งสู่ browser
- Worker ปฏิเสธ method, ชื่อไฟล์ หรือ JSON ที่ไม่ถูกต้อง
- หาก GitHub ล้มเหลว หน้าจอจะแจ้งข้อผิดพลาดและผู้ใช้ยังมีข้อมูลใน browser เพื่อแก้หรือกดบันทึกซ้ำ
- GitHub Actions ใช้ `CLOUDFLARE_API_TOKEN` และ `CLOUDFLARE_ACCOUNT_ID` เป็น GitHub repository secrets

## ลำดับการทำงาน

1. ผู้ใช้แก้และกดบันทึก
2. เว็บเรียก `/api/save-data`
3. Worker commit JSON ไป GitHub
4. GitHub Actions build `dist` และ deploy Worker
5. Cloudflare เผยแพร่ข้อมูลใหม่

## การทดสอบ

- ทดสอบ Worker ว่าปฏิเสธไฟล์นอก allowlist และส่ง PUT ที่มี SHA เมื่อไฟล์เดิมมีอยู่
- ทดสอบ `updateSheetData` ว่าเรียก API และส่งชื่อไฟล์ตามรอบที่เลือก
- build และ deploy ผ่าน GitHub Actions จาก commit ทดสอบ

## ข้อยกเว้นที่ตั้งใจไว้

- ไม่ทำระบบแก้ไขพร้อมกันหลายคน; หากแก้ไฟล์เดียวกันพร้อมกัน GitHub อาจตอบ conflict และให้ผู้ใช้บันทึกซ้ำ
