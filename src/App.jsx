import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Header from "./components/Header/header";
import { Home } from "./components/Home/home";
import { Menu } from "./components/Menu/menu";
import { Orders } from "./components/orders/orders";
import Login from "./components/login/Login";
import { SignIn } from "./components/SignIn/signIn";
import { AddMenu } from "./components/Menu/AddMenu/addMenu";
import { Invoice } from "./components/Invoice/invoice";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  return (
    <>
      {!isLoggedIn ? (
        <Login setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <>
          <Header setIsLoggedIn={setIsLoggedIn} />



          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/orders" element={<Orders />} />
            <Route path="/addmenu" element={<AddMenu />} />
            <Route path="/menu" element={< Menu />} />
             <Route path="/invoice" element={< Invoice />} />


            {/* Redirect any unknown route */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/signin" element={<SignIn />} />

          </Routes>
        </>
      )}
    </>
  );
}

export default App;