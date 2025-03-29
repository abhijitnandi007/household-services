export default {
    template: `
        <div class="container mt-4">
            <h2 class="text-center">Service Requests Overview</h2>

            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card text-center">
                        <div class="card-header bg-dark text-white">Total Assigned Services</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ totalAssigned }}</h5>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card text-center">
                        <div class="card-header bg-dark text-white">Total Completed Services</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ totalCompleted }}</h5>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card text-center">
                        <div class="card-header bg-dark text-white">Pending Requests</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ totalPending }}</h5>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card text-center">
                        <div class="card-header bg-dark text-white">Rejected Requests</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ totalRejected }}</h5>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-5">
                <h5>Service Requests Breakdown</h5>
                <div class="chart-container">
                    <canvas ref="statusChart"></canvas>
                </div>
            </div>

            <div class="mt-5">
                <h5>Completed vs Pending Services</h5>
                <div class="chart-container">
                    <canvas ref="comparisonChart"></canvas>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            totalAssigned: 0,
            totalCompleted: 0,
            totalPending: 0,
            totalRejected: 0,
        };
    },

    methods: {
        async fetchStats() {
            const res = await fetch('/api/prof-stats', {
                headers: { "Authentication-Token": localStorage.getItem("auth_token") }
            });

            if (!res.ok) {
                console.error("Failed to fetch stats:", res.statusText);
                return;
            }

            const data = await res.json();
            this.totalAssigned = data.totalAssigned || 0;
            this.totalCompleted = data.totalCompleted || 0;
            this.totalPending = data.totalPending || 0;
            this.totalRejected = data.totalRejected || 0;

            this.renderCharts();
        },

        renderCharts() {
            setTimeout(() => {
                this.renderStatusChart();
                this.renderComparisonChart();
            }, 100);
        },

        renderStatusChart() {
            const ctx = this.$refs.statusChart.getContext("2d");
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["Assigned", "Completed", "Pending", "Rejected"],
                    datasets: [{
                        label: "Number of Requests",
                        data: [this.totalAssigned, this.totalCompleted, this.totalPending, this.totalRejected],
                        backgroundColor: ["blue", "green", "orange", "red"]
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        },

        renderComparisonChart() {
            const ctx = this.$refs.comparisonChart.getContext("2d");
            new Chart(ctx, {
                type: "pie",
                data: {
                    labels: ["Completed", "Pending"],
                    datasets: [{
                        data: [this.totalCompleted, this.totalPending],
                        backgroundColor: ["green", "orange"]
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    },

    mounted() {
        this.fetchStats();
    }
};
