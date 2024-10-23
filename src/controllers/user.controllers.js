import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

// Algorithm 
// get user data from frontend
// check validation
// check if usr already exists(using email and username oth)
// check user add avatar and cover image (avatar is mandotary)
// if user give both then store in cloudinary a/f validation
// create user oject & finally store the data into db
// then hold data in response variable & delete unneccasary like token,password
// return res

const userRegister = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //   message: "Ok",
    // });

  //   1* get data from front end
  const { userName, email, fullName, password } = req.body
  console.log("user data from db", email, userName, fullName, password);

  // 2** validation

  // basic approch
  // if(userName=== ""){
  //     throw new apiError(400,"user name is required")
  // }

  //advance approch min line of code
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
  const userCreated = await  User.findById(user._id).select("-password -refreshToken"); //select the fields & remove field by - sign both fields are remove

  if (!userCreated) {
    throw new apiError(500, "something wrong in User registration");
  }
  console.log("User Finally Registered",userCreated)

  //7** send response
  return res
    .status(200)
    .json(new apiResponse(200, userCreated, "User Created Successfully"));
});

export { userRegister };
