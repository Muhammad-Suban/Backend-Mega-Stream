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
app.use(express.json({limit:"12kb"}));                         // for json data parsing
app.use(cookieParser());                                       //for cookie parsing
app.use(express.urlencoded({limit:"12kb" ,extended: true }));  // for url encoded form data
app.use(express.static('public'))                              // for images and icons

export default app;