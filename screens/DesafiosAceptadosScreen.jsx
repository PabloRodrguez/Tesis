import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDoc,
  doc as firestoreDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';
import {
  Modal,
  Text as ModalText,
  View as ModalView,
  TouchableOpacity as ModalTouchableOpacity,
  Image as ModalImage,
} from 'react-native';

const DesafiosAceptadosScreen = () => {
  const [desafiosAceptados, setDesafiosAceptados] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recompensaGanada, setRecompensaGanada] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioActual(user);
        const q = query(collection(db, 'desafiosAceptados'), where('userId', '==', user.uid));
        const unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
          const nuevosDesafios = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data();
              const desafioID = data.desafioId;

              // Obtener datos del desafío desde la tabla desafios
              const desafioDoc = await getDoc(firestoreDoc(db, 'desafios', desafioID));
              const desafioData = desafioDoc.data();

              return {
                id: doc.id,
                descripcion: desafioData.descripcion,
                cumplido: data.cumplido,
                fechaAceptado: data.fechaAceptado.toDate(),
                imagenUri: desafioData.imagenUri,
              };
            })
          );

          nuevosDesafios.sort((a, b) => a.fechaAceptado - b.fechaAceptado);
          setDesafiosAceptados(nuevosDesafios);
        });
        return () => unsubscribeSnapshot();
      } else {
        setUsuarioActual(null);
        setDesafiosAceptados([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const marcarComoHecho = async (id) => {
    const desafioRef = firestoreDoc(db, 'desafiosAceptados', id);
    try {
      await updateDoc(desafioRef, {
        cumplido: true,
      });

      // Agregar el registro de puntosTotales en la nueva colección y mostrar el modal
      const recompensa = await agregarPuntosTotales(id);
      setRecompensaGanada(recompensa);
      setModalVisible(true);
    } catch (error) {
      console.error('Error al actualizar el desafío: ', error);
    }
  };

  const rechazarDesafio = async (id) => {
    const desafioRef = firestoreDoc(db, 'desafiosAceptados', id);
    try {
      // Eliminar el desafío de la colección desafiosAceptados
      await deleteDoc(desafioRef);

      // Actualizar la lista de desafíos eliminando el desafío rechazado
      const nuevosDesafios = desafiosAceptados.filter((desafio) => desafio.id !== id);
      setDesafiosAceptados(nuevosDesafios);
    } catch (error) {
      console.error('Error al rechazar el desafío: ', error);
    }
  };

 // ... (resto del código)

// ... (resto del código)

const agregarPuntosTotales = async (desafioId) => {
  const puntosHabilidadRef = collection(db, 'PuntosxHabilidad');
  const resultadosRef = collection(db, 'Resultados');
  const user = auth.currentUser;

  try {
    // Obtener datos del desafío desde la tabla desafios
    const desafioDoc = await getDoc(firestoreDoc(db, 'desafios', desafioId));
    const desafioData = desafioDoc.data();
    const habilidad = desafioDoc.data().habilidad;
    // Calcular la recompensa según el nivel del desafío (multiplicado por 2)
    const recompensa = desafioData.nivel * 2;

    // Agregar un nuevo documento a la colección puntosxhabilidad
    await addDoc(puntosHabilidadRef, {
      userId: user.uid,
      habilidadSocial: habilidad,
      puntos: recompensa,
      fecha: new Date(),
    });

    // Agregar un nuevo documento a la colección resultados
    await addDoc(resultadosRef, {
      userId: user.uid,
      juego: 'Desafios',
      puntos: recompensa,
      fecha: new Date(),
    });

    // Devolver el valor de la recompensa
    return recompensa;
  } catch (error) {
    console.error('Error al agregar los puntos totales: ', error);
    return 0; // Puedes manejar el error según tus necesidades
  }
};

// ... (resto del código)

// ... (resto del código)

  const closeModal = async () => {
    // Eliminar el desafío de la colección desafiosAceptados
    const desafioId = desafiosAceptados[0]?.id; // Supongo que solo hay un desafío en la lista al reclamar el premio
    if (desafioId) {
      const desafioRef = firestoreDoc(db, 'desafiosAceptados', desafioId);
      try {
        await deleteDoc(desafioRef);

        // Actualizar la lista de desafíos eliminando el desafío reclamado
        const nuevosDesafios = desafiosAceptados.filter((desafio) => desafio.id !== desafioId);
        setDesafiosAceptados(nuevosDesafios);
      } catch (error) {
        console.error('Error al eliminar el desafío: ', error);
      }
    }

    // Cerrar el modal
    setModalVisible(false);
  };

  const DesafioItem = ({ desafio }) => {
    return (
      <View style={styles.desafioContainer}>
        <Text style={styles.desafioTexto}>{desafio.descripcion}</Text>
        <Image source={{ uri: desafio.imagenUri }} style={styles.imagenDesafio} />
        <Text style={styles.tiempoRestante}>
          Finaliza: {moment(desafio.fechaAceptado).add(1, 'hours').format('MMMM D, YYYY [a las] HH:mm')}
        </Text>
        <View style={styles.botonesContainer}>
          <TouchableOpacity
            style={[styles.boton, { backgroundColor: '#5cb85c' }]}
            onPress={() => marcarComoHecho(desafio.id)}
          >
            <Text style={styles.botonTexto}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.boton, { backgroundColor: '#d9534f' }]}
            onPress={() => rechazarDesafio(desafio.id)} //* Llamar a la función para rechazar el desafío */}
          >
            <Text style={styles.botonTexto}>X</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FFA07A', '#FFFFFF', '#000000']} style={styles.container}>
      <ScrollView>
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Tus desafíos</Text>
          <FlatList
            data={desafiosAceptados}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <DesafioItem desafio={item} />}
          />
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ModalText style={styles.modalText}>
              Bien hecho, ganaste:{'\n'}
              <View style={styles.modalContentRow}>
                <Text style={styles.recompensaText}> {recompensaGanada}</Text>
                <Image source={require('../assets/ruleta/moneda.png')} style={styles.modalImage} />
              </View>
            </ModalText>

            <ModalTouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Reclamar</Text>
            </ModalTouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Roboto',
    marginTop: 25, // Ajusta según la necesidad
  },
  desafioContainer: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#708090',
    alignItems: 'center',
  },
  desafioTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagenDesafio: {
    width: 80,
    height: 50,
    marginVertical: 10,
    borderRadius: 10,
  },
  tiempoRestante: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontWeight: 'bold',
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: 10,
  },
  boton: {
    flex: 0.1,
    padding: 5,
    borderRadius: 20,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 20,
  },
  // Estilos para el modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centra los elementos horizontalmente
    marginTop: 10, // Ajusta según sea necesario
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recompensaText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginRight: 2, // Ajusta según sea necesario
  },
  modalImage: {
    width: 25,
    height: 25,
    marginLeft: 1, // Ajusta según sea necesario
  },
  modalButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DesafiosAceptadosScreen;
