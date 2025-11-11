import type {NextFunction, Request, Response} from "express";

import {bodyToMemberMission, bodyToMission, bodyToReview, bodyToStore, bodyToUser,} from "../dtos/user.dtos";
import {
    addInsertStore,
    addMemReview,
    getOnMemMission,
    getStoreMission,
    insertMission,
    listMemberReviews,
    listStoreReview,
    setOnMissionCompelete,
    startMission,
    userSignUp,
} from "../service/user.service";

export const handleUserSignUp = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body);

    const user = await userSignUp(bodyToUser(req.body));
    res.success(user);
};

export const handleStoreInsert = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<Response | void> => {
    try {
        console.log("요청 데이터:", req.body);

        const storeData = bodyToStore(req.body);
        const result = await addInsertStore(storeData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleInsertReview = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<Response | void> => {
    try {
        console.log("Request Data : ", req.body);

        const reviewData = bodyToReview(req.body);
        const result = await addMemReview(reviewData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleInsertMission = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<Response | void> => {
    try {
        console.log("Request Data : ", req.body);

        const missionData = bodyToMission(req.body);
        const result = await insertMission(missionData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleMissionStart = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<Response | void> => {
    try {
        console.log("Request Data : ", req.body);

        const missionData = bodyToMemberMission(req.body);
        const result = await startMission(missionData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleGetStoreReivew = async (
    req: Request<{ storeId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    try {
        const cursor = parseInt(req.query.cursor as string, 10);

        const storeID = parseInt(req.params.storeId, 10);


        const reviews = await listStoreReview(
            storeID, cursor
        );
        res.success(reviews);
    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleGetMemberReview = async (
    req: Request<{ memberId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    try {
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const memberId = parseInt(req.params.memberId, 10);

        const reviews = await listMemberReviews(
            memberId, cursor
        );
        res.success(reviews);


    } catch (err: any) {
        console.error("Error:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleGetStoreMission = async (
    req: Request<{ storeId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    try {
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const storeId = parseInt(req.params.storeId, 10);

        const missions = await getStoreMission(storeId, cursor);
        res.success(missions);

    } catch (err: any) {
        console.error("에러:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleGetOnMission = async (
    req: Request<{ memberId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction): Promise<Response | void> => {
    try {
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const memberId = parseInt(req.params.memberId, 10);

        const onMissions = await getOnMemMission(memberId, cursor);
        res.success(onMissions);

    } catch (err: any) {
        console.error("Error:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleSetMissionCompelete = async (
    req: Request<{ memberId: string, missionId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<Response | void> => {
    try {
        const memberId = parseInt(req.params.memberId, 10);
        const missionId = parseInt(req.params.missionId, 10);
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const cursorBigInt = BigInt(cursor);

        const completeMission = await setOnMissionCompelete(memberId, missionId, cursorBigInt);
        res.success(completeMission);

    } catch (err: any) {
        console.error("Error:", err);
        return res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}