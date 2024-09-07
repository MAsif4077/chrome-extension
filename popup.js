document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

    chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        tasks.forEach(task => addTaskToList(task));
    });
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const task = { text: taskText, completed: false };
            chrome.storage.local.get(['tasks'], (result) => {
                const tasks = result.tasks || [];
                tasks.push(task);
                chrome.storage.local.set({ tasks }, () => {
                    addTaskToList(task);
                    taskInput.value = '';
                });
            });
        }
    });

    function addTaskToList(task) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span ${task.completed ? 'style="text-decoration: line-through;"' : ''}>${task.text}</span>
            <div>
                <button class="delete">Delete</button>
                <button class="complete">${task.completed ? 'Undo' : 'Complete'}</button>
            </div>
        `;
        li.querySelector('.complete').addEventListener('click', () => {
            task.completed = !task.completed;
            chrome.storage.local.get(['tasks'], (result) => {
                const tasks = result.tasks || [];
                const index = tasks.findIndex(t => t.text === task.text);
                tasks[index] = task;
                chrome.storage.local.set({ tasks }, () => {
                    li.querySelector('span').style.textDecoration = task.completed ? 'line-through' : 'none';
                    li.querySelector('.complete').textContent = task.completed ? 'Undo' : 'Complete';
                });
            });
        });
        li.querySelector('.delete').addEventListener('click', () => {
            chrome.storage.local.get(['tasks'], (result) => {
                const tasks = result.tasks || [];
                const index = tasks.findIndex(t => t.text === task.text);
                tasks.splice(index, 1);
                chrome.storage.local.set({ tasks }, () => {
                    taskList.removeChild(li);
                });
            });
        });

        taskList.appendChild(li);
    }
});
