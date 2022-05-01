import { readAsDataURL, readAsText, formatFileSize } from './modules/file-util.js';

(() => {
  'use strict';

  const richTextEditor = document.getElementById('rich-text-editor');

  const fileInput = document.getElementById('file-input');
  const linkButton = document.getElementById('link-button');
  const htmlButton = document.getElementById('html-button');
  const undoButton = document.getElementById('undo-button');
  const redoButton = document.getElementById('redo-button');
  const removeFormatButton = document.getElementById('remove-format-button');

  const fontSizeOptions = document.querySelectorAll('#font-size-button .option');
  const fontColorOptions = document.querySelectorAll('#font-color-button .option');

  // 書式削除機能
  removeFormatButton.addEventListener('click', () => {
    richTextEditor.removeFormat();
  });

  // Undo 機能
  undoButton.addEventListener('click', () => {
    richTextEditor.undo();
  });

  // Redo 機能
  redoButton.addEventListener('click', () => {
    richTextEditor.redo();
  });

  // font-size 変更機能
  for (let option of fontSizeOptions) {
    option.addEventListener('click', (event) => {
      richTextEditor.fontSize(event.currentTarget.dataset.value);
    });
  }

  // font-color 変更機能
  for (let option of fontColorOptions) {
    option.addEventListener('click', (event) => {
      richTextEditor.foreColor(event.currentTarget.dataset.value);
    });
  }

  // リンク作成機能
  linkButton.addEventListener('click', () => {
    const url = prompt('URL を入力してください', 'https://');
    if (url) richTextEditor.createLink(url);
  });

  // HTML 挿入機能
  htmlButton.addEventListener('click', () => {
    const embedCode = prompt('HTML コードを入力してください');
    if (embedCode) richTextEditor.insertHTML(embedCode);
  });

  // ファイル挿入機能
  fileInput.addEventListener('change', handleFiles);

  /**
   * ユーザーが選択したファイルを添付する
   */
  function handleFiles() {
    for (const file of this.files) {
      const type = file.type.split('/')[0];
      const name = file.name;
      const size = file.size;

      if ((1024 ** 2) * 50 <= size) {
        alert('50MB 以下のファイルを添付できます');
        console.warn(name, formatFileSize(size));
        return;
      }

      switch (type) {
        case 'video':
          readAsDataURL(file).then((url) => {
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.contentEditable = false;
            richTextEditor.insertNode(video);
          });
          break;
        case 'audio':
          readAsDataURL(file).then((url) => {
            const audio = document.createElement('audio');
            audio.src = url;
            audio.controls = true;
            audio.contentEditable = false;
            richTextEditor.insertNode(audio);
          });
          break;
        case 'image':
          readAsDataURL(file).then((url) => {
            const image = document.createElement('img');
            image.src = url;
            image.contentEditable = false;
            richTextEditor.insertNode(image);
          });
          break;
        case 'text':
          readAsText(file).then((text) => {
            text = document.createTextNode(text);
            richTextEditor.insertNode(text);
          });
          break;
        default:
          alert('未対応の形式です');
          break;
      }
    }

    this.value = null;
  }
})();
