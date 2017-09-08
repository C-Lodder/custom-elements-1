/** Include the relative styles */
if (!document.head.querySelector('#joomla-alert-style')) {
  const style = document.createElement('style');
  style.id = 'joomla-alert-style';
  style.innerHTML = `joomla-alert{display:block;min-width:250px;padding:.5rem 1.25rem;margin-bottom:1rem;border:1px solid transparent;opacity:0;border-radius:.25rem;transition:opacity .15s linear}joomla-alert.joomla-alert--show{opacity:1}joomla-alert .joomla-alert--close,joomla-alert .joomla-alert-button--close{position:relative;top:-.5rem;right:-1.25rem;padding:.2rem 1rem;color:inherit}joomla-alert .joomla-alert--close{font-size:1.5rem;font-weight:700;line-height:1;text-shadow:0 1px 0 #fff}joomla-alert .joomla-alert--close,joomla-alert .joomla-alert-button--close{float:right;color:#000;background:0 0;border:0;opacity:.5}joomla-alert .joomla-alert--close:focus,joomla-alert .joomla-alert--close:hover,joomla-alert .joomla-alert-button--close:focus,joomla-alert .joomla-alert-button--close:hover{color:#000;text-decoration:none;cursor:pointer;opacity:.75}joomla-alert button.joomla-alert-button--close{padding-top:.75rem;font-size:100%;line-height:1.15;cursor:pointer;background:0 0;border:0;-webkit-appearance:none}joomla-alert[position=top-left]{position:fixed;top:10px;left:10px}joomla-alert[position=top-center]{position:fixed;top:10px;left:50%;transform:translateX(-50%)}joomla-alert[position=top-right]{position:fixed;top:10px;right:10px}joomla-alert[type=primary]{color:#00364f;background-color:#cce1ea;border-color:#b8d5e2}joomla-alert[type=primary] hr{border-top-color:#a6cadb}joomla-alert[type=primary] .alert-link{color:#00131c}joomla-alert[type=secondary]{color:#464a4e;background-color:#e7e8ea;border-color:#dddfe2}joomla-alert[type=secondary] hr{border-top-color:#cfd2d6}joomla-alert[type=secondary] .alert-link{color:#2e3133}joomla-alert[type=success]{color:#234423;background-color:#d9e6d9;border-color:#cadcca}joomla-alert[type=success] hr{border-top-color:#bbd2bb}joomla-alert[type=success] .alert-link{color:#122212}joomla-alert[type=info]{color:#0c5460;background-color:#d1ecf1;border-color:#bee5eb}joomla-alert[type=info] hr{border-top-color:#abdde5}joomla-alert[type=info] .alert-link{color:#062c33}joomla-alert[type=warning]{color:#7d5a29;background-color:#fcefdc;border-color:#fbe8cd}joomla-alert[type=warning] hr{border-top-color:#f9ddb5}joomla-alert[type=warning] .alert-link{color:#573e1c}joomla-alert[type=danger]{color:#712b29;background-color:#f7dddc;border-color:#f4cfce}joomla-alert[type=danger] hr{border-top-color:#efbbb9}joomla-alert[type=danger] .alert-link{color:#4c1d1b}joomla-alert[type=light]{color:#818182;background-color:#fefefe;border-color:#fdfdfe}joomla-alert[type=light] hr{border-top-color:#ececf6}joomla-alert[type=light] .alert-link{color:#686868}joomla-alert[type=dark]{color:#1b1e21;background-color:#d6d8d9;border-color:#c6c8ca}joomla-alert[type=dark] hr{border-top-color:#b9bbbe}joomla-alert[type=dark] .alert-link{color:#040505}`;
  document.head.appendChild(style);
}

class JoomlaAlertElement extends HTMLElement {
  /* Attributes to monitor */
  static get observedAttributes() { return ['type', 'dismiss', 'acknowledge', 'href', 'auto-dismiss', 'position', 'textClose', 'textDismiss', 'textAcknowledge']; }
  get type() { return this.getAttribute('type'); }
  set type(value) { return this.setAttribute('type', value); }
  get dismiss() { return this.getAttribute('dismiss'); }
  set dismiss(value) { return this.setAttribute('dismiss', value); }
  get acknowledge() { return this.getAttribute('acknowledge'); }
  set acknowledge(value) { return this.setAttribute('acknowledge', value); }
  get href() { return this.getAttribute('href'); }
  set href(value) { return this.setAttribute('href', value); }
  get autoDismiss() { return parseInt(this.getAttribute('auto-dismiss'), 10); }
  set autoDismiss(value) { return this.setAttribute('auto-dismiss', parseInt(value, 10)); }
  get position() { return this.getAttribute('position'); }
  set position(value) { return this.setAttribute('position', value); }
  get textClose() { return this.getAttribute('textClose') || 'Close'; }
  set textClose(value) { return this.setAttribute('textClose', value); }
  get textDismiss() { return this.getAttribute('textDismiss') || 'Open'; }
  set textDismiss(value) { return this.setAttribute('textDismiss', value); }
  get textAcknowledge() { return this.getAttribute('textAcknowledge') || 'Ok'; }
  set textAcknowledge(value) { return this.setAttribute('textAcknowledge', value); }

