// Key used for saving tasks in localStorage
const STORAGE_KEY = "task_manager_tasks";

// Current tasks array
let tasks = [];

// Current filter: "all", "active", or "completed"
let currentFilter = "all";

// DOM elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskDateInput = document.getElementById("task-date");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");

// ---------- Initial Setup ----------

// Load tasks from localStorage when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadTasksFromStorage();
    renderTasks();
});

// ---------- Event Listeners ----------

// Add task on form submit
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = taskInput.value.trim();
    const dueDate = taskDateInput.value || null;

    if (title === "") {
        return;
    }

    const newTask = {
        id: Date.now().toString(), // unique id
        title: title,
        completed: false,
        dueDate: dueDate,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasksToStorage();
    renderTasks();

    taskInput.value = "";
    taskDateInput.value = "";
    taskInput.focus();
});

// Filter buttons (All / Active / Completed)
filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        // Update active class visually
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Update filter and re-render
        currentFilter = btn.getAttribute("data-filter");
        renderTasks();
    });
});

// Delegate events for task actions (checkbox, edit, delete)
taskList.addEventListener("click", (event) => {
    const target = event.target;
    const listItem = target.closest(".task-item");
    if (!listItem) return;

    const taskId = listItem.dataset.id;

    // Checkbox toggle
    if (target.classList.contains("task-checkbox")) {
        toggleTaskCompletion(taskId);
    }

    // Edit button
    if (target.classList.contains("edit-btn")) {
        editTask(taskId);
    }

    // Delete button
    if (target.classList.contains("delete-btn")) {
        deleteTask(taskId);
    }
});

// ---------- Functions ----------

// Load tasks array from localStorage
function loadTasksFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            tasks = JSON.parse(data);
        } else {
            tasks = [];
        }
    } catch (error) {
        console.error("Error reading tasks from localStorage:", error);
        tasks = [];
    }
}

// Save tasks array to localStorage
function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Render tasks list on the UI
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter((task) => {
        if (currentFilter === "active") {
            return !task.completed;
        } else if (currentFilter === "completed") {
            return task.completed;
        }
        return true; // "all"
    });

    if (filteredTasks.length === 0) {
        const emptyMsg = document.createElement("li");
        emptyMsg.textContent = "No tasks here. Add something!";
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.fontSize = "0.8rem";
        emptyMsg.style.color = "#6b7280";
        taskList.appendChild(emptyMsg);
        return;
    }

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.classList.add("task-item");
        li.dataset.id = task.id;

        // Left side (checkbox + text)
        const leftDiv = document.createElement("div");
        leftDiv.classList.add("task-left");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("task-checkbox");
        checkbox.checked = task.completed;

        const textGroup = document.createElement("div");
        textGroup.classList.add("task-text-group");

        const titleSpan = document.createElement("span");
        titleSpan.classList.add("task-title");
        titleSpan.textContent = task.title;
        if (task.completed) {
            titleSpan.classList.add("completed");
        }

        const metaSpan = document.createElement("span");
        metaSpan.classList.add("task-meta");
        metaSpan.textContent = formatTaskMeta(task);

        textGroup.appendChild(titleSpan);
        textGroup.appendChild(metaSpan);

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(textGroup);

        // Right side (buttons)
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("task-actions");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-btn");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(leftDiv);
        li.appendChild(actionsDiv);

        taskList.appendChild(li);
    });
}

// Format task meta info (due date + created time)
function formatTaskMeta(task) {
    let parts = [];

    if (task.dueDate) {
        parts.push("Due: " + task.dueDate);
    }

    // Optional: also show when it was created in a short form (date only)
    try {
        const createdDate = new Date(task.createdAt);
        const dateString = createdDate.toLocaleDateString();
        parts.push("Added: " + dateString);
    } catch (e) {
        // ignore
    }

    return parts.join(" • ");
}

// Toggle completed status of a task
function toggleTaskCompletion(id) {
    tasks = tasks.map((task) => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    saveTasksToStorage();
    renderTasks();
}

// Edit a task title (simple prompt)
function editTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newTitle = prompt("Edit task:", task.title);
    if (newTitle === null) {
        // user pressed Cancel
        return;
    }
    const trimmed = newTitle.trim();
    if (trimmed === "") {
        alert("Task title cannot be empty.");
        return;
    }

    task.title = trimmed;
    saveTasksToStorage();
    renderTasks();
}

// Delete a task
function deleteTask(id) {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    tasks = tasks.filter((task) => task.id !== id);
    saveTasksToStorage();
    renderTasks();
}
