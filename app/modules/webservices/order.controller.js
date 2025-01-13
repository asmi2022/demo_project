const orderRepo = require("../order/repositories/order.repository");
const cartRepo = require("../cart/repositories/cart.repository");
const transactionRepo = require("../transaction/repositories/transaction.repository");
const otp_generator = require("otp-generator");
const stripe = require("../../utils/stripe");

class OrderController {
    #repo = {
        orderRepo,
        cartRepo,
        transactionRepo
    }

    placeOrder = async(req, res)=>{
        try {
            req.body.userId = req.user._id;
            let cart = await this.#repo.cartRepo.cartDetails(req.body.userId);
            if(!cart || !cart.length){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Cart is empty"
                });
            }
            if(!req.body.country || !req.body.state || !req.body.city || !req.body.pincode || !req.body.address){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Valid address with required fields are required"
                });
            }
            if(!req.body.phone){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Phone number is required"
                });
            }
            req.body.address = {
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                pincode: req.body.pincode,
                address: req.body.address,
                phone: req.body.phone,
            }
            let products = [];
            for(let item of cart[0].products){
                products.push({
                    productId: item.productId,
                    price: item.product.price,
                    itemPrice: item.itemPrice,
                    quantity: item.quantity
                });
            }
            req.body.products = products;
            req.body.totalPrice = cart[0].total;
            req.body.orderNumber = otp_generator.generate(12, {
                lowerCaseAlphabets: true,
                upperCaseAlphabets: true,
                digits: true,
                specialChars: false
            });
            while(await this.#repo.orderRepo.getByField({orderNumber: req.body.orderNumber})){
                req.body.orderNumber = otp_generator.generate(12, {
                    lowerCaseAlphabets: true,
                    upperCaseAlphabets: true,
                    digits: true,
                    specialChars: false
                });
            }
            if(req.body.paymentMode == "COD" || req.body.paymentMode == "Pay Later"){
                req.body.orderStatus = "Placed"
            }else{
                req.body.orderStatus = "Pending"
            }
            let saveOrder = await this.#repo.orderRepo.save(req.body);
            if(saveOrder && saveOrder._id){
                if(req.body.orderStatus == "Placed"){
                    await this.#repo.transactionRepo.save({
                        userId: saveOrder.userId,
                        orderId: saveOrder._id,
                        amount: saveOrder.totalPrice,
                        paymentMode: saveOrder.paymentMode,
                        paymentStatus: saveOrder.paymentStatus
                    });
                    await this.#repo.cartRepo.bulkDelete({userId});
                    let orderDetails = await this.#repo.orderRepo.orderDetails(saveOrder._id);
                    return res.status(200).send({
                        status: 200,
                        data: orderDetails[0],
                        message: "Order has been placed successfully"
                    });
                }
                let paymentMethod = await stripe.paymentMethod( "01", "2025", "42424242", "321");
                if(!paymentMethod || !paymentMethod.id){
                    return res.status(400).send({
                        status: 400,
                        data: null,
                        message: "Something went wrong"
                    });
                }
                let payment = await stripe.createPaymentIntent(saveOrder.totalPrice, "usd", paymentMethod.id, saveOrder.orderNumber);
                if(payment && payment.id){
                    if(payment.status == "succeeded"){
                        let updateOrder = await this.#repo.orderRepo.updateById(saveOrder._id, {orderStatus: "Placed", paymentStatus: "Paid"});
                        await this.#repo.transactionRepo.save({
                            userId: saveOrder.userId,
                            orderId: saveOrder._id,
                            transactionId: payment.id,
                            amount: saveOrder.totalPrice,
                            paymentMode: saveOrder.paymentMode,
                            paymentMethod: paymentMethod.id,
                            paymentStatus: updateOrder.paymentStatus
                        });
                        await this.#repo.cartRepo.bulkDelete(userId);
                        let orderDetails = await this.#repo.orderRepo.orderDetails(updateOrder._id);
                        return res.status(200).send({
                            status: 200,
                            data: orderDetails[0],
                            message: "Order has been placed successfully"
                        });
                    }else if(payment.status == "requires_action"){
                        await this.#repo.transactionRepo.save({
                            userId: saveOrder.userId,
                            orderId: saveOrder._id,
                            transactionId: payment.id,
                            amount: saveOrder.totalPrice,
                            paymentMode: saveOrder.paymentMode,
                            paymentMethod: paymentMethod.id,
                            paymentStatus: saveOrder.paymentStatus
                        });  
                        let updateOrder = await this.#repo.orderRepo.updateById(saveOrder._id, { paymentStatus: "Processing" });
                        return res.status(200).send({
                            status: 200,
                            data: {url: payment.next_action.redirect_to_url.url},
                            message: "Requires action"
                        });
                    }else{
                        let updateOrder = await this.#repo.orderRepo.updateById(saveOrder._id, { orderStatus: "Failed", paymentStatus: "Failed" });
                        await this.#repo.transactionRepo.save({
                            userId: saveOrder.userId,
                            orderId: saveOrder._id,
                            transactionId: payment.id,
                            amount: saveOrder.totalPrice,
                            paymentMode: saveOrder.paymentMode,
                            paymentMethod: paymentMethod.id,
                            paymentStatus: updateOrder.paymentStatus
                        });
                        let orderDetails = await this.#repo.orderRepo.orderDetails(updateOrder._id);
                        return res.status(400).send({
                            status: 400,
                            data: orderDetails[0],
                            message: "Transaction failed"
                        });
                    }
                }
            }else{
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Something went wrong"
                });
            }
        } catch (error) {
            console.error(error);
            
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            })
        }
    }

    webHook = async(req,res)=>{
        try {
            console.log(req.body, "webhook");
            if(req.body.data.object.id){
                let transaction = await this.#repo.transactionRepo.getByField({ transactionId: req.body.data.object.id });
                if(transaction && req.body.type == "payment_intent.succeeded"){
                    await this.#repo.transactionRepo.updateById(transaction._id, { paymentStatus: "Paid" });
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
            let order = await this.#repo.orderRepo.getByField({userId: req.user._id, orderNumber: req.body.orderNumber});
            if(!order){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Order does not exist"
                });
            }
            if(!req.body.country || !req.body.state || !req.body.city || !req.body.pincode || !req.body.address){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Valid address with required fields are required"
                });
            }
            if(!req.body.phone){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Phone number is required"
                });
            }
            req.body.address = {
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                pincode: req.body.pincode,
                address: req.body.address,
                phone: req.body.phone,
            }
            let update = await this.#repo.orderRepo.updateById(order._id, req.body);
            if(update && update._id){
                let orderDetails = await this.#repo.orderRepo.orderDetails(update._id);
                return res.status(200).send({
                    status: 200,
                    data: orderDetails[0],
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
                let orderDetails = await this.#repo.orderRepo.orderDetails(changeStatus._id);
                return res.status(200).send({
                    status: 200,
                    data: orderDetails[0],
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