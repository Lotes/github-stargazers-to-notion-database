import * as GitHub from "./github/queries";
import * as Notion from "./notion/crm";

const crm = Notion.createCRM();
const RepositoryAddressPattern = /^https:\/\/github.com\/([^\/]+)\/([^\/]+)$/;
(async function() {
  for (const repository of await crm.repositories.all()) {
    const params = RepositoryAddressPattern.exec(repository.address);
    if(!params) {
      continue;
    }
    const repoName  = {
      owner: params[1],
      name: params[2]
    }
    for await (let user of GitHub.getStargazers('cache', repoName)) {
      const key = user.html_url;
      const avatar = user.avatar_url;
      const name = user.name ?? user.login;
      const website = user.blog  ?? undefined;
      const email = user.email ?? undefined;
      if(await crm.persons.has(key)) {
        const entry = await crm.persons.get(key);
        entry.website = website;
        entry.avatar = avatar;
        entry.name = name;
        entry.email = email;
        if((entry.stars??[]).indexOf(repository) === -1) {
          entry.stars = [...(entry.stars ?? []), repository];
        }
        if(await crm.persons.update(entry.id, entry)) {
          console.log(`Updated '${name}'`);
        }
      } else {
        await crm.persons.create({
          avatar,
          name,
          website,
          email: email,
          github: key,
          stars: [repository],
        });
        console.log(`Created '${name}'`);
      }
    }
  }
})();
