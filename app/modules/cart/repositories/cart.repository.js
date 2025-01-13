const CommonRepo = require("../../../utils/common.repository");
const CartModel = require("../models/cart.schema");

class CartRepository extends CommonRepo{
    constructor(){
        super(CartModel);
    }

    cartDetails = async(userId)=>{
        try {
            return await CartModel.aggregate([
                {
                    $match: {
                        userId
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        foreignField: "_id",
                        localField: "productId",
                        as: "product",
                        pipeline: [
                            {
                                $project: {
                                    title: 1,
                                    price: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$product", preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $addFields: {
                        itemPrice: {
                            $multiply: [ "$quantity", "$product.price" ]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        products: {
                            $push: "$$ROOT"
                        },
                        total: {
                            $sum: "$itemPrice"
                        }
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CartRepository();