import { Description } from "@material-ui/icons";

export const bodyToUser = (body) => {
    const birthdate = new Date(body.birthdate);

    return {
        email: body.email,
        name: body.name,
        nickname: body.nickname || null,
        gender: body.gender,
        birthdate,
        phoneNumber: body.phoneNumber,
        password: body.password,
        preferences: body.preferences,
        status: 'ACTIVE',
        point: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
    };
};

export const responseFromUser = async ({ user, preferences }) => {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        gender: user.gender,
        birthdate: user.birthdate,
        phoneNumber: user.phone_number,
        point: user.point,
        status: user.status,
        preferences: preferences
    }
}

export const bodyToStore = (body) => {
    return {
        name: body.name,
        food_category_id: body.food_category_id,
        subscription: body.subscription,
        address: body.address,
        detail_address: body.detail_address
    }
}

export const bodyToReview = (body) => {
    return {
        member_id: body.member_id,
        store_id: body.store_id,
        grade: body.grade,
        description: body.description
    }
}
