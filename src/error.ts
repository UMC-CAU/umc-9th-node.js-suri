import {
    memberBodyToDTO,
    type MemberMissionCreateDTO,
    type MissionCreateDTO,
    type ReviewCreateDTO,
    type StoreCreateDTO
} from "./dtos/user.dtos";

export class DuplicateEmailError extends Error {
    errorCode = "U001";
    reason: string;
    data: memberBodyToDTO | null;

    constructor(reason: any, data: memberBodyToDTO | null) {
        super(reason);
        this.reason = reason;
        this.data = data;
    }
}

export class NoPreferenceError extends Error {
    errorCode = "U002";
    reason: string;
    data: memberBodyToDTO | null;

    constructor(reason: string, data: memberBodyToDTO | null) {
        super();
        this.reason = reason;
        this.data = data;
    }
}

export class NoStoreInfromationError extends Error {
    errorCode = "S001";
    reason: string;
    data: StoreCreateDTO | null;

    constructor(reason: string, data: StoreCreateDTO | null) {
        super();
        this.reason = reason;
        this.data = data;
    }
}

export class NoStoreInsertionError extends Error {
    errorCode = "S002";
    reason: string;
    data: StoreCreateDTO | null;

    constructor(reason: string, data: StoreCreateDTO | null) {
        super();
        this.reason = reason;
        this.data = data;
    }
}

export class NoReviewInsertionError extends Error {
    errorCode = "R001";
    reason: string;
    data: ReviewCreateDTO | null;

    constructor(reason: string, data: ReviewCreateDTO | null) {
        super();
        this.reason = reason;
        this.data = data;
    }
}

export class NoMissionInsertionError extends Error {
    errorCode = "M001";
    reason: string;
    data: MissionCreateDTO | null;

    constructor(reason: string, data: MissionCreateDTO | null) {
        super();
        this.reason = reason;
        this.data = data;
    }
}

export class NoMissionStartError extends Error {
    errorCode = "MM001";
    reason: string;
    data: MemberMissionCreateDTO | null;

    constructor(reason: string, data: MemberMissionCreateDTO | null) {
        super();
        this.reason = reason;
        this.data = data;
    }
}

export class NoListStoreReviewError extends Error {
    errorCode = "LS001";
    reason: string;
    data: number

    constructor(reason: string, storeId: number) {
        super();
        this.reason = reason;
        this.data = storeId;
    }
}

export class NoListMemberReviewError extends Error {
    errorCode = "LM001";
    reason: string;
    data: number

    constructor(reason: string, memberId: number) {
        super();
        this.reason = reason;
        this.data = memberId;
    }
}

export class NoMissionFromStoreError extends Error {
    errorCode = "MS001";
    reason: string;
    data: number

    constructor(reason: string, storeId: number) {
        super();
        this.reason = reason;
        this.data = storeId;
    }
}

export class NoOnMissionFromMemberError extends Error {
    errorCode = "OM001";
    reason: string;
    data: number;

    constructor(reason: string, memberId: number) {
        super();
        this.reason = reason;
        this.data = memberId;
    }
}

export class NoSetOnMissionCompeleteError extends Error {
    errorCode = "SMC001";
    reason: string;
    data: { memberId: number; missionId: number };

    constructor(reason: string, memberId: number, missionId: number) {
        super();
        this.reason = reason;
        this.data = {memberId, missionId};
    }
}