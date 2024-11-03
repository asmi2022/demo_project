class CommonRepo {
    #Model = null;
    constructor(Model) {
        this.#Model = Model;
    }

    getAllByField = async(params)=>{
        try {
            return await this.#Model.find(params);
        } catch (error) {
            throw error;
        }
    }

    getById = async(id)=>{
        try {
            return await this.#Model.findById(id);
        } catch (error) {
            throw error;
        }
    }

    getByField = async(params)=>{
        try {
            return await this.#Model.findOne(params);
        } catch (error) {
            throw error;
        }
    }

    updateById = async(id, body)=>{
        try {
            return await this.#Model.findByIdAndUpdate(id, body, {
                new: true
            });
        } catch (error) {
            throw error;
        }
    }

    updateByField = async(params, body)=>{
        try {
            return await this.#Model.findOneAndUpdate(params, body);
        } catch (error) {
            throw error;
        }
    }

    deleteById = async(id)=>{
        try {
            return await this.#Model.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }

    deleteByField = async(params)=>{
        try {
            return await this.#Model.findOneAndDelete(params);
        } catch (error) {
            throw error;
        }
    }

    save = async(body)=>{
        try {
            return await this.#Model.create(body);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CommonRepo;