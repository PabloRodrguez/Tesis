import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView,  } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFonts, Roboto_900Black } from '@expo-google-fonts/roboto';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { serverTimestamp } from 'firebase/firestore';



const CrearJuegoScreen = () => {
  let [fontsLoaded] = useFonts({
    'Roboto-Black': Roboto_900Black,
  });

  const [habilidadSeleccionada, setHabilidadSeleccionada] = useState('empatia');
  const navigation = useNavigation();
  const route = useRoute();
  const preguntaId = route.params?.preguntaId; 
  const [pregunta, setPregunta] = useState('');
  const [opciones, setOpciones] = useState(['']);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState('');
  const [imagenUri, setImagenUri] = useState(null);
  const [selectedValue, setSelectedValue] = useState("empatia");
  const [indiceRespuestaCorrecta, setIndiceRespuestaCorrecta] = useState(null);
  const [dificultad, setDificultad] = useState('1');
  // Inicializa Firestore y Storage
  const firestore = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const cargarPregunta = async () => {
      if (preguntaId) {
        const docRef = doc(firestore, 'preguntas', preguntaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPregunta(data.pregunta);
          setOpciones(data.opciones);
          setRespuestaCorrecta(data.respuestaCorrecta);
          setImagenUri(data.imagen);
        } else {
          console.log('No se encontró la pregunta.');
        }
      }
    };

    cargarPregunta();
  }, [preguntaId, firestore]);


  // Agrega una nueva opción vacía al array de opciones
  const agregarOpcion = () => {
    setOpciones([...opciones, '']);
    setIndiceRespuestaCorrecta(opciones.length);
  };

  // Elimina una opción del array de opciones
  const eliminarOpcion = (index) => {
    const opcionesActualizadas = opciones.filter((_, i) => i !== index);
    setOpciones(opcionesActualizadas);
  };
  const renderizarOpciones = () => {
    return opciones.map((opcion, index) => (
      <View key={index} style={styles.opcionContainer}>
        <RadioButton
          value={index}
          status={indiceRespuestaCorrecta === index ? 'checked' : 'unchecked'}
          onPress={() => setIndiceRespuestaCorrecta(index)}
        />
        <TextInput
          style={styles.opcionInput}
          placeholder={`Opción ${index + 1}`}
          value={opcion}
          onChangeText={(text) => {
            const nuevasOpciones = [...opciones];
            nuevasOpciones[index] = text;
            setOpciones(nuevasOpciones);
          }}
        />
        {opciones.length > 1 && (
          <TouchableOpacity onPress={() => eliminarOpcion(index)} style={styles.removeButton}>
            <Ionicons name="remove-circle-outline" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    ));
  };
  // Seleccionar imagen de la galería
  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.cancelled) {
      setImagenUri(resultado.uri);
    }
  };
  
  // Sube la imagen seleccionada a Firebase Storage
  const subirImagen = async () => {
    if (imagenUri) {
      const response = await fetch(imagenUri);
      const blob = await response.blob();
      const fileRef = ref(storage, `images/${Date.now()}`);
      await uploadBytes(fileRef, blob);
      return await getDownloadURL(fileRef);
    }
    return null;
  };

  // Guarda la pregunta en Firestore
  const guardarPregunta = async () => {
    try {
      if (!pregunta.trim() || opciones.length < 2 || indiceRespuestaCorrecta === null) {
        Alert.alert("Error", "Por favor, completa todos los campos requeridos.");
        return;
      }
      const respuesta = opciones[indiceRespuestaCorrecta].trim();
      if (!respuesta) {
        Alert.alert("Error", "La respuesta correcta no puede estar vacía.");
        return;
      }
      let imgUrl = await subirImagen();
      if (imagenUri) {
        const imagenRef = ref(storage, `imagenes/${Date.now()}`);
        const imgResponse = await fetch(imagenUri);
        const imgBlob = await imgResponse.blob();
        await uploadBytes(imagenRef, imgBlob);
        imgUrl = await getDownloadURL(imagenRef);
      }

      const nuevaPregunta = {
        pregunta,
        opciones,
        respuestaCorrecta: respuesta,
        imagen: imgUrl,
        habilidad: habilidadSeleccionada,
        dificultad,
        
      };

      if (preguntaId) {
        const preguntaRef = doc(firestore, 'preguntas', preguntaId);
        await updateDoc(preguntaRef, nuevaPregunta);
      } else {
        await addDoc(collection(firestore, 'preguntas'), nuevaPregunta);
      }

      Alert.alert('Éxito', 'Pregunta guardada correctamente.');
      navigation.goBack();
      
      // Restablecer el estado después de guardar o actualizar
      setPregunta('');
      setOpciones(['']);
      setRespuestaCorrecta('');
      setImagenUri(null);
      setDificultad('1')


    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar la pregunta');
    }
  };
  

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <LinearGradient colors={['#00CED1', '#778899', '#000000']} style={styles.linearGradient}>
        <Text style={[styles.title, { fontFamily: 'Roboto' }]}>Nueva Pregunta</Text>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructions}>
            En este apartado podrás crear preguntas con las opciones que quieras, además de poder subir una imagen como referencia. Recuerda seleccionar la viñeta de la respuesta correcta.
          </Text>
        </View>  
        <TextInput
          style={styles.input}
          placeholder="Escribe la pregunta aquí"
          value={pregunta}
          onChangeText={setPregunta}
          multiline={true}
          numberOfLines={4}
        />
        <Text style={styles.titleopciones}>Recuerda seleccionar la opción correcta</Text>
        {renderizarOpciones()}
        <TouchableOpacity style={styles.button} onPress={agregarOpcion}>
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Agregar Opción</Text>
        </TouchableOpacity>
        <Text style={styles.pickerTitle}>Selecciona una habilidad para tu pregunta:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={habilidadSeleccionada}
            style={styles.picker}
            onValueChange={(itemValue, itemIndex) => setHabilidadSeleccionada(itemValue)}
          >
            {/* Asumiendo que tienes una lista de habilidades, esto debería venir de tu estado o de una constante */}
            <Picker.Item label="Empatía" value="empatia" />
            <Picker.Item label="Inteligencia emocional" value="inteligencia_emocional" />
            <Picker.Item label="Sarcasmo" value="sarcasmo" />
            <Picker.Item label="Comportamiento de la sociedad" value="comportamiento_sociedad" />
          </Picker>
        </View>
        <Text style={styles.pickerTitle}>Selecciona un nivel de dificultad para tu pregunta:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dificultad}
            style={styles.picker}
            onValueChange={(itemValue, itemIndex) => setDificultad(itemValue)}
          >
            {/* Se generan los números del 1 al 10 para seleccionar la dificultad */}
            {[...Array(10).keys()].map((number) => (
              <Picker.Item key={number} label={`Nivel ${number + 1}`} value={`${number + 1}`} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'orange' }]} onPress={seleccionarImagen}>
          <Text style={styles.buttonText}>Seleccionar Imagen (Opcional)</Text>
        </TouchableOpacity>
        {imagenUri && (
          <Image source={{ uri: imagenUri }} style={styles.image} />
        )}
        {imagenUri && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'darkred' }]}
            onPress={() => setImagenUri(null)}>
            <Text style={styles.buttonText}>Eliminar Imagen</Text>
          </TouchableOpacity>
        )}
       <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={guardarPregunta}>
          <Text style={styles.buttonText}>Guardar Pregunta</Text>
        </TouchableOpacity>
        
      </LinearGradient>
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1, // Esto asegura que el contenedor crezca para adaptarse al contenido
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
  },
  instructionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fondo blanco con transparencia
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  instructions: {
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 16,
    justifyContent:'center',
    color:'white',
    fontWeight:'bold'
  },
  input: {
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 15,
    textAlignVertical:'top',
  },
  opcionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  opcionInput: {
    flex: 1, // Asegura que el input ocupe todo el ancho disponible
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginRight: 10, // Asegúrate de dejar espacio para el botón de eliminar
  },
  removeButton: {
    padding: 10, 
  },  
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#00CED1',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  questionsButton: {
    backgroundColor: 'blue',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontFamily: 'Roboto', // Esto aplica la fuente Roboto al título
    fontSize: 16, // Ajusta el tamaño del texto según sea necesario
    color: 'white', // Esto establece el color del título
    fontWeight:'bold', // Esto establece el fondo del título como blanco
    padding: 10, // Añade relleno alrededor del texto si es necesario
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius:10,
    padding:3,
    marginBottom:20, // Esto establece el fondo del contenedor del selector como blanco
    // Añade otros estilos como bordes o sombras si es necesario
  },
  picker: {
    color: 'black', // Esto establece el color de los elementos dentro del Picker
    fontFamily: 'Roboto', // Esto aplica la fuente Roboto a los elementos del Picker
    // Añade otros estilos que puedas necesitar
  },
  titleopciones:{
    fontFamily: 'Roboto', // Esto aplica la fuente Roboto al título
    fontSize: 16, // Ajusta el tamaño del texto según sea necesario
    color: 'white', // Esto establece el color del título
    fontWeight:'bold', // Esto establece el fondo del título como blanco
    padding: 10,
  }
});

export default CrearJuegoScreen;
