# Notes

IndexedDB を使用したメモアプリです。  
高速に動作させるため CRUD 操作はワーカースレッドで並列処理しています。

## 基本的な使い方

### メモの作成
1. [作成] をクリックして作成画面を開きます。
2. タイトルとコンテンツを入力します。
3. [保存] をクリックして保存します。

### メモの編集
1. 編集したいメモをクリックして詳細画面を開きます。
2. [編集] をクリックして編集画面を開きます。
3. [保存] をクリックして更新、[複製保存] をクリックしてコピーを保存します。

### メモの削除
1. 削除したいメモをクリックして詳細画面を開きます。
2. [削除] をクリックして削除します。
