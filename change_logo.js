const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const dirs = ['doctor-dashboard', 'lab-portal', 'backend'];
dirs.forEach(d => {
    let files = walk(path.join(__dirname, d));
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;

        // Let's replace 'Labsmart', 'DiagConnect', 'UnifiedHealth' with 'PDC (Pahal Diagnostic Center)'
        content = content.replace(/>Labsmart</g, '>PDC (Pahal Diagnostic Center)<');
        content = content.replace(/>DiagConnect</g, '>PDC (Pahal Diagnostic Center)<');
        content = content.replace(/>UnifiedHealth</g, '>PDC (Pahal Diagnostic Center)<');
        content = content.replace(/Labsmart/g, 'PDC (Pahal Diagnostic Center)');
        content = content.replace(/DiagConnect/g, 'PDC (Pahal Diagnostic Center)');
        content = content.replace(/UnifiedHealth/g, 'PDC (Pahal Diagnostic Center)');

        // Title replacements in index.html
        if (file.endsWith('index.html')) {
            content = content.replace(/<title>.*<\/title>/, '<title>PDC (Pahal Diagnostic Center)</title>');
        }

        if (content !== original) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Updated logo in', file);
        }
    });
});
