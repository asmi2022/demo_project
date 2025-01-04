const CommonRepo = require("../../../utils/common.repository");
const orderModel =require("../models/order.schema");

class OrderRepo extends CommonRepo{
    constructor(){
        super(orderModel);
    }

}

module.exports = new OrderRepo();