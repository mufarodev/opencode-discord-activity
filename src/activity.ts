import { Client, SetActivity } from "@xhayper/discord-rpc";
import type { PluginInput } from "@opencode-ai/plugin";

type OpencodeClient = PluginInput["client"];

const DISCORD_CLIENT_RPC = "1504974964032536808";

const client = new Client({
    clientId: DISCORD_CLIENT_RPC,
});
let loginSuccess = false;
let currentActivityState: Partial<SetActivity> = {};
let pollInterval: ReturnType<typeof setInterval> | null = null;

const baseActivity: SetActivity = {
    largeImageKey: "opencode_logo_dark",
    startTimestamp: Date.now(),
};

export const updatePresenceState = (state: Partial<SetActivity>) => {
    currentActivityState = { ...currentActivityState, ...state };
};

const pollDiscordActivity = async () => {
    if (!loginSuccess) return;

    await client.user?.setActivity({
        ...baseActivity,
        ...currentActivityState,
    });
};

export async function login(occlient: OpencodeClient) {
    let attempts = 0;
    const maxRetries = 3;

    while (!loginSuccess && attempts < maxRetries) {
        attempts++;
        loginSuccess = await client
            .login()
            .then(() => true)
            .catch(() => false);

        if (loginSuccess) {
            await occlient.app.log({
                body: {
                    service: "discord-rpc",
                    level: "info",
                    message: "Discord RPC successfully connected.",
                },
            });

            if (client.user) {
                await pollDiscordActivity();
                pollInterval = setInterval(pollDiscordActivity, 8 * 1000);
            }
            return;
        }

        await occlient.app.log({
            body: {
                service: "discord-rpc",
                level: "warn",
                message: `Discord RPC connection failed. Attempt ${attempts}/${maxRetries}.`,
            },
        });

        if (attempts < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }

    await occlient.app.log({
        body: {
            service: "discord-rpc",
            level: "error",
            message:
                "Discord RPC failed to connect after 3 attempts. Shutting down.",
        },
    });

    await client.destroy().catch(() => {});
}

export function cleanup() {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    client.destroy().catch(() => {});
}
