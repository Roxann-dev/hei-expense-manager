import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";

import { lazy, type JSX } from "react";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";
import Navbar from "./components/layout/Navbar";

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Categories = lazy(() => import("./pages/dashboard/Categories"));
const Expenses = lazy(() => import("./pages/dashboard/Expenses"));
const Incomes = lazy(() => import("./pages/dashboard/Incomes"));
const Profiles = lazy(() => import("./pages/dashboard/Profiles"));

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { token } = useAuthContext();
    return token ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }: { children: JSX.Element }) => {
    const { token } = useAuthContext();
    return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
    const { theme } = useTheme();
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Navbar />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="incomes" element={<Incomes />} />
                        <Route path="profile" element={<Profiles />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
            <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar newestOnTop theme={theme} />
        </AuthProvider>
    );
}

export default App;
