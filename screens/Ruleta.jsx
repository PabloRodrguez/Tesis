import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  Animated,
  Easing,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; 
const firestore = getFirestore();
import moment from 'moment/moment';

const RuletaScreen = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [desafio, setDesafio] = useState('');
  const [habilidadSeleccionada, setHabilidadSeleccionada] = useState('empatia');
  const [dificultad, setDificultad] = useState('1');
  const [desafios, setDesafios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDesafio, setSelectedDesafio] = useState(null);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const cargarDesafiosDesdeFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'desafios'));
        const desafiosCargados = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          imagenUri: doc.data().imagenUri,
        }));
        setDesafios(desafiosCargados);
      } catch (error) {
        console.error('Error al cargar desafíos desde Firestore', error);
        Alert.alert('Error', 'No se pudieron cargar los desafíos.');
      }
    };
    cargarDesafiosDesdeFirestore();
  }, []);

  const aceptarDesafio = async (desafioId) => {
    try {
      const fechaActual = moment(); // Obtiene la fecha y hora actual
  
      // Parsea el tiempo total del desafío en formato "HH:mm"
      const [horas, minutos] = selectedDesafio.tiempoTotal.split(':');
  
      // Convierte las horas y minutos a milisegundos
      const duracionDesafioMs = (parseInt(horas, 10) * 60 + parseInt(minutos, 10)) * 60 * 1000;
  
      // Suma la duración del desafío al momento actual
      const fechaFinal = fechaActual.clone().add(duracionDesafioMs);
  
      // Guarda el ID del desafío junto con otros datos
      await setDoc(doc(firestore, 'desafiosAceptados', desafioId), {
        userId: auth.currentUser.uid,
        fechaAceptado: serverTimestamp(),
        fechaFinal: fechaFinal.toISOString(), // Guarda la fecha final en formato ISO
        desafioId: desafioId, // Nuevo campo para almacenar el ID del desafío
      });
      setModalVisible(false);
    } catch (error) {
      console.error('Error al aceptar el desafío', error);
      Alert.alert('Error', 'No se pudo aceptar el desafío.');
    }
  };
  
  const rechazarDesafio = async (desafioId) => {

      // Cierra el modal después de rechazar el desafío
      setModalVisible(false);

  };
  
  
  
  

  const spin = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 10,
      duration: 5000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (desafios.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * desafios.length);
        const desafioSeleccionado = desafios[indiceAleatorio];
        setSelectedDesafio(desafioSeleccionado);
        setModalVisible(true);
      } else {
        Alert.alert('Sin desafíos', 'No hay desafíos para mostrar.');
      }
    });
  };

  const spinInterpolation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: spinInterpolation }],
  };
  const DesafioModal = ({ visible, desafio, onClose }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Desafío</Text>
          <View style={styles.divider} />
          {/* Asegúrate de que el desafío tiene una imagen antes de intentar mostrarla */}
          {desafio?.imagenUri && (
            <Image
              source={{ uri: desafio.imagenUri }} // O usa require si es una imagen local
              style={styles.desafioImagen}
            />
          )}
          <Text style={styles.desafioText}>{desafio?.descripcion}</Text>
          <View style={styles.modalButtonGroup}>
            <TouchableOpacity
              style={[styles.modalButton, styles.acceptButton]} // Agregar estilos adicionales para el botón de aceptar
              onPress={() => aceptarDesafio(selectedDesafio.id)}>
              <Text style={styles.modalButtonText}>Aceptar </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.rejectButton]} // Agregar estilos adicionales para el botón de rechazar
              onPress={() => rechazarDesafio(selectedDesafio.id)}>
              <Text style={styles.modalButtonText}>Rechazar </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
     <LinearGradient colors={['#FF6347', '#ffffff']} style={styles.fullScreen}>
        <Text style={styles.screenTitle}>Ruleta de desafíos</Text>
        <Text style={styles.instructions}>
          Aquí podrás probar la ruleta de desafíos además de poder crear desafíos para los jóvenes orientados a las habilidades sociales
        </Text>
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorText}>⬆️</Text>
        </View>
        <Animated.Image
          source={require('../assets/ruleta/ruleta.png')}
          style={[styles.ruleta, animatedStyle]}
        />
        <TouchableOpacity onPress={spin} style={styles.spinButton}>
          <FontAwesome name="play" size={24} color="white" />
          <Text style={styles.buttonText}>Girar Ruleta</Text>
        </TouchableOpacity>
        <DesafioModal
          visible={modalVisible}
          desafio={selectedDesafio}
          onClose={() => setModalVisible(false)}
        />
        <TouchableOpacity
          style={[styles.addButton, styles.acceptedButton]} // Estilo del botón Desafíos Aceptados
          onPress={() => navigation.navigate('DesafioAceptado')}>
          <Text style={styles.buttonText}>Desafíos Aceptados</Text>
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
    flexGrow: 1, // Asegura que los contenidos siempre llenen la vista, incluso si son pequeños
  },
  fullScreen: {
    flexGrow: 1, // Asegura que el degradado cubra toda la pantalla
    padding: 20,
    alignItems: 'center', // Centrar elementos horizontalmente
    justifyContent: 'center', // Centrar elementos verticalmente
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Roboto',
    marginTop: 20, // Ajusta según la necesidad
  },
  instructions: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight:'bold' // Ajusta según la necesidad
  },
  indicatorContainer: {
    position: 'absolute',
    top: '50%', // Ajusta la posición de la flecha según necesidad
    alignSelf: 'center',
  },
  indicatorText: {
    fontFamily: 'Roboto',
    fontSize: 24,
    color: 'white',
  },
  ruleta: {
    width: 300,
    height: 300,
    marginVertical: 20,
  },


  spinButton: {
    flexDirection: 'row',
    backgroundColor: '#006400',
    padding: 15,
    borderRadius: 30, // Bordes muy redondeados
    marginBottom: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#00CED1',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  acceptedButton: {
    backgroundColor: 'tomato', // Color amarillo
    borderRadius: 30, // Bordes muy redondeados
  },
  buttonText: {
    fontFamily: 'Roboto',
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  formTitle: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#ADD8E6', // Línea divisora celeste
    marginVertical: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white', // Fondo blanco
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 30,
  },
  desafioText: {
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight:'bold'
  },
  acceptButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#32CD32',
  },
  rejectButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: 'red',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  desafioImagen:{
    width:120,
    height:100,
    borderRadius:20,
    marginBottom:10
  }
 
  // Agrega estilos adicionales según sea necesario
});

export default RuletaScreen;
