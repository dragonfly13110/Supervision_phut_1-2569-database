export type OtherIssueUnit = {
    name: string
    item1: string
    item2: string
}

const unitNames = [
    'ฝ่ายบริหารทั่วไป',
    'กลุ่มยุทธศาสตร์และสารสนเทศ',
    'กลุ่มส่งเสริมและพัฒนาเกษตรกร',
    'กลุ่มส่งเสริมและพัฒนาการผลิต',
    'กลุ่มอารักขาพืช',
    'สำนักงานเกษตรอำเภอ',
]

export const createUnits = (_content: string): OtherIssueUnit[] =>
    unitNames.map(name => ({ name, item1: '', item2: '' }))
