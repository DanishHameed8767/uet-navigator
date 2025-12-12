import { useState, useEffect } from "react";

import Navbar from "./features/Navbar/Navbar.jsx";
import Home from "./features/Home/Home.jsx";
import LoginDialog from "./features/Dialogs/LoginDialog/LoginDialog.jsx";
import SignupDialog from "./features/Dialogs/SignupDialog/SignupDialog.jsx";
import ProfileDialog from "./features/Dialogs/ProfileDialog/ProfileDialog.jsx";
import MapCanvas from "./components/MapCanvas";

import defaultUsers from "../public/data/users.json";
import SingleLinkedList from "./data-structures/linked-list.js";

import "./App.css";

const App = () => {
    // TOGGLING THEME

    const [theme, setTheme] = useState(() => {
        const user = parseSafely(localStorage.getItem("app-current-user"));
        return user ? user.theme : "light";
    });
    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === "light" ? "dark" : "light";
            if (currentUser) {
                const updatedUser = {
                    name: currentUser.name,
                    email: currentUser.email,
                    password: currentUser.password,
                    theme: newTheme,
                    map: currentUser.map,
                };
                setCurrentUser(updatedUser);
            }
            return newTheme;
        });
    };
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    // MANAGING USERS

    const [currentUser, setCurrentUser] = useState(() => {
        const user = parseSafely(localStorage.getItem("app-current-user"));
        return user ? user : null;
    });
    useEffect(() => {
        if (currentUser) {
            console.log(currentUser);
            localStorage.setItem(
                "app-current-user",
                JSON.stringify(currentUser)
            );
            setTheme(currentUser.theme);
        } else {
            localStorage.removeItem("app-current-user");
            setTheme("light");
        }
    }, [currentUser]);

    const [usersList, setUsersList] = useState(loadUserData());
    useEffect(() => {
        localStorage.setItem("app-users", JSON.stringify(usersList.toArray()));
    }, [usersList]);

    // MANAGING DIALOGS

    const [isLoginOpen, setLoginOpen] = useState(false);
    const openLogin = () => {
        setLoginOpen(true);
    };
    const closeLogin = () => {
        setLoginOpen(false);
    };
    const onLoginSubmit = ({ email, password }) => {
        const userFound = usersList.find(email);
        if (userFound) {
            if (userFound.password === password) {
                setCurrentUser(userFound);
                closeLogin();
                return true;
            } else {
                console.log("Password mismatched.");
                return false;
            }
        } else {
            console.log("Email not found.");
            return false;
        }
    };

    const [isSignupOpen, setSignupOpen] = useState(false);
    const openSignup = () => {
        setSignupOpen(true);
    };
    const closeSignup = () => {
        setSignupOpen(false);
    };
    const onSignupSubmit = ({ name, email, password }) => {
        const userFound = usersList.find(email);
        if (!userFound) {
            setUsersList((prev) => {
                const newList = prev.deepCopy();
                const newUser = {
                    name: name,
                    email: email,
                    password: password,
                    theme: theme,
                    map: "flat",
                };
                newList.append(newUser);
                return newList;
            });
            console.log("Account created successfully.");
        } else {
            console.log("Email already in use.");
            return false;
        }
    };

    const switchToSignup = () => {
        closeLogin();
        openSignup();
    };

    const switchToLogin = () => {
        openLogin();
        closeSignup();
    };

    const [isProfileOpen, setProfileOpen] = useState(false);
    const openProfile = () => {
        setProfileOpen(true);
    };
    const closeProfile = () => {
        setProfileOpen(false);
    };
    const handleLogout = () => {
        setUsersList((prev) => {
            const newList = prev.deepCopy();
            newList.update(currentUser);
            return newList;
        });
        setCurrentUser(null);
    };

    const [searchMode, setSearchMode] = useState("default");

    return (
        <div className="app">
            <Navbar
                currentUser={currentUser}
                logoutUser={handleLogout}
                openLogin={openLogin}
                openProfile={openProfile}
                toggleTheme={toggleTheme}
                setSearchMode={setSearchMode}
            />
            <Home
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                searchMode={searchMode}
                setSearchMode={setSearchMode}
            />
            {isLoginOpen && (
                <LoginDialog
                    closeDialog={closeLogin}
                    onSubmit={onLoginSubmit}
                    switchToSignup={switchToSignup}
                />
            )}
            {isSignupOpen && (
                <SignupDialog
                    closeDialog={closeSignup}
                    onSubmit={onSignupSubmit}
                    switchToLogin={switchToLogin}
                />
            )}
            {isProfileOpen && (
                <ProfileDialog
                    currentUser={currentUser}
                    closeDialog={closeProfile}
                />
            )}
        </div>
    );
};

const loadUserData = () => {
    const list = new SingleLinkedList();
    let savedUsers = localStorage.getItem("app-users");
    if (savedUsers) {
        savedUsers = JSON.parse(savedUsers);
    } else {
        localStorage.setItem("app-users", JSON.stringify(defaultUsers));
        savedUsers = defaultUsers;
    }
    savedUsers.forEach((element) => {
        list.append(element);
    });
    return list;
};

const parseSafely = (data) => {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
        return null;
    }
};

export default App;
