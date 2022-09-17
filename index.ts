import * as GitHub from "./github/queries";
import * as Notion from "./notion/crm";

const crm = Notion.createCRM();

async function forEachRepository(callback: (repository: Notion.Repository, name: GitHub.RepositoryName) => Promise<void>) {
  const RepositoryAddressPattern = /^https:\/\/github.com\/([^\/]+)\/([^\/]+)$/;
  for (const repository of await crm.repositories.all()) {
    const params = RepositoryAddressPattern.exec(repository.address);
    if(!params) {
      continue;
    }
    callback(
      repository, {
        owner: params[1],
        name: params[2]
      }
    );
  }
}

(async function() {
  await crm.repositories.all();
  console.log('Initialized CRM...');

  await forEachRepository(async (repo, name) => {
    for await (let user of GitHub.getStargazers('cache', name)) {
      const key = user.html_url;
      const avatar = user.avatar_url;
      const name = user.name ?? user.login;
      const website = user.blog  ?? undefined;
      const email = user.email ?? undefined;
      if(await crm.persons.has(key)) {
        const entry = {...await crm.persons.get(key)};
        entry.website = website;
        entry.avatar = avatar;
        entry.name = name;
        entry.email = email;
        const starIds = (entry.stars??[]).filter(s=>s).map(s=>s.id);
        if(starIds.indexOf(repo.id) === -1) {
          entry.stars = [...(entry.stars ?? []), repo];
        }
        const changes = await crm.persons.update(entry.id, entry);
        if(changes.length) {
          console.log(`Updated '${name}' (${JSON.stringify(changes)})`);
        } else {
          console.log(`Skipped '${name}'`);
        }
      } else {
        await crm.persons.create({
          avatar,
          name,
          website,
          email: email,
          github: key,
          stars: [repo],
        });
        console.log(`Created '${name}'`);
      }
    }
  });
})();
