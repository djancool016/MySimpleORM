async function runSeed({table, seed}, pool, logging = true){
    try {
        const seedKey = seed.map(obj = Object.keys)
        let query = `INSERT INTO ${table} (${Object.keys(seed[0 ]).join(', ')}) VALUES `
        let param = []
        let counter = 1

        // Build the placeholders for each row
        const value = seed.map(obj => {
            const keys = Object.keys(obj)
            const placeholders = keys.map(() => `$${counter++}`).join(', ')
            param.push(...keys.map(key => obj[key]))
            return `(${placeholders})`
        });

        query += value.join(', ')
        
        if(logging) console.log(`Seed Query : ${stringLogger(query)}`)

        await pool.query(query, param)

        return table

    } catch (error) {
        console.error('runSeed Error : ', error)
        throw error
    }
}

async function runSeeds(seeds = [], pool, logging){
    try {
        if(!Array.isArray(seeds)) throw new Error('Invalid seeds data type, seeds must be an Array')
        if(seeds.length === 0) throw new Error('Empty Seeds Array')

        const successSeed = []

        for(const seed of seeds){
            successSeed.push(await runSeed(seed, pool, logging))
            await updatePrimaryKeySequence(seed.table, 'id', pool)
        }
        console.log(`Successfully seeding tables ${successSeed.join(', ')}`)
        
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

function stringLogger(string){
    console.log(string.length > 100 ? string.slice(0, 100) + '...' : string) 
}

module.exports = {runSeeds}