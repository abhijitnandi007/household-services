export default {
    template:`
     <div>
     <br>
      <h4>Welcome, {{ userdata.username }}</h4>
 <div class="container mt-4">
        <h2 class="text-center">Admin Dashboard</h2>
        <div class="text-end my-2">
                <button @click="csvExport" class="btn btn-secondary">Download as CSV</button>
        </div>
        
        <!-- Available services Table -->
        <h3 class="mt-4">Services</h3>
        <br>
        <table class="table table-bordered table-striped">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Time Required (hours)</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in services" :key="service.id">
                    <td>{{ service.id }}</td>
                    <td>{{ service.name }}</td>
                    <td>{{ service.description }}</td>
                    <td>{{ service.base_price }}</td>
                    <td>{{ service.time_required }}</td>
                    <td>
                        <span>
                        <button class="btn btn-warning btn-sm " @click="openServiceModal(service) ">
                            Edit
                        </button>
                        <button class="btn btn-danger btn-sm " @click="deleteService(service) ">
                            Delete
                        </button>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
        <button style="float: right;" class="btn btn-success my-3" @click="openServiceModal()">Create Service</button>
        <br>
        <!-- Professionals Table -->
        <h3 class="mt-4">Professionals</h3>
        <br>
        <table class="table table-bordered table-striped">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Specialization</th>
                    <th>Experience (Years)</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="professional in professionals" :key="professional.id">
                    <td>{{ professional.id }}</td>
                    <td>{{ professional.username }}</td>
                    <td>{{ professional.email }}</td>
                    <td>{{ professional.service }}</td>
                    <td>{{ professional.specialization[0] }}</td>
                    <td>{{ professional.experience[0] }}</td>
                    <td>{{ professional.rating }}</td>
                    <td>
                        <span class="badge" :class="{'bg-success': professional.active, 'bg-danger': !professional.active}">
                            {{ professional.active ? 'Active' : 'Blocked' }}
                        </span>
                    </td>
                    <td>
                        <span>
                        <button class="btn btn-warning btn-sm " @click="toggleUserStatus(professional) ">
                            {{ professional.active ? 'Block' : 'Unblock' }}
                        </button>
                        <button class="btn btn-danger btn-sm " @click="deleteUser(professional) ">
                            Delete
                        </button>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Customers Table -->
        <h3 class="mt-4">Customers</h3>
        <br>
        <table class="table table-bordered table-striped">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="customer in customers" :key="customer.id">
                    <td>{{ customer.id }}</td>
                    <td>{{ customer.username }}</td>
                    <td>{{ customer.email }}</td>
                    <td>
                        <span class="badge" :class="{'bg-success': customer.active, 'bg-danger': !customer.active}">
                            {{ customer.active ? 'Active' : 'Blocked' }}
                        </span>
                    </td>
                    <td>
                        <span>
                        <button class="btn btn-warning btn-sm" @click="toggleUserStatus(customer)">
                            {{ customer.active ? 'Block' : 'Unblock' }}
                        </button>
                        <button class="btn btn-danger btn-sm " @click="deleteUser(customer) ">
                            Delete
                        </button>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <!-- Modal -->
<div class="modal fade" id="serviceModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">{{ editingService ? "Edit Service" : "Create Service" }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="saveService">
                    <div class="mb-3">
                        <label class="form-label">Service Name</label>
                        <input type="text" class="form-control" v-model="formdata.name" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" v-model="formdata.description" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Base Price</label>
                        <input type="number" class="form-control" v-model="formdata.base_price" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Time Required (hours)</label>
                        <input type="number" class="form-control" v-model="formdata.time_required" required>
                    </div>
                    <div style="text-align: center;">
                    <button type="submit" class="btn btn-warning btn-sm">{{ editingService ? "Update" : "Create" }}</button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    data: function(){
        return{
            userdata:{},
            users:[],
            professionals: [],
            customers: [],
            services:[],
            formdata:{
                id:null,
                name:"",
                description:"",
                base_price: "",
                time_required:""
            },
            editingService: false

        }
    },
    mounted(){
        this.fetchservices(),
        this.modalInstance = new bootstrap.Modal(document.getElementById('serviceModal'), {
            keyboard: false
        }),
        fetch('/api/home', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem("auth_token")
            }

        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log("Fetched user data:", data);
            this.userdata = data;
        }),
        fetch('/api/users',{
            method:"GET",
            headers:{
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem("auth_token")
            }
        })
        .then(response =>{
            return response.json()
        })
        .then(data =>{
            this.users = data;
            this.categorizeUsers();
        })
    },
    methods: {
        fetchservices(){
        fetch('/api/service', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem("auth_token")
            }

        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            this.services = data;
        })
        },
        categorizeUsers() {
            this.professionals = this.users.filter(user => user.roles.some(role => role.name === "professional"));
            this.customers = this.users.filter(user => user.roles.some(role => role.name === "customer"));
        },
        openServiceModal(service = null) {
            if (service) {
                this.editingService = true;
                this.formdata = { ...service };
            } else {
                this.editingService = false;
                this.formdata = { id: null, name: "", description: "", base_price: "", time_required: "" };
            }
            this.modalInstance.show();
        },
        closeServiceModal() {
            this.modalInstance.hide();
        },
        saveService() {
            const url = this.editingService ? `/api/service/update/${this.formdata.id}` : "/api/service";
            const method = this.editingService ? "PUT" : "POST";

            fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.formdata)
            })
            .then(response => response.json())
            .then(data => {
                this.closeServiceModal();
                window.location.reload();        
            });
        },
        toggleUserStatus(user) {
            fetch(`api/users/update/${user.id}`,{
                method:"PUT",
                headers:{
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ active: !user.active })
            })
            .then(response => response.json())
            .then(data =>{
                alert(data.message);
                user.active = !user.active;
            })
        },
        deleteUser(user) {
            if (!confirm(`Are you sure you want to delete ${user.username} ? This action cannot be undone.`)) {
                return;
            }
            fetch(`api/users/delete/${user.id}`,{
                method:"DELETE",
                headers:{
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data =>{
                alert(data.message);
                window.location.reload();
            })
        },
        toggleServicerStatus(service) {
            fetch(`api/users/update/${service.id}`,{
                method:"PUT",
                headers:{
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ active: !user.active })
            })
            .then(response => response.json())
            .then(data =>{
                alert(data.message);
                user.active = !user.active;
            })
        },
        deleteService(service) {
            if (!confirm(`Are you sure you want to delete this service ? This action cannot be undone.`)) {
                return;
            }
            fetch(`/api/service/delete/${service.id}`,{
                method:"DELETE",
                headers:{
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data =>{
                alert(data.message);
                window.location.reload();
            })
        },
        csvExport(){
            fetch('/api/export')
            .then(response => response.json())
            .then(data => {
                setTimeout(()=>{
                    window.location.href = `/api/csv_result/${data.id}`
                },3000);
            })
        }
    }
    
}