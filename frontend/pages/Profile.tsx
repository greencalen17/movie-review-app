import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    Image,
    Dimensions,
    FlatList,
} from "react-native";
import { ObjectId } from "bson";
import { Movie } from "./Movies";
import { useUser } from "context/UserContext";

export interface User {
    active_status: boolean;
    bio: string;
    created_at: Date;
    email: string;
    favorite_movies: Array<ObjectId>;
    first_name: string;
    last_name: string;
    phone: string;
    profile_pic: string;
    role: string;
    username: string;
    _id: ObjectId;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ✅ Poster sizing
const PROFILE_PIC_DIMENSIONS = SCREEN_HEIGHT * 0.1;
const MAIN_POSTER_WIDTH = SCREEN_WIDTH / 4.5;
const MAIN_POSTER_HEIGHT = SCREEN_WIDTH / 3; 
const GRID_POSTER_WIDTH = SCREEN_WIDTH / 6;
const GRID_POSTER_HEIGHT = SCREEN_WIDTH / 4; // maintain aspect ratio

function ProfileScreen() {
    const { user, loading } = useUser();
    const [topTenMovies, setTopTenMovies] = useState<Array<Movie>>([]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
    if (!user) {
        return (
            <View style={styles.center}>
                <Text>User not found 😢</Text>
            </View>
        );
    }

    const BASE_URL = "http://192.168.1.168:5000"; // replace with your local IP

    useEffect(() => {
        const fetchFavMovie = async () => {
            try {
                if (!user?.favorite_movies) return;
                let favMovies = [];
                for (const movieId of user.favorite_movies) {
                    const favMovieResponse = await fetch(
                        `${BASE_URL}/movies/getMovieById/${movieId}`
                    );
                    if (!favMovieResponse.ok)
                        throw new Error("Fav movie not found");
                    const favMovieData = await favMovieResponse.json();
                    favMovies.push(favMovieData);
                }
                setTopTenMovies(favMovies);
            } catch (err) {
                console.error(err);
                console.log("Failed to fetch favorite movies");
            } finally {
                
            }
        };

        fetchFavMovie();
    }, [user]);

    const renderGridItem = ({ item }: { item: Movie }) => (
        <Image
            source={{ uri: item.Poster }}
            style={styles.gridPoster}
        />
    );

    return (
        <View style={styles.container}>
            {/* Profile Picture & Info */}
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                {user.profile_pic && (
                    <Image
                        source={{ uri: user.profile_pic }}
                        style={styles.profileImage}
                    />
                )}

                <View style={styles.textContainer}>
                    <Text style={styles.username}>{user.username}</Text>
                    <Text style={styles.fullName}>
                        {user.first_name} {user.last_name}
                    </Text>
                    <Text style={styles.bio}>{user.bio}</Text>
                </View>
            </View>

            {/* Favorite Movie Section */}
            {topTenMovies.length > 0 && (
                <View style={styles.favoriteMovieContainer}>
                    {/* Row 1 - Main Favorite Poster */}
                    {topTenMovies[0] && (
                        <Image
                            source={{ uri: topTenMovies[0].Poster }}
                            style={styles.favoriteMoviePoster}
                        />
                    )}

                    {/* Row 2 - 2 posters */}
                    <View style={styles.pyramidRow}>
                        {topTenMovies.slice(1, 3).map((movie, index) => (
                            <Image
                                key={movie._id.toString()}
                                source={{ uri: movie.Poster }}
                                style={styles.gridPoster}
                            />
                        ))}
                    </View>

                    {/* Row 3 - 3 posters */}
                    <View style={styles.pyramidRow}>
                        {topTenMovies.slice(3, 6).map((movie, index) => (
                            <Image
                                key={movie._id.toString()}
                                source={{ uri: movie.Poster }}
                                style={styles.gridPoster}
                            />
                        ))}
                    </View>

                    {/* Row 4 - 4 posters */}
                    <View style={styles.pyramidRow}>
                        {topTenMovies.slice(6, 10).map((movie, index) => (
                            <Image
                                key={movie._id.toString()}
                                source={{ uri: movie.Poster }}
                                style={styles.gridPoster}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        marginTop: SCREEN_HEIGHT / 20,
        flex: 1,
        padding: 20,
    },
    profileImage: {
        width: PROFILE_PIC_DIMENSIONS,
        height: PROFILE_PIC_DIMENSIONS,
        borderRadius: PROFILE_PIC_DIMENSIONS / 2,
        marginRight: 15,
    },
    textContainer: {
        flexShrink: 1,
    },
    username: {
        fontSize: 28,
    },
    fullName: {
        fontSize: 20,
        fontWeight: "bold",
    },
    bio: {
        fontSize: 16,
        marginTop: 5,
    },
    favoriteMovieContainer: {
        marginTop: 30,
        alignItems: "center",
    },
    favoriteMoviePoster: {
        width: MAIN_POSTER_WIDTH,
        height: MAIN_POSTER_HEIGHT,
        borderRadius: 8,
        resizeMode: "cover",
        marginBottom: SCREEN_HEIGHT / 40,
    },
    gridContainer: {
        alignItems: "center",
        alignSelf: "center",  // centers entire grid horizontally
        paddingVertical: 5,
    },

    pyramidRow: {
        flexDirection: "row",
        justifyContent: "center", // centers posters horizontally
        marginBottom: SCREEN_HEIGHT / 80, // vertical spacing between rows
    },

    gridRow: {
        justifyContent: "center",  // 👈 centers each row horizontally
    },

    gridPoster: {
        width: GRID_POSTER_WIDTH,
        height: GRID_POSTER_HEIGHT,
        borderRadius: 6,
        marginHorizontal: SCREEN_WIDTH / 60,  // horizontal spacing
        marginBottom: SCREEN_HEIGHT / 80,     // smaller vertical gap
        resizeMode: "cover",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ProfileScreen;
