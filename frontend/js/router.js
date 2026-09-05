// Router Module

const Router = {
  routes: {},
  
  register(path, component) {
    this.routes[path] = component;
  },
  
  navigate(path) {
    window.history.pushState({}, '', path);
    this.render();
  },
  
  render() {
    const path = window.location.pathname;
    const component = this.routes[path];
    if (component) {
      document.getElementById('app-root').innerHTML = component.render();
    }
  }
};

window.addEventListener('popstate', () => Router.render());
