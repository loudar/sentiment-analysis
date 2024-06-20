import fs from "fs";
import {DataAnalysis} from "./DataAnalysis.mjs";
import path from "path";
import dotenv from "dotenv";
import {CLI} from "./CLI.mjs";

/*
const data = fs.readFileSync("results.json", "utf8");
DataAnalysis.renderCsvColumnsAsImages(JSON.parse(data), "date", "results");
*/

dotenv.config();

const dataPath = path.join(process.env.DISCORD_DATA_PATH, "messages.json");
const data = fs.readFileSync(dataPath, "utf8");
const json = JSON.parse(data);

function graphCount(json) {
    const grouped = DataAnalysis.groupByDate(json, "month");
    let counts = DataAnalysis.countPerKey(grouped);
    counts = counts.sort((a, b) => new Date(a.key) - new Date(b.key));
    DataAnalysis.renderCsvColumnsAsImages(counts, "key", "results", ["date"], "count");
}

function graphAverageLength(json) {
    const grouped = DataAnalysis.groupByDate(json, "month");
    let averages = DataAnalysis.averageFromFunction(grouped, i => i.text.length);
    averages = averages.sort((a, b) => new Date(a.key) - new Date(b.key));
    DataAnalysis.renderCsvColumnsAsImages(averages, "key", "results", [], "averageLength");
}

function graphAverageSentiment(json) {
    const grouped = DataAnalysis.groupByDate(json, "month");
    let averages = DataAnalysis.averageFromFunction(grouped, i => i.weightedScore);
    averages = averages.sort((a, b) => new Date(a.key) - new Date(b.key));
    DataAnalysis.renderCsvColumnsAsImages(averages, "key", "results", [], "averageSentiment");
}

function graphConfidence(json) {
    const grouped = DataAnalysis.groupByInterval(json, "confidence", 0.02);
    let counts = DataAnalysis.countPerKey(grouped);
    counts = counts
        .filter(i => !isNaN(parseFloat(i.key)))
        .sort((a, b) => parseFloat(a.key) - parseFloat(b.key));
    DataAnalysis.renderCsvColumnsAsImages(counts, "key", "results", [], "confidence");
}

function graphRollingAverage(json) {
    json = json.sort((a, b) => new Date(a.date) - new Date(b.date));
    const rolled = DataAnalysis.rollingValue(json, i => i.weightedScore, (a, b) => a + b);
    const grouped = DataAnalysis.groupByDate(rolled, "day");
    let averages = DataAnalysis.averageFromFunction(grouped, i => i.value);
    averages = averages.sort((a, b) => new Date(a.key) - new Date(b.key));
    DataAnalysis.renderCsvColumnsAsImages(averages, "key", "results", [], "rollingAverage");
}

async function graphLanguages(json) {
    const languages = DataAnalysis.groupByFunction(json, i => i.language.iso6391Name);
    let counts = DataAnalysis.countPerKey(languages);
    let out = [];
    const countsSum = counts.reduce((a, b) => a + b.count, 0);
    for (const c of counts) {
        if (c.count > 0.01 * countsSum) {
            out.push(c);
        } else {
            if (!out.find(o => o.key === "Other")) {
                out.push({
                    key: "Other",
                    count: 0
                });
            }
            out.find(o => o.key === "Other").count += c.count;
        }
    }
    out = out.sort((a, b) => a.count - b.count);
    const data = out.map(c => c.count);
    const labels = out.map(c => c.key);
    await DataAnalysis.renderPieChart(data, labels, "results/languages", 1920, 1080);
}

async function graphSentiments(json) {
    const sentiments = DataAnalysis.groupByFunction(json, i => {
        if (i.weightedScore > 0) {
            return "positive";
        } else if (i.weightedScore < 0) {
            return "negative";
        } else {
            return "neutral";
        }
    });
    let counts = DataAnalysis.countPerKey(sentiments);
    counts = counts.sort((a, b) => a.count - b.count);
    const data = counts.map(c => c.count);
    const labels = counts.map(c => c.key);
    await DataAnalysis.renderPieChart(data, labels, "results/sentiments", 1920, 1080);
}

function graphWordUsageOverTime() {
    const data = fs.readFileSync("allWords.json", "utf8");
    const json = JSON.parse(data);
    const topCount = 5;
    const topWords = json.slice(0, topCount).sort((a, b) => b.count - a.count);
    let chartData = {};
    for (let i = 0; i < topCount; i++) {
        const word = topWords[i];
        const grouped = DataAnalysis.groupByDate(word.dates, "year");
        let counts = DataAnalysis.countPerKey(grouped);
        counts = counts.sort((a, b) => new Date(a.key) - new Date(b.key));
        const data = counts.map(c => c.count);
        const labels = counts.map(c => c.key);
        chartData[i] = {
            label: word.text,
            labels,
            data
        };
        CLI.debug(`Rendering ${word.text}...`);
    }
    DataAnalysis.renderMultiLineChart(chartData, "key", "results", [], "wordUsage");
}

graphCount(json);
graphAverageLength(json);
graphAverageSentiment(json);
await graphLanguages(json);
// graphConfidence(json);
graphRollingAverage(json);
await graphSentiments(json);
graphWordUsageOverTime();