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

const AdminDesafiosScreen = () => {
  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
  });

  const [desafios, setDesafios] = useState([]);
  const firestore = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(collection(firestore, 'desafios'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const desafiosArray = [];
      querySnapshot.forEach((doc) => {
        desafiosArray.push({ ...doc.data(), id: doc.id });
      });
      setDesafios(desafiosArray);
    });

    return () => unsubscribe(); // Detener el listener al salir de la pantalla
  }, []);

  const eliminarDesafio = async (id) => {
    Alert.alert(
      "Eliminar Desafío",
      "¿Estás seguro de que quieres eliminar este desafío?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            await deleteDoc(doc(firestore, 'desafios', id));
            Alert.alert("Eliminado", "El desafío ha sido eliminado.");
          },
        },
      ]
    );
  };

  const editarDesafio = (id) => {
    // Aquí puedes navegar a la pantalla de edición pasando el ID del desafío como parámetro.
    navigation.navigate('EditarDesafio', { desafioId: id });
  };

  const renderItem = ({ item }) => (
    <View style={styles.desafioItem}>
      <Text style={styles.desafioText}>{item.descripcion}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditarDesafios',{desafioId: item.id})}
       
        >
          <Ionicons name="pencil" size={24} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarDesafio(item.id)}
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
      <LinearGradient colors={['tomato', '#FFFFFF', '#000000']} style={styles.container}>
        <Text style={styles.header}>Mis Desafíos</Text>
        <FlatList
          data={desafios}
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
  desafioItem: {
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
  desafioText: {
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

export default AdminDesafiosScreen;
