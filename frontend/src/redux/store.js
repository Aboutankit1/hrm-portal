import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import departmentReducer from './slices/departmentSlice';
import attendanceReducer from './slices/attendanceSlice';
import taskReducer from './slices/taskSlice';
import leaveReducer from './slices/leaveSlice';
import holidayReducer from './slices/holidaySlice';
import correctionReducer from './slices/correctionSlice';
import officeLocationReducer from './slices/officeLocationSlice';
import checklistReducer from './slices/checklistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    departments: departmentReducer,
    attendance: attendanceReducer,
    tasks: taskReducer,
    leaves: leaveReducer,
    holidays: holidayReducer,
    corrections: correctionReducer,
    officeLocations: officeLocationReducer,
    checklists: checklistReducer,
  },
});
