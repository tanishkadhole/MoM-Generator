import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
    const [showLogin, setShowLogin] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [authError, setAuthError] = useState("");
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError("");
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                login(data.token);
                setShowLogin(false);
            } else {
                setAuthError(data.message);
            }
        } catch (error) {
            setAuthError('An error occurred. Please try again.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setAuthError("");

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();
            
            if (response.ok) {
                login(data.token);
                setShowRegister(false);
            } else {
                setAuthError(data.message);
            }
        } catch (error) {
            setAuthError('An error occurred. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setShowLogin(true);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                    {showLogin ? (
                        <>
                            <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Login
                                </button>
                            </form>
                            <p className="mt-4 text-center">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => {
                                        setShowLogin(false);
                                        setShowRegister(true);
                                        setAuthError("");
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    Register
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
                            <form onSubmit={handleRegister}>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Register
                                </button>
                            </form>
                            <p className="mt-4 text-center">
                                Already have an account?{" "}
                                <button
                                    onClick={() => {
                                        setShowRegister(false);
                                        setShowLogin(true);
                                        setAuthError("");
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    Login
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="relative h-screen">
                <img
                    src="/mom_final.png"
                    alt="Meeting Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center flex items-center gap-16">
                        <button
                            onClick={() => navigate('/manual')}
                            className="bg-blue-600 text-white py-4 px-16 rounded-lg shadow-lg text-2xl font-semibold hover:bg-blue-700 transition transform hover:scale-105"
                        >
                            Manual
                        </button>
                        <button
                            onClick={() => navigate('/automated')}
                            className="bg-green-600 text-white py-4 px-16 rounded-lg shadow-lg text-2xl font-semibold hover:bg-green-700 transition transform hover:scale-105"
                        >
                            Automated
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}