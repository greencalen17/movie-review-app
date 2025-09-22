import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
} from "react-native";
import { ObjectId } from "bson";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "App";
import { User } from "./Profile";
import { useUser } from "context/UserContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ✅ Poster sizing
const GRID_POSTER_WIDTH = SCREEN_WIDTH / 5; // make posters smaller to fit 4 per row
const GRID_POSTER_HEIGHT = SCREEN_WIDTH / 3.3; // keep aspect ratio similar

export interface Movie {
    _id: ObjectId
    Title: string,
    Year: string,
    Rated: string,
    Released: Date,
    Runtime: number,
    Genre: Array<string>,
    Director: string,
    Writer: string,
    Plot: string,
    Language: string,
    Country: Array<string>,
    Poster: string,
    imdbRating: number,
    imdbID: string,
    Type: string,
    Cast: Array<string>,
    Banner?: string,
    Trailer?: string,
}

type MoviesScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Movies"
>;

function MoviesScreen() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [allMovies, SetAllMovies] = useState<Array<Movie>>([]);

    const navigation = useNavigation<MoviesScreenNavigationProp>();
    const BASE_URL = "http://192.168.1.168:5000"; // replace with your local IP

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const moviesResponse = await fetch(`${BASE_URL}/movies/all-movies`);
                if (!moviesResponse.ok) throw new Error("Movies not found");
                const moviesData = await moviesResponse.json();
                SetAllMovies(moviesData);
            } catch (err) {
                console.error(err);
                console.log("Failed to fetch movies");
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!allMovies) {
        return (
            <View style={styles.center}>
                <Text>Movies not found 😢</Text>
            </View>
        );
    }

    const renderGridItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity
            onPress={() => {
                if (!user) {
                    console.warn("No user available yet");
                    return;
                }
                navigation.navigate("MovieDetails", {
                    movieId: item._id.toString(),
                    user: user,
                });
            }} // pass userId here
            >
            <Image source={{ uri: item.Poster }} style={styles.gridPoster} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>All Movies</Text>
            <FlatList
                data={allMovies}
                renderItem={renderGridItem}
                keyExtractor={(item) => item._id.toString()} // ✅ use _id as key
                numColumns={4}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.gridRow}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        marginTop: SCREEN_HEIGHT / 20,
        flex: 1,
        padding: 20,
    },
    textContainer: {
        flexShrink: 1,
    },
    title: {
        fontSize: 28,
    },
    gridContainer: {
        alignItems: "center",
        alignSelf: "center",  // centers entire grid horizontally
        paddingVertical: 5,
    },
    gridRow: {
        justifyContent: "center",  // 👈 centers each row horizontally
    },
    gridPoster: {
        width: GRID_POSTER_WIDTH,
        height: GRID_POSTER_HEIGHT,
        borderRadius: 6,
        marginHorizontal: SCREEN_WIDTH / 90, // slightly smaller horizontal gap
        marginBottom: SCREEN_HEIGHT / 90,    // slightly smaller vertical gap
        resizeMode: "cover",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default MoviesScreen;
