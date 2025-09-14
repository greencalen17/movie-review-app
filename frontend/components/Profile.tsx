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

interface User {
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
const GRID_POSTER_WIDTH = SCREEN_WIDTH / 7.5;
const GRID_POSTER_HEIGHT = SCREEN_WIDTH / 5;

function ProfileScreen() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [topTenMovies, setTopTenMovies] = useState<Array<any>>([]);

    const email = "greencalen3@gmail.com"; // hardcoded for now

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userResponse = await fetch(
                    `http://localhost:5000/users/getUserByEmail/${email}`
                );
                if (!userResponse.ok) throw new Error("User not found");
                const userData = await userResponse.json();
                console.log("Fetched user:", userData);
                setUser(userData);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchFavMovie = async () => {
            try {
                if (!user?.favorite_movies) return;
                setLoading(true);
                let favMovies = [];
                for (const movieId of user.favorite_movies) {
                    const favMovieResponse = await fetch(
                        `http://localhost:5000/movies/getMovieById/${movieId}`
                    );
                    if (!favMovieResponse.ok)
                        throw new Error("Fav movie not found");
                    const favMovieData = await favMovieResponse.json();
                    console.log("Fetched fav movie:", favMovieData);
                    favMovies.push(favMovieData);
                }
                setTopTenMovies(favMovies);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavMovie();
    }, [user]);

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

    const renderGridItem = ({ item }: { item: any }) => (
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
                    {/* Main Favorite Poster */}
                    {topTenMovies[0].Poster && (
                        <Image
                            source={{ uri: topTenMovies[0].Poster }}
                            style={styles.favoriteMoviePoster}
                        />
                    )}

                    {/* Grid of Remaining Movies */}
                    <FlatList
                        data={topTenMovies.slice(1)} // skip first movie
                        renderItem={renderGridItem}
                        keyExtractor={(item, index) =>
                            item._id?.$oid ?? index.toString()
                        }
                        numColumns={3}
                        scrollEnabled={false} // prevents nested scrolling
                        contentContainerStyle={styles.gridContainer}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        marginBottom: 15,
    },
    gridContainer: {
        gap: SCREEN_HEIGHT / 25, // ✅ spacing between grid items (RN 0.71+)
        justifyContent: "center",
    },
    gridPoster: {
        width: GRID_POSTER_WIDTH,
        height: GRID_POSTER_HEIGHT,
        borderRadius: 6,
        margin: 5,
        resizeMode: "cover",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ProfileScreen;
