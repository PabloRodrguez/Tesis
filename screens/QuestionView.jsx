import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, collection, query, getDocs, getDoc, doc, updateDoc, setDoc} from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useFonts, Roboto_900Black } from '@expo-google-fonts/roboto';
import { FontAwesome } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import coinImage from '../assets/ruleta/moneda.png';
import { auth } from '../firebaseConfig'; // Asegúrate de importar tu instancia de autenticación

// Función auxiliar para determinar el degradado de color
const getGradientColors = (skill) => {
  switch (skill) {
    case 'sarcasmo':
      return ['#FFA500', '#808080']; // naranja a blanco
    case 'empatia':
      return ['#800080', '#808080']; // morado a blanco
    case 'inteligencia_emocional':
      return ['#0000FF', '#808080']; // azul a blanco
    case 'comportamiento_sociedad':
      return ['#008000', '#DCDCDC']; // verde a blanco
    default:
      return ['#FFFFFF', '#FFFFFF']; // blanco puro por defecto
  }
};

const calculateCoins = (dificultad) => {
  return dificultad * 5; // Cada nivel incrementa en 5 monedas
};

const QuestionView = () => {
  const [fontsLoaded] = useFonts({
    Roboto_900Black,
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [coins, setCoins] = useState(0);
  // Definir fetchQuestions fuera del useEffect
  const fetchQuestions = async () => {
    const db = getFirestore();
    const q = query(collection(db, 'preguntas'));
    const querySnapshot = await getDocs(q);
    const loadedQuestions = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      let imageUrl = null;
      if (data.imagen) {
        try {
          imageUrl = await getDownloadURL(ref(getStorage(), data.imagen));
        } catch (error) {
          console.error("Error al obtener la URL de la imagen:", error);
        }
      }
      loadedQuestions.push({
        pregunta: data.pregunta,
        imageUrl: imageUrl,
        opciones: data.opciones,
        respuestaCorrecta: data.respuestaCorrecta,
        id: doc.id,
        skill: data.habilidad,
        dificultad: data.dificultad // Asegúrate de tener este campo en tus documentos
      });
    }

    setQuestions(loadedQuestions);
  };

  useEffect(() => {
    hideSplashScreen();

    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await fetchQuestions();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }

    prepare();
  }, []);

  const hideSplashScreen = async () => {
    if (!isLoading && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  };

  const handleSelectOption = async (option) => {
    const { respuestaCorrecta, dificultad, id } = questions[currentQuestionIndex];
    const uid = auth.currentUser.uid;
  
    if (option === respuestaCorrecta) {
      const earnedCoins = calculateCoins(dificultad);
      setCoins(coins + earnedCoins);
  
      // Crear un nuevo documento en Resultados
      const resultadosRef = doc(getFirestore(), 'Resultados', uid);
      const resultadosData = {
        userId: uid,
        Juego:'Preguntas',
        puntos: earnedCoins,
        fecha:new Date()
      };
      await setDoc(resultadosRef, resultadosData, { merge: true });
  
      // Obtener la habilidad de la pregunta
      const preguntaRef = doc(getFirestore(), 'preguntas', id);
      const preguntaDoc = await getDoc(preguntaRef);
      const skill = preguntaDoc.data().habilidad;
  
      // Crear un nuevo documento en PuntosxHabilidad
      const puntosHabilidadRef = doc(getFirestore(), 'PuntosxHabilidad', uid);
      const puntosHabilidadData = {
        userId: uid,
        habilidadSocial: skill,
        puntos: earnedCoins,
        fecha: new Date(),
      };
      await setDoc(puntosHabilidadRef, puntosHabilidadData, { merge: true });
  
      setShowSuccessModal(true);
    } else {
      setShowErrorModal(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); // Avanza a la siguiente pregunta
      setShowSuccessModal(false); // Cierra el modal de éxito
    } else {
      Alert.alert("Fin del cuestionario", "¡Has completado todas las preguntas!");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const gradientColors = getGradientColors(currentQuestion.skill);

  if (!currentQuestion) {
    return <Text>No hay más preguntas.</Text>;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View key={currentQuestion.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.pregunta}</Text>
            {/* Mueve el contenedor de monedas dentro del contenedor de la pregunta */}
            <View style={styles.coinsContainer}>
              <Image source={coinImage} style={styles.coinImage} />
              <Text style={styles.coinsText}>{`x${calculateCoins(currentQuestion.dificultad)}`}</Text>
            </View>
          </View>
          {currentQuestion.imageUrl && (
            <Image source={{ uri: currentQuestion.imageUrl }} style={styles.image} />
          )}
          {currentQuestion.opciones.map((opcion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleSelectOption(opcion)}
            >
              <Text style={styles.optionText}>{opcion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => {
          setShowSuccessModal(!showSuccessModal);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTextTitle}>Bien hecho, ganaste:</Text>
            <View style={styles.coinDisplay}>
              <Text style={styles.coinAmountText}>{calculateCoins(questions[currentQuestionIndex].dificultad)}</Text>
              <Image source={coinImage} style={styles.coinImage} />
            </View>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.textStyle}>Siguiente pregunta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Incorrecto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showErrorModal}
        onRequestClose={() => {
          setShowErrorModal(!showErrorModal);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Ups, intenta de nuevo</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonRetry]}
                onPress={() => setShowErrorModal(!showErrorModal)}
              >
                <Text style={styles.textStyle}>Reintentar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSkip]}
                onPress={() => {
                  setShowErrorModal(!showErrorModal);
                  handleNextQuestion();
                }}
              >
                <Text style={styles.textStyle}>Omitir pregunta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  questionContainer: {
    marginVertical: 20,
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignSelf: 'center',
    // El ancho se ajusta al contenido hasta un máximo de 95% del contenedor padre
    width: 'auto', // Esto ajustará el ancho al contenido
    maxWidth: '100%', // Esto limitará el ancho a no más del 95% del contenedor padre
    position: 'relative', // Importante para posicionamiento de elementos hijos
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily:'Roboto'
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
    borderRadius:20,
    maxWidth:'80%',
    position: 'relative',
    alignSelf: 'center',
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 50,
    padding: 10,
    marginVertical: 5,
  },
  optionText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily:'Roboto',
    fontWeight:'bold'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'lightcyan',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center', // Mantener si quieres que los elementos estén centrados
    justifyContent: 'center', // Asegurar que los elementos estén centrados verticalmente
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Ajustar al porcentaje deseado del ancho de la pantalla
    alignSelf: 'center', // Centrar el modal en la pantalla
  },
  
  modalText: {
    fontFamily: 'Roboto', // Asegúrate de que la fuente Roboto está cargada
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16, // Ajustar según la necesidad
  },
  modalTextTitle: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coinAmountText: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 24, // Ajusta el tamaño del texto de las monedas
    marginRight: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  
  // Estilos para los botones, si no los tienes ya
  buttonStyle: {
    backgroundColor: '#2196F3', // O cualquier color que prefieras
    padding: 10,
    elevation: 2,
  },
  
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10, 
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para los botones de reintentar y omitir
  buttonRetry: {
    backgroundColor: 'green',
  },
  buttonSkip: {
    backgroundColor: 'blue',
  },
  // Estilos para el contenedor de monedas
  coinsContainer: {
    position: 'absolute', // Esto posicionará el contenedor de monedas absolutamente
    top: 0, // Cambia esto según cuánto margen quieras desde la parte superior del contenedor de preguntas
    right: 1, // Cambia esto según cuánto margen quieras desde la parte derecha del contenedor de preguntas
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'dimgray',
    borderRadius: 20,
    padding: 1,
  },
  coinsText: {
    marginRight: 5,
    color: 'white',
    
  },
  coinImage: {
    width: 24, // o el tamaño que prefieras
    height: 24, // o el tamaño que prefieras
    marginRight: 5,
  },
});

export default QuestionView;