  /* Lifecycle, element appended to the DOM */
  connectedCallback() {
    // Trigger show event
    this.dispatchCustomEvent('joomla.alert.show');
    this.setAttribute('role', 'alert');
    this.classList.add('joomla-alert--show');

    // If no type has been defined, the default as "info"
    if (!this.type) {
      this.setAttribute('type', 'info');
    }

    // Append button
    if (this.hasAttribute('dismiss') || this.hasAttribute('acknowledge') || (this.hasAttribute('href') && this.getAttribute('href') !== '')) {
      if (!this.querySelector('button.joomla-alert--close') && !this.querySelector('button.joomla-alert-button--close')) {
        this.appendCloseButton.bind(this)();
      }
    }

    // Trigger shown event
    this.dispatchCustomEvent('joomla.alert.show');

    if (this.closeButton) {
      this.closeButton.focus();
    }
  }

  /* Lifecycle, element removed from the DOM */
  disconnectedCallback() {
    if (this.firstChild.tagName && this.firstChild.tagName.toLowerCase() === 'button') {
      this.firstChild.removeEventListener('click', this.buttonCloseFn);
    }
  }

  /* Respond to attribute changes */
  attributeChangedCallback(attr, oldValue, newValue) {
    switch (attr) {
      case 'type':
        if (!newValue || ['info', 'warning', 'success', 'danger'].indexOf(newValue) === -1) {
          this.type = 'info';
        }
        break;
      case 'dismiss':
      case 'acknowledge':
        if (!newValue || newValue === 'true') {
          if (this.firstElementChild.tagName && this.firstElementChild.tagName.toLowerCase() !== 'button') {
            this.appendCloseButton.bind(this)();
          }
        } else if (this.firstElementChild.tagName && this.firstElementChild.tagName.toLowerCase() === 'button') {
          this.removeCloseButton.bind(this)();
        }
        break;
      case 'href':
        if (!newValue || newValue === '') {
          if (this.firstElementChild.tagName && this.firstElementChild.tagName.toLowerCase() !== 'button') {
            this.removeCloseButton.bind(this)();
          }
        } else if (this.firstElementChild.tagName && this.firstElementChild.tagName.toLowerCase() !== 'button' && this.firstElementChild.classList.contains('joomla-alert-button--close')) {
          this.appendCloseButton.bind(this)();
        }
        break;
      case 'auto-dismiss':
        if (!newValue || newValue === '') {
          this.removeAttribute('auto-dismiss');
        }
        break;
      default:
        break;
    }
  }

  buttonCloseFn() {
    this.dispatchCustomEvent('joomla.alert.buttonClicked');
    if (this.href) {
      window.location.href = this.href;
    }
    this.close();
  }

  /* Method to close the alert */
  close() {
    this.dispatchCustomEvent('joomla.alert.close');
    this.addEventListener('transitionend', () => {
      this.dispatchCustomEvent('joomla.alert.closed');
      this.parentNode.removeChild(this);
    });
    this.classList.remove('joomla-alert--show');
  }

  /* Method to dispatch events. Internal */
  dispatchCustomEvent(eventName) {
    const OriginalCustomEvent = new CustomEvent(eventName, { bubbles: true, cancelable: true });
    OriginalCustomEvent.relatedTarget = this;
    this.dispatchEvent(OriginalCustomEvent);
    this.removeEventListener(eventName, this);
  }

  /* Method to create the close button. Internal */
  appendCloseButton() {
    if (this.querySelector('button.joomla-alert--close') || this.querySelector('button.joomla-alert-button--close')) {
      return;
    }

    const closeButton = document.createElement('button');

    if (this.hasAttribute('dismiss')) {
      closeButton.classList.add('joomla-alert--close');
      closeButton.innerHTML = '<span aria-hidden="true">&times;</span>';
      closeButton.setAttribute('aria-label', this.textClose);
    } else {
      closeButton.classList.add('joomla-alert-button--close');
      if (this.hasAttribute('acknowledge')) {
        closeButton.innerHTML = this.textAcknowledge;
      } else {
        closeButton.innerHTML = this.textDismiss;
      }
    }

    this.closeButton = closeButton;

    if (this.firstChild) {
      this.insertBefore(closeButton, this.firstChild);
    } else {
      this.appendChild(closeButton);
    }

    /* Add the required listener */
    if (closeButton) {
      closeButton.addEventListener('click', this.buttonCloseFn.bind(this));
    }

    if (this.autoDismiss > 0) {
      const self = this;
      const timeout = this.autoDismiss;
      setTimeout(() => {
        self.dispatchCustomEvent('joomla.alert.buttonClicked');
        if (self.href) {
          window.location.href = self.href;
        }
        self.close();
      }, timeout);
    }
  }

  /* Method to remove the close button. Internal */
  removeCloseButton() {
    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.buttonCloseFn);
      this.closeButton.parentNode.removeChild(this.closeButton);
    }
  }
}

customElements.define('joomla-alert', JoomlaAlertElement);
