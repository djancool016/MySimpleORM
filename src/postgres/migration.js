class MigrationQueryBuilder {
    constructor({column, tableName, timestamp}){
        this.query = ''
        this.ts = timestamp
        this.tableName = tableName
        this.column = column
    }
    get columnName(){
        this.query += `"${this.column.columnName}" `
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
        const createdAt = 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        const updatedAt = `updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP `
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

async function createEnumDatatype(pool, tableName, columns){
    try {
        for(const column of columns){
            const{ columnName, dataType } = column
            if(typeof dataType == 'string' && dataType.startsWith("ENUM(")){
                const enumValues = dataType
                    .substring(5, dataType.length - 1) // Remove "ENUM(" and the trailing ")"
                    .split(",") // Split by comma to get individual values
                    .map(value => value.trim().replace(/'/g, "")) // Trim whitespace and remove single quotes
                
                const query = `DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${tableName}_${columnName}') THEN
                        CREATE TYPE ${tableName}_${columnName} AS ENUM (${enumValues.map(value => `'${value}'`).join(", ")});
                    END IF;
                END
                $$;
                `
                await pool.query(query)
            }
        }
    } catch (error) {
        console.error(error)
        throw error
    }
}

function migrationQuery({tableName, timestamp, columns}){
    
    if(timestamp) columns.push({timestamp: true})

    const fieldQuery = columns.map(column => {
        return new MigrationQueryBuilder({tableName, timestamp, column}).build
    }).join(', ')

    return `CREATE TABLE IF NOT EXISTS ${tableName} (${fieldQuery})`
}

async function runMigration({tableName, timestamp, columns}, pool){
    // create postgres enum datatype if columns has ENUM data type
    await createEnumDatatype(pool, tableName, columns)

    //get migration query
    const query = migrationQuery({tableName, timestamp, columns})
    console.log(query)
    //run migration
    await pool.query(query)
}

async function runMigrations(migrations = [], pool){
    return migrations.forEach(async migration => {
        await runMigration(migration, pool)
    })
}

module.exports = {runMigration, runMigrations}