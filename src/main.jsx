import CustomMap from "./data-structures/map.js";
import CustomSet from "./data-structures/set.js";
window.Map = CustomMap;
window.Set = CustomSet;
globalThis.Map = CustomMap;
globalThis.Set = CustomSet;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/global.css";
import App from "./App.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <SearchProvider>
            <App />
        </SearchProvider>
    </StrictMode>
);
