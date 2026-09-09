export const ACTIVITY_ALERTS = [
    { type: 'critical', title: 'Critical Value Alert', desc: 'Hemoglobin 6.2 g/dL - John Doe', time: '5 mins ago' },
    { type: 'warning', title: 'TAT Exceeded', desc: 'Order #O-2024-0012 delayed by 2 hours', time: '15 mins ago' },
    { type: 'info', title: 'Machine Calibrated', desc: 'Sysmex XN-1000 initialized', time: '1 hour ago' },
    { type: 'critical', title: 'Critical Value Alert', desc: 'Potassium 6.8 mEq/L - Sarah Smith', time: '2 hours ago' },
];

export const LIVE_ORDERS = [
    { id: 'LAB-2024-0041', patient: 'Ravi Patel', ageGender: '45/M', test: 'Lipid Profile, CBC', status: 'Processing', time: '10:30 AM' },
    { id: 'LAB-2024-0042', patient: 'Sunita Sharma', ageGender: '32/F', test: 'Thyroid Profile', status: 'Pending', time: '10:45 AM' },
    { id: 'LAB-2024-0043', patient: 'Aarav Gupta', ageGender: '12/M', test: 'Dengue NS1', status: 'Collected', time: '11:00 AM' },
    { id: 'LAB-2024-0044', patient: 'Meera Singh', ageGender: '58/F', test: 'HbA1c', status: 'Processing', time: '11:15 AM' },
    { id: 'LAB-2024-0045', patient: 'Anil Desai', ageGender: '64/M', test: 'KFT, LFT', status: 'Pending', time: '11:20 AM' },
];
