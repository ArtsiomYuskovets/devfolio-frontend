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

export type ProjectData = {
    projectId: string,
    createdAt: number,
    updatedAt: number,
    previewImageUrl?: string,
    userId?: string,
}

export type ProjectInfo = {
    name: string,
    description: string,
    shortDescription: string,
    githubUrl: string,
    projectPublic: boolean,
}
export type Project = ProjectData & ProjectInfo;

export type ProjectSkillAttachment = {
    skillId: string;
    verified: boolean;
};

export type DataForFillProfile = Omit<UserProfileInfo, "userId">;