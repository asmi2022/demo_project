const  CommonRepo = require("../../../utils/common.repository");
const CartModel = require("../models/cart.schema");

class CartRepo extends CommonRepo{
    constructor(){
        super(CartModel);
    }

    cartDetails = async(id)=>{
        try {
            return await CartModel.aggregate([
                {
                    $match: {
                        userId: id
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
                        total: {
                            $multiply: [ "$quantity", "$product.price" ]
                        }
                    }
                },
                {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0,
                        productId: 0
                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        products: {
                            $push: "$$ROOT"
                        },
                        subTotal: {
                            $sum: "$total"
                        }
                    }
                },
                {
                    $project: {
                        "products.userId" : 0
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CartRepo();