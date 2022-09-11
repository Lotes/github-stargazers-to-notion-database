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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
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
exports.getPersons = exports.createPerson = void 0;
const client_1 = require("@notionhq/client");
const process_1 = require("process");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const notion = new client_1.Client({ auth: process_1.env.NOTION_KEY });
const Database = {
    Repositories: "",
    Persons: "b58df00e7c5f499a8e0ccfbc0394e4cc",
    Countries: "139c87418ae642b085cb39a904077f61",
    Locations: "b8d2d4d241c04bf88e24814e4018e4a6",
    Companies: "cef8197019024c1fa0e4173bb6eddfd9",
};
function createPerson(person) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        yield notion.pages.create({
            parent: {
                database_id: Database.Persons
            },
            icon: { type: 'external', external: { url: person.avatar } },
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
                    url: (_a = person.website) !== null && _a !== void 0 ? _a : null
                },
                Email: {
                    type: "email",
                    email: (_b = person.email) !== null && _b !== void 0 ? _b : null
                },
                Stars: {
                    type: "relation",
                    relation: [
                        {
                            id: "da3defa8-fd66-4332-8fa1-cf306ae4d01b"
                        }
                    ]
                },
            }
        });
    });
}
exports.createPerson = createPerson;
function getPersons() {
    return __asyncGenerator(this, arguments, function* getPersons_1() {
        let start_cursor = undefined;
        while (true) {
            const response = yield __await(notion.databases.query({
                database_id: Database.Persons,
                start_cursor
            }));
            yield __await(yield* __asyncDelegator(__asyncValues(response.results.map((r) => {
                var _a, _b, _c;
                return {
                    id: r.id,
                    avatar: r.icon.type === "external" ? r.icon.external.url : undefined,
                    github: (_a = r.properties.Github.url) !== null && _a !== void 0 ? _a : "",
                    name: r.properties.Name.title[0].text.content,
                    email: (_b = r.properties.Email.email) !== null && _b !== void 0 ? _b : "",
                    website: (_c = r.properties.Website.url) !== null && _c !== void 0 ? _c : "",
                };
            }))));
            if (!response.has_more) {
                break;
            }
            start_cursor = response.next_cursor;
        }
    });
}
exports.getPersons = getPersons;
