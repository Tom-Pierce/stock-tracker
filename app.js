const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
require("./utils/auth");

const indexRouter = require("./routes");
const authRouter = require("./routes/authRouter");

const app = express();

main().catch((err) => console.log(err));

async function main() {
  const mongoDB =
    process.env.NODE_ENV === "test" ? undefined : process.env.MONGODB_URI;

  await mongoose.connect(mongoDB);
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/auth/", authRouter);
app.use("/api", indexRouter);

module.exports = app;
