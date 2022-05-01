(() => {
  'use strict';

  // ----- ナビゲーション -----

  const stickyNavbar = document.getElementById('sticky-navbar');

  function offset() {
    document.body.style.paddingTop = `${stickyNavbar.offsetHeight}px`;
  }

  window.addEventListener('load', offset);
  window.addEventListener('resize', offset);

  // ----- 編集ツール -----

  const richTextEditor = document.getElementById('rich-text-editor');

  richTextEditor.addEventListener('click', () => {
    for (let select of document.getElementsByClassName('select')) {
      select.classList.remove('display');
    }
  });

  const fontSizeButton = document.getElementById('font-size-button');
  const fontColorButton = document.getElementById('font-color-button');

  fontSizeButton.addEventListener('click', toggle);
  fontColorButton.addEventListener('click', toggle);

  function toggle() {
    if (this instanceof HTMLElement) {
      this.querySelector('.select').classList.toggle('display');
    }
  }
})();