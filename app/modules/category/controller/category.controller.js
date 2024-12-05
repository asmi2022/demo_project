const categoryRepo = require("../repositories/category.repository");

class CategoryController {
    #repo = {
        categoryRepo
    }

    add = async(req,res)=>{
        try {
            let existCategory = await this.#repo.categoryRepo.getByField({ title: req.body.title, isDeleted: false });
            if(existCategory){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This category already exist"
                });
            }
            let saveCategory = await this.#repo.categoryRepo.save(req.body);
            if(saveCategory && saveCategory._id){
                return res.status(200).send({
                    status: 200,
                    data: saveCategory,
                    message: "New category has been added successfully"
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
            let category = await this.#repo.categoryRepo.getByField({ id: req.body.id, isDeleted: false });
            if(!category){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Product does not exist"
                });
            }
            let existProduct = await this.#repo.categoryRepo.getByField({ title: req.body.title, _id: { $ne: category._id } });
            if(existProduct){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This title cannot be used"
                });
            }
            let update = await this.#repo.categoryRepo.updateById(category._id, req.body);
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
            let category = await this.#repo.categoryRepo.getById(req.body.id);
            if(!category){
                return res.status.send({
                    status: 400,
                    data: null,
                    message: "Product does not exist"
                });
            }
            await this.#repo.categoryRepo.deleteById(category._id);
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }
}

module.exports = new CategoryController();