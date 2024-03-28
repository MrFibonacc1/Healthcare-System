const {Client} = require('pg')

const client = new Client({
 
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
    executeQuery
};