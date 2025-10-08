import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    Image,
    Dimensions,
    FlatList,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { ObjectId } from "bson";
import { Movie, MoviesScreenNavigationProp } from "./Movies";
import { useUser } from "context/UserContext";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const [currentUser, setCurrentUser] = useState<User | null>(user);
    const [topTenMovies, setTopTenMovies] = useState<Array<Movie>>([]);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigation = useNavigation<MoviesScreenNavigationProp>();

    const handleSignup = async () => {
        try {
            const response = await fetch(`${BASE_URL}/users/createUser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    username,
                    password,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Signup failed");

            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            setCurrentUser(data.user);
        } catch (err) {
            console.error("Signup error:", err);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await fetch(`${BASE_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Login failed");

            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            setCurrentUser(data.user);
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    const handleSignOut = async () => {
        await AsyncStorage.removeItem("user");
        setCurrentUser(null);
    };

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
                <Text style={styles.header}>Login / Signup</Text>
                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    placeholder="First Name (for signup)"
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <TextInput
                    placeholder="Last Name (for signup)"
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                />
                <TextInput
                    placeholder="Username (for signup)"
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    placeholder="Password"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonSecondary} onPress={handleSignup}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const BASE_URL = "https://ginglymoid-nguyet-autumnally.ngrok-free.dev"; // replace with your local IP

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

    return (
        <View style={styles.container}>
            {/* Sign Out Button */}
            <View style={{ marginTop: 20, alignItems: "center" }}>
                <TouchableOpacity
                    style={[styles.buttonSecondary, { backgroundColor: "#d9534f" }]}
                    onPress={handleSignOut}
                >
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

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
                        <TouchableOpacity
                                    onPress={() => {
                                        if (!user) {
                                            console.warn("No user available yet");
                                            return;
                                        }
                                        navigation.navigate("MovieDetails", {
                                            movieId: topTenMovies[0]._id.toString(),
                                            user: user,
                                        });
                                    }} // pass userId here
                                    >
                            <Image
                                source={{ uri: topTenMovies[0].Poster }}
                                style={styles.favoriteMoviePoster}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Row 2 - 2 posters */}
                    <View style={styles.pyramidRow}>
                        {topTenMovies.slice(1, 3).map((movie, index) => (
                            <TouchableOpacity
                                    onPress={() => {
                                        if (!user) {
                                            console.warn("No user available yet");
                                            return;
                                        }
                                        navigation.navigate("MovieDetails", {
                                            movieId: movie._id.toString(),
                                            user: user,
                                        });
                                    }} // pass userId here
                                    >
                                <Image
                                    // key={movie._id.toString()}
                                    source={{ uri: movie.Poster }}
                                    style={styles.gridPoster}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 3 - 3 posters */}
                    <View style={styles.pyramidRow}>
                        {topTenMovies.slice(3, 6).map((movie, index) => (
                            <TouchableOpacity
                                    onPress={() => {
                                        if (!user) {
                                            console.warn("No user available yet");
                                            return;
                                        }
                                        navigation.navigate("MovieDetails", {
                                            movieId: movie._id.toString(),
                                            user: user,
                                        });
                                    }} // pass userId here
                                    >
                                <Image
                                    // key={movie._id.toString()}
                                    source={{ uri: movie.Poster }}
                                    style={styles.gridPoster}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 4 - 4 posters */}
                    <View style={styles.pyramidRow}>
                        {topTenMovies.slice(6, 10).map((movie, index) => (
                            <TouchableOpacity
                                    onPress={() => {
                                        if (!user) {
                                            console.warn("No user available yet");
                                            return;
                                        }
                                        navigation.navigate("MovieDetails", {
                                            movieId: movie._id.toString(),
                                            user: user,
                                        });
                                    }} // pass userId here
                                    >
                                <Image
                                    // key={movie._id.toString()}
                                    source={{ uri: movie.Poster }}
                                    style={styles.gridPoster}
                                />
                            </TouchableOpacity>
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
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginVertical: 8,
        borderRadius: 8,
        width: "80%",
    },
    button: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 8,
        marginVertical: 6,
        width: "80%",
        alignItems: "center",
    },
    buttonSecondary: {
        backgroundColor: "#6c757d",
        padding: 12,
        borderRadius: 8,
        marginVertical: 6,
        width: "80%",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    header: {
        fontSize: 22,
        marginBottom: 20,
    },
});

export default ProfileScreen;
