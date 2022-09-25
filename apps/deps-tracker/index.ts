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
    versions: Database<LangiumVersion, 'name'>;
    repositories: Database<LangiumRepo, 'name'>;
}

export const LangiumDependenciesModule: Module<LangiumDependencies> = {
    repositories: (deps) => createDatabase<LangiumRepo, 'name'>('ec015d3650994362bc8e7e9fff497211', 'name', 
        [
            id(),
            title('Name', 'name'),
            relation('Versions', 'name', deps.versions)
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
    for (const repo of versions) {
        const notionVersions = [];
        for (const version of repo.versions) {
            if(!await db.versions.has(version)) {
                await db.versions.create({
                    name: version
                });
            }
            const notionVersion = await db.versions.get(version);
            notionVersions.push(notionVersion);
        }

        const repoName = `${repo.owner}/${repo.name}`;
        if(await db.repositories.has(repoName)) {
            const notionRepo  = await db.repositories.get(repoName);
            await db.repositories.update(notionRepo.id, {
                id: notionRepo.id,
                name: repoName,
                versions: notionVersions
            });
            console.log(`Updated ${repoName}`)
        } else {
            await db.repositories.create({
                name: repoName,
                versions: notionVersions
            });
            console.log(`Created ${repoName}`)
        }
    }
})();