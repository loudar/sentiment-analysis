# Setup

`.env`
```dotenv
TEXT_ANALYTICS_ENDPOINT=https://<your-endpoint>.cognitiveservices.azure.com/
TEXT_ANALYTICS_KEY=<your-key-here>
DISCORD_DATA_PATH=C:\Users\YourPath\ToDiscordMessages
```

Running `npm install` will install all dependencies.

Running `npm run discord` will start the language + sentiment analysis of all messages in the `DISCORD_DATA_PATH`.

Depending on the amount of messages, this can become quite expensive (~ $1 per 1000 messages).
