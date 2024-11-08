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

    getAll = async(req) => {
        try {
            // default query
            let query = {
                role: req.body.role,
                isDeleted: false
            };

            // search
            if (req.body.search) { 
                query.$or = [
                    {
                        name: { $regex: req.body.search, $options: "i" }
                    },
                    {
                        email: { $regex: req.body.search, $options: "i" }
                    }
                ]
            }
            // filter
            if(req.body.status){
                query['status'] = req.body.status;
            }

            // sorting
            let sortField = "name";
            let sortOrder = 1;
            if(req.body.sortField){
                sortField = req.body.sortField;
            }
            if(req.body.sortOrder && req.body.sortOrder == "desc" ){
                sortOrder = -1;
            }
            // aggregation
            return await UserModel.aggregate([
                {
                    $match: query
                },
                {
                    $sort: {
                        [sortField]: sortOrder
                    }
                }
            ])

            // pagination
        } catch (error) {
            throw error;
        }
    }

    getAllAgain = async(req)=>{
        try {
            //default query
            let query = {
                role: req.body.role,
                isDeleted: false
            }
            
            //search
            if(req.body.search){
                query.$or = [
                    {
                        name: { $regex: '^' + req.body.search, $options: "i" }
                    },
                    {
                        email: { $regex: '^' + req.body.search, $options: "i" }
                    }
                ]
            }
            
            //filter 
            if(req.body.status){
                query['status'] = req.body.status;
            }

            //default sort
            let sortField = 'name', sortOrder = 1;

            //sort
            if(req.body.sortField){
                sortField = req.body.sortField;
            }
            if(req.body.sortOrder && req.body.sortOrder == 'desc'){
                sortOrder = -1;
            }

            let aggregate = UserModel.aggregate([
                {
                    $match: query
                },
                {
                    $sort: {
                        [sortField]: sortOrder
                    }
                }
            ]);
            return await UserModel.aggregatePaginate(aggregate,{
                page: req.body.pageNum?req.body.pageNum:1,
                limit: 10
            });
        } catch (error) {
            throw error
        }
    }
}

module.exports = new UserRepo();