// Modal Component

const Modal = {
  show(content, title = '') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="close-btn">×</button>
        </div>
        <div class="modal-body">${content}</div>
      </div>
    `;
    document.body.appendChild(modal);
  },
  
  close() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  }
};
