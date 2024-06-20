import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import {CLI} from "./CLI.mjs";
import {DataAnalysis} from "./DataAnalysis.mjs";

dotenv.config();

const dataPath = path.join(process.env.DISCORD_DATA_PATH, "messages.json");
const data = fs.readFileSync(dataPath, "utf8");
const json = JSON.parse(data);

let allWords = [];
const excluded = ["", "🤒", "the", "to", "it", "ich", "you", "that", "and", "is", "so", "for", "of", "in", "just", "but", "on", "be", "it's", "have", "this", "with", "not", "das", "do", "if", "was", "my", "i'm", "what", "also", "die", "that's", "one", "yeah", "ist", "can", "as", "und", "me", "some", "really", "nicht", "stuff", "an", "more", "now", "are", "or", "aber", "get", "auch", "too", "at", "how", "know",
    "oh", "your", "don't", "about", "think", "out", "from", "i'll", "would", "will", "ja", "all", "up", "there", "then", "der", "much", "man", "make", "could", "du", "no", "when", "mal", "thing", "which", "still", "want", "even", "work", "einfach", "time", "see", "hab", "zu", "something", "why", "should", "nice", "only", "dann", "actually", "go", "need", "we", "go", "cool", "same", "try", "maybe", "mit", "auf",
    "other", "they", "okay", "did", "noch", "new", "gonna", "you're", "für", "sehr", "has", "because", "mir", "well", "nur", "into", "didn't", "da", "use", "can't", "way", "den", "jetzt", "had", "tho", "doesn't", "though", "wie", "gut", "good", "i'd", "better", "schon", "lot", "oder", "might", "little", "than", "them", "dass", "wenn", "send", "people", "wanna", "sure", "feel", "bei", "probably", "he", "been", "es",
    "bin", "very", "where", "idea", "first", "am", "wait", "made", "mean", "i've", "everything", "yeah", "von", "kann", "cause", "right", "never", "sind", "look", "by", "any", "here", "done", "always", "mich", "hat", "btw", "back", "ne", "working", "anything", "going", "kinda", "already", "does", "different", "take", "halt", "two", "since", "guess", "works", "least", "there's", "definitely", "yet", "find", "war",
    "thought", "things", "wir", "down", "als", "those", "doing", "basically", "looks", "getting", "alright", "isn't", "true", "ein", "mehr", "after", "over", "hey", "dir", "name", "off", "every", "enough", "these", "im", "muss", "ah", "alles", "viel", "weil", "machen", "through", "like", "got", "bit", "yes", "great", "again", "best", "around", "far", "before", "second", "aus", "next", "point", "own", "grad", "him",
    "say", "give", "geht", "totally", "hast", "sich", "haben", "being", "else", "doch", "anyway", "gotta", "put", "aswell", "course", "keep", "fair", "dem", "possible", "making", "hard", "most", "nothing", "makes", "while", "his", "mein", "glad", "fine", "hier", "happy", "exactly", "last", "wird", "wieso", "immer", "absolutely", "both", "having", "change", "nope", "seems", "many", "heard", "such", "bisschen", "used",
"especially", "tell", "wieder", "literally", "sein", "wanted", "set", "play", "sie", "free", "long", "trying", "haven't", "whole", "sometimes", "were", "soon", "tomorrow", "wouldn't", "nah", "um", "day", "nach", "later", "days", "who", "another", "year", "ones", "let", "write", "heute", "kind", "start", "meine", "video", "someone", "er", "without", "school", "end", "currently", "send", "what's", "less", "easy", "zeit",
    "said", "week", "kein", "add", "ganz", "myself", "until", "nen", "hm", "mhm", "wirklich", "they're", "zum", "saw", "come", "text", "years", "help", "we're", "you'll", "vor", "everyone", "alle", "few", "eigentlich", "almost", "case", "each", "he's", "that'd", "quite", "THE", "ever", "I'm", "able", "started", "open", "small", "show", "reason", "read", "feels", "{\n", "big", "10", "example", "either", "their", "morgen",
"mach", "gets", "let's", "wär", "eine", "safe", "between", "weiß", "keine", "ask", "her", "mind", "dich", "together", "using", "sense", "old", "home", "besser", "erstmal", "somehow", "image", "gemacht", "gibt", "you'd", "fall", "sort", "bist", "links", "usually", "goes", "nochmal", "our", "youtube", "page", "wo", "finished", "depends", "morning", "seen", "space", "coming", "Hey", "missing", "mine", "worked", "IS", "zwei",
    "within", "könnte", "certain", "straight", "similar", "added", "habe", "happen", "gar", "bunch", "it'll", "IF", "kommt", "place", "size", "eig", "direction", "AS", "would've", "high"];
