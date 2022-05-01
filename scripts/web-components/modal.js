'use strict';

class Modal extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
  }

  open(returnValue = null) {
    const event = new CustomEvent('open', { detail: returnValue });
    this.dispatchEvent(event);

    this.isOpen = true;
    this.classList.remove('hidden');
  }

  close(returnValue = null) {
    const event = new CustomEvent('close', { detail: returnValue });
    this.dispatchEvent(event);

    this.isOpen = false;
    this.classList.add('hidden');
  }

  connectedCallback() {
    const closeButton = this.querySelector('.modal-close-button');

    this.addEventListener('click', (event) => {
      if (event.target === this || event.target === closeButton) {
        this.close();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Esc' || event.key === 'Escape') {
        this.close();
      }
    });
  }
}

customElements.define('modal-component', Modal);
