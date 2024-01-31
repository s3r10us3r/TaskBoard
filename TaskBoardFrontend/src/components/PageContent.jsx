import { usePageContext } from '../components/PageProvider';
import WelcomePage from '../pages/WelcomePage/WelcomePage';
import OtherPage from '../pages/OtherPage/OtherPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';

const PageContent = () => {
    var { currentPage } = usePageContext();

    return (
        <>
            {currentPage === 'WelcomePage' && <WelcomePage />}
            {currentPage === 'OtherPage' && <OtherPage />}
            {currentPage === 'RegisterPage' && <RegisterPage />}
        </>
    );
}

export default PageContent;