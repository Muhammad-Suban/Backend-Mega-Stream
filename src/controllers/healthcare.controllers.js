import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const healthcare = asyncHandler(async (req, res) => {

    return res
    .status(200)
    .json(new apiResponse(200, "Server is ok and running", "Healthcheck successful"));    
})

export {
    healthcare
    }
    