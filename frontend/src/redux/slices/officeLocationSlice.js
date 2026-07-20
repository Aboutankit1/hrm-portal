import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOfficeLocations = createAsyncThunk('officeLocations/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/office-locations');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch office locations');
  }
});

export const createOfficeLocation = createAsyncThunk('officeLocations/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/office-locations', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add office location');
  }
});

export const updateOfficeLocation = createAsyncThunk(
  'officeLocations/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/office-locations/${id}`, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update office location');
    }
  }
);

export const deleteOfficeLocation = createAsyncThunk('officeLocations/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/office-locations/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete office location');
  }
});

const officeLocationSlice = createSlice({
  name: 'officeLocations',
  initialState: { list: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfficeLocations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOfficeLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchOfficeLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createOfficeLocation.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateOfficeLocation.fulfilled, (state, action) => {
        const idx = state.list.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteOfficeLocation.fulfilled, (state, action) => {
        state.list = state.list.filter((o) => o._id !== action.payload);
      });
  },
});

export default officeLocationSlice.reducer;
