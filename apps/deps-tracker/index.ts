import { writeFile } from "fs/promises";
import { getRepositoriesUsingNpmPackage } from "../../libs/github/queries";
import { createDatabase } from "../../libs/notion/database";
import { relation, title, id } from "../../libs/notion/properties";
import { Database } from "../../libs/notion/types";
import { inject, Module } from "../../libs/utils/inject";

interface LangiumVersion {
    id: string;
    name: string;
}

interface LangiumRepo {
    id: string;
    name: string;
    versions: LangiumVersion[];
}

interface LangiumDependencies {
    versions: Promise<Database<LangiumVersion, 'name'>>;
    repositories: Promise<Database<LangiumRepo, 'name'>>;
}

export const LangiumDependenciesModule: Module<LangiumDependencies> = {
    repositories: async (deps) => createDatabase<LangiumRepo, 'name'>('ec015d3650994362bc8e7e9fff497211', 'name', 
        [
            id(),
            title('Name', 'name'),
            relation('Versions', 'name', await deps.versions)
        ]),
    versions: () => createDatabase<LangiumVersion, 'name'>('7e2d16df8be24e01bc84173df9073f5d', "name", 
        [
            id(),
            title('Name', 'name'),
        ])
}

export function createModule() {
    return inject(LangiumDependenciesModule);
}

(async function() {
    const db = createModule();
    const versions = await getRepositoriesUsingNpmPackage('langium');
    const api = await db.versions;
    const repos = await db.repositories;
    for (const repo of versions) {
        const notionVersions = [];
        for (const version of repo.versions) {
            if(!api.has(version)) {
                await api.create({
                    name: version
                });
            }
            const notionVersion = api.get(version);
            notionVersions.push(notionVersion);
        }

        const repoName = `${repo.owner}/${repo.name}`;
        if(repos.has(repoName)) {
            const notionRepo  = repos.get(repoName);
            await repos.update(notionRepo.id, {
                id: notionRepo.id,
                name: repoName,
                versions: notionVersions
            });
            console.log(`Updated ${repoName}`)
        } else {
            await repos.create({
                name: repoName,
                versions: notionVersions
            });
            console.log(`Created ${repoName}`)
        }
    }
})();