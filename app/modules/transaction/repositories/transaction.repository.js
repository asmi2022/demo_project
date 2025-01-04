const CommonRepo = require("../../../utils/common.repository");
const transactionModel = require("../models/transaction.schema");

class TransactionRepo extends CommonRepo{
    constructor(){
        super(transactionModel);
    }
}

module.exports = new TransactionRepo();