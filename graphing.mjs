import fs from "fs";
import {DataAnalysis} from "./DataAnalysis.mjs";

const data = fs.readFileSync("results.json", "utf8");
DataAnalysis.renderCsvColumnsAsImages(JSON.parse(data), "date", "results");
