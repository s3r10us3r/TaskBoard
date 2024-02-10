import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import LoginRegister from './LoginRegister';

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={LoginRegister()}/>
            </Routes>
        </Router>
  )
}

export default App;