import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

const UserViewScreen = () => {
  let [fontsLoaded] = useFonts({
    Roboto: Roboto_700Bold,
  });

  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [ultimaPreguntaVisible, setUltimaPreguntaVisible] = useState(null);

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    const db = getFirestore();
    const preguntasRef = collection(db, 'preguntas');
    const q = query(preguntasRef, orderBy('createdAt', 'desc'), limit(10)); // Asumiendo que hay un campo 'createdAt'

    const documentSnapshots = await getDocs(q);
    const preguntasCargadas = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPreguntas(preguntasCargadas);
    setPreguntaActual(preguntasCargadas[0]);
    const ultimoVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setUltimaPreguntaVisible(ultimoVisible);
  };

  const pasarSiguientePregunta = async () => {
    if (ultimaPreguntaVisible) {
      const db = getFirestore();
      const preguntasRef = collection(db, 'preguntas');
      const next = query(
        preguntasRef,
        orderBy('createdAt', 'desc'),
        startAfter(ultimaPreguntaVisible),
        limit(10)
      );

      const documentSnapshots = await getDocs(next);
      const preguntasCargadas = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPreguntas((prevPreguntas) => [...prevPreguntas, ...preguntasCargadas]);
      const ultimoVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setUltimaPreguntaVisible(ultimoVisible);

      // Actualiza la pregunta actual para mostrar la siguiente
      const currentIndex = preguntas.findIndex((preg) => preg.id === preguntaActual.id);
      if (currentIndex < preguntas.length - 1) {
        setPreguntaActual(preguntas[currentIndex + 1]);
        setRespuestaSeleccionada(null);
      }
    }
  };

  if (!fontsLoaded) {
    return <Text>Cargando...</Text>;
  }

  if (!preguntaActual) {
    return <Text>No hay preguntas disponibles.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <LinearGradient colors={['#8E2DE2', '#4A00E0', '#FFFFFF']} style={styles.container}>
        <Text style={styles.titulo}>Pregunta</Text>
        <View style={styles.preguntaContainer}>
          <Text style={styles.preguntaText}>{preguntaActual.pregunta}</Text>
        </View>
        {preguntaActual.imagen && (
          <Image source={{ uri: preguntaActual.imagen }} style={styles.imagen} />
        )}
        {preguntaActual.opciones.map((opcion, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.opcionContainer,
              respuestaSeleccionada === opcion && styles.opcionSeleccionada,
            ]}
            onPress={() => setRespuestaSeleccionada(opcion)}
          >
            <Text style={styles.opcionText}>{opcion}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.botonSiguiente} onPress={pasarSiguientePregunta}>
          <Text style={styles.botonSiguienteText}>Siguiente</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  preguntaContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  preguntaText: {
    fontSize: 18,
    fontFamily: 'Roboto',
    color: '#000',
  },
  imagen: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  opcionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '100%',
  },
  opcionSeleccionada: {
    backgroundColor: 'lightgreen',
  },
  opcionText: {
    fontSize: 18,
    fontFamily: 'Roboto',
    color: '#000',
    fontWeight: 'bold',
  },
  botonSiguiente: {
    backgroundColor: '#6a3093',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
  },
  botonSiguienteText: {
    color: '#FFF',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default UserViewScreen;
