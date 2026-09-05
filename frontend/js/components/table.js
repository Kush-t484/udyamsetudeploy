// Table Component

const Table = {
  render(columns, data) {
    let html = '<table><thead><tr>';
    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';
    data.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        html += `<td>${row[col] || ''}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }
};
