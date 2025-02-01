import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    VideoFile: {
      type: String, //cloudinary url
      required: true,
    },
    thumbnail:{
        type: String, 
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default:0,
    },
    duration:{
        type: Number,
        required: true,
    },
    isPublished:{
        type: Boolean,
        default: false,
    },
    ownerName:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
  },
  { timestamps: true }
);
// mongoose allow us to create own plugin  
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video',videoSchema)