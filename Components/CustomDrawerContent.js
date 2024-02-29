import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Foundation } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { Ionicons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomDrawerContent(props) {
  const [avatarUri, setAvatarUri] = useState(null);
  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // Escuchar en tiempo real los cambios en el documento del usuario
      const unsubscribe = onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          if (userData.avatar) {
            setAvatarUri({ uri: userData.avatar });
          }
        }
      });

      // Desuscribirse al desmontar el componente
      return () => unsubscribe();
    }
  }, [user]);

  const [fontsLoaded] = useFonts({
    Roboto: Roboto_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#696969', '#000000']} // Naranja, Morado, Azul, Verde
        style={styles.header}
      >
        <View style={styles.imageContainer}>
          <Image source={avatarUri} style={styles.image} />
        </View>
        {user && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>{user.email}</Text>
          </View>
        )}
      </LinearGradient>

      <DrawerItem
        icon={({ color, size }) => <FontAwesome name="user-o" size={size} color={color} />}
        label="Perfil"
        onPress={() => props.navigation.navigate('Perfil')}
        activeTintColor="#FFA500"
      />
      <DrawerItem
        icon={({ color, size }) => <Foundation name="results" size={size} color={color} />}
        label="Resultados"
        onPress={() => props.navigation.navigate('Estadisticas')}
        activeTintColor="#FFA500"
      />
      <DrawerItem
        icon={({ color, size }) => <MaterialIcons name="storefront" size={size} color={color} />}
        label="Tienda"
        onPress={() => props.navigation.navigate('Avatar')}
        activeTintColor="#FFA500"
      />
      <DrawerItem
        icon={({ color, size }) => <Ionicons name="book-sharp" size={size} color={color} />}
        label="Diario"
        onPress={() => props.navigation.navigate('Diario')}
        activeTintColor="#FFA500"
      />
      <DrawerItem
        icon={({ color, size }) => <FontAwesome name="sign-out" color={color} size={size} />}
        label="Cerrar sesión"
        onPress={() => props.navigation.navigate('Login')}
        activeTintColor="#FFA500"
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#000', // Fondo negro
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  userInfoText: {
    color: 'white',
    fontFamily: 'Roboto',
  },
});
