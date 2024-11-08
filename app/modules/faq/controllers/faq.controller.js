const { default: mongoose } = require("mongoose");
const faqRepository = require("../repositories/faq.repository");

class FAQController {

    #repo = {
        faqRepo: faqRepository
    };

    add = async(req,res)=>{
        try {
            req.body.question = req.body.question.trim();
            let existQuestion = await this.#repo.faqRepo.getByField({ question: req.body.question, isDeleted: false });
            if(existQuestion){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: 'This question already exist'
                });
            };
            let storeFAQ = await this.#repo.faqRepo.save(req.body);
            if(storeFAQ && storeFAQ._id){
                return res.status(200).send({
                    status: 200,
                    data: storeFAQ,
                    message: "FAQ has been added successfully"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            })
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
            req.body.question = req.body.question.trim();
            let existFAQ = await this.#repo.faqRepo.getByField({ question: req.body.question, isDeleted: false, _id: { $ne: mongoose.Types.ObjectId(req.body.id) } });
            if(existFAQ){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This question already exist"
                });
            };
            let updateFAQ = await this.#repo.faqRepo.updateById(mongoose.Types.ObjectId(req.body.id), req.body);
            if(updateFAQ && updateFAQ._id){
                return res.status(200).send({
                    status: 200,
                    data: updateFAQ,
                    message: "FAQ updated successfully"
                });
            }
            return res.status(400).send({
                status: 400,
                data: null,
                message: "Something went wrong"
            })
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
            let faq = await this.#repo.faqRepo.getById(req.params.id);
            if(!faq){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This FAQ does not exist"
                });
            };
            await this.#repo.faqRepo.updateById(faq._id, { isDeleted: true });
            return res.status(200).send({
                status: 200,
                success: true ,
                message: "FAQ is deleted successfully"
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                data: null,
                message: error.message
            });
        }
    }

    statusChange = async(req,res)=>{
        try {
            let faq = await this.#repo.faqRepo.getById(req.params.id);
            if(!faq){
                return res.status(400).send({
                    status: 400,
                    data: null,
                    message: "This FAQ does not exist"
                });
            };
            // if(faq.status == "Active"){
            //     await this.#repo.faqRepo.updateById(faq._id, { status: "Inactive" })
            // }else{
            //     await this.#repo.faqRepo.updateById(faq._id, { status: "Active" })
            // }
            let status = faq.status == 'Active'?"Inactive":"Active";
            await this.#repo.faqRepo.updateById(faq._id, {status});
            return res.status(200).send({
                status: 200,
                success: true,
                message: "Changed status successfully"
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

module.exports = new FAQController();