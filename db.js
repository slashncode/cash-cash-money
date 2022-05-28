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
    crypto.pbkdf2Sync('test', salt, 310000, 32, 'sha256'),
    salt,
    'Tester',
    'McTesty',
    'testuser',
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

addEntry(1, 'Konzert', '2022-03-05', 'Konzerte', '-28.50', 1);
addEntry(2, 'Einkauf Lidl', '2022-03-06', 'Einkauf', '-12.68', 1);
addEntry(3, 'Mensa', '2022-03-07', 'Uni', '-1.80', 1);
addEntry(4, 'Gehalt', '2022-03-28', 'Gehalt', '860', 1);
addEntry(5, 'Amazon', '2022-04-03', 'Shoppen', '-860', 1);
addEntry(6, 'Einkauf Rewe', '2022-04-08', 'Einkauf', '-10.62', 1);
addEntry(7, 'Einkauf Edeka', '2022-04-14', 'Einkauf', '-17.22', 1);
addEntry(8, 'Zugtickets', '2022-04-18', 'Bahn', '-25.00', 1);
addEntry(9, 'Rückzahlung Amazon', '2022-04-24', 'Shoppen', '860', 1);
addEntry(10, 'Gehalt', '2022-04-28', 'Gehalt', '860', 1);
addEntry(11, 'Einkauf Lidl', '2022-05-03', 'Einkauf', '-23.34', 1);
addEntry(12, 'Einkauf Edeka', '2022-05-08', 'Einkauf', '-9.52', 1);
addEntry(13, 'Konzert', '2022-05-14', 'Konzerte', '-24.50', 1);
addEntry(14, 'Konzert Rückzahlung', '2022-05-19', 'Konzerte', '20.50', 1);
addEntry(15, 'Gehalt', '2022-05-28', 'Gehalt', '860', 1);
addEntry(16, 'Pizza bestellen', '2022-06-02', 'Essen', '-12.30', 1);

addEntry(17, 'Konzert', '2022-03-05', 'Konzerte', '-28.50', 2);
addEntry(18, 'Einkauf Lidl', '2022-03-06', 'Einkauf', '-12.68', 2);
addEntry(19, 'Mensa', '2022-03-07', 'Uni', '-1.80', 2);
addEntry(20, 'Gehalt', '2022-03-28', 'Gehalt', '860', 2);
addEntry(21, 'Amazon', '2022-04-03', 'Shoppen', '-860', 2);
addEntry(22, 'Einkauf Rewe', '2022-04-08', 'Einkauf', '-10.62', 2);
addEntry(23, 'Einkauf Edeka', '2022-04-14', 'Einkauf', '-17.22', 2);
addEntry(24, 'Zugtickets', '2022-04-18', 'Bahn', '-25.00', 2);
addEntry(25, 'Rückzahlung Amazon', '2022-04-24', 'Shoppen', '860', 2);
addEntry(26, 'Gehalt', '2022-04-28', 'Gehalt', '860', 2);
addEntry(27, 'Einkauf Lidl', '2022-05-03', 'Einkauf', '-23.34', 2);
addEntry(28, 'Einkauf Edeka', '2022-05-08', 'Einkauf', '-9.52', 2);
addEntry(29, 'Konzert', '2022-05-14', 'Konzerte', '-24.50', 2);
addEntry(30, 'Konzert Rückzahlung', '2022-05-19', 'Konzerte', '20.50', 2);
addEntry(31, 'Gehalt', '2022-05-28', 'Gehalt', '860', 2);
addEntry(32, 'Pizza bestellen', '2022-06-02', 'Essen', '-12.30', 2);

module.exports = bdb;
