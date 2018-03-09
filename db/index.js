'use strict'

const pg = require('pg');
const postgresUrl = 'postgres://localhost/twitterDB';
const client = new pg.Client(postgresUrl);

client.connect();

module.exports = client;
