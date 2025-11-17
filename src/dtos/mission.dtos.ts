export interface MissionCreateDTO {
    description: string;
    title: string;
    point_reward: number;
    store_id: number;
}

export const bodyToMission = (body: unknown): MissionCreateDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    if (
        b.title === undefined ||
        b.point_reward === undefined ||
        b.store_id === undefined
    ) {
        throw new Error(
            "The following fields are missing: title, point_reward, store_id",
        );
    }
    return {
        description: String(b.description),
        title: String(b.title),
        point_reward: Number(b.point_reward),
        store_id: Number(b.store_id),
    };
};

export interface MemberMissionCreateDTO {
    member_id: number;
    mission_id: number;
    address: string | null;
    is_completed: boolean;
    deadline: string | Date;
    activated: boolean;
    created_at: string | Date;
    updated_at: string | Date;
}

export const bodyToMemberMission = (body: unknown): MemberMissionCreateDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    if (b.member_id === undefined || b.mission_id === undefined) {
        throw new Error("The following fields are missing: member_id, mission_id");
    }
    return {
        member_id: Number(b.member_id),
        mission_id: Number(b.mission_id),
        address: String(b.address) ?? null,
        is_completed: b.is_completed ?? 0,
        deadline: b.deadline,
        activated: b.activated,
        created_at: b.created_at,
        updated_at: b.updated_at,
    };
};

