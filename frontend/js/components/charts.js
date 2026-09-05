// Charts Component

const Charts = {
  renderBarChart(data) {
    return `
      <div class="bar-chart">
        ${data.map(item => `
          <div class="bar-item">
            <div class="bar" style="height: ${item.value}%"></div>
            <label>${item.label}</label>
          </div>
        `).join('')}
      </div>
    `;
  }
};
