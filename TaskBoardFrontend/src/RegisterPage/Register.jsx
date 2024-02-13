import { API_PATH } from "../constants";

function RegisterPage() {
    return (
        <>
            <h1>Welcome to TaskBoard</h1>
            <div>
                <p>Username:</p> <input type="text" id="userNameBox" /> <p id="userNameMessage" style={{ color: 'red'}}></p>
            </div>
            <div>
                <p>Password:</p> <input type="password" id="passwordBox" /> <p id="passwordMessage" style={{ color: 'red' }}></p>
            </div>
            <div>
                <p>Repeat password:</p> <input type="password" id="repeatBox" /> <p id="repeatMessage" style={{ color: 'red' }}></p>
            </div>
            <div>
                <button id="logInButton" onClick={register}>Register!</button>
            </div>
            <div>
                <p id="errorMessage" style={{ color: 'red' }}></p>
            </div>
            <div>
                <a href="/">Have an account already? Log in here!</a>
            </div>
        </>
    )
}


function register() {
    if (!validateInputsLocally())
        return;

    const userName = document.getElementById('userNameBox').value;
    const password = document.getElementById('passwordBox').value;
    const errorMessage = document.getElementById('errorMessage');

    const requestBody = {
        UserName: userName,
        UserPassword: password
    }

    fetch(API_PATH + '/User/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 409) {
                    console.log(response);
                    errorMessage.textContent = 'This username is already taken!';
                }
                else {
                    console.log(response);
                    errorMessage.textContent = 'Unexpected error occured during registration, try again later.';
                }
            }
            else {
                window.location.href = "/";
                console.log(response);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error)
        });
}

function validateInputsLocally() {
    let userNameInput = document.getElementById('userNameBox').value;
    let passwordInput = document.getElementById('passwordBox').value;
    let repeatPasswordInput = document.getElementById('repeatBox').value;

    let inputsAreValid = true;

    let userNameMessage = document.getElementById('userNameMessage');
    if (userNameInput.length < 8) {
        userNameMessage.textContent = "Username is too short!";
        inputsAreValid = false;
    }
    else if (userNameInput.length > 64) {
        userNameMessage.textContent = "Username is too long!";
        inputsAreValid = false;
    }
    else {
        userNameMessage.textContent = "";
    }

    let passwordMessage = document.getElementById("passwordMessage");
    if (passwordInput.length < 8) {
        passwordMessage.textContent = "Password is too short!";
        inputsAreValid = false;
    }
    else if (passwordInput.length > 64) {
        passwordMessage.textContent = "Password is too long!";
        inputsAreValid = false;
    }
    else {
        passwordMessage.textContent = "";
    }

    let repeatMessage = document.getElementById("repeatMessage");
    if (repeatPasswordInput != passwordInput) {
        repeatMessage.textContent = "Passwords are not the same!";
        inputsAreValid = false;
    }
    else {
        repeatMessage.textContent = ""
    }

    return inputsAreValid;
}


export default RegisterPage;