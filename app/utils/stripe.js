const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.paymentMethod = async(exp_month, exp_year, number, cvc)=>{
    try {
        await stripe.paymentMethods.create({
            type: "card",
            card: {
                token: "tok_visa",
                // exp_month, 
                // exp_year, 
                // number, 
                // cvc
            }
          });
    } catch (error) {
        throw error;
    }
}

exports.createPaymentIntent = async(amount, currency, paymentMethodId, orderId)=>{
    try {
        await stripe.paymentIntents.create({
            amount: amount * 100,
            currency,
            confirm: true,
            payment_method: paymentMethodId,
            description: "Demo Order - " + orderId,
            return_url: `${process.env.SERVER_URL}/payment/response`
          });
    } catch (error) {
        throw error;
    }
}

exports.retrievePaymentIntentMethod = async(paymentIntentId)=>{
    try {
        return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
        throw error;
    }
}