/**
 * @returns Turncate or delete all data on database
 */
async function truncator(database, truncateTables = [], db_system = 'postgres'){
    try {
        
        switch(db_system){
            case 'mysql':
                await mysqlTruncator(database, truncateTables)
                break
            case 'postgres':
                await postgesTruncator(database, truncateTables)
                break
            default:
                throw new Error('Invalid Database System')
        }

        console.log('All tables have been truncated.')

    } catch (error) {
        console.error(error)
        throw error
    }
}

async function mysqlTruncator(database, truncateTables = []){

    let selectTables
    
    if(truncateTables.length > 0 && truncateTables.every(item => typeof item === 'string')){
        selectTables = truncateTables
    }else if(truncateTables.length === 0){
        const [tables] = await database.query('SHOW TABLES')
        selectTables = tables.map(table => table[Object.keys(table)[0]])
    }else{
        throw new Error ('Invalid table name format')
    }
    
    if(selectTables){
        return await database.query(`
            SET FOREIGN_KEY_CHECKS = 0; 
            ${selectTables.map(table => `TRUNCATE TABLE ${table};`).join('\n    ')}
            SET FOREIGN_KEY_CHECKS = 1;
        `)
    }else{
        console.log('0 tables found')
    }
    
}

async function postgesTruncator(database, truncateTables = []){

    let tables

    if(truncateTables.length > 0 && truncateTables.every(item => typeof item === 'string')){
        tables = truncateTables.join(', ')
    }else if(truncateTables.length === 0){
        const res = await database.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
        tables = res.rows.map(row => row.table_name).join(', ')
    }else{
        throw new Error ('Invalid table name format')
    }

    if(tables){
        return await database.query(`
            TRUNCATE TABLE ${tables} RESTART IDENTITY;           
        `)
    }else{
        console.log('0 tables found')
    }
}

module.exports = truncator