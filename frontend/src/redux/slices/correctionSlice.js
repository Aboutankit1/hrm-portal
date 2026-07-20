import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCorrections = createAsyncThunk('corrections/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/attendance/corrections', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch correction requests');
  }
});

export const requestCorrection = createAsyncThunk('corrections/request', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/attendance/corrections', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit correction request');
  }
});

export const approveCorrection = createAsyncThunk('corrections/approve', async ({ id, note }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/attendance/corrections/${id}/approve`, { note });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to approve request');
  }
});

export const rejectCorrection = createAsyncThunk('corrections/reject', async ({ id, note }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/attendance/corrections/${id}/reject`, { note });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reject request');
  }
});

export const cancelCorrection = createAsyncThunk('corrections/cancel', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/attendance/corrections/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel request');
  }
});

const correctionSlice = createSlice({
  name: 'corrections',
  initialState: { list: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCorrections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCorrections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchCorrections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(requestCorrection.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(approveCorrection.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(rejectCorrection.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(cancelCorrection.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      });
  },
});

export default correctionSlice.reducer;
