import {CLI} from "./CLI.mjs";

const {AzureKeyCredential, TextAnalyticsClient} = require("@azure/ai-text-analytics");

export class TextAnalyzer {
    constructor() {
        this.client = new TextAnalyticsClient(process.env.TEXT_ANALYTICS_ENDPOINT, new AzureKeyCredential(process.env.TEXT_ANALYTICS_KEY));
    }

    async sentiment(input, language = "en") {
        if (language === "(Unknown)") {
            return null;
        }

        if (input.constructor === Array) {
            let output = [];
            for (const text of input) {
                output.push(await this.sentiment(text));
            }
            return output;
        }

        input = input.replace(/\s+/g, ' ').trim();
        if (input.length === 0) {
            return null;
        }
        const result = await this.client.analyzeSentiment([{
            id: "1",
            text: input,
            language: language || "en"
        }]);
        const first = result[0];
        try {
            return {
                score: TextAnalyzer.sentimentValueMap[first.sentiment],
                confidence: first.confidenceScores[first.sentiment],
                weightedScore: TextAnalyzer.sentimentValueMap[first.sentiment] * first.confidenceScores[first.sentiment]
            };
        } catch (e) {
            if (result[0].error) {
                CLI.write("\n");
                CLI.error(`Error while analyzing sentiment for text "${input}" with language "${language}"`);
                CLI.error(result[0].error.message);
                return null;
            }

            CLI.write("\n");
            CLI.error(`Error while analyzing sentiment for text "${input}" with language "${language}"`);
            CLI.error(e);
            return null;
        }
    }

    static sentimentValueMap = {
        negative: -1,
        positive: 1,
        neutral: 0,
        mixed: 0
    };

    async language(input) {
        if (input.constructor === Array) {
            let output = [];
            for (const text of input) {
                output.push(await this.language(text));
            }
            return output;
        }

        input = input.replace(/\s+/g, ' ').trim();
        if (input.length === 0) {
            return {
                language: null
            }
        }
        const result = await this.client.detectLanguage([input]);
        const first = result[0];
        return {
            language: first.primaryLanguage
        };
    }
}