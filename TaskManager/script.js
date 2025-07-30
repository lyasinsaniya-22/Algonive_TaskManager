let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editId = null; // Track currently editing task

document.getElementById("task-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("dueDate").value;

  if (!title || !description || !dueDate) return;

  if (editId) {
    // Editing an existing task
    tasks = tasks.map(task =>
      task.id === editId ? { ...task, title, description, dueDate } : task
    );
    editId = null;
    this.querySelector("button[type='submit']").innerText = "Add Task";
  } else {
    // Adding new task
    const newTask = {
      id: Date.now(),
      title,
      description,
      dueDate,
      completed: false,
    };
    tasks.push(newTask);
  }

  saveAndRender();
  this.reset();
});

function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  let filteredTasks = tasks;
  if (currentFilter === "active") {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";
    li.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.description}</p>
      <small>Due: ${new Date(task.dueDate).toLocaleString()}</small>
      ${isApproaching(task.dueDate) ? '<span style="color:red;"> ⏰ Approaching deadline</span>' : ""}
      <div class="task-actions">
        <button onclick="toggleComplete(${task.id})">${task.completed ? "Undo" : "Complete"}</button>
        <button onclick="editTask(${task.id})">Edit</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveAndRender();
}

function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("dueDate").value = task.dueDate;
  editId = id;
  document.querySelector("#task-form button[type='submit']").innerText = "Update Task";
}

function filterTasks(filter) {
  currentFilter = filter;
  renderTasks();
}

function isApproaching(date) {
  const now = new Date();
  const due = new Date(date);
  const diff = due - now;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000; // within 24 hours
}

// Initial render on page load
renderTasks();
