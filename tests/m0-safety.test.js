// Regression guards for the Milestone 0 safety fixes (see docs: Artifact A §1, tasks T-001–T-003).
// These scan source files so a dangerous pattern cannot quietly come back.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'public'].includes(entry.name)) continue;
      walk(rel, exts, out);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      out.push(rel);
    }
  }
  return out;
}

test('no API route can release a report without authorization (FR-050, FR-054)', () => {
  for (const file of walk('backend/src', ['.ts'])) {
    const src = read(file);
    assert.ok(!/\.(patch|put|post)\(\s*['"][^'"]*upload-report/.test(src), `${file} mounts an upload-report route`);
  }
  const orders = read('backend/src/modules/orders/orders.controller.ts');
  assert.match(orders, /RELEASE_DISABLED/, 'generic status endpoint must refuse VERIFIED/RELEASED');
});

test('order status changes require a lab staff role', () => {
  const routes = read('backend/src/modules/orders/orders.routes.ts');
  for (const line of routes.split('\n').filter((l) => /\/status'/.test(l))) {
    assert.match(line, /requireRole\(/, `unguarded status route: ${line.trim()}`);
  }
});

test('portals never log in automatically or carry demo credentials (SEC-004)', () => {
  for (const app of ['lab-portal', 'doctor-dashboard', 'patient-portal']) {
    for (const file of walk(`${app}/src`, ['.js', '.jsx'])) {
      const src = read(file);
      assert.ok(!/password123/.test(src), `${file} contains a demo password`);
      assert.ok(!/ensureAuth/.test(src), `${file} still auto-logs in`);
    }
  }
});

test('the app never invents a user when nobody is logged in', () => {
  for (const file of ['lab-portal/src/services/api.js', 'doctor-dashboard/src/services/api.js']) {
    const src = read(file);
    const fn = src.slice(src.indexOf('getCurrentUser'), src.indexOf('getCurrentUser') + 300);
    assert.ok(!/name:\s*'/.test(fn), `${file} getCurrentUser returns a fabricated user`);
  }
});

test('result entry never fills a missing value with a made-up normal value', () => {
  const src = read('lab-portal/src/pages/ResultEntry.jsx');
  assert.ok(!/p\.min\s*\+\s*\(p\.max\s*-\s*p\.min\)\s*\/\s*2/.test(src), 'midpoint fill is back');
});

test('result saving and report release fail loudly until they are really implemented', () => {
  const src = read('lab-portal/src/services/api.js');
  for (const fn of ['saveTestResults', 'verifyAndReleaseReport', 'updateSampleResults']) {
    const body = src.slice(src.indexOf(`${fn}:`), src.indexOf(`${fn}:`) + 250);
    assert.match(body, /throw new Error/, `${fn} must not report fake success`);
  }
});

test('no hardcoded signatory on authorization or report screens (FR-051)', () => {
  for (const file of ['lab-portal/src/pages/Verification.jsx', 'lab-portal/src/pages/Reports.jsx']) {
    assert.ok(!/Sarah Pathologist|Reg #55421/.test(read(file)), `${file} prints a fake signatory`);
  }
});

test('no published secrets in config files (SEC-011)', () => {
  const leaked = ['labsmart_secure_password_2026', 'labsmart_redis_password_2026', 'minio_secret_password_2026',
    'labsmart_super_secure_access_token_secret_2026_xyz', 'labsmart_super_secure_refresh_token_secret_2026_abc',
    'secure_access_token_secret_min_32_bytes_long'];
  for (const file of ['docker-compose.yml', 'backend/.env.example', '.env.example']) {
    const src = read(file);
    for (const value of leaked) assert.ok(!src.includes(value), `${file} contains ${value}`);
  }
});

test('database ports are bound to the server only', () => {
  const compose = read('docker-compose.yml');
  for (const port of ['5432', '6379', '9000', '9001']) {
    const lines = compose.split('\n').filter((l) => /^\s*-\s*"/.test(l) && l.includes(`:${port}"`));
    for (const l of lines) assert.match(l, /127\.0\.0\.1:/, `port ${port} exposed on all interfaces`);
  }
});
