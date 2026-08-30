import { Icon, IconName } from "@presentation/components/ui/Icon";
import { colors } from "@presentation/theme/colors";
import { fontFamily } from "@presentation/theme/typography";
import { Tabs } from "expo-router";
import React from "react";
import { ColorValue, Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 30,
          height: 66,
          borderRadius: 22,
          backgroundColor: colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 0,
        },
        tabBarItemStyle: { paddingTop: 5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon color={color} name="home" />,
          tabBarLabel: ({ color }) => <TabLabel color={color} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => <TabIcon color={color} name="calendar" />,
          tabBarLabel: ({ color }) => <TabLabel color={color} label="Histórico" />,
        }}
      />
      <Tabs.Screen
        name="imc"
        options={{
          title: "IMC",
          tabBarIcon: ({ color }) => <TabIcon color={color} name="trending-up" />,
          tabBarLabel: ({ color }) => <TabLabel color={color} label="IMC" />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ color, name }: { color: ColorValue; name: IconName }) {
  return <Icon name={name} size={20} color={color as string} strokeWidth={2} />;
}

function TabLabel({ color, label }: { color: ColorValue; label: string }) {
  return (
    <Text style={{ fontFamily: fontFamily.semiBold, fontSize: 10, color, marginTop: 5 }}>
      {label}
    </Text>
  );
}
