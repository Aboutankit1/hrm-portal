import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDepartments = createAsyncThunk('departments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/departments');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch departments');
  }
});

export const createDepartment = createAsyncThunk('departments/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/departments', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create department');
  }
});

export const deleteDepartment = createAsyncThunk('departments/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/departments/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete department');
  }
});

const departmentSlice = createSlice({
  name: 'departments',
  initialState: { list: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d._id !== action.payload);
      });
  },
});

export default departmentSlice.reducer;
