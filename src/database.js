const mysql = require('mysql2/promise')
const {Client, Pool} = require('pg')

/**
 * Class for handling database connection
 */
class DatabaseManager {
    constructor(dbConnector, config){
        this.dbConnector = dbConnector // this is a fuction to connect database
        this.db = null
        this.db_config = config.db_config,
        this.db_system = config.db_system,
        this.logging = config.logging
    }
    static getInstance(dbConnector, config) {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager(dbConnector, config)
        }
        return DatabaseManager.instance
    }
    /**
     * @returns mysql database connection
     */
    async connect() {
        if(!this.db){
            try {
                this.db = await this.dbConnector(this.db_config, this.db_system)
                if(this.logging) console.log("Successfully connected to database")
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
                if(this.logging) console.log('Database connection closed.')

            } catch (error) {
                if(this.logging) console.error('Error closing database connection', error)
                throw error
            } finally {
                this.db = null // Set database to null after closing
            }
        } else {
            if(this.logging) console.warn('Database connection is already closed or was never initialized')
        }
    }
}

/**
 * Class for handling MYSQL pool connection
 */
class PoolManager {
    constructor(poolConnector, config) {
        this.pool = null
        this.poolConnector = poolConnector
        this.db_config = config.db_config
        this.db_system = config.db_system
        this.logging = config.logging
        this.pool_connection_limit = config.pool_connection_limit
        this.pool_queue_limit = config.pool_queue_limit
    }

    static getInstance(poolConnector, config) {
        if (!PoolManager.instance) {
            PoolManager.instance = new PoolManager(poolConnector, config)
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
    createPool(){
        if(!this.pool){
            try {
                this.pool = poolConnector(this.connectionLimit, this.queueLimit, this.db_system, this.db_config)
                return this.pool
            } catch (error) {
                if(this.logging) console.error("Error creating a connection pool", error)
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
                if(this.logging) console.log('Pool connection closed')
            } catch (error) {
                if(this.logging) console.error('Error closing pool connection', error)
                throw error
            } finally {
                this.pool = null // Set pool to null after closing
            }
        } else {
            if(this.logging) console.warn('Pool connection is already closed or was never initialized')
        }
    }
}

async function dbConnector(db_config, db_system){
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

function poolConnector(
    connectionLimit, 
    queueLimit,
    db_system,
    db_config,
){
    switch(db_system){
        case 'mysql':
            return mysql.createPool({
                ...db_config,
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


/**
 * Initializes the database instance using the init() method.
 * This method sets up the database connection and returns an object containing the database instance and connection pool.
 */
module.exports = {
    /**
    * Initializes the database and connection pool.
    * 
    * @param {Object} config - Database configuration object.
    * @param {Object} config.db_config - Database configuration.
    * @param {string} config.db_config.host - Database host.
    * @param {string} config.db_config.user - Database user.
    * @param {string} config.db_config.password - Database password.
    * @param {string} config.db_config.database - Database name.
    * @param {number} config.db_config.port - Database port.
    * @param {string} config.db_system - Database system (e.g. 'mysql', 'postgres').
    * @param {number} config.pool_connection_limit - Connection limit for the pool.
    * @param {number} config.pool_queue_limit - Queue limit for the pool.
    * @returns {Object} - An object containing the database instance and connection pool.
    */
    init: function (config) {
        const db = DatabaseManager.getInstance(dbConnector, config)
        const pool = PoolManager.getInstance(poolConnector, config)
        return {db, pool}
    }
}