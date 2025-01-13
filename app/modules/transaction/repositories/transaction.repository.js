const CommonRepo = require("../../../utils/common.repository");
const TransactionModel = require("../models/transaction.schema");

class TransactionRepo extends CommonRepo{
    constructor(){
        super(TransactionModel);
    }


}

module.exports = new TransactionRepo();