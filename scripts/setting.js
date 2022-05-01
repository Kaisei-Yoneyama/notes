import { formatFileSize as formatByteSize } from './modules/file-util.js';

(() => {
  'use strict';

  const settingsButton = document.getElementById('settings-button');
  const settingsModal = document.getElementById('settings-modal');
  const estimateOutput = document.getElementById('estimate-output');
  const clearSiteDataButton = document.getElementById('clear-site-data-button');
  const permissionOutput = document.getElementById('permission-output');
  const requestPermissionButton = document.getElementById('request-permission-button');
  
  settingsButton.addEventListener('click', () => {
    if (navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        const usage = formatByteSize(estimate.usage);
        const quota = formatByteSize(estimate.quota);
        estimateOutput.innerHTML = `現在 <strong>${usage}/${quota}</strong> を使用しています`;
      });
    } else { // Safari と iOS 版 Safari は Navigator.storage がサポートされていない
      estimateOutput.innerHTML = '<span style="color: red;">ストレージの使用状況を取得できませんでした</span>';
      clearSiteDataButton.style.display = 'none';
    }

    if (window.Notification) {
      if (Notification.permission === 'granted') {
        permissionOutput.innerHTML = '現在デスクトップ通知は<strong>有効</strong>です';
        requestPermissionButton.style.display = 'none';
      } else if (Notification.permission === 'default') {
        permissionOutput.innerHTML = '現在デスクトップ通知は<strong>無効</strong>です';
        requestPermissionButton.style.display = 'inline-block';
      } else {
        permissionOutput.innerHTML = '現在デスクトップ通知は<strong>無効</strong>です';
        requestPermissionButton.style.display = 'none';
      }
    } else {
      permissionOutput.innerHTML = '<span style="color: red;">ご利用のブラウザはデスクトップ通知をサポートしていません</span>';
      requestPermissionButton.style.display = 'none';
    }

    settingsModal.open();
  });

  clearSiteDataButton.addEventListener('click', () => {
    if (confirm(`${location.hostname} のすべてのデータを削除しますか？`)) {
      indexedDB.deleteDatabase('notes');
      sessionStorage.clear();
      localStorage.clear();
      location.reload();
    }
  });

  requestPermissionButton.addEventListener('click', () => {
    window.Notification?.requestPermission().then(() => {
      settingsButton.click();
    });
  });
})();
