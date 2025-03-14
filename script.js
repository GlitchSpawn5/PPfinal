let token = null;
let isLogin = true;

function loginForm() {
    return `
        <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" required>
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" required>
        </div>
        <button type="submit" id="auth-btn" class="btn btn-primary w-100">Login</button>
    `;
}

function signupForm() {
    // Unchanged signup form code
    return `
        <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" required>
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" required>
        </div>
        <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" class="form-control" id="name" required>
        </div>
        <div class="mb-3">
            <label for="age" class="form-label">Age</label>
            <input type="number" class="form-control" id="age" required>
        </div>
        <div class="mb-3">
            <label for="gender" class="form-label">Gender</label>
            <input type="text" class="form-control" id="gender" required>
        </div>
        <div class="mb-3">
            <label for="pastMedicalIssues" class="form-label">Past Medical Issues</label>
            <input type="text" class="form-control" id="pastMedicalIssues">
        </div>
        <div class="mb-3">
            <label for="existingIllnessesAllergies" class="form-label">Existing Illnesses/Allergies</label>
            <input type="text" class="form-control" id="existingIllnessesAllergies">
        </div>
        <div class="mb-3">
            <label for="phoneNumber" class="form-label">Phone Number</label>
            <input type="text" class="form-control" id="phoneNumber" required>
        </div>
        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" required>
        </div>
        <div class="mb-3">
            <label for="cityOfResidence" class="form-label">City of Residence</label>
            <input type="text" class="form-control" id="cityOfResidence" required>
        </div>
        <div class="mb-3">
            <label for="height" class="form-label">Height (m)</label>
            <input type="number" step="0.01" class="form-control" id="height" required>
        </div>
        <div class="mb-3">
            <label for="weight" class="form-label">Weight (kg)</label>
            <input type="number" step="0.1" class="form-control" id="weight" required>
        </div>
        <button type="submit" id="auth-btn" class="btn btn-primary w-100">Signup</button>
    `;
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    document.querySelectorAll('main section').forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    if (!authForm) {
        console.error('auth-form element not found');
        return;
    }

    authForm.innerHTML = loginForm();

    document.getElementById('toggle-auth').addEventListener('click', () => {
        isLogin = !isLogin;
        document.getElementById('auth-title').textContent = isLogin ? 'Login' : 'Signup';
        document.getElementById('auth-btn').textContent = isLogin ? 'Login' : 'Signup';
        document.getElementById('toggle-auth').textContent = isLogin ? 'Need an account? Sign up' : 'Already have an account? Login';
        authForm.reset();
        authForm.innerHTML = isLogin ? loginForm() : signupForm();
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (isLogin) {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            console.log('Login response:', data); // Add this line to inspect the response
            if (data.token) {
                token = data.token;
                localStorage.setItem('token', token);
                document.getElementById('auth-container').style.display = 'none';
                const header = document.querySelector('header');
                const main = document.querySelector('main');
                header.style.display = 'block';
                main.style.display = 'block';
                main.classList.add('active');
                showSection('dashboard');
                window.location.hash = '#dashboard';
                await updateDashboard();
            } else {
                alert(data.message || 'Login failed');
            }
        } else {
            const formData = {
                username,
                password,
                name: document.getElementById('name').value,
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                pastMedicalIssues: document.getElementById('pastMedicalIssues').value || '',
                existingIllnessesAllergies: document.getElementById('existingIllnessesAllergies').value || '',
                phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                cityOfResidence: document.getElementById('cityOfResidence').value,
                height: document.getElementById('height').value,
                weight: document.getElementById('weight').value
            };
            const response = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log('Signup response:', data); // Optional: Inspect signup response too
            alert(data.message || 'Signup failed');
            if (response.status === 201) document.getElementById('toggle-auth').click();
        }
    });

    token = localStorage.getItem('token');
    if (token) {
        document.getElementById('auth-container').style.display = 'none';
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        header.style.display = 'block';
        main.style.display = 'block';
        main.classList.add('active');
        showSection('dashboard');
        window.location.hash = '#dashboard';
updateDashboard().catch(error => {
    console.error('Error initializing dashboard:', error);
});
    }
});

async function fetchData(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`http://localhost:3000/api/${endpoint}`, options);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    return response.json();
}

async function updateDashboard() {
    try {
        const stats = await fetchData('stats');
        document.getElementById('health-score').textContent = `${stats.healthScore}%`;
        document.getElementById('prescriptions').textContent = stats.prescriptions;
        document.getElementById('appointments-count').textContent = stats.appointments;
        document.getElementById('records-count').textContent = stats.records;
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}