import { Client } from "@notionhq/client";
import { env } from "process";
import { config as initializeFromEnvFile } from "dotenv";
import { writeFileSync } from "fs";

initializeFromEnvFile();
const notion = new Client({ auth: env.NOTION_KEY });

const Database = {
    Repositories: "f951d237a8a84470996d8c23583621dc",
    Persons:   "b58df00e7c5f499a8e0ccfbc0394e4cc",
    Countries: "139c87418ae642b085cb39a904077f61",
    Locations: "b8d2d4d241c04bf88e24814e4018e4a6",
    Companies: "cef8197019024c1fa0e4173bb6eddfd9",
};  

export interface Location {
    id: string;
    name: string;
    country: Country;
}

export interface Country {
    id: string;
    name: string;
}

export interface Company {
    id: string;
    name: string;
}

export interface Person {
    id?: string;
    name: string;
    avatar: string;
    location?: Location;
    country?: Country;
    company?: Company;
    email?: string;
    website?: string;
    github: string;
}

export interface Repository {
    id?: string;
    name: string;
    address: string;
}

export async function createPerson(person: Person) {
    const response = await notion.pages.create({
        parent: {
             database_id: Database.Persons
        },
        icon: {type:'external', external: {url: person.avatar}},
        properties: {
            title: {
                type: "title",
                title: [
                  {
                    type: "text",
                    text: {
                      content: person.name,
                      link: null
                    },
                    annotations: {
                      bold: false,
                      italic: false,
                      strikethrough: false,
                      underline: false,
                      code: false,
                      color: "default"
                    },
                  }
                ]
            },
            Github: {
                type: "url",
                url: person.github
            },
            Website: {
                type: "url",
                url: person.website ?? null
            },
            Email: {
                type: "email",
                email: person.email ?? null
            }
        }
    });
    return response.id;
}

export async function * getPersons() {
    let start_cursor: string|undefined = undefined;
    while(true) {
        const response = await notion.databases.query({
            database_id: Database.Persons,
            start_cursor
        });
        yield * response.results.map((r: any) => {
            return {
                id: r.id,
                avatar: r.icon.type === "external" ? r.icon.external.url : undefined,
                github: r.properties.Github.url ?? "",
                name: r.properties.Name.title[0].text.content,
                email: r.properties.Email.email ?? "",
                website: r.properties.Website.url ?? "",                
            } as Person;
        });
        if(!response.has_more) {
            break;
        }
        start_cursor = response.next_cursor as string;
    }
}