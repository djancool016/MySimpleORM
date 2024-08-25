const mysql = require('mysql2/promise')
const {Client, Pool} = require('pg')
const {
    db_config, 
    db_system, 
    logging, 
    pool_connection_limit, 
    pool_queue_limit
} = require('../config')

/**
 * Class for handling database connection
 */
class DatabaseManager {
    constructor(dbConnector){
        this.dbConnector = dbConnector // this is a fuction to connect database
        this.db = null
    }
    static getInstance(dbConnector) {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager(dbConnector)
        }
        return DatabaseManager.instance
    }
    /**
     * @returns mysql database connection
     */
    async connect() {
        if(!this.db){
            try {
                this.db = await this.dbConnector()
                if(logging) console.log("Successfully connected to database")
                return this.db
            } catch (error) {
                throw error
            }
        }
        return this.db
    }
    /**
     * Close database connection
     */
    async end(){
        if(this.db){
            try {
                await this.db.end()
                if(logging) console.log('Database connection closed.')

            } catch (error) {
                if(logging) console.error('Error closing database connection', error)
                throw error
            } finally {
                this.db = null // Set database to null after closing
            }
        } else {
            if(logging) console.warn('Database connection is already closed or was never initialized')
        }
    }
}

/**
 * Class for handling MYSQL pool connection
 */
class PoolManager {
    constructor(poolConnector) {
        this.pool = null
        this.poolConnector = poolConnector
    }

    static getInstance(poolConnector) {
        if (!PoolManager.instance) {
            PoolManager.instance = new PoolManager(poolConnector)
        }
        return PoolManager.instance
    }

    /**
     * 
     * @param {Boolean} waitForConnections - Determines the pool's action when no connections are available and the limit has been reached.
     * @param {Number} connectionLimit - The maximum number of connections to create at once. (Default: 10)
     * @param {Number} queueLimit - The maximum number of connection requests the pool will queue before returning an error. (Default: 0)
     * @returns - Mysql pool connection
     */
    createPool(
        waitForConnections = true,
        connectionLimit = 10,
        queueLimit = 0
    ){
        if(!this.pool){
            try {
                this.pool = poolConnector()
                return this.pool
            } catch (error) {
                if(logging) console.error("Error creating a connection pool", error)
                throw error
            }
        }
    }
    /**
     * Close pool connection
     */
    async end(){
        if (this.pool){
            try {
                await this.pool.end()
                if(logging) console.log('Pool connection closed')
            } catch (error) {
                if(logging) console.error('Error closing pool connection', error)
                throw error
            } finally {
                this.pool = null // Set pool to null after closing
            }
        } else {
            if(logging) console.warn('Pool connection is already closed or was never initialized')
        }
    }
}

async function dbConnector(){
    switch(db_system){
        case 'mysql':
            return await mysql.createConnection(db_config)
        case 'postgres':
            const client = new Client(db_config)
            await client.connect()
            return client
        default:
            throw new Error('Unknown Database System')
    }
}

function poolConnector(waitForConnections = true, connectionLimit = pool_connection_limit, queueLimit = pool_queue_limit){

    switch(db_system){
        case 'mysql':
            return mysql.createPool({
                ...db_config,
                waitForConnections,
                connectionLimit,
                queueLimit
            })
        case 'postgres':
            return new Pool({
                ...db_config,
                max: connectionLimit,
                idleTimeoutMillis: queueLimit
            })
        default:
            throw new Error('Unknown Database System')
    }
}

module.exports = {
    init: function () {
        const db = DatabaseManager.getInstance(dbConnector)
        const pool = PoolManager.getInstance(poolConnector)
        return {db, pool}
    }
}