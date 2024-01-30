import './App.css'
import { PageProvider } from './components/PageProvider';
import PageContent  from './components/PageContent';

function App() {

    return (
        <PageProvider>
            <PageContent/>
        </PageProvider>
    )
}

export default App
