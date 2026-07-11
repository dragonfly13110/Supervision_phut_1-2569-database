import assert from 'node:assert/strict';
import test from 'node:test';
import { createUnits } from './otherIssueUnits.ts';

test('creates six editable unit records', () => {
    const units = createUnits('');

    assert.equal(units.length, 6);
    assert.deepEqual(units[0], { name: 'ฝ่ายบริหารทั่วไป', item1: '', item2: '' });
});
