export default {
    template:`
<div id="input-form" style="box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);background-color: #fff;border: 0px solid rgb(101, 99, 99); padding: 1rem;border-radius: 15px;">
    <h2 id="heading">Login</h2>
    <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id= "email" v-model="formdata.email" required>
    </div>
    <div class="mb-3">
        <label for="pwd" class="form-label">Password</label>
        <input type="password" class="form-control" id="pwd" v-model="formdata.password" placeholder="1234" required>
    </div>
    <div class="mb-3" style="text-align: center;">
        <button @click="loginuser" class="btn btn-primary mb-3" >Login</button> 
        <br> 
    <router-link to = '/Signup' style="padding-left: 0em;">New User?</router-link>
        </div>
        

</div>

    `,
    data: function(){
        return{
            formdata:{
                email:"",
                password:""

            }
        }
    },
    methods: {
        loginuser: function() {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.formdata)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Login failed");
                }
                return response.json();
            })
            .then(data => {
                if (data["Auth-Token"]) {
                    localStorage.setItem("auth_token", data["Auth-Token"]);
                    localStorage.setItem("id", data.user.id);
                    localStorage.setItem("role", data.user.roles[0]);
                    if(data.user.roles[0] === 'customer'){
                        this.$router.push('/customer');
                    }
                    else if(data.user.roles[0] === 'professional'){
                        this.$router.push('/professional');
                    }
                    else{
                        this.$router.push('/admin');
                    }
                    
                } else {
                    this.message = data.message;
                    alert(this.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Invalid credentials. Please try again.");
            });
        }
    }
}