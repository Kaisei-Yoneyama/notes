'use strict';

// document.execCommand() が廃止されたので代替機能を自作します。
// TODO リファクタリング

const emptyElements = [ 'AREA', 'BASE', 'BR', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR' ];

/**
 * 指定した要素が空要素（ Empty element ）か判定する
 * @param {HTMLElement} element HTML 要素
 * @return {boolean} 判定結果
 */
function isEmptyElement(element) {
  return emptyElements.includes(element.tagName);
}

/**
 * 指定した要素が空の場合は要素を削除する（空要素は無視する）
 * @param {HTMLElement} element HTML 要素
 */
function removeEmptyElement(element) {
  if (!isEmptyElement(element) &&
      element.matches(':empty')) {
    element.remove();
  }
}

/**
 * 指定した要素を正規化する
 * @param {HTMLElement} element HTML 要素
 */
function normalize(element) {
  removeEmptyElement(element);
  element.normalize();
}

/**
 * WYSIWYG エディタ
 */
class Editor extends HTMLElement {
  constructor() {
    super();

    this.supportedElements = [];

    this.undoStack = [];
    this.redoStack = [];

    this.selection = null;
    this.range = null;

    document.addEventListener('selectionchange', (event) => {
      const selection = event.currentTarget.getSelection();

      if (this.contains(selection.anchorNode) &&
          this.contains(selection.focusNode)) {
        this.selection = selection;
        this.range = selection.getRangeAt(0);
      }
    });
  }

  connectedCallback() {
    try { this.contentEditable = 'plaintext-only'; }
    catch { this.contentEditable = true; }

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        switch (mutation.type) {
          case 'childList':
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // if (!this.isSupportedElement(node))
              }
            });

            this.dispatchEvent(new CustomEvent('mutation.childList', {
              detail: { mutation: mutation }
            }));
            break;
          case 'characterData':
            this.dispatchEvent(new CustomEvent('mutation.characterData', {
              detail: { mutation: mutation }
            }));
            break;
          case 'attributes':
            this.dispatchEvent(new CustomEvent('mutation.attributes', {
              detail: { mutation: mutation }
            }));
            break;
        }
      });

      this.dispatchEvent(new CustomEvent('mutation', {
        detail: { mutations: mutations }
      }));
    }).observe(this, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterDataOldValue: true,
      characterData: true
    });
  }

  /**
   * コマンドを取り消す
   */
  undo() {
    const stack = this.undoStack.pop();

    if (typeof stack === 'string') {
      this.redoStack.push(this.innerHTML);
      this.innerHTML = stack;
    }
  }

  /**
   * undo コマンドを取り消す
   */
  redo() {
    const stack = this.redoStack.pop();

    if (typeof stack === 'string') {
      this.undoStack.push(this.innerHTML);
      this.innerHTML = stack;
    }
  }

  /**
   * undo スタックを追加する
   */
  addUndoStack() {
    this.undoStack.push(this.innerHTML);
    this.redoStack.splice(0);
  }

  /**
   * 引数に渡されたノードを現在のキャレットの位置に挿入する
   * @param {Node} node 挿入するノード
   */
  insertNode(node) {
    this.addUndoStack();

    if (this.selection && this.range) {
      this.range.deleteContents();
      this.range.insertNode(node);
      this.range.selectNode(node);
      this.range.collapse(false);
      this.range.detach();
    } else {
      this.appendChild(node);
    }
  }

  /**
   * 引数に渡された要素で選択範囲のコンテンツをラップする
   * @param {HTMLElement} element HTML 要素
   */
  surroundContents(element) {
    if (this.selection && this.range) {
      if (this.range.collapsed) return;

      this.addUndoStack();

      const fragment = this.range.extractContents();
      const descendants = fragment.querySelectorAll('*');

      for (const descendant of descendants) {
        removeEmptyElement(descendant);
        if (descendant.dataset.type === element.dataset.type) {
          descendant.replaceWith(...descendant.childNodes);
        }
      }

      element.appendChild(fragment);

      this.range.insertNode(element);
      this.range.selectNode(element);
      this.range.detach();

      if (element.parentElement) {
        if ((element.parentElement.dataset.type === element.dataset.type) &&
            (element.parentElement.innerHTML === element.outerHTML)) {
          element.parentElement.replaceWith(element);
        }
      }

      if (element.previousElementSibling) {
        removeEmptyElement(element.previousElementSibling);
      }

      if (element.nextElementSibling) {
        removeEmptyElement(element.nextElementSibling);
      }
    }
  }

  /**
   * 引数に指定された要素がサポートされているか判定する
   * @param {HTMLElement} element HTML 要素
   * @return {boolean} 判定結果
   */
  isSupportedElement(element) {
    return this.supportedElements.includes(element.tagName);
  }

  /**
   * エディタをリセットする
   */
  reset() {
    this.undoStack = [];
    this.redoStack = [];
    this.innerHTML = '';
  }
}

// ----- エディタの機能拡張 -----

/**
 * 現在の選択範囲からリンクを作成する
 * @param {string} url リンクの URL
 */
Editor.prototype.createLink = function (url) {
  const anchor = document.createElement('a');
  anchor.contentEditable = false;
  anchor.dataset.type = 'link';
  anchor.href = url;

  this.surroundContents(anchor);
};

/**
 * 現在の選択範囲の文字列の色を変更する
 * @param {string} color CSS の color プロパティの値
 */
Editor.prototype.foreColor = function (color) {
  const span = document.createElement('span');
  span.dataset.type = 'fore-color';
  span.style.color = color;

  this.surroundContents(span);
};

/**
 * 現在の選択範囲の文字列のサイズを変更する
 * @param {string} size CSS の font-size プロパティの値
 */
Editor.prototype.fontSize = function (size) {
  const span = document.createElement('span');
  span.dataset.type = 'font-size';
  span.style.fontSize = size;

  this.surroundContents(span);
};

/**
 * 現在のキャレットの位置に HTML 要素を挿入する
 * @param {string} htmlString HTML の文字列
 */
Editor.prototype.insertHTML = function (htmlString) {
  const template = document.createElement('template');
  template.innerHTML = htmlString;

  for (const element of template.content.children) {
    this.insertNode(element);
  }
};

/**
 * 現在の選択範囲の書式を削除する
 */
Editor.prototype.removeFormat = function () {
  if (this.selection && this.range) {
    if (this.range.collapsed) return;

    this.addUndoStack();

    const fragment = this.range.extractContents();
    const descendants = fragment.querySelectorAll('*');

    for (const descendant of descendants) {
      descendant instanceof HTMLBRElement
        ? descendant.replaceWith(document.createTextNode('\n'))
        : descendant.replaceWith(...descendant.childNodes);
    }

    const plainText = fragment.textContent;
    const textNode = document.createTextNode(plainText);

    this.range.insertNode(textNode);
    this.range.selectNode(textNode);
    this.range.detach();

    const parentElement = textNode.parentElement;

    if (parentElement && parentElement !== this) {
      if (textNode.data === parentElement.innerHTML) {
        parentElement.replaceWith(textNode);
      }
    }
  }
};

customElements.define('wysiwyg-editor', Editor);
