import * as GitHub from "./github/github";
import * as Notion from "./notion/crm";

const crm = Notion.createCRM();

(async function() {
  for await (let user of GitHub.getStargazers("langium", "langium")) {
    const key = user.html_url;
    const avatar = user.avatar_url;
    const name = user.name ?? user.login;
    const email = user.email;
    const newPerson  = {
      avatar,
      name,
      email: email ?? undefined,
      github: key,
    };
    //crm.persons.create(newPerson);
  }  
})();
