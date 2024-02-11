import { API_PATH } from "./constants";

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
                <button id="logInButton">Log in!</button>
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

    if (UserName == "") {
        const usernameMessage = document.getElementById('usernameMessage');
        usernameMessage.textContent = "You must provide a username!";
        return;
    }
    if (UserPassword) {
        const passwordMessage = document.getElementById('passwordMessage');
        passwordMessage.textContent = "You must provide a password!";
        return;
    }

    const requestBody = {
        UserName: UserName,
        UserPassword: UserPassword
    }

    fetch(API_PATH + "/User" + "/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    }).then
}


export default LoginPage;