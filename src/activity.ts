import { Client } from "@xhayper/discord-rpc";
import type { PluginInput } from "@opencode-ai/plugin";

type OpencodeClient = PluginInput["client"];

const DISCORD_CLIENT_RPC = "1504974964032536808";

const client = new Client({
    clientId: DISCORD_CLIENT_RPC,
});

export async function login(occlient: OpencodeClient) {
    let success = false;
    let attempts = 0;
    const maxRetries = 3;

    while (!success && attempts < maxRetries) {
        attempts++;
        success = await client
            .login()
            .then(() => true)
            .catch(() => false);

        if (success) {
            await occlient.app.log({
                body: {
                    service: "discord-rpc",
                    level: "info",
                    message: "Discord RPC successfully connected.",
                },
            });

            if (client.user) {
                await client.user.setActivity({
                    largeImageKey: "opencode_logo_dark",
                    startTimestamp: Date.now(),
                });
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
