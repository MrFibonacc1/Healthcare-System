const {Client} = require('pg')
require('dotenv').config();

const client = new Client({
    connectionString: process.env.POSTGRES_URL,
})

client.connect();

const executeQuery = async (query) => {
    try {
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};

module.exports = {
    executeQuery,
    client
};
