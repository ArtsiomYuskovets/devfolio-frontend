export type TokensResponse = {
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number
}

type Links = {
    [key: string]: string
}

type UserBase = {
    userId: string,
}

export type UserInfo = UserBase & {
    email: string,
    password: string,
    loggetAt: number,
    createdAt: number,
}

export type UserProfileInfo = UserBase & {
    nickname: string,
    firstName: string,
    lastName: string,
    bio: string,
    avatarURL: string,
    skills: string[],
    links: Links,
}

export type DataForFillProfile = Omit<UserProfileInfo, "userId">;