const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\akshi\\.gemini\\antigravity-ide\\brain\\f5113f5b-6131-4afd-ad47-2405a3613252\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);

let changes = [];

for (const line of lines) {
    try {
        const entry = JSON.parse(line);
        if (entry.type === 'PLANNER_RESPONSE' && entry.tool_calls) {
            for (const call of entry.tool_calls) {
                if (['multi_replace_file_content', 'replace_file_content', 'write_to_file'].includes(call.name)) {
                    const args = call.args;
                    const file = args.TargetFile || args.AbsolutePath;
                    if (file && file.includes('frontend')) {
                        changes.push({
                            step: entry.step_index,
                            tool: call.name,
                            file: file,
                            args: args
                        });
                    }
                }
            }
        }
    } catch (e) {}
}

const reportPath = 'c:\\Users\\akshi\\Desktop\\Planora New\\Planora\\extracted_changes.json';
fs.writeFileSync(reportPath, JSON.stringify(changes, null, 2));
console.log(`Extracted ${changes.length} changes to scratch/extracted_changes.json`);
