class Seeder {
    /**
     * 
     * @param {Object} seeder seeder contain table name and seed data {table, seed}
     * @param {Object} db database connection
     */
    static async #seedTable(seeder, db, parameterizedHandler){
        try {
            const {table, seed} = seeder

            if(!table){
                throw new Error('SEEDER_INVALID_TABLE_ERR')
            }
            if(!seed || !Array.isArray(seed) || seed.length < 1){
                throw new Error('SEEDER_INVALID_SEED_ERR')
            }

            // create bulk insert query
            const bulkInsertPromises = seed.map(async obj => {

                // extract keys and values from object data
                const keys = Object.keys(obj)
                const values = keys.map( key => obj[key])

                // create placeholder for the values
                const placeholders = keys.map((_, index) => parameterizedHandler(index + 1)).join(', ')

                // create insert query
                const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
                
                // start seeding
                await db.query(query, values)
            })

            // using Promise.all to reduce potential race condition
            await Promise.all(bulkInsertPromises)
            console.log(`Seeder successfully populate table ${table}`)

        } catch (error) {
            console.error(error.message)
            throw error
        }
    }
    /**
     * @param {Array<Object>} seeders seeder contain array of seeder
     * @param {Object} db database connection
     */
    static async seedTables(seeders = [], db, parameterizedHandler){
        try {
            if(!Array.isArray(seeders)) {
                throw new Error('INVALID_ARRAY_DATATYPE')
            }
            for(const seeder of seeders){
                await Seeder.#seedTable(seeder, db, parameterizedHandler)
            }
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }
}

function parameterizedHandler(paramIndex = 1, db_system){
    switch(db_system){
        case 'mysql':
            return '?'
        case 'postgres':
            return `$${paramIndex}`
        default:
            throw new Error('Invalid Database System')
    }
}

async function seedTables(db, tableList = [], seeds = {}, db_system) {
    try {
        let seedsToRun
    
        if(tableList.length > 0){
            // Create a lookup for seeds by table name
            const seedLookup = Object.entries(seeds).reduce((acc, [key, seed]) => {
                const tableName = key.replace('Seed', '').toLowerCase() // Assuming seed names match table names
                acc[tableName] = seed
                return acc
            }, {})

            // Filter and sort seeds based on tableList
            seedsToRun = tableList
                .map(tableName => seedLookup[tableName])
                .filter(Boolean) // Remove undefined values if any table names don't have corresponding seeds
        }else{
            seedsToRun = seeds
        }
        const arraySeeds = Object.values(seedsToRun)
        await Seeder.seedTables(arraySeeds, db, (index) => parameterizedHandler(index, db_system))
    } catch (error) {
        console.error(error)
        throw error
    }
}


/**
 * Provides a function to populate data into the database.
 * 
 * @param {Object} seeds - An object containing tables and their corresponding data to be populated into the database.
 * @param {Object} db - Database connection.
 * @param {String} db_system - The database system used. Default is 'postgres'.
 * @returns {Promise} - A promise that is resolved after the data population is complete.
 */
module.exports = seedTables