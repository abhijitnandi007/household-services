export default {
    template: `
<div class="container mt-4">
        <h2 class="text-center">Available Professionals for: {{ service_name }}</h2>
        <br><br>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Service Name</th>
                    <th>Specialization</th>
                    <th>Experience (years)</th>
                    <th>Time Required (hours)</th>
                    <th>Rating</th>
                    <th>Remarks</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="professional in professionals" :key="professional.id">
                    <td>{{ professional.email }}</td>
                    <td>{{ professional.service_name }}</td>
                    <td>{{ professional.specialization }}</td>
                    <td>{{ professional.experience }}</td>
                    <td>{{ professional.time_required }}</td>
                    <td>{{ professional.rating }}</td>
                    <td><input type="text" v-if = "professional.id" v-model="remarks[professional.id]" required></td>
                    <td>
                        <button class="btn btn-primary" v-if = "professional.id" @click="bookService(professional)">
                            Book
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
        return {
            service_name: this.$route.params.service_name,
            professionals: [],
            remarks: {}
        };
    },
    async mounted() {
        const response = await fetch(`/api/professionals/${this.service_name}`,{
            method:'GET',
            headers:{
                "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem('auth_token')
            }
        });
        this.professionals = await response.json();
    },
    methods: {
        bookService(professional) {
            const formdata = {
                service_name: professional.service_name,
                prof_email: professional.email,
                remarks: this.remarks[professional.id] || "" 
            };
            fetch('/api/service-request/create',{
                method: 'POST',
                headers:{
                    "Content-Type" : "application/json",
                    "Authentication-Token" : localStorage.getItem('auth_token')
                },
                body: JSON.stringify(formdata)
            })
            .then(response =>response.json())
            .then(data => {
                alert(data.message)
                this.$router.push('/customer')
            })
        }
    }
};
