#!/usr/bin/env node
/**
 * Labsmart Zero Fake Reviews & Zero Synthetic User Data CI Audit Script
 *
 * Scans all frontend and backend source files for banned synthetic patterns,
 * hardcoded review texts, fake ratings, and unauthorized mock fallbacks.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const TARGET_DIRECTORIES = [
  'doctor-dashboard/src',
  'lab-portal/src',
  'patient-portal/src',
  'backend',
];

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.html', '.json']);

const BANNED_PATTERNS = [
  {
    regex: /\bmockReviews\b/i,
    description: 'Banned variable name "mockReviews"',
  },
  {
    regex: /\bfakeReviews\b/i,
    description: 'Banned variable name "fakeReviews"',
  },
  {
    regex: /\bsampleReviews\b/i,
    description: 'Banned variable name "sampleReviews"',
  },
  {
    regex: /\bdummyReviews\b/i,
    description: 'Banned variable name "dummyReviews"',
  },
  {
    regex: /\btestimonials\b\s*[:=]\s*\[/i,
    description: 'Banned hardcoded testimonials array',
  },
  {
    regex: /\bfakeTestimonials\b/i,
    description: 'Banned variable "fakeTestimonials"',
  },
  {
    regex: /['"]\s*4\.[89]\s*★?\s*['"]/i,
    description: 'Banned hardcoded rating like "4.9 ★" or "4.8"',
  },
  {
    regex: /rating\s*[:=]\s*['"]?4\.[789]/i,
    description: 'Banned hardcoded rating assignment',
  },
  {
    regex: /['"]Excellent service['"]/i,
    description: 'Banned fabricated review text "Excellent service"',
  },
  {
    regex: /['"]Amazing doctor['"]/i,
    description: 'Banned fabricated review text "Amazing doctor"',
  },
  {
    regex: /['"]Highly recommended['"]/i,
    description: 'Banned fabricated review text "Highly recommended"',
  },
  {
    regex: /['"]best hospital['"]/i,
    description: 'Banned fabricated review text "best hospital"',
  },
  {
    regex: /['"]best doctor['"]/i,
    description: 'Banned fabricated review text "best doctor"',
  },
  {
    regex: /['"]What our patients say['"]/i,
    description: 'Banned fabricated section header "What our patients say"',
  },
  {
    regex: /['"]Success stories['"]/i,
    description: 'Banned fabricated social proof "Success stories"',
  },
  {
    regex: /['"]98%\s*patient satisfaction['"]/i,
    description: 'Banned fabricated satisfaction metric',
  },
];

let totalFilesChecked = 0;
const violations = [];

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'coverage', '.git'].includes(entry.name)) {
        continue;
      }
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) {
        checkFile(fullPath);
      }
    }
  }
}

function checkFile(filePath) {
  totalFilesChecked++;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Skip comments that describe rules or audit script itself
    if (line.includes('BANNED_PATTERNS') || line.includes('description:')) return;

    for (const pattern of BANNED_PATTERNS) {
      if (pattern.regex.test(line)) {
        violations.push({
          file: path.relative(rootDir, filePath),
          line: idx + 1,
          content: line.trim(),
          rule: pattern.description,
        });
      }
    }
  });
}

console.log('====================================================');
console.log('Labsmart Zero Fake Reviews & Zero Synthetic Data Audit');
console.log('====================================================\n');

for (const relDir of TARGET_DIRECTORIES) {
  scanDirectory(path.join(rootDir, relDir));
}

console.log(`Scanned ${totalFilesChecked} files across production portals.\n`);

if (violations.length > 0) {
  console.error(`❌ VIOLATIONS FOUND: ${violations.length} prohibited pattern(s) detected!\n`);
  for (const v of violations) {
    console.error(`  • [${v.file}:${v.line}] ${v.rule}`);
    console.error(`    Code: ${v.content}\n`);
  }
  process.exit(1);
} else {
  console.log('✅ AUDIT PASSED: Zero fake reviews, zero fake ratings, zero synthetic testimonials found.\n');
  process.exit(0);
}
