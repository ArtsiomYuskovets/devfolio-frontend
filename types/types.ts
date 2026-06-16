export type TokensResponse = {
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number
}

type Links = {
    [key: string]: string
}

export type SkillCategory = "LANGUAGE" | "FRAMEWORK" | "TOOL" | "PLATFORM";

export type Skill = {
    id: string,
    name: string,
    category: string,
    confirmed: boolean,
}
type UserBase = {
    userId: string,
}

export type ProfileCareerEntryType = "work" | "education";

export type CareerEntryTypeApi = "WORK" | "EDUCATION";

export type CareerDateResponse = {
    month: number,
    year: number,
}

export type CareerEntryResponse = {
    id?: string,
    type: CareerEntryTypeApi,
    title: string,
    organization: string,
    description: string,
    startDate: CareerDateResponse,
    endDate?: CareerDateResponse | null,
}

export type CareerEntryApiPayload = {
    type: CareerEntryTypeApi,
    title: string,
    organization: string,
    description: string,
    startDate: CareerDateResponse,
    endDate?: CareerDateResponse,
}

export type CareerListApiPayload = {
    items: CareerEntryApiPayload[],
}

export type CareerListResponse = {
    items: CareerEntryResponse[],
}

export type ProfileCareerEntry = {
    id: string,
    type: ProfileCareerEntryType,
    title: string,
    organization: string,
    description: string,
    startDate: CareerDateResponse,
    endDate: CareerDateResponse | null,
}

export type ProfileCareerDate = CareerDateResponse;
export type ProfileCareerPayload = CareerListApiPayload;

export type UserInfo = UserBase & {
    email: string,
    password: string,
    loggetAt: number,
    createdAt: number,
}

export type UserType = "JOB_SEEKER" | "RECRUITER";

export type UserProfileInfo = UserBase & {
    nickname: string,
    firstName: string,
    lastName: string,
    bio: string,
    avatarURL: string,
    skills: string[],
    links: Links,
    userType: UserType,
    careerTimeline?: ProfileCareerEntry[],
}

export type UserProfileFeed = {
    userId: string,
    nickname: string,
    displayName: string,
    avatarURL: string,
    userType: UserType,
    bioSnippet: string,
    createdAt: number,
}

export type ProjectData = {
    projectId: string,
    createdAt: number,
    updatedAt: number,
    previewImageUrl?: string,
    userId?: string,
}

export type ProjectInfoFields = {
    name: string,
    description: string,
    shortDescription: string,
    githubUrl: string,
    projectPublic: boolean,
}

export type ProjectStats = {
    viewersCount: number,
    likesCount: number,
}

export type ProjectInfo = ProjectInfoFields & ProjectStats;

export type Project = ProjectData & ProjectInfo;

export type ProjectLikeStatus = {
    liked: boolean,
};

export type ProjectSkillAttachment = {
    skillId: string;
    verified: boolean;
};

export type DataForFillProfile = Omit<UserProfileInfo, "userId">;