import { usePageContext } from '../components/PageProvider';
import WelcomePage from '../pages/WelcomePage/WelcomePage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import UserPage from '../pages/UserPage/UserPage';

const PageContent = () => {
    var { currentPage } = usePageContext();

    return (
        <>
            {currentPage === 'WelcomePage' && <WelcomePage />}
            {currentPage === 'RegisterPage' && <RegisterPage />}
            {currentPage === 'UserPage' && <UserPage /> }
        </>
    );
}

export default PageContent;