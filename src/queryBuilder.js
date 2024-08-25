const {errorCode, errorHandler} = require('./utils/customError')

class QueryBuilder {
    constructor(
        {table = '', includes = [], alias = [], association = [], db_system = 'postgres'}
    ){
        this.table = table
        this.includes = includes
        this.alias = alias
        this.association = association
        this.parameterizedHandler = (paramIndex) => parameterizedHandler(paramIndex, db_system)
        this.returningMetadata = (keys = 'id') => returningMetadata(keys, db_system)
    }
    #select(){
    
        const queries = []
    
        const selectQuery = (table, includes, alias) => {
            if(includes.length > 0){
                return includes.map(column => {
                    // If the column exists in the alias object, use the alias value, otherwise use the column itself
                    if(column && alias && alias[column]){
                        return `${table}.${column} AS ${alias[column]}`
                    }else{
                        return `${table}.${column}`
                    }
                }).join(', ')
            } 
            return `${table}.*`
        }
    
        queries.push(selectQuery(this.table, this.includes, this.alias))
    
        if(this.association && Array.isArray(this.association) && this.association.length > 0){
            this.association.forEach( assoc => {
                const {table, includes, alias} = assoc
                queries.push(selectQuery(table, includes, alias))
            })
        }
        return queries.join(', ')
    }
    #join() {

        if (!this.association || this.association.length === 0) return ''
    
        return this.association.map(({ table, foreignKey, references, joinType }) =>{
            const join = joinType ? joinType : 'INNER JOIN'
            return `${join} ${table} ON ${foreignKey} = ${references}`
        }).join(' ')
        
    }
    #where(requestBody, patternMatching = false) {

        const includedKeys = []
    
        const operationBuilder = (value) => {
            if(Array.isArray(value)){
                const placeholder = value.map((_, index) => this.parameterizedHandler(index + 1)).join(',')
                return `IN (${placeholder})`
            }else if(typeof value === 'string' && /^\d+(,\d+)*$/.test(value)){
                const placeholder = value.split(',').map((_, index) => this.parameterizedHandler(index + 1)).join(', ')
                return `IN (${placeholder})`
            }else if(typeof value === 'string' && value.includes(',')){
                const placeholder = value.split(',').map((_, index) => this.parameterizedHandler(index + 1)).join(', ')
                return `IN (${placeholder})`
            }else if(typeof value === 'string' && value.length > 2 && patternMatching){
                return `LIKE ${this.parameterizedHandler(1)}`
            }else{
                return `= ${this.parameterizedHandler(1)}`
            }
        }
    
        // 'WHERE' query builder for main table
        for(let key in requestBody){
            const value = requestBody[key]
            if(this.includes.includes(key)){
                includedKeys.push(`${this.table}.${key} ${operationBuilder(value)}`)
            }
        }
    
        // 'WHERE' query builder for association table using alias as keys
        this.association.forEach(assoc => {
            if(assoc.alias){
                for(let aliasKey in assoc.alias){
                    for(let requestKey in requestBody){
                        const value = requestBody[requestKey]
                        if(requestKey == aliasKey){
                            includedKeys.push(`${assoc.table}.${aliasKey} ${operationBuilder(value)}`)
                        }
                    }
                }
            }
        })
        return includedKeys.join(' AND ')
    }
    #paging(requestBody){
    
        const page = requestBody?.page || 1
        const pageSize = requestBody?.pageSize || 10
    
        const limit = pageSize
        const offset = (page - 1) * (pageSize)
        
        return `LIMIT ${limit} OFFSET ${offset}`
    }
    create(requestBody){
        try {
            if(hasEmptyValue(requestBody)) throw errorCode.ER_BAD_FIELD_ERROR

            // extract keys and values from object data
            const keys = Object.keys(requestBody)

            // create placeholder for the values
            const placeholders = keys.map((_, index) => this.parameterizedHandler(index + 1)).join(', ')
            
            return {
                query: `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders}) ${this.returningMetadata()}`,
                param: paramsBuilder(requestBody, [], false, false)
            }
        } catch (error) {
            throw errorHandler(error)
        }
    }
    readByPk(requestBody){
        try {
            if(hasEmptyValue(requestBody) || isNaN(Number(requestBody.id))) throw errorCode.ER_BAD_FIELD_ERROR

            return {
                query: `SELECT ${this.#select()} FROM ${this.table} ${this.#join()} WHERE ${this.table}.id = ${this.parameterizedHandler(1)}`,
                param: [requestBody.id]
            }
        } catch (error) {
            throw errorHandler(error)
        }
    }
    readAll(requestBody){
        try {
            const paging = this.#paging(requestBody)
            return {
                query: `SELECT ${this.#select()} FROM ${this.table} ${this.#join()} ${paging}`,
                param: []
            }
        } catch (error) {
            throw errorHandler(error)
        }
    }
    readByKeys(requestBody, patternMatching = true){
        try {
            if(hasEmptyValue(requestBody)) throw errorCode.ER_BAD_FIELD_ERROR
            const { pageSize, size, ...rest } = requestBody || {}
            const where = this.#where(rest, patternMatching)
            const paging = this.#paging({size, pageSize})

            return {
                query: `SELECT ${this.#select()} FROM ${this.table} ${this.#join()} WHERE ${where} ${paging}`,
                param: paramsBuilder(rest, [], true, patternMatching)
            }

        } catch (error) {
            throw errorHandler(error)
        }
    }
    update(requestBody){
        try {
            if(hasEmptyValue(requestBody) || typeof requestBody.id !== 'number') throw errorCode.ER_BAD_FIELD_ERROR

            const {id, ...data} = requestBody

            if(hasEmptyValue(data)) throw errorCode.ER_BAD_FIELD_ERROR

            // extract keys and values from object data
            const keys = Object.keys(data)
            const params = paramsBuilder(requestBody, ['id'], false, false)
            params.push(id)

            // construct placeholder for updated columns
            const placeholder = keys.map((key, index) => `${key} = ${this.parameterizedHandler(index + 1)}`).join(', ')

            return {
                query: `UPDATE ${this.table} SET ${placeholder} WHERE ${this.table}.id = ${this.parameterizedHandler(keys.length + 1)} ${this.returningMetadata()}`,
                param: params
            }

        } catch (error) {
            throw errorHandler(error)
        }
    }
    delete(requestBody){
        try {
            if(hasEmptyValue(requestBody) || isNaN(Number(requestBody.id))) throw errorCode.ER_BAD_FIELD_ERROR
            
            return {
                query: `DELETE FROM ${this.table} WHERE ${this.table}.id = ${this.parameterizedHandler(1)} ${this.returningMetadata()}`,
                param: [requestBody.id]
            }
        } catch (error) {
            throw errorHandler(error)
        }
    }
    
}

