import assert from 'node:assert/strict';
import test from 'node:test';
import { validateUpload } from './upload-image.ts';

test('rejects a non-image filename', () => {
    assert.deepEqual(
        validateUpload({ projectName: 'โครงการทดสอบ', filename: 'notes.txt', fileData: 'Zg==' }),
        { error: 'รองรับเฉพาะไฟล์ PNG, JPG และ JPEG' },
    );
});

test('accepts a JPG upload', () => {
    assert.equal(
        validateUpload({ projectName: 'โครงการทดสอบ', filename: 'photo.jpg', fileData: 'Zg==' }),
        null,
    );
});
