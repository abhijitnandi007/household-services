export default {
    template: `
    <div class="container mt-4">
        <h3><strong>Welcome, {{ user.username }}</strong></h3>
        <br>
<div id="carouselExampleCaptions" class="carousel slide container-fluid position-relative" data-bs-ride="carousel">
  
  <div class="carousel-indicators">
    <button v-for="(chunk, index) in chunkedServices" :key="index"
      type="button" data-bs-target="#carouselExampleCaptions"
      :data-bs-slide-to="index" :class="{ 'active': index === 0 }"
      :aria-current="index === 0" :aria-label="'Slide ' + (index + 1)">
    </button>
  </div>

  <div class="carousel-inner">
    <div v-for="(chunk, index) in chunkedServices" :key="'slide-' + index"
      class="carousel-item" :class="{ 'active': index === 0 }">
      
      <div class="row mx-0 gap-0">  <!-- No space between cards -->
        <div class="col-md-4 d-flex align-items-stretch p-0" v-for="service in chunk" :key="service.id">
          <div class="card shadow-sm border-0 w-100">
            <img src="/static/img/service.webp" class="card-img-top img-fluid"
              alt="Service" style="height: 250px; object-fit: cover; border-radius: 10px 10px 0 0;">
            <div class="card-body d-flex flex-column text-center">
              <h6 class="card-title fw-bold">{{ service.name }}</h6>
              <p class="card-text text-muted">₹{{ service.base_price }}</p>
              <button class="btn btn-primary mt-auto w-100" @click="viewProfessionals(service.name)">
                View Service
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>

  <!-- Adjusted Navigation Buttons -->
  <button class="carousel-control-prev custom-carousel-control" type="button"
    data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>

  <button class="carousel-control-next custom-carousel-control" type="button"
    data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>

</div>
         <!-- Search Bar -->
        <div class="d-flex justify-content-center my-3">
            <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search for a service..." 
                class="form-control w-50"
            />
        </div>
        <br>

        <!-- Service History -->
        <h3 class="text-center"><strong>Service History</strong></h3>
        <table class="table table-striped mt-4">
            <thead>
                <tr>
                    <th>Service Name</th>
                    <th>Serviced By</th>
                    <th>Requested On</th>
                    <th>Completed On</th>
                    <th>Time Required (hours)</th>
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
                remarks: ""
            },
            searchQuery:""
        };
    },
    computed: {
        filteredServices() {
            return this.services.filter(service =>
              service.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
          },
        chunkedServices() {
          const chunkSize = 3;
          return this.filteredServices.reduce((chunks, service, index) => {
            const chunkIndex = Math.floor(index / chunkSize);
            if (!chunks[chunkIndex]) {
              chunks[chunkIndex] = [];
            }
            chunks[chunkIndex].push(service);
            return chunks;
          }, []);
        }
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

        const serviceResponse = await fetch("/api/service",{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth_token"),
            },
        });
        this.services = await serviceResponse.json();

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
