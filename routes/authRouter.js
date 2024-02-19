const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");

authRouter.post("/local/signup", authController.local_signup);

authRouter.post("/local/login", authController.local_login);

module.exports = authRouter;
