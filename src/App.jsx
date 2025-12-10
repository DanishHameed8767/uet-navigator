import MapCanvas from "./components/MapCanvas";
import React, { useState, useEffect } from "react";
import Navbar from "./features/Navbar/Navbar.jsx";
import Home from "./features/Home/Home.jsx";
import LoginDialog from "./features/Dialogs/LoginDialog/LoginDialog.jsx";
import SignupDialog from "./features/Dialogs/SignupDialog/SignupDialog.jsx";
import ProfileDialog from "./features/Dialogs/ProfileDialog/ProfileDialog.jsx";

import "./App.css";

const App = () => {
    const [isLoggedIn, setLoggedIn] = useState({
        name: "Mian Muhammad Zaheer",
        email: "zaheermuhammad636@gmail.com",
        pass: "zaheer123",
    });
    // const [isLoggedIn, setLoggedIn] = useState(null);

    // MANAGING DIALOGS

    const [isLoginOpen, setLoginOpen] = useState(false);
    const openLogin = () => {
        setLoginOpen(true);
    };
    const closeLogin = () => {
        setLoginOpen(false);
    };

    const [isSignupOpen, setSignupOpen] = useState(false);
    const openSignup = () => {
        setSignupOpen(true);
    };
    const closeSignup = () => {
        setSignupOpen(false);
    };

    const switchToSignup = () => {
        setLoginOpen(false);
        setSignupOpen(true);
    };

    const switchToLogin = () => {
        setLoginOpen(true);
        setSignupOpen(false);
    };

    const [isProfileOpen, setProfileOpen] = useState(false);
    const openProfile = () => {
        setProfileOpen(true);
    };
    const closeProfile = () => {
        setProfileOpen(false);
    };

    // TOGGLING THEME

    const [theme, setTheme] = useState("light");
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <div className="app">
            <Navbar
                loggedUser={isLoggedIn}
                logoutUser={() => {
                    setLoggedIn(null);
                }}
                openLogin={openLogin}
                openProfile={openProfile}
                toggleTheme={toggleTheme}
            />
            <Home />
            {isLoginOpen && (
                <LoginDialog
                    closeDialog={closeLogin}
                    switchToSignup={switchToSignup}
                />
            )}
            {isSignupOpen && (
                <SignupDialog
                    closeDialog={closeSignup}
                    switchToLogin={switchToLogin}
                />
            )}
            {isProfileOpen && (
                <ProfileDialog
                    loggedUser={isLoggedIn}
                    closeDialog={closeProfile}
                />
            )}
        </div>
    );
};

export default App;
