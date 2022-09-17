import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import { exists } from "../utils/exists";

export type Query<P, R> = (parameters: P) => Promise<R>;
export type FileLocator<P> = (rootDirectory: string, parameters: P) => string;

export function cache<P, R>(locator: FileLocator<P>, func: Query<P, R>) {
    return async (rootDirectory: string, parameters: P) => {
        const fileName = locator(rootDirectory, parameters);
        const dirName = dirname(fileName);
        if(!await exists(dirName)) {
            await mkdir(dirName, {recursive: true});
        }
        if (!await exists(fileName)) {
            const json = await func(parameters);
            await writeFile(fileName, JSON.stringify(json, null, 2));
            return json;
        }
        const json = await readFile(fileName, 'utf-8');
        return JSON.parse(json) as R;
    };
}