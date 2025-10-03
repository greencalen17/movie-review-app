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

// GET /all reviews
router.get("/all-reviews", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const reviews = database.collection("Reviews");

        const allReviews = await reviews.find().toArray();

        if (!allReviews) {
            return res.status(404).json({ error: "Reviews not found" });
        }
        console.log("Fetched reviews:", allReviews);
        res.json(allReviews);
    } catch (error) {
        console.error("Error in GET /reviews/all-reviews:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /review/:_id
router.get("/getReviewById/:_id", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const reviews = database.collection("Reviews");

        const reviewId = req.params._id;
        const review = await reviews.findOne({ _id: new ObjectId(reviewId) });

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }
        console.log("Fetched review:", review);
        res.json(review);
    } catch (error) {
        console.error("Error in GET /reviews/getReviewById/:_id:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /add review
router.post("/add-review", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const reviews = database.collection("Reviews");

        const { user, movie, rating, comment } = req.body;

        // Basic validation
        if (!user || !movie || rating === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const alreadyReviewed = await reviews.findOne({ user: new ObjectId(user), movie: new ObjectId(movie) });
        if (alreadyReviewed) {
            const updatedReview = await reviews.findOneAndUpdate(
                { user: new ObjectId(user), movie: new ObjectId(movie) },
                { $set: { rating: Number(rating), comment: comment || "", updatedAt: new Date() } },
                { returnDocument: "after" }
            );
            return res.json({
                success: true,
                updatedId: updatedReview.value?._id,
                review: updatedReview.value
            });
        }

        const newReview = { 
            user: new ObjectId(user),
            movie: new ObjectId(movie),
            rating: Number(rating), 
            comment: comment || "", 
            createdAt: new Date() 
        };

        const result = await reviews.insertOne(newReview);

        res.json({
            success: true,
            insertedId: result.insertedId,
            review: newReview
        });
    } catch (error) {
        console.error("Error in POST /add-review:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /user movie rating/:movieId/:userId
router.get("/getUserMovieRating/:movieId/:userId", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const reviews = database.collection("Reviews");

        const movieId = req.params.movieId;
        const userId = req.params.userId;
        const review = await reviews.findOne({ user: new ObjectId(userId), movie: new ObjectId(movieId) });

        if (!review) {
            return res.json({ rating: -1 }); // No review found
        }

        res.json(review);
    } catch (error) {
        console.error("Error in GET /reviews/getUserMovieRating", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;