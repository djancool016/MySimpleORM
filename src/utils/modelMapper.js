/**
 * Creates an object representing a reference for use in a query.
 * 
 * @param {string} model - The name of the model table to be mapped.
 * @param {object} migrations - An object containing database migration information.
 * @param {object} [includeObj] - An object containing a list of columns to be included in the query for each table.
 * 
 * @returns {object} An object containing information about the table, included columns, and associations.
 */

function modelMapper(model = '', migrations, includeObj = {}) {

    const includes = includeObj[migrations[model].tableName] || migrations[model].columns.map(column => column.columnName)

    const associationBuilder = (tableName) => {
        return migrations[tableName].columns
            .filter(column => column.references)
            .map(column => {
                const table = column.references.table
                const includes = includeObj[table] || []
                const alias = includes
                    .filter(item => item.includes(':'))
                    .reduce((acc, item) => {
                        const [key, alias] = item.split(':')
                        acc[key] = alias
                        return acc
                    }, {})
                const association = column.references ? associationBuilder(table) : []
                return {
                    table,
                    references: `${column.references.table}.${column.references.key}`,
                    foreignKey: `${migrations[tableName].tableName}.${column.columnName}`,
                    includes: includes.map(item => item.split(':')[0]),
                    alias,
                    association
                }
            })
    }
    const includesReferences = () => {
        const ref = (tableName) => migrations[tableName].columns.filter(column => column.references).map(column => column.references)
        
        return Object.keys(includeObj).flatMap(tableName => {
            if (tableName != model && containsSubset(ref(tableName), ref(model))) {
                return migrations[model].columns
                    .filter(column => column.references)
                    .map(column => {
                        const table = tableName
                        const includes = includeObj[table] || []
                        const alias = includes
                            .filter(item => item.includes(':'))
                            .reduce((acc, item) => {
                                const [key, alias] = item.split(':')
                                acc[key] = alias
                                return acc
                            }, {})
                        const association = column.references ? associationBuilder(table) : []
                        association.forEach((assoc, index) => {
                            if(ref(model).some(({table, key}) => assoc.table === table )){
                                association.splice(index, 1)
                            }
                        })
                        return {
                            table,
                            references: `${tableName}.${column.columnName}`,
                            foreignKey: `${model}.${column.columnName}`,
                            includes: includes.map(item => item.split(':')[0]),
                            alias,
                            association
                        }
                    })
            }
            return null  // To avoid returning undefined if the condition is not met
        }).filter(Boolean)  // Removes any null values
    }

    const association = Object.keys(includeObj).length > 0 ? associationBuilder(model).concat(...includesReferences()) : []

    // push includeReferences to association

    if(!includeObj[migrations[model].tableName] && migrations[model].timestamp){
        includes.push('created_at', 'updated_at')
    }
    return {
        table: migrations[model].tableName,
        includes,
        association
    }
}

function isEqual(obj1, obj2) {
    return Object.keys(obj1).length === Object.keys(obj2).length &&
           Object.keys(obj1).every(key => obj1[key] === obj2[key])
}

function containsSubset(mainArray, subsetArray) {
    return subsetArray.every(subsetItem =>
        mainArray.some(mainItem => isEqual(mainItem, subsetItem))
    )
}

module.exports = modelMapper