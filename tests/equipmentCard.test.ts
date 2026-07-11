import assert from 'node:assert/strict'
import test from 'node:test'
import { getEquipmentCardStatus, getEquipmentIssueDetails, isUnavailableEquipment } from '../src/utils/equipmentCard.ts'

test('uses condition labels for round-two equipment cards', () => {
    assert.equal(getEquipmentCardStatus('active', 'มีในระบบ', 'round2'), 'ใช้งานปกติ')
    assert.equal(getEquipmentCardStatus('warning', 'มีในระบบ', 'round2'), 'ไม่ได้ใช้งาน')
    assert.equal(getEquipmentCardStatus('danger', 'มีในระบบ', 'round2'), 'ชำรุด')
    assert.equal(getEquipmentCardStatus('inactive', 'ไม่มีในระบบ', 'round2'), 'ไม่มีในระบบ')
})

test('keeps round-one status labels and unavailable cards unchanged', () => {
    assert.equal(getEquipmentCardStatus('warning', 'รอซ่อม', 'round1'), 'รอซ่อม')
    assert.equal(isUnavailableEquipment('warning', 'ไม่มีในระบบ', 'round1'), true)
    assert.equal(isUnavailableEquipment('inactive', 'มีในระบบ', 'round2'), true)
})

test('keeps only meaningful issue fields', () => {
    assert.deepEqual(getEquipmentIssueDetails('  ', 'แนวทางแก้ไข'), [{ label: 'แนวทางแก้ไข:', value: 'แนวทางแก้ไข', color: '#166534' }])
    assert.deepEqual(getEquipmentIssueDetails('ชำรุด', ' - '), [{ label: 'ปัญหา:', value: 'ชำรุด', color: '#92400e' }])
})
