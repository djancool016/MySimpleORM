async function getAllTables(pool, schema = 'public'){
    try {
        const query = `SELECT table_name FROM information_schema.tables WHERE table_schema=$1`
   
        const params = [schema]

        const result = await pool.query(query, params)

        const resultMap = result.rows.map(row => row.table_name)

        return resultMap

    } catch (error) {
        console.error('Error fetching tables:', error)
        throw error
    }
}

async function checkTablesIsEmpty(pool, tables = []){
    try {
        // check each table if it's empty
        let filledTables = []

        for (const table of tables) {

            const query = `SELECT COUNT(*) FROM ${table}`

            const result = await pool.query(query)

            if (result.rows[0].count > 0) filledTables.push(table)
        }
        // returning list of filled tables
        return filledTables

    } catch (error) {
        console.error('Error checking tables:', error)
        throw error
    }
}

async function runTruncator(pool, tables = [], schema = 'public', logging = true){
    try {
        // table list
        const tb = tables.length == 0 ? await getAllTables(pool, schema) : tables
        
        // check if table empty
        const filledTables = await checkTablesIsEmpty(pool, tb)
        
        if(filledTables.length > 0){
            // define query
            const query = `TRUNCATE TABLE ${filledTables.join(', ')} RESTART IDENTITY CASCADE`

            if(logging) console.log(`Truncate Query : ${query}`)
            // start truncate
            await pool.query(query)

            console.log(`Successfully truncate tables ${filledTables}`)

            return true

        }else{
            console.log('Truncat aborted, all tables empty!')

            return false
        }

    } catch (error) {
        console.error('Error truncating tables:', error)
        throw error
    }
}

module.exports = {
    init: (config) => {
        return {
            runTruncator: (pool, tables = []) => runTruncator(pool, tables = [], config.schema, config.logging), 
            getAllTables: (pool) => getAllTables(pool, config.schema, config.logging)
        }
    }
}