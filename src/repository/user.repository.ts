import {prisma} from "../db.config";
import type {
    memberEntityDB,
    MemberMissionCreateDTO,
    MissionCreateDTO,
    ReviewCreateDTO,
    StoreCreateDTO,
} from "../dtos/user.dtos";
import {createHash} from "crypto"

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

// Add new user; returns inserted ID or null if email already exists
export const addUser = async (
    data: UserInsertPayload,
): Promise<number | null> => {

    try {
        const user = await prisma.member.findFirst({where: {email: data.email}})
        if (user) {
            return null
        } else {
            const hashedPassword = createHash("sha256")
                .update(String(data.password))
                .digest("hex");
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
                    password: hashedPassword,
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
        return {
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
        };
    } catch (err) {
        throw new Error("The user does not exist. {" + err + "}");
    }

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
        });
        return prefs.map((row) => ({
            id: Number(row.id),
            member_id: Number(row.memberId),
            prefer_food: String(row.preferFood),
        })) as PreferenceRow[];
    } catch (err) {
        throw new Error("Error getting preferences. {" + err + "}");
    }

};

// Insert store; returns manual next id or null on invalid foreign keys
export const addStore = async (
    data: StoreCreateDTO,
): Promise<number | null> => {
    try {
        const newStore = await prisma.store.create({
            data: {
                name: String(data.name),
                foodCategoryId: Number(data.food_category_id),
                subscription: String(data.subscription),
                address: String(data.address),
                detailAddress: String(data.detail_address),
            }
        });
        return Number(newStore.id);

    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }
};

// Insert review; returns new id or null when store not exists
export interface ReviewInsertPayload extends ReviewCreateDTO {
    created_at: Date;
}

export const addReview = async (
    data: ReviewInsertPayload,
): Promise<number | null> => {
    try {

        const confirmReview = await prisma.store.findFirst({where: {id: data.store_id}});
        if (!confirmReview) {
            return null;
        }
        const newReview = await prisma.review.create({
            data:
                {
                    memberId: data.member_id,
                    storeId: data.store_id,
                    grade: String(data.grade),
                    description: data.description,
                    createdAt: new Date()
                }
        });
        return Number(newReview.id);

    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }
};

// Insert mission; returns new id or null when store not exists
export const addMission = async (
    data: MissionCreateDTO,
): Promise<number | null> => {
    try {
        const confirmMission = await prisma.store.findFirst({where: {id: data.store_id}});
        if (!confirmMission) {
            return null;
        }
        const newMission = await prisma.mission.create({
            data:
                {
                    title: data.title,
                    description: data.description,
                    pointReward: data.point_reward,
                    storeId: data.store_id
                }
        });
        return Number(newMission.id);
    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }

};

// Start/activate a member mission; returns id (new or existing) or null when already active
export const startMemberMission = async (
    data: Pick<
        MemberMissionCreateDTO,
        "member_id" | "mission_id" | "address" | "is_completed"
    >,
): Promise<number | null> => {
    try {
        const confirmMemberMission = await prisma.memberMission.findFirst({
            where: {
                memberId: data.member_id,
                missionId: data.mission_id,
                address: data.address
            }
        });
        if (confirmMemberMission && confirmMemberMission.activated === true) {
            return null;
        } else if (confirmMemberMission && confirmMemberMission.activated === false) {
            const existing = await prisma.memberMission.update({
                where: {
                    id_memberId_missionId: {
                        id: Number(confirmMemberMission.id),
                        memberId: Number(confirmMemberMission.memberId),
                        missionId: Number(confirmMemberMission.missionId),
                    }
                },
                data: {activated: true}
            });
            return Number(existing.id);
        } else {
            const newMemberMission = await prisma.memberMission.create({
                data:
                    {
                        memberId: data.member_id,
                        missionId: data.mission_id,
                        address: data.address,
                        isCompleted: data.is_completed,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                        activated: true
                    }
            });
            return Number(newMemberMission.id);
        }
    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }
};
