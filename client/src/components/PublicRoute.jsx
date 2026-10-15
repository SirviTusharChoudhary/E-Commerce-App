import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (user) {
        return <Navigate to='/home' />
    }

    return children
}

export default PublicRoute