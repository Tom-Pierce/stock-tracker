const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

authRouter.post("/local/signup", authController.local_signup);

authRouter.post("/local/login", authController.local_login);

authRouter.post("/local/logout", verifyToken, authController.local_logout);

authRouter.post("/refreshToken", authController.refreshToken);

module.exports = authRouter;
