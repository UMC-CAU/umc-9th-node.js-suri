import {NoMissionFromStoreError, NoMissionInsertionError, NoMissionStartError,} from "../error";
import {MemberMissionCreateDTO, MissionCreateDTO} from "../dtos/mission.dtos";
import {
    addMission,
    getOnMissionRepos,
    setOnMissionCompeleteRepos,
    startMemberMission
} from "../repository/mission.repository";

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
    if (missionData.title === null || missionData.point_reward === null || missionData.store_id === null) {
        throw new NoMissionInsertionError("미션의 정보를 정확히 입력해주세요", data);
    }

    const missionId: number | null = await addMission(missionData);
    if (missionId === null) {
        throw new NoMissionInsertionError("미션 등록 실패", data);
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
    if (memmissionData.member_id === null || memmissionData.mission_id === null || memmissionData.address === null || memmissionData.is_completed === null || memmissionData.deadline === null || memmissionData.activated === null) {
        throw new NoMissionStartError("미션 시작 정보를 정확히 입력해주세요", data);
    }

    const memmissionId: number | null = await startMemberMission(memmissionData);
    if (memmissionId === null) {
        throw new NoMissionStartError("이미 시작된 미션입니다.", data);
    }

    return {
        id: memmissionId,
        ...memmissionData,
    };
};

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
}[] | number> => {
    try {
        const onMissions = await getOnMissionRepos(memberId, cursor);
        if (onMissions === 0) {
            throw new NoMissionFromStoreError("No On Mission found", memberId);
        } else if (onMissions === 1) {
            throw new NoMissionFromStoreError("No Mission found", memberId);
        } else if (onMissions === 2) {
            throw new NoMissionFromStoreError("No Stores found", memberId);
        } else if (onMissions === null) {
            throw new NoMissionFromStoreError("No Final On Mission found", memberId);
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

