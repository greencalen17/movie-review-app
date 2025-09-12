import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image, Dimensions } from "react-native";
import { ObjectId } from "bson";

interface User {
    active_status: boolean;
    bio: string;
    created_at: Date;
    email: string;
    favorite_movie: ObjectId;
    first_name: string;
    last_name: string;
    phone: string;
    profile_pic: string;
    role: string;
    username: string;
    _id: ObjectId;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window"); // ✅ Get screen width
const PROFILE_PIC_DIMENSIONS = SCREEN_HEIGHT * 0.1; // proportional profile pic
const POSTER_WIDTH = SCREEN_WIDTH / 6; // 
const POSTER_HEIGHT = SCREEN_WIDTH / 4; // typical movie poster ratio (2:3)

function ProfileScreen() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [favoriteMovie, setFavoriteMovie] = useState<any>(null);

    const email = "greencalen3@gmail.com"; // hardcoded for now

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userResponse = await fetch(`http://localhost:5000/users/getUserByEmail/${email}`);
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
                if (!user?.favorite_movie) return;
                setLoading(true);
                const favMovieResponse = await fetch(
                    `http://localhost:5000/movies/getMovieById/${user.favorite_movie}`
                );
                if (!favMovieResponse.ok) throw new Error("Fav movie not found");
                const favMovieData = await favMovieResponse.json();
                console.log("Fetched fav movie:", favMovieData);
                setFavoriteMovie(favMovieData);
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

    return (
        <View style={styles.container}>
            {/* Profile Picture & Info */}
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                {user.profile_pic && (
                    <Image source={{ uri: user.profile_pic }} style={styles.profileImage} />
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
            {favoriteMovie && (
                <View style={styles.favoriteMovieContainer}>
                    <Text style={styles.favoriteMovieTitle}>Favorite Films</Text>
                    {favoriteMovie.Poster && (
                        <Image source={{ uri: favoriteMovie.Poster }} style={styles.favoriteMoviePoster} />
                    )}
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
        alignItems: "center", // ✅ centers content horizontally
    },
    favoriteMovieTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    favoriteMoviePoster: {
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        borderRadius: POSTER_WIDTH * 0.05,
        resizeMode: "cover",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ProfileScreen;
