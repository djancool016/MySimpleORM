async function getAllTable(pool, schema = 'public'){
    try {
        const result = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema=$1`, [schema])
        return result.rows.map(row => row.table_name)
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

            const result = await pool.query(`SELECT COUNT(*) FROM ${table}`)

            if (result.rows[0].count > 0) filledTables.push(table)
        }
        // returning list of filled tables
        return filledTables

    } catch (error) {
        console.error('Error checking tables:', error)
        throw error
    }
}

async function runTruncator(pool, tables = []){
    try {
        // table list
        const tb = tables.length == 0 ? await getAllTable(pool) : tables
        
        // check if table empty
        const filledTables = await checkTablesIsEmpty(pool, tb)
        
        if(filledTables.length > 0){
            // define query
            const query = `TRUNCATE TABLE ${filledTables.join(', ')} RESTART IDENTITY CASCADE`

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

module.exports = {runTruncator, getAllTable}