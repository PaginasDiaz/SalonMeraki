import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const adminContent = document.getElementById('adminContent');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const citasTableBody = document.querySelector('#citasTable tbody');

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showAdmin();
    } else {
        showLogin();
    }
}

function showLogin() {
    loginSection.style.display = 'block';
    adminContent.style.display = 'none';
}

function showAdmin() {
    loginSection.style.display = 'none';
    adminContent.style.display = 'block';
    loadCitas();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        loginError.textContent = 'Error de autenticación: ' + error.message;
    } else {
        showAdmin();
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showLogin();
});

async function loadCitas() {
    const { data, error } = await supabase
        .from('citas')
        .select('*')
        .order('fecha_creacion', { ascending: false });

    if (error) {
        alert('Error al cargar citas: ' + error.message);
        return;
    }

    citasTableBody.innerHTML = '';
    data.forEach(cita => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cita.nombre}</td>
            <td>${cita.email}</td>
            <td>${cita.telefono || ''}</td>
            <td>${cita.mensaje}</td>
            <td>${new Date(cita.fecha_creacion).toLocaleString()}</td>
            <td><button class="delete-btn" data-id="${cita.id}">Eliminar</button></td>
        `;
        citasTableBody.appendChild(tr);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (confirm('¿Seguro que deseas eliminar esta cita?')) {
                const { error } = await supabase.from('citas').delete().eq('id', id);
                if (error) {
                    alert('Error al eliminar: ' + error.message);
                } else {
                    loadCitas();
                }
            }
        });
    });
}

checkSession();
