const roleRepo = require("../repositories/role.repository");

class RoleController {
    #repo = {roleRepo};

    add = async(req,res)=>{
        try {
            if(req.body.role){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter a role"
                });
            }
            if(req.body.type){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter a type"
                });
            }
            if(req.body.display){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter a display"
                });
            }
            let existRole = await this.#repo.roleRepo.getByField({ role: req.body.role, isDeleted: false });
            if(existRole){
                return res.status(400).send({
                    status: 400,
                    data: existRole,
                    message: "The role already exist"
                });
            }
            let saveRole = await this.#repo.roleRepo.save(req.body);
            if(saveRole && saveRole._id){
                return res.status(200).send({
                    status: 200,
                    data: saveRole,
                    message: "The new role has been added successfully"
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
            if(!req.body.id){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "ID is required"
                });
            }
            let role = await this.#repo.roleRepo.getById(req.body.id);
            if(!role){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "The role does not exist"
                });
            }
            if(req.body.role){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter a role"
                });
            }
            if(req.body.type){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter a type"
                });
            }
            if(req.body.display){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "Enter a display"
                });
            }
            let existRole = await this.#repo.roleRepo.getByField({ role: req.body.role, _id: { $ne: role._id } });
            if(existRole){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This role cannot be used"
                });
            }
            let updateRole = await this.#repo.roleRepo.updateById(role._id, req.body);
            if(updateRole && updateRole._id){
                return res.status(200).send({
                    status: 200,
                    data: updateRole,
                    message: "The role has been updated successfully"
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

    delete = async(req,res)=>{
        try {
            let role = await this.#repo.roleRepo.getById(req.params.id);
            if(!role){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "The role does not exist"
                });
            }
            await this.#repo.roleRepo.deleteById(role._id);
            return res.status(200).send({
                status: 200,
                data: true,
                message: "The role has been deleted successfully"
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

module.exports = new RoleController();