import crypto from "crypto";
import type {
    memberBodyToDTO,
    memberEntityDB,
    UpdateUserDTO,
    UserResponseDTO,
} from "../dtos/user.dtos";
import {responseFromUser} from "../dtos/user.dtos";

import {
    addUser,
    getUser,
    getUserByEmail,
    getUserPreferencesByUserId,
    PreferenceRow,
    removePreferencesByUserId,
    setPreference,
    updateUserById,
    UserWithPassword,
} from "../repository/user.repository";
import {DuplicateEmailError, NoPreferenceError,} from "../error";
import {signJwt} from "../utils/simpleJwt";

// Simple password hashing (demo only). Consider bcrypt/argon2 for production.
const hashPassword = (password: string): string => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

const normalizeUser = async (userId: number, preferences?: PreferenceRow[] | null): Promise<UserResponseDTO> => {
    const user: memberEntityDB | null = await getUser(userId);
    if (user === null) {
        throw new Error("가입한 유저를 찾을 수 없습니다.");
    }
    const finalPreferences = preferences ?? await getUserPreferencesByUserId(userId);
    return await responseFromUser({user, preferences: finalPreferences});
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
        status: data.status ?? "ACTIVE",
        point: data.point ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    });

    if (joinUserId === null) {
        throw new DuplicateEmailError("이미 존재하는 이메일.", data);
    }

    const prefs = Array.isArray((data as any).preferences)
        ? ((data as any).preferences as string[])
        : [];
    if (prefs.length === 0) {
        throw new NoPreferenceError("선호도를 선택해야합니다!", data);
    }

    for (const preference of prefs) {
        await setPreference(joinUserId, preference);
    }

    return normalizeUser(joinUserId);
};

const passwordsMatch = (incoming: string, stored: string): boolean => {
    const hashed = hashPassword(incoming);
    const doubleHashed = hashPassword(hashed);
    return stored === hashed || stored === doubleHashed;
};

export const authenticateUser = async (
    email: string,
    password: string,
): Promise<{ token: string; user: UserResponseDTO }> => {
    const user: UserWithPassword | null = await getUserByEmail(email);
    if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
    }

    if (!passwordsMatch(password, user.password)) {
        throw new Error("비밀번호가 올바르지 않습니다.");
    }

    const preferences = await getUserPreferencesByUserId(user.id);
    const safeUser = await responseFromUser({user, preferences});
    const token = signJwt({sub: safeUser.id, email: safeUser.email});

    return {token, user: safeUser};
};

export const updateUserProfile = async (
    userId: number,
    data: UpdateUserDTO,
    preferences?: string[] | null,
): Promise<UserResponseDTO> => {
    const updated = await updateUserById(userId, data);
    if (!updated) {
        throw new Error("사용자 정보를 업데이트할 수 없습니다.");
    }

    if (Array.isArray(preferences)) {
        await removePreferencesByUserId(userId);
        for (const preference of preferences) {
            await setPreference(userId, preference);
        }
    }
    const preferenceRows = await getUserPreferencesByUserId(userId);
    return responseFromUser({user: updated, preferences: preferenceRows});
};
