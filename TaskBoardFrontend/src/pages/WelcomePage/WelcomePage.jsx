import { useState } from "react";
import { LogInModel } from "../../Models/LogInModel";
import { usePageContext } from "../../components/PageProvider"

const WelcomePage = () => { 
    const { setPage } = usePageContext();
    const [userName, setUserName] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [error, setError] = useState("")

    return (
        <>
            <div>
                <p>Login: </p>
                <input
                    type="text" id="login" name="login"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <p>Password: </p>
                <input
                    type="password" id="password" name="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                />
                <p color="RED">{error}</p>
            </div>

            <div>
                <button onClick={ HandleLogIn }>Log in</button>
                <button onClick={() => { setPage('RegisterPage') }}>Don&apos;t have an account? Register!</button>
            </div>
        </>
    )

    function HandleLogIn() {
        let logInModel = new LogInModel(userName, userPassword);

        try {
            let response = logInModel.login();
            console.log(response);
        }
        catch(error) {
            setError(error.message);
        }
    }
}



export default WelcomePage