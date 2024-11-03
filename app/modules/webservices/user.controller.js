const userRepo = require("../user/repositories/user.repository");
const roleRepo = require("../role/repositories/role.repository");
const validator = require("validator");
const helper = require("../../utils/helper.cjs");
const jwt = require("jsonwebtoken");
const {unlinkSync, existsSync} = require("fs");
const otpGenerator = require("otp-generator");
const mailer = require("../../utils/mailer");


class UserController {
    #repo = {
        userRepo,
        roleRepo
    }

    signUp = async(req,res)=>{
        try {
            if(req.files && req.files.length){
                req.body.profilePic = req.files[0].filename;
            }
            if(!req.body.name) return res.status(400).send({
                status: 400,
                data: null,
                message: "Please enter a name"
            });
            if(!req.body.email || !validator.isEmail(req.body.email)) return res.status(400).send({
                status: 400,
                data: null,
                message: "Please enter a valid email"
            });
            let role = await this.#repo.roleRepo.getByField({role: "User", isDeleted: false, status: "Active"});
            req.body.role = role._id;
            let user = await this.#repo.userRepo.getByField({ email: req.body.email, isDeleted: false, role: req.body.role });
            if(user) return res.status(400).send({
                status: 400,
                data: null,
                message: "Please proceed to sign in"
            });
            if(!req.body.password) return res.status(400).send({
                status: 400,
                data: null,
                message: "Please create a password"
            });
            req.body.password = await helper.generateHash(req.body.password);
            let store = await this.#repo.userRepo.save(req.body);
            if(store && store._id) return res.status(200).send({
                status: 200,
                data: store,
                message: "Signed up successfully"
            });
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    signIn = async(req,res)=>{
        try {
            let role = await this.#repo.roleRepo.getByField({role: "User", isDeleted: false, status: "Active"});
            if(!req.body.email || !validator.isEmail(req.body.email)) return res.status(400).send({
                status: 400,
                data: null,
                message: "Please enter a valid email"
            });
            let user = await this.#repo.userRepo.getByField({email: req.body.email, role: role._id, isDeleted: false, status: "Active"});
            if(!user) return res.status(400).send({
                status: 400,
                data: null,
                message: "User does not exist"
            });
            if(!req.body.password) return res.status(400).send({
                status: 400,
                data: null,
                message: "Please enter your password"
            });
            if(!(await helper.comparePassword(req.body.password, user.password))) return res.status(400).send({
                status: 400,
                data: null,
                message: "Incorrect password"
            });
            let token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
                expiresIn: "1h"
            });
            res.cookie("auth_token", token);
            return res.status(200).send({
                status: 200,
                data: user, 
                token,
                message: "Signed in successfully"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    details = async(req,res)=>{
        try {
            let user = await this.#repo.userRepo.getById(req.user._id);
            if(user.isDeleted){
                return res.status.send({
                    status: 400,
                    data: null,
                    message: "User not found"
                });
            }
            return res.status(200).send({
                status: 200,
                data: user,
                message: "Fetched successfully"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    update = async(req,res)=>{
        try {
            let user = await this.#repo.userRepo.getById(req.user._id);
            if(user.isDeleted){
                return res.status.send({
                    status: 400,
                    data: null,
                    message: "User not found"
                });
            }
            if(!req.body.email || !validator.isEmail(req.body.email)){
                return res.status.send({
                    status: 400,
                    data: null,
                    message: "Please enter a valid email"
                });
            }
            let duplicateUser = await this.#repo.userRepo.getByField({ email: req.body.email, _id: { $ne: user._id }, isDeleted: false });
            if(duplicateUser){
                return res.status.send({
                    status: 400,
                    data: null,
                    message: "This email can not be used"
                });
            }
            if(req.files && req.files.length){
                if(user.profilePic && existsSync("./public/uploads/user/" + user.profilePic)){
                    unlinkSync("./public/uploads/user/" + user.profilePic);
                }
                req.body.profilePic = req.files[0].filename;
            }
            let update = await this.#repo.userRepo.updateById(user._id, req.body);
            if(update && update._id){
                return res.status(200).send({
                    status: 200,
                    data: user,
                    message: "Fetched successfully"
                });
            }
            return res.status(400).send({
                status: 400,
                data: user,
                message: "Something went wrong"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    changePassword = async(req,res)=>{
        try {
            let user = await this.#repo.userRepo.getById(req.user._id);
            if(user.isDeleted){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            }
            if(!req.body.oldPassword){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter your current password"
                });
            }
            if(!(await helper.comparePassword(req.body.oldPassword, user.password))){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Incorrect password"
                });
            }
            if(!req.body.password){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter a new password"
                });
            }
            req.body.password = await helper.generateHash(req.body.password);
            let update = await this.#repo.userRepo.updateById(user._id, req.body);
            if(update && update._id){
                return res.status(200).send({
                    status: 200,
                    data: true,
                    message: "Changed password successfully"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    forgetPassword = async(req,res)=>{
        try {
            let role = await this.#repo.roleRepo.getByField({role: "User", isDeleted: false, status: "Active"});
            if(!req.body.email){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Something went wrong"
                });
            }
            let user = await this.#repo.userRepo.getByField({email: req.body.email, isDeleted: false, role: role._id});
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "No user find"
                });
            }
            req.body.otp = otpGenerator.generate(9, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
                digits: true
            });
            req.body.exp_otp = new Date(moment().add(5, "minutes").format());
            let update = await this.#repo.userRepo.updateById(user._id, req.body);
            if(update && update._id){
                await mailer.sendMail(update.email, "OTP to reset password", `
                    Hello ${update.name},<br>
                    The otp to reset your password is ${update.otp}, will be valid for next 5 minutes.<br>
                    Thank you.
                    `);
                return res.status(200).send({
                    status: 200,
                    data: update,
                    message: "Please check your email"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    otpVerification = async(req,res)=>{
        try {
            let user = await this.#repo.userRepo.getByField({email: req.body.email, isDeleted: false});
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            }
            if(!req.body.otp){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter otp"
                });
            }
            if(req.body.otp != user.otp){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Incorrect otp"
                });
            }
            if(moment().isAfter(user.exp_otp)){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Timed out"
                });
            }
            return res.status(200).send({
                status: 200,
                data: null,
                message: "OTP verified"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    /**
     * @method resetPassword
     * @description Reset user's password
     * @param {{ body: { email: string } }} req 
     * @param {*} res 
     * @returns 
     */
    resetPassword = async(req,res)=>{
        try {
            let user = await this.#repo.userRepo.getByField({email: req.body.email, isDeleted: false});
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            }
            if(!req.body.password){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter a new password"
                });
            }
            req.body.password = await helper.generateHash(req.body.password);
            let update = await this.#repo.userRepo.updateById(user._id, req.body);
            if(update && update._id){
                return res.status(200).send({
                    status: 200,
                    data: true,
                    message: "Changed password successfully"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    logOut = async(req,res)=>{
        try {
            req.session.destroy((error)=>{
                if(error){
                    throw error;
                }
            })
            res.clearCookie("auth_token");
            return res.status(200).send({
                status: 200,
                data: true,
                message: "Logged out successfully"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }
}

module.exports = new UserController();