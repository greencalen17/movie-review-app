import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { useUser } from "context/UserContext";
import { useMovieCache } from "context/MovieCacheContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "App";
import { ObjectId } from "bson";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const GRID_POSTER_WIDTH = SCREEN_WIDTH / 5;
const GRID_POSTER_HEIGHT = SCREEN_WIDTH / 3.3;

export interface TMDbMovie { 
    id: number; 
    title: string; 
    overview?: string; 
    release_date?: string; 
    genres?: { id: number; name: string }[]; 
    vote_average?: number; vote_count?: number; 
    credits?: { cast: any[]; crew: any[] }; 
    images?: { posters: any[]; backdrops: any[] }; 
    [key: string]: any; 
} 
    
export interface Movie { 
    _id: ObjectId; 
    id: number; // TMDb movie ID 
    title: string;
    tagline: string; 
    overview?: string; 
    release_date?: string; 
    genres?: { id: number; name: string }[]; 
    vote_average?: number; 
    vote_count?: number; 
    credits?: { cast: any[]; crew: any[] }; 
    images?: { posters: any[]; backdrops: any[] }; 
    [key: string]: any; 
    runtime: number; 
    backdrop_path?: string; 
    poster_path?: string; 
    status: string; 
    homepage: string; 
    Genre: Array<string>; 
    Language: string; 
    Country: Array<string>; 
    imdbRating: number; 
    imdb_id?: string; 
    Type: string; 
    Cast: Array<string>; 
    Trailer?: string; 
}

export type MoviesScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Movies"
>;

export default function MoviesScreen() {
    const { user } = useUser();
    const { cachedMovies, setCachedMovies, scrollOffset, setScrollOffset } = useMovieCache();

    const [allMovies, setAllMovies] = useState<Movie[]>(cachedMovies || []);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const navigation = useNavigation<MoviesScreenNavigationProp>();
    const flatListRef = useRef<FlatList<Movie>>(null);
    const BASE_URL = "https://ginglymoid-nguyet-autumnally.ngrok-free.dev";

    // Step 1: Restore cached movies first
    useEffect(() => {
        if (cachedMovies.length > 0) {
            console.log(`Restoring ${cachedMovies.length} cached movies...`);
            setAllMovies(cachedMovies);
            setPage(Math.ceil(cachedMovies.length / 48) + 1);
        } else {
            fetchMovies(1);
        }
    }, []);

    // Step 2: Restore scroll AFTER movies are loaded
    useEffect(() => {
        if (cachedMovies.length > 0 && flatListRef.current && scrollOffset > 0) {
            setTimeout(() => {
                console.log("Restoring scroll offset:", scrollOffset);
                flatListRef.current?.scrollToOffset({ offset: scrollOffset, animated: false });
            }, 300);
        }
    }, [cachedMovies]);

    // Step 3: Keep cache updated
    useEffect(() => {
        setCachedMovies(allMovies);
    }, [allMovies]);

    const fetchMovies = async (pageNum: number) => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const url = `${BASE_URL}/movies/all-movies?page=${pageNum}&limit=48`;
            console.log("Fetching:", url);
            const res = await fetch(url);
            const moviesData: Movie[] = await res.json();

            if (moviesData.length === 0) {
                setHasMore(false);
                return;
            }

            setAllMovies((prev) => [...prev, ...moviesData]);
            setPage((prev) => prev + 1);

            if (moviesData.length < 48) {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const renderGridItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity
        onPress={() => {
            if (!user) return;
            navigation.navigate("MovieDetails", {
            movieId: item._id.toString(),
            user: user,
            });
        }}
        >
        <Image
            source={{
                uri: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : "https://www.shutterstock.com/image-vector/missing-picture-page-website-design-600nw-1552421075.jpg",
            }}
            style={styles.gridPoster}
        />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
        <Text style={styles.title}>All Movies</Text>
        <FlatList
            ref={flatListRef}
            data={allMovies}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.imdb_id || item.id.toString()}
            numColumns={4}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            setScrollOffset(offsetY);
            }}
            onEndReached={() => {
            if (!loading && hasMore) fetchMovies(page);
            }}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
            loading ? <ActivityIndicator size="small" style={{ margin: 20 }} /> : null
            }
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
    title: { fontSize: 28 },
    gridContainer: { alignItems: "center", paddingVertical: 5 },
    gridRow: { justifyContent: "center" },
    gridPoster: {
        width: GRID_POSTER_WIDTH,
        height: GRID_POSTER_HEIGHT,
        borderRadius: 6,
        marginHorizontal: SCREEN_WIDTH / 90,
        marginBottom: SCREEN_HEIGHT / 90,
        resizeMode: "cover",
    },
});