class QueryBuilder {
    constructor(model, requestBody, dbmsBuilder){
        this.query = ''
        this.model = model
        this.requestBody = requestBody
        this.dbmsBuilder = dbmsBuilder
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
        const {id, ...rest} = this.requestBody
        this.query += updateBuilder(table, {...rest, id}) 
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
    constructor(model, requestBody, dbmsBuilder){
        super(model, requestBody, dbmsBuilder)
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
        const {strict, ...requestBody} = this.requestBody
        const query = whereBuilder(table, includes, association, requestBody, strict)
        if(!query) throw new Error('ER_BAD_FIELD_ERROR')
        this.query += query + ' '
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
    get build(){
        return this.query.trim()
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
    get build(){
        return this.select.from.join.where.group.query.trim()
    }
}

class ParamsBuilder extends QueryBuilder {
    constructor(model, requestBody, dbmsBuilder){
        super(model, requestBody, dbmsBuilder)
    }
    get build(){
        const {parametersBuilder} = this.dbmsBuilder
        const {includes = [], alias = {}, association = []} = this.model
        const {strict, ...requestBody} = this.requestBody
        return parametersBuilder(includes, alias, association, requestBody, strict)
    }
}

module.exports = {
    init: (config) => {
        
        const {query: dbmsBuilder} = require(`../${config.db_system}`).init(config)

        return {
            queryBuilder: (model) => {
                return {
                    create: (requestBody) => new CreateQueryBuilder(model, requestBody, dbmsBuilder).create.build,
                    read: (requestBody) => new SelectQueryBuilder(model, requestBody, dbmsBuilder).select.from.join.where.sort.paging.group.build,
                    readAll: (requestBody) => new SelectQueryBuilder(model, requestBody, dbmsBuilder).select.from.join.sort.paging.group.build,
                    sum: (requestBody) => new SumQueryBuilder(model, requestBody, dbmsBuilder).build,
                    update: (requestBody) => new UpdateQueryBuilder(model, requestBody, dbmsBuilder).update.build,
                    delete: (requestBody) => new DeleteQueryBuilder(model, requestBody, dbmsBuilder).delete.build,
                    params: (requestBody) => new ParamsBuilder(model, requestBody, dbmsBuilder).build
                }
            },
            runQuery: dbmsBuilder.runQuery
        }
    }
}