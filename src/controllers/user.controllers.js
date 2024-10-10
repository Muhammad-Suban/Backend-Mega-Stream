import {asyncHandler} from "../utils/asyncHandler"

const userRegister = asyncHandler( async (req,res)=>{
    res.status(200).json({
        message:"Ok"
    })
})