import {AzureKeyCredential, TextAnalyticsClient} from "@azure/ai-text-analytics";

export class TextAnalyzer {
    constructor() {
        this.client = new TextAnalyticsClient(process.env.TEXT_ANALYTICS_ENDPOINT, new AzureKeyCredential(process.env.TEXT_ANALYTICS_KEY));
    }

    async sentiment(text) {
        return this.client.analyzeSentiment([ text ]);
    }
}