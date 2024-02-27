const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const portfolioRouter = express.Router();
const positionController = require("../controllers/positionController");
const lotController = require("../controllers/lotController");

portfolioRouter.post(
  "/position/:ticker/lot",
  verifyToken,
  lotController.lot_post
);

portfolioRouter.delete(
  "/position/:ticker/lot/:lotId",
  verifyToken,
  lotController.lot_delete
);

portfolioRouter.get(
  "/position/:ticker",
  verifyToken,
  positionController.position_get
);

portfolioRouter.get("/position", verifyToken, positionController.positions_get);

portfolioRouter.post(
  "/position",
  verifyToken,
  positionController.position_post
);

module.exports = portfolioRouter;
