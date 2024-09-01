const {errorCode, errorHandler} = require('./utils/customError')

class Model {
    constructor(pool, model, builder) {
        const{queryBuilder, paramsBuilder, runQuery} = builder
        this.pool = pool
        this.runQuery = runQuery
        this.queryBuilder = queryBuilder(model),
        this.paramsBuilder = paramsBuilder
        this.runQuery = runQuery
    }

    async create(requestBody) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        return this.#runQuery('create', requestBody)
    }

    async findByPk(id) {
        if(!id || isNaN(Number(id))) throw errorCode.ER_INVALID_BODY
        return this.#runQuery('read', {id})
    }

    async findAll(requestBody) {
        if (typeof requestBody !== 'object' || requestBody === undefined) {
            throw errorCode.ER_INVALID_BODY
        }
        return this.#runQuery('read', requestBody || {})
    }
    async findByKeys(requestBody, patternMatching = true) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        return this.#runQuery('read', requestBody, [patternMatching])
    }
    async update(requestBody) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        return this.#runQuery('update', requestBody)
    }

    async delete(id) {
        if(!id || isNaN(Number(id))) throw errorCode.ER_INVALID_BODY
        return this.#runQuery('delete', {id})
    }

    async #runQuery(operation, requestBody, otherParams = []) {
        try {
            if(!operation) throw errorCode.ER_INVALID_METHOD
            
            const query = this.queryBuilder[operation](requestBody, ...otherParams)

            let paramsBody = requestBody
            
            if(operation == 'update'){
                const {id, ...rest} = requestBody
                paramsBody = {...rest, id}
            }else{
                paramsBody = requestBody
            }

            const params = this.paramsBuilder(paramsBody, ...otherParams)

            if(!query) throw errorCode.ER_QUERY_ERROR
    
            const result = await this.runQuery(query, params, this.pool)
    
            if(Array.isArray(result) && result.length == 0 || result.affectedRows == 0){
                throw errorCode.ER_NOT_FOUND
            }
            return resultHandler({ data: result })
    
        } catch (error) {
            if(errorCode[error.code]) throw errorHandler(errorCode[error.code])
    
            throw errorHandler(error)
        }
    }
    
    
}

function resultHandler({ data, message = '', code = '' }) {
    return data
        ? { status: true, message: message || 'success', data }
        : { status: false, message: message || 'unknown error', code: code || 'unknown code' }
}

function hasEmptyValue(obj) {
    if(Object.keys(obj).length < 1) return true
    return Object.values(obj).some(value => value === null || value === undefined || value === '')
}

module.exports = Model