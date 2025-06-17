// Espera a que el contenido del HTML esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {

    const COMPETITION_YEAR = 2025;

    const form = document.getElementById('registrationForm');
    if (!form) {
        return;
    }
    
    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const roleSelector = document.getElementById('role');
    const dynamicFieldsSection = document.getElementById('dynamic-fields-section');
    const fullNameInput = document.getElementById('fullName');
    const businessNameInput = document.getElementById('businessName');
    const departmentSelector = document.getElementById('department');
    const citySelector = document.getElementById('city');
    const birthDateInput = document.getElementById('birthDate');
    const ageOutput = document.getElementById('calculatedAge');
    const categoryOutput = document.getElementById('calculatedCategory');
    const messageContainer = document.getElementById('form-message');
    const groupBirthDate = document.getElementById('groupBirthDate');
    const groupGender = document.getElementById('groupGender');
    const genderSelector = document.getElementById('gender');
    
    // --- DEFINICIÓN DE ROLES ---
    const naturalPersonRoles = ['athlete', 'coach', 'judge', 'parent'];
    const legalEntityRoles = ['club', 'league', 'federation'];

    // --- FUNCIONES AUXILIARES ---
    const resetSelector = (selector, defaultText, disabled = true) => {
        selector.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
        selector.disabled = disabled;
    };
    
    const showMessage = (message, type = 'error') => {
        messageContainer.textContent = message;
        messageContainer.className = `form__message form__message--${type}`;
    };

    const clearMessage = () => {
        messageContainer.textContent = '';
        messageContainer.className = 'form__message';
    };

    // --- Función para resetear los campos del formulario ---
    const resetDynamicFields = () => {
        clearMessage();
        const fieldsToReset = dynamicFieldsSection.querySelectorAll('input, select');
        
        fieldsToReset.forEach(field => {
            if (field.tagName === 'INPUT') {
                // --- ¡ESTA ES LA CORRECCIÓN! ---
                // Solo limpia el campo si NO es de solo lectura (readonly).
                if (!field.readOnly) {
                    field.value = '';
                }
            } else if (field.tagName === 'SELECT') {
                field.selectedIndex = 0;
            }
        });
        
        resetSelector(citySelector, 'Elige un departamento...');
    };

    // --- LÓGICA DE CONEXIÓN CON API ---
    const loadDepartments = async () => {
        try {
            resetSelector(departmentSelector, 'Cargando departamentos...', true);
            const response = await fetch('https://api-colombia.com/api/v1/Department');
            if (!response.ok) throw new Error('No se pudo conectar a la API.');
            const departments = await response.json();
            
            resetSelector(departmentSelector, 'Selecciona un departamento...', false);
            departments.sort((a, b) => a.name.localeCompare(b.name));

            departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department.id;
                option.textContent = department.name;
                departmentSelector.appendChild(option);
            });
        } catch (error) {
            console.error("Error cargando departamentos:", error);
            resetSelector(departmentSelector, 'Error al cargar datos', true);
        }
    };

    const loadCities = async (departmentId) => {
        try {
            resetSelector(citySelector, 'Cargando municipios...', true);
            const response = await fetch(`https://api-colombia.com/api/v1/Department/${departmentId}/cities`);
            if (!response.ok) throw new Error('No se pudo conectar a la API.');
            const cities = await response.json();
            
            resetSelector(citySelector, 'Selecciona un municipio...', false);
            cities.sort((a, b) => a.name.localeCompare(b.name));
            
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelector.appendChild(option);
            });
        } catch (error) {
            console.error("Error cargando municipios:", error);
            resetSelector(citySelector, 'Error al cargar datos', true);
        }
    };
    
    // --- LÓGICA DE VISIBILIDAD Y VALIDACIÓN ---
    const calculateCategory = () => {
        if (!birthDateInput.value) {
            ageOutput.value = '';
            categoryOutput.value = '';
            return;
        }
        const birthYear = new Date(birthDateInput.value).getUTCFullYear();
        const ageAtYearEnd = COMPETITION_YEAR - birthYear;
        ageOutput.value = ageAtYearEnd;

        let category = 'No definida';
        if (ageAtYearEnd >= 7 && ageAtYearEnd <= 9) category = 'Menores';
        else if (ageAtYearEnd >= 10 && ageAtYearEnd <= 11) category = 'Infantil A';
        else if (ageAtYearEnd >= 12 && ageAtYearEnd <= 13) category = 'Infantil B';
        else if (ageAtYearEnd >= 14 && ageAtYearEnd <= 15) category = 'Juvenil A';
        else if (ageAtYearEnd >= 16 && ageAtYearEnd <= 17) category = 'Juvenil B';
        else if (ageAtYearEnd >= 18 && ageAtYearEnd <= 20) category = 'Junior';
        else if (ageAtYearEnd >= 21) category = 'Mayores';
        
        categoryOutput.value = category;
    };

    const handleRoleChange = () => {
        resetDynamicFields();

        const selectedRole = roleSelector.value;
        document.querySelectorAll('.form__group-role, .form__group-dynamic').forEach(el => el.style.display = 'none');
        dynamicFieldsSection.style.display = 'none';
        fullNameInput.required = false;
        businessNameInput.required = false;
        document.getElementById('fields-natural-person').querySelectorAll('input, select').forEach(input => input.required = false);

        if (!selectedRole) return;
        dynamicFieldsSection.style.display = 'block';
        
        if (naturalPersonRoles.includes(selectedRole)) {
            groupFullName.style.display = 'block';
            fullNameInput.required = true;
            const naturalPersonFields = document.getElementById('fields-natural-person');
            naturalPersonFields.style.display = 'block';
            // Hacer requeridos solo los campos de ubicación, que son comunes a todas las personas naturales.
            const locationFields = naturalPersonFields.querySelectorAll('#department, #city');
            locationFields.forEach(field => field.required = true);

            if (selectedRole === 'athlete') {
                // Para DEPORTISTAS: mostrar y requerir fecha de nacimiento y género.
                groupBirthDate.style.display = 'block';
                groupGender.style.display = 'block';
                birthDateInput.required = true;
                genderSelector.required = true;
            } else {
                // Para OTROS ROLES (entrenador, juez): ocultar y NO requerir estos campos.
                groupBirthDate.style.display = 'none';
                groupGender.style.display = 'none';
                birthDateInput.required = false;
                genderSelector.required = false;
            }            
        } else if (legalEntityRoles.includes(selectedRole)) {
            groupBusinessName.style.display = 'block';
            businessNameInput.required = true;
            document.getElementById('fields-natural-person').style.display = 'none';
        }
    };

    // Convertimos la función a 'async' para poder usar 'await'
