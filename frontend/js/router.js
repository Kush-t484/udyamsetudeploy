/* SPA Hash Router */

const Router = {
    routes: {},
    currentPage: null,

    register(hash, pageRenderer) {
        this.routes[hash] = pageRenderer;
    },

    async navigate(hash) {
        const cleanHash = hash ? hash.split('?')[0] : '#/';
        
        // Auth Guards
        const publicRoutes = ['#/', '#/login', '#/register'];
        const isAuth = Boolean(State.user);

        if (!isAuth && !publicRoutes.includes(cleanHash)) {
            window.location.hash = '#/login';
            return;
        }

        const renderer = this.routes[cleanHash] || this.routes['#/dashboard'] || this.routes['#/'];
        if (renderer) {
            this.currentPage = cleanHash;
            this.renderLayout(cleanHash);
            await renderer(this.parseQueryParams(hash));
            this.updateActiveSidebar(cleanHash);
        }
    },

    parseQueryParams(hash) {
        if (!hash.includes('?')) return {};
        const queryString = hash.split('?')[1];
        const urlParams = new URLSearchParams(queryString);
        const params = {};
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        return params;
    },

    renderLayout(hash) {
        const appRoot = document.getElementById('app-root');
        const isPublic = ['#/', '#/login', '#/register'].includes(hash);

        if (isPublic) {
            appRoot.innerHTML = `<div id="page-content" class="w-full"></div>`;
        } else {
            appRoot.innerHTML = `
                ${Sidebar.render()}
                <div class="main-content-wrapper">
                    ${Navbar.render()}
                    <div id="page-content" class="page-container"></div>
                </div>
            `;
            Navbar.initEvents();
            Sidebar.initEvents();
        }
    },

    updateActiveSidebar(hash) {
        const items = document.querySelectorAll('.sidebar-item');
        items.forEach(item => {
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === hash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
};

window.Router = Router;
