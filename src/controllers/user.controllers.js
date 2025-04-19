import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const userRegister = asyncHandler(async (req, res) => {
  // Algorithm
  // get user data from frontend
  // check validation
  // check if usr already exists(using email and username oth)
  // check user add avatar and cover image (avatar is mandotary)
  // if user give both then store in cloudinary a/f validation
  // create user oject & finally store the data into db
  // then hold data in response variable & delete unneccasary like token,password
  // return res

  //   1* get data from front end
  const { userName, email, fullName, password } = req.body;
  console.log("user data from db", email, userName, fullName, password);

  if (
    [userName, fullName, email, password].some(
      (
        item //some method give true or false value
      ) => item?.trim() === ""
    )
  ) {
    throw new apiError(400, "All Field are Required");
  }

  // 3** check username and email
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (existedUser) {
    throw new apiError(409, "Email or User Name must be unique");
  }

  // 4** check avator or coverimg

  // req.body from node
  // req.files given by multer not express express
  const avatorLocalPath = req.files?.avator[0]?.path; // path get from localserver

  const coverImgLocalPath = req.files?.coverImage[0]?.path;

  if (!avatorLocalPath) {
    throw new apiError(400, "avatar is required");
  }

  //  5** upload avatoror coverimg on clodinary
  const avator = await uploadOnCloudinary(avatorLocalPath); //img taken time to upload so await is must
  const coverImage = await uploadOnCloudinary(coverImgLocalPath);

  if (!avator) {
    throw new apiError(400, "avatar is required");
  }

  console.log(req.files);
  console.log(req.body);

  // 5** enter the data into database
  const user = await User.create({
    fullName,
    email,
    password,
    userName: userName,
    avator: avator.url,
    coverImage: coverImage.url || "",
  });

  //6** remove password and token
  // every User create mongo db add automatically _id so we used to validate
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //select the fields & remove field by - sign both fields are remove

  if (!userCreated) {
    throw new apiError(500, "something wrong in User registration");
  }
  console.log("User Finally Registered", userCreated);

  //7** send response
  return res
    .status(200)
    .json(new apiResponse(200, userCreated, "User Created Successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  // get data from frontend
  // check validation & user register already
  // check password match
  // generate token access & refresh
  // send cookie & response

  const { userName, email, password } = req.body;
  console.log("user data from db", email, userName, password);

  // 2** check validation
  if (
    [userName, email, password].some((item) => {
      item?.trim() == "";
    })
  ) {
    throw new error(401, "All Fields are Required");
  }

  // 3** check user register already
  const myUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (!myUser) {
    throw new apiError(401, "userName & email not exist");
  }

  // 4** check password match
  const checkPassword = await myUser.passwordIsMatch(password);
  if (!checkPassword) {
    throw new apiError(401, "Invalid Credentails");
  }

  //5 ** genrate acces & refresh Token
  console.log(myUser._id);
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    myUser._id
  );

  const loggedInUser = await User.findById(myUser._id).select(
    "-password -refreshToken"
  );

  // only server can mofify in cookie cannot access frontend
  const options = {
    httpOnly: true,
    secure: true,
    // secure: process.env.NODE_ENV === 'production', // Automatically switch based on environment
    // secure: false,
    sameSite: 'None', // Ensure the cookie is sent in cross-origin requests
  };

  return (
    res
      .status(200)
      //.we can add multiple cookie by add .cookie
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(
          200,
          //check apiResponse file in (.data field we can throw this object)
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User Logged In Successfully"
        )
      )
  );
});

const userLogout = asyncHandler(async (req, res) => {
  // get token from middleware res.user
  // find user_id throw token & delete refresh Token
  // return
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    // {
    //   $unset: {
    //     refreshToken: 1  // unset empty the field if the flag is on!
    //   },
    // },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
    // secure: process.env.NODE_ENV === 'production', // Automatically switch based on environment
    // secure: false,
    sameSite: 'None', // Ensure the cookie is sent in cross-origin requests
  };

  return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(201, {}, "User Logged Out Successfully"));
});

// generate new access token from refresh token
// after expire we refresh the token user no need to signin again
const accessRefreshTokens = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookie?.refreshToken || req.body?.refreshToken;

  if (!incommingRefreshToken) {
    throw new apiError(401, "can't get token");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new apiError(401, "Invalid refresh token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(201)
      .cookie("accessToken", options, accessToken)
      .cookie("refreshToken", options, newRefreshToken)
      .json(
        new apiResponse(
          201,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "succesfully re-generate tokens "
        )
      );
  } catch (error) {
    throw new apiError(201, "Invalid refresh Token to re-generate", error);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // 1* get user from middleware
  // 2* get current password from frontend
  // 3* check current password match with db password
  // 4* change password with new password
  // 5* return updated user with new password

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(401, "User not found");
  }
  const matchPassword = await user.passwordIsMatch(currentPassword);
  if (!matchPassword) {
    throw new apiError(401, "Current password is not correct");
  }
  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(
      new apiResponse(201, { newPassword }, "passrord changed Successully")
    );
});

const currentUser = asyncHandler(async (req, res) => {
  // 1* get user from middleware
  // 2* return user data with token
  return res
    .status(201)
    .json(new apiResponse(201, "Current User Successfully",req.user, ));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { userName, fullName, email } = req.body;

  if (fullName == "") {
    throw new apiError(400, "fullname are required");
  }
  if (userName == "") {
    throw new apiError(400, "user name are required");
  }
  if (email == "") {
    throw new apiError(400, "email are required");
  }

  const userOP = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullName, userName, email },
    },
    {
      new: true,
    }
  ).select("-password ");

  return res
    .status(201)
    .json(new apiResponse(201, userOP, "Account Details updated Successfully"));
});

