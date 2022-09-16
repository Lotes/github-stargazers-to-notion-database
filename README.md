# github-stargazers-to-notion-database

Pipes Github stargazers into your Notion database.

It is meant to orchestrate the functions in `/notion` and `/github` to fill the database as needed.

The scripts contain GUIDs to MY databases in Notion. Change them properly to adapt it to your own databases.

## Attention

You need to create
1. a [Notion integration](https://developers.notion.com/docs/getting-started)
2. and a [GitHub OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)
3. to fill out an `.env` from values of  previous steps:

    ```
    NOTION_KEY=...
    GITHUB_SECRET=...
    GITHUB_CLIENT_ID=...
    ```

4. The environment file is not checked in.