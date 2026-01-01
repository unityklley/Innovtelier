// ========================================
// QUICK FILTER FUNCTIONS
// ========================================

function quickFilterType(type) {
    // Update active button
    const buttons = document.querySelectorAll('.quick-filter-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-type') === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update the type filter dropdown
    const typeFilter = document.getElementById('caseTypeFilter');
    if (typeFilter) {
        typeFilter.value = type;
    }

    // Trigger the existing filter function
    if (typeof renderCasesTable === 'function') {
        renderCasesTable();
    }
}

// Expose function
window.quickFilterType = quickFilterType;