function paramsBuilder(requestBody, excludedKeys = [], allowedArrayValue = false, patternMatching = true) {
    // Extract keys and values from object data
    const keys = Object.keys(requestBody)
    const params = keys
        .filter(key => !excludedKeys.includes(key)) // Exclude keys present in excludedKeys
        .flatMap(key => {
            const value = requestBody[key]
            if(Array.isArray(value) && allowedArrayValue){
                return value
            }else if(typeof value === 'string' && value.includes(',') && allowedArrayValue == true){
                return value.split(',').map(val => isNaN(Number(val)) ? val : Number(val))
            }else if(patternMatching && typeof value === 'string' && isNaN(Number(value))){
                return [`%${value}%`]
            }else{
                return [value]
            }
        })

    return params
}

function hasEmptyValue(obj) {
    if(Object.keys(obj).length < 1) return true
    return Object.values(obj).some(value => value === null || value === undefined || value === '')
}

function parameterizedHandler(paramIndex = 1, db_system){
    switch(db_system){
        case 'mysql':
            return '?'
        case 'postgres':
            return `$${paramIndex}`
        default:
            throw new Error('Invalid Database System')
    }
}

function returningMetadata(key = 'id', db_system){
    switch(db_system){
        case 'mysql':
            return ''
        case 'postgres':
            return `RETURNING ${key}`
        default:
            throw new Error('Invalid Database System')
    }
}

module.exports = QueryBuilder