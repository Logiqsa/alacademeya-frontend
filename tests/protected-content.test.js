import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getProtectedContentIdentity, shortenDisplayName } from '../src/utils/protectedContentIdentity.js';

test('protected playback identity is privacy-safe', () => {
  assert.equal(shortenDisplayName('Ahmed Mohamed Hassan'), 'Ahmed Mohamed Hassan');
  const identity = getProtectedContentIdentity({
    _id: '507f1f77bcf86cd799439011',
    email: 'Ahmed.Person@gmail.com',
    watermarkIdentity: { displayName: 'Ahmed Mohamed Hassan', viewerId: 'a7k9q2m4tx' },
  });
  assert.deepEqual(identity, { displayName: 'Ahmed Mohamed Hassan', viewerId: 'A7K9Q2M4TX' });
  assert.doesNotMatch(JSON.stringify(identity), /Ahmed\.Person@gmail\.com|507f1f77bcf86cd799439011/i);
  assert.equal(getProtectedContentIdentity({ watermarkIdentity: { viewerId: 'A7K9Q2M4TX' } }).displayName, 'متعلم');
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
  assert.match(source, /viewerId/);
  assert.doesNotMatch(source, /maskedEmail|email|userId|_id/);
});

test('attachment access modes drive distinct learner actions and instructor selection', () => {
  const player = fs.readFileSync(new URL('../src/features/course-management/pages/student/CoursePlayerPage.jsx', import.meta.url), 'utf8');
  const editor = fs.readFileSync(new URL('../src/features/course-management/pages/TeacherCourseFormPage.jsx', import.meta.url), 'utf8');
  const api = fs.readFileSync(new URL('../src/services/APIService.js', import.meta.url), 'utf8');
  assert.match(player, /access\.accessMode === 'view_only'/);
  assert.match(player, /downloadableAttachments/);
  assert.match(player, /progress\?\.status === 'completed'[\s\S]{0,180}>مكتمل<\/span>/);
  assert.match(player, /downloadAttachment\(attachment, lesson\)/);
  assert.match(player, /fetch\(url, \{ credentials: 'include' \}\)/);
  assert.match(player, /URL\.createObjectURL\(blob\)/);
  assert.match(player, /attachmentViewer\.mimeType\.startsWith\('image\/'\)/);
  assert.match(player, /inlineAttachment[\s\S]{0,500}تنزيل الصورة/);
  assert.match(player, /<InlineCourseQuiz/);
  const inlineQuiz = fs.readFileSync(new URL('../src/components/course/InlineCourseQuiz.jsx', import.meta.url), 'utf8');
  assert.match(inlineQuiz, /result\.attemptsRemaining === null \|\| result\.attemptsRemaining > 0/);
  assert.match(inlineQuiz, /submittedResult\.attemptsRemaining/);
  assert.match(player, /lesson\.quizzes\?\.map\(renderQuizButton\)/);
  assert.match(player, /view\.quizzes\?\.map\(renderQuizButton\)/);
  assert.doesNotMatch(player, /الاختبارات المطلوبة/);
  assert.doesNotMatch(player, /to=\{'\/exam\/'/);
  assert.match(player, /imageAttachment \? 'عرض' : 'تنزيل'/);
  assert.match(player, /عرض فقط \/ View only/);
  assert.match(player, /قابل للتنزيل \/ Downloadable/);
  assert.match(player, /attachmentViewer.*ProtectedContentWatermark/s);
  assert.match(player, /attachmentViewer\.downloadable && <a[^>]+download=/);
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
  assert.match(player, /onToggleFullscreen=\{toggleFullscreen\}/);
  assert.match(mediaPlayer, /if \(onToggleFullscreen\)/);
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
