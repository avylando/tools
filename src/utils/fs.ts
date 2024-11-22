import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import { readdirSync, statSync } from "node:fs";

const getCurrentModuleDirectoryPath = () => {
  const filepath = fileURLToPath(import.meta.url);
  return dirname(filepath);
};

const getPackageJsonPath = () =>
  path.resolve(getCurrentModuleDirectoryPath(), "../../package.json");

const testFilesExtensions = ["test.ts", "test.tsx", "test.js", "test.jsx"];

function createFilesGetter() {
  const result: string[] = [];

  const get = (directory: string): string[] => {
    // get all 'files' in this directory
    const all = readdirSync(directory);

    // process each checking directories and saving files
    all.forEach((file) => {
      const pathname = `${directory}/${file}`;
      // am I a directory?
      if (statSync(pathname).isDirectory()) {
        // recursively scan me for my files
        get(pathname);
      }
      console.log(">>>", pathname);
      if (
        testFilesExtensions.some((ext) => pathname.endsWith(ext)) ||
        result.includes(pathname) ||
        result.some((it) => it.includes(pathname) || pathname.includes(it))
      )
        return;
      // WARNING! I could be something else here!!!
      result.push(pathname); // file name (see warning)
    });
    return result;
  };

  return get;
}
export { getCurrentModuleDirectoryPath, getPackageJsonPath, createFilesGetter };
