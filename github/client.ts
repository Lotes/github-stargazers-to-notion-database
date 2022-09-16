import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { env } from "process";
import { config } from "dotenv";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";

config();

export const github = new Octokit({ 
  authStrategy: createOAuthAppAuth,
  auth: {
    clientType: "oauth-app",
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_SECRET,
  }
});