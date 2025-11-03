document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('loaded');
    
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Intersection observer para animações "fade-in-up"
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { 
                e.target.classList.add('is-visible'); 
                obs.unobserve(e.target); 
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animated-element').forEach(el => obs.observe(el));

    // === Lógica das Abas (Tabs) ===
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const tabContentWrapper = document.getElementById('tab-content-wrapper');
    const tabSlider = document.getElementById('tab-slider');
    
    function moveSlider(targetButton) {
        if (!targetButton || !tabSlider) return;
        const targetWidth = targetButton.offsetWidth;
        const targetLeft = targetButton.offsetLeft; 
        
        tabSlider.style.width = `${targetWidth}px`;
        tabSlider.style.transform = `translateX(${targetLeft}px)`;
    }

    if (tabButtons.length > 0 && tabPanels.length > 0 && tabContentWrapper) {
        const tabButtonsArray = Array.from(tabButtons);
        const initialActiveTab = document.querySelector('.tab-button.active');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = tabButtonsArray.findIndex(b => b === btn);
                
                tabButtons.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                
                moveSlider(btn);

                if (index !== -1) {
                    tabContentWrapper.style.transform = `translateX(-${index * 100}%)`;
                }
            });
        });

        tabContentWrapper.style.transform = 'translateX(0%)';

        if (initialActiveTab) {
            setTimeout(() => moveSlider(initialActiveTab), 50); 
        }
        
        window.addEventListener('resize', () => {
            const currentActiveTab = document.querySelector('.tab-button.active');
            moveSlider(currentActiveTab);
        });
    }


    // === Menu Mobile ===
    const mobileBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
            mobileBtn.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.setAttribute('aria-hidden', String(expanded));
        });
    }
    document.querySelectorAll('#mobile-menu a').forEach(a => {
        a.addEventListener('click', () => {
            if (mobileMenu && mobileBtn) {
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileBtn.setAttribute('aria-expanded','false');
            }
        });
    });

    // ==========================================================
    // === 1. ADICIONADO: RASTREAMENTO DE CLIQUES WHATSAPP ===
    // ==========================================================
    // Esta função encontra todos os links <a> no site cujo 'href' começa
    // com "https://wa.me/" e adiciona um "ouvinte" de clique neles.
    function trackWhatsappClicks() {
        const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me/"]');
        
        whatsappLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Quando o link é clicado, envia o evento 'generate_lead' para o GA4
                if (typeof gtag === 'function') {
                    gtag('event', 'generate_lead', {
                        'method': 'whatsapp'
                    });
                }
            });
        });
    }
    // Chama a função para ativar o rastreamento
    trackWhatsappClicks();
    // === FIM DO BLOCO DE RASTREAMENTO WHATSAPP ===


    // === Validação do Formulário ===
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-button');
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const messageField = document.getElementById('message');
    const fileInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name-display');

    function validateEmail(email) {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function validateForm() {
        if (!nameField || !emailField || !messageField || !submitBtn) return; 
        
        const ok = nameField.value.trim().length >= 2 && validateEmail(emailField.value) && messageField.value.trim().length >= 10;
        submitBtn.disabled = !ok;
    }

    if (nameField && emailField && messageField) {
        [nameField, emailField, messageField].forEach(el => el.addEventListener('input', () => {
            validateForm();
            const errorEl = document.getElementById(el.id + '-error');
            if (errorEl) errorEl.textContent = '';
        }));
    }

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (!f) { fileNameDisplay.textContent = ''; return; }
            if (f.size > 5 * 1024 * 1024) {
                fileNameDisplay.textContent = 'Arquivo maior que 5MB — remova ou faça compressão.';
                fileInput.value = '';
            } else {
                fileNameDisplay.textContent = 'Arquivo selecionado: ' + f.name;
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (ev) => {
            let hasError = false;
            
            if (nameField && nameField.value.trim().length < 2) { 
                const errorEl = document.getElementById('name-error');
                if (errorEl) errorEl.textContent = 'Por favor, informe seu nome.'; 
                hasError = true; 
            }
            if (emailField && !validateEmail(emailField.value)) { 
                const errorEl = document.getElementById('email-error');
                if (errorEl) errorEl.textContent = 'E-mail inválido.'; 
                hasError = true; 
            }
            if (messageField && messageField.value.trim().length < 10) { 
                const errorEl = document.getElementById('message-error');
                if (errorEl) errorEl.textContent = 'Descreva sua necessidade com mais detalhes.'; 
                hasError = true; 
            }
            
            if (hasError) {
                ev.preventDefault(); 
                return;
            }

            // ==========================================================
            // === 2. MODIFICADO: RASTREAMENTO DE ENVIO DE FORMULÁRIO ===
            // ==========================================================
            // Se o formulário passou na validação (!hasError), disparamos
            // o evento 'generate_lead' para o GA4 antes de continuar.
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    'method': 'form'
                    
                });
            }
            // === FIM DA MODIFICAÇÃO ===


            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Enviando...';
            }
        });
    }
    
    validateForm(); // Verificação inicial
});