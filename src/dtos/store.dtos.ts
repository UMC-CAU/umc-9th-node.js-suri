export interface StoreCreateDTO {
    name: string;
    food_category_id: number;
    subscription: string;
    address: string;
    detail_address: string;
}

export const bodyToStore = (body: unknown): StoreCreateDTO => {
    if (body === null || body === undefined || typeof body !== "object") {
        throw new Error("body is null or undefined or not an object");
    }
    const b = body as any;
    if (
        b.name === undefined ||
        b.food_category_id === undefined ||
        b.address === undefined ||
        b.detail_address === undefined
    ) {
        throw new Error(
            "name, food_category_id, address, detail_address is undefined",
        );
    } else {
        return {
            name: String(b.name),
            food_category_id: Number(b.food_category_id),
            subscription: String(b.subscription),
            address: String(b.address),
            detail_address: String(b.detail_address),
        };
    }
};

