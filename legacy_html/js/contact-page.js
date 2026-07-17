const CONTACT_API_MESSAGES = {
    no: {
        sending: 'Sender meldingen...',
        success: 'Takk. Meldingen er sendt og lagret.',
        successNoEmail: 'Meldingen er sendt og lagret, men e-postvarsling er ikke aktivert enda.',
        successEmailOnly: 'Meldingen er sendt på e-post, men kunne ikke lagres i systemet.',
        validation: 'Fyll ut navn, e-post og en melding på minst 10 tegn, og godkjenn lagring.',
        network: 'Noe gikk galt. Prøv igjen om litt.',
        backendMissing: 'Backend svarer ikke. Start `node server.js` hvis du kjører lokalt.'
    },
    en: {
        sending: 'Sending your message...',
        success: 'Thanks. Your message has been sent and stored.',
        successNoEmail: 'Your message has been sent and stored, but email notifications are not configured yet.',
        successEmailOnly: 'Your message was sent by email, but could not be stored in the system.',
        validation: 'Please fill in name, email and a message with at least 10 characters, and confirm consent.',
        network: 'Something went wrong. Please try again shortly.',
        backendMissing: 'The backend did not respond. Start `node server.js` when running locally.'
    }
};

function getContactPageLang() {
    try {
        return localStorage.getItem('site_lang') === 'en' ? 'en' : 'no';
    } catch (error) {
        return 'no';
    }
}

function getContactApiUrl() {
    const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (window.location.protocol === 'file:') {
        return 'http://localhost:3000/api/contact';
    }

    if (isLocalHost && window.location.port && window.location.port !== '3000') {
        return 'http://localhost:3000/api/contact';
    }

    return '/api/contact';
}

function setContactStatus(element, state, message) {
    if (!element) return;

    element.className = `form-status ${state}`;
    element.textContent = message;
}

