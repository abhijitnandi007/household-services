export default {
    template:`
     <div>
      <h4>Welcome, {{ userdata.username }}</h4>

      <div v-if="userdata.role === 'admin'">
        <h2>Admin Dashboard</h2>
        <p>Manage users, approve professionals, and oversee services.</p>
      </div>

      <div v-else-if="userdata.role === 'customer'">
        <h2>Customer Dashboard</h2>
        <p>Book services, view requests, and give feedback.</p>
      </div>

      <div v-else-if="userdata.role === 'professional'">
        <h2>Professional Dashboard</h2>
        <p>Accept or reject service requests and manage your services.</p>
      </div>
    </div>
    `,
    data: function(){
        return{
            userdata:{}
        }
    },
    mounted(){
        fetch('/api/home', {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem("auth_token")
            }

        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched user data:", data);  // Debugging
            this.userdata = data;
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            this.userdata = { email: "Error", username: "Could not fetch data" }; // Display error in UI
        });
    }
}