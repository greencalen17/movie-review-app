import { Movie } from "pages/Movies";
import React, { createContext, useContext, useState } from "react";

// Define the shape of your context
interface MovieCacheContextType {
    cachedMovies: Movie[];
    setCachedMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
    scrollOffset: number;
    setScrollOffset: React.Dispatch<React.SetStateAction<number>>;
}

// Create context with explicit type (or undefined initially)
const MovieCacheContext = createContext<MovieCacheContextType | undefined>(undefined);

// ✅ Type for provider props
interface MovieCacheProviderProps {
    children: React.ReactNode;
}

export const MovieCacheProvider: React.FC<MovieCacheProviderProps> = ({ children }) => {
    const [cachedMovies, setCachedMovies] = useState<any[]>([]);
    const [scrollOffset, setScrollOffset] = useState(0);

    return (
        <MovieCacheContext.Provider
        value={{ cachedMovies, setCachedMovies, scrollOffset, setScrollOffset }}
        >
        {children}
        </MovieCacheContext.Provider>
    );
};

// ✅ Custom hook with proper type safety
export const useMovieCache = (): MovieCacheContextType => {
    const context = useContext(MovieCacheContext);
    if (!context) {
        throw new Error("useMovieCache must be used within a MovieCacheProvider");
    }
    return context;
};