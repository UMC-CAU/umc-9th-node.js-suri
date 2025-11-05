import dotenv from "dotenv";
import express, {Request, Response} from "express";
import cors from "cors";

import {
    handleGetMemberReview,
    handleGetOnMission,
    handleGetStoreMission,
    handleGetStoreReivew,
    handleInsertMission,
    handleInsertReview,
    handleMissionStart,
    handleSetMissionCompelete,
    handleStoreInsert,
    handleUserSignUp,
} from "./controller/user.controller";

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT ?? 3000);
app.set('json replacer', (key: string, value: any) =>
    typeof value === 'bigint' ? value.toString() : value
);

// Middlewares
app.use(cors()); // allow CORS
app.use(express.static("public")); // serve static files
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({extended: false})); // parse urlencoded bodies

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
app.get("/api/v1/store/:storeId/review/", handleGetStoreReivew);
app.get("/api/v1/member/:memberId/review/", handleGetMemberReview);
app.get("/api/v1/store/:storeId/mission/", handleGetStoreMission);
app.get("/api/v1/member/:memberId/member_mission/", handleGetOnMission);
app.patch("/api/v1/member/:memberId/mission/:missionId/setcompelete", handleSetMissionCompelete);


// Start server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
