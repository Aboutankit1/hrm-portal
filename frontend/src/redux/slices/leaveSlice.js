import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchLeaves = createAsyncThunk('leaves/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/leaves', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch leaves');
  }
});

export const applyLeave = createAsyncThunk('leaves/apply', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/leaves', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to apply for leave');
  }
});

export const approveLeave = createAsyncThunk('leaves/approve', async ({ id, note }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/leaves/${id}/approve`, { note });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to approve leave');
  }
});

export const rejectLeave = createAsyncThunk('leaves/reject', async ({ id, note }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/leaves/${id}/reject`, { note });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reject leave');
  }
});

export const cancelLeave = createAsyncThunk('leaves/cancel', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/leaves/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel leave');
  }
});

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: { list: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        const idx = state.list.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(rejectLeave.fulfilled, (state, action) => {
        const idx = state.list.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(cancelLeave.fulfilled, (state, action) => {
        state.list = state.list.filter((l) => l._id !== action.payload);
      });
  },
});

export default leaveSlice.reducer;
