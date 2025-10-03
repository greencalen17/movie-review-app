import axios from "axios";
import fs from "fs";
import zlib from "zlib";
import readline from "readline";
import { MongoClient } from "mongodb";

const TMDB_API_KEY = "YOUR_API_KEY";
const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "MovieReviewsApp";
const COLLECTION_NAME = "Movies";

const RATE_LIMIT = 40; // TMDb allows ~40 requests per 10 seconds
const INTERVAL = 10000; // 10s window

// --- 1. Download the daily export file ---
async function downloadExportFile(): Promise<string> {
    const url = "http://files.tmdb.org/p/exports/movie_ids.json.gz";
    const path = "./movie_ids.json.gz";
    const writer = fs.createWriteStream(path);

    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise<string>((resolve, reject) => {
        writer.on("finish", () => resolve(path));
        writer.on("error", (err) => reject(err));
    });
}

// --- 2. Parse and insert basic movies ---
async function importMoviesToMongo(path: string) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log("Connected to MongoDB, inserting movies...");

    const stream = fs
        .createReadStream(path)
        .pipe(zlib.createGunzip());

    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    let count = 0;
    for await (const line of rl) {
        if (!line.trim()) continue;
        const movie = JSON.parse(line);
        await collection.updateOne(
        { id: movie.id },
        { $setOnInsert: movie }, // only insert if new
        { upsert: true }
        );
        count++;
        if (count % 5000 === 0) {
        console.log(`Inserted ${count} movies...`);
        }
    }

    console.log(`✅ Finished inserting ${count} base movies`);
    await client.close();
}

// --- 3. Fetch detailed movie info from TMDb ---
async function fetchMovieDetails(id: number) {
    try {
        const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,images`;
        const res = await axios.get(url);
        return res.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 404) {
                console.warn(`Movie ${id} not found`);
                return null;
            }
            console.error(`Error fetching ID ${id}:`, err.message);
        } else if (err instanceof Error) {
            console.error(`Error fetching ID ${id}:`, err.message);
        } else {
            console.error(`Unknown error fetching ID ${id}`);
        }
        return null;
    }
}

// --- 4. Enrich movies with rate limiting ---
async function enrichMovies(batchSize = 200) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log("Starting enrichment job...");

    let enrichedCount = 0;

    while (true) {
        // Find movies without enrichment
        const movies = await collection.find({ enriched: { $ne: true } }).limit(batchSize).toArray();
        if (movies.length === 0) {
        console.log("✅ All movies enriched!");
        break;
        }

        console.log(`Enriching next ${movies.length} movies...`);

        let requests = 0;
        for (const movie of movies) {
        if (requests >= RATE_LIMIT) {
            console.log("⏳ Rate limit hit, sleeping 10s...");
            await new Promise((resolve) => setTimeout(resolve, INTERVAL));
            requests = 0;
        }

        const details = await fetchMovieDetails(movie.id);
        if (details) {
            await collection.updateOne(
            { id: movie.id },
            { $set: { ...details, enriched: true } }
            );
            console.log(`✔ Enriched: ${details.title}`);
        }

        requests++;
        enrichedCount++;
        }
    }

    console.log(`✅ Total enriched: ${enrichedCount}`);
    await client.close();
}

// --- Run ---
(async () => {
    const path = await downloadExportFile();
    await importMoviesToMongo(path);
    await enrichMovies(); // will loop until ALL movies enriched
})();
