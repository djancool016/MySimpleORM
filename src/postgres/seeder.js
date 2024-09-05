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
        console.error('runSeed Error : ', error)
        throw error
    }
}
async function runSeeds(seeds = [], pool){
    try {
        if(!Array.isArray(seeds)) throw new Error('Invalid seeds data type, seeds must be an Array')
        if(seeds.length === 0) throw new Error('Empty Seeds Array')

        for(const seed of seeds){
            await runSeed(seed, pool)
            await updatePrimaryKeySequence(seed.table, 'id', pool)
        }
    } catch (error) {
        console.error('runSeeds Error : ', error)
        throw error
    }
}

async function updatePrimaryKeySequence(table, columnName, pool){
    try {
        const selectSequenceQuery = `SELECT pg_get_serial_sequence('${table}', '${columnName}');`

        const sequenceName = await pool.query(selectSequenceQuery)

        const name = sequenceName.rows[0].pg_get_serial_sequence

        const updateSequenceQuery = `SELECT setval('${name}', (SELECT COALESCE(MAX(${columnName}), 1) FROM ${table}) + 1);`
        
        await pool.query(updateSequenceQuery)

    } catch (error) {

        console.error('updatePrimaryKeySequence Error : ', error)

        throw error
    }
}

module.exports = {runSeed, runSeeds}