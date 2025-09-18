import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking,
    Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Play } from "lucide-react-native";
import Slider from "@react-native-community/slider"; // <-- Add this import
import { Movie } from "pages/Movies";

const BASE_URL = "http://192.168.1.168:5000";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const getRatingEmoji = (rating: number) => {
    if (rating < 1.5) return "🤮"; // Throw up face
    else if (rating < 3) return "😫"; // Agony face
    else if (rating < 4.5) return "😴"; // Snooze face
    else if (rating < 6) return "😐"; // Straight face
    else if (rating < 7.5) return "🙂"; // Slight smile
    else if (rating < 9) return "😁"; // Big smile
    else return "🤩"; // Star eyes
};

function MovieDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { movieId } = route.params as { movieId: string };

    const [loading, setLoading] = useState(true);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [rating, setRating] = useState<number>(5); // Default rating at 5

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/movies/getMovieById/${movieId}`);
                if (!response.ok) throw new Error("Failed to fetch movie");
                const data = await response.json();
                setMovie(data);
            } catch (err) {
                console.error("Error fetching movie:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [movieId]);

    const openTrailer = () => {
        if (movie?.Trailer) {
            Linking.openURL(movie.Trailer);
        } else {
            console.warn("No trailer available for this movie");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={styles.center}>
                <Text>Movie not found 😢</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <ArrowLeft size={28} color="black" />
            </TouchableOpacity>

            {/* Banner with Play Button */}
            {movie.Banner && movie.Trailer && (
                <TouchableOpacity onPress={openTrailer} activeOpacity={0.8}>
                    <View style={styles.bannerContainer}>
                        <Image source={{ uri: movie.Banner }} style={styles.banner} />
                        <View style={styles.playOverlay}>
                            <Play size={64} color="white" strokeWidth={1.5} />
                        </View>
                    </View>
                </TouchableOpacity>
            )}
            {movie.Banner && !movie.Trailer && (
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: movie.Banner }} style={styles.banner} />
                </View>
            )}
            {!movie.Banner && movie.Trailer && (
                <TouchableOpacity onPress={openTrailer} activeOpacity={0.8}>
                    <View style={styles.playOverlay}>
                        <Play size={64} color="white" strokeWidth={1.5} />
                    </View>
                </TouchableOpacity>
            )}
            {/* Rating Section */}
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>
                    {rating.toFixed(1)}/10 {getRatingEmoji(rating)}
                </Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={10}
                    step={0.1}
                    value={rating}
                    onValueChange={(val) => setRating(val)}
                    minimumTrackTintColor="#6200EE"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#6200EE"
                />
            </View>
            {/* Info */}
            <Text style={styles.title}>{movie.Title}</Text>
            <Text style={styles.subtitle}>{movie.Year} • {movie.Runtime} mins</Text>
            <Text style={styles.plot}>{movie.Plot}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: SCREEN_HEIGHT / 20,
        flex: 1,
        padding: 16,
    },
    backButton: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 5,
        elevation: 3,
    },
    bannerContainer: {
        width: "100%",
        position: "relative",
        marginBottom: 16,
    },
    banner: {
        width: "100%",
        height: 400,
        borderRadius: 12,
        resizeMode: "cover",
    },
    playOverlay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -32 }, { translateY: -32 }],
        backgroundColor: "rgba(0,0,0,0.4)",
        borderRadius: 50,
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "gray",
        marginBottom: 12,
    },
    plot: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 20,
    },
    ratingContainer: {
        
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        textAlign: "center",
    },
    slider: {
        width: "100%",
        height: 40,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default MovieDetailsScreen;
