import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';

const Jukebox = () => {
  const [sound, setSound] = useState(null);
  const [audioUrls, setAudioUrls] = useState([]);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Función para cargar los nombres de los archivos de audio en la carpeta 'assets'
  const fetchAudioUrls = async () => {
    const files = [
      require('../assets/beats/Project_1.mp3'),
      require('../assets/beats/Project_3.mp3'),
      require('../assets/beats/Project_5.mp3'),
      require('../assets/beats/Project_7.mp3'),
      require('../assets/beats/Project_8.mp3'),
      // Agrega más archivos según sea necesario
    ];

    setAudioUrls(files);
  };

  // Función para reproducir un audio al azar
  const playRandomAudio = async () => {
    if (audioUrls.length > 0) {
      const randomIndex = Math.floor(Math.random() * audioUrls.length);
      const randomFile = audioUrls[randomIndex];
      const { sound: newSound } = await Audio.Sound.createAsync(
        randomFile,
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    }
  };

  // Función para detener el audio
  const stopAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  // Función para gestionar el estado de reproducción
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      setIsPlaying(false);
    } else {
      setIsPlaying(status.isPlaying);
    }
  };

  // Instrucciones y temporizadores para la técnica de respiración
  const breathingPhases = [
    { text: "Inhala lentamente por la nariz durante 4 segundos.", duration: 6000 },
    { text: "Mantén la respiración durante 7 segundos.", duration: 10000 },
    { text: "Exhala completamente por la boca durante 8 segundos.", duration: 12000 },
    { text: "Pausa brevemente antes de repetir el ciclo.", duration: 5000 }
  ];

  // Función para pasar a la siguiente instrucción
  const nextBreathingPhase = () => {
    setCurrentInstruction((prevInstruction) =>
      prevInstruction < breathingPhases.length - 1 ? prevInstruction + 1 : 0
    );
  };

  // Efecto para cargar los nombres de los archivos al iniciar la app
  useEffect(() => {
    fetchAudioUrls();
  }, []);

  // Efecto para gestionar el temporizador de respiración
  useEffect(() => {
    let timer;
    if (isBreathingMode) {
      timer = setTimeout(() => {
        nextBreathingPhase();
      }, breathingPhases[currentInstruction].duration);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [currentInstruction, isBreathingMode]);

  // Función para iniciar la técnica de respiración
  const startBreathingTechnique = async () => {
    // Verifica si ya está reproduciendo
    if (!isPlaying) {
      // Asegúrate de detener cualquier reproducción de música
      if (sound) {
        stopAudio();
      }
      setIsBreathingMode(true);
      setCurrentInstruction(0);

      // Reproduce el beat
      await playRandomAudio();
    } else {
      setIsBreathingMode(true);
      setCurrentInstruction(0);
    }
  };

  // Para detener la técnica de respiración y/o la música
  const stopAll = () => {
    if (sound) {
      stopAudio();
    }
    setIsBreathingMode(false);
  };

  return (
    <ImageBackground
      source={require('../assets/Home.jpg')} // Ajusta la ruta de tu imagen
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Desconéctate</Text>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructions}>
            {isBreathingMode
              ? breathingPhases[currentInstruction].text
              : "Si necesitas un momento de relajación, presiona el botón Iniciar y se reproducirá música LOFI. Mientras estés escuchando nuestra música te guiaremos en una técnica de respiración."}
          </Text>
        </View>

        {isBreathingMode ? (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopAll}>
            <Text style={styles.buttonText}>Detener</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={[styles.button, styles.playButton]} onPress={startBreathingTechnique}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff', // Ajusta el color del texto según sea necesario
  },
  instructionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  instructions: {
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
  },
  playButton: {
    backgroundColor: '#00CED1', // Turquesa
  },
  stopButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Jukebox;
