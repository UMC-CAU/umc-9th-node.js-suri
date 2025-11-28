import {prisma} from "../db.config";
import {memberEntityDB} from "../dtos/user.dtos";

// Payload used to insert a user into DB (subset of memberBodyToDTO)
export interface UserInsertPayload {
    email: string;
    name: string;
    nickname: string | null;
    gender: string;
    birthdate: Date;
    phoneNumber: string;
    password: string;
    status: string | boolean;
    point: number;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
}

export interface UserUpdatePayload {
    email?: string;
    name?: string;
    nickname?: string | null;
    gender?: string;
    birthdate?: Date;
    phoneNumber?: string;
    password?: string;
    status?: string | boolean;
    point?: number;
    updatedAt?: Date;
    lastLogin?: Date;
}

// Add new user; returns inserted ID or null if email already exists
export const addUser = async (
    data: UserInsertPayload,
): Promise<number | null> => {

    try {
        const user = await prisma.member.findFirst({
            where: {
                email: data.email
            }
        })
        if (user) {
            return null
        } else {
            const addnewUser = await prisma.member.create({
                data: {
                    email: data.email,
                    name: data.name,
                    nickname: data.nickname,
                    gender: data.gender,
                    birthdate: data.birthdate,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: String(data.status),
                    lastLogin: new Date(),
                    phoneNumber: data.phoneNumber,
                    password: data.password,
                    point: Number(data.point)
                }
            });
            return Number(addnewUser.id);
        }
    } catch (err) {
        throw new Error(
            `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`,
        );
    }
};

// Get single user by id
export const getUser = async (userId: number): Promise<memberEntityDB | null> => {

    try {
        const user = await prisma.member.findFirst({where: {id: userId}});
        if (!user) {
            return null
        }
        return mapMember(user);
    } catch (err) {
        throw new Error("The user does not exist. {" + err + "}");
    }

};

export const findUserByEmail = async (
    email: string,
): Promise<(memberEntityDB & { password: string }) | null> => {
    const user = await prisma.member.findFirst({
        where: {email},
    });

    if (!user) {
        return null;
    }

    const mapped = mapMember(user);
    return {...mapped, password: String(user.password)};
};

export const updateUserById = async (
    userId: number,
    updates: UserUpdatePayload,
): Promise<number> => {
    const updated = await prisma.member.update({
        where: {id: BigInt(userId)},
        data: {
            email: updates.email,
            name: updates.name,
            nickname: updates.nickname,
            gender: updates.gender,
            birthdate: updates.birthdate,
            updatedAt: updates.updatedAt,
            status: updates.status?.toString(),
            lastLogin: updates.lastLogin,
            phoneNumber: updates.phoneNumber,
            password: updates.password,
            point: updates.point,
        },
    });

    return Number(updated.id);
};

export const replaceUserPreferences = async (
    userId: number,
    preferences: string[],
): Promise<void> => {
    await prisma.foodCategory.deleteMany({where: {memberId: userId}});
    if (preferences.length === 0) return;

    await prisma.foodCategory.createMany({
        data: preferences.map((preferFood) => ({
            memberId: Number(userId),
            preferFood: String(preferFood),
        })),
    });
};

// Map preferred food category for a user; returns created id (manual incremental)
export const setPreference = async (
    userId: number,
    preferFood: string,
): Promise<number> => {
    try {
        const newPref = await prisma.foodCategory.create({
            data: {
                memberId: Number(userId),
                preferFood: String(preferFood),
            }
        });
        return Number(newPref.id);
    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }
};

// Get user preferences by user id
export interface PreferenceRow {
    id: number;
    member_id: number;
    prefer_food: string;
}

export const getUserPreferencesByUserId = async (
    userId: number,
): Promise<PreferenceRow[]> => {
    try {
        const prefs = await prisma.foodCategory.findMany({
            select: {id: true, memberId: true, preferFood: true},
            where: {memberId: userId}
        }) as Array<{ id: bigint; memberId: bigint; preferFood: string | null }>;
        return prefs.map((row) => ({
            id: Number(row.id),
            member_id: Number(row.memberId),
            prefer_food: String(row.preferFood),
        })) as PreferenceRow[];
    } catch (err) {
        throw new Error("Error getting preferences. {" + err + "}");
    }

};

const mapMember = (user: any): memberEntityDB => ({
    id: Number(user.id),
    email: String(user.email),
    name: String(user.name),
    nickname: user.nickname ? String(user.nickname) : null,
    gender: String(user.gender),
    birthdate: new Date(String(user.birthdate)),
    phone_number: String(user.phoneNumber),
    point: Number(user.point),
    status: Boolean(user.status),
    created_at: new Date(String(user.createdAt)),
    updated_at: new Date(String(user.updatedAt)),
    last_login: new Date(String(user.lastLogin)),
});
