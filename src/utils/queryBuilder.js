class QueryBuilder {
    constructor(model, requestBody, dbmsBuilder, patternMatching){
        this.query = ''
        this.model = model
        this.requestBody = requestBody
        this.dbmsBuilder = dbmsBuilder
        this.patternMatching = patternMatching
    }
    get build(){
        return this.query.trim()
    }
}

class CreateQueryBuilder extends QueryBuilder {
    constructor(model, requestBody, dbmsBuilder){
        super(model, requestBody, dbmsBuilder)
    }
    get create(){
        const {createBuilder} = this.dbmsBuilder
        const {table = ''} = this.model
        this.query += createBuilder(table, this.requestBody) + ' '
        return this
    }
}

class UpdateQueryBuilder extends QueryBuilder {
    constructor(model, requestBody, dbmsBuilder){
        super(model, requestBody, dbmsBuilder)
    }
    get update(){
        const {updateBuilder} = this.dbmsBuilder
        const {table = ''} = this.model
        this.query += updateBuilder(table, this.requestBody) 
        return this
    }
}

class DeleteQueryBuilder extends QueryBuilder {
    constructor(model, requestBody, dbmsBuilder){
        super(model, requestBody, dbmsBuilder)
    }
    get delete(){
        const {deleteBuilder} = this.dbmsBuilder
        const {table = ''} = this.model
        this.query += deleteBuilder(table)
        return this
    }
}

class SelectQueryBuilder extends QueryBuilder {
    constructor(model, requestBody, dbmsBuilder, patternMatching){
        super(model, requestBody, dbmsBuilder, patternMatching)
    }
    get select(){
        const {selectBuilder} = this.dbmsBuilder
        const {table = '', includes = [], alias = {}, association = []} = this.model
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
    get sort(){
        const {sortBuilder} = this.dbmsBuilder
        this.query += sortBuilder(this.requestBody) + ' '
        return this
    }
    get group(){
        const {groupBuilder} = this.dbmsBuilder
        const {table = '', includes = [], alias = {}, association = []} = this.model
        const {group_by = []} = this.requestBody
        this.query += groupBuilder(table, includes, alias, association, group_by) + ' '
        return this
    }
}

class SumQueryBuilder extends SelectQueryBuilder {
    constructor(model, requestBody, dbmsBuilder){
        super(model, requestBody, dbmsBuilder)
    }
    get select(){
        const {sumBuilder} = this.dbmsBuilder
        const {table = '', includes = [], alias = {}, association = []} = this.model
        const {sum, group_by} = this.requestBody
        this.query += sumBuilder(table, includes, alias, association, sum, group_by) + ' '
        return this
    }
    get where(){
        const {whereBuilder} = this.dbmsBuilder
        const {table = '', includes = [], association = []} = this.model
        const {sum, ...requestBody} = this.requestBody
        this.query += whereBuilder(table, includes, association, requestBody) + ' '
        return this
    }
}

module.exports = {
    init: (config) => {
        
        const {query: dbmsBuilder} = require(`../${config.db_system}`).init(config)

        return {
            queryBuilder: (model) => {
                return {
                    create: (requestBody) => new CreateQueryBuilder(model, requestBody, dbmsBuilder).create.build,
                    read: (requestBody, patternMatching) => new SelectQueryBuilder(model, requestBody, dbmsBuilder, patternMatching).select.from.join.where.sort.paging.group.build,
                    sum: (requestBody) => new SumQueryBuilder(model, requestBody, dbmsBuilder).select.from.join.where.group.build,
                    update: (requestBody) => new UpdateQueryBuilder(model, requestBody, dbmsBuilder).update.build,
                    delete: (requestBody) => new DeleteQueryBuilder(model, requestBody, dbmsBuilder).delete.build
                }
            },
            paramsBuilder: dbmsBuilder.paramsBuilder,
            runQuery: dbmsBuilder.runQuery
        }
    }
}