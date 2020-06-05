import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
  Linking
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather as Icon, FontAwesome } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";
import styles from "./styles";
import Point from "../../models/Point";
import api from "../../services/api";
import { AppLoading } from "expo";
import * as MailComposer from "expo-mail-composer";

interface Data {
  point: Point;
  items: {
    title: string;
  }[];
}

const Detail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [data, setData] = useState<Data>({} as Data);
  const routeParams = route.params as Point;

  const handleNavigateBack = () => {
    navigation.goBack();
  };

  const handleMailComposer = () => {
    MailComposer.composeAsync({
      subject: "Interesse na coleta de resíduos",
      recipients: [data.point.email],
    });
  };

  const handleWhatsapp = () => {
    Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Tenho interesse sobre coleta de resíduos`)
  };

  useEffect(() => {
    api.get(`/points/${routeParams.id}`).then((response) => {
      setData(response.data);
    });
  }, []);

  if (!data.point) {
    return AppLoading;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>
        <Image
          style={styles.pointImage}
          source={{
            uri: data.point.image,
          }}
        />
        <Text style={styles.pointName}>{data.point.name}</Text>
        <Text style={styles.pointImage}>
          {data.items.map((item) => item.title).join(", ")}
        </Text>
        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>
            {data.point.city}, {data.point.uf}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsapp}>
          <FontAwesome name="whatsapp" size={20} color="#fff" />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleMailComposer}>
          <Icon name="mail" size={20} color="#fff" />
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
};

export default Detail;
