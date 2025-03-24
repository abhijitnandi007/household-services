export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center">Welcome, {{ user.username }}</h2>

        <!-- Services Section -->
        <h3 class="mt-4">Available Services</h3>
        <br>
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <div class="col" v-for="service in services" :key="service.id">
                <div class="card h-30">
                    <img src="/static/img/service.webp" class="card-img-top" alt="Service">
                    <div class="card-body">
                        <h5 class="card-title">{{ service.name }}</h5>
                        <p class="card-text">Price: ₹{{ service.base_price }}</p>
                        <button class="btn btn-primary" @click="viewProfessionals(service.name)">
                            View
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <br>
        <!-- Service History -->
        <h3 class="mt-4">Service History</h3>
        <table class="table table-striped mt-4">
    <thead>
        <tr>
            <th>Service Name</th>
            <th>Serviced By</th>
            <th>Requested On</th>
            <th>Completed On</th>
            <th>Time Required(hours)</th>
            <th>Status</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="history in serviceHistory" :key="history.id">
            <td>{{ history.service_name }}</td>
            <td>{{ history.professional_name }}</td>
            <td>{{ history.date_of_request }}</td>
            <td>{{ history.date_of_completion }}</td>
            <td>{{ history.time_required }}</td>
            <td>{{ history.service_status }}</td>

            <td>
               
                <button v-if="history.service_status === 'requested'" 
                        class="btn btn-danger btn-sm" 
                        @click="deleteService(history.id)">
                    Delete
                </button>

                <!-- Mark as Completed + Review -->
                <div v-if="history.service_status === 'closed'">
                    <input type="number" v-model="history.rating" 
                           min="1" max="5" placeholder="Rating (1-5)" class="form-control mb-2">
                    <input type="text" v-model="history.comments" 
                           placeholder="Write a review..." class="form-control mb-2">
                    <button class="btn btn-success btn-sm" @click="submitReview(history)">
                        Submit Review
                    </button>
                </div>
            </td>
        </tr>
    </tbody>
</table>
    </div>
    `,
    data() {
        return {
            user: {},
            services: [],
            serviceHistory: [],
            bestOffers: [],
            formdata: {
                service_id: null,
                service_name: "",
                remarks: "",
            }
        };
    },
    async mounted() {
        const userResponse = await fetch("/api/home", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth_token"),
            },
        });
        this.user = await userResponse.json();

        // Fetch services
        const serviceResponse = await fetch("/api/service",{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth_token"),
            },
        });
        this.services = await serviceResponse.json();

        // Fetch service history
        const historyResponse = await fetch("/api/service-request/get", {
            method: "GET",
            headers: {
                "Authentication-Token":  localStorage.getItem("auth_token"),
            },
        });
        this.serviceHistory = await historyResponse.json();
    },
    methods: {
        viewProfessionals(service_name) {
            this.$router.push(`/professionals/${service_name}`);
        },
        
            // DELETE service request
        async deleteService(serviceId) {
            if (confirm("Are you sure you want to delete this service request?")) {
                const response = await fetch(`/api/service-request/delete/${serviceId}`, {
                    method: "DELETE",
                    headers: {
                        "Authentication-Token": localStorage.getItem("auth_token"),
                    },
                });

                const data = await response.json();
                alert(data.message);
                this.fetchServiceHistory(); // Refresh data
            }
        },

    // SUBMIT Review
        async submitReview(history) {
            if (!history.rating || !history.comments) {
                alert("Please provide both rating and comments.");
                return;
            }

            const response = await fetch(`/api/service-request/update/${history.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token"),
                },
                body: JSON.stringify({
                    service_status: "completed",
                    rating: history.rating,
                    comments: history.comments
                })
            });

            const data = await response.json();
            alert(data.message);
            this.fetchServiceHistory(); // Refresh data
        },
        async fetchServiceHistory() {
            const response = await fetch("/api/service-request/get", {
                method: "GET",
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token"),
                },
            });

            this.serviceHistory = await response.json();
        }
    }
};
