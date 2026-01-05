import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists
    // check for images , check for avatar
    // upload them to cloudinary , avatar
    // 1- multer check
    // 2 - cloudinary check
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body;
    console.log("email:", email);

    // if (fullName === "") {
    //    throw new ApiError(400, "fullName is requried");
    // }
    
    if([fullName , email , user , password].some(field)=> 
      field?.trim() === "")
    ){
    throw new ApiError(400 , "all field are requried");
  }
  

    //FindOne if user or password is already taken 
  //
  const existedUser  =  User.FindOne({
      $or : [{username} , {email}];
      
  })

  if(existedUser){
    throw ApiError(409 , "the username or password is taken") 
  }


  const avatarLocalPath =  req.files?.avatar[0]?.path
  const coverImageLocalPath = req.file?.coverImage[0]?.path

  if(!avatarLocalPath){
    throw new ApiError(400 , "avatar file is requried");

  }
});

export { registerUser };
