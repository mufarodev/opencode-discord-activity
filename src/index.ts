import type { Plugin } from "@opencode-ai/plugin";
import { login, updatePresenceState, cleanup } from "./activity.js";

const sessions = new Map<string, { agent?: string; model?: string }>();

export default (async ({ client, project, directory, $ }) => {
    login(client).catch(() => {});
    updatePresenceState({
        details: `In ${directory.split("/").at(-1)}`,
        state: "Idle",
    });

    return {
        config: async (cfg) => {},

        event: async ({ event }) => {
            if (event.type === "message.updated" && event.properties.info.role === "user") {
                const info = event.properties.info;
                sessions.set(info.sessionID, {
                    agent: info.agent,
                    model: info.model?.modelID,
                });
            }

            if (event.type === "session.status") {
                const sessionId = event.properties.sessionID;
                if (event.properties.status.type === "busy") {
                    const sessionInfo = sessions.get(sessionId);
                    if (sessionInfo && sessionInfo.agent && sessionInfo.model) {
                        updatePresenceState({
                            state: `${sessionInfo.agent} · ${sessionInfo.model}`,
                        });
                    } else {
                        updatePresenceState({
                            state: `Running`,
                        });
                    }
                } else if (event.properties.status.type === "idle") {
                    updatePresenceState({
                        state: "Idle",
                    });
                }
            }
        },

        "tool.execute.before": async (input, output) => {},

        "tool.execute.after": async (input, output) => {},
    };
}) satisfies Plugin;
