const { default: mongoose } = require("mongoose");
const cartRepo = require("../cart/repositories/cart.repository");

class CartController{
    #repo = {
        cartRepo
    }
    cartHandler = async(req,res)=>{
        try {
            let cartProduct = await this.#repo.cartRepo.getByField({ productId: new mongoose.Types.ObjectId(req.body.productId), userId: req.user._id });
            req.body.userId = req.user._id;
            if(!cartProduct && req.body.quantity && req.body.quantity>0){
                let addToCart = await this.#repo.cartRepo.save(req.body);
                if(!addToCart){
                    return res.status(400).send({
                        status: 400,
                        data: null,
                        message: "Something went wrong"
                    });
                }
            }else if(cartProduct){
                if(req.body.quantity && req.body.quantity>0){
                    let updateCart = await this.#repo.cartRepo.updateById(cartProduct._id, req.body);
                    if(!updateCart){
                        return res.status(400).send({
                            status: 400,
                            data: null,
                            message: "Something went wrong"
                        });
                    }
                }else{
                    await this.#repo.cartRepo.deleteById(cartProduct._id);
                }
            }
            let cartDetails = await this.#repo.cartRepo.cartDetails(req.body.userId);
            if(cartDetails && cartDetails.length){
                return res.status(200).send({
                    status: 200,
                    data: cartDetails[0],
                    message: "Successfully fetched"
                });
            }
            return res.status(200).send({
                status: 200,
                data: null,
                message: "Cart is empty"
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

module.exports = new CartController();



// {
//     _id: 1234,
//     userId: hjvhvvh,
//     productId: 21288,
//     quantity: 1
// }
// {
//     _id: 12345,
//     userId: hjvhvvh,
//     productId: 212889,
//     quantity: 1
// }

// {
//     userId: hjvhvvh,
//     products: [
//         {
//             productID: 542314,
//             price: 50,
//             quantity: 2,
//             gross_price: 100
//         },
//         {
//             productID: 653,
//             quantity: 1
//         },
//         {
//             productID: 5421,
//             quantity: 1
//         }
//     ],
//     price: 5454,
//     tax: 54,
//     total: 5555
// }