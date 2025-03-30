export default {
  props:['loggedIn','userRole'],
  template: `
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <img src="/static/img/logo.png" alt="Root Service Logo" class="brand-logo me-2">

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
            <router-link class="nav-link active" v-if="!loggedIn" to="/">Home</router-link>
              <router-link class="nav-link active" v-if="loggedIn && userRole === 'customer'" to="/customer">Home</router-link>
              <router-link class="nav-link active" v-if="loggedIn && userRole === 'professional'" to="/professional">Home</router-link>
              <router-link class="nav-link active" v-if="loggedIn && userRole === 'admin'" to="/admin">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link active" v-if="loggedIn && userRole === 'customer'" to="/customerstats">Stats</router-link>
              <router-link class="nav-link active" v-if="loggedIn && userRole === 'professional'" to="/professionalstats">Stats</router-link>
              <router-link class="nav-link active" v-if="loggedIn && userRole === 'admin'" to="/adminstats">Stats</router-link>
              
            </li>
            <li class="nav-item" v-if="!loggedIn">
              <router-link class="nav-link active" to="/login">Login</router-link>
            </li>
            <li class="nav-item" v-if="!loggedIn">
              <router-link class="nav-link active" to="/signup">Register</router-link>
            </li>
          </ul>
        </div>
        <ul class="navbar-nav me-auto mb-1 mb-lg-0">
          <li class="nav-item" v-if="loggedIn">
              <a class="nav-link active" href="#" @click="logout">Logout</a>
          </li>
        </ul>
      </div>
  </nav>
  `,
  methods: {
    logout() {
      fetch("/api/logout", {
        method: "POST",
        headers: {
            "Authentication-Token": localStorage.getItem("auth_token"),
        },
      })
      .then(response => response.json())
      .then(() => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("id");
          localStorage.removeItem("role");
          this.$emit('logout');
      })
      .catch(error => console.error("Logout failed:", error));
    }
  }
};
