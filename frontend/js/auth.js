document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const idNumber = document.getElementById('idNumber').value.trim();
        const password = document.getElementById('password').value;

        if (!idNumber || !password) {
            alert('Please enter both ID Number and Password.');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idNumber, password })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Login failed. Please check your credentials.');
                return;
            }

            localStorage.setItem('loggedInUser', JSON.stringify(data.user));
            alert('Login successful! Redirecting...');
            window.location.href = 'index.html';
        } catch (error) {
            console.error(error);
            alert('Unable to complete login. Please try again later.');
        }
    });
});