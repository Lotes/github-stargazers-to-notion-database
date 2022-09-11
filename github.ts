import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { env } from "process";
import { stat, readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { config as initializeFromEnvFile } from "dotenv";

initializeFromEnvFile();

const octokit = new Octokit({ 
  authStrategy: createOAuthAppAuth,
  auth: {
    clientType: "oauth-app",
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_SECRET,
  }
});
const exists = async (path: string) => !!(await stat(path).catch(e => false));
function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

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

function getStargazersForRepo(owner: string, repo: string) {
    return octokit.paginate(octokit.rest.activity.listStargazersForRepo, {
      owner, repo, per_page: 100
    });
}

async function getCachedUser(login: string) {
    const userFile = join('cache', `${login}.json`);
    if(!await exists(userFile)) {
        const json = await getUser(login);
        await sleep(200);
        await writeFile(userFile, JSON.stringify(json, null, 2));
        return json;
    }
    const json = await readFile(userFile, 'utf-8');
    return JSON.parse(json) as RestEndpointMethodTypes["users"]["getByUsername"]['response']['data'];
}

async function getUser(login: string) {
    return (await octokit.users.getByUsername({username: login})).data;
}
