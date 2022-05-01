'use strict';

/**
 * ファイルのデータをデータ URL として取得する
 * @param {File | Blob} file File または Blob オブジェクト
 * @return {Promise<string>} ファイルのデータを含む Promise
 */
 function readAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (event) => {
      resolve(event.target.error);
    };
  });
}

/**
 * ファイルのデータをテキストとして取得する
 * @param {File | Blob} file File または Blob オブジェクト
 * @return {Promise<string>} ファイルのデータを含む Promise
 */
function readAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (event) => {
      resolve(event.target.error);
    };
  });
}

/**
 * ファイルサイズを適切な単位に変換して返す
 * @param {number} sizeBytes バイト単位のファイルサイズ
 * @return {string} 適切な単位に変換されたファイルサイズ
 */
 function formatFileSize(sizeBytes) {
  const kb = 1024;
  const mb = kb ** 2;
  const gb = kb ** 3;
  const tb = kb ** 4;

  if (sizeBytes < kb) {
    return sizeBytes + 'B';
  } else if (sizeBytes < mb) {
    return (sizeBytes / kb).toFixed(1) + 'KB';
  } else if (sizeBytes < gb) {
    return (sizeBytes / mb).toFixed(1) + 'MB';
  } else if (sizeBytes < tb) {
    return (sizeBytes / gb).toFixed(1) + 'GB';
  }
}

export { readAsDataURL, readAsText, formatFileSize };
