// Pagination Component

const Pagination = {
  render(currentPage, totalPages) {
    let html = '<div class="pagination">';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    html += '</div>';
    return html;
  }
};
