const mkdirp = require('mkdirp');
const crypto = require('crypto');
const bettersqlite3 = require('better-sqlite3');

// Create the directories var and db if they do not exist yet
mkdirp.sync('var/db');

// initialize new bettersqlite3 database
const bdb = new bettersqlite3('var/db/data.db', { verbose: console.log });

// create users table if it doesn't exist yet
bdb.prepare(
    'CREATE TABLE IF NOT EXISTS users ( \
      username TEXT, \
      email TEXT UNIQUE, \
      hashed_password BLOB, \
      salt BLOB, \
      firstname TEXT, \
      lastname TEXT \
      )'
).run();

// create an initial user (email: admin@cashcashmoney.de, password: root)
// use a randomly generated 'salt' for en-/decoding the password
// password will be with node.js' crypto-function
// pbkdf2Sync -> hashes the given string with the algorithm "sha256" 310000x times
// with the given salt and is 32 characters long
const salt = crypto.randomBytes(16);
bdb.prepare(
    'INSERT OR IGNORE INTO users (username, email, hashed_password, salt, firstname, lastname) VALUES (?, ?, ?, ?, ?, ?)'
).run([
    'admin',
    'admin@cashcashmoney.de',
    crypto.pbkdf2Sync('root', salt, 310000, 32, 'sha256'),
    salt,
    'Admin',
    'Mr. CashCashMoney',
]);

module.exports = bdb;
