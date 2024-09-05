/**
 * Class for handling MYSQL pool connection
 */
class PoolManager {
    constructor(poolConnector, config) {
        this.pool = null
        this.poolConnector = poolConnector
        this.db_config = config.db_config
        this.pool_config = config.pool_config
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
    connect(){
        if(!this.pool){
            try {
                const {connection_limit, queue_limit} = this.pool_config
                this.pool = this.poolConnector(connection_limit, queue_limit, this.db_config)
                console.log("Successfully connected to pool")
                return this.pool
            } catch (error) {
                console.error("Error creating a connection pool", error)
                throw error
            }
        }
        return this.pool
    }
}

/**
 * Class for handling database connection
 */
class DatabaseManager {
    constructor(dbConnector, config){
        this.db = null
        this.dbConnector = dbConnector // this is a fuction to connect database
        this.db_config = config.db_config
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
                this.db = await this.dbConnector(this.db_config)
                console.log("Successfully connected to database")
                return this.db
            } catch (error) {
                throw error
            }
        }
        return this.db
    }
}

module.exports = {
    init: (config) => {

        const {poolConnector, dbConnector} = require(`./${config.db_system}`).init(config).db
        return {
            databaseManager: DatabaseManager.getInstance(dbConnector, config), 
            poolManager: PoolManager.getInstance(poolConnector, config)
        }
    }
}