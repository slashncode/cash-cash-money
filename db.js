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
      userID INTEGER PRIMARY KEY AUTOINCREMENT, \
      username TEXT, \
      email TEXT UNIQUE, \
      hashed_password BLOB, \
      salt BLOB, \
      firstname TEXT, \
      lastname TEXT, \
      userrole TEXT \
      )'
).run();

// create entries table if it doesn't exist yet
bdb.prepare(
    'CREATE TABLE IF NOT EXISTS entries ( \
      entryID INTEGER PRIMARY KEY AUTOINCREMENT, \
      entry_userID INTEGER NOT NULL, \
      entry_name TEXT, \
      entry_date DATE, \
      entry_value FLOAT, \
      entry_tags TEXT, \
      FOREIGN KEY(entry_userID) REFERENCES users(userID)  \
      )'
).run();

// create an initial user (user: admin, email: admin@cashcashmoney.de, password: root)
// use a randomly generated 'salt' for en-/decoding the password
// password will be with node.js' crypto-function
// pbkdf2Sync -> hashes the given string with the algorithm "sha256" 310000x times
// with the given salt and is 32 characters long
const salt = crypto.randomBytes(16);
bdb.prepare(
    'INSERT OR IGNORE INTO users (username, email, hashed_password, salt, firstname, lastname, userrole) VALUES (?, ?, ?, ?, ?, ?, ?)'
).run([
    'admin',
    'admin@cashcashmoney.de',
    crypto.pbkdf2Sync('root', salt, 310000, 32, 'sha256'),
    salt,
    'Admin',
    'Mr. CashCashMoney',
    'admin',
]);

bdb.prepare(
    'INSERT OR IGNORE INTO users (username, email, hashed_password, salt, firstname, lastname, userrole) VALUES (?, ?, ?, ?, ?, ?, ?)'
).run([
    'test',
    'test@cashcashmoney.de',
    crypto.pbkdf2Sync('root', salt, 310000, 32, 'sha256'),
    salt,
    'Test',
    'Tester',
    'user',
]);

function addEntry(
    entryID,
    entry_name,
    entry_date,
    entry_tags,
    entry_value,
    entry_userID
) {
    bdb.prepare(
        'INSERT OR IGNORE INTO entries (entryID, entry_name, entry_date, entry_tags, entry_value, entry_userID) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
        entryID,
        entry_name,
        entry_date,
        entry_tags,
        entry_value,
        entry_userID
    );
}

addEntry(1, 'Lidl Einkauf', '2022-05-01', 'Einkauf', '-13.50', 1);
addEntry(2, 'Eventim Rückzahlung', '2022-05-01', 'Konzerte', '13.98', 1);
addEntry(3, 'Rewe Einkauf', '2022-05-02', 'Einkauf', '-15', 1);
addEntry(4, 'Gehalt', '2022-05-28', 'Gehalt', '1400', 1);
addEntry(5, 'Gehalt', '2022-06-28', 'Gehalt', '1500', 1);
addEntry(6, 'Gehalt', '2022-02-28', 'Gehalt', '1500', 1);

module.exports = bdb;
