import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProfileScreen from "./pages/Profile";
import MoviesScreen from "./pages/Movies";

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarLabelStyle: { fontSize: 14 },
                        tabBarStyle: {
                            height: Platform.OS === "ios" ? 80 : 70, // ✅ give more space instead of cutting off
                            paddingBottom: Platform.OS === "ios" ? 20 : 10, // ✅ ensures icons/text aren't clipped
                        },
                    }}
                >
                    <Tab.Screen
                        name="Movies"
                        component={MoviesScreen}
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
        </SafeAreaProvider>
    );
}
