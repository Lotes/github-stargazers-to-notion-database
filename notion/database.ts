import { CreatePageParameters, UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "./client";
import { Entity, Changer, Database } from "./types";

export async function * paginate<R>(databaseId: string, changers: Changer<R>[]) {
    let start_cursor: string|undefined = undefined;
    while(true) {
        const response = await notion.databases.query({
            database_id: databaseId,
            start_cursor
        });
        for (const page of response.results) {
            const row: any = {};
            changers.forEach(c => c.fromPage(page, row));
            yield row as R;
        }
        if(!response.has_more) {
            break;
        }
        start_cursor = response.next_cursor as string;
    }
}

export function createDatabase<R extends Entity, K extends keyof R>(databaseId: string, key: K, changers: Changer<R>[]): Database<R, K> {
    const setByKey = new Map<R[K], R>();
    const setById = new Map<string, R>();
    const initialized = (async function ensureInitialized(): Promise<void> {
        for await (const row of paginate<R>(databaseId, changers)) {
            setByKey.set(row[key], row);
        }
    })();

    async function create(row: Exclude<R, 'id'>): Promise<string> {
        await initialized;

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

    async function update(id: string, newRow: R): Promise<boolean> {
        await initialized;
    
        const oldRow = await getById(id);
        let page: UpdatePageParameters = {page_id: id, properties: {}};
        let change = false;
        for (const changer of changers) {
            const changed = oldRow == null || newRow && changer.changed(oldRow, newRow);
            change ||= changed;
            if(changed) {
                changer.toPage(newRow, page);
            }
        }
        if(change) {
            await notion.pages.update(page);
            setByKey.set(newRow[key], newRow);
            setById.set(id, newRow);
        }
        return change;
    }

    async function get(key: R[K]) {
        await initialized;
        return setByKey.get(key)!;
    }
    
    async function has(key: R[K]) {
        await initialized;
        return setByKey.has(key);
    }

    function keyOf(row: R) {
        return row[key];
    }

    async function all() {
        await initialized;
        return [...setByKey.values()];
    }

    async function getById(id: string): Promise<R> {
        await initialized;
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