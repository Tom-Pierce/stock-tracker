const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Verify token as middleware
const verifyToken = async (req, res, next) => {
  // if req has no refresh/access tokens
  if (!req.cookies.jwt && !req.cookies.refreshToken) {
    return res.status(401).json({
      message: "Authentication failed: Missing access token and refresh token",
    });
  }

  // if access token was sent
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    try {
      const accessDecoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: accessDecoded._id };
    } catch (error) {
      // return 401 error if token is invalid
      if (error.name !== "TokenExpiredError") {
        return res.status(401).json({
          message: "Authentication failed: Invalid token",
        });
      }

      // if access token expires between req being made and server verifying it,
      // it could be expired without the cookie being deleted
      // so we need to make this check so that the user will not have to relogin unnecessarily
      if (error.name === "TokenExpiredError" && req.cookies.refreshToken) {
        const refreshToken = req.cookies.refreshToken;
        try {
          const refreshDecoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );

          try {
            const user = await User.findById(
              refreshDecoded._id,
              "invalidatedRefreshTokens"
            ).exec();

            if (user.invalidatedRefreshTokens.includes(refreshToken)) {
              return res.status(401).json({
                message:
                  "Authentication failed: Refresh token as been invalidated",
              });
            }
          } catch (error) {
            return res
              .status(500)
              .json({ message: "Server error, please try again" });
          }
          // refresh token is valid, generate new access token
          const token = jwt.sign(
            { _id: refreshDecoded._id },
            process.env.JWT_SECRET,
            {
              expiresIn: 5,
            }
          );

          req.user = { id: refreshDecoded._id };
          res.cookie("jwt", token, {
            withCredentials: true,
            httpOnly: true,
            maxAge: process.env.ACCESS_TOKEN_MAX_AGE * 1000,
          });
        } catch (error) {
          return res.status(401).json({
            message: "Authentication failed: Invalid refresh token",
          });
        }
      }
    }
  }

  // if req has refresh token but access token cookie has been removed/expired
  if (req.cookies.refreshToken && !req.cookies.jwt) {
    const refreshToken = req.cookies.refreshToken;
    try {
      const refreshDecoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // refresh token is valid, generate new access token
      const token = jwt.sign(
        { _id: refreshDecoded._id },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_MAX_AGE,
        }
      );

      req.user = { id: refreshDecoded._id };
      res.cookie("jwt", token, {
        withCredentials: true,
        httpOnly: true,
        maxAge: process.env.ACCESS_TOKEN_MAX_AGE * 1000,
      });
    } catch (error) {
      return res.status(401).json({
        message: "Authentication failed: Invalid refresh token",
      });
    }
  }
  next();
};

module.exports = verifyToken;
