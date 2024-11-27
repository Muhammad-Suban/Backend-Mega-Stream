import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    userName: userName.toLowerCase(),
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

const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new apiError(500, "Something went wrong while generating referesh and access token")
  }
}


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
  console.log(myUser._id)
  const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(myUser._id)

  const loggedInUser = await User
    .findById(myUser._id)
    .select("-password -refreshToken");

  // only server can mofify in cookie cannot access frontend
  const options = {
    httpOnly: true,
    secure: true,
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

const userLogout = asyncHandler(async (req,res) => {
  // get token from middleware res.user
  // find user_id throw token & delete refresh Token
  // return  
 await User.findByIdAndUpdate( 
    req.user._id,
    {
        $set:{refreshToken:undefined}
    },
    {
      new: true,
    }


    )
   const options={
     httpOnly: true,
     secure: true,
   }

   return res
   .status(201)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json( 
    new apiResponse(
      201,
      {},
      "User Logged Out Successfully"
    )
  )
})

export { userRegister, userLogin ,userLogout};
