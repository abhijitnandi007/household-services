export default {
    template: `
    <div class="homepage">
        <!-- Banner Section -->
        <div class="jumbotron text-center text-white py-5 banner">
            <h1 class="display-4">Welcome to Root Service</h1>
            <p class="lead">Find the best professionals for your household services!</p>
            <router-link to="/login" class="btn btn-light btn-lg">Get Started</router-link>
        </div>

        <!-- Info Section -->
        <div class="container mt-4">
            <div class="row">
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Book a Service</h5>
                            <p class="card-text">Choose from a variety of household services and book a professional.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Trusted Professionals</h5>
                            <p class="card-text">All professionals are verified and rated by our customers.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Easy Payments</h5>
                            <p class="card-text">Secure and hassle-free payments for your convenience.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    mounted() {
        document.body.classList.add("homepage-bg");
    },
    beforeDestroy() {
        document.body.classList.remove("homepage-bg");
    }
}
