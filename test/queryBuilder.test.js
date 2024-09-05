const config = require('../config')
const {builder: {queryBuilder}} = require('../src').init(config)
const {userModel} = require('./dataSamples')

describe('testing new QueryBuilder', ()=>{
    const query = queryBuilder(userModel)

    test('test CREATE query', () => {
        const requestBody = {
            id: 7654,
            role_id: 1,
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