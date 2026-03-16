import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { GlobalBackground } from './components/GlobalBackground'
import { light as theme } from './config/theme'
import HomePage from './pages/HomePage'

function App() {
    return (
        <ThemeProvider theme={theme}>
            <GlobalBackground>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                    </Routes>
                </Router>
            </GlobalBackground>
        </ThemeProvider>
    )
}

export default App
