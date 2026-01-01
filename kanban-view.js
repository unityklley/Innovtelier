// ========================================
// KANBAN VIEW - Drag & Drop Board
// ========================================

// Render Kanban View
function renderKanbanView() {
    const container = document.getElementById('kanbanView');
    if (!container) return;

    // Get cases
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');

    // Filter cases by status for columns
    // Columns: To Do (active & !started), In Progress (active & started), Review, Done (closed)
    // Note: Our current data model might just have 'active', 'pending', 'closed'. 
    // We'll map them:
    // - To Do: active/pending (we don't have a 'started' flag yet, so maybe we assume active is in progress? 
    //   or we introduce a 'stage' field? For now, let's map loosely:
    //   To Do = 'pending'
    //   In Progress = 'active'
    //   Review = 'review' (we need to add this status option if not exists, or handle 'paused'?)
    //   Done = 'closed'

    // Let's stick to the current status values we have in the dropdown: 'active', 'pending', 'paused', 'closed'.
    // We can map:
    // To Do -> 'pending'
    // In Progress -> 'active'
    // Review -> 'paused' (maybe? or just skip review for now) -> Let's use 'paused' as a proxy or just keep 3 columns if easier.
    // Actually, Kanban usually implies moving things forward.
    // Let's map columns to statuses:
    // Next Up (Pending)
    // In Progress (Active)
    // Paused (Paused)
    // Completed (Closed)

    const columns = [
        { id: 'pending', title: 'To Do', cases: cases.filter(c => c.status === 'pending') },
        { id: 'active', title: 'In Progress', cases: cases.filter(c => c.status === 'active') },
        { id: 'paused', title: 'On Hold', cases: cases.filter(c => c.status === 'paused') },
        { id: 'closed', title: 'Done', cases: cases.filter(c => c.status === 'closed') }
    ];

    container.innerHTML = `
        <div class="kanban-container">
            ${columns.map(col => `
                <div class="kanban-column" ondragover="allowDrop(event)" ondrop="drop(event, '${col.id}')">
                    <div class="kanban-column-header">
                        <span class="kanban-column-title">${col.title}</span>
                        <span class="kanban-column-count">${col.cases.length}</span>
                    </div>
                    <div class="kanban-cards">
                        ${col.cases.map(c => createKanbanCard(c)).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Create HTML for a single Kanban card
function createKanbanCard(caseData) {
    const priorityClass = `priority-${caseData.priority}`;
    const typeClass = caseData.type || 'other';

    // Format date
    const date = caseData.nextDeadline ? new Date(caseData.nextDeadline).toLocaleDateString() : 'No deadline';

    return `
        <div id="${caseData.id}" class="kanban-card" draggable="true" ondragstart="drag(event)">
            <div class="kanban-card-title">${caseData.name}</div>
            <div style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.5rem;">${caseData.clientOrganizationName || 'Unknown Client'}</div>
            
            <div class="kanban-card-meta">
                <span class="kanban-card-badge ${typeClass}">${caseData.type}</span>
                <span class="kanban-card-badge ${priorityClass}">${caseData.priority}</span>
            </div>
            
            <div style="margin-top: 0.75rem; font-size: 0.75rem; color: #6b7280; display: flex; align-items: center; gap: 0.25rem;">
                <i class="fas fa-clock"></i> ${date}
            </div>
        </div>
    `;
}

// Drag & Drop Handlers
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add('dragging');
}

function drop(ev, newStatus) {
    ev.preventDefault();
    const caseId = ev.dataTransfer.getData("text");
    const caseElement = document.getElementById(caseId);

    if (caseElement) {
        caseElement.classList.remove('dragging');
    }

    // Update status in localStorage
    updateCaseStatus(caseId, newStatus);

    // Re-render
    renderKanbanView();
    // Also refresh other views/KPIs if they are in background
    if (typeof updateWorkKPIs === 'function') updateWorkKPIs();
}

// Update case status
function updateCaseStatus(caseId, newStatus) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);

    if (caseIndex !== -1) {
        cases[caseIndex].status = newStatus;
        cases[caseIndex].lastActivity = new Date().toISOString();
        localStorage.setItem('cases', JSON.stringify(cases));

        // Show feedback (optional)
        console.log(`Updated case ${caseId} to ${newStatus}`);
    }
}

// Expose functions
window.renderKanbanView = renderKanbanView;
window.allowDrop = allowDrop;
window.drag = drag;
window.drop = drop;
