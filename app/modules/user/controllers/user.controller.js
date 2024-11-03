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
            let role = await this.#repo.RoleRepo.getByField({ role: "User", isDeleted: false, status: "Active" });
            // let query = { role: role._id, isDeleted: false, status: "Active" };
            // if(req.body.search){
            //     query.$or = [
            //         {
            //             email: { $regex: req.body.search, $options: "i" }
            //         },
            //         {
            //             name: { $regex: req.body.search, $options: "i" }
            //         }
            //     ]
            // }
            // let users = await this.#repo.UserRepo.getAll(query);
            req.body.abcd = role._id;
            let users = await this.#repo.UserRepo.getAll(req);
            return res.status(200).send({
                status: 200,
                data: users && users.length? users:[],
                message: users && users.length?"User listing fecthed successfully":"No user found"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    list1 =async(req,res)=>{
        try {
            let role = await this.#repo.RoleRepo.getByField({ role: "User", isDeleted: false, status: "Active" });
            let query = { role: role._id, isDeleted: false, status: "Active" };
            if(req.body.search){
                query.$or = [
                    {
                        email: { $regex: req.body.search, $options: "i" }
                    },
                    {
                        name: { $regex: req.body.search, $options: "i" }
                    }
                ]
            }
            let user = await this.#repo.UserRepo.getAll1(query);
            return res.status(200).send({
                status: 200,
                data: user,
                message: "User listing fetched successfully"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            })
        }
    }

    list2 = async(req,res)=>{
        try {
            let role = await this.#repo.RoleRepo.getByField({ role: "User", isDeleted: false, status: "Active" });
            req.body.role = role._id;
            let users = await this.#repo.UserRepo.getAll2(req);
            return res.status(200).send({
                status: 200,
                data: users && users.length?users:[],
                message: users && users.length?"Listing fetched successfully":"No user found"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            })
        }
    }
}

module.exports = new UserController();