const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const dirsToScan = [
    path.join(__dirname, 'doctor-dashboard', 'src'),
    path.join(__dirname, 'doctor-dashboard', 'index.html')
];

let files = [];
dirsToScan.forEach(p => {
    if (fs.existsSync(p)) {
        if (fs.statSync(p).isDirectory()) {
            files = files.concat(walk(p));
        } else {
            files.push(p);
        }
    }
});

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace text 'Labsmart' with 'PDC' or 'PDC (Pahal Diagnostic Center)'
    content = content.replace(/>Labsmart</g, '>PDC (Pahal Diagnostic Center)<');

    // Replace blue classes with emerald
    content = content.replace(/blue-50(?!0)/g, 'emerald-50');
    content = content.replace(/blue-100/g, 'emerald-100');
    content = content.replace(/blue-200/g, 'emerald-200');
    content = content.replace(/blue-300/g, 'emerald-300');
    content = content.replace(/blue-400/g, 'emerald-400');
    content = content.replace(/blue-500/g, 'emerald-500');
    content = content.replace(/blue-600/g, 'emerald-600');
    content = content.replace(/blue-700/g, 'emerald-700');
    content = content.replace(/blue-800/g, 'emerald-800');
    content = content.replace(/blue-900/g, 'emerald-900');

    // Replace indigo with teal
    content = content.replace(/indigo-400/g, 'teal-400');
    content = content.replace(/indigo-500/g, 'teal-500');
    content = content.replace(/indigo-600/g, 'teal-600');
    content = content.replace(/indigo-700/g, 'teal-700');
    content = content.replace(/indigo-800/g, 'teal-800');
    content = content.replace(/indigo-900/g, 'teal-900');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
