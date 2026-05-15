import type { Plugin } from "@opencode-ai/plugin";

export default (async ({ client, project, directory, $ }) => {
    return {
        config: async (cfg) => {},

        event: async (input) => {},

        "tool.execute.before": async (input, output) => {},

        "tool.execute.after": async (input, output) => {},
    };
}) satisfies Plugin;
