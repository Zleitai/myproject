let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// 🌙
function toggleDark() {
    document.body.classList.toggle("dark");
}

// ➕
function addTask() {
    let text = document.getElementById("taskInput").value.trim();
    let tag = document.getElementById("tagInput").value.trim();

    if (!text) return;

    tasks.push({
        text,
        tag: tag || "默认",
        done: false
    });

    save();
    render();

    document.getElementById("taskInput").value = "";
    document.getElementById("tagInput").value = "";
}

// ✔
function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    save();
    render();
}

// ❌
function deleteTask(index) {
    tasks.splice(index, 1);
    save();
    render();
}

// ✏️
function editTask(index) {
    let newText = prompt("修改任务：", tasks[index].text);
    if (newText) {
        tasks[index].text = newText;
        save();
        render();
    }
}

// 💾
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 🔍
function render() {
    let list = document.getElementById("taskList");
    let keyword = document.getElementById("searchInput").value || "";

    list.innerHTML = "";

    tasks
    .filter(t => t.text.includes(keyword) || t.tag.includes(keyword))
    .forEach((task, index) => {

        let li = document.createElement("li");

        li.innerHTML = `
            <div>
                <input type="checkbox"
                    ${task.done ? "checked" : ""}
                    onchange="toggleTask(${index})">

                <span class="${task.done ? 'done' : ''}"
                      ondblclick="editTask(${index})">
                    ${task.text}
                </span>

                <span class="tag">${task.tag}</span>
            </div>

            <div>
                <span class="edit" onclick="editTask(${index})">✏️</span>
                <span class="delete" onclick="deleteTask(${index})">❌</span>
            </div>
        `;

        list.appendChild(li);
    });
}

render();
