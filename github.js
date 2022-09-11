"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStargazers = void 0;
const rest_1 = require("@octokit/rest");
const process_1 = require("process");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const auth_oauth_app_1 = require("@octokit/auth-oauth-app");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const octokit = new rest_1.Octokit({
    authStrategy: auth_oauth_app_1.createOAuthAppAuth,
    auth: {
        clientType: "oauth-app",
        clientId: process_1.env.GITHUB_CLIENT_ID,
        clientSecret: process_1.env.GITHUB_SECRET,
    }
});
const exists = (path) => __awaiter(void 0, void 0, void 0, function* () { return !!(yield (0, promises_1.stat)(path).catch(e => false)); });
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function getStargazers(owner, repo) {
    return __asyncGenerator(this, arguments, function* getStargazers_1() {
        const users = yield __await(getCachedStargazersForRepo(owner, repo));
        for (const user of users) {
            if ((user === null || user === void 0 ? void 0 : user.type) !== "User") {
                continue;
            }
            const cached = yield __await(getCachedUser(user.login));
            yield yield __await(cached);
        }
    });
}
exports.getStargazers = getStargazers;
function getCachedStargazersForRepo(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const ownerDir = (0, path_1.join)('cache', owner);
        const fileName = (0, path_1.join)(ownerDir, `${repo}.json`);
        if (!(yield exists(ownerDir))) {
            yield (0, promises_1.mkdir)(ownerDir, { recursive: true });
        }
        if (!(yield exists(fileName))) {
            const json = yield getStargazersForRepo(owner, repo);
            yield (0, promises_1.writeFile)(fileName, JSON.stringify(json, null, 2));
            return json;
        }
        const json = yield (0, promises_1.readFile)(fileName, 'utf-8');
        return JSON.parse(json);
    });
}
function getStargazersForRepo(owner, repo) {
    return octokit.paginate(octokit.rest.activity.listStargazersForRepo, {
        owner, repo, per_page: 100
    });
}
function getCachedUser(login) {
    return __awaiter(this, void 0, void 0, function* () {
        const userFile = (0, path_1.join)('cache', `${login}.json`);
        if (!(yield exists(userFile))) {
            const json = yield getUser(login);
            yield sleep(200);
            yield (0, promises_1.writeFile)(userFile, JSON.stringify(json, null, 2));
            return json;
        }
        const json = yield (0, promises_1.readFile)(userFile, 'utf-8');
        return JSON.parse(json);
    });
}
function getUser(login) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield octokit.users.getByUsername({ username: login })).data;
    });
}
