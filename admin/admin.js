/* =========================================================
   DAKAR ELITE VTC – ADMIN JAVASCRIPT
   ========================================================= */

(function () {
    'use strict';

    /* ─── SIDEBAR TOGGLE ─── */
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggleBtn = document.getElementById('sidebarToggle');

    function openSidebar() {
        sidebar?.classList.add('open');
        overlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar?.classList.remove('open');
        overlay?.classList.remove('open');
        document.body.style.overflow = '';
    }

    toggleBtn?.addEventListener('click', () => {
        sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    overlay?.addEventListener('click', closeSidebar);

    /* ─── ACTIVE NAV LINK ─── */
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href === currentPage) link.classList.add('active');
    });

    /* ─── MODAL SYSTEM ─── */
    window.openModal = function (id) {
        const overlay = document.getElementById(id);
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function (id) {
        const overlay = document.getElementById(id);
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const overlay = btn.closest('.modal-overlay');
            if (overlay) closeModal(overlay.id);
        });
    });

    /* ─── TOAST SYSTEM ─── */
    window.showToast = function (message, type = 'info', duration = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-diamond' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    /* ─── TABLE FILTER (live search) ─── */
    const filterInput = document.getElementById('tableSearch');
    if (filterInput) {
        filterInput.addEventListener('input', function () {
            const val = this.value.toLowerCase();
            document.querySelectorAll('tbody tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
            });
        });
    }

    /* ─── STATUS FILTER ─── */
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function () {
            const val = this.value;
            document.querySelectorAll('tbody tr').forEach(row => {
                if (!val) { row.style.display = ''; return; }
                const badge = row.querySelector('.badge');
                const badgeText = badge ? badge.textContent.trim().toLowerCase() : '';
                row.style.display = badgeText.includes(val.toLowerCase()) ? '' : 'none';
            });
        });
    }

    /* ─── BOOKING ACTIONS ─── */
    // Confirm booking
    document.querySelectorAll('.action-btn.confirm').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            const badge = row?.querySelector('.badge');
            if (badge) {
                badge.className = 'badge badge-confirmed';
                badge.innerHTML = '<span class="badge-dot-sm"></span>Confirmée';
                showToast('Réservation confirmée !', 'success');
            }
        });
    });

    // Delete / Cancel booking
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            if (confirm('Annuler cette réservation ?')) {
                const badge = row?.querySelector('.badge');
                if (badge) {
                    badge.className = 'badge badge-cancelled';
                    badge.innerHTML = '<span class="badge-dot-sm"></span>Annulée';
                    showToast('Réservation annulée.', 'error');
                }
            }
        });
    });

    // View booking detail
    document.querySelectorAll('.action-btn.view').forEach((btn, idx) => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            if (!row) return;
            const cells = row.querySelectorAll('td');
            document.getElementById('modal-client-name').textContent = cells[0]?.textContent.trim() || '--';
            document.getElementById('modal-client-contact').textContent = cells[1]?.textContent.trim() || '--';
            document.getElementById('modal-service').textContent = cells[2]?.textContent.trim() || '--';
            document.getElementById('modal-date').textContent = cells[3]?.textContent.trim() || '--';
            document.getElementById('modal-pickup').textContent = cells[4]?.textContent.trim() || '--';
            document.getElementById('modal-dropoff').textContent = cells[5]?.textContent.trim() || '--';
            document.getElementById('modal-pax').textContent = cells[6]?.textContent.trim() || '--';
            document.getElementById('modal-status').textContent = cells[7]?.querySelector('.badge')?.textContent.trim() || '--';
            openModal('bookingModal');
        });
    });

    /* ─── SETTINGS FORM SAVE ─── */
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = settingsForm.querySelector('[type="submit"]');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement…';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
                    showToast('Paramètres enregistrés avec succès !', 'success');
                }, 1200);
            }
        });
    }

    /* ─── ANIMATED COUNTERS ─── */
    function animateVal(el, target) {
        const duration = 1500;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(ease * target);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                if (!isNaN(target)) { animateVal(el, target); observer.unobserve(el); }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-target]').forEach(el => observer.observe(el));

    /* ─── PERF BARS ANIMATION ─── */
    const perfObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.dataset.width;
                perfObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.perf-bar').forEach(bar => {
        bar.style.width = '0%';
        perfObserver.observe(bar);
    });

    console.log('%c✦ Dakar Elite VTC – Admin Panel ✦', 'color: #C9A227; font-size: 1rem; font-weight: bold;');
})();
