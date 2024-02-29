import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ListaIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const firestore = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const cargarIdeas = async () => {
      try {
        const ideasSnapshot = await getDocs(collection(firestore, 'ideas'));
        const ideasData = ideasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setIdeas(ideasData);
      } catch (error) {
        console.error(error);
      }
    };

    cargarIdeas();
  }, [firestore]);

  const handleEditarIdea = (ideaId) => {
    navigation.navigate('Ideas', { ideas, ideaId, onEditarIdea: editarIdea });
  };

  const editarIdea = async (ideaId, nuevaIdea) => {
    // Implementa la lógica para editar la idea en la base de datos
    try {
      // Por ejemplo, actualiza el documento en Firestore
      await updateDoc(doc(firestore, 'ideas', ideaId), nuevaIdea);
    } catch (error) {
      console.error(error);
    }
  };
  const handleEliminarIdea = async (ideaId) => {
    try {
      await deleteDoc(doc(firestore, 'ideas', ideaId));
      setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.fullScreen}>
       <LinearGradient colors={['#4b0082','#4b0082',  '#696969']} style={styles.linearGradient} >
        
  
        <Text style={[styles.title, { fontFamily: 'Roboto' }]}>Lista de Ideas</Text>
        <FlatList
          data={ideas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.ideaContainer}>
              <Text style={styles.ideaText}>{item.nombreConjunto}</Text>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => handleEditarIdea(item.id)}>
                  <Ionicons name="create-outline" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEliminarIdea(item.id)}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
                
              </View>
            </View>
          )}
        />
    

      </LinearGradient>
      </View>
     
    
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  contentContainer: {
    flexGrow: 1, // Asegura que los contenidos siempre llenen la vista, incluso si son pequeños
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000', // Cambiado de transparent a un color de fondo sólido
  },
  linearGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#FFF',
  },
  ideaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 10,
  },
  ideaText: {
    fontSize: 18,
    fontFamily: 'Roboto',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ListaIdeas;
