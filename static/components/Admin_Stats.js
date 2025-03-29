export default {
  template: `
      <div class="container mt-4">
          <h2 class="mt-5">Statistics Overview</h2>
          
          <div class="row mt-4">
              <div class="col-md-4">
                  <div class="card text-center">
                      <div class="card-header bg-dark text-white">Total Active Professionals</div>
                      <div class="card-body">
                          <h5 class="card-title">{{ totalActiveProfessionals }}</h5>
                      </div>
                  </div>
              </div>

              <div class="col-md-4">
                  <div class="card text-center">
                      <div class="card-header bg-dark text-white">Total Service Requests</div>
                      <div class="card-body">
                          <h5 class="card-title">{{ totalServiceRequests }}</h5>
                      </div>
                  </div>
              </div>

              <div class="col-md-4">
                  <div class="card text-center">
                      <div class="card-header bg-dark text-white">Total Blocked Users</div>
                      <div class="card-body">
                          <h5 class="card-title">{{ totalBlockedUser }}</h5>
                      </div>
                  </div>
              </div>
          </div>

          <div class="row mt-4">
              <div class="col-md-6">
                  <canvas id="statusChart"></canvas>
              </div>
              <div class="col-md-6">
                  <canvas id="usersChart"></canvas>
              </div>
          </div>
      </div>
  `,

  data() {
      return {
          totalActiveProfessionals: 0,
          totalServiceRequests: 0,
          totalBlockedUser: 0,
          totalCustomers: 0,
          totalProfessionals: 0,
          averageRating: 0,
          statusData: {
              Pending: 0,
              Accepted: 0,
              Completed: 0,
              Rejected: 0
          }
      };
  },

  methods: {
      async fetchStatistics() {
          const res = await fetch('/api/admin-stats', {
              headers: { "Authentication-Token": localStorage.getItem("auth_token") }
          });
          const data = await res.json();
          this.totalActiveProfessionals = data.totalActiveProfessionals;
          this.totalServiceRequests = data.totalServiceRequests;
          this.totalBlockedUser = data.totalBlockedUser;
          this.totalCustomers = data.totalCustomers;
          this.totalProfessionals = data.totalProfessionals;
          this.averageRating = data.averageRating;
          this.statusData = data.statusData || { Pending: 0, Accepted: 0, Completed: 0, Rejected: 0 };
          this.renderCharts();
      },

      renderCharts() {
          // Pie Chart: Service Request Statuses
          new Chart(document.getElementById("statusChart"), {
              type: 'pie',
              data: {
                  labels: ["Pending", "Accepted", "Completed", "Rejected"],
                  datasets: [{
                      data: [
                          this.statusData.Pending,
                          this.statusData.Accepted,
                          this.statusData.Completed,
                          this.statusData.Rejected
                      ],
                      backgroundColor: ["#f39c12", "#3498db", "#2ecc71", "#e74c3c"]
                  }]
              }
          });

          // Bar Chart: Customers vs Professionals
          new Chart(document.getElementById("usersChart"), {
              type: 'bar',
              data: {
                  labels: ["Customers", "Professionals"],
                  datasets: [{
                      label: "Total Users",
                      data: [this.totalCustomers, this.totalProfessionals],
                      backgroundColor: ["#8e44ad", "#16a085"]
                  }]
              }
          });
      }
  },

  mounted() {
      this.fetchStatistics();
  }
};
