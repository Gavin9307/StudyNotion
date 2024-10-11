const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const PORT = process.env.PORT || 4000;

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentsRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
database();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

require("./config/cloudinary");

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/course", courseRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Server is running",
  });
});

app.listen(PORT, () => {
  console.log("App is running on PORT = " + PORT);
});