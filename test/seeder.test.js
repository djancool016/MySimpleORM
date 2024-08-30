const Database = require('../src/database')
const truncator = require('../src/truncator')
const Seeder = require('../src/seeder')
const config = require('../config')

const seeder = {
    rolesSeed: {
        table: 'roles',
        seed: [
            {
                id: 1,
                name: "Admin",
                description: "Full access to system features."
            },
            {
                id: 2,
                name: "Manager",
                description: "Supervise loan operations."
            }
        ]
    },
    usersSeed: {
        table: 'users',
        seed: [
            {
                id: 1,
                roleId: 1,
                username: 'admin',
                password: '$2b$10$h6Uo0u07tzgVf14jTsIPHOskqDUdDwLsZeMFCxX5rm8BsEJTePZd.',
                email: 'admin@Email.com',
                name: 'Dwi Julianto',
                phone: '213546879213',
                address: 'Semarang, Indonesia',
                nik: '7722323656989'
            }
        ]
    }
}

describe('Testing database seeder', () => {

    let database
    const tbl = ["users", "roles"]

    beforeAll(async() => {
        const {db, pool} = Database.init(config)
        database = await db.connect()

        // truncate table
        await truncator(database, tbl, config.db_system)
    })

    test('Test seeding', async () => {
        await Seeder(database, tbl.reverse(), seeder, 'postgres')
        const roles = await database.query('SELECT * FROM roles')
        const users = await database.query('SELECT * FROM users')

        expect(roles.rows.length).toBe(2)
        expect(users.rows.length).toBe(1)
        expect(roles.rows[0].name).toBe("Admin")
        expect(users.rows[0].name).toBe("Dwi Julianto")
    })

    afterAll(async() => {
        database.end()
    })
})
