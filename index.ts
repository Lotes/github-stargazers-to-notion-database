import { create } from "domain";
import { getStargazers } from "./github";
import { createPerson, getPersons, Person } from "./notion";

(async function() {
  const mapPersons = new Map<string, Person>();
  for await (let person of getPersons()) {
    if(person.github == null || person.github === "") {
      continue;
    }
    mapPersons.set(person.github, person);
  }
  for await (let user of getStargazers("langium", "langium")) {
    const key = user.html_url;
    const avatar = user.avatar_url;
    const name = user.name ?? user.login;
    const email = user.email;
    if(!mapPersons.has(key)) {
      console.log(name+' created');
      createPerson({
        avatar,
        name,
        email: email ?? undefined,
        github: key,
      });
    }
  }  
})();
