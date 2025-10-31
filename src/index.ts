import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";

import {
    handleInsertMission,
    handleInsertReview,
    handleMissionStart,
    handleStoreInsert,
    handleUserSignUp,
} from "./controller/user.controller";

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT ?? 3000);

// Middlewares
app.use(cors()); // allow CORS
app.use(express.static("public")); // serve static files
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // parse urlencoded bodies

// Health/root endpoint
app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World!");
});

// Routes
app.post("/api/v1/users/signup", handleUserSignUp);
app.post("/api/v1/store/insert", handleStoreInsert);
app.post("/api/v1/users/reveiws", handleInsertReview);
app.post("/api/v1/missions/insert", handleInsertMission);
app.post("/api/v1/member_mission/start", handleMissionStart);

// Start server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
