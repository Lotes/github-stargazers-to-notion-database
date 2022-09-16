import { Client } from "@notionhq/client";
import { env } from "process";
import { config } from "dotenv";

config();

export const notion = new Client({ auth: env.NOTION_KEY });