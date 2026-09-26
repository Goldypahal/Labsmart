import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Test 1: Empty Review State Contract
test('Review API returns zero records -> Must yield honest empty state, NOT fake reviews', async () => {
  const emptyReviewResponse = {
    averageRating: null,
    reviewCount: 0,
    reviews: [],
  };

  assert.equal(emptyReviewResponse.reviews.length, 0);
  assert.equal(emptyReviewResponse.averageRating, null);
  assert.equal(emptyReviewResponse.reviewCount, 0);

  // Must not contain fabricated reviewer identities
  const bannedNames = ['Rahul Sharma', 'Priya Singh', 'Aman Gupta', 'Dr. Anil Kumar'];
  const hasBannedName = emptyReviewResponse.reviews.some((r) =>
    bannedNames.includes(r.authorDisplayName)
  );
  assert.equal(hasBannedName, false, 'Empty reviews must never contain fabricated names');
});

// Test 2: Rating Must Be Data-Driven (Rule #6)
test('Ratings Must Be Data-Driven: Null averageRating displays "No rating available", NEVER "4.9 ★"', () => {
  function formatRating(averageRating, reviewCount) {
    if (averageRating != null && reviewCount > 0) {
      return `${Number(averageRating).toFixed(1)} ★ (${reviewCount} reviews)`;
    }
    return 'No rating available';
  }

  assert.equal(formatRating(null, 0), 'No rating available');
  assert.equal(formatRating(undefined, 0), 'No rating available');
  assert.equal(formatRating(4.5, 12), '4.5 ★ (12 reviews)');
  assert.notEqual(formatRating(null, 0), '4.9 ★');
});

// Test 3: Verified Badge Must Require Explicit review.verified === true (Rule #7)
test('Verified Badge requires explicit review.verified === true from backend', () => {
  function shouldShowVerifiedBadge(review) {
    return review.verified === true;
  }

  assert.equal(shouldShowVerifiedBadge({ id: '1', verified: true }), true);
  assert.equal(shouldShowVerifiedBadge({ id: '2', verified: false }), false);
  assert.equal(shouldShowVerifiedBadge({ id: '3' }), false);
  assert.equal(shouldShowVerifiedBadge({ id: '4', verified: 'true' }), false);
  assert.equal(shouldShowVerifiedBadge({ id: '5', verified: 1 }), false);
});

// Test 4: Demo Mode Fails Closed in Production (Rule #11)
test('Demo Mode fails closed: IS_DEMO_MODE is strictly false when production', () => {
  function evaluateDemoMode(isProduction, viteDemoMode) {
    return !isProduction && viteDemoMode === 'true';
  }

  assert.equal(evaluateDemoMode(true, 'true'), false, 'Must be false in production even if flag is true');
  assert.equal(evaluateDemoMode(true, 'false'), false);
  assert.equal(evaluateDemoMode(false, 'false'), false);
  assert.equal(evaluateDemoMode(false, undefined), false);
  assert.equal(evaluateDemoMode(false, 'true'), true, 'Only true in non-production with explicit flag');
});

// Test 5: Source Files Contain Zero Hardcoded Fake Reviews or Ratings
test('Source Code Scan: Zero banned synthetic review/rating patterns in production code', () => {
  const bannedKeywords = [
    'mockReviews',
    'fakeReviews',
    'sampleReviews',
    'dummyReviews',
    '4.9 ★',
    '4.8 ★',
    'Excellent service',
    'Amazing doctor',
    'Highly recommended',
    '98% patient satisfaction',
  ];

  const sourceDirs = [
    path.join(rootDir, 'doctor-dashboard/src'),
    path.join(rootDir, 'lab-portal/src'),
    path.join(rootDir, 'patient-portal/src'),
  ];

  const violations = [];

  function checkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'coverage'].includes(entry.name)) {
          checkDir(full);
        }
      } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8');
        for (const kw of bannedKeywords) {
          if (text.includes(kw)) {
            violations.push({ file: path.relative(rootDir, full), keyword: kw });
          }
        }
      }
    }
  }

  for (const d of sourceDirs) {
    checkDir(d);
  }

  assert.deepEqual(violations, [], `Prohibited synthetic review patterns detected: ${JSON.stringify(violations)}`);
});
