(() => {
  'use strict';

  // ------------------------------
  //          DOM 要素取得
  // ------------------------------

  // ナビゲーション
  const createButton = document.getElementById('create-button');

  // 一覧表示エリア
  const cardList = document.getElementById('card-list');

  // 編集モーダル
  const editModal = document.getElementById('edit-modal');
  const editModalTitle = document.getElementById('edit-modal-title');

  const metadata = document.getElementById('metadata');

  const titleInput = document.getElementById('title-input');
  const textEditor = document.getElementById('rich-text-editor');

  const saveButton = document.getElementById('save-button');
  const saveCopyAsButton = document.getElementById('save-copy-as-button');

  // 詳細表示モーダル
  const detailModal = document.getElementById('detail-modal');
  const detailModalTitle = document.getElementById('detail-modal-title');
  const detailModalBody = document.getElementById('detail-modal-body');

  const writeDate = document.getElementById('write-date');

  const editButton = document.getElementById('edit-button');
  const deleteButton = document.getElementById('delete-button');

  // ------------------------------
  //          メインの処理
  // ------------------------------

  const worker = new Worker('/notes/scripts/workers/worker.js');

  // CRUD リクエストの結果を処理する
  worker.addEventListener('message', (event) => {
    const command = event.data.command;
    const action = event.data.action;
    const error = event.data.error;
    const data = event.data.data;

    switch (command) {
      case 'connectDatabase':
        onConnected(error);
        break;
      case 'upsertRecord':
        onUpserted(error, data);
        break;
      case 'deleteRecord':
        onDeleted(error, data);
        break;
      case 'readRecord':
        onRead(error, data, action);
        break;
      case 'readAllRecords':
        onReadAll(error, data);
        break;
      default:
        console.warn('Unknown command:', command);
        break;
    }
  });

  /**
   * ワーカーにコマンドを送信する
   * @param {string} command CRUD コマンド
   * @param {number | object} [argument] CRUD コマンドの引数
   * @param {string} [action] CRUD 処理後に実行するアクション
   */
  function execCommand(command, argument, action) {
    worker.postMessage({ command, argument, action });
  }

  /**
   * 汎用のエラーハンドラ
   * @param {Error} error エラーオブジェクト
   */
  function errorHandler(error) {
    if (error.name === 'QuotaExceededError') alert('データベースの空き容量がありません');
    else console.error(error.name, error.message);
  }

  /**
   * データベースに接続した後に呼び出される関数
   * @param {Error | null} error 処理が成功した場合は null
   */
  function onConnected(error) {
    if (error) errorHandler(error);
    else execCommand('readAllRecords');
  }

  /**
   * データベースにレコードを保存した後に呼び出される関数
   * @param {Error | null} error 処理が成功した場合は null
   * @param {object} record レコード
   * @param {number} record.id キー
   * @param {string} record.title タイトル
   * @param {string} record.content コンテンツ
   * @param {number} record.createdAt 作成日時
   * @param {number} record.updatedAt 更新日時
   */
  function onUpserted(error, record) {
    if (error) {
      errorHandler(error);
    } else {
      addCard([record]);
      if (window.Notification && Notification.permission === 'granted') {
        const notification = new Notification(record.title, { body: record.content.textContent });
        notification.addEventListener('click', (event) => {
          execCommand('readRecord', record.id, 'view');
          event.currentTarget.close();
        });
      }
    }
  }

  /**
   * データベースからレコードを削除した後に呼び出される関数
   * @param {Error | null} error 処理が成功した場合は null
   * @param {number} id レコード ID
   */
  function onDeleted(error, id) {
    if (error) errorHandler(error);
    else deleteCard(id);
  }

  /**
   * データベースからレコードを取得した後に呼び出される関数
   * @param {Error | null} error 処理が成功した場合は null
   * @param {object} record レコード
   * @param {number} record.id キー
   * @param {string} record.title タイトル
   * @param {string} record.content コンテンツ
   * @param {number} record.createdAt 作成日時
   * @param {number} record.updatedAt 更新日時
   * @param {string} action アクション
   */
  function onRead(error, record, action) {
    if (error) {
      errorHandler(error);
    } else {
      if (action === 'edit') edit(record);
      else if (action === 'view') view(record);
    }
  }

  /**
   * データベースからすべてのレコードを取得した後に呼び出される関数
   * @param {Error | null} error 処理が成功した場合は null
   * @param {object[]} records レコードの配列
   * @param {number} records[].id キー
   * @param {string} records[].title タイトル
   * @param {string} records[].content コンテンツ
   * @param {number} records[].createdAt 作成日時
   * @param {number} records[].updatedAt 更新日時
   */
  function onReadAll(error, records) {
    if (error) errorHandler(error);
    else addCard(records);
  }

  /**
   * メモを保存する
   */
  function save() {
    const meta = JSON.parse(metadata.value);

    const record = {
      title: titleInput.value,
      content: textEditor.innerHTML,
      createdAt: meta.date ? meta.date : Date.now(),
      updatedAt: meta.date ? Date.now() : null
    };

    if (meta.id) {
      record.id = meta.id;
    }

    execCommand('upsertRecord', record);

    editModal.close();
  }

  /**
   * メモを複製して保存する
   */
  function saveCopyAs() {
    const meta = { id: null, date: null };
    metadata.value = JSON.stringify(meta);
    save();
  }

  /**
   * メモを編集する
   * @param {object} record レコード
   * @param {number} record.id キー
   * @param {string} record.title タイトル
   * @param {string} record.content コンテンツ
   * @param {number} record.createdAt 作成日時
   * @param {number} record.updatedAt 更新日時
   */
  function edit(record) {
    titleInput.value = record.title;
    textEditor.innerHTML = record.content;

    const meta = { id: record.id, date: record.createdAt };
    metadata.value = JSON.stringify(meta);

    editModalTitle.textContent = `編集 : ${record.title}`;

    saveCopyAsButton.style.display = 'inline-block';
    editModal.open();
  }

  /**
   * カードを一覧に追加する
   * @param {object[]} records レコードの配列
   * @param {number} records[].id キー
   * @param {string} records[].title タイトル
   * @param {string} records[].content コンテンツ
   * @param {number} records[].createdAt 作成日時
   * @param {number} records[].updatedAt 更新日時
   */
  function addCard(records) {
    const fragment = document.createDocumentFragment();

    for (const record of records) {
      const card = new Card(record);

      // カードがクリックされたら詳細表示リクエストを送信する
      card.addEventListener('click', (event) => {
        execCommand('readRecord', parseInt(event.currentTarget.dataset.id), 'view');
      });

      // 既存の要素がある場合は置換する
      const oldCard = cardList.querySelector(`card-component[data-id="${record.id}"]`);
      oldCard ? oldCard.replaceWith(card) : fragment.prepend(card);
    }

    cardList.prepend(fragment);
  }

  /**
   * カードを一覧から削除する
   * @param {number} id キー
   */
  function deleteCard(id) {
    cardList.querySelector(`card-component[data-id="${id}"]`)?.remove();
  }

  /**
   * メモを詳細表示する
   * @param {object} record レコード
   * @param {number} record.id キー
   * @param {string} record.title タイトル
   * @param {string} record.content コンテンツ
   * @param {number} record.createdAt 作成日時
   * @param {number} record.updatedAt 更新日時
   */
  function view(record) {
    if (record instanceof Object) {
      detailModalTitle.innerText = record.title;
      detailModalBody.innerHTML = record.content;
      deleteButton.dataset.id = record.id;
      editButton.dataset.id = record.id;
  
      writeDate.textContent = record.updatedAt
        ? `更新 : ${new Date(record.updatedAt).toLocaleString({ timeZone: 'Asia/Tokyo' })}`
        : `作成 : ${new Date(record.createdAt).toLocaleString({ timeZone: 'Asia/Tokyo' })}`;
  
      // 編集ボタンがクリックされたら編集リクエストを送信する
      editButton.addEventListener('click', (event) => {
        execCommand('readRecord', parseInt(event.currentTarget.dataset.id), 'edit');
        detailModal.close();
      }, { once: true });
  
      // 削除ボタンがクリックされたら削除リクエストを送信する
      deleteButton.addEventListener('click', (event) => {
        execCommand('deleteRecord', parseInt(event.currentTarget.dataset.id));
        detailModal.close();
      }, { once: true });
  
      detailModal.open();
    } else {
      alert('指定されたメモを読み込めません。当該のデータは削除されたか、互換性がない可能性があります。');
    }
  }

  // 保存ボタン
  saveButton.addEventListener('click', save);

  // 複製保存ボタン
  saveCopyAsButton.addEventListener('click', saveCopyAs);

  // 作成ボタンがクリックされたら編集モーダルを開く
  createButton.addEventListener('click', () => {
    const meta = { id: null, date: null };
    metadata.value = JSON.stringify(meta);
    saveCopyAsButton.style.display = 'none';
    editModalTitle.textContent = '新規作成';
    editModal.open();
  });

  // モーダルが閉じられたらフォームをリセットする
  editModal.addEventListener('close', () => {
    const meta = { id: null, date: null };
    metadata.value = JSON.stringify(meta);
    titleInput.value = null;
    textEditor.reset();
  });

  // モーダルが閉じられたらコンテンツを削除する
  detailModal.addEventListener('close', () => {
    detailModalTitle.innerText = '';
    detailModalBody.innerHTML = '';
  });
})();
