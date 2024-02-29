import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Importa Ionicons para el botón de eliminar

const IdeasScreen = ({ route }) => {
  const firestore = getFirestore();
  const { ideas, ideaId, onEditarIdea } = route.params || { ideas: [], ideaId: null, onEditarIdea: null };
  const [nombreConjunto, setNombreConjunto] = useState('');
  const [ideasArray, setIdeasArray] = useState([{ origen: '', destino: '' }]);
  const [habilidadSeleccionada, setHabilidadSeleccionada] = useState('empatia');
  const [dificultad, setDificultad] = useState('1');

  useEffect(() => {
    if (ideaId && ideas) {
      const ideaSeleccionada = ideas.find((idea) => idea.id === ideaId);
      if (ideaSeleccionada) {
        setNombreConjunto(ideaSeleccionada.nombreConjunto);
        setIdeasArray(ideaSeleccionada.ideas);
        setHabilidadSeleccionada(ideaSeleccionada.habilidad);
        setDificultad(ideaSeleccionada.dificultad);
      }
    }
  }, [ideaId, ideas]);

  const navigation = useNavigation();

  const guardarConjuntoIdeas = async () => {
    if (nombreConjunto.trim() && ideasArray.length > 0) {
      try {
        const nuevoConjuntoIdeas = {
          nombreConjunto: nombreConjunto,
          ideas: ideasArray,
          habilidad: habilidadSeleccionada,
          dificultad: dificultad,
        };
  
        if (ideaId && onEditarIdea) {
          // Si hay una ideaId y una función para editar
          // Identifica la idea que deseas actualizar
          const ideaActualizada = ideas.find((idea) => idea.id === ideaId);
  
          // Actualiza los campos de la idea existente
          ideaActualizada.nombreConjunto = nuevoConjuntoIdeas.nombreConjunto;
          ideaActualizada.ideas = nuevoConjuntoIdeas.ideas;
          ideaActualizada.habilidad = nuevoConjuntoIdeas.habilidad;
          ideaActualizada.dificultad = nuevoConjuntoIdeas.dificultad;
  
          // Utiliza la función para editar la idea
          await onEditarIdea(ideaId, ideaActualizada);
        } else {
          // Si no hay ideaId o función para editar, agrega una nueva idea
          await addDoc(collection(firestore, 'ideas'), nuevoConjuntoIdeas);
        }
  
        setNombreConjunto('');
        setIdeasArray([{ origen: '', destino: '' }]);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo guardar el conjunto de ideas.');
      }
    } else {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
    }
  };
  

  const agregarIdea = () => {
    setIdeasArray([...ideasArray, { origen: '', destino: '' }]);
  };

  const eliminarIdea = (index) => {
    const ideasActualizadas = ideasArray.filter((_, i) => i !== index);
    setIdeasArray(ideasActualizadas);
  };

  const renderPickers = () => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={habilidadSeleccionada}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) => setHabilidadSeleccionada(itemValue)}
      >
        {/* Opciones de habilidad */}
        <Picker.Item label="Empatía" value="empatia" />
        <Picker.Item label="Inteligencia emocional" value="inteligencia_emocional" />
        <Picker.Item label="Sarcasmo" value="sarcasmo" />
        <Picker.Item label="Comportamiento de la sociedad" value="comportamiento_sociedad" />
      </Picker>
    </View>
  );

  const renderDificultadPicker = () => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={dificultad}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) => setDificultad(itemValue)}
      >
        {/* Niveles de dificultad */}
        {[...Array(7).keys()].map((number) => (
          <Picker.Item key={number} label={`Nivel ${number + 1}`} value={`${number + 1}`} />
        ))}
      </Picker>
    </View>
  );

  const renderIdeasInputs = () => (
    <View>
      {ideasArray.map((idea, index) => (
        <View key={index} style={styles.ideaInputContainer}>
          <TextInput
            style={styles.ideaInput}
            placeholder={`Idea origen ${index + 1}`}
            value={idea.origen}
            onChangeText={(text) => {
              const nuevasIdeas = [...ideasArray];
              nuevasIdeas[index].origen = text;
              setIdeasArray(nuevasIdeas);
            }}
            multiline={true}
            numberOfLines={3}
          />
          <Image source={require('../assets/ruleta/flecha.png')} style={styles.arrowImage} />
          <TextInput
            style={styles.ideaInput}
            placeholder={`Idea destino ${index + 1}`}
            value={idea.destino}
            onChangeText={(text) => {
              const nuevasIdeas = [...ideasArray];
              nuevasIdeas[index].destino = text;
              setIdeasArray(nuevasIdeas);
            }}
            multiline={true}
            numberOfLines={3}
          />
          {ideasArray.length > 1 && (
            <TouchableOpacity onPress={() => eliminarIdea(index)} style={styles.removeButton}>
              <Ionicons name="remove-circle-outline" size={24} color="red" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.fullScreen}>
      <LinearGradient colors={['#BA55D3', '#BA55D3', '#ffffff']} style={styles.linearGradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.screenTitle}>Conjuntos de Ideas</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del Conjunto:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del conjunto de ideas"
              value={nombreConjunto}
              onChangeText={setNombreConjunto}
            />
          </View>
          <Text style={styles.label}>Ideas para unir:</Text>
          {renderIdeasInputs()}
          <TouchableOpacity style={styles.buttonAgregar} onPress={agregarIdea}>
            <Ionicons name="add-circle-outline" size={24} color="black" />
            <Text style={styles.buttonTextAgregar}>Agregar Ideas</Text>
          </TouchableOpacity>

          {renderPickers()}
          {renderDificultadPicker()}
          <TouchableOpacity style={styles.button} onPress={guardarConjuntoIdeas}>
            <Text style={styles.buttonText}>
              {ideaId && onEditarIdea ? 'Guardar Cambios' : 'Guardar Conjunto de Ideas'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonIdeas} onPress={() => navigation.navigate('Lista')}>
            <Text style={styles.buttonText}>Lista de Ideas</Text>
          </TouchableOpacity>
        </ScrollView>
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
    flex: 5,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000', // Cambiado de transparent a un color de fondo sólido
  },

  screenTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    marginTop: 30,
    fontFamily: 'Roboto',
    color: '#000',
  },
  linearGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 50,
  },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    textAlign: 'center',
    color: '#000',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
    width: '80%',
    fontFamily: 'Roboto',
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
  ideaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
  },
  ideaInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',

    fontFamily: 'Roboto',
    color: '#000',
  },
  arrowImage: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo semi-transparente
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  picker: {
    height: 50,
    width: '100%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#000', // Color del texto del Picker
  },

  button: {
    backgroundColor: '#00CED1',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    marginTop: 40,
  },
  buttonAgregar:{
    backgroundColor: 'rgba(0, 0, 0, 0)',
    alignItems: 'center',
    padding: 5,
    borderRadius: 10,
    marginBottom: 15,
    marginTop: 10,
  },
  buttonTextAgregar:{
    color:'black',
    fontFamily:'Roboto',
    fontWeight:'bold',
    fontSize: 18,
  },
  buttonIdeas: {
    backgroundColor: 'purple',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});

export default IdeasScreen;
