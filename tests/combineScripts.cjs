const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
    console.error('Usage: node combineScripts.js output/result.js path/to/file1 path/to/file2 ...');
    process.exit(1);
}

const outputFilePath = process.argv[2];
const inputFilePaths = process.argv.slice(3);

let combinedContent = '';

inputFilePaths.forEach(filePath => {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        combinedContent += fileContent + '\n';
    } else {
        console.error(`Error: ${filePath} does not exist or is not a file.`);
        process.exit(1);
    }
});

fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
fs.writeFileSync(outputFilePath, combinedContent);

console.log(`Files combined successfully into ${outputFilePath}`);
