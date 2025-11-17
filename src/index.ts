import dotenv from "dotenv";
import express, {NextFunction, Request, Response} from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import {handleUserSignUp} from "./controller/user.controller";
import {handleStoreInsert} from "./controller/store.controller";
import {handleGetMemberReview, handleGetStoreReivew, handleInsertReview} from "./controller/review.controller";
import {
    handleGetOnMission,
    handleGetStoreMission,
    handleInsertMission,
    handleMissionStart,
    handleSetMissionCompelete
} from "./controller/mission.controller";


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
app.use(morgan('dev'));
app.use(cookieParser());


// Health/root endpoint
app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World!");
});
declare global {
    namespace Express {
        interface Response {
            success: (data: any) => Response;
            error: (options: { errorCode?: string; reason?: string; data?: any }) => Response;
        }
    }
}


app.use((req, res, next) => {
    res.success = (success: any) => {
        return res.json({resultType: "SUCCESS", error: null, result: success});
    };

    res.error = ({errorCode = "unknown", reason = null, data = null}) => {
        return res.json({
            resultType: "FAIL",
            error: {errorCode: errorCode, reason, data},
            success: null,
        });
    };
    next();
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

interface CustomError extends Error {
    status?: number;
    errorCode?: string;
    reason?: string | null;
    data?: any;
}

app.use((err: CustomError, req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) {
        return _next(err);
    }
    res.status(err.status || 500).error({
        errorCode: err.errorCode || "unknown",
        reason: err.reason || err.message || undefined,
        data: err.data || null,
    })
})


// Start server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
