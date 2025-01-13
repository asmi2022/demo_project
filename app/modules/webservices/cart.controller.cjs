const { default: mongoose } = require("mongoose");
const cartRepo = require("../cart/repositories/cart.repository");

class CartController {
    #repo = {
        cartRepo
    }

    cartHandler = async(req, res)=>{
        try {
            req.body.userId = req.user._id;
            if(!req.body.productId){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Product ID is required"
                });
            }
            req.body.productId = new mongoose.Types.ObjectId(req.body.productId);
            let cart = await this.#repo.cartRepo.getByField({ userId: req.body.userId, productId: req.body.productId });
            if(!cart){
                if(req.body.quantity && req.body.quantity > 0){
                    await this.#repo.cartRepo.save(req.body);
                }
            }else{
                if(req.body.quantity && req.body.quantity > 0){
                    await this.#repo.cartRepo.updateById(cart._id, req.body);
                }else{
                    await this.#repo.cartRepo.deleteById(cart._id);
                }
            }
            let cartDetails = await this.#repo.cartRepo.cartDetails(req.body.userId);
            return res.status(200).send({
                status: 200,
                data: cartDetails.length?cartDetails[0]:null,
                message: "Cart fetched"
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
}

module.exports = new CartController();