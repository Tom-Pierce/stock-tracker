const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verify token as middleware
const verifyToken = (req, res, next) => {
  // if req has no refresh/access tokens
  if (!req.cookies.jwt && !req.cookies.refreshToken) {
    return res.status(401).json({
      message: "Authentication failed: Missing access token and refresh token",
    });
  }

  // if access token was sent
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    jwt.verify(token, process.env.JWT_SECRET, (err, accessDecoded) => {
      if (err) {
        // return 401 error if token is invalid
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({
            message: "Authentication failed: Invalid token",
          });
        }

        // if access token expires between req being made and server verifying it,
        // it could be expired without the cookie being deleted
        // so we need to make this check so that the user will not have to relogin unnecessarily
        if (err.name === "TokenExpiredError" && req.cookies.refreshToken) {
          const refreshToken = req.cookies.refreshToken;
          jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, refreshDecoded) => {
              if (err) {
                return res.status(401).json({
                  message: "Authentication failed: Invalid refresh token",
                });
              }

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
            }
          );
        }
      }

      // if the refresh token is valid and an new access token has been generated, do not set user.id
      if (!err) {
        req.user = { id: accessDecoded._id };
      }
      next();
    });
  }

  // if req has refresh token but access token cookie has been removed/expired
  if (req.cookies.refreshToken && !req.cookies.jwt) {
    const refreshToken = req.cookies.refreshToken;
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(401).json({
            message: "Authentication failed: Invalid refresh token",
          });
        }

        // refresh token is valid, generate new access token
        const token = jwt.sign({ _id: decoded._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.ACCESS_TOKEN_MAX_AGE,
        });

        req.user = { id: decoded._id };
        res.cookie("jwt", token, {
          withCredentials: true,
          httpOnly: true,
          maxAge: process.env.ACCESS_TOKEN_MAX_AGE * 1000,
        });

        next();
      }
    );
  }
};

module.exports = verifyToken;
