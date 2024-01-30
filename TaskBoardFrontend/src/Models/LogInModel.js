import { API_BASE_URL } from "../Constants/api";

class UserConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserConflictError';
    }
}

class LogInModel {
    constructor(userName, userPassword) {
        this.userName = userName;
        this.userPassword = userPassword;
    }

    register() { 
        fetch(API_BASE_URL + "/User/register", {
            method: 'POST',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(this)
        })
            .then(response => {
                if (response.status === 409) {
                    throw new UserConflictError("This userName is taken.");
                } else if (response.ok) {
                    return response.json();
                } else {
                    console.error('Error:', response.status, response.statusText);
                    throw new Error('Unexpected error occured.');
                }
            })
            .then(data => {
                console.log('Data:', data);
            })
    }

    login() {
        fetch(API_BASE_URL + "/User/login", {
            method: 'POST',
            headers: {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(this)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    throw new UserConflictError("Invalid login and/or password!");
                } else {
                    console.error('Error', response.status, response.statusText);
                    throw new Error("Unexpected error occured!");
                }
            })
            .then(data => {
                console.log('Data', data);
            })
    }
}

export { LogInModel, UserConflictError };