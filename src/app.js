import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// .use in middlewares and configuration
// all this are configuring used in  production level
// app.use(
//   cors({
//     origin: "http://localhost:5173", // ✅ Allow frontend
//     // origin: "https://backend-mega-stream-production.up.railway.app/", // ✅ Allow frontend
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
app.use(cors({
  origin: ["http://localhost:5173", "https://stream-on-one.vercel.app"],
  credentials: true
  
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("Public"));
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcare.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// declare routes
app.use("/api/v1/users", userRouter);

export { app };
