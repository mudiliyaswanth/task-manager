let tasks = JSON.parse(localStorage.getItem("trelloTasks")) || [];
let theme = localStorage.getItem("theme") || "light";

const columns = document.querySelectorAll(".column");
const themeToggle = document.getElementById("themeToggle");

/* ---------------- THEME ---------------- */

if (theme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  theme = document.body.classList.contains("dark") ? "dark" : "light";
  themeToggle.textContent = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", theme);
});

/* ---------------- TASK LOGIC ---------------- */

function saveTasks() {
  localStorage.setItem("trelloTasks", JSON.stringify(tasks));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

function createCard(task) {
  const card = document.createElement("div");
  card.className = "card";
  if (task.status === "done") card.classList.add("completed");

  card.draggable = true;
  card.dataset.id = task.id;

  card.innerHTML = `
    <div>${task.text}</div>
    <small>🕒 Added: ${formatDate(task.createdAt)}</small>
    <small>📅 Completion: ${formatDate(task.dueDate)}</small>

    <div class="card-actions">
      ${task.status !== "done" ? `<button class="complete">✔️</button>` : ""}
      <button class="edit">✏️</button>
      <button class="delete">🗑</button>
    </div>
  `;

  /* Drag */
  card.addEventListener("dragstart", () => card.classList.add("dragging"));
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    updateStatus(card);
  });

  /* COMPLETE TASK */
  const completeBtn = card.querySelector(".complete");
  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      task.status = "done";              // ✅ move to done
      saveTasks();
      loadTasks();                       // refresh UI
    });
  }

  /* EDIT */
  card.querySelector(".edit").addEventListener("click", () => {
    const newText = prompt("Edit task:", task.text);
    if (!newText) return;
    task.text = newText;
    saveTasks();
    loadTasks();
  });

  /* DELETE */
  card.querySelector(".delete").addEventListener("click", () => {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    loadTasks();
  });

  return card;
}


function loadTasks() {
  columns.forEach(col => col.querySelector(".card-container").innerHTML = "");

  tasks.forEach(task => {
    const column = document.querySelector(
      `[data-status="${task.status}"] .card-container`
    );
    column.appendChild(createCard(task));
  });
}

function updateStatus(card) {
  const status = card.closest(".column").dataset.status;
  const task = tasks.find(t => t.id === card.dataset.id);
  task.status = status;
  saveTasks();
}

/* ---------------- ADD TASK ---------------- */

document.querySelectorAll(".add-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const text = prompt("Enter task name:");
    if (!text) return;

    const dueDate = prompt("Enter completion date (YYYY-MM-DD):");
    if (!dueDate) return;

    const status = btn.closest(".column").dataset.status;

    tasks.push({
      id: Date.now().toString(),
      text,
      status,
      createdAt: new Date().toISOString(),
      dueDate
    });

    saveTasks();
    loadTasks();
  });
});

/* ---------------- DRAG DROP ---------------- */

columns.forEach(column => {
  const container = column.querySelector(".card-container");

  container.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    container.appendChild(dragging);
  });
});

loadTasks();
