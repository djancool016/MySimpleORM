const {Client, Pool} = require('pg')

function createBuilder(table, requestBody){
    // extract keys and values from object data
    const keys = Object.keys(requestBody)

    // create placeholder for the values
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ')
    
    return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`
}
function selectBuilder(table, includes, alias, association){
    
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

    queries.push(selectQuery(table, includes, alias))

    if(association && Array.isArray(association) && association.length > 0){
        association.forEach( assoc => {
            const {table, includes, alias} = assoc
            queries.push(selectQuery(table, includes, alias))
        })
    }
    return `SELECT ${queries.join(', ')}`
}
function joinBuilder(association) {

    if (!association || association.length === 0) return ''

    return association.map(({ table, foreignKey, references, joinType }) =>{
        const join = joinType ? joinType : 'INNER JOIN'
        return `${join} ${table} ON ${foreignKey} = ${references}`
    }).join(' ')
    
}
function whereBuilder(table, includes, association, requestBody, patternMatching = false) {

    const includedKeys = []

    const operationBuilder = (value) => {
        if(Array.isArray(value)){
            const placeholder = value.map((_, index) => `$${index + 1}`).join(',')
            return `IN (${placeholder})`
        }else if(typeof value === 'string' && /^\d+(,\d+)*$/.test(value)){
            const placeholder = value.split(',').map((_, index) => `$${index + 1}`).join(', ')
            return `IN (${placeholder})`
        }else if(typeof value === 'string' && value.includes(',')){
            const placeholder = value.split(',').map((_, index) => `$${index + 1}`).join(', ')
            return `IN (${placeholder})`
        }else if(typeof value === 'string' && value.length > 2 && patternMatching){
            return `LIKE $1`
        }else{
            return `= $1`
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
    return `WHERE ${includedKeys.join(' AND ')}`
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

async function getAllTable(pool, schema = 'public'){
    try {
        const result = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema=$1`, [schema])
        return result.rows.map(row => row.table_name)
    } catch (error) {
        console.error('Error fetching tables:', error)
        throw error
    }
}

async function truncator(pool, tables = []){
    try {
        let tb
        
        if(tables.length == 0){
            tb = await getAllTable(pool)
        }else {
            tb = tables
        }
        const query = `TRUNCATE TABLE ${tb.join(', ')} RESTART IDENTITY CASCADE`

        await pool.query(query)

        console.log(`Successfully truncate tables ${tb}`)
    } catch (error) {
        console.error('Error truncating tables:', error)
        throw error
    }
}
function poolConnector(
    connectionLimit, 
    queueLimit,
    db_config,
){
    return new Pool({
        ...db_config,
        max: connectionLimit,
        idleTimeoutMillis: queueLimit
    })
}

async function dbConnector(db_config){
    const client = new Client(db_config)
    await client.connect()
    return client
}


module.exports = { 
    createBuilder, selectBuilder, joinBuilder, 
    whereBuilder, pagingBuilder, updateBuilder, 
    deleteBuilder, truncator, poolConnector, dbConnector
}