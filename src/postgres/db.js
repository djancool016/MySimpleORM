const {Client, Pool} = require('pg')

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

module.exports = {poolConnector, dbConnector}