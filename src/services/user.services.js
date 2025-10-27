import { responseFromUser } from "../dtos/user.dtos.js";
import {
    addUser,
    getUser,
    getUserPreferencesByUserId,
    addStore,
    setPreference,
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