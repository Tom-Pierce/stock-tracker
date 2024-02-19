const express = require("express");
const verifyToken = require("../utils/verifyToken");
const router = express.Router();

router.get("/protected", verifyToken, (req, res, next) => {
  res.json({ message: "this is a protected route", id: req.user.id });
});
module.exports = router;
