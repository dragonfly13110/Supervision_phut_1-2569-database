import assert from 'node:assert/strict';
import test from 'node:test';
import { isImageUrl } from '../src/utils/imageUrl.ts';

test('accepts an HTTPS image URL', () => {
    assert.equal(isImageUrl('https://example.com/photo.jpg'), true);
});

test('rejects a non-HTTP image URL', () => {
    assert.equal(isImageUrl('file:///photo.jpg'), false);
});
