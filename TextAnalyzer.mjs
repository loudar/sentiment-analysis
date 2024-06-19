const {AzureKeyCredential, TextAnalyticsClient} = require("@azure/ai-text-analytics");

export class TextAnalyzer {
    constructor() {
        this.client = new TextAnalyticsClient(process.env.TEXT_ANALYTICS_ENDPOINT, new AzureKeyCredential(process.env.TEXT_ANALYTICS_KEY));
    }

    async sentiment(input, language = "en") {
        if (input.constructor === Array) {
            let output = [];
            for (const text of input) {
                output.push(await this.sentiment(text));
            }
            return output;
        }

        input = input.replace(/\s+/g, ' ').trim();
        if (input.length === 0) {
            return 0;
        }
        const result = await this.client.analyzeSentiment([{
            id: "1",
            text: input,
            language: language || "en"
        }]);
        const first = result[0];
        return {
            score: TextAnalyzer.sentimentValueMap[first.sentiment],
            confidence: first.confidenceScores[first.sentiment],
            weightedScore: TextAnalyzer.sentimentValueMap[first.sentiment] * first.confidenceScores[first.sentiment]
        };
    }

    static sentimentValueMap = {
        negative: -1,
        positive: 1,
        neutral: 0,
        mixed: 0
    };
}