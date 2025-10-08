import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProfileScreen, { User } from "./pages/Profile";
import MoviesScreen from "./pages/Movies";
import { UserProvider } from "./context/UserContext";
import { MovieCacheProvider } from "./context/MovieCacheContext"; // ✅ import provider
import MovieDetailsScreen from "./components/movie-details";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Movies: { user: User };
    MovieDetails: { movieId: string; user: User };
};

// ✅ Wrap your movie stack with the provider
function MoviesStack() {
    return (
        <MovieCacheProvider>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Movies" component={MoviesScreen} />
                <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
            </Stack.Navigator>
        </MovieCacheProvider>
    );
}

export default function App() {
    return (
        <UserProvider>
            <NavigationContainer>
                <Tab.Navigator
                    initialRouteName="MoviesTab"
                    screenOptions={{
                        headerShown: false,
                        tabBarLabelStyle: { fontSize: 14 },
                        tabBarStyle: {
                            height: Platform.OS === "ios" ? 80 : 70,
                            paddingBottom: Platform.OS === "ios" ? 20 : 10,
                        },
                    }}
                >
                    <Tab.Screen
                        name="MoviesTab"
                        component={MoviesStack} // ✅ MoviesStack now wrapped in provider
                        options={{
                            tabBarLabel: "Movies",
                            tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎬</Text>,
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarLabel: "Profile",
                            tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </UserProvider>
    );
}