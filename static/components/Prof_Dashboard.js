export default {
    template: `
    <div class="container mt-4">
        <h3><strong>Welcome Back, {{userdata.username}}</strong></h3>

        <!-- Ongoing Service Requests -->
        <h3 class="mt-4"><strong>Ongoing Services</strong></h3>
        <table class="table table-bordered table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Request ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Requested On</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="request in ongoingRequests" :key="request.id">
                    <td>{{ request.id }}</td>
                    <td>{{ request.customer_name }}</td>
                    <td>{{ request.service_name }}</td>
                    <td>{{ request.date_of_request }}</td>
                    <td>
                        <span class="badge" 
                            :class="{
                                'bg-warning': request.service_status === 'requested' ,
                                'bg-primary': request.service_status === 'assigned'
                                
                            }">
                            {{ request.service_status }}
                        </span>
                    </td>
                    <td>
                    <span>
                        <button v-if="request.service_status === 'requested'" class="btn btn-success btn-sm" 
                                @click="updateStatus(request, 'assigned')">
                            Accept
                        </button>
                        <button v-if="request.service_status === 'requested'" class="btn btn-danger btn-sm" 
                                @click="updateStatus(request, 'rejected')">
                            Reject
                        </button>
                        </span>
                        <button v-if="request.service_status === 'assigned'" class="btn btn-danger btn-sm" 
                                @click="updateStatus(request, 'closed')">
                            Mark as Completed
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Completed Service Requests -->
        <h3 class="mt-4"><strong>Service History</strong></h3>
        <table class="table table-bordered table-striped">
            <thead class="table-dark">
                <tr>
                    <th>Request ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Requested On</th>
                    <th>Completed On</th>
                </tr>
            </thead>
            <tbody>
            
                <tr v-for="request in completedRequests" :key="request.id">
                    <td>{{ request.id }}</td>
                    <td>{{ request.customer_name }}</td>
                    <td>{{ request.service_name }}</td>
                    <td>
                        <span class="badge" 
                        :class="{
                                'bg-danger': request.service_status === 'rejected',
                                'bg-success': request.service_status === 'closed' ||  
                                request.service_status === 'completed'
                            }">
                        {{ request.service_status }}</span>
                    </td>
                    <td>{{ request.date_of_request }}</td>
                    <td>{{ request.date_of_completion }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
        return {
            userdata: {},
            serviceRequests: [],
        };
    },
    computed: {
        ongoingRequests() {
            return this.serviceRequests.filter(req => req.service_status === "requested" || req.service_status === "assigned");
        },
        completedRequests() {
            return this.serviceRequests.filter(req => req.service_status === "closed" || req.service_status === "completed" || req.service_status === "rejected" );
        }
    },
    mounted(){
        this.fetchUserData();
        this.fetchServiceRequests();  
    },
    methods: {
        fetchUserData(){
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
                this.userdata = data;
            })
        },
        fetchServiceRequests() {
            fetch('/api/service-request/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                }
            })
            .then(response =>  response.json())
            .then(data => {
                this.serviceRequests = data;
            })
        },

        updateStatus(request,status) {
            fetch(`/api/service-request/update/${request.id}`,{
                method:"PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                },
                body: JSON.stringify({service_status:status})
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                this.fetchServiceRequests();
            })
        }
    }
      
}