function focusContactField(field) {
    if (!field) return;
    field.focus();
    if (typeof field.scrollIntoView === 'function') {
        field.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

function withWarning(baseMessage, warningText) {
    const cleanWarning = String(warningText || '').trim();
    if (!cleanWarning) {
        return baseMessage;
    }
    return `${baseMessage} (${cleanWarning})`;
}

function initContactPageForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactFormStatus');
    const submitButton = document.getElementById('contactSubmitButton');
    const nameField = document.getElementById('contact-name');
    const emailField = document.getElementById('contact-email');
    const messageField = document.getElementById('contact-message');
    const consentField = document.getElementById('contact-consent');

    if (!form || !status || !submitButton) {
        return;
    }

    form.addEventListener('input', () => {
        if (status.classList.contains('error')) {
            setContactStatus(status, '', '');
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const lang = getContactPageLang();
        const messages = CONTACT_API_MESSAGES[lang];
        const formData = new FormData(form);

        const rawMessage = String(formData.get('message') || '').trim();
        if (!formData.get('name') || !formData.get('name').toString().trim()) {
            setContactStatus(status, 'error', messages.validation);
            if (nameField) {
                nameField.value = '';
                focusContactField(nameField);
            }
            return;
        }

        if (!formData.get('email') || !formData.get('email').toString().trim()) {
            setContactStatus(status, 'error', messages.validation);
            if (emailField) {
                emailField.value = '';
                focusContactField(emailField);
            }
            return;
        }

        if (!rawMessage || rawMessage.length < 10) {
            setContactStatus(status, 'error', messages.validation);
            if (messageField) {
                focusContactField(messageField);
            }
            return;
        }

        if (consentField && !consentField.checked) {
            setContactStatus(status, 'error', messages.validation);
            focusContactField(consentField);
            return;
        }

        const service = formData.get('service') || 'Webdesign + SEO (Anbefalt)';
        const designStyle = formData.get('design_style') || 'Moderne & Rent';
        const selectedFeatures = Array.from(formData.getAll('features')).join(', ') || 'Ingen spesifisert';
        
        const compiledMessage = `--- Prosjekt-Konfigurasjon ---\nTjeneste: ${service}\nStil: ${designStyle}\nFunksjoner: ${selectedFeatures}\n-----------------------------\n\nMelding:\n${rawMessage}`;

        const payload = {
            name: String(formData.get('name') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            company: String(formData.get('company') || '').trim(),
            subject: `Forespørsel: ${service}`,
            message: compiledMessage,
            consent: formData.get('consent') === 'on',
            website: String(formData.get('website') || '').trim(),
            sourcePage: 'contact.html'
        };

        submitButton.disabled = true;
        setContactStatus(status, 'loading', messages.sending);

        try {
            const response = await fetch(getContactApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || result.details || messages.network);
            }

            form.reset();

            // Set progress to 100% on success
            const progressFill = document.getElementById('croProgressBar');
            if (progressFill) progressFill.style.width = '100%';
            for (let i = 1; i <= 3; i++) {
                const ind = document.getElementById(`stepIndicator${i}`);
                if (ind) ind.className = 'completed';
            }

            // Reset cards selection styling
            document.querySelectorAll('.cro-choice-card').forEach(card => {
                const input = card.querySelector('input');
                if (input && input.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });

            if (result.emailSent === false) {
                setContactStatus(status, 'success', withWarning(messages.successNoEmail, result.emailWarning));
            } else if (result.saved === false) {
                setContactStatus(status, 'success', withWarning(messages.successEmailOnly, result.saveWarning));
            } else {
                setContactStatus(status, 'success', messages.success);
            }
        } catch (error) {
            const fallbackMessage = error.message && error.message.includes('Failed to fetch')
                ? messages.backendMissing
                : (error.message || messages.network);

            setContactStatus(status, 'error', fallbackMessage);
        } finally {
            submitButton.disabled = false;
        }
    });
}

// Step Configurator Logic
window.croCurrentStep = 1;

window.croGoToStep = function(stepIndex) {
    if (stepIndex < 1 || stepIndex > 3) return;
    
    // Hide all step panels
    document.querySelectorAll('.cro-step-panel').forEach(panel => {
        panel.style.display = 'none';
        panel.classList.remove('active');
    });
    
    // Show current step panel
    const activePanel = document.getElementById(`croStep${stepIndex}`);
    if (activePanel) {
        activePanel.style.display = 'flex';
        setTimeout(() => activePanel.classList.add('active'), 20);
    }
    
    // Update progress bar
    const progressFill = document.getElementById('croProgressBar');
    if (progressFill) {
        const widths = { 1: '25%', 2: '60%', 3: '85%' };
        progressFill.style.width = widths[stepIndex];
    }
    
    // Update step indicators
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`stepIndicator${i}`);
        if (ind) {
            if (i < stepIndex) {
                ind.className = 'completed';
            } else if (i === stepIndex) {
                ind.className = 'active';
            } else {
                ind.className = '';
            }
        }
    }
    
    window.croCurrentStep = stepIndex;
    
    // Scroll form into view
    const form = document.getElementById('contactForm');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.updateChoiceCardSelection = function(radioName) {
    const radios = document.getElementsByName(radioName);
    radios.forEach(radio => {
        const card = radio.closest('.cro-choice-card');
        if (card) {
            if (radio.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }
    });
};

window.updateCheckboxCardSelection = function(checkbox) {
    const card = checkbox.closest('.cro-choice-card');
    if (card) {
        if (checkbox.checked) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }
};

function selectServiceFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    if (!service) return;
    
    const select = document.getElementById('contact-service');
    if (!select) return;
    
    if (service === 'support') {
        select.value = 'Løpende drift og support';
    } else if (service === 'webdesign') {
        select.value = 'Webdesign + SEO (Anbefalt)';
    } else if (service === 'seo') {
        select.value = 'SEO Søkemotoroptimalisering';
    } else if (service === 'some') {
        select.value = 'SoMe Innholdsstrategi';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initContactPageForm();
    selectServiceFromQuery();
});
