// 1st approch 
// to set all async fx
const asyncHandler = (reqHandlerFn) => {
  return (req, next, res) => {
    Promise.resolve(reqHandlerFn(req, res, next)).catch((error) => next(error));
  };
};


export {asyncHandler}

// 2nd approch at production level
// ** HOF **

/* const asyncHandler = (fn) => async (req, res, next) => {
  // fn funxtion as a parameter to asyncHandler called HOF

  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
*/
