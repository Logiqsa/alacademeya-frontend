import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { maskEmail, shortenDisplayName } from '../src/utils/protectedContentIdentity.js';

test('protected playback identity is privacy-safe', () => {
  assert.equal(shortenDisplayName({ fullName: 'Ahmed Mohamed Hassan' }), 'Ahmed H.');
  assert.equal(maskEmail('Ahmed.Person@gmail.com'), 'ah***@gmail.com');
  assert.doesNotMatch(maskEmail('Ahmed.Person@gmail.com'), /Ahmed\.Person/i);
});

test('learner video and audio use scoped browser deterrents without global context-menu blocking', () => {
  const source = fs.readFileSync(new URL('../src/features/course-management/pages/student/CoursePlayerPage.jsx', import.meta.url), 'utf8');
  const mediaPlayer = fs.readFileSync(new URL('../src/components/media/BrandMediaPlayer.jsx', import.meta.url), 'utf8');
  assert.match(source, /BrandMediaPlayer/);
  assert.match(mediaPlayer, /controlsList="nodownload noremoteplayback"/);
  assert.match(mediaPlayer, /disablePictureInPicture/);
  assert.match(mediaPlayer, /onContextMenu=\{\(event\) => event\.preventDefault\(\)\}/);
  assert.doesNotMatch(`${source}\n${mediaPlayer}`, /document\.oncontextmenu|window\.oncontextmenu|addEventListener\(['"]contextmenu/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB/);
});

test('watermark is non-interactive and changes among multiple positions', () => {
  const source = fs.readFileSync(new URL('../src/components/course/ProtectedContentWatermark.jsx', import.meta.url), 'utf8');
  assert.match(source, /pointer-events-none/);
  assert.match(source, /POSITIONS/);
  assert.match(source, /setTimeout/);
  assert.match(source, /Math\.random/);
});

test('attachment access modes drive distinct learner actions and instructor selection', () => {
  const player = fs.readFileSync(new URL('../src/features/course-management/pages/student/CoursePlayerPage.jsx', import.meta.url), 'utf8');
  const editor = fs.readFileSync(new URL('../src/features/course-management/pages/TeacherCourseFormPage.jsx', import.meta.url), 'utf8');
  const api = fs.readFileSync(new URL('../src/services/APIService.js', import.meta.url), 'utf8');
  assert.match(player, /data\.accessMode === 'view_only'/);
  assert.match(player, /عرض فقط \/ View only/);
  assert.match(player, /قابل للتنزيل \/ Downloadable/);
  assert.match(player, /attachmentViewer.*ProtectedContentWatermark/s);
  assert.doesNotMatch(player, /attachmentViewer[\s\S]{0,1000}<a[^>]+download/);
  assert.match(editor, /value="view_only"/);
  assert.match(editor, /value="downloadable"/);
  assert.match(api, /formData\.append\("accessMode", accessMode\)/);
  assert.doesNotMatch(player, /localStorage|sessionStorage|indexedDB/);
});

test('opaque playback uses credentialed requests, exposes no bearer URL, and renews once at the current position', () => {
  const player = fs.readFileSync(new URL('../src/features/course-management/pages/student/CoursePlayerPage.jsx', import.meta.url), 'utf8');
  const preview = fs.readFileSync(new URL('../src/pages/CourseDetailsPage.jsx', import.meta.url), 'utf8');
  const admin = fs.readFileSync(new URL('../src/features/course-management/pages/AdminCourseDetailsPage.jsx', import.meta.url), 'utf8');
  const api = fs.readFileSync(new URL('../src/services/APIService.js', import.meta.url), 'utf8');
  const mediaPlayer = fs.readFileSync(new URL('../src/components/media/BrandMediaPlayer.jsx', import.meta.url), 'utf8');
  assert.match(api, /media-access[\s\S]{0,160}withCredentials: true/);
  assert.match(player, /data\?\.playbackUrl/);
  assert.doesNotMatch(player, /data\?\.(?:url|token|ticket)/);
  assert.match(mediaPlayer, /crossOrigin="use-credentials"/);
  assert.match(preview, /crossOrigin="use-credentials"/);
  assert.match(preview, /fetch\(ticketUrl, \{ credentials: 'include' \}\)/);
  assert.match(admin, /BrandMediaPlayer/);
  assert.match(player, /mediaRefreshRef\.current >= 1/);
  assert.match(player, /mediaRef\.current\?\.currentTime/);
  assert.match(player, /event\.currentTarget\.currentTime = savedPosition/);
  assert.doesNotMatch(player, /localStorage|sessionStorage|indexedDB/);
});
