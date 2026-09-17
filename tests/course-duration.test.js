import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCourseDuration } from '../src/utils/courseDuration.js';

test('course duration uses fractional hours and distinguishes missing duration', () => {
  assert.equal(formatCourseDuration({ durationSeconds: 1800, duration: 0 }), '0.5 ساعة');
  assert.equal(formatCourseDuration({ durationSeconds: 4500, duration: 0 }), '1.25 ساعة');
  assert.equal(formatCourseDuration({ duration: 0.75 }), '0.75 ساعة');
  assert.equal(formatCourseDuration({ durationSeconds: 0, duration: 0 }), 'المدة غير محددة');
});
