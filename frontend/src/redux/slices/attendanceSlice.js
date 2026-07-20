import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Wraps the browser Geolocation API in a promise with a friendly timeout/error message.
const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Location access is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject('Location permission was denied. Please allow location access to swipe in.');
        } else {
          reject('Could not get your location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

export const swipeIn = createAsyncThunk('attendance/swipeIn', async (_, { rejectWithValue }) => {
  try {
    let location;
    try {
      location = await getCurrentLocation();
    } catch (geoError) {
      // Still attempt the swipe-in without location — backend decides whether
      // geofencing is enforced (it only requires location if an office is configured).
      location = undefined;
    }

    const { data } = await api.post('/attendance/swipe-in', {
      browser: navigator.userAgent,
      device: navigator.platform,
      location,
    });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Swipe in failed');
  }
});

export const swipeOut = createAsyncThunk('attendance/swipeOut', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/attendance/swipe-out', {});
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Swipe out failed');
  }
});

export const fetchTodayStatus = createAsyncThunk('attendance/today', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/attendance/today');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch today status');
  }
});

export const fetchAttendanceStats = createAsyncThunk('attendance/stats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/attendance/stats');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchAllAttendance = createAsyncThunk('attendance/all', async (date, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/attendance', { params: date ? { date } : {} });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch attendance');
  }
});

export const fetchMyCalendar = createAsyncThunk('attendance/calendar', async ({ month, year }, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/attendance/calendar', { params: { month, year } });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch calendar');
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    today: null,
    stats: null,
    all: [],
    calendar: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(swipeIn.fulfilled, (state, action) => {
        state.today = action.payload;
      })
      .addCase(swipeOut.fulfilled, (state, action) => {
        state.today = action.payload;
      })
      .addCase(fetchTodayStatus.fulfilled, (state, action) => {
        state.today = action.payload;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.all = action.payload;
      })
      .addCase(fetchMyCalendar.fulfilled, (state, action) => {
        state.calendar = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith('attendance/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export default attendanceSlice.reducer;
