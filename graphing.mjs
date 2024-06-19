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

graphCount(json);
graphAverageLength(json);