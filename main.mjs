import dotenv from 'dotenv';

dotenv.config();

import { TextAnalyzer } from './TextAnalyzer.mjs';

console.log(`Using endpoint ${process.env.TEXT_ANALYTICS_ENDPOINT}`);
const analyzer = new TextAnalyzer();

const text = `this is actually sick
this allows me to git commit and have it rebuild on the system
actually super cool
this is what i always wanted
instead of the in-between step`;

const sentences = text.split('\n');
const language = "en";

const result = await analyzer.sentiment(sentences, language);
console.log(sentences.map((text, index) => `${text} -> ${JSON.stringify(result[index])}`).join('\n'));

const weightedScores = result.map(({ score, confidence }) => score * confidence);
const average = weightedScores.reduce((a, b) => a + b, 0) / weightedScores.length;
console.log(`Average sentiment: ${average}`);

const median = weightedScores.sort()[Math.floor(weightedScores.length / 2)];
console.log(`Median sentiment: ${median}`);
