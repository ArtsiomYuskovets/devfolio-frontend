export type TokensResponse = {
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number
}

type Links = {
    [key: string]: string
}

export type Skill = {
    id: string,
    name: string,
    category: string,
}
type UserBase = {
    userId: string,
}

export type ProfileCareerEntryType = "work" | "education";

export type ProfileCareerDate = {
    month: number,
    year: number,
}

export type ProfileCareerEntry = {
    id: string,
    type: ProfileCareerEntryType,
    title: string,
    organization: string,
    description: string,
    startDate: ProfileCareerDate,
    endDate: ProfileCareerDate | null,
}

export type ProfileCareerPayload = {
    items: ProfileCareerEntry[],
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
    careerTimeline?: ProfileCareerEntry[],
}

export type DataForFillProfile = Omit<UserProfileInfo, "userId">;