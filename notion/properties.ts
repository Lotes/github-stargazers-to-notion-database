import { Database, Entity } from "./types";

export function id<R extends Entity>() {
    function changed(oldRow: R, newRow: R)  {
        return oldRow.id !== newRow.id;
    }
    function fromPage(page: any, row: R): Promise<void> {
        row.id = page.page_id;
        return Promise.resolve();
    }
    function toPage(_row: R, _page: any) {

    };
    return {changed, fromPage, toPage};
}

export function icon<R, K extends keyof R>(key: K) {
    function changed(oldRow: R, newRow: R)  {
        return oldRow[key] !== newRow[key];
    }
    function fromPage(page: any, row: R) {
        row[key] = page.icon?.external?.url;
        return Promise.resolve();
    }
    function toPage(row: R, page: any) {
        page.icon = {
            type: "external",
            external: {
                url: row[key]
            }
        };
    };
    return {changed, fromPage, toPage};
}

export function title<R, K extends keyof R>(propertyName: string, key: K) {
    function changed(oldRow: R, newRow: R)  {
        return oldRow[key] !== newRow[key];
    }
    function fromPage(page: any, row: R) {
        row[key] = page.properties[propertyName].title[0].text.content;
        return Promise.resolve();
    }
    function toPage(row: R, page: any) {
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
    };
    return {changed, fromPage, toPage};
}

export function url<R, K extends keyof R>(propertyName: string, key: K) {
    function changed(oldRow: R, newRow: R)  {
        return oldRow[key] !== newRow[key];
    }
    function fromPage(page: any, row: R) {
        row[key] = page.properties[propertyName].url;
        return Promise.resolve();
    }
    function toPage(row: R, page: any) {
        page.properties[propertyName] = {
            type: "url",
            url: row[key]
        };
    };
    return {changed, fromPage, toPage};
}

export function email<R, K extends keyof R>(propertyName: string, key: K) {
    function changed(oldRow: R, newRow: R)  {
        return oldRow[key] !== newRow[key];
    }
    function fromPage(page: any, row: R) {
        row[key] = page.properties[propertyName].email;
        return Promise.resolve();
    }
    function toPage(row: R, page: any) {
        page.properties[propertyName] = {
            type: "email",
            email: row[key]
        };
    };
    return {changed, fromPage, toPage};
}

export function relation<R extends Entity, K extends keyof R, S extends Entity, T extends keyof S>(propertyName: string, key: K, database: Database<S, T>) {
    function toIds(row: R) {
        return (row[key] as unknown as Entity[]).map(e => e.id!);
    }
    function changed(oldRow: R, newRow: R) {
        return areEqualsSets<string>(toIds(oldRow), toIds(newRow));
    }
    async function fromPage(page: any, row: R): Promise<void> {
        const relations: {id: string}[] = page.properties[propertyName].relation;
        const ids = relations.map(r => r.id);
        row[key] = await Promise.all(ids.map(id => database.getById(id))) as any;
    }
    function toPage(row: R, page: any) {
        page.properties[propertyName] = {
            type: "relation",
            relation: toIds(row)
        };
    };
    return {changed, fromPage, toPage};
}
