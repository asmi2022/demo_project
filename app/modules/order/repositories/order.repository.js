const CommonRepo = require("../../../utils/common.repository");
const OrderModel = require("../models/order.schema");

class OrderRepo extends CommonRepo {
    constructor(){
        super(OrderModel);
    }

    orderDetails = async(orderId)=>{
        try {
            return await OrderModel.aggregate([
                {
                    $match: {
                        _id: orderId
                    }
                },
                {
                    $unwind: {
                        path: "$products", preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        foreignField: "_id",
                        localField: "products.productId",
                        as: "productDetails",
                        pipeline: [
                            {
                                $project: {
                                    title: 1,
                                    details: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$productDetails", preserveNullAndEmptyArrays: false
                    }
                },
                {
                  $addFields: {
                    "productDetails.productId" : "$products.productId",
                    "productDetails.price" : "$products.price",
                    "productDetails.itemPrice" : "$products.itemPrice",
                    "productDetails.quantity" : "$products.quantity",
                  }  
                },
                {
                    $group: {
                        _id: "$_id",
                        userId: {
                            $first: "$userId"
                        },
                        orderNumber: { $first: "$orderNumber" },
                        address: { $first: "$address" },
                        products: { 
                            $push: "$products"
                         },
                        totalPrice: { $first: "$totalPrice" },
                        paymentMode: { $first: "$paymentMode" },
                        paymentStatus: { $first: "$paymentStatus" },
                        orderStatus: { $first: "$orderStatus" },
                        refunded: { $first: "$refunded" },
                        refundedAmount: { $first: "$refundedAmount" },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }
            ])
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OrderRepo();