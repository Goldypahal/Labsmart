import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';

const SpecimenType = {
  WHOLE_BLOOD: 'WHOLE_BLOOD',
  SERUM: 'SERUM',
  PLASMA: 'PLASMA',
  URINE: 'URINE',
  CSF: 'CSF',
  STOOL: 'STOOL',
  SWAB: 'SWAB',
  OTHER: 'OTHER',
} as const;

const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

const OrderPriority = {
  ROUTINE: 'ROUTINE',
  URGENT: 'URGENT',
  STAT: 'STAT',
} as const;

const OrderStatus = {
  DRAFT: 'DRAFT',
  ORDERED: 'ORDERED',
  SAMPLE_COLLECTED: 'SAMPLE_COLLECTED',
  SAMPLE_RECEIVED: 'SAMPLE_RECEIVED',
  IN_ANALYSIS: 'IN_ANALYSIS',
  RESULTED: 'RESULTED',
  VERIFIED: 'VERIFIED',
  RELEASED: 'RELEASED',
  CANCELLED: 'CANCELLED',
} as const;

const SampleStatus = {
  ORDERED: 'ORDERED',
  COLLECTED: 'COLLECTED',
  RECEIVED: 'RECEIVED',
  PROCESSING: 'PROCESSING',
  ANALYZED: 'ANALYZED',
  REJECTED: 'REJECTED',
  DISCARDED: 'DISCARDED',
} as const;

const ParameterFlag = {
  NORMAL: 'NORMAL',
  LOW: 'LOW',
  HIGH: 'HIGH',
  CRITICAL_LOW: 'CRITICAL_LOW',
  CRITICAL_HIGH: 'CRITICAL_HIGH',
  ABNORMAL: 'ABNORMAL',
} as const;

