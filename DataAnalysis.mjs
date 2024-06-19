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

    static renderAndSaveGraph(graphData, graphName, openAfterSave = false, width = 1920, height = 1080) {
        const chartConfig = {
            type: 'line',
            data: {
                labels: [...Array(graphData.length).keys()],
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

    static renderCsvColumnsAsImages(data, dateColumn, targetFolder, excludedColumns = []) {
        const keys = Object.keys(data[0]);
        for (const key of keys) {
            if (key === dateColumn || excludedColumns.includes(key)) {
                continue;
            }
            const column = data.map(d => d[key]);
            const imageName = `${key}_overtime`;
            CLI.debug(`Rendering ${imageName}...`);
            DataAnalysis.renderAndSaveGraph(column, `${targetFolder}/${imageName}`, false);
        }
    }

    static changeToPrevious(source, i) {
        if (source[i - 1] === undefined || source[i] === undefined) {
            console.log(source, i);
            return 0;
        }
        return source[i] - source[i - 1];
    }
}
