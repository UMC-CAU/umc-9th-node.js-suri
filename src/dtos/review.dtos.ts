export interface ReviewCreateDTO {
    member_id: number;
    store_id: number;
    grade: string;
    description: string;
}

export const bodyToReview = (body: unknown, memberId: number): ReviewCreateDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    if (
        b.store_id === undefined ||
        b.grade === undefined ||
        b.description === undefined
    ) {
        throw new Error(
            "The following fields are missing: store_id, grade, description",
        );
    }
    return {
        member_id: Number(memberId),
        store_id: Number(b.store_id),
        grade: String(b.grade),
        description: String(b.description),
    };
};