async function main() {
  console.log('🌱 Starting Labsmart Hospital Enterprise Seed...');

  // 1. Roles
  const roleNames = [
    { name: 'SUPER_ADMIN', description: 'Full system and root infrastructure administration' },
    { name: 'HOSPITAL_ADMIN', description: 'Hospital departmental and staff administration' },
    { name: 'LAB_ADMIN', description: 'Laboratory operations, analyzers, and dispatch manager' },
    { name: 'LAB_SUPERVISOR', description: 'Senior pathologist and quality review manager' },
    { name: 'LAB_TECHNICIAN', description: 'Medical laboratory technologist (sample accession & technical entry)' },
    { name: 'DOCTOR', description: 'Authorized medical clinician (prescriptions, orders, consults)' },
    { name: 'NURSE', description: 'Ward and phlebotomy support staff' },
    { name: 'RECEPTIONIST', description: 'Front-desk patient intake and appointment booking' },
    { name: 'PATIENT', description: 'Registered healthcare consumer' },
    { name: 'BILLING', description: 'Finance, accounts, and insurance processing officer' },
  ];

  const roles: Record<string, string> = {};
  for (const r of roleNames) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    roles[r.name] = role.id;
  }

  // 2. Granular Permissions
  const permissionsList = [
    { slug: 'patients:read', name: 'View Patient Profiles', category: 'Patient' },
    { slug: 'patients:create', name: 'Register Patient Profile', category: 'Patient' },
    { slug: 'patients:update', name: 'Update Patient Profile', category: 'Patient' },
    { slug: 'orders:read', name: 'View Diagnostic Orders', category: 'Orders' },
    { slug: 'orders:create', name: 'Prescribe & Create Orders', category: 'Orders' },
    { slug: 'orders:update', name: 'Update Orders Status', category: 'Orders' },
    { slug: 'samples:collect', name: 'Phlebotomy Sample Collection', category: 'LIMS' },
    { slug: 'samples:receive', name: 'Accession & Receive Samples', category: 'LIMS' },
    { slug: 'samples:process', name: 'Analyze Specimens', category: 'LIMS' },
    { slug: 'results:enter', name: 'Technical Result Entry', category: 'LIMS' },
    { slug: 'results:verify', name: 'Pathologist Verification', category: 'LIMS' },
    { slug: 'results:release', name: 'Authorize & Release Reports', category: 'LIMS' },
    { slug: 'results:amend', name: 'Request Result Amendment', category: 'LIMS' },
    { slug: 'reports:read', name: 'View Released Reports', category: 'Reports' },
    { slug: 'reports:download', name: 'Download PDF Reports', category: 'Reports' },
    { slug: 'billing:read', name: 'View Invoices & Billing', category: 'Billing' },
    { slug: 'billing:create', name: 'Generate Invoices', category: 'Billing' },
    { slug: 'billing:pay', name: 'Record Payments', category: 'Billing' },
    { slug: 'users:manage', name: 'Manage Staff Accounts', category: 'Admin' },
    { slug: 'audit:read', name: 'Inspect Audit Logs', category: 'Security' },
  ];

  for (const p of permissionsList) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // 3. Facility & Departments
  const facility = await prisma.facility.upsert({
    where: { code: 'PCH-BLR-01' },
    update: {},
    create: {
      name: 'Pahal Central Hospital & Diagnostic Institute',
      code: 'PCH-BLR-01',
      type: 'HOSPITAL',
      address: '100 Feet Ring Road, Indiranagar',
      city: 'Bengaluru',
      phone: '+91 80 2500 0000',
      nablLicense: 'NABL-MC-2026-9081',
    },
  });

  const deptNames = [
    { name: 'Hematology', code: 'HEM' },
    { name: 'Clinical Biochemistry', code: 'BIO' },
    { name: 'Microbiology & Serology', code: 'MIC' },
    { name: 'Histopathology & Cytology', code: 'PATH' },
    { name: 'Internal Medicine', code: 'MED' },
  ];

  const departments: Record<string, string> = {};
  for (const d of deptNames) {
    const dept = await prisma.department.upsert({
      where: { facilityId_code: { facilityId: facility.id, code: d.code } },
      update: {},
      create: { ...d, facilityId: facility.id },
    });
    departments[d.code] = dept.id;
  }

  // 4. Test Catalog (Standard Diagnostic Panels)
  const cbc = await prisma.testCatalog.upsert({
    where: { code: 'CBC' },
    update: {},
    create: {
      code: 'CBC',
      name: 'Complete Blood Count (CBC) with Differential',
      category: 'Hematology',
      specimenType: SpecimenType.WHOLE_BLOOD,
      tubeColor: 'Lavender EDTA Tube',
      fastingRequired: false,
      tatHours: 4,
      basePrice: 350,
      parameters: {
        create: [
          {
            name: 'Hemoglobin',
            unit: 'g/dL',
            criticalLow: 7.0,
            criticalHigh: 20.0,
            orderIndex: 1,
            referenceRanges: {
              create: [
                { lowerLimit: 13.0, upperLimit: 17.0, gender: Gender.MALE, description: 'Adult Male' },
                { lowerLimit: 12.0, upperLimit: 15.5, gender: Gender.FEMALE, description: 'Adult Female' },
              ],
            },
          },
          {
            name: 'Total Leukocyte Count (WBC)',
            unit: '/uL',
            criticalLow: 2000,
            criticalHigh: 30000,
            orderIndex: 2,
            referenceRanges: {
              create: [{ lowerLimit: 4000, upperLimit: 11000, description: 'Adult' }],
            },
          },
          {
            name: 'Platelet Count',
            unit: '/uL',
            criticalLow: 50000,
            criticalHigh: 800000,
            orderIndex: 3,
            referenceRanges: {
              create: [{ lowerLimit: 150000, upperLimit: 450000, description: 'Adult' }],
            },
          },
        ],
      },
    },
  });

  const lipid = await prisma.testCatalog.upsert({
    where: { code: 'LIPID' },
    update: {},
    create: {
      code: 'LIPID',
      name: 'Comprehensive Lipid Profile Panel',
      category: 'Biochemistry',
      specimenType: SpecimenType.SERUM,
      tubeColor: 'Yellow SST Tube',
      fastingRequired: true,
      tatHours: 4,
      basePrice: 550,
      parameters: {
        create: [
          {
            name: 'Total Cholesterol',
            unit: 'mg/dL',
            orderIndex: 1,
            referenceRanges: { create: [{ lowerLimit: 125, upperLimit: 200, description: 'Desirable' }] },
          },
          {
            name: 'Triglycerides',
            unit: 'mg/dL',
            criticalHigh: 500,
            orderIndex: 2,
            referenceRanges: { create: [{ lowerLimit: 50, upperLimit: 150, description: 'Normal' }] },
          },
          {
            name: 'HDL Cholesterol',
            unit: 'mg/dL',
            orderIndex: 3,
            referenceRanges: { create: [{ lowerLimit: 40, upperLimit: 60, description: 'Protective' }] },
          },
          {
            name: 'LDL Cholesterol',
            unit: 'mg/dL',
            orderIndex: 4,
            referenceRanges: { create: [{ lowerLimit: 0, upperLimit: 100, description: 'Optimal' }] },
          },
        ],
      },
    },
  });

  // 5. Initial Accounts with bcrypt hash
  const defaultPasswordHash = await bcrypt.hash('password123', 12);

  // Doctor User
  const docUser = await prisma.user.upsert({
    where: { email: 'doctor@diagconnect.com' },
    update: {},
    create: {
      email: 'doctor@diagconnect.com',
      passwordHash: defaultPasswordHash,
      phoneNumber: '+91 98765 00001',
      userRoles: { create: [{ roleId: roles['DOCTOR'] }] },
      doctorProfile: {
        create: {
          licenseNumber: 'KMC-2015-8890',
          qualification: 'MBBS, MD (General Medicine)',
          specialization: 'Internal Medicine & Diagnostic Triage',
          bio: 'Senior consultant physician with over 12 years of clinical pathology interpretation experience.',
          departments: {
            create: [{ departmentId: departments['MED'] }],
          },
        },
      },
    },
    include: { doctorProfile: true },
  });

  // Lab Admin User
  const labUser = await prisma.user.upsert({
    where: { email: 'lab@diagconnect.com' },
    update: {},
    create: {
      email: 'lab@diagconnect.com',
      passwordHash: defaultPasswordHash,
      phoneNumber: '+91 98765 00002',
      userRoles: {
        create: [{ roleId: roles['LAB_ADMIN'] }, { roleId: roles['LAB_SUPERVISOR'] }],
      },
      staffProfile: {
        create: {
          employeeId: 'EMP-LAB-01',
          designation: 'Laboratory Director & Chief Pathologist',
          departmentId: departments['PATH'],
        },
      },
    },
  });

  // Patient User 1
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@diagconnect.com' },
    update: {},
    create: {
      email: 'patient@diagconnect.com',
      passwordHash: defaultPasswordHash,
      phoneNumber: '+91 98765 43210',
      userRoles: { create: [{ roleId: roles['PATIENT'] }] },
      patientProfile: {
        create: {
          mrn: 'MRN-2026-001',
          abhaId: '91-4829-1029-4820',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1981-05-14'),
          gender: Gender.MALE,
          bloodGroup: 'O+',
          allergies: 'Penicillin, Sulfa Drugs',
          chronicConditions: 'Type 2 Diabetes (Controlled), Hypertension',
          address: 'Flat 402, Green Glen Layout, Bengaluru',
        },
      },
    },
    include: { patientProfile: true },
  });

  // Patient User 2
  await prisma.user.upsert({
    where: { email: 'jane.roe@example.com' },
    update: {},
    create: {
      email: 'jane.roe@example.com',
      passwordHash: defaultPasswordHash,
      phoneNumber: '+91 91234 56789',
      userRoles: { create: [{ roleId: roles['PATIENT'] }] },
      patientProfile: {
        create: {
          mrn: 'MRN-2026-002',
          abhaId: '91-8849-2910-3321',
          firstName: 'Jane',
          lastName: 'Roe',
          dateOfBirth: new Date('1992-08-22'),
          gender: Gender.FEMALE,
          bloodGroup: 'B+',
          allergies: 'None Reported',
          chronicConditions: 'Subclinical Hypothyroidism',
          address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru',
        },
      },
    },
  });

  // Hospital Admin User
  await prisma.user.upsert({
    where: { email: 'admin@diagconnect.com' },
    update: {},
    create: {
      email: 'admin@diagconnect.com',
      passwordHash: defaultPasswordHash,
      phoneNumber: '+91 98765 00099',
      userRoles: { create: [{ roleId: roles['HOSPITAL_ADMIN'] }, { roleId: roles['SUPER_ADMIN'] }] },
    },
  });

  console.log('✅ Labsmart Enterprise Database Seeding Completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
