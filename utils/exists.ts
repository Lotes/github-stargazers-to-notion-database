import { stat } from 'fs/promises';

export async function exists(path: string) {
    return !!(await stat(path).catch(e => false));
}
