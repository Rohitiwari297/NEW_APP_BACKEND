class ApiResponse {
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = true;
        this.data = data;
    }
}

export default ApiResponse