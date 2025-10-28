import { Grade } from "@material-ui/icons";
import { responseFromUser } from "../dtos/user.dtos.js";
import {
    addUser,
    getUser,
    getUserPreferencesByUserId,
    addStore,
    setPreference,
    addReview,
    addMission
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
    // store_id 유효성 검사 추가
    if (!data.store_id) {
        throw new Error("store_id는 필수 항목입니다.");
    }

    const missionData = {
        title: data.title,
        description: data.description,
        point_reward: Number(data.point_reward),
        store_id: Number(data.store_id)  // 명시적 숫자 변환
    }

    console.log("미션 데이터 확인:", missionData); // 디버깅용

    const missionId = await addMission(missionData);

    if (missionId === null) {
        throw new Error("해당 가게가 존재하지 않습니다.");
    }
    return {
        id: missionId,
        ...missionData
    }
}