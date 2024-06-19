import fs from 'fs';
import path from 'path';
import {CLI} from "./CLI.mjs";

export class DataPreProcessor {
    static mockData() {
        return [
            {
                "text": "this is actually sick",
                "date": "2022-01-01",
            },
            {
                "text": "this allows me to git commit and have it rebuild on the system",
                "date": "2022-01-01",
            },
            {
                "text": "actually super cool",
                "date": "2022-01-03",
            },
            {
                "text": "this is what i always wanted",
                "date": "2022-01-04",
            },
            {
                "text": "instead of the in-between step",
                "date": "2022-01-05",
            }
        ]
    }

    static preprocessDiscord() {
        if (!process.env.DISCORD_DATA_PATH) {
            throw new Error("DISCORD_DATA_PATH not set");
        }

        const tempFile = path.join(process.env.DISCORD_DATA_PATH, "messages.json");
        if (fs.existsSync(tempFile)) {
            return JSON.parse(fs.readFileSync(tempFile));
        }

        const messagesFolder = path.join(process.env.DISCORD_DATA_PATH, "messages");
        const channelFolders = fs.readdirSync(messagesFolder).filter(file => fs.statSync(path.join(messagesFolder, file)).isDirectory());
        CLI.success(`Found ${channelFolders.length} channels`);
        const messages = [];
        for (const channelFolder of channelFolders) {
            CLI.debug(`Processing channel ${channelFolder}`);
            const channelPath = path.join(messagesFolder, channelFolder);
            const messagesFile = path.join(channelPath, "messages.json");
            if (!fs.existsSync(messagesFile)) {
                CLI.error(`No messages file found for channel ${channelFolder}`);
                continue;
            }

            const channelMessages = JSON.parse(fs.readFileSync(messagesFile));
            CLI.debug(`Found ${channelMessages.length} messages`);
            for (const message of channelMessages) {
                if (message.Timestamp && message.Contents) {
                    messages.push({
                        text: message.Contents,
                        date: message.Timestamp
                    });
                }
            }
        }
        CLI.success(`Processed ${messages.length} messages, writing to ${tempFile}`);
        fs.writeFileSync(tempFile, JSON.stringify(messages, null, 2));
        return messages.map(m => {
            m.date = new Date(m.date).toISOString().split('T')[0];
            return m;
        })
    }
}