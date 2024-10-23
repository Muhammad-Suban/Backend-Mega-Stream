import  dbConnection  from './db/index.js';
import dotenv from 'dotenv';
import {app} from './app.js';

dotenv.config({
  path: './.env'
})

const PORT = process.env.PORT || 8000;

dbConnection()
.then(()=>{

  app.on("errror", (error) => {
    console.log("ERRR: ", error);
    throw error
})

  app.listen(PORT,() =>{
    console.log(`app is running on port ${PORT}`)
  } )
})
.catch((error)=>{
  console.log("mongodb Connection failed:::: ", error)
})












// 2nd approch to connect database ----------- for practice
/*
import express  from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {DB_NAME} from './constants.js';


dotenv.config({
  path:"./.env"
})
const app = express();

(async () => {

  try {
     await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
    console.log(`MongoDB Connected || DB HOST || `);
    
    app.on("errror", (error) => {
      console.log("ERRR: ", error);
      throw error
  })
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}... `);
    })
  } catch (error) {
    console.error("ERROR: ", error)
    throw error
}
})() */




