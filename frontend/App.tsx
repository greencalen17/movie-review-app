import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProfileScreen, { User } from "./pages/Profile";
import MoviesScreen from "./pages/Movies";
import { UserProvider } from "./context/UserContext";
import MovieDetailsScreen from "./components/movie-details";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Movies: {user: User};
    MovieDetails: { movieId: string, user: User};
};

function MoviesStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Movies" component={MoviesScreen} />
            <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <UserProvider>
            <NavigationContainer>
                <Tab.Navigator
                    initialRouteName= "MoviesTab"// set initial route to Movies
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
                        component={MoviesStack} // ✅ use stack here
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