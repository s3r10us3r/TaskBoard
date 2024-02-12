import { isTokenValid, getUserName } from "../../Models/TokenManagment";
import { usePageContext } from "../../components/PageProvider"
import Cookies from 'js-cookie';


const UserPage = () => {
    const { setPage } = usePageContext();

    let token = Cookies.get('authToken');
    if (!(token && isTokenValid(token))) {
        Cookies.remove('authToken');
        setPage('WelcomePage');
        return;
    }

    let userName = getUserName(token);
    console.log(userName);
    return (
        <>
            <p>User: { userName}</p>
        </>
    )
}


export default UserPage