import { UserProfileInfo } from '@/types/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: UserProfileInfo = {
    userId: '',
    nickname: '',
    firstName: '',
    lastName: '',
    bio: '',
    avatarURL: '',
    skills: [],
    links: {},
};

const userSlice = createSlice({
    name: 'user',
    initialState: initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfileInfo>) => {
            state.userId = action.payload.userId;
            state.nickname = action.payload.nickname;
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.bio = action.payload.bio;
            state.avatarURL = action.payload.avatarURL;
            state.skills = action.payload.skills;
            state.links = action.payload.links;
        },
        clearUser: (state) => {
            state.userId = initialState.userId;
            state.nickname = initialState.nickname;
            state.firstName = initialState.firstName;
            state.lastName = initialState.lastName;
            state.bio = initialState.bio;
            state.avatarURL = initialState.avatarURL;
            state.skills = initialState.skills;
            state.links = initialState.links;
        },
    },
});
export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;