const productRepo = require("../repository/product.repository");

class ProductController {

    #repo = {
        productRepo
    }

    add = async(req,res)=>{
        try {
            let existProduct = await this.#repo.productRepo.getByField({ title: req.body.title, isDeleted: false });
            if(existProduct){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This product already exist"
                });
            }
            let saveProduct = await this.#repo.productRepo.save(req.body);
            if(saveProduct && saveProduct._id){
                return res.status(200).send({
                    status: 200,
                    data: saveProduct,
                    message: "New product has been added successfully"
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

    update = async(req,res)=>{
        try {
            if(req.body.id){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "ID is required"
                });
            }
            let product = await this.#repo.productRepo.getByField({ id: req.body.id, isDeleted: false });
            if(!product){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Product does not exist"
                });
            }
            let existProduct = await this.#repo.productRepo.getByField({ title: req.body.title, _id: { $ne: product._id } });
            if(existProduct){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This title cannot be used"
                });
            }
            let update = await this.#repo.productRepo.updateById(product._id, req.body);
            if(update && update._id){
                return res.status(200).send({
                    status: 200,
                    data: update,
                    message: "Updated successfully"
                });
            }
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    delete = async(req,res)=>{
        try {
            if(req.body.id){
                return res.status.send({
                    status: 400,
                    data: null,
                    message: "ID is required"
                });
            }
            let product = await this.#repo.productRepo.getById(req.body.id);
            if(!product){
                return res.status.send({
                    status: 400,
                    data: null,
                    message: "Product does not exist"
                });
            }
            await this.#repo.productRepo.deleteById(product._id);
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }
}

module.exports = new ProductController();