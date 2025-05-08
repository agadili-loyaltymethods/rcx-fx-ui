import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  isSideBarOpened?: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  isLoading: true,
  isSideBarOpened: true
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<{ token: string }>) => {
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        isLoading: false,
      };
    },
    setUnauthenticated: (state) => {
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        isLoading: false,
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
    setSideBar:(state, action: PayloadAction<{ isSideBarOpened: boolean }>)=>{
      // state.isSideBarOpened = action.payload;
      return {
        ...state,
        isSideBarOpened: action.payload.isSideBarOpened,
      };
    }
  },
});

export const { setAuthenticated, setUnauthenticated, setLoading, setSideBar } = authSlice.actions;

export default authSlice.reducer;
