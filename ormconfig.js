module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || 'location',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'mykick',
  entities: ['dist/**/entities/**.entity.js'],
  synchronize: false,
};
