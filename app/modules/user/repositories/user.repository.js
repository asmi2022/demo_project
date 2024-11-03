const { default: mongoose } = require("mongoose");
const CommonRepo = require("../../../utils/common.repository");
const UserModel = require("../models/user.schema");

class UserRepo extends CommonRepo{
    constructor(){
        super(UserModel)
    }

    userWithRole = async (id) => {
        try {
            return await UserModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id),
                        isDeleted: false,
                        status: "Active"
                    }
                },
                {
                    $lookup: {
                        from: "roles",
                        foreignField: "_id",
                        localField: "role",
                        as: "role",
                        pipeline: [
                            {
                                $match: {
                                    isDeleted: false,
                                    status: "Active"
                                }
                            },
                            {
                                $project: {
                                    display: 1,
                                    type: 1,
                                    role: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$role", preserveNullAndEmptyArrays: false
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }

    getAll = async(params)=>{
        try {
            return await UserModel.aggregate([
                {
                    $match: params
                }
            ])
        } catch (error) {
            throw error;
        }
    }

    getAll = async(req)=>{
        try {
            let query = { role: new mongoose.Types.ObjectId(req.body.abcd), isDeleted: false };
            let sortField = req.body.sortField||'name';
            let sortOperator = {
                $sort: { [sortField]: 1 } // $sort: { name: 1 }
            }
            if (req.body.status) {
                // query.status = req.body.status;
                query['status'] = req.body.status;
            }
            if (req.body.sortOrder && req.body.sortOrder=='desc') {
                sortOperator.$sort[sortField] = -1;
            }
            if (req.body.search) {
                query['$or'] = [
                    { email: { $regex: req.body.search, $options: 'i' } },
                    { name: { $regex: req.body.search, $options: 'i' } }
                ]
            }
            
            return await UserModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: {
                        name_temp: "$name",
                        name: { $toLower: "$name" }
                    }
                },
                sortOperator,
                {
                    $addFields: {
                        name: "$name_temp"
                    }
                },
                {
                    $project: {
                        name_temp: 0
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }

    getAll1 = async(params)=>{
        try {
            return await UserModel.aggregate([
                {
                    $match: params
                },
                {
                    $lookup: {
                        from: "roles",
                        foreignField: "_id",
                        localField: "role",
                        as: "role",
                        pipeline: [
                            {
                                $project: {
                                    isDeleted: 0,
                                    status: 0
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$role", preserveNullAndEmptyArrays: false
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }

    getAll2 = async(req)=>{
        try {
            let query = { role: req.body.role, isDeleted: false, status: "Active" };
            if(req.body.search){
                query['$or'] = [
                    {
                        email: { $regex: req.body.search, $options: "i" }
                    },
                    {
                        email: { $regex: req.body.search, $options: "i" }
                    }
                ]
            }
            return await UserModel.aggregate([
                {
                    $match: query
                },
                
                {
                    $lookup: {
                        from: "roles",
                        foreignField: "_id",
                        localField: "role",
                        as: "role",
                        pipeline: [
                            {
                                $project: {
                                    isDeleted: 0,
                                    status: 0
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$role", preserveNullAndEmptyArrays: false
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserRepo();