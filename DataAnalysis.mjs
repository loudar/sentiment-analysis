import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';
import {CLI} from "./CLI.mjs";

export class DataAnalysis {
    static runningAverage(data, index, previousCount) {
        let sum = 0;
        for (let i = index - previousCount + 1; i <= index; i++) {
            sum += data[i];
        }
        return sum / previousCount;
    }

    static renderAndSaveGraph(graphData, graphName, dateColumnLabels, openAfterSave = false, width = 1920, height = 1080) {
        const chartConfig = {
            type: 'line',
            data: {
                labels: dateColumnLabels,
                datasets: [
                    {
                        data: graphData,
                    },
                ],
            },
            options: {
                backgroundColor: 'white',
                borderColor: 'white',
                pointRadius: 0,
            },
        };

        const canvasRenderService = new ChartJSNodeCanvas({
            width, height
        });

        canvasRenderService.renderToBuffer(chartConfig)
            .then(buffer => {
                fs.writeFileSync(`${graphName}.png`, buffer);
            })
            .catch(error => console.error(error));
    }

    static renderCsvColumnsAsImages(data, dateColumn, targetFolder, excludedColumns = [], graphName = null) {
        const keys = Object.keys(data[0]);
        const dateColumnLabels = data.map(d => d[dateColumn]);
        for (const key of keys) {
            if (key === dateColumn || excludedColumns.includes(key)) {
                continue;
            }
            const column = data.map(d => d[key]);
            const imageName = graphName ?? `${key}_overtime`;
            CLI.debug(`Rendering ${imageName}...`);
            DataAnalysis.renderAndSaveGraph(column, `${targetFolder}/${imageName}`, dateColumnLabels, false);
        }
    }

    static changeToPrevious(source, i) {
        if (source[i - 1] === undefined || source[i] === undefined) {
            console.log(source, i);
            return 0;
        }
        return source[i] - source[i - 1];
    }

    /**
     *
     * @param json
     * @param resolution "day", "month", "year"
     */
    static groupByDate(json, resolution) {
        const grouped = {};
        for (const item of json) {
            const date = new Date(item.date);
            const key = DataAnalysis.getKeyFromDateWithResolution(date, resolution);
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push({
                ...item,
                key
            });
        }
        return grouped;
    }

    static getKeyFromDateWithResolution(date, resolution) {
        if (resolution === "day") {
            return date.toISOString().split('T')[0];
        } else if (resolution === "month") {
            return `${date.getFullYear()}-${date.getMonth() + 1}`;
        } else if (resolution === "year") {
            return `${date.getFullYear()}`;
        } else {
            return date;
        }
    }

    static countPerKey(json) {
        const counts = [];
        for (const objKey of Object.keys(json)) {
            counts.push({
                key: objKey,
                count: json[objKey].length
            });
        }
        return counts;
    }

    static averageFromFunction(data, func = i => i) {
        const averages = [];
        for (const objKey of Object.keys(data)) {
            const values = data[objKey].map(func);
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            averages.push({
                key: objKey,
                average
            });
        }
        return averages;
    }
}
