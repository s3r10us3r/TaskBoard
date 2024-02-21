import { getCookie, setCookie, deleteCookie } from "../Services/CookieService";
import {API_PATH} from "../constants"

function LoginPage() {
    return (
        <>
            <h1>Welcome to TaskBoard</h1>
            <div>
                <p>Username:</p> <input type="text" id="userNameBox"></input> <p id="usernameMessage" style={{ color: 'red' }}></p>
            </div>
            <div>
                <p>Password:</p> <input type="password" id="passwordBox"></input> <p id="passwordMessage" style={{ color: 'red' }}></p>
            </div>
            <div>
                <button id="logInButton" onClick={logIn}>Log in!</button>
            </div>
            <div>
                <p id="errorMessage" style={{ color: 'red' }}></p>
            </div>
            <div>
                <a href="/register">Don't have an account yet? Register here!</a>
            </div>
        </>
    )
}


function logIn() {
    const userNameBox = document.getElementById('userNameBox');
    const passwordBox = document.getElementById('passwordBox');

    const UserName = userNameBox.value;
    const UserPassword = passwordBox.value;

    const usernameMessage = document.getElementById('usernameMessage');
    const passwordMessage = document.getElementById('passwordMessage');

    if (!UserName) {
        usernameMessage.textContent = "You must provide a username!";
        return;
    }
    else {
        usernameMessage.textContent = "";
    }
    if (!UserPassword) {

        passwordMessage.textContent = "You must provide a password!";
        return;
    }
    else {
        passwordMessage.textContent = "";
    }
    const requestBody = {
        UserName: UserName,
        UserPassword: UserPassword
    }

    const errorMessage = document.getElementById('errorMessage');

    fetch(API_PATH + "/User" + "/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    console.log(response.json());
                    errorMessage.textContent = 'Invalid password and/or username!';
                }
                else {
                    console.log("Response status: ", response.status);
                    console.log(response.json());
                    throw new Error('Serverside error!');
                }
            }
            else {
                errorMessage.textContent = "";
                const responseObject = response.json()
                    .then(data => {
                        setCookie('token', data.token);
                        window.location.href = "/board";
                    })
                console.log(responseObject);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation!', error);
            errorMessage.textContent = 'Unexpected error occured! Try again later.';
        })
}

export default LoginPage;