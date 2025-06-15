// Espera a que el contenido del HTML esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('registrationForm');
    if (!form) {
        // Si no estamos en la página de registro, no ejecutar nada.
        return;
    }

    // --- SIMULACIÓN DE BASE DE DATOS ---
    // En el futuro, estos datos vendrán de tu servidor.
    const locations = {
        'norte-santander': ['Cúcuta', 'Pamplona', 'Ocaña', 'Los Patios'],
        'antioquia': ['Medellín', 'Envigado', 'Bello', 'Itagüí'],
        'valle-cauca': ['Cali', 'Palmira', 'Buenaventura'],
        'bogota': ['Bogotá D.C.']
    };

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const roleSelector = document.getElementById('role');
    const dynamicFieldsSection = document.getElementById('dynamic-fields-section');
    const submitButton = form.querySelector('button[type="submit"]');

    const groupFullName = document.getElementById('groupFullName');
    const groupBusinessName = document.getElementById('groupBusinessName');
    
    const departmentSelector = document.getElementById('department');
    const citySelector = document.getElementById('city');
    const birthDateInput = document.getElementById('birthDate');
    const ageOutput = document.getElementById('calculatedAge');
    const categoryOutput = document.getElementById('calculatedCategory');
    
    // --- DEFINICIÓN DE ROLES ---
    const naturalPersonRoles = ['athlete', 'coach', 'judge', 'parent'];
    const legalEntityRoles = ['club', 'league', 'federation'];

    // --- FUNCIONES AUXILIARES ---
    const resetSelector = (selector, defaultText) => {
        selector.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
        selector.disabled = true;
    };

    const populateSelector = (selector, options) => {
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue.toLowerCase().replace(/\s+/g, '-');
            option.textContent = optionValue;
            selector.appendChild(option);
        });
        selector.disabled = false;
    };

    const calculateCategory = () => {
        if (!birthDateInput.value) {
            ageOutput.value = '';
            categoryOutput.value = '';
            return;
        }
        // La edad se calcula al 31 de diciembre del año de la competencia (2025).
        const birthYear = new Date(birthDateInput.value).getUTCFullYear();
        const ageAtYearEnd = 2025 - birthYear;
        ageOutput.value = ageAtYearEnd; // Guardamos la edad calculada.

        let category = 'No definida';
        // Lógica basada en la tabla de categorías del instructivo FECNA 2025.
        if (ageAtYearEnd >= 7 && ageAtYearEnd <= 9) category = 'Menores';
        else if (ageAtYearEnd >= 10 && ageAtYearEnd <= 11) category = 'Infantil A';
        else if (ageAtYearEnd >= 12 && ageAtYearEnd <= 13) category = 'Infantil B';
        else if (ageAtYearEnd >= 14 && ageAtYearEnd <= 15) category = 'Juvenil A';
        else if (ageAtYearEnd >= 16 && ageAtYearEnd <= 17) category = 'Juvenil B';
        else if (ageAtYearEnd >= 18 && ageAtYearEnd <= 20) category = 'Junior';
        else if (ageAtYearEnd >= 21) category = 'Mayores';
        
        categoryOutput.value = category; // Guardamos la categoría calculada.
    };

    // --- LÓGICA PRINCIPAL DE VISIBILIDAD ---
    const handleRoleChange = () => {
        const selectedRole = roleSelector.value;

        // Ocultar todas las secciones dinámicas al inicio
        document.querySelectorAll('.form__group-role, .form__group-dynamic').forEach(el => el.style.display = 'none');
        dynamicFieldsSection.style.display = 'none';

        if (!selectedRole) return;

        // Mostrar la sección principal de campos dinámicos y el botón de envío
        dynamicFieldsSection.style.display = 'block';
        submitButton.style.display = 'block';
        
        // Lógica de Nombre vs Razón Social
        if (naturalPersonRoles.includes(selectedRole)) {
            groupFullName.style.display = 'block';
            document.getElementById('fields-natural-person').style.display = 'block';
        } else if (legalEntityRoles.includes(selectedRole)) {
            groupBusinessName.style.display = 'block';
            // Ocultar los campos de persona natural para entidades jurídicas
            document.getElementById('fields-natural-person').style.display = 'none';
        }

        // Mostrar el bloque de campos específico para el rol si existe
        const specificRoleFields = document.getElementById(`fields-${selectedRole}`);
        if (specificRoleFields) {
            specificRoleFields.style.display = 'block';
        }
    };

    // --- VINCULACIÓN DE EVENTOS ---
    roleSelector.addEventListener('change', handleRoleChange);
    
    departmentSelector.addEventListener('change', () => {
        const selectedDepartment = departmentSelector.value;
        resetSelector(citySelector, 'Elige un departamento...');
        const cities = locations[selectedDepartment];
        if (cities) populateSelector(citySelector, cities);
    });

    if(birthDateInput) {
        birthDateInput.addEventListener('change', calculateCategory);
    }
});