/* Pagination Generator Component */

const Pagination = {
    render(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';

        let btns = '';
        for (let i = 1; i <= totalPages; i++) {
            btns += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
        }

        return `
            <div class="pagination">
                <span>Page ${currentPage} of ${totalPages}</span>
                <div class="pagination-buttons">${btns}</div>
            </div>
        `;
    }
};

window.Pagination = Pagination;
