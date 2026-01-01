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
    let dateDisplay = 'No deadline';
    if (caseData.nextDeadline) {
        const d = new Date(caseData.nextDeadline);
        dateDisplay = d.toLocaleDateString();
    }

    return `
        <div id="${caseData.id}" class="kanban-card" draggable="true" ondragstart="drag(event)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
                <div class="kanban-card-title" ondblclick="editKanbanTitle('${caseData.id}', event)" title="Double-click to edit title" style="flex: 1; margin-right: 0.5rem; margin-bottom: 0;">
                    ${caseData.name}
                </div>
                <button 
                    draggable="false"
                    onclick="event.preventDefault(); event.stopPropagation(); console.log('Edit clicked for ${caseData.id}'); openEditCaseModal('${caseData.id}')" 
                    onmousedown="event.stopPropagation()" 
                    onmouseup="event.stopPropagation()"
                    onpointerdown="event.stopPropagation()"
                    style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; font-size: 0.875rem; z-index: 100; position: relative; pointer-events: auto;" 
                    title="Edit Details">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            </div>
            
            <div style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.5rem;">${caseData.clientOrganizationName || 'Unknown Client'}</div>
            
            <div class="kanban-card-meta">
                <span class="kanban-card-badge ${typeClass}">${caseData.type}</span>
                <span class="kanban-card-badge ${priorityClass}" onclick="editKanbanPriority('${caseData.id}', event)" title="Click to change priority" style="cursor: pointer;">
                    ${caseData.priority}
                </span>
            </div>
            
            <div style="margin-top: 0.75rem; font-size: 0.75rem; color: #6b7280; display: flex; align-items: center; gap: 0.25rem; cursor: pointer;" onclick="editKanbanDeadline('${caseData.id}', event)" title="Click to change deadline">
                <i class="fas fa-clock"></i> <span id="deadline-text-${caseData.id}">${dateDisplay}</span>
            </div>
        </div>
    `;
}

// Inline Edit: Title
function editKanbanTitle(id, event) {
    event.stopPropagation(); // Prevent drag interference if needed
    const div = event.target;
    const currentTitle = div.innerText;

    div.innerHTML = `<input type="text" id="edit-title-${id}" value="${currentTitle}" style="width: 100%; border: 1px solid #3b82f6; padding: 2px; border-radius: 4px;">`;
    const input = document.getElementById(`edit-title-${id}`);
    input.focus();

    input.onblur = () => saveKanbanEdit(id, 'name', input.value);
    input.onkeydown = (e) => {
        if (e.key === 'Enter') saveKanbanEdit(id, 'name', input.value);
        if (e.key === 'Escape') renderKanbanView(); // Cancel
    };
}

// Inline Edit: Priority
function editKanbanPriority(id, event) {
    event.stopPropagation();
    const span = event.target;
    // Don't replace if already editing
    if (span.querySelector('select')) return;

    const currentPriority = span.innerText.toLowerCase();

    const select = document.createElement('select');
    select.innerHTML = `
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
    `;
    select.value = currentPriority;
    select.style.fontSize = '0.75rem';
    select.style.padding = '0';
    select.onclick = (e) => e.stopPropagation();

    span.innerHTML = '';
    span.appendChild(select);
    select.focus();

    let saved = false;
    const save = () => {
        if (saved) return;
        saved = true;
        saveKanbanEdit(id, 'priority', select.value);
    };

    select.onchange = save;
    select.onblur = save;
}

// Inline Edit: Deadline
function editKanbanDeadline(id, event) {
    event.stopPropagation();
    const container = event.currentTarget;
    const span = document.getElementById(`deadline-text-${id}`);
    if (!span) return;

    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const c = cases.find(x => x.id === id);
    const currentDateVal = c && c.nextDeadline ? c.nextDeadline.split('T')[0] : '';

    const input = document.createElement('input');
    input.type = 'date';
    input.value = currentDateVal;
    input.style.fontSize = '0.75rem';
    input.onclick = (e) => e.stopPropagation();

    span.style.display = 'none';
    container.appendChild(input);
    input.focus();

    let saved = false;
    const save = () => {
        if (saved) return;
        saved = true;
        saveKanbanEdit(id, 'nextDeadline', input.value);
    };

    input.onchange = save;
    input.onblur = save;
}

// Universal Save Function for Kanban
function saveKanbanEdit(id, field, value) {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const index = cases.findIndex(c => c.id === id);
    if (index !== -1) {
        if (field === 'nextDeadline') {
            if (value) {
                cases[index][field] = new Date(value).toISOString();
            } else {
                cases[index][field] = null;
            }
        } else {
            cases[index][field] = value;
        }

        cases[index].lastActivity = new Date().toISOString();
        localStorage.setItem('cases', JSON.stringify(cases));

        // Refresh views
        renderKanbanView();
        if (typeof updateWorkKPIs === 'function') updateWorkKPIs();
    }
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
window.editKanbanTitle = editKanbanTitle;
window.editKanbanPriority = editKanbanPriority;
window.editKanbanDeadline = editKanbanDeadline;
