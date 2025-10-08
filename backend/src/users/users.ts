import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import express from "express";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


dotenv.config();

const router = express.Router();
const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri);
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

let db: any;

async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db("MovieReviewsApp");
        console.log("✅ Connected to MongoDB");
    }
    return db;
}

/**
 * POST /users/createUser
 * Signup
 */
router.post("/createUser", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const users = database.collection("Users");

        const {
            email,
            first_name,
            last_name,
            username,
            password,
            bio = "",
            profile_pic = "",
            phone = "",
            role = "user",
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            email,
            first_name,
            last_name,
            username,
            password: hashedPassword,
            bio,
            profile_pic,
            phone,
            role,
            active_status: true,
            favorite_movies: [],
            created_at: new Date(),
        };

        await users.insertOne(newUser);

        const token = jwt.sign({ email, username, role }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "User created successfully",
            user: { ...newUser, password: undefined },
            token,
        });
    } catch (error) {
        console.error("Error in POST /users/createUser:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /users/login
 * Verify credentials and return JWT
 */
router.post("/login", async (req: Request, res: Response) => {
    try {
        const database = await connectDB();
        const users = database.collection("Users");

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign(
            { email: user.email, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            user: { ...user, password: undefined },
            token,
        });
    } catch (error) {
        console.error("Error in POST /users/login:", error);
        res.status(500).json({ error: "Server error" });
    }
});

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