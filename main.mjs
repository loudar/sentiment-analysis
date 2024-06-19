import dotenv from 'dotenv';

dotenv.config();

import { TextAnalyzer } from './TextAnalyzer.mjs';

console.log(`Using endpoint ${process.env.TEXT_ANALYTICS_ENDPOINT}`);
console.log(`Using key ${process.env.TEXT_ANALYTICS_KEY}`);
const analyzer = new TextAnalyzer();

const result = await analyzer.sentiment("I love this product");
console.log(result);