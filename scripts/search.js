(() => {
  'use strict';

  const searchInput = document.getElementById('search-input');
  const cardList = document.getElementById('card-list');

  searchInput.addEventListener('input', function () {
    fuzzySearch(cardList.children, this.value);
  });
  
  /**
   * 指定されたキーワードに一致した項目をリストに表示する
   * @param {HTMLCollection | NodeList} targets 検索対象のリスト
   * @param {string} keyword 検索キーワード
   */
  function fuzzySearch(targets, keyword) {
    try {
      // 大文字・小文字・ひらがな・カタカナを区別しない
      keyword = hiraganaToKatakana(keyword.trim());
      keyword = new RegExp(keyword, 'i');
    } catch (error) {
      if (error instanceof SyntaxError) return;
      else throw error;
    }
  
    for (const target of targets) {
      const result = keyword.test(hiraganaToKatakana(target.textContent));
      target.style.display = result ? 'flex' : 'none';
    }
  }
  
  /**
   * ひらがなをカタカナに変換する
   * @param {string} text 変換対象の文字列
   * @return {string} 変換した文字列
   */
  function hiraganaToKatakana(text) {
    return text.replace(/[\u3041-\u3096]/g, (match) => {
      const charCode = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(charCode);
    });
  }
})();