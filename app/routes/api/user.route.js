const express = require("express");
const router = express.Router();
const route_label = require("route-label");
const userController = require("../../modules/webservices/user.controller");
const namedRouter = route_label(router);
const Auth = require("../../middleware/auth");
const multer = require("multer");
// const fs = require("fs");
const {mkdirSync, existsSync} = require("fs");         //destructuring
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        if(existsSync("./public/uploads")){
            mkdirSync("./public/uploads");
        }
        if(existsSync("./public/uploads/user")){
            mkdirSync("./public/uploads/user");
        }
        cb(null, "./public/uploads/user");
    },

    filename: (req, file, cb)=>{
        cb(null, Date.now() + "_" + file.originalname.replace(/\s/g, "_"));
    }
});

const uploads = multer({
    storage
});


namedRouter.post("api.user.signup", "/user/signup", uploads.any(), userController.signUp);
namedRouter.post("api.user.signin", "/user/signin", userController.signIn);

namedRouter.post("api.user.forget_password", "/user/forgetpassword", userController.forgetPassword);
namedRouter.post("api.user.otp_verification", "/user/otpverification", userController.otpVerification);
namedRouter.post("api.user.reset_password", "/user/resetpassword", userController.resetPassword);

namedRouter.all("/user*", Auth.authenticate);

namedRouter.get("api.user.details", "/user/details", userController.details);
namedRouter.post("api.user.update", "/user/update", uploads.any(), userController.update);
namedRouter.post("api.user.change_password", "/user/changepassword", userController.changePassword);

module.exports = router;