const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");

authRouter.post("/local/signup", authController.local_signup);

module.exports = authRouter;
