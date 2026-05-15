import type { Plugin } from "@opencode-ai/plugin";
import { login } from "./activity.js";

export default (async ({ client, project, directory, $ }) => {
    // Run login asynchronously so it doesn't block plugin initialization
    login(client).catch(() => {});

    return {
        config: async (cfg) => {},

        event: async (input) => {},

        "tool.execute.before": async (input, output) => {},

        "tool.execute.after": async (input, output) => {},
    };
}) satisfies Plugin;
