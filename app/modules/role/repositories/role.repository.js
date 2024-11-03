const RoleModel = require("../models/role.schema");
const CommonRepo = require("../../../utils/common.repository");

class RoleRepo extends CommonRepo {
    constructor(){
        super(RoleModel)
    }


}

module.exports = new RoleRepo();