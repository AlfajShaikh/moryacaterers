import { configureStore } from "@reduxjs/toolkit";
import signinReducer from "./components/SignIn/signInSlice"
import loginReducer from "./components/login/loginSlice"
import menuReducer from "./components/Menu/AddMenu/addMenuSlice"
import menuListReducer from './components/Menu/menuSlice'
import ordersReducer from './components/orders/ordersSlice'
import homeReducer from './components/Home/homeSlice'
import invoiceReducer from './components/Invoice/invoiceSlice'
import analyticsReducer from "./components/Home/BusinessAnalytics/businessAnalyticsSlice"
export const store = configureStore({   
    reducer: {
        signin: signinReducer,
        login: loginReducer,
        menu: menuReducer,
        menuList:menuListReducer,
        orders:ordersReducer,
        dashboard:homeReducer,
        invoice:invoiceReducer,
        analytics: analyticsReducer
    },
});