const { paramsBuilder } = require("../postgres/query")

class QueryBuilder {
    constructor(model, requestBody, dbmsBuilder, patternMatching){
        this.query = ''
        this.model = model
        this.requestBody = requestBody
        this.dbmsBuilder = dbmsBuilder
        this.patternMatching = patternMatching
    }
    get create(){
        const {createBuilder} = this.dbmsBuilder
        const {table = ''} = this.model
        this.query += createBuilder(table, this.requestBody) + ' '
        return this
    }
    get update(){
        const {updateBuilder} = this.dbmsBuilder
        const {table = ''} = this.model
        this.query += updateBuilder(table, this.requestBody) 
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
        this.query += whereBuilder(table, includes, association, this.requestBody, this.patternMatching) + ' '
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

module.exports = {
    init: (config) => {
        
        const {query} = require(`../${config.db_system}`)

        return {
            queryBuilder: (model) => {
                const builder = (requestBody, patternMatching) => new QueryBuilder(model, requestBody, query, patternMatching)
                return {
                    create: (requestBody) => builder(requestBody).create.build,
                    read: (requestBody, patternMatching) => builder(requestBody, patternMatching).select.from.join.where.paging.build,
                    update: (requestBody) => builder(requestBody).update.build,
                    delete: (requestBody) => builder(requestBody).delete.build
                }
            },
            paramsBuilder: query.paramsBuilder,
            runQuery: query.runQuery
        }
    }
}