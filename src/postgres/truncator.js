async function getAllTable(pool, schema = 'public'){
    try {
        const result = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema=$1`, [schema])
        return result.rows.map(row => row.table_name)
    } catch (error) {
        console.error('Error fetching tables:', error)
        throw error
    }
}

async function runTruncator(pool, tables = []){
    try {
        let tb
        
        if(tables.length == 0){
            tb = await getAllTable(pool)
        }else {
            tb = tables
        }
        const query = `TRUNCATE TABLE ${tb.join(', ')} RESTART IDENTITY CASCADE`

        await pool.query(query)

        console.log(`Successfully truncate tables ${tb}`)
    } catch (error) {
        console.error('Error truncating tables:', error)
        throw error
    }
}

module.exports = {runTruncator, getAllTable}