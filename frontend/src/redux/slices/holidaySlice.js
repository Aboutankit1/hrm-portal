import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchHolidays = createAsyncThunk('holidays/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/holidays', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch holidays');
  }
});

export const createHoliday = createAsyncThunk('holidays/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/holidays', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add holiday');
  }
});

export const deleteHoliday = createAsyncThunk('holidays/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/holidays/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete holiday');
  }
});

const holidaySlice = createSlice({
  name: 'holidays',
  initialState: { list: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHolidays.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createHoliday.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.list.sort((a, b) => a.date.localeCompare(b.date));
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.list = state.list.filter((h) => h._id !== action.payload);
      });
  },
});

export default holidaySlice.reducer;
