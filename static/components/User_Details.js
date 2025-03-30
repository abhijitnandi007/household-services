export default {
    template: `
<div class="container card m-2">
        <h2 class="mb-3 text-center">Bio</h2>
        <div class="row">
            <div class="col-md-6">
                <p><strong>ID:</strong> {{ user.id }}</p>
                <p><strong>Name:</strong> {{ user.username }}</p>
                <p><strong>Email:</strong> {{ user.email }}</p>
                <p><strong>Role:</strong> {{ user.roles[0].name }}</p>
            </div>
            <div class="col-md-6">
                <p><strong>City:</strong> {{ user.city }}</p>
                <p><strong>Pin Code:</strong> {{ user.pincode }}</p>
                <p>
                    <strong>Status:</strong> 
                    <span class="badge" :class="{'bg-success': user.active, 'bg-danger': !user.active}">
                        {{ user.active ? 'Active' : 'Blocked' }}
                    </span>
                </p>
            </div>
        </div>

        <!-- Additional fields for professionals -->
        <template v-if="user.roles[0].name === 'professional'">
            <hr />
            <p><strong>Service:</strong> {{ user.service }}</p>
            <p><strong>Specialization:</strong> {{ user.specialization[0] }}</p>
            <p><strong>Experience (years):</strong> {{ user.experience[0] }}</p>
            <p><strong>Rating:</strong> {{ user.rating }}</p>
        </template>
    </div>
    `,
    data() {
        return{
            user:""

        }
    },
mounted() {
    fetch(`/api/user/${this.$route.params.id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem("auth_token")
        }
    })
    .then(response =>  response.json())
    .then(data => {
        this.user = data;
    })
}

}