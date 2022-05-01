'use strict';

importScripts('/notes/scripts/modules/database.js');

// データベースの定義情報
const DB_VERSION = 1;
const DB_NAME = 'notes';
const DB_STORE_NAME = 'notes';
const DB_INDEX_NAME = 'title';
const DB_KEY_PATH_NAME = 'id';

const DB_INTERFACE = new DBInterface(DB_NAME, DB_VERSION);

// データベースの構造を定義して接続する
DB_INTERFACE.connectDatabase((database) => {
  database
    .createObjectStore(DB_STORE_NAME, { keyPath: DB_KEY_PATH_NAME, autoIncrement: true })
    .createIndex(DB_INDEX_NAME, DB_INDEX_NAME);
})
  .then(() => postMessage({ command: 'connectDatabase' }))
  .catch((error) => postMessage({ command: 'connectDatabase', error }));

// CRUD リクエストを処理する
addEventListener('message', (event) => {
  let command = event.data.command;
  let argument = event.data.argument;
  let action = event.data.action;

  switch (command) {
    case 'upsertRecord':
      DB_INTERFACE.upsertRecord(DB_STORE_NAME, argument)
        .then((data) => postMessage({ command, data }))
        .catch((error) => postMessage({ command, error }));
      break;
    case 'deleteRecord':
      DB_INTERFACE.deleteRecord(DB_STORE_NAME, argument)
        .then((data) => postMessage({ command, data }))
        .catch((error) => postMessage({ command, error }));
      break;
    case 'readRecord':
      DB_INTERFACE.readRecord(DB_STORE_NAME, argument)
        .then((data) => postMessage({ command, data, action }))
        .catch((error) => postMessage({ command, error }));
      break;
    case 'readAllRecords':
      DB_INTERFACE.readAllRecords(DB_STORE_NAME)
        .then((data) => postMessage({ command, data }))
        .catch((error) => postMessage({ command, error }));
      break;
    default:
      console.warn('Unknown command:', command);
      break;
  }
});
