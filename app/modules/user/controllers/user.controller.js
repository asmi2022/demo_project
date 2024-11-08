const UserRepo = require("../repositories/user.repository");
const helper = require("../../../utils/helper.js");
const RoleRepo = require("../../role/repositories/role.repository");
const otp_generator = require("otp-generator");
const moment = require("moment");
const mailer = require("../../../utils/mailer");
const JWT = require("jsonwebtoken");
const named_router = require("route-label")(require("express"));
const mongoose = require("mongoose");

class UserController {

    #repo = {UserRepo, RoleRepo};


    signIn = async(req,res)=>{
        try {
            
            let role = await this.#repo.RoleRepo.getByField({role: "Admin"});
            req.body.email = req.body.email.trim().toLowerCase();
            let user = await this.#repo.UserRepo.getByField({email: req.body.email, isDeleted: false, role: role._id});
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            };
            if(!(await helper.comparePassword(req.body.password, user.password))){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Incorrect password"
                });
            }
            let token = JWT.sign({id: user._id}, process.env.JWT_SECRET, {
                expiresIn: "1h"
            });

            req.session.token = token;
            
            return res.status(200).send({
                status: 200,
                signedin: true,
                message: "Signed in successfully"
            })
        } catch (error) {
            console.log(error, "error");
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }


    forgetPassword = async(req,res)=>{
        try {
            req.body.email = req.body.email.trim().toLowerCase();
            let role = await this.#repo.RoleRepo.getByField({ role: "Admin" });
            let user = await this.#repo.UserRepo.getByField({ email: req.body.email, isDeleted: false, role: role._id, status: "Active" });
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            };
            let otp = await otp_generator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false
            });
            let exp_otp = new Date(moment().add(5, "minutes").format());
            let update = await this.#repo.UserRepo.updateById(user._id, { otp, exp_otp });
            if(update && update._id){
                mailer.sendMail(
                    update.email, 
                    "OTP FOR RESET PASSWORD", //subject
                    `
                    <p>Hello ${update.name},</p><br>
                    <p>The otp to reset your password is ${otp}, will be valid for next 5 minutes.</p><br>
                    Thank you!
                    `
                )
                return res.status(200).send({
                    status: 200,
                    data: true,
                    message: "Please check your email"
                });
            };
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            });
        } catch (error) {
            console.error(error);
            
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

 

    otpVerification = async(req,res)=>{
        try {
            if(!req.body.id){
                return res.status(400).send({
                    status: 400,
                    message: "ID is required"
                });
            }
            let user = await this.#repo.UserRepo.getById(req.body.id);
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            };
            
            if((req.body.otp == user.otp) && (moment().isBefore(user.exp_otp))){
                return res.status(200).send({
                    status: 200,
                    data: true,
                    message: "Verified successfully"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Incorrect password or timed out"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }


    resetPassword = async(req,res)=>{
        try {
            let user = await this.#repo.UserRepo.getById(req.body.id);
            req.body.password = await helper.generateHash(req.body.password);
            let update = await this.#repo.UserRepo.updateById(user._id, { password: req.body.password });
            if(update && update._id){
                return res.status(200).send({
                    status: 200,
                    data: true,
                    message: "Password updated successfully"
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


    changePassword = async(req,res)=>{
        try {
            let user = await this.#repo.UserRepo.getById(req.body.id);
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            }
            if(!(await helper.comparePassword(req.body.oldPassword, user.password))){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Incorrect password"
                });
            }
            req.body.password = await helper.generateHash(req.body.password_updated);
            let update = await this.#repo.UserRepo.updateById(user._id, {password: req.body.password});
            
            if(update && update._id){
                return res.status(200).send({
                    status: 200,
                    data: true,
                    message: "Password updated successfully"
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
                return res.status(200).send({
                    status: 200,
                    logout: true,
                    message: "Logged out successfully"
                })
            });
        } catch (error) {
            console.error(error);
            
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    list = async(req,res)=>{
        try {
            let role = await this.#repo.RoleRepo.getByField({role: "User", isDeleted: false});
            req.body.role = role._id;
            let users = await this.#repo.UserRepo.getAll(req);
            // if(users && users.length){
            //     return res.status(200).send({
            //         status: 200,
            //         data: users,
            //         message: "Users fetched successfully"
            //     });
            // }
            // return res.status(200).send({
            //     status: 200,
            //     data: [],
            //     message: "No user found"
            // });
            if(users && users.docs && users.docs.length){
                return res.status(200).send({
                    status: 200,
                    data: users,
                    message: "Users fetched successfully"
                });
            }
            return res.status(200).send({
                status: 200,
                data: {},
                message: "No user found"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    addUser = async(req,res)=>{
        try {
            if(!req.body.email || !validator.isEmail(req.body.email)){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter an email"
                });
            }
            let role = await this.#repo.RoleRepo.getByField({ role: "User", isDeleted: false });
            req.body.email = req.body.email.trim().toLowerCase();
            let existUser = await this.#repo.UserRepo.getByField({ email: req.body.email, isDeleted: false, role: role._id });
            if(existUser){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User already exist"
                });
            }
            let addUser = await this.#repo.UserRepo.save(req.body);
            if(addUser && addUser._id){
                return res.status(200).send({
                    status: 200,
                    data: addUser,
                    message: "User has been added successfully"
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    updateUser = async(rew,res)=>{
        try {
            if(!req.body.id){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "ID is required"
                });
            }
            let user = await this.#repo.UserRepo.getById(req.body.id);
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            }
            if(!req.body.email){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter your email"
                });
            }
            let existUser = await this.#repo.UserRepo.getByField({ email: req.body.email, isDeleted: false, _id: { $ne: user._id } });
            if(!existUser){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This email cannot be used"
                });
            }
            if(!req.body.name){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter name"
                });
            }
            if(req.files && req.files.length){
                req.body.profilePic = req.files[0].filename;
            }
            let updateUser = await this.#repo.UserRepo.updateById(user._id, req.body);
            if(updateUser && updateUser._id){
                return res.status(200).send({
                    status: 200,
                    data: updateUser,
                    message: "User has been updated successfully"
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

    deleteUser = async(req,res)=>{
        try {
            let  user = await this.#repo.UserRepo.getById(req.params.id);
            if(!user){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "User does not exist"
                });
            }
            await this.#repo.UserRepo.deleteById(user._id);
            return res.status(200).send({
                status: 200,
                data: true,
                message: "User has been deleted successfully"
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