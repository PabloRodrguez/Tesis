import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditarPreguntaScreen = () => {
  const [pregunta, setPregunta] = useState('');
  const [opciones, setOpciones] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState('');
  const [cargando, setCargando] = useState(true);

  const firestore = getFirestore();
  const navigation = useNavigation();
  const route = useRoute();
  const { preguntaId } = route.params;

  useEffect(() => {
    const cargarPregunta = async () => {
      const docRef = doc(firestore, 'preguntas', preguntaId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPregunta(data.pregunta);
        setOpciones(data.opciones);
        setRespuestaCorrecta(data.respuestaCorrecta);
      } else {
        Alert.alert('Error', 'Pregunta no encontrada');
        navigation.goBack();
      }
      setCargando(false);
    };

    cargarPregunta();
  }, [preguntaId, firestore, navigation]);

  const handleGuardar = async () => {
    const docRef = doc(firestore, 'preguntas', preguntaId);
    await updateDoc(docRef, {
      pregunta,
      opciones,
      respuestaCorrecta,
    });
    Alert.alert('Éxito', 'Pregunta actualizada correctamente');
    navigation.goBack();
  };

  if (cargando) {
    return <Text>Cargando...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Editar Pregunta</Text>
      <TextInput
        style={styles.input}
        value={pregunta}
        onChangeText={setPregunta}
        placeholder="Pregunta"
      />
      {opciones.map((opcion, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={opcion}
          onChangeText={(text) => {
            const nuevasOpciones = [...opciones];
            nuevasOpciones[index] = text;
            setOpciones(nuevasOpciones);
          }}
          placeholder={`Opción ${index + 1}`}
        />
      ))}
      <TextInput
        style={styles.input}
        value={respuestaCorrecta}
        onChangeText={setRespuestaCorrecta}
        placeholder="Respuesta correcta"
      />
      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Text style={styles.textoBoton}>Guardar Cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  botonGuardar: {
    backgroundColor: '#00CED1',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EditarPreguntaScreen;
