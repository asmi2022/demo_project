// const mongoose = require("mongoose");
const CommonRepo = require("../../../utils/common.repository");
const productModel = require("../models/product.schema");

class ProductRepo extends CommonRepo{
    constructor(){
        super(productModel);
    }

    getAllProducts = async(req)=>{
        try {
            let query = {
                isDeleted: false
            }
            let aggregate = productModel.aggregate([
                
            ])
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ProductRepo();