const orderRepo = require("../order/repositories/order.repository");
const cartRepo = require("../cart/repositories/cart.repository");
const transactionRepo = require("../transaction/repositories/transaction.repository");
const mongoose = require("mongoose");
const otp_generator = require("otp-generator");
const stripe = require("../../utils/stripe");

class OrderController{
    #repo = {
        orderRepo,
        cartRepo,
        transactionRepo
    }

    placeOrder = async(req, res)=>{
        try {

            let cart = await this.#repo.cartRepo.cartDetails(req.user._id);
            if(cart && cart.length){
                let obj = {
                    userId: req.user._id,
                    
                }
                let orderId = "tRiAlApP_" + otp_generator.generate(13, {
                    digits: true,
                    lowerCaseAlphabets: true,
                    upperCaseAlphabets: true,
                    specialChars: false
                });
                while(await this.#repo.orderRepo.getByField({orderId})){
                    orderId = "dEmO_prOjEct" + otp_generator.generate(13, {
                        digits: true,
                        lowerCaseAlphabets: true,
                        upperCaseAlphabets: true,
                        specialChars: false
                    });
                }
                obj.orderId = orderId;
                obj.totalAmount = cart[0].subTotal;

                let items = [];
                for(let product of cart[0].products){
                    items.push({
                        name: product.product.title,
                        itemId: product.product._id,
                        price: product.product.price,
                        quantity: product.quantity,
                        total: product.total
                    });
                }
                obj.items = items;
                if(!req.body.state){
                    return res.status(400).send({
                        status: 400,
                        data: null,
                        message: "State is required"
                    });
                }
                if(!req.body.pinCode){
                    return res.status(400).send({
                        status: 400,
                        data: null,
                        message: "Pincode is required"
                    });
                }
                if(!req.body.address){
                    return res.status(400).send({
                        status: 400,
                        data: null,
                        message: "Address is required"
                    });
                }
                if(!req.body.phone){
                    return res.status(400).send({
                        status: 400,
                        data: null,
                        message: "Phone is required"
                    });
                }
                if(!req.body.city){
                    return res.status(400).send({
                        status: 400,
                        data: null,
                        message: "City is required"
                    });
                }
                obj.deliveryAddress = {
                    state: req.body.state,
                    city: req.body.city,
                    address: req.body.address,
                    phone: req.body.phone,
                    pinCode: req.body.pinCode
                }
                let saveOrder = await this.#repo.orderRepo.save(obj);
                if(saveOrder && saveOrder._id){
                    await this.#repo.cartRepo.bulkDelete({userId: obj.userId});
                    const paymentMethod = await stripe.createCardPaymentMethod('08', '2025', '4242424242424242', '123', req.user.name);
                    // console.log(paymentMethod, "method");
                    if(paymentMethod && paymentMethod.id){
                        let payment = await stripe.createPaymentIntent(saveOrder.totalAmount, paymentMethod.id, saveOrder.orderId);
                        // console.log(payment, "payment");
                        if(payment && payment.status == "succeeded"){
                            await this.#repo.transactionRepo.save({
                                userId: req.user._id,
                                orderId: saveOrder._id,
                                amount: payment.amount / 100,
                                paymentMode: "Online",
                                transactionId: payment.id,
                                paymentMethod: payment.payment_method,
                                status: "Successful"
                            });
                            let updateOrder = await this.#repo.orderRepo.updateById(saveOrder._id, { orderStatus: "Placed", paymentStatus: "Paid" });
                            return res.status(200).send({
                                status:200,
                                data:  updateOrder,
                                message: "Order Placed"
                            });
                        }else if(payment && payment.status == "canceled"){
                            await this.#repo.transactionRepo.save({
                                userId: req.user._id,
                                orderId: saveOrder._id,
                                amount: payment.amount / 100,
                                paymentMode: "Online",
                                transactionId: payment.id,
                                paymentMethod: payment.payment_method,
                                status: "Failed"
                            });
                            let updateOrder = await this.#repo.orderRepo.updateById(saveOrder._id, { orderStatus: "Pending", paymentStatus: "Failed" });
                            return res.status(200).send({
                                status:200,
                                data:  updateOrder,
                                message: "Payment failed"
                            });
                        }else if(payment && payment.status == "requires_action"){
                            await this.#repo.transactionRepo.save({
                                userId: req.user._id,
                                orderId: saveOrder._id,
                                amount: payment.amount / 100,
                                paymentMode: "Online",
                                transactionId: payment.id,
                                paymentMethod: payment.payment_method,
                                status: "Pending"
                            });
                            let updateOrder = await this.#repo.orderRepo.updateById(saveOrder._id, { paymentStatus: "Processing" });
                            let url = payment.next_action.redirect_to_url.url;
                            return res.status(200).send({
                                status:200,
                                data: {url},
                                message: "Requires action"
                            });
                        }
                        
                    }
                }
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Something went wrong"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            });
        } catch (error) {
            console.error(error);
            
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    webHook = async(req,res)=>{
        try {
            console.log(req.body, "webhook");
            if(req.body.data.object.id){
                let transaction = await this.#repo.transactionRepo.getByField({ transactionId: req.body.data.object.id });
                if(transaction && req.body.type == "payment_intent.succeeded"){
                    await this.#repo.transactionRepo.updateById(transaction._id, { status: "Successful" });
                    await this.#repo.orderRepo.updateById(transaction.orderId, { orderStatus: "Placed", paymentStatus: "Paid" });
                }
            }

            return res.status(200).send({
                status: 200,
                message: "ok"
            })
            
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    editOder = async(req,res)=>{
        try {
            let order = await this.#repo.orderRepo.getByField({userId: req.user._id, orderId: req.body.orderId});
            if(!order){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Order does not exist"
                });
            }
            if(!req.body.state){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "State is required"
                });
            }
            if(!req.body.pinCode){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Pincode is required"
                });
            }
            if(!req.body.address){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Address is required"
                });
            }
            if(!req.body.phone){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Phone is required"
                });
            }
            if(!req.body.city){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "City is required"
                });
            }
            let update = await this.#repo.orderRepo.updateById(order._id, req.body);
            if(update && update._id){
                return res.status(200).send({
                    status: 200,
                    data: update,
                    message: "Address has been updated successfully"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            });

        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    cancelAllOrder = async(req,res)=>{
        try {
            let order = await this.#repo.orderRepo.getByField({ userId: req.user._id, orderId: req.body.orderId });
            if(!order){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Order does not exist"
                });
            }
            let changeStatus = await this.#repo.orderRepo.updateById(order._id, { orderStatus: "Canceled" });
            if(changeStatus && changeStatus._id){
                return res.status(200).send({
                    status: 200,
                    data: changeStatus,
                    message: "Order canceled successfully"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }
}

module.exports = new OrderController();