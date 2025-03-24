export default {
  template: `
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#" @click="redirectToHome">Root Service</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link active" @click="redirectToHome">Home</a>
            </li>
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link class="nav-link active" to="/login">Login</router-link>
            </li>
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link class="nav-link active" to="/Signup">Register</router-link>
            </li>
          </ul>
        </div>
        <ul class="navbar-nav me-auto mb-1 mb-lg-0">
          <li class="nav-item" v-if="isAuthenticated">
              <a class="nav-link active" href="#" @click="logout">Logout</a>
          </li>
        </ul>
      </div>
  </nav>
  `,
  data() {
      return {
          isAuthenticated: false,
          userRole: null
      };
  },
  mounted() {
      this.isAuthenticated = !!localStorage.getItem("auth_token");
      this.userRole = localStorage.getItem("role");
  },
  methods: {
      redirectToHome() {
          if (this.isAuthenticated) {
              if (this.userRole === "customer") {
                  this.$router.push("/customer");
              } else if (this.userRole === "professional") {
                  this.$router.push("/professional");
              } else {
                  this.$router.push("/admin");
              }
          } else {
              this.$router.push("/");
          }
      },
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
          this.$router.push("/");
      })
      .catch(error => console.error("Logout failed:", error));
  }

  }
};