const handleFormSubmit = async (event) => {
    event.preventDefault(); 
    clearMessage();

    // --- La validación inicial se mantiene igual ---
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden. Por favor, verifica.');
        return;
    }
    if (password.length < 8) {
        showMessage('La contraseña debe tener al menos 8 caracteres.');
        return;
    }

    // --- Lógica de envío de datos con FETCH ---

    // 1. Recolectar todos los datos del formulario en un objeto
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log("Datos que se enviarán al servidor:", data);

    // 2. Enviar los datos al servidor de forma asíncrona
    try {
        // Muestra un mensaje de "cargando" al usuario
        showMessage('Creando tu cuenta...', 'info'); // 'info' sería un nuevo estilo que puedes añadir

        // Debes reemplazar '/api/register' con la URL real de tu backend
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            // El servidor respondió con éxito (ej. código 200-299)
            const result = await response.json();
            console.log('Respuesta del servidor:', result);
            showMessage('¡Cuenta creada con éxito!', 'success');
            // Opcional: Redirigir al usuario a la página de login después de un momento
            // setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        } else {
            // El servidor respondió con un error (ej. email ya existe, código 400)
            const errorData = await response.json();
            showMessage(`Error: ${errorData.message || 'Ocurrió un problema.'}`, 'error');
        }

    } catch (error) {
        // Error de red (ej. no hay conexión a internet)
        console.error('Error de red:', error);
        showMessage('Error de conexión. Por favor, revisa tu internet.', 'error');
    }
};

    // --- VINCULACIÓN DE EVENTOS ---
    roleSelector.addEventListener('change', handleRoleChange);
    
    departmentSelector.addEventListener('change', () => {
        const selectedDepartmentId = departmentSelector.value;
        if (selectedDepartmentId) {
            loadCities(selectedDepartmentId);
        } else {
            resetSelector(citySelector, 'Elige un departamento...');
        }
    });

    if(birthDateInput) {
        birthDateInput.addEventListener('change', calculateCategory);
    }

    form.addEventListener('submit', handleFormSubmit);

    // --- INICIALIZACIÓN ---
    loadDepartments();
});