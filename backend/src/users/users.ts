import { MongoClient } from "mongodb";
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

// GET /user/:email
router.get("/getUserByEmail/:email", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const users = database.collection("Users");

        const email = req.params.email;
        const user = await users.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error in GET /users/getUserByEmail/:email:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;