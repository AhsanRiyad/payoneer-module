# steps to run the project
1. CREATE a .env file on root folder and COPY the content from .env.example
2. CREATE a database named escrow in your postgres server
3. UPDATE databse host, port number, username and password in the .env file
4. RUN npm install
5. RUN npm run dev

# commands
## escrow-backend
npm run dev
## create a new migration
npx knex migrate:make migration_name
## create a new migration with specific config
npx knex migrate:make migration_name --env=environment_name
## create a new migration with specific migration folder
npx knex migrate:make migration_name --migrations-directory=relative_path_of_folder
## to migrate and auto generate model type
npm run _db:migrate
## to rollback last migratiom
npx knex migrate:rollback
## to generate json schema of a table
npx ts-node -e 'require("./script/generate-schema.ts").generateFromTableName("table_name")'