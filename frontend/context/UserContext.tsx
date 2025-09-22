import { User } from "pages/Profile";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

const UserContext = createContext<{ user: any; loading: boolean } | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const email = "greencalen3@gmail.com";
    const BASE_URL = "http://192.168.1.168:5000";

    useEffect(() => {
        const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/users/getUserByEmail/${email}`);
            if (!res.ok) throw new Error("Failed to fetch user");
            const data = await res.json();
            console.log("Fetched user:", data);
            setUser(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading }}>
        {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within a UserProvider");
    return ctx;
}
