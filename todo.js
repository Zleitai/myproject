import { saveTasks, loadTasks } from "./storage.js";

export class TodoApp {
    constructor() {
        this.tasks = loadTasks();
        this.bindEvents();
        this.render();
    }

    addTask(text, tag) {
        this.tasks.push({ text, tag, done: false });
        this.update();
    }

    toggle(index) {
        this.tasks[index].done = !this.tasks[index].done;
        this.update();
    }

    delete(index) {
        this.tasks.splice(index, 1);
        this.update();
    }

    update() {
        saveTasks(this.tasks);
        this.render();
    }

    render() {
        let list = document.getElementById("taskList");
        list.innerHTML = "";

        this.tasks.forEach((t, i) => {
            let li = document.createElement("li");

            li.innerHTML = `
                <span onclick="app.toggle(${i})">
                    ${t.done ? "✔" : "○"} ${t.text}
                </span>

                <span onclick="app.delete(${i})">❌</span>
            `;

            list.appendChild(li);
        });
    }

    bindEvents() {
        document.getElementById("taskInput")
        .addEventListener("keydown", e => {
            if (e.key === "Enter") {
                let input = document.getElementById("taskInput");
                let value = input.value;
                this.addTask(value, "默认");
                input.value = "";
            }
        });
    }
}
