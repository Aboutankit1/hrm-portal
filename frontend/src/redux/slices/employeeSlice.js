import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/employees', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
  }
});

export const createEmployee = createAsyncThunk('employees/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/employees', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create employee');
  }
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/employees/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update employee');
  }
});

export const deleteEmployee = createAsyncThunk('employees/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/employees/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete employee');
  }
});

export const toggleEmployeeStatus = createAsyncThunk(
  'employees/toggleStatus',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/employees/${id}/${action}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    list: [],
    total: 0,
    page: 1,
    pages: 1,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.list.findIndex((e) => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e._id !== action.payload);
        state.total -= 1;
      })
      .addCase(toggleEmployeeStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex((e) => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default employeeSlice.reducer;
