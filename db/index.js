'use strict'

const pg = require('pg');
const postgresUrl = 'postgress://localhost/tweetDB';
const client = new pg.Client(postgresUrl);

client.connect();

module.exports = client;
