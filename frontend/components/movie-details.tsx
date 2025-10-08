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
    Vibration
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Play, Star, StarHalf, StarOff } from "lucide-react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Slider from "@react-native-community/slider"; // <-- Add this import
import { Movie } from "pages/Movies";
import { useUser } from "context/UserContext";

const BASE_URL = "https://ginglymoid-nguyet-autumnally.ngrok-free.dev";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const getRatingStars = ({ rating }: { rating: number }) => {
    const starsOutOfFive = rating / 2;
    const fullStars = Math.floor(starsOutOfFive);
    const halfStar = starsOutOfFive % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
        <View style={{ flexDirection: "row" }}>
        {[...Array(fullStars)].map((_, i) => (
            <Icon key={`full-${i}`} name="star" size={24} color="gold" />
        ))}
        {halfStar === 1 && (
            <Icon key="half" name="star-half" size={24} color="gold" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
            <Icon key={`empty-${i}`} name="star-border" size={24} color="gold" />
        ))}
        </View>
    );
};

function MovieDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, loading } = useUser();
    const { movieId } = route.params as { movieId: string; };

    if (loading) return <ActivityIndicator />;
    if (!user) return <Text>No user available 😢</Text>;

    const [movie, setMovie] = useState<Movie | null>(null);
    const [rating, setRating] = useState<number>(-1); // Default rating at 5

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await fetch(`${BASE_URL}/movies/getMovieById/${movieId}`);
                if (!response.ok) throw new Error("Failed to fetch movie");
                const data = await response.json();
                setMovie(data);
            } catch (err) {
                console.error("Error fetching movie:", err);
            } finally {

            }
        };

        fetchMovie();

        const fetchUserRating = async () => {
            try {
                const response = await fetch(`${BASE_URL}/reviews/getUserMovieRating/${movieId}/${user._id}`);
                if (!response.ok) throw new Error("Failed to get user rating");
                const data = await response.json();
                if (data.rating !== undefined && data.rating >= 0) {
                    setRating(data.rating);
                }
            } catch (err) {
                console.error("Error fetching user rating", err);
            } finally {
                
            }
        };

        fetchUserRating();
    }, [movieId]);

    const addRating = async () => {
            try {
                const response = await fetch(`${BASE_URL}/reviews/add-review`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user: user._id,
                        movie: movieId,
                        rating,
                        comment: ""
                    })
                });
                if (!response.ok) throw new Error("Failed to review");
                const data = await response.json();
            } catch (err) {
                console.error("Error adding review:", err);
            } finally {
                
            }
        };

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
            {movie.backdrop_path && movie.Trailer && (
                <TouchableOpacity onPress={openTrailer} activeOpacity={0.8}>
                    <View style={styles.bannerContainer}>
                        <Image source={{ uri: "https://image.tmdb.org/t/p/w780" + movie.backdrop_path }} style={styles.banner} />
                        <View style={styles.playOverlay}>
                            <Play size={64} color="white" strokeWidth={1.5} />
                        </View>
                    </View>
                </TouchableOpacity>
            )}
            {movie.backdrop_path && !movie.Trailer && (
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: "https://image.tmdb.org/t/p/w780" + movie.backdrop_path }} style={styles.banner} />
                </View>
            )}
            {!movie.backdrop_path && movie.Trailer && (
                <TouchableOpacity onPress={openTrailer} activeOpacity={0.8}>
                    <View style={styles.playOverlay}>
                        <Play size={64} color="white" strokeWidth={1.5} />
                    </View>
                </TouchableOpacity>
            )}
            {/* Rating Section */}
            {rating >= 0 && (
                <View>
                    <Text style={styles.ratingLabel}>
                        {rating.toFixed(1)}/10
                    </Text>
                    <View style={styles.ratingStars}>
                        {getRatingStars({ rating })}
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={10}
                        step={0.1}
                        value={rating}
                        onValueChange={(val) => setRating(val)}  // just update UI as user drags
                        onSlidingComplete={async (val) => {
                            const rounded = Math.round(val * 10) / 10; // keep 1 decimal
                            setRating(rounded);
                            Vibration.vibrate(5); 
                            await addRating();
                        }}
                        minimumTrackTintColor="#6200EE"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#6200EE"
                    />
                </View>
            )}
            {rating == -1 && (
                <View>
                    <Text style={styles.ratingLabel}>
                        Rate Now ↓
                    </Text>
                    <View style={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                        <Icon key={`empty-${i}`} name="star-border" size={24} color="gold" />
                    ))}
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={10}
                        step={0.1}
                        value={rating}
                        onValueChange={(val) => setRating(val)}  // just update UI as user drags
                        onSlidingComplete={async (val) => {
                            const rounded = Math.round(val * 10) / 10;
                            setRating(rounded);
                            Vibration.vibrate(5); // vibrate for 5ms
                            await addRating();
                        }}
                        minimumTrackTintColor="#9e9e9eff"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#4b4b4bff"
                    />
                </View>
            )}
            {/* Info */}
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.subtitle}>{movie.release_date} • {movie.runtime} mins</Text>
            <Text style={styles.plot}>{movie.overview}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
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
        height: SCREEN_HEIGHT / 3,
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
    ratingLabel: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    ratingStars: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 1,
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
