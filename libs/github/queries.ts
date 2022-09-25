import { join } from "path";
import { cache } from "./cache";
import { github } from "./client";

export interface RepositoryName {
    owner: string;
    name: string
}

export interface UserName {
    login: string;
}

export const getStargazersForRepo = cache((rootDirectory, {owner: ghOwner, name: ghName}: RepositoryName) => join(rootDirectory, ghOwner, `${ghName}.json`), function({owner: ghOwner, name: ghName}: RepositoryName) {
    return github.paginate(github.rest.activity.listStargazersForRepo, {
      owner: ghOwner, repo: ghName, per_page: 100
    });
});

export const getUser = cache((rootDirectory, {login}: UserName) => join(rootDirectory, `${login}.json`), async function({login}: UserName) {
    return (await github.users.getByUsername({username: login})).data;
});

export async function* getStargazers(cacheDirectory: string, repo: RepositoryName) {
    const users = await getStargazersForRepo(cacheDirectory, repo);
    for (const user of users) {
        if(user?.type !== "User")  {
            continue;
        }
        const cached = await getUser(cacheDirectory, user);
        yield cached;
    }
}

export interface RepositoryDependencyVersions {
    owner: string;
    name: string;
    versions: string[];
}

export async function getRepositoriesUsingNpmPackage(packageName: string) {
    const repos = await github.paginate(github.search.repos, {q: encodeURIComponent(packageName+' language:javascript')});
    const results: Array<RepositoryDependencyVersions> = [];
    for (const repo of repos) {
        const repoEncoded = encodeURIComponent(repo.owner?.name+'/'+repo.name);
        console.log(repoEncoded)
        const codes = await github.paginate(github.search.code, {q: 'filename%3Apackage.json+repo%3A'+repoEncoded});
        const versions = new Set<string>();
        for (const code of codes) {
            const response = await fetch(code.url);
            const content = await response.text();
            console.log(content)
            const json = JSON.parse(content);
            const version: string|null = json?.dependencies?.langium || json?.devDependencies?.langium || null;
            version && versions.add(version);
        }
        if(versions.size > 0) {
            results.push({
                owner: repo.owner!.name!,
                name: repo.name,
                versions: [...versions]
            });
        }
    }
    return results;
}