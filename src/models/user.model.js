import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, //* speeliing
      trim: true,
      index: true, // help to search this field in mongodb {Coution)}
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [emailValidator, "Please enter a valid email"],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avator: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Passsword is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// 1 pre hook from mongoose (middleware work b/f data store in db )
// 2 save  method from mongoose
// in clasic fx gave access this. while callback not
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// methods mongoose provide to create custom mehods
// own create method in previos used save is predefined method
userSchema.methods.passwordIsMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
  
};

// create jwt tokens
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
          _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
      );
};

export const User = mongoose.model("User", userSchema);
