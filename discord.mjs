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
let i = 0, analyzed = 0;
const startTime = new Date().getTime();
for (const message of messages) {
    i++;
    let diff = (new Date().getTime() - startTime) / analyzed;
    if (isNaN(diff)) {
        diff = 0;
    } else if (diff === Infinity) {
        diff = 100; // Estimate
    }
    const eta = new Date(new Date().getTime() + diff * (messages.length - i));
    const timeToEta = eta.getTime() - new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000;
    const baseDate = new Date(1990, 0, 1, 23, 0, 0).getTime();
    const timeToEtaString = new Date(baseDate + timeToEta).toISOString().substring(11, 19);
    const progress = i / messages.length;
    let changed = false;
    if (i % 1000 === 0) {
        CLI.rewrite(`Checking message ${i}/${messages.length} | L${message.text.length.toString().padEnd(5, " ")} | ETA ${timeToEtaString} | TPM ${diff.toFixed(2)}ms`);
    }

    if (message.language === undefined) {
        const barLength = 20;
        const bars = "=".repeat(Math.round(progress * barLength));
        const spaces = " ".repeat(barLength - Math.round(progress * barLength));
        CLI.rewriteLines([`Analyzing language for message ${i}/${messages.length} | L${message.text.length.toString().padEnd(5, " ")} | ETA ${timeToEtaString} | TPM ${diff.toFixed(2)}ms`,
            ` [${bars}${spaces}]`]);
        const result = await analyzer.language(message.text);
        message.language = result.language;
        changed = true;
    }

    //if (!message.score || message.confidence || message.weightedScore) {
    if (message.language.iso6391Name && message.language.iso6391Name !== "en" && message.language.iso6391Name !== "(Unknown)") {
        CLI.rewrite(`Analyzing sentiment for message ${i}/${messages.length} | L${message.text.length.toString().padEnd(5, " ")} | ETA ${timeToEtaString} | TPM ${diff.toFixed(2)}ms`);
        const result = await analyzer.sentiment(message.text, message.language.iso6391Name);
        if (result) {
            message.score = result.score;
            message.confidence = result.confidence;
            message.weightedScore = result.weightedScore;
            changed = true;
        }
    }

    if (changed) {
        analyzed++;

        if (i % 100 === 0) {
            CLI.rewrite(`Writing to file...`);
            fs.writeFileSync(path.join(process.env.DISCORD_DATA_PATH, "messages.json"), JSON.stringify(messages, null, 4));
        }

        if (diff < 1000 / 60) {
            await new Promise(resolve => setTimeout(resolve, 1000 / 60 - diff));
        }
    }
}

CLI.debug("");
CLI.success(`Analyzed ${i} messages`);
const tempFile = path.join(process.env.DISCORD_DATA_PATH, "messages.json");
fs.writeFileSync(tempFile, JSON.stringify(messages, null, 4));
CLI.success(`Wrote ${messages.length} messages to ${tempFile}`);
