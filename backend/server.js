require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const taskRoutes = require("./routes/taskRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const officeLocationRoutes = require("./routes/officeLocationRoutes");
const checklistRoutes = require("./routes/checklistRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

/* ===========================
   Allowed Origins
=========================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://hrm-portal-1-kbge.onrender.com",
];

if (
  process.env.CLIENT_URL &&
  !allowedOrigins.includes(process.env.CLIENT_URL)
) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

/* ===========================
   Socket.IO
=========================== */

const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);
  });
});

/* ===========================
   Middleware
=========================== */

app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

/* ===========================
   Rate Limit
=========================== */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

/* ===========================
   Health Check
=========================== */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Staff Hub API is running",
    environment: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

/* ===========================
   Routes
=========================== */

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/office-locations", officeLocationRoutes);
app.use("/api/checklists", checklistRoutes);

/* ===========================
   Error Handling
=========================== */

app.use(notFound);
app.use(errorHandler);

/* ===========================
   Start Server
=========================== */

const PORT = process.env.PORT || 5010;

server.listen(PORT, () => {
  console.log(
    `🚀 Staff Hub API running on port ${PORT} [${process.env.NODE_ENV}]`
  );
});