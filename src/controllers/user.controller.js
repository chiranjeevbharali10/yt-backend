import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
//
//


const generateAccessAndRefreshTokens = async(userId){
      try{
          
          const user = await User.FindById(user)
          const access = user.generateAccessToken();
          const refreshToken = user.generateRefreshToken(); 
          
          user.refreshToken = refreshToken;
          await user.save({ValidateBeforeSave:false})
          return {accessToken , refreshToken}
  }catch(error){
    throw new ApiError(500 , "something went wrong while generating refresh and access tokens")
  }
}
const registerUser = asyncHandler(async (req, res) => {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    // Ensure req.body exists
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    // Extract fields - handle both string and array formats (multer sometimes returns arrays)
    const getFieldValue = (field) => {
        if (Array.isArray(field)) {
            return field[0];
        }
        return field;
    };

    const fullName = getFieldValue(req.body.fullName);
    const email = getFieldValue(req.body.email);
    const username = getFieldValue(req.body.username);
    const password = getFieldValue(req.body.password);

    // Validate that all fields exist and are non-empty strings
    if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
        throw new ApiError(400, "fullName is required");
    }
    if (!email || typeof email !== "string" || email.trim() === "") {
        throw new ApiError(400, "email is required");
    }
    if (!username || typeof username !== "string" || username.trim() === "") {
        throw new ApiError(400, "username is required");
    }
    if (!password || typeof password !== "string" || password.trim() === "") {
        throw new ApiError(400, "password is required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if (!avatar) {
        throw new ApiError(400, "avatar upload failed");
    }

    const user = await User.create({
        fullname: fullName.trim(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: email.trim().toLowerCase(),
        password: password.trim(),
        username: username.trim().toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "USER REGISTERED"));
});

const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    //username or emailfine the user
    //password chec
    //access and refresh token
    //send cookie

    const { email, username, password } = req.body;

    if (!username || !email) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(400, "User does not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "WRONG PASSWORD");


  

    }

    const {accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id)
      generateAccessAndRefreshTokens(user._id)


    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
      httpOnly:true, 
      secure:true  //if this is done only server can modify these cookies
      
    }

      return res.status(200).cookie("accessToken" , accessToken , options).cookie().json(
          new ApiResponse(200 , 
      {
        user : loggedInUser , accessToken , refreshToken
      } , "User logged In Sucessfully")
  )

    
});



const logoutUser = asyncHandler(async(req , res)=>{

    await User.findByIdAndUpdate(req.user._id , 
  {
    $set: {
        refreshToken:undefined
    }
  },{
      new:true
    }   
  )
  
    const options = {
      httpOnly:true, 
      secure:true  //if this is done only server can modify these cookies
      
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200,{},"User logged out"))
})
export { registerUser , loginUser , logoutUser}; 
