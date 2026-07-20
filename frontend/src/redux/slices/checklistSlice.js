import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchChecklists = createAsyncThunk('checklists/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/checklists', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch checklists');
  }
});

export const fetchTemplate = createAsyncThunk('checklists/fetchTemplate', async (type, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/checklists/template/${type}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch template');
  }
});

export const updateTemplate = createAsyncThunk(
  'checklists/updateTemplate',
  async ({ type, items }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/checklists/template/${type}`, { items });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update template');
    }
  }
);

export const startOffboarding = createAsyncThunk('checklists/startOffboarding', async (employeeId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/checklists/offboarding/${employeeId}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to start offboarding');
  }
});

export const toggleChecklistItem = createAsyncThunk(
  'checklists/toggleItem',
  async ({ checklistId, itemId }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/checklists/${checklistId}/items/${itemId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update item');
    }
  }
);

const checklistSlice = createSlice({
  name: 'checklists',
  initialState: {
    list: [],
    onboardingTemplate: [],
    offboardingTemplate: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChecklists.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChecklists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchChecklists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        if (action.payload.type === 'onboarding') state.onboardingTemplate = action.payload.items;
        else state.offboardingTemplate = action.payload.items;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        if (action.payload.type === 'onboarding') state.onboardingTemplate = action.payload.items;
        else state.offboardingTemplate = action.payload.items;
      })
      .addCase(startOffboarding.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(toggleChecklistItem.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default checklistSlice.reducer;
