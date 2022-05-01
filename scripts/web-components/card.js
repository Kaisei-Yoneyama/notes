'use strict';

const template = document.createElement('template');

class Card extends HTMLElement {
  /**
   * カードを生成する
   * @param {object} record レコード
   * @param {number} record.id キー
   * @param {string} record.title タイトル
   * @param {string} record.content コンテンツ
   * @param {number} record.createdAt 作成日時
   * @param {number} record.updatedAt 更新日時
   */
  constructor(record) {
    super();
    this.record = record;
  }

  connectedCallback() {
    template.innerHTML = this.record.content;
    this.record.content = template.content;

    const body = document.createElement('div');
    const title = document.createElement('h3');
    const content = document.createElement('p');
    const metadata = document.createElement('small');

    this.classList.add('card');
    body.classList.add('card-body');
    title.classList.add('card-title');
    content.classList.add('card-content');
    metadata.classList.add('card-metadata');

    this.dataset.id = this.record.id;
    title.textContent = this.record.title;
    content.textContent = this.record.content.textContent;
    metadata.textContent = `ID:${this.record.id} · ${new Date(this.record.createdAt).toLocaleString({ timeZone: 'Asia/Tokyo' })}`;

    this.appendChild(body);
    body.appendChild(title);
    body.appendChild(content);
    body.appendChild(metadata);

    const image = this.record.content.querySelector('img');
    const video = this.record.content.querySelector('video');

    if (video) {
      const thumbnail = document.createElement('video');
      thumbnail.classList.add('card-thumbnail');
      thumbnail.src = video.src;
      thumbnail.loop = true;
      thumbnail.muted = true;
      thumbnail.autoplay = true;
      this.appendChild(thumbnail);
    } else if (image) {
      const thumbnail = document.createElement('img');
      thumbnail.classList.add('card-thumbnail');
      thumbnail.src = image.src;
      this.appendChild(thumbnail);
    }
  }
}

customElements.define('card-component', Card);