const {errorCode, errorHandler} = require('./utils/customError')

class Model {
    constructor(pool, model, {queryBuilder, runQuery}) {
        this.pool = pool
        this.runQuery = runQuery
        this.queryBuilder = queryBuilder(model)
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
        if (typeof requestBody !== 'object' || requestBody === undefined) throw errorCode.ER_INVALID_BODY
        return this.#runQuery('readAll', requestBody)
    }
    async findByKeys(requestBody, strict = false) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        requestBody['strict'] = strict
        return this.#runQuery('read', requestBody, strict)
    }
    async update(requestBody) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        const{id, ...rest} = requestBody
        return this.#runQuery('update', {...rest, id})
    }
    async sum(requestBody) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        return this.#runQuery('sum', requestBody)
    }
    async delete(id) {
        if(!id || isNaN(Number(id))) throw errorCode.ER_INVALID_BODY
        return this.#runQuery('delete', {id})
    }
    async #runQuery(operation, requestBody) {
        try {
            // build query       
            const query = this.queryBuilder[operation](requestBody)
            // build params
            const params = this.queryBuilder.params(requestBody)
            // run query
            const result = await this.runQuery(query, params, this.pool)
    
            if(!result || result.length === 0){
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