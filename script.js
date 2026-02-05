document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('loaded');
    
    // Atualiza Ano Copyright
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Animação ao rolar (Intersection Observer)
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { 
                e.target.classList.add('is-visible'); 
                obs.unobserve(e.target); 
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animated-element').forEach(el => obs.observe(el));

    // === TABS (Abas) ===
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabSlider = document.getElementById('tab-slider');
    const tabContentWrapper = document.getElementById('tab-content-wrapper');

    function updateTabLine(btn) {
        if (!btn || !tabSlider) return;
        tabSlider.style.width = `${btn.offsetWidth}px`;
        tabSlider.style.transform = `translateX(${btn.offsetLeft}px)`;
    }

    if (tabButtons.length > 0 && tabContentWrapper) {
        const activeBtn = document.querySelector('.tab-button.active') || tabButtons[0];
        setTimeout(() => updateTabLine(activeBtn), 50);

        tabButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateTabLine(btn);
                tabContentWrapper.style.transform = `translateX(-${index * 100}%)`;
            });
        });

        window.addEventListener('resize', () => {
            const current = document.querySelector('.tab-button.active');
            updateTabLine(current);
        });
    }

    // === MENU MOBILE ===
    const mobileBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
            mobileBtn.setAttribute('aria-expanded', String(!isExpanded));
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // === FORMULÁRIO COM ENVIO AJAX (CORREÇÃO DO TRAVAMENTO) ===
    const form = document.getElementById('contact-form');
    if (form) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const submitBtn = document.getElementById('submit-button');
        const feedbackMsg = document.getElementById('feedback-message');

        // Validação em tempo real
        function checkFormValidity() {
            if (!submitBtn) return;
            const isNameValid = nameInput.value.trim().length >= 2;
            const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
            const isMessageValid = messageInput.value.trim().length >= 10;

            submitBtn.disabled = !(isNameValid && isEmailValid && isMessageValid);
        }

        if (nameInput) nameInput.addEventListener('input', checkFormValidity);
        if (emailInput) emailInput.addEventListener('input', checkFormValidity);
        if (messageInput) messageInput.addEventListener('input', checkFormValidity);

        // Envio do Formulário
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede o recarregamento da página

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Enviando...';
            }

            // Prepara os dados para envio
            const formData = new FormData(form);

            // Envia para o Formspree via AJAX (Fetch)
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    // SUCESSO
                    form.reset(); // Limpa os campos
                    
                    if (feedbackMsg) {
                        feedbackMsg.textContent = "✅ Mensagem enviada com sucesso! Entraremos em contato em breve.";
                        feedbackMsg.className = "text-center p-3 mt-4 rounded-md text-sm bg-green-100 text-green-700 block";
                    }
                    
                    if (submitBtn) {
                        submitBtn.innerHTML = 'Mensagem Enviada!';
                        // Restaura o botão após 5 segundos
                        setTimeout(() => {
                            submitBtn.innerHTML = 'Enviar Mensagem';
                            submitBtn.disabled = true; // Desabilita pois o form está vazio
                            if (feedbackMsg) feedbackMsg.className = "hidden";
                        }, 5000);
                    }

                    // GA4 Tracking
                    if (typeof gtag === 'function') {
                        gtag('event', 'generate_lead', { 'method': 'form' });
                    }

                } else {
                    // ERRO NO SERVIDOR
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            if (feedbackMsg) {
                                feedbackMsg.textContent = "❌ " + data.errors.map(error => error.message).join(", ");
                                feedbackMsg.className = "text-center p-3 mt-4 rounded-md text-sm bg-red-100 text-red-700 block";
                            }
                        } else {
                            throw new Error('Erro desconhecido');
                        }
                    });
                    if (submitBtn) {
                        submitBtn.innerHTML = 'Tentar Novamente';
                        submitBtn.disabled = false;
                    }
                }
            }).catch(error => {
                // ERRO DE REDE
                if (feedbackMsg) {
                    feedbackMsg.textContent = "❌ Ocorreu um erro ao enviar. Verifique sua conexão ou chame no WhatsApp.";
                    feedbackMsg.className = "text-center p-3 mt-4 rounded-md text-sm bg-red-100 text-red-700 block";
                }
                if (submitBtn) {
                    submitBtn.innerHTML = 'Tentar Novamente';
                    submitBtn.disabled = false;
                }
            });
        });
    }
});