document.addEventListener('DOMContentLoaded', function() {
    const scheduleContainer = document.getElementById('schedule');
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    auth.onAuthStateChanged(user => {
        if (user) {
            loadSchedule(true);
        } else {
            loadSchedule(false);
        }
    });

    function loadSchedule(isOwner) {
        scheduleContainer.innerHTML = '';
        daysOfWeek.forEach(day => {
            const scheduleItem = document.createElement('div');
            scheduleItem.classList.add('schedule-item');

            const date = new Date();
            const dayElement = document.createElement('span');
            dayElement.textContent = `${day} (${date.getMonth() + 1}/${date.getDate() + daysOfWeek.indexOf(day)})`;

            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('placeholder', `Tasks for ${day}`);
            input.disabled = !isOwner;

            scheduleItem.appendChild(dayElement);
            scheduleItem.appendChild(input);
            scheduleContainer.appendChild(scheduleItem);

            db.collection('schedule').doc(day).get().then(doc => {
                if (doc.exists) {
                    input.value = doc.data().task;
                }
            });

            input.addEventListener('change', () => {
                if (isOwner) {
                    db.collection('schedule').doc(day).set({
                        task: input.value
                    });
                }
            });
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
