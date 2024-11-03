const FAQModel = require("../models/faq.schema");
const CommonRepo = require("../../../utils/common.repository");

class FAQRepo extends CommonRepo{

    constructor(){
        super(FAQModel)
    }
    
    getAll = async(params)=>{
        try {
            
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new FAQRepo();