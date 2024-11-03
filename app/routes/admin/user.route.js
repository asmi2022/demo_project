const express = require("express");
const router = express.Router();
const route_label = require("route-label");
const userController = require("../../modules/user/controllers/user.controller");
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

namedRouter.post("user.signin", "/user/signin", userController.signIn);

namedRouter.post("user.forget_password", "/user/forgetpassword", userController.forgetPassword);
namedRouter.post("user.otp_verification", "/user/otpverification", userController.otpVerification);
namedRouter.post("user.reset_password", "/user/resetpassword", userController.resetPassword);
namedRouter.post("user.list", "/user/list", userController.list);

namedRouter.all("/user*", Auth.authenticate);

namedRouter.post("user.change_password", "/user/changepassword", userController.changePassword);
namedRouter.get("user.logout", "/user/logout", userController.logOut);

module.exports = router;