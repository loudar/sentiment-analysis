import dotenv from 'dotenv';
import { TextAnalyzer } from './TextAnalyzer.mjs';
import {DataPreProcessor} from "./DataPreProcessor.mjs";
import fs from "fs";
import {CLI} from "./CLI.mjs";
import path from "path";
import {DataAnalysis} from "./DataAnalysis.mjs";

dotenv.config();

const messages = DataPreProcessor.preprocessDiscord();
CLI.success(`Loaded ${messages.length} messages`);
process.exit(0);
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
    const eta = new Date(startTime + (new Date().getTime() - startTime) / i * (messages.length - i));
    CLI.rewrite(`Analyzing message ${i}/${messages.length} | L${message.text.length} | ETA ${eta.toISOString()}`);
    const result = await analyzer.sentiment(message.text, language);
    message.score = result.score;
    message.confidence = result.confidence;
    message.weightedScore = result.weightedScore;
}
CLI.debug("");
CLI.success(`Analyzed ${i} messages`);
const tempFile = path.join(process.env.DISCORD_DATA_PATH, "messages.json");
fs.writeFileSync(tempFile, JSON.stringify(messages, null, 4));
CLI.success(`Wrote ${messages.length} messages to ${tempFile}`);

// const scoresOnDays = [];
// for (let i = 0; i < daysDifference; i++) {
//     const day = new Date(firstDateString);
//     day.setDate(day.getDate() + i);
//     const dayString = day.toISOString().split('T')[0];
//
//     const dayScores = messages
//         .filter(s => s.date === dayString)
//         .map(s => s.weightedScore);
//
//     let averageOnDay = 0;
//     if (dayScores.length > 0) {
//         averageOnDay = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
//     }
//
//     scoresOnDays.push({
//         date: dayString,
//         average: averageOnDay
//     });
// }

fs.writeFileSync("results.json", JSON.stringify(scoresOnDays, null, 4));
