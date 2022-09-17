import { Database, Entity, Changer } from "./types";
import { areEqualsSets } from '../utils/sets';

export function id<R extends Entity>() {
    function changed(oldRow: R, newRow: R)  {
        return false;
    }
    function fromPage(page: any, row: R): Promise<void> {
        row.id = page.id;
        return Promise.resolve();
    }
    function toPage(_row: R, _page: any) {}
    return {key: 'id', changed, fromPage, toPage} as Changer<R>;
}

export function icon<R, K extends keyof R>(key: K) {
    function changed(oldRow: R, newRow: R)  {
        return newRow[key] && oldRow[key] !== newRow[key];
    }
    function fromPage(page: any, row: R) {
        row[key] = page.icon?.external?.url;
        return Promise.resolve();
    }
    function toPage(row: R, page: any) {
        if(row[key]) {
            page.icon = {
                type: "external",
                external: {
                    url: row[key]
                }
            };
        }
    };
    return {key, changed, fromPage, toPage};
}

export function title<R, K extends keyof R>(propertyName: string, key: K) {
    function changed(oldRow: R, newRow: R)  {
        return newRow[key] && oldRow[key] !== newRow[key];
    }
    function fromPage(page: any, row: R) {
        row[key] = page.properties[propertyName].title[0].text.content;
        return Promise.resolve();
    }
    function toPage(row: R, page: any) {
        if(row[key]) {
            page.properties[propertyName] = {
                type: "title",
                title: [
                    {
                        type: "text",
                        text: {
                            content: row[key],
                        },
                    }
                ]
            };
        }
    };
    return {key, changed, fromPage, toPage};
}

export function url<R, K extends keyof R>(propertyName: string, key: K) {
    function changed(oldRow: R, newRow: R)  {
        return newRow[key] && oldRow[key] !== newRow[key];
    }
    function fromPage(page: any, row: R) {
        row[key] = page.properties[propertyName].url;
        return Promise.resolve();
    }
    function toPage(row: R, page: any) {
        if(row[key]) {
            page.properties[propertyName] = {
                type: "url",
                url: row[key]
            };
        }
    };
    return {key, changed, fromPage, toPage};
}

export function email<R, K extends keyof R>(propertyName: string, key: K) {
    function changed(oldRow: R, newRow: R)  {
        return newRow[key] && oldRow[key] !== newRow[key];
    }
    function fromPage(page: any, row: R) {
        row[key] = page.properties[propertyName].email;
        return Promise.resolve();
    }
    function toPage(row: R, page: any) {
        if(row[key]) {
            page.properties[propertyName] = {
                type: "email",
                email: row[key]
            };
        }
    };
    return {key, changed, fromPage, toPage};
}

export function relation<R extends Entity, K extends keyof R, S extends Entity, T extends keyof S>(propertyName: string, key: K, database: Database<S, T>) {
    function toIds(row: R) {
        return row && Array.isArray(row[key]) ? (row[key] as unknown as Entity[]).filter(e => e).map(e => e.id).filter(e => e) : [];
    }
    function changed(oldRow: R, newRow: R) {
        return !areEqualsSets<string>(toIds(oldRow), toIds(newRow));
    }
    async function fromPage(page: any, row: R): Promise<void> {
        const relations: Entity[] = page.properties[propertyName].relation;
        const ids = relations.map(r => r.id);
        row[key] = await Promise.all(ids.map(id => database.getById(id))) as any;
    }
    function toPage(row: R, page: any) {
        if(row[key]) {
            page.properties[propertyName] = {
                type: "relation",
                relation: toIds(row).map(id => ({id}))
            };
        }
    };
    return {key, changed, fromPage, toPage};
}
