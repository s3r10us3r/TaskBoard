import { API_BASE_URL } from "../Constants/api";

export class UserConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserConflictError';
    }
}

export class LogInModel {
    constructor(userName, userPassword) {
        this.userName = userName;
        this.userPassword = userPassword;
    }

    async register() {
        const response = await fetch(API_BASE_URL + "/User/register", {
             method: 'POST',
             headers: {
                  "Content-Type": "application/json"
                  },
             body: JSON.stringify(this)
        });

        if (!response.ok) {
            if (response.status === 409) {
                throw new UserConflictError("This user name is taken!");
            } else {
                console.error("Error:", response.status, response.statusText);
                throw new Error("Unexpected error occured.");
            }
        }
        const data = await response.json();
        console.log("Data:", data);
        return data;
    }

    async login() {
            const response = await fetch(API_BASE_URL + "/User/login", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new UserConflictError("Invalid login and password!");
                } else {
                    console.error("Error:", response.status, response.statusText);
                    throw new Error("Unexpected error occured.");
                }
            }
        
        const data = await response.json()
        console.log("Data:", data);
        return data;
    }
}