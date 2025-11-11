import {prisma} from "../db.config";
import type {
    memberEntityDB,
    MemberMissionCreateDTO,
    MissionCreateDTO,
    ReviewCreateDTO,
    StoreCreateDTO,
} from "../dtos/user.dtos";
import {createHash} from "crypto"
import {NoSetOnMissionCompeleteError} from "../error";

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
        const user = await prisma.member.findFirst({
            where: {
                email: data.email
            }
        })
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
        throw new Error("Error starting member mission. {" + err + "}");
    }
};

export const getStoreReviews = async (storeId: number, cursor: number): Promise<{
    nickname: string | null;
    store_name: string;
    grade: string;
    description: string;
    created_at: Date | null;
}[] | null> => {
    try {
        console.log("--------------" + storeId, cursor);
        const store = await prisma.store.findFirst({
            where: {id: BigInt(storeId)}, select: {name: true}
        });
        if (!store) {
            return null;
        }
        const reviews = await prisma.review.findMany(
            {
                where: {storeId: storeId, id: {gt: cursor}},
                select: {
                    grade: true,
                    description: true,
                    createdAt: true,
                    memberId: true
                },
                orderBy: {id: "asc"},
                take: 5
            }
        )
        const nicknames = await prisma.member.findMany({
            where: {id: {in: reviews.map(review => review.memberId)}},
            select: {nickname: true, id: true}
        })

        const result = reviews.map(review => {
            const nicknameObj = nicknames.find(nick => nick.id === review.memberId);
            return {
                nickname: nicknameObj ? String(nicknameObj.nickname) : null,
                store_name: String(store.name),
                grade: String(review.grade),
                description: String(review.description),
                created_at: review.createdAt
            }
        })
        if (result.length === 0) {
            return [];
        } else {
            return result;
        }


    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

export const getMemberReviews = async (
    memberId: number,
    cursor: number,
): Promise<{
    nickname: string | null;
    store_name: string;
    grade: string;
    description: string;
    created_at: Date | null;
}[] | null> => {
    try {
        const member = await prisma.member.findFirst({
            where: {id: BigInt(memberId)}, select: {nickname: true}
        });
        if (!member) {
            return null;
        }
        const reviews = await prisma.review.findMany(
            {
                where: {memberId: BigInt(memberId), id: {gt: cursor}},
                select: {
                    grade: true,
                    description: true,
                    createdAt: true,
                    storeId: true
                },
                orderBy: {id: "asc"},
                take: 5
            }
        )
        const stores = await prisma.store.findMany({
            where: {id: {in: reviews.map(review => review.storeId)}},
            select: {name: true, id: true}
        })

        const result = reviews.map(review => {
            const storeObj = stores.find(store => store.id === review.storeId);
            return {
                nickname: member.nickname ? String(member.nickname) : null,
                store_name: storeObj ? String(storeObj.name) : "",
                grade: String(review.grade),
                description: String(review.description),
                created_at: review.createdAt
            }
        })
        if (result.length === 0) {
            return [];
        } else {
            return result;
        }

    } catch (err) {
        throw new Error("Error getting reviews. {" + err + "}");
    }
}

export const getMissionFromStore = async (
    storeId: number,
    cursor: number,
): Promise<{
    id: number;
    title: string;
    description: string;
    point_reward: number;
    store_name: string;
}[] | null> => {
    try {
        const store = await prisma.store.findFirst({where: {id: BigInt(storeId)}, select: {name: true}});
        if (!store) {
            return null;
        }
        const missions = await prisma.mission.findMany({
            where: {storeId: storeId, id: {gt: cursor}},
            select: {
                id: true,
                title: true,
                description: true,
                pointReward: true
            },
            orderBy: {id: "asc"},
            take: 5
        })
        const result = missions.map(mission => ({
            id: Number(mission.id),
            title: String(mission.title),
            description: String(mission.description),
            point_reward: Number(mission.pointReward),
            store_name: String(store.name)
        }))
        if (result.length === 0) {
            return [];
        }
        return result;

    } catch (err) {
        throw new Error("Error getting missions. {" + err + "}");
    }
}

export const getOnMissionRepos = async (
    memberId: number,
    cursor: number,
): Promise<{
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
}[] | number> => {
    try {
        const onMissions = await prisma.memberMission.findMany({
            where: {
                memberId: memberId,
                id: {gt: cursor},
                activated: true,
                isCompleted: false
            },
            orderBy: {id: "asc"},
            take: 5
        })
        if (!onMissions) {
            return 0;
        }
        const missions = await prisma.mission.findMany({
            where: {
                id: {in: onMissions.map(mission => mission.missionId)}
            }
        })
        if (!missions) {
            return 1;
        }
        const stores = await prisma.store.findMany({
            where: {
                id: {
                    in: missions
                        .map(missions => missions.storeId)
                        .filter((storeId): storeId is bigint => storeId !== null)
                }
            }
        })
        if (!stores) {
            return 2;
        }
        const result = onMissions.map(onmission => {
            const mission = missions.find(mission => mission.id === onmission.missionId);
            const store = stores.find(store => store.id === mission?.storeId);
            return {
                id: Number(onmission.id),
                member_id: Number(onmission.memberId),
                store_name: store ? String(store.name) : "",
                mission_title: mission ? String(mission.title) : "",
                mission_description: mission ? String(mission.description) : "",
                mission_point_reward: mission ? Number(mission.pointReward) : 0,
                activated: Boolean(onmission.activated),
                is_completed: Boolean(onmission.isCompleted),
                created_at: onmission.createdAt,
                deadline: onmission.deadline
            }

        })
        return result;
    } catch (err) {
        throw new Error("Error getting missions. {" + err + "}");
    }

}

export const setOnMissionCompeleteRepos = async (
    memberId: number,
    missionId: number,
    cursor: bigint,
): Promise<{
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
        const cursorFinal = await prisma.memberMission.findFirst({
            where: {id: {gt: cursor}, memberId: BigInt(memberId), missionId: BigInt(missionId)},
            select: {id: true, activated: true, isCompleted: true, updatedAt: true, deadline: true}
        })
        if (!cursorFinal) {
            throw new NoSetOnMissionCompeleteError("Cursor is not found.", memberId, missionId);
        }
        if (cursorFinal.activated === false) {
            throw new NoSetOnMissionCompeleteError("The mission is not activated.", memberId, missionId);
        }
        if (cursorFinal.isCompleted === true) {
            throw new NoSetOnMissionCompeleteError("The mission is already completed.", memberId, missionId);
        }
        if (cursorFinal.deadline && cursorFinal.deadline < new Date()) {
            throw new NoSetOnMissionCompeleteError("The mission is already expired.", memberId, missionId);
        }
        const result = await prisma.memberMission.update({
            where: {
                id_memberId_missionId: {
                    id: BigInt(cursorFinal.id),
                    memberId: BigInt(memberId),
                    missionId: BigInt(missionId),
                }
            },
            data: {
                isCompleted: true,
                updatedAt: new Date()
            },

        })
        return {
            id: Number(result.id),
            memberId: Number(result.memberId),
            missionId: Number(result.missionId),
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            address: String(result.address),
            isCompleted: Boolean(result.isCompleted),
            deadline: result.deadline,
            activated: Boolean(result.activated)
        }

    } catch (err) {
        throw new Error("Error setting preference. {" + err + "}");
    }
}