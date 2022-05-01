/**
 * IndexedDB の Promise ラッパー
 */
class DBInterface {
  /**
   * データベースの接続情報を定義する
   * @param {string} name データベースの名称
   * @param {number} version データベースのバージョン
   */
  constructor(name, version) {
    /**
     * @type {string} データベースの名称
     */
    this.name = name;

    /**
     * @type {number} データベースのバージョン
     */
    this.version = version;

    /**
     * @type {?IDBDatabase} IDBDatabase のインスタンス
     */
    this.database = null;
  }

  /**
   * データベースに接続する
   * @param {function(IDBDatabase, IDBTransaction)} [upgradeNeededCallback] データベースの構造を定義するコールバック
   * @return {Promise<IDBDatabase>} IDBDatabase を含む Promise
   */
  connectDatabase(upgradeNeededCallback) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);

      if (upgradeNeededCallback) {
        request.addEventListener('upgradeneeded', (event) => {
          upgradeNeededCallback(event.target.result, event.target.transaction);
        });
      }

      request.addEventListener('success', (event) => {
        this.database = event.target.result;
        resolve(event.target.result);
      });

      request.addEventListener('error', (event) => {
        reject(event.target.error);
      });
    });
  }

  /**
   * データベースへの接続を閉じて削除する
   * @param {function} [blockedCallback] リクエストがブロックされた際に実行するコールバック
   * @return {Promise} Promise
   */
  deleteDatabase(blockedCallback) {
    return new Promise((resolve, reject) => {
      this.database.close();

      const request = indexedDB.deleteDatabase(this.name);

      if (blockedCallback) {
        request.addEventListener('blocked', () => {
          blockedCallback();
        });
      }

      request.addEventListener('success', () => {
        resolve();
      });

      request.addEventListener('error', (event) => {
        reject(event.target.error);
      });
    });
  }

  /**
   * レコードを挿入または更新する
   * @param {string} storeName オブジェクトストアの名称
   * @param {any} value 挿入または更新するレコード
   * @param {IDBValidKey} [key] 挿入または更新するレコードに対するキー
   * @return {Promise<object>} 挿入または更新したレコードを含む Promise
   */
  upsertRecord(storeName, value, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.put(value, key);

      let result = null;

      request.addEventListener('success', (event) => {
        const key = event.target.result;

        const keyPath = store.keyPath;
        const autoIncrement = store.autoIncrement;

        if (keyPath) {
          result = value;
          result[keyPath] = key;
        } else {
          result = { key, value };
        }
      });

      transaction.addEventListener('complete', () => {
        resolve(result);
      });

      transaction.addEventListener('abort', (event) => {
        reject(event.target.error);
      });

      transaction.addEventListener('error', (event) => {
        reject(event.target.error);
      });
    });
  }

  /**
   * レコードを削除する
   * @param {string} storeName オブジェクトストアの名称
   * @param {IDBValidKey} key 削除するレコードに対するキー
   * @return {Promise<IDBValidKey>} 削除したレコードに対するキーを含む Promise
   */
  deleteRecord(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      store.delete(key);

      transaction.addEventListener('complete', () => {
        resolve(key);
      });

      transaction.addEventListener('abort', (event) => {
        reject(event.target.error);
      });

      transaction.addEventListener('error', (event) => {
        reject(event.target.error);
      });
    });
  }

  /**
   * レコードを取得する
   * @param {string} storeName オブジェクトストアの名称
   * @param {IDBValidKey} key 取得するレコードに対するキー
   * @return {Promise<any} 取得したレコードを含む Promise
   */
  readRecord(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.database.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      let value = null;

      request.addEventListener('success', (event) => {
        value = event.target.result;
      });

      transaction.addEventListener('complete', () => {
        resolve(value);
      });

      transaction.addEventListener('error', (event) => {
        reject(event.target.error);
      });
    });
  }

  /**
   * すべてのレコードを取得する
   * @param {string} storeName オブジェクトストアの名称
   * @return {Promise<any[]>} 取得したレコードの配列を含む Promise
   */
  readAllRecords(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.database.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      let values = null;

      request.addEventListener('success', (event) => {
        values = event.target.result;
      });

      transaction.addEventListener('complete', () => {
        resolve(values);
      });

      transaction.addEventListener('error', (event) => {
        reject(event.target.error);
      });
    });
  }
}
