const CommonRepo = require("../../../utils/common.repository");
const productModel = require("../models/product.schema");

class ProductRepo extends CommonRepo{
    constructor(){
        super(productModel);
    }
}

module.exports = new ProductRepo();