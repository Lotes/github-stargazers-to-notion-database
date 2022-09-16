import { RestEndpointMethodTypes } from '@octokit/rest';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { exists } from '../utils/exists';
import { github } from './client';

export async function* getStargazers(owner: string, repo: string) {
    const users = await getCachedStargazersForRepo(owner, repo);
    for (const user of users) {
        if(user?.type !== "User")  {
            continue;
        }
        const cached = await getCachedUser(user.login);
        yield cached;
    }
}

async function getCachedStargazersForRepo(owner: string, repo: string) {
    const ownerDir = join('cache', owner);
    const fileName = join(ownerDir, `${repo}.json`);
    if(!await exists(ownerDir)) {
        await mkdir(ownerDir, {recursive: true});
    }
    if (!await exists(fileName)) {
        const json = await getStargazersForRepo(owner, repo);
        await writeFile(fileName, JSON.stringify(json, null, 2));
        return json;
    }
    const json = await readFile(fileName, 'utf-8');
    return JSON.parse(json) as RestEndpointMethodTypes["activity"]["listStargazersForRepo"]['response']['data'];
}

async function getCachedUser(login: string) {
    const userFile = join('cache', `${login}.json`);
    if(!await exists(userFile)) {
        const json = await getUser(login);
        await writeFile(userFile, JSON.stringify(json, null, 2));
        return json;
    }
    const json = await readFile(userFile, 'utf-8');
    return JSON.parse(json) as RestEndpointMethodTypes["users"]["getByUsername"]['response']['data'];
}

function getStargazersForRepo(owner: string, repo: string) {
    return github.paginate(github.rest.activity.listStargazersForRepo, {
      owner, repo, per_page: 100
    });
}

async function getUser(login: string) {
    return (await github.users.getByUsername({username: login})).data;
}