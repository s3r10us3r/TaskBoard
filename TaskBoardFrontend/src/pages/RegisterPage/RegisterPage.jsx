import { useState } from "react";
import { LogInModel } from "../../Models/LogInModel";
import { usePageContext } from "../../components/PageProvider";
import WelcomePage from "../WelcomePage/WelcomePage";

const RegisterPage = () => {
    const { setPage } = usePageContext();
    const [userName, setUserName] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");


    return (
        <>
            <div>
                <p>Login: </p>
                <input
                    type="text" id="login" name="login"
                    onChange={(e) => {setUserName(e.target.value)}}
                />
                <p>Password: </p>
                <input
                    type="password" id="password" name="password"
                    onChange={(e) => {setUserPassword(e.target.value) }}
                />
                <p>Repeat Password: </p>
                <input
                    type="password" id="repeatPassword" name="repeatPassword"
                    onChange={(e) => {setRepeatPassword(e.target.value)} }
                />
                <p style={{ color: 'red' }}>{error}</p>
            </div>

            <div>
                <button onClick={() => { handleRegister() }}>Register!</button>
            </div>
        </>
    );


    function handleRegister() {
        if (userPassword.length < 8) {
            setError("Password is too short!");
            return;
        }
        if (userPassword !== repeatPassword) {
            setError("Passwords are not the same!")
            return;
        }

        let logInModel = new LogInModel(userName, userPassword);
        try {
            let response = logInModel.register();
            console.log(response);
            setPage(WelcomePage);
        }
        catch (error) {
            setError(error.message);
        }

    }
}

export default RegisterPage;