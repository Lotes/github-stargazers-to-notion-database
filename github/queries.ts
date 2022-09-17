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

export const getStargazersForRepo = cache((rootDirectory, {owner, name}: RepositoryName) => join(rootDirectory, owner, `${name}.json`), function({owner, name}: RepositoryName) {
    return github.paginate(github.rest.activity.listStargazersForRepo, {
      owner, repo: name, per_page: 100
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
