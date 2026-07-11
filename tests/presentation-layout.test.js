import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('places the image gallery before problems and uses three columns', () => {
    const source = fs.readFileSync('src/components/SectionBudgetDetailed.tsx', 'utf8');

    assert.match(source, /\.presentation-gallery\s*\{\s*order:\s*2/);
    assert.match(source, /\.presentation-problems\s*\{\s*order:\s*3/);
    assert.ok(source.includes("gridTemplateColumns: 'repeat(3, 1fr)'"));
});
