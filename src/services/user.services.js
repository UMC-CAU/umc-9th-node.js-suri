import { Grade } from "@material-ui/icons";
import { responseFromUser } from "../dtos/user.dtos.js";
import {
    addUser,
    getUser,
    getUserPreferencesByUserId,
    addStore,
    setPreference,
    addReview,
    addMission,
    startMemberMission
} from "../repositories/user.repository.js";

export const userSignUp = async (data) => {
    const joinUserId = await addUser({
        email: data.email,
        name: data.name,
        nickname: data.nickname,
        gender: data.gender,
        birthdate: data.birthdate,
        phoneNumber: data.phoneNumber,
        password: data.password,
        status: 'ACTIVE',
        point: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
    });

    if (joinUserId === null) {
        throw new Error("이미 존재하는 이메일입니다.");
    }

    for (const preference of data.preferences) {
        await setPreference(joinUserId, preference);
    }

    const user = await getUser(joinUserId);
    const preferences = await getUserPreferencesByUserId(joinUserId);

    return responseFromUser({ user, preferences });
};

export const addInsertStore = async (data) => {
    // 데이터 형식 변환
    const storeData = {
        name: data.name,
        food_category_id: data.food_category_id,
        subscription: data.subscription,
        address: data.address,
        detail_address: data.detail_address
    };

    const storeId = await addStore(storeData);

    if (storeId === null) {
        throw new Error("가게 등록에 실패했습니다.");
    }

    return {
        id: storeId,
        ...storeData

    };
};

export const addMemReview = async (data) => {
    const reviewData = {
        member_id: data.member_id,
        store_id: data.store_id,
        grade: data.grade,
        description: data.description,
        created_at: new Date()  // 현재 시간 자동 추가
    }

    const reviewId = await addReview(reviewData);

    if (reviewId === null) {
        throw new Error("리뷰 등록에 실패했습니다.");
    }
    return {
        id: reviewId,
        ...reviewData
    }

}

export const insertMission = async (data) => {
    const missionData = {
        title: data.title,
        description: data.description,
        point_reward: data.point_reward,
        store_id: data.store_id
    }

    const missionId = await addMission(missionData);

    if (missionId === null) {
        throw new Error("리뷰 등록에 실패했습니다.");
    }
    return {
        id: missionId,
        ...missionData
    }

}

export const startMission = async (data) => {
    const memmissionData = {
        member_id: data.member_id,
        mission_id: data.mission_id,
        address: data.address,
        is_completed: data.is_completed,
        deadline: data.deadline,
        activated: data.activated
    }

    const memmissionId = await startMemberMission(memmissionData);

    if (memmissionId === null) {
        throw new Error("이미 도전중인 미션입니다!");
    }
    return {
        id: memmissionId,
        ...memmissionData
    }

}

//member_mission 형태로 바디를 요청하고 , 이 member_mission이 이미 존재하는지 확인 + activated = 1인지 확인 false 라면 null반환
// member_mission에 존재하지 않다면 , insert member_mission한다. member_id =1로. 