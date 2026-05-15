import { ActivityType, Client, PresenceBuilder } from "discord-rpc-new";
import type { PluginInput } from "@opencode-ai/plugin";

type OpencodeClient = PluginInput["client"];

const DISCORD_CLIENT_RPC = "1504974964032536808";
const client = new Client();

const baseActivity = new PresenceBuilder()
    .setType(ActivityType.Playing)
    .setLargeImage("opencode_logo_dark")
    .setStartTimestamp(Date.now());

export async function login(occlient: OpencodeClient) {
    let success = false;
    let attempts = 0;
    const maxRetries = 3;

    while (!success && attempts < maxRetries) {
        attempts++;
        success = await client.login({ clientId: DISCORD_CLIENT_RPC })
            .then(() => true)
            .catch(() => false);

        if (success) {
            await occlient.app.log({
                body: { service: "discord-rpc", level: "info", message: "Discord RPC successfully connected." },
            });
            await client.setActivity(baseActivity.build());
            return;
        }

        await occlient.app.log({
            body: { service: "discord-rpc", level: "warn", message: `Discord RPC connection failed. Attempt ${attempts}/${maxRetries}.` },
        });

        if (attempts < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }

    await occlient.app.log({
        body: { service: "discord-rpc", level: "error", message: "Discord RPC failed to connect after 3 attempts. Shutting down." },
    });
    
    await client.destroy().catch(() => {});
}
