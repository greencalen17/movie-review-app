import axios from "axios";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "MovieReviewsApp";
const COLLECTION_NAME = "Movies";

const RATE_LIMIT = 35; // TMDb allows 40 requests per 10s
const INTERVAL = 10000; // 10 seconds

if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set in your environment variables!");
}

// --- Fetch a page of movies from a TMDb endpoint ---
async function fetchMoviesFromEndpoint(
    endpoint: string,
    page: number
    ): Promise<any[]> {
    const url = `https://api.themoviedb.org/3/movie/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    const res = await axios.get(url);
    return res.data.results;
}

// --- Fetch full movie details ---
async function fetchMovieDetails(id: number) {
    try {
        const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,images`;
        const res = await axios.get(url);
        return res.data;
    } catch (err: any) {
        if (err.response?.status === 404) return null;
        console.error(`Error fetching ID ${id}:`, err.message);
        return null;
    }
}

// --- Main sync function ---
export async function syncTMDbMovies() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    const endpoints = ["popular", "top_rated", "upcoming", "now_playing"];

    for (const endpoint of endpoints) {
        console.log(`\nFetching movies from /movie/${endpoint}`);

        let page = 1;
        let totalPages = 1;
        let requests = 0;

        while (page <= totalPages) {
        if (requests >= RATE_LIMIT) {
            console.log("⏳ Rate limit reached, waiting 10s...");
            await new Promise((res) => setTimeout(res, INTERVAL));
            requests = 0;
        }

        try {
            const url = `https://api.themoviedb.org/3/movie/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
            const res = await axios.get(url);
            const movies = res.data.results;
            totalPages = res.data.total_pages;

            for (const movie of movies) {
            // Only insert if not already enriched
            const existing = await collection.findOne({ id: movie.id });
            if (!existing) {
                const details = await fetchMovieDetails(movie.id);
                if (details) {
                await collection.updateOne(
                    { id: movie.id },
                    { $set: { ...details, enriched: true } },
                    { upsert: true }
                );
                console.log(`✔ Saved: ${details.title}`);
                }
            }
            }

            page++;
            requests++;
        } catch (err: any) {
            console.error(`Error fetching page ${page} of ${endpoint}:`, err.message);
            await new Promise((res) => setTimeout(res, 5000)); // wait before retry
        }
        }
    }

    await client.close();
    console.log("✅ TMDb sync complete!");
}

// Run directly
if (require.main === module) {
    syncTMDbMovies().catch(console.error);
}
