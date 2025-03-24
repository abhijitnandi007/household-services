import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Navbar from './components/Navbar.js'
import Cust_Dashboard from './components/Cust_Dashboard.js'
import Admin_Dashboard from './components/Admin_Dashboard.js'
import Prof_Dashboard from './components/Prof_Dashboard.js'
import ServiceProfessionals from "./components/Service_by_Prof.js";


const routes = [
    {path: '/',component: Home},
    {path: '/login',component: Login},
    {path: '/signup',component: Register},
    {path: '/customer',component: Cust_Dashboard},
    {path: '/professional',component: Prof_Dashboard},
    {path: '/admin',component: Admin_Dashboard},
    {path: "/professionals/:service_name", component: ServiceProfessionals}

]

const router = new VueRouter({
    routes
})
const app = new Vue({
    el : "#app",
    router,
    template: `
    <div id="container">
        <nav-bar></nav-bar>
        <router-view></router-view>
    </div>
    

    
    `,
    data: {
        section: "frontend"

    },
    components:{
        "nav-bar": Navbar
    }
})