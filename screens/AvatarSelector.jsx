import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';

export default function AvatarSelector({ navigation }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [puntosUsuario, setPuntosUsuario] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;
  const db = getFirestore();

  let [fontsLoaded] = useFonts({
    Roboto: Roboto_400Regular,
  });

  const getPuntosUsuario = async () => {
    if (!userId) return 0;

    const resultadosCollection = collection(db, 'Resultados');
    const userResultsQuery = query(resultadosCollection, where('userId', '==', userId));

    try {
      const querySnapshot = await getDocs(userResultsQuery);
      let totalPuntos = 0;

      querySnapshot.forEach((doc) => {
        totalPuntos += doc.data().puntos;
      });

      return totalPuntos;
    } catch (error) {
      console.error('Error al obtener los puntos del usuario', error);
      return 0;
    }
  };

  useEffect(() => {
    const storage = getStorage();
    const avatarsRef = ref(storage, 'avatars');

    listAll(avatarsRef)
      .then(async (res) => {
        const urls = await Promise.all(
          res.items.map((itemRef) => {
            return getDownloadURL(itemRef);
          })
        );
        setAvatars(urls);
      })
      .catch((error) => {
        console.error("Error al cargar avatares: ", error);
      });

    getPuntosUsuario().then((puntos) => {
      setPuntosUsuario(puntos);
    });
  }, []);

  const handleSelectAvatar = async (avatarUrl, index) => {
    console.log('Seleccionando avatar...');

    if (!userId) {
      console.error('No hay un usuario autenticado');
      return;
    }

    const userDocRef = doc(db, 'users', userId);

    try {
      if (puntosUsuario >= 1000 || (index === 1 || index === 0)) {
        // Permitir la selección si tiene suficientes puntos o es uno de los primeros dos avatares
        await updateDoc(userDocRef, { avatar: avatarUrl });
        console.log('Avatar actualizado');
        setSelectedAvatar(index);
      } else {
        console.log('No tienes suficientes puntos para desbloquear este avatar.');
      }
    } catch (error) {
      console.error('Error al actualizar el avatar', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <LinearGradient colors={['#FFA500','#FFA500',  '#FFFFFF']} style={styles.container}>
        <Text style={styles.title}>Elige tu Avatar</Text>

        {/* Avatar seleccionado en grande */}
        <View style={styles.selectedAvatarContainer}>
          {selectedAvatar !== null && (
            <Image
              source={{ uri: avatars[selectedAvatar] }}
              style={styles.selectedAvatarLarge}
            />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Selecciona gratis</Text>
        </View>
        {/* Primer Container - Avatares 1 y 2 sin candado */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log('Seleccionando Avatar 1');
              setSelectedAvatar(1);
            }}
            style={[
              styles.avatar,
              selectedAvatar === 1 && styles.selectedAvatar,
            ]}
          >
            <Image source={{ uri: avatars[1] }} style={styles.avatar} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('Seleccionando Avatar 0');
              setSelectedAvatar(0);
            }}
            style={[
              styles.avatar,
              selectedAvatar === 0 && styles.selectedAvatar,
            ]}
          >
            <Image source={{ uri: avatars[0] }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
        <View style={styles.textContainer2}>
          <Text style={styles.text}>Selección disponible con +1000 puntos</Text>
        </View>
        {/* Segundo Container - Avatares 3, 4, 6 y 7 con candado hasta 1000 puntos */}
        <View style={styles.avatarContainer}>
          {avatars.slice(2, 6).map((avatar, index) => (
            <TouchableOpacity
              key={index + 2}
              onPress={() => {
                console.log(`Seleccionando Avatar ${index + 2}`);
                handleSelectAvatar(avatar, index + 2);
              }}
              style={[
                styles.avatar,
                selectedAvatar === index + 2 && styles.selectedAvatar,
              ]}
            >
              <Image source={{ uri: avatar }} style={styles.avatar} />
              {puntosUsuario < 1000 && (
                <Image source={require('../assets/splash/candado.png')} style={styles.lockIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.textContainer3}>
          <Text style={styles.text}>Selección disponible con +1800 puntos</Text>
        </View>
        {/* Tercer Container - Avatares 8, 9, 10, 11 y 12 con candado hasta 1800 puntos */}
        <View style={styles.avatarContainer}>
          {avatars.slice(6, 12).map((avatar, index) => (
            <TouchableOpacity
              key={index + 7}
              onPress={() => {
                console.log(`Seleccionando Avatar ${index + 7}`);
                handleSelectAvatar(avatar, index + 7);
              }}
              style={[
                styles.avatar,
                selectedAvatar === index + 7 && styles.selectedAvatar,
              ]}
            >
              <Image source={{ uri: avatar }} style={styles.avatar} />
              {puntosUsuario < 1800 && (
                <Image source={require('../assets/splash/candado.png')} style={styles.lockIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        {/* Botón para confirmar la selección */}
        <TouchableOpacity
          style={styles.chooseButton}
          onPress={async () => {
            if (selectedAvatar !== null) {
              console.log('Confirmación de selección de avatar...');
              await handleSelectAvatar(avatars[selectedAvatar], selectedAvatar);
              navigation.navigate('Menu');
            } else {
              console.log('No se ha seleccionado ningún avatar');
            }
          }}
        >
          <Text style={styles.chooseButtonText}>Elegir Avatar</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 35,
    color: 'white',
    fontFamily: 'Roboto',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  selectedAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedAvatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 25,
  },
  avatarContainer: {
    flexDirection: "row",
    justifyContent: "center", // Cambié "space-around" a "center" // Para que los avatares se envuelvan a la siguiente línea
    marginBottom: 10,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 10,
    margin:5
  },
  chooseButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 25,
  },
  chooseButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  lockIcon: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 5,
    left: 5,
  },
  selectedAvatar: {
    borderColor: 'green',
    borderWidth: 2,
  },
  textContainer:{
    backgroundColor:'white',
    borderRadius:10,
    alignItems:'center',
    padding: 5, // Ajusta este valor según sea necesario
    marginVertical: 5,
  },
  text:{
    fontFamily:'Roboto',
    fontSize:14,
    fontWeight:'bold'
  },
  textContainer2:{
    backgroundColor:'skyblue',
    borderRadius:10,
    alignItems:'center',
    padding: 5, // Ajusta este valor según sea necesario
    marginVertical: 5,
  },
  textContainer3:{
    backgroundColor:'greenyellow',
    borderRadius:10,
    alignItems:'center',
    padding: 5, // Ajusta este valor según sea necesario
    marginVertical: 5,
  },
});
