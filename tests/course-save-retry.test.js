import test from 'node:test';
import assert from 'node:assert/strict';
import { retryCourseSaveStep } from '../src/features/course-management/api/retryCourseSaveStep.js';

test('retry resumes only the failed save operation', async () => {
  const statuses = [];
  let attempts = 0;
  let retry;
  const pending = retryCourseSaveStep({
    key: 'lesson:1',
    label: 'رفع ملف الدرس',
    operation: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('network error');
      return 'saved';
    },
    onStatus: ({ status }) => statuses.push(status),
    onRetryRequired: (request) => { retry = request.retry; },
  });
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(statuses, ['running', 'failed']);
  retry();
  assert.equal(await pending, 'saved');
  assert.equal(attempts, 2);
  assert.deepEqual(statuses, ['running', 'failed', 'running']);
});

test('cancel leaves the failed step visible and stops saving', async () => {
  let cancel;
  const pending = retryCourseSaveStep({
    key: 'lesson:1',
    label: 'رفع ملف الدرس',
    operation: async () => { throw new Error('upload failed'); },
    onRetryRequired: (request) => { cancel = request.cancel; },
  });
  await Promise.resolve();
  await Promise.resolve();
  cancel();
  await assert.rejects(pending, /upload failed/);
});
