const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async(amount, paymentMethod, orderId)=>{
    try {
        return await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "USD",
            confirm: true,
            // confirmation_method: "automatic",
            payment_method: paymentMethod,
            description: "dEmO_prOjEct_" + orderId,
            return_url: "https://d0b4-113-21-70-236.ngrok-free.app/payment/response" 
            // return_url: "http://localhost:222"
        });
    } catch (error) {
        throw error;
    }
}

exports.createCardPaymentMethod = async(exp_month, exp_year, cvc, number, customerName )=>{
    try {
        return await stripe.paymentMethods.create({
            type: "card",
            card: {
                // exp_month,
                // exp_year,
                // cvc,
                // number,
                // token: "tok_visa",
                token: "tok_threeDSecure2Required"
            },
            billing_details: {
                name: customerName
            }
        })
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