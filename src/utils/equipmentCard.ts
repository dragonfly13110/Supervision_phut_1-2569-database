export function getEquipmentCardStatus(status: string, statusText: string, round: 'round1' | 'round2'): string {
    if (round !== 'round2') return statusText

    return {
        active: 'ใช้งานปกติ',
        good: 'ใช้งานปกติ',
        warning: 'ไม่ได้ใช้งาน',
        danger: 'ชำรุด',
        inactive: 'ไม่มีในระบบ',
    }[status] || statusText
}

export function isUnavailableEquipment(status: string, statusText: string, round: 'round1' | 'round2'): boolean {
    return round === 'round2' ? status === 'inactive' || statusText === 'ไม่มีในระบบ' : statusText === 'ไม่มีในระบบ'
}

export function getEquipmentIssueDetails(problem: string | undefined, solution: string | undefined) {
    return [
        { label: 'ปัญหา:', value: problem?.trim(), color: '#92400e' },
        { label: 'แนวทางแก้ไข:', value: solution?.trim(), color: '#166534' },
    ].filter((detail): detail is { label: string; value: string; color: string } => Boolean(detail.value && detail.value !== '-'))
}
