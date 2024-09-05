async function runSeed({table, seed}, pool){
    try {
        // create bulk insert query
        const bulkInsertPromises = seed.map(async obj => {

            // extract keys and values from object data
            const keys = Object.keys(obj)

            // create placeholder for the values
            const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ')

            // create insert query
            const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`

            // create params
            const params = keys.map( key => obj[key])
            
            // start seeding
            await pool.query(query, params)
        })

        // using Promise.all to reduce potential race condition
        await Promise.all(bulkInsertPromises)

        console.log(`Seeder successfully populate table ${table}`)

    } catch (error) {
        console.error(error.message)
        throw error
    }
}
async function runSeeds(seeds = [], pool){
    try {
        if(!Array.isArray(seeds)) {
            throw new Error('INVALID_ARRAY_DATATYPE')
        }
        for(const seed of seeds){
            await runSeed(seed, pool)
            await updatePrimaryKeySequence(seed.table, 'id', pool)
        }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

async function updatePrimaryKeySequence(table, columnName, pool){
    try {
        const sequenceName = await pool.query(`SELECT pg_get_serial_sequence('${table}', '${columnName}');`)
        const name = sequenceName.rows[0].pg_get_serial_sequence
        const query = `SELECT setval('${name}', (SELECT COALESCE(MAX(${columnName}), 1) FROM ${table}) + 1);`
        
        await pool.query(query)

    } catch (error) {
        console.error(error.message)
        throw error
    }
}

module.exports = {runSeed, runSeeds}