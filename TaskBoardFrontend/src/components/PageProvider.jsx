import { createContext, useContext, useState } from 'react'
import PropTypes from 'prop-types';

const PageContext = createContext();

export const usePageContext = () => {
    return useContext(PageContext);
};

export const PageProvider = ({ children }) => {
    const [currentPage, setPage] = useState('WelcomePage');

    const setPageAndNavigate = (page) => {
        setPage(page);
    };

    const value = {
        currentPage,
        setPage: setPageAndNavigate,
    };

    return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

PageProvider.propTypes = {
    children: PropTypes.node.isRequired,
};