for (let i = 0; i < json.length; i++) {
    const message = json[i];
    if (i % 1000 === 0) {
        CLI.debug(`Processed ${i} messages`);
    }
    const words = message.text.replaceAll(/[,.!?]/g, "").split(" ");
    for (let word of words) {
        if (word.length < 2 || excluded.includes(word)) {
            continue;
        }

        if (!allWords.find(i => i.text === word)) {
            allWords.push({
                text: word,
                count: 0,
                dates: [{
                    date: message.date,
                    count: 0
                }]
            });
        }
        const entry = allWords.find(i => i.text === word);
        entry.count++;
        if (!entry.dates.find(i => i.date === message.date)) {
            entry.dates.push({
                date: message.date,
                count: 0
            });
        }
        entry.dates.find(i => i.date === message.date).count++;
    }
}
allWords = allWords.filter(i => i.count > 100);
CLI.debug(`Found ${allWords.length} unique words used more than 100 times`);
allWords = allWords.sort((a, b) => b.count - a.count);
allWords = allWords.slice(0, 50);
fs.writeFileSync("allWords.json", JSON.stringify(allWords, null, 4));
const labels = allWords.map(i => i.text);
DataAnalysis.renderAndSaveGraph(allWords.map(i => i.count), "results/wordCount", "most common words", labels, "bar", false);

const mostPositiveCount = 10;
const mostPositive = json.sort((a, b) => b.weightedScore - a.weightedScore).slice(0, mostPositiveCount).map(i => {
    return {
        text: i.text,
        date: i.date,
    };
});
//fs.writeFileSync("mostPositive.json", JSON.stringify(mostPositive, null, 4));

const mostNegativeCount = 10;
const mostNegative = json.sort((a, b) => a.weightedScore - b.weightedScore).slice(0, mostNegativeCount).map(i => {
    return {
        text: i.text,
        date: i.date,
    };
});
//fs.writeFileSync("mostNegative.json", JSON.stringify(mostNegative, null, 4));

const countPositive = json.filter(i => i.weightedScore > 0).length;
const countNegative = json.filter(i => i.weightedScore < 0).length;
const notZeroCount = json.filter(i => i.weightedScore !== 0).length;
console.log(`Count not zero: ${notZeroCount} | ${(notZeroCount / json.length * 100).toFixed(2)}%`);
const percentagePositive = countPositive / json.length * 100;
const percentageNegative = countNegative / json.length * 100;
console.log(`Count positive: ${countPositive} | ${percentagePositive.toFixed(2)}%`);
console.log(`Count negative: ${countNegative} | ${percentageNegative.toFixed(2)}%`);

const messagesPerLanguage = json.reduce((acc, i) => {
    const language = i.language.iso6391Name;
    if (!acc[language]) {
        acc[language] = [];
    }
    acc[language].push(i);
    return acc;
}, {});

for (const language in messagesPerLanguage) {
    const messages = messagesPerLanguage[language];
    const count = messages.length;
    const percentage = count / json.length * 100;
    console.log(`${language}: ${count} | ${percentage.toFixed(2)}%`);
}
