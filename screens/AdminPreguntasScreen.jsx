import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { getFirestore, collection, query, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AdminPreguntasScreen = () => {
  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
  });

  const [preguntas, setPreguntas] = useState([]);
  const firestore = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(collection(firestore, 'preguntas'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const preguntasArray = [];
      querySnapshot.forEach((doc) => {
        preguntasArray.push({ ...doc.data(), id: doc.id });
      });
      setPreguntas(preguntasArray);
    });

    return () => unsubscribe(); // Detener el listener al salir de la pantalla
  }, []);

  const eliminarPregunta = async (id) => {
    Alert.alert(
      "Eliminar Pregunta",
      "¿Estás seguro de que quieres eliminar esta pregunta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            await deleteDoc(doc(firestore, 'preguntas', id));
            Alert.alert("Eliminado", "La pregunta ha sido eliminada.");
          },
        },
      ]
    );
  };


  const renderItem = ({ item }) => (
    <View style={styles.preguntaItem}>
      <Text style={styles.preguntaText}>{item.pregunta}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('CrearJuego', { preguntaId: item.id })}
        >
          <Ionicons name="pencil" size={24} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarPregunta(item.id)}
        >
          <Ionicons name="trash" size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return <Text>Cargando...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#00CED1', '#FFFFFF', '#000000']} style={styles.container}>
        <Text style={styles.header}>Mis Preguntas</Text>
        <FlatList
          data={preguntas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Roboto_400Regular',
  },
  list: {
    paddingBottom: 20, // Agrega espacio al final de la lista para evitar que el último ítem se pegue al borde
  },
  preguntaItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3, // para Android
    shadowColor: '#000', // para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  preguntaText: {
    fontFamily: 'Roboto_400Regular',
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
});

export default AdminPreguntasScreen;