const updateUserAvator = asyncHandler(async (req, res) => {
  // 1* get user from middleware
  // 2* upload avator on cloudinary
  // 3* update user avator field with new url
  // 4* return updated user data with token

  const localAvatar = req.file?.path;
  if (!localAvatar) {
    throw new apiError(400, "Avatar is required");
  }
  const avator = await uploadOnCloudinary(localAvatar);
  if (!avator.url) {
    throw new apiError(201, "error while upolodingoncloudinary avator ");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avator: avator.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  // delete old image task H.@
  return res
    .status(201)
    .json(new apiResponse(201, user, "Avtor  updated Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // 1* get user from middleware
  // 2* upload avator on cloudinary
  // 3* update user avator field with new url
  // 4* return updated user data with token

  const localCoverImg = req.file?.path;
  if (!localCoverImg) {
    throw new apiError(400, "Avatar is required");
  }
  const coverImage = await uploadOnCloudinary(localCoverImg);
  if (!coverImage.url) {
    throw new apiError(201, "error while upolodingoncloudinary avator ");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(201)
    .json(new apiResponse(201, user, "CoverImge updated Successfully"));
});

// aggregation pipelines
const getChannelDetails = asyncHandler(async (req, res) => {
  // first we want userName also channelname (its unique)
  // we need to use aggregation pipeline
  //by $match we get channel userName --> no need to insert querry  FindbyID
  // 1* find  all channel & subscribers  ($lookup it make  docs) (subscriber & channel)
  // 2* match with user  id (local and foreign id )
  //  add field in user table  ($addField used Subscriber & channel)
  // 3* project only required fields (remove unneccasry)

  const { userName } = req.params;
  if (!userName) {
    throw new apiError(401, "User not found");
  }

  const channel = await User.aggregate([
    // {},{},{}  add multiplr pipelines
    {
      // it match req field in all fields  ( alternative of findByID
      $match: { userName: userName?.toLowerCase() },
    },
    {
      // put req filed and make docs (commemts not sure)
      $lookup: {
        from: "subscriptions", // table name in which find
        localField: "_id", // match the needed user id
        foreignField: "channel", // tells the required field (_id match in this )in table
        as: "subscribers", // retuen docs name
      },
    },
    {
      $lookup: {
        from: "subscriptions", // table name in which find
        localField: "_id", // match the needed user id
        foreignField: "subscriber", // tells the required field in table
        as: "subscribedTo", // retuen docs name
      },
    },
    {
      // add fields in user Table
      $addFields: {
        subscribersCount: {
          //size get total count in the docs using this we find Total Subscribe rof channeL
          $size: "$subscribers",
        },
        channelSubscriberToCount: {
          $size: "$subscribedTo",
        },
        // its tell wheater current user subscribed this channel return true or false
        isSubscribedOrNot: {
          $cond: {
            //cond have req three if(cond) then(if cond true) else(id cond false)
            //$in  check present value exist (both array & obj)
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // complex
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // it give neccassay field (1 means flag on) and remove uncessary field
      $project: {
        userName: 1,
        email: 1,
        fullName: 1,
        avator: 1,
        coverImage: 1,
        isSubscribedOrNot: 1,
        subscribersCount: 1,
        channelSubscriberToCount: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new apiError(401, "channel does not exist");
  }

  //assingment understand and read what channel return
  console.log(channel);

  return res
    .status(201)
    .json(new apiResponse(201, channel[0], "user Channel fetch Succesfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  // we used sub pipelines (apply nested agregation pipelines)
  // 1) 1P first pipeline $match user id
  // 2) 2P $lookup to gel all docs from (user to video model)
  // 2.1) 2.1P $lookup to get video owner (video to user model)
  // 2.1.1) 2.2.1P $project to get selectef fields from user

  // 2.2) 2.2P $add field to get 0 elem of watchhistory $first(value of array)
  // 3) return res user
  const user = await User.aggregate([
    {
      $match: {
        // _id:req.user._id,  -->not correct in aggregation pipeline data direct store mongo not hanfle in backstage
        _id: new mongoose.Types.ObjectId(req.user._id), //_id return in string so we convert in object
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        // 2 nested pipelines
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "ownerName",
              foreignField: "_id",
              as: "owner",
              //super 2.1 nested pipelines
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avator: 1,
                  },
                },
              ],
            },
          },
          //optional
          {
            $addFields: {
              owner: {
                $first: "$owner", // first give 0 vlaue of array
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user?.length) {
    throw new apiError(401, "error to get user watchHistory");
  }
  console.log("For Testing Phase");
  console.log(user[0].watchHistory);
  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        user[0].watchHistory,
        "watchHistory successfully fetched"
      )
    );
});

const getOwnerDetails = asyncHandler(async (req, res) => {
  const owner = req.query.owner;
  if (!owner) {
    throw new apiError(400, "owner is required");
  }
  const ownerDetails = await User.findOne({ _id: owner }).select(
    "-password -refreshToken"
  );
  if (!ownerDetails) {
    throw new apiError(401, "owner not found");
  }
  return res
    .status(201)
    .json(
      new apiResponse(201, "Owner details successfully fetched", ownerDetails)
    );
});

export {
  userRegister,
  userLogin,
  userLogout,
  accessRefreshTokens,
  changeCurrentPassword,
  currentUser,
  updateAccountDetails,
  updateUserAvator,
  updateUserCoverImage,
  getChannelDetails,
  getWatchHistory,
  getOwnerDetails,
};
