import { Tabs } from "expo-router";
import { View, type ColorValue } from "react-native";
import { font } from "../../src/theme";
import { usePalette } from "../../src/usePalette";

// A small rubric lozenge instead of an icon — closer to a printer's fleuron
// than to a glyph set, and it keeps the app free of an icon dependency.
function Mark({ focused, color }: { focused: boolean; color: ColorValue }) {
  return (
    <View
      style={{
        width: 6,
        height: 6,
        marginTop: 2,
        transform: [{ rotate: "45deg" }],
        backgroundColor: focused ? color : "transparent",
        borderWidth: 1,
        borderColor: color,
      }}
    />
  );
}

export default function TabLayout() {
  const c = usePalette();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.rubric,
        tabBarInactiveTintColor: c.ink3,
        tabBarStyle: {
          backgroundColor: c.panel,
          borderTopColor: c.rule,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: font.uiSemi,
          fontSize: 10,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => <Mark focused={focused} color={color} />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Read" }} />
      <Tabs.Screen name="bible" options={{ title: "Bible" }} />
      <Tabs.Screen name="watch" options={{ title: "Watch" }} />
      <Tabs.Screen name="kept" options={{ title: "Kept" }} />
      <Tabs.Screen name="about" options={{ title: "About" }} />
    </Tabs>
  );
}
