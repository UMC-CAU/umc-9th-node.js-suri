import crypto from "crypto";
import type {MemberUpdateDTO, memberBodyToDTO, memberEntityDB, UserResponseDTO,} from "../dtos/user.dtos";
import {responseFromUser} from "../dtos/user.dtos";

import {
    addUser,
    findUserByEmail,
    getUser,
    getUserPreferencesByUserId,
    PreferenceRow,
    replaceUserPreferences,
    setPreference,
    updateUserById,
} from "../repository/user.repository";
import {DuplicateEmailError, NoPreferenceError,} from "../error";
import {signToken} from "../utils/jwt";

// Simple password hashing (demo only). Consider bcrypt/argon2 for production.
export const hashPassword = (password: string): string => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

export const userSignUp = async (
    data: memberBodyToDTO,
): Promise<UserResponseDTO> => {
    const hashedPassword = hashPassword(data.password);

    const existingUser = await findUserByEmail(data.email);
    const prefs = Array.isArray((data as any).preferences)
        ? ((data as any).preferences as string[])
        : [];

    if (existingUser) {
        const updates = {
            name: data.name,
            nickname: data.nickname,
            gender: data.gender,
            birthdate: data.birthdate,
            phoneNumber: data.phoneNumber,
            password: hashedPassword,
            status: data.status,
            point: data.point,
            updatedAt: new Date(),
            lastLogin: new Date(),
        };

        await updateUserById(existingUser.id, updates);
        if (prefs.length > 0) {
            await replaceUserPreferences(existingUser.id, prefs);
        }

        const user = await getUser(existingUser.id);
        const preferences = await getUserPreferencesByUserId(existingUser.id);
        if (!user) {
            throw new Error("가입한 유저를 찾을 수 없습니다.");
        }
        return await responseFromUser({user, preferences});
    }

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

export const loginUser = async (
    email: string,
    password: string,
): Promise<{ token: string; user: UserResponseDTO }> => {
    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
        throw new DuplicateEmailError("이메일 또는 비밀번호가 올바르지 않습니다.", null);
    }

    const hashedPassword = hashPassword(password);
    if (existingUser.password !== hashedPassword) {
        throw new DuplicateEmailError("이메일 또는 비밀번호가 올바르지 않습니다.", null);
    }

    const preferences = await getUserPreferencesByUserId(existingUser.id);
    const user = await responseFromUser({user: existingUser, preferences});
    const token = signToken({id: existingUser.id, email: existingUser.email});

    return {token, user};
};

export const updateUserProfile = async (
    userId: number,
    data: MemberUpdateDTO,
): Promise<UserResponseDTO> => {
    const updates: any = {};

    if (data.name !== undefined) updates.name = data.name;
    if (data.nickname !== undefined) updates.nickname = data.nickname;
    if (data.gender !== undefined) updates.gender = data.gender;
    if (data.birthdate !== undefined) updates.birthdate = data.birthdate;
    if (data.phoneNumber !== undefined) updates.phoneNumber = data.phoneNumber;
    if (data.email !== undefined) updates.email = data.email;
    if (data.password !== undefined) updates.password = hashPassword(data.password);

    if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await updateUserById(userId, updates);
    }

    const prefs = Array.isArray((data as any).preferences)
        ? ((data as any).preferences as string[])
        : null;
    if (prefs) {
        await replaceUserPreferences(userId, prefs);
    }

    const user = await getUser(userId);
    const preferences = await getUserPreferencesByUserId(userId);

    if (!user) {
        throw new Error("가입한 유저를 찾을 수 없습니다.");
    }

    return await responseFromUser({user, preferences});
};
