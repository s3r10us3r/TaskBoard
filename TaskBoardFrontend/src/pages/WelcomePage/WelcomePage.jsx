import { useState } from "react";
import { LogInModel, UserConflictError } from "../../Models/LogInModel";
import { usePageContext } from "../../components/PageProvider"
import { getTokenExpirationDate } from "../../Models/TokenManagment";
import Cookies from 'js-cookie';

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
                <p style={{ color: 'red' }}>{error}</p>
            </div>

            <div>
                <button onClick={ HandleLogIn }>Log in</button>
                <button onClick={() => { setPage('RegisterPage') }}>Don&apos;t have an account? Register!</button>
            </div>
        </>
    )

    function HandleLogIn() {
        let logInModel = new LogInModel(userName, userPassword);

        
        let data = logInModel.login()
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                if (error instanceof UserConflictError) {
                    setError(error.message);
                }
                else {
                    setError("Unexpected error occurerd!");
                }
            });

        if (data != null) {
            Cookies.set('authToken', data.token, { expires: getTokenExpirationDate() })
            setPage('UserPage');
        }
    }
}



export default WelcomePage