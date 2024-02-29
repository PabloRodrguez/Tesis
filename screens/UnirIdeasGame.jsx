import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { getFirestore, collection, doc, getDoc, serverTimestamp, addDoc, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const UnirIdeasGame = () => {
  const [conjuntos, setConjuntos] = useState([]);
  const [seleccionadaOrigen, setSeleccionadaOrigen] = useState(null);
  const [seleccionadaDestino, setSeleccionadaDestino] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [ideasRespondidas, setIdeasRespondidas] = useState([]);
  const [indiceConjunto, setIndiceConjunto] = useState(0);
  const [conjuntoActual, setConjuntoActual] = useState(null);
  const [ideasDestinoDesordenadas, setIdeasDestinoDesordenadas] = useState([]);
  const gameID = "UnirIdeas_" + Date.now();


  const auth = getAuth();
  let userId;


  useEffect(() => {
    const fetchConjuntos = async () => {
      try {
        const ideasCollection = collection(getFirestore(), 'ideas');
        const ideasSnapshot = await getDocs(ideasCollection);
        const conjuntosData = ideasSnapshot.docs.map((doc) => {
          const conjunto = { id: doc.id, ...doc.data() };
    
          // Añadir índices reales a las ideas destino
          const ideasDestinoConIndices = conjunto.ideas.map((idea, index) => ({
            ...idea,
            realIndex: index,
          }));
    
          return { ...conjunto, ideas: ideasDestinoConIndices };
        });
    
        setConjuntos(conjuntosData);
      } catch (error) {
        console.error('Error fetching conjuntos:', error);
      }
    };

    fetchConjuntos();
  }, []);

  useEffect(() => {
    if (conjuntos.length > 0 && indiceConjunto < conjuntos.length) {
      setConjuntoActual(conjuntos[indiceConjunto]);
    }
  }, [conjuntos, indiceConjunto]);


 
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
    }
  });




  // Función para desordenar un array
  const shuffleArray = (array) => {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  };

  // Función para desordenar las ideas destino de un conjunto
  const shuffleConjuntos = (conjuntoActual) => {
    const conjuntoId = conjuntoActual.id;
  
    if (!ideasDestinoDesordenadas[conjuntoId] && !ideasRespondidas.includes(conjuntoId)) {
      verificarConjuntos(false);
  
      const ideasDestinoDesordenadas = shuffleArray(
        conjuntoActual.ideas.map((idea, index) => ({ visualIndex: index, realIndex: index }))
      );
  
      setIdeasDestinoDesordenadas((prev) => ({
        ...prev,
        [conjuntoId]: ideasDestinoDesordenadas,
      }));
  
      verificarConjuntos(true);
    }
  
    return ideasDestinoDesordenadas[conjuntoId];
  };
  
  
  

  useEffect(() => {
    // Llamar shuffleConjuntos aquí solo cuando es necesario
    if (conjuntoActual) {
      shuffleConjuntos(conjuntoActual);
    }
  }, [conjuntoActual]);

 // ...

 const handleSeleccionConjunto = (conjuntoActual, ideaIndex) => {
  if (seleccionadaOrigen === null) {
    console.log('Idea Origen seleccionada:', ideaIndex);
    setSeleccionadaOrigen({ conjunto: conjuntoActual, ideaIndex });
  } else if (seleccionadaDestino === null) {
    console.log('Idea Destino seleccionada:', ideaIndex);

    // Verifica si el elemento en la posición ideaIndex está definido
    const destinoRealIndex = ideasDestinoDesordenadas[conjuntoActual.id][ideaIndex]?.realIndex;

    // Si está definido, usa el realIndex
    if (destinoRealIndex !== undefined) {
      setSeleccionadaDestino({ conjunto: conjuntoActual, ideaIndex: destinoRealIndex });
      verificarConjuntos(true); // Pasa true para actualizar los puntos
    } else {
      console.error('Elemento destino no definido en ideasDestinoDesordenadas[', conjuntoActual.id, '][', ideaIndex, ']');
    }
  } else {
    setSeleccionadaOrigen(null);
    setSeleccionadaDestino(null);
  }
};

