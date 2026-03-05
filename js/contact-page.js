const CONTACT_API_MESSAGES = {
    no: {
        sending: 'Sender meldingen...',
        success: 'Takk. Meldingen er sendt og lagret.',
        successNoEmail: 'Meldingen er sendt og lagret, men e-postvarsling er ikke aktivert enda.',
        validation: 'Fyll ut navn, e-post og en melding, og godkjenn lagring.',
        network: 'Noe gikk galt. Prøv igjen om litt.',
        backendMissing: 'Backend svarer ikke. Start `node server.js` hvis du kjører lokalt.'
    },
    en: {
        sending: 'Sending your message...',
        success: 'Thanks. Your message has been sent and stored.',
        successNoEmail: 'Your message has been sent and stored, but email notifications are not configured yet.',
        validation: 'Please fill in name, email and a message, and confirm consent.',
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
        const payload = {
            name: String(formData.get('name') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            company: String(formData.get('company') || '').trim(),
            subject: String(formData.get('subject') || '').trim(),
            message: String(formData.get('message') || '').trim(),
            consent: formData.get('consent') === 'on',
            website: String(formData.get('website') || '').trim(),
            sourcePage: 'contact.html'
        };

        if (!payload.name) {
            setContactStatus(status, 'error', messages.validation);
            if (nameField) {
                nameField.value = '';
                focusContactField(nameField);
            }
            return;
        }

        if (!payload.email) {
            setContactStatus(status, 'error', messages.validation);
            if (emailField) {
                emailField.value = '';
                focusContactField(emailField);
            }
            return;
        }

        if (!payload.message) {
            setContactStatus(status, 'error', messages.validation);
            if (messageField) {
                messageField.value = '';
                focusContactField(messageField);
            }
            return;
        }

        if (!payload.consent) {
            setContactStatus(status, 'error', messages.validation);
            focusContactField(consentField);
            return;
        }

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
                throw new Error(result.details || result.error || messages.network);
            }

            form.reset();

            if (result.emailSent === false) {
                setContactStatus(status, 'success', messages.successNoEmail);
            } else {
                setContactStatus(status, 'success', messages.success);
            }
        } catch (error) {
            setContactStatus(status, 'error', fallbackMessage);
        } finally {
            submitButton.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', initContactPageForm);
