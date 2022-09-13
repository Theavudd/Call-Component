import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  permissions: {
    cameraPermissions: false,
    audioPermissions: false,
  },
};

const ChatSlice = createSlice({
  name: 'Chat',
  initialState,
  reducers: {
    editPermissions: (state: any, action) => {
      const {payload} = action;
      state.permission = payload;
    },
  },
});
export default ChatSlice.reducer;
