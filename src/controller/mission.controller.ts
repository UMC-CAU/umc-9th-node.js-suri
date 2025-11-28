import type {NextFunction, Request, Response} from "express";
import {bodyToMemberMission, bodyToMission} from "../dtos/mission.dtos";
import {getOnMemMission, insertMission, setOnMissionCompelete, startMission} from "../service/mission.service";
import {getStoreMission} from "../service/store.service";


export const handleInsertMission = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }
        console.log("Request Data : ", req.body);

        const missionData = bodyToMission(req.body);
        const result = await insertMission(missionData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleMissionStart = async (
    req: Request<{}, unknown, unknown>,
    res: Response,
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).error({errorCode: "AUTH001", reason: "로그인이 필요합니다."});
            return;
        }
        console.log("Request Data : ", req.body);

        const missionData = bodyToMemberMission(req.body, req.user.id);
        const result = await startMission(missionData);
        res.success(result);
    } catch (err: any) {
        console.error("에러:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
};

export const handleGetOnMission = async (
    req: Request<{ memberId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction): Promise<void> => {
    try {
        if (!req.user || req.user.id !== parseInt(req.params.memberId, 10)) {
            res.status(403).error({errorCode: "AUTH006", reason: "본인의 진행 중인 미션만 조회할 수 있습니다."});
            return;
        }
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const memberId = req.user.id;

        const onMissions = await getOnMemMission(memberId, cursor);
        res.success(onMissions);

    } catch (err: any) {
        console.error("Error:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleSetMissionCompelete = async (
    req: Request<{ memberId: string, missionId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    try {
        if (!req.user || req.user.id !== parseInt(req.params.memberId, 10)) {
            res.status(403).error({errorCode: "AUTH006", reason: "본인의 미션만 완료 처리할 수 있습니다."});
            return;
        }
        const memberId = req.user.id;
        const missionId = parseInt(req.params.missionId, 10);
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const cursorBigInt = BigInt(cursor);

        const completeMission = await setOnMissionCompelete(memberId, missionId, cursorBigInt);
        res.success(completeMission);

    } catch (err: any) {
        console.error("Error:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}

export const handleGetStoreMission = async (
    req: Request<{ storeId: string }, unknown, unknown>,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    try {
        const cursor = parseInt(req.query.cursor as string || "0", 10);
        const storeId = parseInt(req.params.storeId, 10);

        const missions = await getStoreMission(storeId, cursor);
        res.success(missions);

    } catch (err: any) {
        console.error("에러:", err);
        res.status(400).json({message: err?.message ?? "Bad Request"});
    }
}
