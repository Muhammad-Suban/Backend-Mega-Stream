import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// .use in middlewares and configuration
// all this are configuring used in  production level
app.use(cors({
    origin: process.env.CORS,
    crediantials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("Public"))
app.use(cookieParser())

// import routes
import userRouter from "./routes/user.routes.js"

// declare routes
app.use("/api/v1/users",userRouter)




export {app}