// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import { BrowserRouter } from "react-router"
// import Router from "./pages/Router.tsx"
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import App from './App.tsx'
// import ReactDOM from 'react-dom/client'

// // ReactDOM.createRoot(document.getElementById("root")!).render(
// //   <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
// //     <App />
// //   </GoogleOAuthProvider>
// // );


// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <BrowserRouter>
//       <Router />
//     </BrowserRouter>
//   </StrictMode>,
// )


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router"
import Router from "./pages/Router.tsx"
import { GoogleOAuthProvider } from "@react-oauth/google"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)

console.log("CLIENT ID =", import.meta.env.VITE_GOOGLE_CLIENT_ID);
