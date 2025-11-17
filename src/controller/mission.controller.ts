import type {NextFunction, Request, Response} from "express";
import {bodyToMemberMission, bodyToMission} from "../dtos/mission.dtos";
import {getOnMemMission, insertMission, setOnMissionCompelete, startMission} from "../service/mission.service";
import {getStoreMission} from "../service/store.service";


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

