import crypto from "crypto";
import type {
    memberBodyToDTO,
    memberEntityDB,
    MemberMissionCreateDTO,
    MissionCreateDTO,
    ReviewCreateDTO,
    StoreCreateDTO,
    UserResponseDTO,
} from "../dtos/user.dtos";
import {responseFromUser} from "../dtos/user.dtos";

import {
    addMission,
    addReview,
    addStore,
    addUser,
    getUser,
    getUserPreferencesByUserId,
    PreferenceRow,
    setPreference,
    startMemberMission,
} from "../repository/user.repository";

// Simple password hashing (demo only). Consider bcrypt/argon2 for production.
const hashPassword = (password: string): string => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

export const userSignUp = async (
    data: memberBodyToDTO,
): Promise<UserResponseDTO> => {
    const hashedPassword = hashPassword(data.password);

    const joinUserId: number | null = await addUser({
        email: data.email,
        name: data.name,
        nickname: data.nickname,
        gender: data.gender,
        birthdate: data.birthdate,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        status: "ACTIVE",
        point: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    });

    if (joinUserId === null) {
        throw new Error("이미 존재하는 이메일입니다.");
    }

    // preferences가 배열이라고 가정하고 순회
    // unknown 타입을 안전하게 처리하려면 런타임 체크를 추가합니다.
    const prefs = Array.isArray((data as any).preferences)
        ? ((data as any).preferences as string[])
        : [];
    for (const preference of prefs) {
        await setPreference(joinUserId, preference);
    }

    const user: memberEntityDB | null = await getUser(joinUserId);
    if (user === null) {
        throw new Error("가입한 유저를 찾을 수 없습니다.");
    }
    const preferences: PreferenceRow[] =
        await getUserPreferencesByUserId(joinUserId);

    return await responseFromUser({user, preferences});
};

export const addInsertStore = async (
    data: StoreCreateDTO,
): Promise<{
    id: number;
    name: string;
    food_category_id: number;
    subscription: string;
    address: string;
    detail_address: string;
}> => {
    const storeData: StoreCreateDTO = {
        name: data.name,
        food_category_id: data.food_category_id,
        subscription: data.subscription,
        address: data.address,
        detail_address: data.detail_address,
    };

    const storeId: number | null = await addStore(storeData);
    if (storeId === null) {
        throw new Error("가게 등록에 실패했습니다.");
    }

    return {
        id: storeId,
        ...storeData,
    };
};

export const addMemReview = async (
    data: ReviewCreateDTO,
): Promise<{
    id: number;
    member_id: number;
    store_id: number;
    grade: string;
    description: string;
    created_at: Date;
}> => {
    const reviewData = {
        member_id: data.member_id,
        store_id: data.store_id,
        grade: String(data.grade),
        description: data.description,
        created_at: new Date(),
    };


    const reviewId: number | null = await addReview(reviewData);
    if (reviewId === null) {
        throw new Error("리뷰 등록에 실패했습니다.");
    }

    return {
        id: reviewId,
        ...reviewData,
    };
};

export const insertMission = async (
    data: MissionCreateDTO,
): Promise<{
    id: number;
    title: string;
    description: string;
    point_reward: number;
    store_id: number;
}> => {
    const missionData: MissionCreateDTO = {
        title: data.title,
        description: data.description,
        point_reward: data.point_reward,
        store_id: data.store_id,
    };

    const missionId: number | null = await addMission(missionData);
    if (missionId === null) {
        throw new Error("리뷰 등록에 실패했습니다.");
    }

    return {
        id: missionId,
        ...missionData,
    };
};

export const startMission = async (
    data: MemberMissionCreateDTO,
): Promise<{
    id: number;
    member_id: number;
    mission_id: number;
    address: string | null;
    is_completed: number | boolean;
    deadline: string | Date;
    activated: number | boolean;
}> => {
    const memmissionData = {
        member_id: data.member_id,
        mission_id: data.mission_id,
        address: data.address,
        is_completed: data.is_completed,
        deadline: data.deadline,
        activated: data.activated,
    };

    const memmissionId: number | null = await startMemberMission(memmissionData);
    if (memmissionId === null) {
        throw new Error("이미 도전중인 미션입니다!");
    }

    return {
        id: memmissionId,
        ...memmissionData,
    };
};
