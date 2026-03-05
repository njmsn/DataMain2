import fs from 'fs';
const file = './components/dataMain/SiteManagementContent.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace border-[#e2e8f0]
content = content.replace(/border-\[#e2e8f0\]/g, 'border-slate-300');
// replace border-slate-200 (except border-slate-200/80 maybe? let's just replace border-slate-200)
content = content.replace(/border-slate-200\b/g, 'border-slate-300');
// replace border-slate-100 (except border-slate-100/50 etc)
content = content.replace(/border-slate-100\b/g, 'border-slate-300');
// replace border-[#ddd]
content = content.replace(/border-\[#ddd\]/g, 'border-slate-300');

fs.writeFileSync(file, content);
console.log('Done');
