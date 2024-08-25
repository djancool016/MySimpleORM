const QueryBuilder = require('../src/queryBuilder')

const model = {
    table: 'users',
    includes: [
        'id','roleId','username', 'password','email', 
        'name', 'phone', 'address','nik', 'status'
    ],
    association: [
        {
            table: 'roles',
            references: 'roles.id',
            foreignKey: 'users.roleId',
            includes: ['name'],
            alias: {
                name: 'role'
            }
        }
    ],
    db_system:'postgres'
}

const queryBuilder = new QueryBuilder(model)

describe('Test QueryBuilder Class', () => {
    test('Test create query', () => {
        const requestBody = {id: 1, username: 'admin'}
        const result = queryBuilder.create(requestBody)
        console.log(result)
        expect(result.query).toBeTruthy()
        expect(result.param).toBeTruthy()
    })
    test('Test readByPk query', () => {
        const requestBody = {id: 1}
        const result = queryBuilder.readByPk(requestBody)
        console.log(result)
        expect(result.query).toBeTruthy()
        expect(result.param).toBeTruthy()
    })

    test('Test readAll query', () => {
        const requestBody = {}
        const result = queryBuilder.readAll(requestBody)
        console.log(result)
        expect(result.query).toBeTruthy()
        expect(result.param).toBeTruthy()
    })

    test('Test readByKeys query', () => {
        const requestBody = {username: 'admin'}
        const result = queryBuilder.readByKeys(requestBody)
        console.log(result)
        expect(result.query).toBeTruthy()
        expect(result.param).toBeTruthy()
    })

    test('Test update query', () => {
        const requestBody = {id: 1, username: 'newAdmin'}
        const result = queryBuilder.update(requestBody)
        console.log(result)
        expect(result.query).toBeTruthy()
        expect(result.param).toBeTruthy()
    })

    test('Test delete query', () => {
        const requestBody = {id: 1}
        const result = queryBuilder.delete(requestBody)
        console.log(result)
        expect(result.query).toBeTruthy()
        expect(result.param).toBeTruthy()
    })
})