// ...

  
  useEffect(() => {
    if (seleccionadaDestino !== null) {
      verificarConjuntos();
    }
  }, [seleccionadaDestino]);
    
  
  

  const verificarConjuntos = async () => {
    let puntosGanados = 0; // Declarar puntosGanados en el ámbito exterior
  
    console.log('Entró en verificarConjuntos');
    if (seleccionadaOrigen && seleccionadaDestino) {
      console.log('Verificando:', seleccionadaOrigen.ideaIndex, '==', seleccionadaDestino.ideaIndex);
      console.log('Indices:', seleccionadaOrigen.ideaIndex, seleccionadaDestino.ideaIndex);
  
      if (seleccionadaOrigen.ideaIndex === seleccionadaDestino.ideaIndex) {
        console.log('Conexión correcta');
  
        // Calcular puntos solo si no se han calculado antes para el conjunto actual
        if (!ideasRespondidas.includes(conjuntoActual.id)) {
          const { conjunto: origenConjunto } = seleccionadaOrigen;
          const dificultad = parseInt(origenConjunto.dificultad) || 1; // Convertir a número y usar 1 si no está definido
          puntosGanados = dificultad; // Asignar el valor a puntosGanados
  
          console.log('Puntos ganados:', puntosGanados);
  
          setPuntos((prevPuntos) => prevPuntos + puntosGanados);
  
          // Almacenar resultados en la colección "Resultados"
          const resultadosRef = collection(getFirestore(), 'Resultados');
          const resultadosData = {
            userId, // Asumiendo que userId está disponible en este ámbito
            juego: 'UnirIdeas',
            puntos: puntosGanados,
            fecha: serverTimestamp(),
          };
  
          addDoc(resultadosRef, resultadosData)
            .then((docRef) => {
              console.log('Resultado almacenado con ID:', docRef.id);
            })
            .catch((error) => {
              console.error('Error al almacenar resultado:', error);
            });
        }
  
        const { conjunto: origenConjunto } = seleccionadaOrigen;
        const nuevasIdeasOrigen = origenConjunto.ideas.filter(
          (_, index) => index !== seleccionadaOrigen.ideaIndex
        );
  
        setConjuntoActual((prev) => ({
          ...prev,
          ideas: [...nuevasIdeasOrigen],
        }));
  
        setSeleccionadaOrigen(null);
        setSeleccionadaDestino(null);
  
        // Verificar si ha completado todas las ideas
        if (nuevasIdeasOrigen.length === 0) {
          setModalSuccessVisible(true);
          setIdeasRespondidas((prev) => [...prev, conjuntoActual.id]);
        }
      } else {
        console.log('Conexión incorrecta');
        console.log('Indices:', seleccionadaOrigen.ideaIndex, seleccionadaDestino.ideaIndex);
        setModalErrorVisible(true);
      }
  
      // Obtener el nombre de la habilidad social desde la colección "ideas"
      const ideasCollection = collection(getFirestore(), 'ideas');
      const conjuntoDoc = await getDoc(doc(ideasCollection, conjuntoActual.id));
  
      if (conjuntoDoc.exists()) {
        const habilidadSocial = conjuntoDoc.data().habilidad;
  
        // Almacenar puntos por habilidad social en la colección "PuntosxHabilidad"
        const puntosHabilidadRef = collection(getFirestore(), 'PuntosxHabilidad');
        const puntosHabilidadData = {
          userId, // Asumiendo que userId está disponible en este ámbito
          habilidadSocial,
          puntos: puntosGanados, // Usar la variable puntosGanados aquí
          fecha: serverTimestamp(),
        };
  
        addDoc(puntosHabilidadRef, puntosHabilidadData)
          .then((docRef) => {
            console.log('Puntos por habilidad social almacenados con ID:', docRef.id);
          })
          .catch((error) => {
            console.error('Error al almacenar puntos por habilidad social:', error);
          });
      }
    }
  };
  const closeModal = () => {
    setModalSuccessVisible(false);
    setModalErrorVisible(false);
  };

  const handleSiguiente = () => {
    setIndiceConjunto((prevIndice) => prevIndice + 1);
    setConjuntoActual(null);
    setSeleccionadaOrigen(null);
    setSeleccionadaDestino(null);
    setModalSuccessVisible(false);
    setModalErrorVisible(false);
  };


  const renderConjuntos = () => {
    if (!conjuntoActual || !conjuntoActual.ideas || !Array.isArray(conjuntoActual.ideas)) {
      return null;
    }
  
    const ideasOrigen = conjuntoActual.ideas.map((idea, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.idea,
          seleccionadaOrigen && seleccionadaOrigen.conjunto === conjuntoActual && seleccionadaOrigen.ideaIndex === index
            ? styles.ideaSeleccionada
            : null,
          ideasRespondidas.includes(conjuntoActual.id) ? styles.ideaRespondida : null,
        ]}
        onPress={() => handleSeleccionConjunto(conjuntoActual, index)}
        disabled={ideasRespondidas.includes(conjuntoActual.id)}
      >
        <Text style={styles.ideaText}>{idea.origen}</Text>
      </TouchableOpacity>
    ));
  
    const ideasDestinoDesordenadas = shuffleConjuntos(conjuntoActual) || [];
    const ideasDestino = ideasDestinoDesordenadas.map((info, index) => {
      const destinoIdea = conjuntoActual.ideas[info.realIndex];
      
      if (destinoIdea && destinoIdea.destino) {
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.idea,
              seleccionadaDestino && seleccionadaDestino.conjunto === conjuntoActual && seleccionadaDestino.ideaIndex === index
                ? styles.ideaSeleccionada
                : null,
              ideasRespondidas.includes(conjuntoActual.id) ? styles.ideaRespondida : null,
            ]}
            onPress={() => handleSeleccionConjunto(conjuntoActual, index)}
            disabled={ideasRespondidas.includes(conjuntoActual.id)}
          >
            <Text style={styles.ideaText}>{destinoIdea.destino}</Text>
          </TouchableOpacity>
        );
      } else {
        // Manejar el caso en que destinoIdea o destinoIdea.destino es undefined (opcional)
        return null; // o renderizar un marcador de posición, o manejarlo según prefieras
      }
    });
  
    return (
      <View key={conjuntoActual.id} style={styles.conjuntoContainer}>
        <View style={styles.columnContainer}>{ideasOrigen}</View>
        <View style={styles.columnContainer}>{ideasDestino}</View>
      </View>
    );
  };
  
  return (
    <LinearGradient colors={['#4b0082','#4b0082',  '#696969']} style={styles.linearGradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.gameContainer}>
          <Text style={styles.gameTitle}>¡Juego de Unir Ideas!</Text>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructions}>
              Este juego consiste en seleccionar una idea origen del lado izquierdo y emparejarla
              con su idea destino del lado derecho. Buena suerte!
            </Text>
          </View>
          <View style={styles.headerContainer}>
            <View style={styles.pointsContainer}>
              <Image source={require('../assets/ruleta/moneda.png')} style={styles.coinImage} />
              <Text style={styles.pointsText}>{puntos}</Text>
            </View>
          </View>

          <View style={styles.conjuntosContainer}>{renderConjuntos()}</View>

          {conjuntos.length > 0 && ideasRespondidas.length < conjuntos.length * 2 && (
            <TouchableOpacity style={styles.siguienteButton} onPress={handleSiguiente}>
              <Text style={styles.siguienteButtonText}>Siguiente</Text>
            </TouchableOpacity>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalErrorVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>¡Ups!, inténtalo nuevamente</Text>
                <Pressable style={styles.modalButton} onPress={closeModal}>
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};



const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  gameContainer: {
    alignItems: 'center',
    marginTop: 5,
    justifyContent: 'center',
  },
  gameTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    fontFamily: 'Roboto',
    color: 'white',
  },
  instructionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fondo blanco con transparencia
    borderColor: 'white',
    borderWidth: 3,
    padding: 10,
    marginBottom: 20,
  },
  instructions: {
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 14,
    justifyContent:'center',
    color:'white',
    fontWeight:'bold'
  },
  ideaSeleccionada: {
    backgroundColor: 'orange',
  },
  conjuntosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  conjuntoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  idea: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    width: '58%',
 // Ajustar el ancho para dejar espacio entre las ideas
  },
  ideaText: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    justifyContent:'center',
    textAlign:'justify',

 // Ajusta el espaciado entre palabras
  },
  modalSuccessContainer: {
    alignItems: 'center',
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#4b0082',
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinImage: {
    width: 25,
    height: 25,
    marginRight: 3,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  ideaRespondida: {
    backgroundColor: 'green',
  },

  siguienteButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4b0082',
    borderRadius: 5,
  },
  siguienteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  gameCompleteContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    alignItems: 'center',
  },
  gameCompleteText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b0082',
  },
});

export default UnirIdeasGame;
