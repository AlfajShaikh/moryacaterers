import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "./loginSlice";
import logo from "../../assets/images/logomorya.jpeg"

export default function Login({ setIsLoggedIn }) {

    const dispatch = useDispatch();

    const { loading, error } = useSelector(
        (state) => state.login
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleLogin = async (e) => {
        e.preventDefault();

        const result = await dispatch(
            loginUser({
                email,
                password,
            })
        );

        if (loginUser.fulfilled.match(result)) {
            setIsLoggedIn(true);
        } else {
            alert(result.payload?.message || "Invalid Email or Password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4 font-sans">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 lg:p-10">

                {/* Logo & Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="" className="h-24" />

                    {/* <h1 className="text-center">मोरया कॅटरर्स </h1> */}
                    <p className="text-gray-500 mt-3 text-sm text-center">
                        साइन इन करण्यासाठी कृपया तुमचे तपशील भरा.
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ईमेल पत्ता
                        </label>
                        <input
                            type="email"
                            placeholder="admin@gmail.com"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition duration-200 placeholder-gray-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">

                            पासवर्ड
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition duration-200 placeholder-gray-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Options Row */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-gray-600 cursor-pointer hover:text-indigo-600 transition">
                            <input type="checkbox" className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            Remember me
                        </label>
                        <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
                            पासवर्ड विसरलात?
                        </a>
                    </div>

                    {/* Submit Button */}
                    {error && (
                        <p className="text-red-500 text-center mt-3">
                            {error.message || error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg"
                    >
                        {loading ? "Signing In..." : "साइन इन करा"}
                    </button>
                </form>



            </div>
        </div>
    );
}