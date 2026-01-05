import CustomMap from "./data-structures/map.js";
import CustomSet from "./data-structures/set.js";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/global.css";
import App from "./App.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";
import { registerSW } from "virtual:pwa-register";

registerSW({
    onNeedRefresh() {
        console.log("New version available");
    },
    onOfflineReady() {
        console.log("App ready to work offline");
    },
});

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <SearchProvider>
            <App />
        </SearchProvider>
    </StrictMode>
);
