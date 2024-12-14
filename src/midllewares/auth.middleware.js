// custom Middleware to insert token in response

import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const JWTVerify = asyncHandler(async (req, res,next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Invalid token");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id) //check generate refresh token fx we deined _id
      .select("-password -refreshToken");

    if (!user) {
      throw new apiError(401, "Invalid token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new apiError(401, "Invalid access token");
  }
});
