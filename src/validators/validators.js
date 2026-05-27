export const validateName = {
    validator: function (value) {
        return /^[A-Za-z\s]+$/.test(value);
    },
    message: "Name can contain only letters and spaces",
}

export const validatePassword = {
    validator: function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
    },
    message: "Password must contain uppercase, lowercase, number, special character and be at least 8 characters long",
}

export const validateEmail = {
    validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message: "Password must contain uppercase, lowercase, number, special character and be at least 8 characters long",
}