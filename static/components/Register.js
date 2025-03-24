export default {
    template:`
<div id="input-form" style="box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);background-color: #fff;border: 0px solid rgb(101, 99, 99); padding: 1rem;border-radius: 15px;">
    <h2 id="heading">Signup</h2>

    <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="email" v-model="formdata.email" required>
        <span v-if="errors.email" class="text-danger">{{ errors.email }}</span>
    </div>

    <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input type="text" class="form-control" id="username" v-model="formdata.username" required>
        <span v-if="errors.username" class="text-danger">{{ errors.username }}</span>
    </div>

    <div class="mb-3">
        <label for="pwd" class="form-label">Password</label>
        <input type="password" class="form-control" id="pwd" v-model="formdata.password" required>
        <span v-if="errors.password" class="text-danger">{{ errors.password }}</span>
    </div>

    <div class="mb-3">
        <label for="role" class="form-label">Signup As</label>
        <select id="role" v-model="formdata.roles" class="form-control">
            <option value="customer">Customer</option>
            <option value="professional">Professional</option>
        </select>
        <span v-if="errors.roles" class="text-danger">{{ errors.roles }}</span>
    </div>

    <div class="mb-3" v-if="formdata.roles === 'professional'">
        <label for="service" class="form-label">Service Provided</label>
        <select id="service" v-model="formdata.service_name" class="form-control">
            <option v-for="service in services" :key="service.id" :value="service.name">
                {{ service.name }}
            </option>
        </select>
        <span v-if="errors.service_name" class="text-danger">{{ errors.service_name }}</span>
    </div>
    <div class="mb-3" v-if="formdata.roles === 'professional'">
        <label for="experience" class="form-label">Experience(Years)</label>
        <input type="number" class="form-control" id="experience" v-model = "formdata.experience" min = "0">
        <span v-if="errors.experience" class="text-danger">{{ errors.experience }}</span>
    </div>
    <div class="mb-3" v-if="formdata.roles === 'professional'">
        <label for="specialization" class="form-label">Specialization</label>
        <textarea class="form-control" id="specialization" v-model = "formdata.specialization" rows="3"></textarea>
        <span v-if="errors.specialization" class="text-danger">{{ errors.specialization }}</span>
    </div>

    <div class="mb-3" style="text-align: center;">
        <button @click="validateForm" class="btn btn-primary mb-3">Signup</button> 
    </div>
</div>

    `,
    data: function(){
        return{
            formdata:{
                email:'',
                username:'',
                password:'',
                roles:"customer",
                service_name:'',
                experience:'',
                specialization:''
            },
            services:[],
            errors:{}
        };
    },
    async created() {
        // Fetch available services from backend
        const response = await fetch("/api/public/service/get");
        this.services = await response.json();
      },
    methods:{
        validateForm() {
            this.errors = {}; // Reset errors

            if (!this.formdata.email) {
                this.errors.email = "Email is required";
            }

            if (!this.formdata.username) {
                this.errors.username = "Username is required";
            }

            if (!this.formdata.password) {
                this.errors.password = "Password is required";
            }

            if (!this.formdata.roles) {
                this.errors.roles = "Please select a role";
            }

            if (this.formdata.roles === "professional" && !this.formdata.service_name) {
                this.errors.service_name = "Please select a service";
            }
            if (this.formdata.roles === "professional" && !this.formdata.experience) {
                this.errors.experience = "Experience Required";
            }
            if (this.formdata.roles === "professional" && !this.formdata.specialization) {
                this.errors.specialization = "Please mention specialization";
            }

            // If there are no errors, proceed with signup
            if (Object.keys(this.errors).length === 0) {
                this.registeruser();
            }
        },
        registeruser: function(){
            fetch('/api/register', {               //gives a promise
                method:'POST',
                headers:{
                    "Content-Type": "application/json"  
                },
                body: JSON.stringify(this.formdata)
            })
            .then(response => response.json())  //converted into json and gives another promise
            .then(data => {
                alert(data.message)
                this.$router.push('/login')  //need to change this
            })    
        }

    }
}
