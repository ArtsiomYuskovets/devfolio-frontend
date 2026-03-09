export type TokensResponse = {
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number
}

type Links = {
    [key: string]: string
}

export type UserInfo = {
    userId: string,
    email: string,
    password: string,
    loggetAt: number,
    createdAt: number,
}

export type UserProfileInfo = {
    userId: string,
    nickname: string,
    firstName: string,
    lastName: string,
    bio: string,
    avatarURL: string,
    skills: string[],
    links: Links,
}

