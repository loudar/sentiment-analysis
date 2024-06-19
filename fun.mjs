import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dataPath = path.join(process.env.DISCORD_DATA_PATH, "messages.json");
const data = fs.readFileSync(dataPath, "utf8");
const json = JSON.parse(data);

const confidenceTreshholds = [0.5, 0.6, 0.7, 0.8, 0.9];
const countUnderTreshholds = confidenceTreshholds.map(treshhold => {
    return json.filter(i => i.confidence < treshhold).length;
});
for (let i = 0; i < confidenceTreshholds.length; i++) {
    const percentage = countUnderTreshholds[i] / json.length * 100;
    console.log(`Count under ${confidenceTreshholds[i]}: ${countUnderTreshholds[i]} | ${percentage.toFixed(2)}%`);
}

const mostPositiveCount = 10;
const mostPositive = json.sort((a, b) => b.weightedScore - a.weightedScore).slice(0, mostPositiveCount).map(i => {
    return {
        text: i.text,
        date: i.date,
    };
});
fs.writeFileSync("mostPositive.json", JSON.stringify(mostPositive, null, 4));

const mostNegativeCount = 10;
const mostNegative = json.sort((a, b) => a.weightedScore - b.weightedScore).slice(0, mostNegativeCount).map(i => {
    return {
        text: i.text,
        date: i.date,
    };
});
fs.writeFileSync("mostNegative.json", JSON.stringify(mostNegative, null, 4));