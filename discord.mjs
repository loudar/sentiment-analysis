import dotenv from 'dotenv';
import { TextAnalyzer } from './TextAnalyzer.mjs';
import {DataPreProcessor} from "./DataPreProcessor.mjs";
import fs from "fs";
import {CLI} from "./CLI.mjs";
import path from "path";

dotenv.config();

const messages = DataPreProcessor.preprocessDiscord();
CLI.success(`Loaded ${messages.length} messages`);
const language = "en";

console.log(`Using endpoint ${process.env.TEXT_ANALYTICS_ENDPOINT}`);
const analyzer = new TextAnalyzer();
let i = 0;
const startTime = new Date().getTime();
for (const message of messages) {
    if (message.score && message.confidence && message.weightedScore) {
        continue;
    }

    i++;
    const diff = (new Date().getTime() - startTime) / i;
    const eta = new Date(startTime + diff * (messages.length - i));
    const timeToEta = eta - new Date();
    const timeToEtaString = new Date(timeToEta).toISOString().substring(11, 19);
    CLI.rewrite(`Analyzing message ${i}/${messages.length} | L${message.text.length.toString().padEnd(5, " ")} | ETA ${timeToEtaString} | TPM ${diff.toFixed(2)}ms`);
    const result = await analyzer.sentiment(message.text, language);
    if (diff < 1000 / 60) {
        await new Promise(resolve => setTimeout(resolve, 1000 / 60 - diff));
    }
    message.score = result.score;
    message.confidence = result.confidence;
    message.weightedScore = result.weightedScore;

    if (i % 100 === 0) {
        CLI.rewrite(`Writing to file...`);
        fs.writeFileSync(path.join(process.env.DISCORD_DATA_PATH, "messages.json"), JSON.stringify(messages, null, 4));
    }
}
CLI.debug("");
CLI.success(`Analyzed ${i} messages`);
const tempFile = path.join(process.env.DISCORD_DATA_PATH, "messages.json");
fs.writeFileSync(tempFile, JSON.stringify(messages, null, 4));
CLI.success(`Wrote ${messages.length} messages to ${tempFile}`);
