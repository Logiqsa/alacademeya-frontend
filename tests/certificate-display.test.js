import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { shortInstructorName } from '../src/utils/certificateDisplay.js';

const page = readFileSync(new URL('../src/pages/CourseCertificatePage.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

test('certificate artwork and verification link use the public certificateNumber', () => {
  const sheet = page.match(/<section[^>]*className='certificate-sheet[\s\S]*?<\/section>/)?.[0];
  assert.ok(sheet, 'certificate sheet exists');
  for (const field of ['learnerName', 'courseTitle', 'certificateNumber']) {
    assert.match(sheet, new RegExp(`certificate\\.${field}|\\{${field}\\}`));
  }
  assert.match(sheet, /formatDate\(completionDate\)/);
  assert.match(sheet, /\{displayInstructorName\}/);
  assert.match(page, /shortInstructorName\(certificate\.instructorName\)/);
  assert.match(sheet, /Certificate ID/);
  assert.doesNotMatch(sheet, /CERTIFICATE OF COMPLETION|This certifies that|has successfully completed the course/);
  assert.match(sheet, /<h4 dir='auto' className='certificate-course'>\{courseTitle\}<\/h4>/);
  assert.match(sheet, /<img src=\{certificateTemplate\}/);
  assert.match(sheet, /<image href=\{blankCertificateValues\}/);
  assert.match(page, /import certificateTemplate from '\.\.\/\.\.\/templates\/certificate\.png'/);
  assert.doesNotMatch(sheet, /border-\[|border-2|border-3|text-\[22vw\]/);
  assert.match(page, /Intl\.DateTimeFormat\('en-GB'/);
  assert.doesNotMatch(sheet, /certificate\.(?:verificationCode|certificateId|id|_id)/);
  assert.doesNotMatch(page, /certificate\.verificationCode/);
  assert.match(page, /verify\/\$\{encodeURIComponent\(certificate\.certificateNumber\)\}/);
  assert.match(page, /\.certificate-sheet, \.certificate-sheet \* \{ visibility: visible; \}/);
});

test('certificate keeps the instructor signature on one line with two names', () => {
  assert.equal(shortInstructorName('  Mahmoud   Said   Mahmoud  '), 'Mahmoud Said');
  assert.equal(shortInstructorName('محمود سعيد محمد'), 'محمود سعيد');
  assert.equal(shortInstructorName(''), '—');
  assert.match(styles, /\.certificate-instructor\s*\{[^}]*white-space: nowrap;/);
});

test('certificate headings and body use the requested font families', () => {
  assert.match(styles, /family=IBM\+Plex\+Sans:/);
  assert.match(styles, /\.certificate-page\s*\{\s*font-family: "IBM Plex Sans"/);
  assert.match(styles, /\.certificate-learner\s*\{[\s\S]*?font-family: Georgia/);
  assert.match(styles, /\.certificate-course\s*\{[\s\S]*?"IBM Plex Sans Arabic"/);
  assert.match(styles, /\.certificate-sheet\s*\{\s*container-type: inline-size/);
});

test('public verification routes and safe result fields are wired', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../src/components/layout/Footer.jsx', import.meta.url), 'utf8');
  const verification = readFileSync(new URL('../src/pages/CertificateVerificationPage.jsx', import.meta.url), 'utf8');
  assert.match(app, /path="\/certificates\/verify" element=\{<CertificateVerificationPage \/>\}/);
  assert.match(app, /path="\/certificates\/verify\/:certificateNumber" element=\{<CertificateVerificationPage \/>\}/);
  assert.match(footer, /<Link to="\/certificates\/verify"[^>]*>التحقق من الشهادة<\/Link>/);
  assert.match(verification, /verifyCourseCertificate\(certificateNumber\)/);
  assert.match(verification, /Certificate Verified/);
  assert.match(verification, /Certificate Not Valid/);
  for (const field of ['certificateNumber', 'learnerName', 'courseTitle', 'instructorName', 'completionDate', 'issuedAt']) {
    assert.match(verification, new RegExp(`result\\.${field}`));
  }
  assert.doesNotMatch(verification, /result\.(?:verificationCode|_id|id|email)/);
});
