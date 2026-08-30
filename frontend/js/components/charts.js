/* Pure Canvas Chart Generator */

const Charts = {
    renderBarChart(canvasId, labels, dataValues, color = '#1D4ED8') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.parentElement.clientWidth || 400;
        const height = canvas.height = 200;

        ctx.clearRect(0, 0, width, height);

        if (!dataValues || dataValues.length === 0) return;

        const maxVal = Math.max(...dataValues, 5);
        const barWidth = (width - 60) / dataValues.length;

        dataValues.forEach((val, i) => {
            const barHeight = (val / maxVal) * (height - 50);
            const x = 40 + i * barWidth + 10;
            const y = height - 30 - barHeight;

            // Draw Bar
            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth - 20, barHeight);

            // Value text
            ctx.fillStyle = '#0A192F';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(val, x + (barWidth - 20) / 2, y - 5);

            // Label text
            const labelStr = labels[i].length > 10 ? labels[i].substring(0, 10) + '..' : labels[i];
            ctx.fillStyle = '#64748B';
            ctx.fillText(labelStr, x + (barWidth - 20) / 2, height - 10);
        });
    }
};

window.Charts = Charts;
