const migrations = [
    {
        tableName: "roles",
        timestamp: true,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true
            },
            {
                columnName: "name",
                dataType: "VARCHAR(50)",
                nullable: false,
                unique: true
            },
            {
                columnName: "description",
                dataType: "VARCHAR(255)",
                nullable: true
            }
        ]
        
    },
    {
        tableName: "users",
        timestamp: true,
        columns: [
            {
                columnName: "id",
                dataType: "INT",
                nullable: false,
                autoIncrement: true,
            },
            {
                columnName: "role_id",
                dataType: "INT",
                nullable: true,
                references: {table:'roles', key:'id'}
            },
            {
                columnName: "username",
                dataType: "VARCHAR(100)",
                nullable: false,
                unique: true
            },
            {
                columnName: "email",
                dataType: "VARCHAR(255)",
                nullable: false
            },
            {
                columnName: "password",
                dataType: "VARCHAR(255)",
                nullable: false
            },
            {
                columnName: "name",
                dataType: "VARCHAR(50)",
                nullable: true
            },
            {
                columnName: "phone",
                dataType: "VARCHAR(50)",
                nullable: true
            },
            {
                columnName: "address",
                dataType: "VARCHAR(100)",
                nullable: true
            },
            {
                columnName: "nik",
                dataType: "VARCHAR(30)",
                nullable: true
            },
            {
                columnName: "status",
                dataType: "ENUM('active', 'inactive', 'suspended')",
                nullable: false,
                default: "'active'"
            }
        ]
    }

]
const seeds = [
    {
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
    {
        table: 'users',
        seed: [
            {
                id: 1,
                role_id: 1,
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
]
const userModel = {
    table: 'users',
    includes: [
        'id','role_id','username', 'password','email', 
        'name', 'phone', 'address','nik', 'status'
    ],
    association: [
        {
            table: 'roles',
            references: 'roles.id',
            foreignKey: 'users.role_id',
            includes: ['name'],
            alias: {
                name: 'role'
            }
        }
    ]
}

module.exports = {
    migrations, seeds, userModel
}