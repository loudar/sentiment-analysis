import dotenv from 'dotenv';

dotenv.config();

import { TextAnalyzer } from './TextAnalyzer.mjs';
import {DataPreProcessor} from "./DataPreProcessor.mjs";
import fs from "fs";

console.log(`Using endpoint ${process.env.TEXT_ANALYTICS_ENDPOINT}`);
const analyzer = new TextAnalyzer();

const sentences = DataPreProcessor.mockData();
const language = "en";

const result = await analyzer.sentiment(sentences.map(s => s.text), language);

for (let i = 0; i < result.length; i++) {
    const { score, confidence } = result[i];
    sentences[i].score = score;
    sentences[i].confidence = confidence;
    sentences[i].weightedScore = score * confidence;
}

const firstDateString = sentences[0].date;
const lastDateString = sentences[sentences.length - 1].date;
const firstDate = new Date(firstDateString);
const lastDate = new Date(lastDateString);
const daysDifference = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));

const scoresOnDays = [];
for (let i = 0; i < daysDifference; i++) {
    const day = new Date(firstDateString);
    day.setDate(day.getDate() + i);
    const dayString = day.toISOString().split('T')[0];

    const dayScores = sentences
        .filter(s => s.date === dayString)
        .map(s => s.weightedScore);

    let averageOnDay = 0;
    if (dayScores.length > 0) {
        averageOnDay = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
    }

    scoresOnDays.push({
        date: dayString,
        average: averageOnDay
    });
}

fs.writeFileSync("results.json", JSON.stringify(scoresOnDays, null, 4));
