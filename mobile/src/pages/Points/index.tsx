import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather as Icon } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import MapView, { Marker } from "react-native-maps";
import styles from "./styles";
import api from "./../../services/api";
import * as Location from "expo-location";

import Item from "./../../models/Item";
import Point from "./../../models/Point";

interface Params {
  uf: string;
  city: string;
}

const Points = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as Params;
  const [items, setItems] = useState<Array<Item>>([]);
  const [points, setPoints] = useState<Array<Point>>([]);
  const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const handleNavigateBack = () => {
    navigation.goBack();
  };

  const handleNavigateToDetail = (point: Point) => {
    navigation.navigate("Detail", point);
  };

  const handleSelectItem = (item: Item) => {
    const alreadySelected = selectedItems.findIndex((i) => i === item.id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((i) => i !== item.id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, item.id]);
    }
  };

  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Ops...",
          "Precisamos de sua permissão para obter a localização"
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      setInitialPosition([location.coords.latitude, location.coords.longitude]);
    }
    loadPosition();
  }, []);

  useEffect(() => {
    api
      .get("points", {
        params: {
          city: routeParams.city,
          uf: routeParams.uf,
          items: selectedItems,
        },
      })
      .then((response) => {
        setPoints(response.data);
      });
  }, [selectedItems]);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="log-out" size={20} color="#34cb79" />
        </TouchableOpacity>
        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>
          encontre no mapa um ponto de coleta.
        </Text>
        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              loadingEnabled={initialPosition[0] == 0}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.004,
                longitudeDelta: 0.004,
              }}
            >
              {points.map((point) => (
                <Marker
                  key={String(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(point)}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image
                      style={styles.mapMarkerImage}
                      source={{
                        uri: point.image,
                      }}
                    />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 30 }}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={String(item.id)}
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {},
              ]}
              activeOpacity={0.6}
              onPress={() => {
                handleSelectItem(item);
              }}
            >
              <SvgUri width={42} height={42} uri={item.image} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default Points;
