const postgresBuilder = require('../src/dbmsBuilder/postgresBuilder')
const queryBuilder = require('../src/queryBuilder')

describe('testing new QueryBuilder', ()=>{
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
        ]
    }
    const query = queryBuilder(model, postgresBuilder)

    test('test CREATE query', () => {
        const requestBody = {
            id: 7654,
            roleId: 1,
            userName: 'TestUser1',
            password: '1234',
            email: 'email@gmail.com',
            name: 'DwiJ',
            phone: '+62123123123',
            address: 'Indonesia',
            nik: '1122334455'
        }
        const result = query.create(requestBody)
        console.log(result)
        expect(result).toBeDefined()
    })
    test('test FindByPk query', () => {
        const requestBody = {id: 1}
        const result = query.read(requestBody)
        console.log(result)
        expect(result).toBeDefined()
    })
})