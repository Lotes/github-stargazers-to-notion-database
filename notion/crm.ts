import { Module, inject } from "../utils/inject";
import { createDatabase } from "./database";
import { Database } from "./types";
import { email, id, relation, title, url } from "./properties";

const Guids = {
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
    stars?: Repository[];
    email?: string;
    website?: string;
    github: string;
}

export interface Repository {
    id?: string;
    name: string;
    address: string;
}

export type CRM = {
    repositories: Database<Repository, 'address'>;
    persons: Database<Person, 'github'>;  
}

export const CRMModule: Module<CRM> = {
    repositories: (crm) => createDatabase<CRM, Repository, 'address'>(crm, Guids.Repositories, 'address', 
        [
            id(),
            title('Name', 'name'),
            url('Address', 'address')
        ]),
    persons: (crm) => createDatabase<CRM, Person, 'github'>(crm, Guids.Persons, "github", 
        [
            id(),
            title('Name', 'name'),
            url('Website', 'website'),
            url('Github', 'github'),
            email('Email', 'email'),
            relation('Stars', 'stars', crm.repositories)
        ])
}

export function createCRM() {
    return inject(CRMModule);
}
