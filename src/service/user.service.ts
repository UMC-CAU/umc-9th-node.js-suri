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
    getMemberReviews,
    getMissionFromStore,
    getOnMissionRepos,
    getStoreReviews,
    getUser,
    getUserPreferencesByUserId,
    PreferenceRow,
    setOnMissionCompeleteRepos,
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


export const listStoreReview = async (
    storeId: number,
    cursor: number,
): Promise<{
    nickname: string | null;
    store_name: string;
    grade: string;
    description: string;
    created_at: Date | null;
}[]> => {
    try {
        const reviews = await getStoreReviews(storeId, cursor);
        if (!reviews) {
            throw new Error(" The Store is not found.")
        }
        return reviews;
    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }

}

export const listMemberReviews = async (
    memberId: number,
    cursor: number,
): Promise<{
    nickname: string | null;
    store_name: string;
    grade: string;
    description: string;
    created_at: Date | null;
}[]> => {
    try {
        const reviews = await getMemberReviews(memberId, cursor);
        if (!reviews) {
            throw new Error(" The Member is not found.")
        }
        return reviews;

    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

export const getStoreMission = async (storeId: number, cursor: number): Promise<{
    id: number;
    title: string;
    description: string;
    point_reward: number;
    store_name: string;
}[]> => {
    try {
        const missions = await getMissionFromStore(storeId, cursor);
        if (!missions) {
            throw new Error(" The Store is not found.")
        }
        return missions;

    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

export const getOnMemMission = async (memberId: number, cursor: number): Promise<{
    id: number;
    member_id: number;
    store_name: string;
    mission_title: string;
    mission_description: string;
    mission_point_reward: number;
    activated: boolean;
    is_completed: boolean;
    created_at: Date | null;
    deadline: Date | null;
}[]> => {
    try {
        const onMissions = await getOnMissionRepos(memberId, cursor);
        if (!onMissions) {
            throw new Error("The Member is not found.")
        }
        return onMissions;
    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

export const setOnMissionCompelete = async (memberId: number, missionId: number, cursor: bigint): Promise<{
    id: number;
    memberId: number;
    missionId: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    address: string;
    isCompleted: boolean;
    deadline: Date | null
    activated: boolean;
}> => {
    try {
        const completeMission = await setOnMissionCompeleteRepos(memberId, missionId, cursor);
        if (!completeMission) {
            throw new Error("The MemberMission is not found.")
        }
        return completeMission;

    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }

}