document.addEventListener('DOMContentLoaded', function() {
    const scheduleContainer = document.getElementById('schedule');
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    auth.onAuthStateChanged(user => {
        loadSchedule(user ? true : false);
    });

    function loadSchedule(isOwner) {
        scheduleContainer.innerHTML = '';
        const today = new Date();
        const todayDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)

        for (let week = 0; week < 2; week++) {
            daysOfWeek.forEach((day, index) => {
                const scheduleItem = document.createElement('div');
                scheduleItem.classList.add('schedule-item');

                // Calculate the date for each day (showing 2 weeks)
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() - todayDay + index + (week * 7));

                const dayElement = document.createElement('span');
                dayElement.textContent = `${day} (${targetDate.getMonth() + 1}/${targetDate.getDate()})`;

                const tasksContainer = document.createElement('div');
                tasksContainer.classList.add('tasks-container');

                const addTaskButton = document.createElement('button');
                addTaskButton.textContent = 'Add Task';
                addTaskButton.disabled = !isOwner;

                addTaskButton.addEventListener('click', () => {
                    const newTaskInput = document.createElement('input');
                    newTaskInput.setAttribute('type', 'text');
                    newTaskInput.setAttribute('placeholder', `New task for ${day}`);
                    newTaskInput.disabled = !isOwner;

                    tasksContainer.appendChild(newTaskInput);

                    newTaskInput.addEventListener('change', () => {
                        if (isOwner) {
                            saveTasks(day, week, tasksContainer);
                        }
                    });
                });

                scheduleItem.appendChild(dayElement);
                scheduleItem.appendChild(tasksContainer);
                scheduleItem.appendChild(addTaskButton);
                scheduleContainer.appendChild(scheduleItem);

                // Fetch data from Firestore
                db.collection('schedule').doc(`${day}_week${week}`).get().then(doc => {
                    if (doc.exists) {
                        const tasks = doc.data().tasks || [];
                        tasks.forEach(task => {
                            const taskInput = document.createElement('input');
                            taskInput.setAttribute('type', 'text');
                            taskInput.value = task;
                            taskInput.disabled = !isOwner;
                            tasksContainer.appendChild(taskInput);

                            taskInput.addEventListener('change', () => {
                                if (isOwner) {
                                    saveTasks(day, week, tasksContainer);
                                }
                            });
                        });
                    }
                });
            });
        }
    }

    function saveTasks(day, week, tasksContainer) {
        const tasks = [];
        tasksContainer.querySelectorAll('input[type="text"]').forEach(input => {
            if (input.value.trim()) {
                tasks.push(input.value.trim());
            }
        });

        db.collection('schedule').doc(`${day}_week${week}`).set({
            tasks: tasks
        });
    }

    window.login = function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => console.error('Error signing in', error));
    };

    window.logout = function() {
        auth.signOut().catch(error => console.error('Error signing out', error));
    };
});
