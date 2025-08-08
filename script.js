// script.js - Manejo del widget modal y formularios sin usar import para evitar error "use import statement outside a module"

const SUPABASE_URL = 'https://jrkftgeobchmctpqeesi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impya2Z0Z2VvYmNobWN0cHFlZXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NzIzOTMsImV4cCI6MjA3MDI0ODM5M30.MYprdcXdz25yQXzMqPobGRXMb4ng7UuK2ZjNZWr2Y0Q';

function loadSupabaseScript(callback) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

function initApp() {
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const openBookingWidgetBtn = document.getElementById('openBookingWidget');
  const bookingModalOverlay = document.getElementById('bookingModalOverlay');
  const closeBookingModalBtn = document.getElementById('closeBookingModal');

  const services = [
    { id: 1, name: 'Corte de Cabello', description: 'Corte personalizado según tu estilo', price: 25, duration: 45 },
    { id: 2, name: 'Peinado Profesional', description: 'Peinados para eventos especiales', price: 20, duration: 30 },
    { id: 3, name: 'Tinte Completo', description: 'Color uniforme y duradero', price: 45, duration: 120 }
  ];

  let currentStep = 1;
  let selectedService = null;
  let selectedDate = null;

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const modalTitle = document.getElementById('modalTitle');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const serviceList = document.getElementById('serviceList');
  const dateInput = document.getElementById('dateInput');
  const serviceSummaryStep2 = document.getElementById('serviceSummaryStep2');
  const serviceSummaryStep3 = document.getElementById('serviceSummaryStep3');
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const comments = document.getElementById('comments');

  function renderServices() {
    serviceList.innerHTML = '';
    services.forEach(service => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.textContent = `${service.name} - $${service.price}`;
      div.title = service.description + ' - ' + service.duration + ' minutos';
      div.onclick = () => {
        selectedService = service;
        updateServiceSelection();
        nextBtn.disabled = false;
      };
      if (selectedService && selectedService.id === service.id) {
        div.classList.add('selected');
      }
      serviceList.appendChild(div);
    });
  }

  function updateServiceSelection() {
    renderServices();
  }

  function updateStep() {
    step1.style.display = currentStep === 1 ? 'block' : 'none';
    step2.style.display = currentStep === 2 ? 'block' : 'none';
    step3.style.display = currentStep === 3 ? 'block' : 'none';

    backBtn.disabled = currentStep === 1;
    nextBtn.textContent = currentStep === 3 ? 'Confirmar Reserva' : 'Continuar';

    modalTitle.textContent = currentStep === 1 ? 'Seleccionar Servicio' :
                             currentStep === 2 ? 'Fecha y Hora' :
                             'Información Personal';

    if (currentStep === 2) {
      // Set min date to today
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      dateInput.value = selectedDate || today;
      updateSummaryStep2();
      nextBtn.disabled = !selectedDate;
    } else if (currentStep === 3) {
      updateSummaryStep3();
      nextBtn.disabled = !fullName.value || !email.value;
    } else {
      nextBtn.disabled = !selectedService;
    }
  }

  function updateSummaryStep2() {
    if (!selectedService) return;
    serviceSummaryStep2.innerHTML = `
      <strong>Resumen del Servicio</strong><br/>
      Servicio: ${selectedService.name}<br/>
      Duración: ${selectedService.duration} minutos<br/>
      Precio: $${selectedService.price}
    `;
  }

  function updateSummaryStep3() {
    if (!selectedService) return;
    serviceSummaryStep3.innerHTML = `
      <strong>Resumen de tu Cita</strong><br/>
      Servicio: ${selectedService.name}<br/>
      Fecha: ${dateInput.value}<br/>
      Hora: 15:00<br/>
      Duración: ${selectedService.duration} min<br/>
      Precio: $${selectedService.price}
    `;
  }

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentStep === 1 && selectedService) {
      currentStep++;
      updateStep();
    } else if (currentStep === 2 && dateInput.value) {
      selectedDate = dateInput.value;
      currentStep++;
      updateStep();
    } else if (currentStep === 3) {
      if (!fullName.value || !email.value) {
        alert('Por favor, completa los campos obligatorios.');
        return;
      }
      // Enviar reserva a Supabase
      supabase
        .from('citas')
        .insert([{
          nombre: fullName.value,
          email: email.value,
          telefono: phone.value,
          mensaje: comments.value + `\nServicio: ${selectedService.name}, Fecha: ${dateInput.value}, Duración: ${selectedService.duration} min, Precio: $${selectedService.price}`
        }])
        .then(({ data, error }) => {
          if (error) {
            alert('Error al enviar la reserva: ' + error.message);
          } else {
            alert('Reserva confirmada. ¡Gracias, ' + fullName.value + '!');
            // Resetear formulario y estado
            currentStep = 1;
            selectedService = null;
            selectedDate = null;
            fullName.value = '';
            email.value = '';
            phone.value = '';
            comments.value = '';
            updateStep();
            closeModal();
          }
        });
    }
  });

  fullName.addEventListener('input', () => {
    nextBtn.disabled = !fullName.value || !email.value;
  });

  email.addEventListener('input', () => {
    nextBtn.disabled = !fullName.value || !email.value;
  });

  function openModal() {
    bookingModalOverlay.style.display = 'block';
    currentStep = 1;
    selectedService = null;
    selectedDate = null;
    fullName.value = '';
    email.value = '';
    phone.value = '';
    comments.value = '';
    updateStep();
  }

  function closeModal() {
    bookingModalOverlay.style.display = 'none';
  }

  openBookingWidgetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  closeBookingModalBtn.addEventListener('click', () => {
    closeModal();
  });

  // Cerrar modal al hacer clic fuera del contenido
  bookingModalOverlay.addEventListener('click', (e) => {
    if (e.target === bookingModalOverlay) {
      closeModal();
    }
  });

  // Inicializar servicios y estado
  renderServices();
  updateStep();
}

document.addEventListener('DOMContentLoaded', initApp);
