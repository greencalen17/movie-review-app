import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import express from "express";
import { Request, Response } from "express";


dotenv.config();

const router = express.Router();
const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri);

let db: any;

async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db("MovieReviewsApp");
        console.log("✅ Connected to MongoDB");
    }
    return db;
}

// GET /all movies
router.get("/all-movies", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const movies = database.collection("Movies");

        const allMovies = await movies.find().toArray();

        if (!allMovies) {
            return res.status(404).json({ error: "Movies not found" });
        }
        res.json(allMovies);
    } catch (error) {
        console.error("Error in GET /movies/all-movies:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /movie/:_id
router.get("/getMovieById/:_id", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const movies = database.collection("Movies");

        const movieId = req.params._id;
        const movie = await movies.findOne({ _id: new ObjectId(movieId) });

        if (!movie) {
            return res.status(404).json({ error: "Movie not found" });
        }
        res.json(movie);
    } catch (error) {
        console.error("Error in GET /movies/getMovieById/:_id:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;