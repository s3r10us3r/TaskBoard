import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import LoginPage from './LoginPage/LoginPage';
import RegisterPage from './RegisterPage/Register'
import BoardView from './BoardView/BoardView';
import Redirector from './Redirector';

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Redirector />} />
                <Route path="/login" element={<LoginPage/> } />
                <Route path="/register" element={<RegisterPage/>} />
                <Route path="/board" element={<BoardView/>} />
            </Routes>
        </Router>
  )
}

export default App;