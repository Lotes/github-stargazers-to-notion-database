import { CreatePageParameters, UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "./client";
import { Entity, Changer, Database } from "./types";

export async function paginate<R>(databaseId: string, changers: Changer<R>[]) {
    let start_cursor: string|undefined = undefined;
    const result: R[] = [];
    while(true) {
        const response = await notion.databases.query({
            database_id: databaseId,
            start_cursor
        });
        for (const page of response.results) {
            const row: any = {};
            await Promise.all(changers.map(async c => await c.fromPage(page, row)));
            result.push(row as R);
        }
        if(!response.has_more) {
            return result;
        }
        start_cursor = response.next_cursor as string;
    }
}

export async function createDatabase<R extends Entity, K extends keyof R>(databaseId: string, key: K, changers: Changer<R>[]): Promise<Database<R, K>> {
    const setByKey = new Map<R[K], R>();
    const setById = new Map<string, R>();
    const initialized = (async function ensureInitialized(): Promise<void> {
        for (const row of await paginate<R>(databaseId, changers)) {
            setByKey.set(row[key], row);
            setById.set(row.id, row);
        }
    })();
    await initialized;

    async function create(row: Exclude<R, 'id'>): Promise<string> {
        let page: CreatePageParameters = {parent: {database_id: databaseId}, properties: {}};
        for (const changer of changers) {
            changer.toPage(row, page);
        }
        const response = await notion.pages.create(page);
        row.id = response.id; 
        setById.set(response.id, row);
        setByKey.set(row[key], row);
        return response.id;
    }

    async function update(id: string, newRow: R): Promise<(keyof R)[]> {
        const oldRow = await getById(id);
        let page: UpdatePageParameters = {page_id: id, properties: {}};
        let change = false;
        const changes: (keyof R)[] = [];
        for (const changer of changers) {
            const changed = changer.changed(oldRow, newRow);
            change = change || changed;
            if(changed) {
                changes.push(changer.key);
                changer.toPage(newRow, page);
            }
        }
        if(change) {
            await notion.pages.update(page);
            setByKey.set(newRow[key], newRow);
            setById.set(id, newRow);
        }
        return changes;
    }

    function get(key: R[K]) {
        return setByKey.get(key)!;
    }
    
    function has(key: R[K]) {
        return setByKey.has(key);
    }

    function keyOf(row: R) {
        return row[key];
    }

    function all() {
        return [...setByKey.values()];
    }

    function getById(id: string): R {
        return setById.get(id)!;
    }

    return {
        id: databaseId,
        all,
        keyOf,
        get,
        getById,
        has,
        create,
        update
    };
}