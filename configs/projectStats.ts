import fs from "fs";
import path from "path";
import debugConfig from "#debugConfig";

export const VERSION = "0.6a";

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

function countLinesInFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return fileContent.split("\n").length;
}

function isImageFile(extension) {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".tiff",
    ".webp",
  ];
  return imageExtensions.includes(extension);
}

function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

export function projectStats(filePaths) {
  let totalFiles = 0;
  const extensions = new Set();
  let totalLinesOfCode = 0;

  filePaths.forEach((filePath) => {
    const files = getAllFiles(filePath, undefined);
    totalFiles += files.length;
    files.forEach((file) => {
      const ext = getFileExtension(file);
      extensions.add(ext);
      if (!isImageFile(ext)) {
        totalLinesOfCode += countLinesInFile(file);
      }
    });
  });

  debugConfig.logger.log(`Total Files  : ${totalFiles}`);
  debugConfig.logger.log(`LOC          : ${totalLinesOfCode}`);
  debugConfig.logger.log(`Extensions   : ${Array.from(extensions).join(", ")}`);
}
