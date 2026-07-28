const fs = require('fs');

const changes = JSON.parse(fs.readFileSync('extracted_changes.json', 'utf8'));

// Filter only the files we want to recover
const targetFiles = [
    'TaskListPage.jsx',
    'ResourceAllocationPage.jsx',
    'UsersPage.jsx',
    'routes.jsx'
];

const fileHistory = changes.filter(c => targetFiles.some(f => c.file.endsWith(f)));

fileHistory.sort((a, b) => a.step - b.step);

for (const change of fileHistory) {
    const file = change.file;
    if (change.tool === 'write_to_file') {
        fs.writeFileSync(file, change.args.CodeContent, 'utf8');
        console.log(`Replayed write_to_file on ${file} (step ${change.step})`);
    } else if (change.tool === 'replace_file_content' || change.tool === 'multi_replace_file_content') {
        if (!fs.existsSync(file)) {
            console.log(`File ${file} does not exist, skipping...`);
            continue;
        }
        let content = fs.readFileSync(file, 'utf8');
        let chunks = change.args.ReplacementChunks || [];
        if (change.tool === 'replace_file_content') {
            chunks = [{
                TargetContent: change.args.TargetContent,
                ReplacementContent: change.args.ReplacementContent,
                StartLine: change.args.StartLine,
                EndLine: change.args.EndLine,
                AllowMultiple: change.args.AllowMultiple
            }];
        }
        
        let success = true;
        for (const chunk of chunks) {
            if (chunk.TargetContent && content.includes(chunk.TargetContent)) {
                if (chunk.AllowMultiple) {
                    content = content.split(chunk.TargetContent).join(chunk.ReplacementContent);
                } else {
                    content = content.replace(chunk.TargetContent, chunk.ReplacementContent);
                }
            } else if (chunk.TargetContent) {
                console.log(`Target content not found in ${file} at step ${change.step}`);
                success = false;
            }
        }
        
        if (success) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Replayed replace on ${file} (step ${change.step})`);
        }
    }
}
console.log('Recovery complete.');
