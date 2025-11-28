import {prisma} from "../db.config";
import {NoSetOnMissionCompeleteError} from "../error";

import {MemberMissionCreateDTO, MissionCreateDTO} from "../dtos/mission.dtos";

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
        }) as Array<{
            id: bigint;
            memberId: bigint;
            missionId: bigint;
            activated: boolean | null;
            isCompleted: boolean | null;
            createdAt: Date | null;
            deadline: Date | null;
            address: string | null;
        }>;
        if (!onMissions) {
            return 0;
        }
        const missions = await prisma.mission.findMany({
            where: {
                id: {in: onMissions.map((mission: { missionId: bigint }) => mission.missionId)}
            }
        }) as Array<{ id: bigint; title: string | null; description: string | null; pointReward: bigint | null; storeId: bigint | null }>;
        if (!missions) {
            return 1;
        }
        const stores = await prisma.store.findMany({
            where: {
                id: {
                    in: missions
                        .map((mission: { storeId: bigint | null }) => mission.storeId)
                        .filter((storeId): storeId is bigint => storeId !== null)
                }
            }
        }) as Array<{ id: bigint; name: string | null }>;
        if (!stores) {
            return 2;
        }
        const result = onMissions.map((onmission: { id: bigint; memberId: bigint; missionId: bigint; activated: boolean | null; isCompleted: boolean | null; createdAt: Date | null; deadline: Date | null; address: string | null }) => {
            const mission = missions.find((mission: { id: bigint }) => mission.id === onmission.missionId);
            const store = stores.find((store: { id: bigint; name: string | null }) => store.id === mission?.storeId);
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

