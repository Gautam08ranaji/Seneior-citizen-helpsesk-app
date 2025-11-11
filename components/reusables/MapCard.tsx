import Card from '@/components/reusables/card'; // your existing Card
import { useAppTheme } from "@/theme/ThemeContext"; // ✅ added theme hook
import { Typography } from '@/theme/Typography';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const LiveVehicleCard = () => {
    const { theme } = useAppTheme(); // ✅ access theme

    const initialRegion = {
        latitude: 28.6271,   // Example: Noida coordinates
        longitude: 77.3649,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <Card
            style={[
                styles.card,
                { backgroundColor: theme.background.section, borderColor: theme.button.primary.bg },
            ]}
        >
            {/* Header Section */}
            <View style={styles.header}>
                <Text
                    style={[
                        Typography.headingH2Bold,
                        styles.title,
                        { color: theme.button.primary.bg },
                    ]}
                >
                    Live Vehicle
                </Text>
                <TouchableOpacity
                    style={[
                        styles.expandBtn,
                        { borderColor: theme.button.primary.bg },
                    ]}
                >
                    <Text
                        style={[
                            Typography.bodySmallRegular,
                            styles.expandText,
                            { color: theme.button.primary.bg },
                        ]}
                    >
                        Expand Map View
                    </Text>
                    <MaterialIcons name="arrow-outward" size={20} color={theme.button.primary.bg} />
                </TouchableOpacity>
            </View>

            {/* Map Preview */}
            <View style={styles.mapWrapper}>
                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    provider="google"
                >
                    <Marker coordinate={{ latitude: 28.6271, longitude: 77.3649 }}>
                        <View
                            style={[
                                styles.marker,
                                { borderColor: theme.background.section },
                            ]}
                        >
                            <Image
                                source={require('../../assets/images/LoginMaleMarker1.png')}
                                style={styles.markerImage}
                                resizeMode="cover"
                            />
                        </View>
                    </Marker>
                </MapView>
            </View>
        </Card>
    );
};

export default LiveVehicleCard;

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#EFF3F6",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        padding: 10,
    },
    title: {
        color: '#293160',
    },
    expandBtn: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "#293160",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        left: 20,
    },
    expandText: {
        color: "#293160",
    },
    mapWrapper: {
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    marker: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'hidden',
    },
    markerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});
