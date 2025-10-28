import { StatusCodes } from "http-status-codes";
import { bodyToUser } from "../dtos/user.dtos.js";
import { userSignUp } from "../services/user.services.js";

import { bodyToStore } from "../dtos/user.dtos.js";
import { addInsertStore } from "../services/user.services.js";

import { bodyToReview } from "../dtos/user.dtos.js";
import { addMemReview } from "../services/user.services.js";

import { bodyToMission } from "../dtos/user.dtos.js";
import { insertMission } from "../services/user.services.js";

import { bodyToMemberMission } from "../dtos/user.dtos.js";
import { startMission } from "../services/user.services.js";

export const handleUserSignUp = async (req, res, next) => {
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body); // 값이 잘 들어오나 확인하기 위한 테스트용

    const user = await userSignUp(bodyToUser(req.body));
    res.status(StatusCodes.OK).json({ result: user });
};

export const handleStoreInsert = async (req, res) => {
    try {
        console.log("요청 데이터:", req.body);

        const storeData = bodyToStore(req.body); // DTO 변환 추가
        const result = await addInsertStore(storeData);
        return res.status(200).json(result);
    } catch (err) {
        console.error("에러:", err);
        return res.status(400).json({
            message: err.message
        });
    }
};

export const handleInsertReview = async (req, res) => {
    try {
        console.log("Request Data : ", req.body);

        const reviewData = bodyToReview(req.body);
        const result = await addMemReview(reviewData);
        return res.status(200).json(result);
    } catch (err) {
        console.error("에러:", err);
        return res.status(400).json({
            message: err.message
        });
    }

}

export const handleInsertMission = async (req, res) => {
    try {
        console.log("Request Data : ", req.body);

        const missionData = bodyToMission(req.body);
        const result = await insertMission(missionData);
        return res.status(200).json(result);
    } catch (err) {
        console.error("에러:", err);
        return res.status(400).json({
            message: err.message
        });
    }
}

export const handleMissionStart = async (req, res) => {
    try {
        console.log("Request Data : ", req.body);

        const missionData = bodyToMemberMission(req.body);
        const result = await startMission(missionData);
        return res.status(200).json(result);

    } catch (err) {
        console.error("에러:", err);
        return res.status(400).json({
            message: err.message
        });
    }

}