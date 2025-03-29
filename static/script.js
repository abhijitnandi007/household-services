import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Navbar from './components/Navbar.js'
import Cust_Dashboard from './components/Cust_Dashboard.js'
import Admin_Dashboard from './components/Admin_Dashboard.js'
import Prof_Dashboard from './components/Prof_Dashboard.js'
import ServiceProfessionals from "./components/Service_by_Prof.js";
import Admin_Stats from './components/Admin_Stats.js'
import Prof_Stats from './components/Prof_Stats.js'
import Customer_Stats from './components/Customer_Stats.js'

const routes = [
    {path: '/',component: Home},
    {path: '/login',component: Login},
    {path: '/signup',component: Register},
    {path: '/customer',component: Cust_Dashboard},
    {path: '/professional',component: Prof_Dashboard},
    {path: '/admin',component: Admin_Dashboard},
    {path: "/professionals/:service_name", component: ServiceProfessionals},
    {path: '/adminstats',component: Admin_Stats},
    {path: '/professionalstats',component: Prof_Stats},
    {path: '/customerstats',component: Customer_Stats}

]

const router = new VueRouter({
    routes
})
const app = new Vue({
    el : "#app",
    router,
    template: `
    <div id="container">
        <nav-bar :loggedIn="loggedIn" :userRole="userRole" @logout="handleLogout"></nav-bar>
        <router-view :loggedIn="loggedIn" @login="handleLogin"></router-view>
    </div>
    `,
    data: {
        loggedIn: !!localStorage.getItem("auth_token"),
        userRole: localStorage.getItem("role") || null
    },
    components: {
        "nav-bar": Navbar
    },
    methods: {
        handleLogin(role) {
            this.loggedIn = true;
            this.userRole = role;
            localStorage.setItem("role", role)
            this.$router.replace(`/${this.userRole}`);
        },
        handleLogout() {
            this.loggedIn = false;
            this.userRole = null;
            localStorage.removeItem("auth_token");
            localStorage.removeItem("role");
        }
    }
});
