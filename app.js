class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.filter = "all";
        this.bindEvents();
        this.render();
    }

    addTask() {
        let text = document.getElementById("taskInput").value.trim();
        let tag = document.getElementById("tagInput").value.trim();

        if (!text) return;

        this.tasks.push({
            text,
            tag: tag || "默认",
            done: false
        });

        this.save();
        this.render();

        document.getElementById("taskInput").value = "";
        document.getElementById("tagInput").value = "";
    }

    toggleTask(index) {
        this.tasks[index].done = !this.tasks[index].done;
        this.save();
        this.render();
    }

    deleteTask(index) {
        this.tasks.splice(index, 1);
        this.save();
        this.render();
    }

    editTask(index) {
        let newText = prompt("修改任务：", this.tasks[index].text);
        if (newText) {
            this.tasks[index].text = newText;
            this.save();
            this.render();
        }
    }

    save() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    render() {
        let list = document.getElementById("taskList");
        let keyword = document.getElementById("searchInput")?.value || "";

        list.innerHTML = "";

        this.tasks
        .filter(t => t.text.includes(keyword) || t.tag.includes(keyword))
        .forEach((task, index) => {

            let li = document.createElement("li");

            li.innerHTML = `
                <div>
                    <input type="checkbox"
                        ${task.done ? "checked" : ""}
                        onchange="app.toggleTask(${index})">

                    <span class="${task.done ? 'done' : ''}"
                          ondblclick="app.editTask(${index})">
                        ${task.text}
                    </span>

                    <span class="tag">${task.tag}</span>
                </div>

                <div>
                    <span class="edit" onclick="app.editTask(${index})">✏️</span>
                    <span class="delete" onclick="app.deleteTask(${index})">❌</span>
                </div>
            `;

            list.appendChild(li);
        });
    }

    bindEvents() {
        document.getElementById("taskInput")
        .addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.addTask();
        });
    }
}

// 🌟 全局实例
const app = new TodoApp();
