// ========================================
// CALENDAR VIEW - Monthly Calendar
// ========================================

let currentCalendarDate = new Date();

// Render Calendar View
function renderCalendarView() {
    const container = document.getElementById('calendarView');
    if (!container) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    container.innerHTML = `
        <div class="calendar-container">
            <!-- Calendar Header -->
            <div class="calendar-header">
                <h2 style="margin: 0; font-size: 1.5rem; color: #111827;">
                    ${getMonthName(month)} ${year}
                </h2>
                <div class="calendar-nav">
                    <button onclick="navigateCalendar(-1)">
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <button onclick="navigateCalendar(0)">
                        <i class="fas fa-calendar-day"></i> Today
                    </button>
                    <button onclick="navigateCalendar(1)">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <!-- Calendar Grid -->
            <div class="calendar-grid">
                ${renderCalendarDayHeaders()}
                ${renderCalendarDays(year, month)}
            </div>
            
            <!-- Legend -->
            <div style="margin-top: 1.5rem; display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="calendar-deadline legal"></span>
                    <span style="font-size: 0.875rem; color: #6b7280;">Legal</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="calendar-deadline nonprofit"></span>
                    <span style="font-size: 0.875rem; color: #6b7280;">Nonprofit</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="calendar-deadline other"></span>
                    <span style="font-size: 0.875rem; color: #6b7280;">Other</span>
                </div>
            </div>
        </div>
    `;
}

// Render day headers (Sun, Mon, Tue, etc.)
function renderCalendarDayHeaders() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => `
        <div class="calendar-day-header">${day}</div>
    `).join('');
}

// Render calendar days
function renderCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();

    let html = '';

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        html += renderCalendarDay(year, month - 1, day, true);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        html += renderCalendarDay(year, month, day, false);
    }

    // Next month days to fill grid
    const totalCells = html.split('calendar-day').length - 1;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        html += renderCalendarDay(year, month + 1, day, true);
    }

    return html;
}

// Render individual calendar day
function renderCalendarDay(year, month, day, isOtherMonth) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const isToday = dateStr === today;

    // Get deadlines for this date
    const deadlines = getDeadlinesForDate(dateStr);

    // Build deadline dots
    const deadlineDots = deadlines.map(d =>
        `<span class="calendar-deadline ${d.type}" title="${d.name}"></span>`
    ).join('');

    const classes = [
        'calendar-day',
        isOtherMonth ? 'other-month' : '',
        isToday ? 'today' : ''
    ].filter(Boolean).join(' ');

    return `
        <div class="${classes}" onclick="showDeadlinesForDate('${dateStr}')">
            <div class="calendar-day-number">${day}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 2px; margin-top: 0.25rem;">
                ${deadlineDots}
            </div>
        </div>
    `;
}

// Get deadlines for a specific date
function getDeadlinesForDate(dateStr) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.filter(c => {
        if (!c.nextDeadline) return false;
        const deadlineDate = new Date(c.nextDeadline).toISOString().split('T')[0];
        return deadlineDate === dateStr;
    }).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type || 'other',
        client: c.clientOrganizationName,
        priority: c.priority
    }));
}

// Show deadlines for a date (modal or alert)
function showDeadlinesForDate(dateStr) {
    const deadlines = getDeadlinesForDate(dateStr);

    if (deadlines.length === 0) {
        return; // No deadlines, do nothing
    }

    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const list = deadlines.map(d =>
        `• ${d.name} (${d.client}) - ${d.type.toUpperCase()} - Priority: ${d.priority}`
    ).join('\n');

    alert(`Deadlines on ${formattedDate}:\n\n${list}`);
}

// Navigate calendar
function navigateCalendar(direction) {
    if (direction === 0) {
        // Go to today
        currentCalendarDate = new Date();
    } else {
        // Move month
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    }
    renderCalendarView();
}

// Get month name
function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

// Expose functions
window.renderCalendarView = renderCalendarView;
window.navigateCalendar = navigateCalendar;
window.showDeadlinesForDate = showDeadlinesForDate;
