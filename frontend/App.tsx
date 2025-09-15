import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import ProfileScreen from "./components/Profile";

const Tab = createBottomTabNavigator();

function AddReviewScreen() {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 20 }}>Movies will appear here</Text>
        </View>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                headerShown: false,
                tabBarLabelStyle: { fontSize: 14 },
                tabBarStyle: { height: 60 },
                }}
            >
                <Tab.Screen
                name="Movies"
                component={AddReviewScreen}
                options={{
                    tabBarLabel: "Movies",
                    tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎬</Text>, // 👈 replaces arrow
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
    );
}
