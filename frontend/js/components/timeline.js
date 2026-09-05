// Timeline Component

const Timeline = {
  create(events) {
    return `
      <div class="timeline">
        ${events.map((event, index) => `
          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>${event.title}</h4>
              <p>${event.description}</p>
              <small>${Utils.formatDateTime(event.date)}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
