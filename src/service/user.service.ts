import crypto from "crypto";
import type {memberBodyToDTO, memberEntityDB, UserResponseDTO,} from "../dtos/user.dtos";
import {responseFromUser} from "../dtos/user.dtos";

import {
    addUser,
    getUser,
    getUserPreferencesByUserId,
    PreferenceRow,
    setPreference,
} from "../repository/user.repository";
import {DuplicateEmailError, NoPreferenceError,} from "../error";

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
        throw new DuplicateEmailError("이미 존재하는 이메일.", data);
    }

    // preferences가 배열이라고 가정하고 순회
    // unknown 타입을 안전하게 처리하려면 런타임 체크를 추가합니다.
    const prefs = Array.isArray((data as any).preferences)
        ? ((data as any).preferences as string[])
        : [];
    if (prefs.length === 0) {
        throw new NoPreferenceError("선호도를 선택해야합니다!", data);
    }

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
