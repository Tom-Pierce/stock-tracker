const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const portfolioRouter = express.Router();
const portfolioController = require("../controllers/portfolioController");

portfolioRouter.post(
  "/position",
  verifyToken,
  portfolioController.position_post
);

module.exports = portfolioRouter;
