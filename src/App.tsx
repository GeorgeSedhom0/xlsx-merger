import "./App.css";
import { createTheme, ThemeProvider } from "@mui/material";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AutoMatch from "./pages/AutoMatch";
import ManMatch from "./pages/ManMatch";

const theme = createTheme({
  direction: "rtl",
  palette: {
    mode: "dark",
    // no margin for the body
  },
});

const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<AutoMatch />} />
            <Route path="/man" element={<ManMatch />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
