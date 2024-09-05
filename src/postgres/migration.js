class CreateTableQueryBuilder {
    constructor({column, tableName, timestamp}){
        this.query = ''
        this.ts = timestamp
        this.tableName = tableName
        this.column = column
    }
    get columnName(){
        this.query += `${this.column.columnName} `
        return this
    }
    get dataType(){
        let dt = this.column.dataType
        if(typeof dt == 'string' && dt.startsWith("ENUM(")){
            dt = `${this.tableName}_${this.column.columnName}`
        }
        this.query += this.column.autoIncrement ? '' : `${dt} `
        return this
    }
    get nullable(){
        this.query += this.column.nullable || this.column.autoIncrement ? '' : 'NOT NULL '
        return this
    }
    get unique(){
        this.query += this.column.unique ? 'UNIQUE ' : ''
        return this
    }
    get autoIncrement(){
        this.query += this.column.autoIncrement ? 'SERIAL PRIMARY KEY ' : ''
        return this
    }
    get references(){
        const constrait = `, CONSTRAINT fk_${this.tableName}_${this.column.references.table} `
        const foreignKey = `FOREIGN KEY (${this.column.columnName}) `
        const references = `REFERENCES ${this.column.references.table}(${this.column.references.key}) `
        this.query += constrait + foreignKey + references
        return this
    }
    get default(){
        this.query += `DEFAULT ${this.column.default}`
        return this
    }
    get timestamp(){
        const createdAt = 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        const updatedAt = `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP `
        this.query += `${createdAt}, ${updatedAt}`
        return this
    }
    get build(){
        Object.keys(this.column).forEach(key => {
            this[key]
        })
        return this.query.trim()
    }
}

class MigrationQueryBuilder {
    constructor(migrations = [], tableBuilder = CreateTableQueryBuilder){
        this.query = ''
        this.tableBuilder = tableBuilder
        this.migrations = migrations
    }
    triggerFunctionQuery(trigger = 'update', column = 'updated_at'){
        this.query += `CREATE OR REPLACE FUNCTION ${trigger}_${column}_column()
            RETURNS TRIGGER AS $$
            BEGIN
            NEW.${column} = NOW();
            RETURN NEW;
            END; $$ LANGUAGE 'plpgsql'; `.replace(/\s+/g, ' ').trim()
        return this
    }
    dropTriggerQuery(tableName, trigger = 'update', column = 'updated_at'){
        this.query += ` DROP TRIGGER IF EXISTS ${trigger}_${tableName}_${column} ON ${tableName}; `
        return this
    }
    createTriggerQuery(tableName, trigger = 'update', column = 'updated_at'){
        this.query += `CREATE TRIGGER ${trigger}_${tableName}_${column}
            BEFORE UPDATE ON ${tableName}
            FOR EACH ROW
            EXECUTE PROCEDURE ${trigger}_${column}_column(); 
        `.replace(/\s+/g, ' ').trim()
        return this
    }
    createEnumQuery({tableName, columns}){
        for(const column of columns){
            const{ columnName, dataType } = column
            if(typeof dataType == 'string' && dataType.startsWith("ENUM(")){
                const enumValues = dataType
                    .substring(5, dataType.length - 1) // Remove "ENUM(" and the trailing ")"
                    .split(",") // Split by comma to get individual values
                    .map(value => value.trim().replace(/'/g, "")) // Trim whitespace and remove single quotes
                
                this.query += `DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${tableName}_${columnName}') THEN
                    CREATE TYPE ${tableName}_${columnName} AS ENUM (${enumValues.map(value => `'${value}'`).join(", ")});
                    END IF;
                END
                $$; `.replace(/\s+/g, ' ').trim()
            }
        }
        return this
    }
    get build(){
        // create trigger function
        this.triggerFunctionQuery()

        // iterate migrations to create tableQuery and trigger for table
        this.migrations.forEach(migration => {
            const {tableName, timestamp, columns} = migration

            if(timestamp) columns.push({timestamp: true})

            this.createEnumQuery(migration)

            const tableQuery = columns.map(column => {
                return new this.tableBuilder({column, tableName, timestamp}).build
            }).join(', ')

            this.query += ` CREATE TABLE IF NOT EXISTS ${tableName} (${tableQuery}); `
            
            if(timestamp){
                this.dropTriggerQuery(tableName)
                this.createTriggerQuery(tableName)
            }
        })
        return this.query.trim()
    }
}

async function runMigrations(migrations = [], pool){
    try {
        
        if(migrations.length === 0) throw new Error('Migration Aborted, Empty migrations data!')

        const query = new MigrationQueryBuilder(migrations).build

        console.log(`Migration Query: ${query}`)

        await pool.query(query)

    } catch (error) {
        console.error(`Run Migrations Failed :`, error)
        throw error
    }
}

module.exports = { runMigrations }