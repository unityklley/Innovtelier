// ========================================
// CASES TAB SWITCHING
// ========================================

let currentCasesTab = 'cases'; // Default to Cases tab

function switchCasesTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}Tab`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
    }

    // Load data for specific tabs
    currentCasesTab = tabName;

    switch (tabName) {
        case 'clients':
            if (typeof loadClientDashboard === 'function') {
                loadClientDashboard();
            }
            break;
        case 'cases':
            if (typeof loadCases === 'function') {
                loadCases();
            }
            break;
        case 'calendar':
            // Placeholder for calendar view
            break;
        case 'reports':
            // Placeholder for reports view
            break;
    }
}

// Expose function
window.switchCasesTab = switchCasesTab;
