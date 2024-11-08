const mongoose = require("mongoose");
const CategoryModel = require("../models/category.schema");
const CommonRepo = require("../../../utils/common.repository");

class CategoryRepo extends CommonRepo{
    constructor(){
        super(CategoryModel);
    }

    getAllCategories = async(req)=>{
        try {
            //default
            let query = {
                parentCat: null,
                isDeleted: false
            }
            //filter
            if(req.body.status){
                query['status'] = req.body.status;
            }
            //search
            if(req.body.search){
                query.$or = [
                    {
                        title: { $regex: '^' + req.body.search, $options: "i" }
                    }
                ]
            }
            //default sort
            let sortField = 'createdAt';
            let sortOrder = 1;
            //sort
            if(req.body.sortField){
                sortField = req.body.sortField;
            }
            if(req.body.sortOrder && req.body.sortOrder == "desc"){
                sortOrder = -1;
            }
            let aggregate = CategoryModel.aggregate([
                {
                    $match: query
                },
                {
                    $sort: {
                        [sortField]: sortOrder
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }
}