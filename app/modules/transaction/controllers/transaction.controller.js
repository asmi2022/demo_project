const { retrievePaymentIntentMethod } = require("../../../utils/stripe");
const transactionRepo = require("../repositories/transaction.repository");

class TransactionController{
    #repo = {
        transactionRepo
    }

    paymentResponse = async(req, res)=>{
        try {
            // console.log(req.query, "payment success");
            let payment_intent = await retrievePaymentIntentMethod(req.query.payment_intent);
            // console.log(payment_intent);
            if(payment_intent && payment_intent.status == "succeeded"){
                return res.render("transaction/views/success.ejs");
            }
            return res.render("transaction/views/failure.ejs");

        } catch (error) {
            console.error(error);
            
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }
}

module.exports = new TransactionController();