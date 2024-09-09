/**
 * Creates an object representing a reference for use in a query.
 * 
 * @param {string} model - The name of the model table to be mapped.
 * @param {object} migrations - An object containing database migration information.
 * @param {object} [includesObj] - An object containing a list of columns to be included in the query for each table.
 * 
 * @returns {object} An object containing information about the table, included columns, and associations.
 */

function modelMapper(model = '', migrations, includesObj = {}) {
    const includes = includesObj[migrations[model].tableName] || migrations[model].columns.map(column => column.columnName)
    const association = Object.keys(includesObj).length > 0 ? migrations[model].columns
        .filter(column => column.references)
        .map(column => {
            const table = column.references.table
            const includes = includesObj[table] || []
            const alias = includes
                .filter(item => item.includes(':'))
                .reduce((acc, item) => {
                    const [key, alias] = item.split(':')
                    acc[key] = alias
                    return acc
                }, {})
            const association = column.association ? modelMapper(table, migrations, includesObj).association : []
            return {
                table,
                references: `${column.references.table}.${column.references.key}`,
                foreignKey: `${migrations[model].tableName}.${column.columnName}`,
                includes: includes.map(item => item.split(':')[0]),
                alias,
                association
            }
        }) : []
        if(!includesObj[migrations[model].tableName] && migrations[model].timestamp){
            includes.push('created_at', 'updated_at')
        }
    return {
        table: migrations[model].tableName,
        includes,
        association
    }
}

module.exports = modelMapper