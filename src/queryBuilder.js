class QueryBuilder {
    constructor(model, requestBody, dbmsBuilder){
        this.query = ''
        this.model = model
        this.requestBody = requestBody
        this.dbmsBuilder = dbmsBuilder
    }
    get create(){
        const {createBuilder} = this.dbmsBuilder
        const {table = ''} = this.model
        this.query += createBuilder(table, this.requestBody) + ' '
        return this
    }
    get update(){
        const {updateBuider} = this.dbmsBuilder
        const {table = ''} = this.model
        this.query += updateBuider(table, this.requestBody) 
        return this
    }
    get select(){
        const {selectBuilder} = this.dbmsBuilder
        const {table = '', includes = [], alias = [], association = []} = this.model
        this.query += selectBuilder(table, includes, alias, association) + ' '
        return this
    }
    get from(){
        const {table = ''} = this.model
        this.query += `FROM ${table}` + ' '
        return this
    }
    get join(){
        const {joinBuilder} = this.dbmsBuilder
        const {association = []} = this.model
        this.query += joinBuilder(association) + ' '
        return this
    }
    get where(){
        const {whereBuilder} = this.dbmsBuilder
        const {table = '', includes = [], association = []} = this.model
        this.query += whereBuilder(table, includes, association, this.requestBody) + ' '
        return this
    }
    get paging(){
        const {pagingBuilder} = this.dbmsBuilder
        this.query += pagingBuilder(this.requestBody) + ' '
        return this
    }
    get delete(){
        const {deleteBuilder} = this.dbmsBuilder
        const {table = ''} = this.model
        this.query += deleteBuilder(table)
        return this
    }
    get build(){
        return this.query.trim()
    }
}

module.exports = (model, dbmsBuilder) => {
    const queryBuilder = (requestBody) => new QueryBuilder(model, requestBody, dbmsBuilder)
    return {
        create: (requestBody) => queryBuilder(requestBody).create.build,
        read: (requestBody) => queryBuilder(requestBody).select.from.join.where.paging.build,
        update: (requestBody) => queryBuilder(requestBody).update.build,
        delete: (requestBody) => queryBuilder(requestBody).delete.build
    }
}