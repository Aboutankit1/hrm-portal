require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  await Promise.all([Admin.deleteMany(), Employee.deleteMany(), Department.deleteMany()]);

  const admin = await Admin.create({
    name: 'Super Admin',
    email: 'admin@staffhub.com',
    password: 'Admin@123',
    role: 'super_admin',
    companyName: 'Staff Hub Inc.',
  });

  const engineering = await Department.create({ name: 'Engineering', description: 'Product engineering team' });
  const hr = await Department.create({ name: 'Human Resources', description: 'People operations' });
  const sales = await Department.create({ name: 'Sales', description: 'Sales & business development' });

  const employee = await Employee.create({
    name: 'John Doe',
    email: 'john@staffhub.com',
    password: 'Employee@123',
    mobile: '9876543210',
    gender: 'male',
    department: engineering._id,
    designation: 'Software Engineer',
    salary: 60000,
    shift: 'general',
  });

  console.log('Seed complete:');
  console.log(`Admin login:    email=${admin.email}  password=Admin@123`);
  console.log(`Employee login: email=${employee.email}  password=Employee@123`);
  console.log(`Departments: ${[engineering.name, hr.name, sales.name].join(', ')}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
