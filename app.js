const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
require("./utils/auth");

const indexRouter = require("./routes");
const authRouter = require("./routes/authRouter");
const portfolioRouter = require("./routes/portfolioRouter");

const app = express();

main().catch((err) => console.log(err));

async function main() {
  const mongoDB = process.env.MONGODB_URI;
  if (process.env.NODE_ENV === "test") {
  } else {
    await mongoose.connect(mongoDB);
  }
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/api/auth/", authRouter);
app.use("/api/portfolio/", portfolioRouter);
app.use("/api", indexRouter);

module.exports = app;
