function createBuilder(table, requestBody){
    // extract keys and values from object data
    const keys = Object.keys(requestBody)

    // create placeholder for the values
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ')
    
    return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`
}
function selectBuilder(table, includes=[], alias, association = []){

    let query = `SELECT `

    const selectQuery = (table, includes, alias, association) => {

        includes.forEach(column => {
            if(alias && alias[column]){
                query += `${table}.${column} AS ${alias[column]}, `
            }else {
                query += `${table}.${column}, `
            }
        })

        if(association && Array.isArray(association)){
            association.forEach(assoc => {
                selectQuery(assoc.table, assoc.includes, assoc.alias, assoc.association)
            })
        }
    }

    selectQuery(table, includes, alias)

    if(association && Array.isArray(association) && association.length > 0){
        association.forEach( assoc => {
            const {table, includes, alias} = assoc
            selectQuery(table, includes, alias, assoc.association)
        })
    }
    return query.slice(0, query.length - 2)
}
function joinBuilder(association) {
    if (!association || association.length === 0) return ''

    return association.map(({ table, foreignKey, references, joinType, association: nestedAssociations }) => {
        const join = joinType ? joinType : 'INNER JOIN'
        const joinClause = `${join} ${table} ON ${foreignKey} = ${references}`

        // Rekursi untuk menangani nested associations
        const nestedJoin = nestedAssociations ? joinBuilder(nestedAssociations) : ''

        // Gabungkan join clause dengan nested join
        return [joinClause, nestedJoin].filter(Boolean).join(' ')
    }).join(' ')
}
function whereBuilder(table, includes, association, requestBody, patternMatching = false) {

    const includedKeys = []
    let idx = 0
    const operationBuilder = (value) => {
        if(Array.isArray(value)){
            const placeholder = value.map((_, index) => `$${idx += 1}`).join(',')
            return `IN (${placeholder})`
        }else if(typeof value === 'string' && /^\d+(,\d+)*$/.test(value)){
            const placeholder = value.split(',').map((_, index) => `$${idx += 1}`).join(', ')
            return `IN (${placeholder})`
        }else if(typeof value === 'string' && value.includes(',')){
            const placeholder = value.split(',').map((_, index) => `$${idx += 1}`).join(', ')
            return `IN (${placeholder})`
        }else if(typeof value === 'string' && value.length > 2 && patternMatching){
            return `LIKE $${idx += 1}`
        }else{
            return `= $${idx += 1}`
        }
    }

    // 'WHERE' query builder for main table
    for(let key in requestBody){
        const value = requestBody[key]
        if(includes.includes(key)){
            includedKeys.push(`${table}.${key} ${operationBuilder(value)}`)
        }
    }

    // 'WHERE' query builder for association table using alias as keys
    association.forEach(assoc => {
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
    if(includedKeys.length > 0) return `WHERE ${includedKeys.join(' AND ')}`
    return ``
}
function pagingBuilder(requestBody){
    
    const page = requestBody?.page || 1
    const pageSize = requestBody?.pageSize || 10

    const limit = pageSize
    const offset = (page - 1) * (pageSize)
    
    return `LIMIT ${limit} OFFSET ${offset}`
}

function updateBuilder(table, requestBody){
    const {id, ...data} = requestBody
    
    // extract keys and values from object data
    const keys = Object.keys(data)

    // construct placeholder for updated columns
    const placeholder = keys.map((key, index) => `${key} = $${index + 1}`).join(', ')

    return `UPDATE ${table} SET ${placeholder} WHERE ${table}.id = $${keys.length + 1} RETURNING id`
}

function deleteBuilder(table){
    return `DELETE FROM ${table} WHERE ${table}.id = $${1} RETURNING id`
}

function paramsBuilder(requestBody, patternMatching = false, allowedArrayValue = false, excludedKeys = []) {
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
async function runQuery(query, params, pool, logging = true){
    try {
        if(logging) console.log(`Run Query : ${query}`)

        const result = await pool.query(query, params)

        if(logging) console.log(`Result : ${JSON.stringify(result.rows)}`)

        return result.rows

    } catch (error) {
        console.error(`Run Query Error : `, error)
        throw error
    }
}


module.exports = {
    init: (config) => {
        return { 
            runQuery: (query, params, pool) => runQuery(query, params, pool, config.logging),
            createBuilder, selectBuilder, joinBuilder, 
            whereBuilder, pagingBuilder, updateBuilder, 
            deleteBuilder, paramsBuilder
        }
    }
}