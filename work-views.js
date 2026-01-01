// ========================================
// WORK VIEWS - View Switcher Logic
// ========================================

let currentWorkView = 'calendar';

// Switch between work views (Calendar, Kanban, List)
function switchWorkView(viewName) {
    console.log('Switching to view:', viewName);

    // Update current view
    currentWorkView = viewName;

    // Save preference
    localStorage.setItem('preferredWorkView', viewName);

    // Update button states
    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-view') === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Hide all views
    document.getElementById('calendarView').style.display = 'none';
    document.getElementById('kanbanView').style.display = 'none';
    document.getElementById('listView').style.display = 'none';

    // Show selected view
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.style.display = 'block';
    }

    // Load data for the view
    refreshCurrentView();
}

// Refresh data for current view
function refreshCurrentView() {
    switch (currentWorkView) {
        case 'calendar':
            if (typeof renderCalendarView === 'function') {
                renderCalendarView();
            }
            break;
        case 'kanban':
            if (typeof renderKanbanView === 'function') {
                renderKanbanView();
            }
            break;
        case 'list':
            if (typeof renderListView === 'function') {
                renderListView();
            }
            break;
    }
}

// Load saved view preference
function loadViewPreference() {
    const savedView = localStorage.getItem('preferredWorkView');
    if (savedView && ['calendar', 'kanban', 'list'].includes(savedView)) {
        switchWorkView(savedView);
    }
}

// Expose functions
window.switchWorkView = switchWorkView;
window.refreshCurrentView = refreshCurrentView;
window.loadViewPreference = loadViewPreference;
