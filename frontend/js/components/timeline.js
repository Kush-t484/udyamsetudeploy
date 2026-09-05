// Timeline Component

const Timeline = {
  render(events) {
    let html = '<div class="timeline">';
    events.forEach(event => {
      html += `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h4>${event.title}</h4>
            <p>${event.description}</p>
            <small>${Utils.formatDate(event.date)}</small>
          </div>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }
};
