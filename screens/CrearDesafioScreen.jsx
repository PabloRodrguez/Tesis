import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const firestore = getFirestore();

const CrearDesafioScreen = ({ navigation }) => {
  const [descripcion, setDescripcion] = useState('');
  const [habilidad, setHabilidad] = useState('empatia');
  const [nivel, setNivel] = useState('1');
  const [imagenUri, setImagenUri] = useState('');
  const [duracion, setDuracion] = useState('1440'); // Inicializar con 10 minutos
  const [horas, setHoras]= useState('');
  const [minutos, setMinutos]=useState('');


  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar una imagen.');
      return;
    }
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

  const agregarDesafioAFirestore = async () => {
    try {
      const tiempoTotal = `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
      await addDoc(collection(firestore, 'desafios'), {
        descripcion,
        habilidad,
        nivel, // Convertir a número
        imagenUri, 
        tiempoTotal,// Aquí iría la lógica para subir la imagen a un servicio de almacenamiento y guardar la URL
      });
      Alert.alert('Desafío creado', 'El desafío se ha agregado correctamente.');
      navigation.goBack(); // Regresar a la pantalla anterior
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el desafío.');
      console.error(error);
    }
  };

  return (
    <LinearGradient colors={['#FF6347', '#ffffff']} style={styles.gradient}>
      <ScrollView style={styles.container}>
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Crear nuevo desafío</Text>
        </View>
        <View style={styles.instruccionesContainer}>
          <Text style={styles.instruccionesTexto}>
            Por favor, rellena todos los campos para crear un desafío.
          </Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Descripción del desafío"
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={styles.label}>Habilidad</Text>
        <Picker
          selectedValue={habilidad}
          onValueChange={(itemValue, itemIndex) => setHabilidad(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Empatía" value="empatia" />
          <Picker.Item label="Sarcasmo" value="sarcasmo" />
          <Picker.Item label="Inteligencia Emocional" value="inteligencia_emocional" />
          <Picker.Item label="Comportamiento en la Sociedad" value="comportamiento_sociedad" />
        </Picker>

        <Text style={styles.label}>Nivel</Text>
        <Picker
          selectedValue={nivel}
          onValueChange={(itemValue, itemIndex) => setNivel(itemValue)}
          style={styles.picker}
        >
          {Array.from({ length: 7 }, (_, i) => (
            <Picker.Item key={i} label={`Nivel ${i + 1}`} value={`${i + 1}`} />
          ))}
        </Picker>

        <Text style={styles.label}>Duración</Text>
      <View style={styles.horasMinutosContainer}>
        <TextInput
          style={[styles.input, styles.horasInput]}
          placeholder="Horas"
          value={horas}
          onChangeText={(text) => setHoras(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.minutosInput]}
          placeholder="Minutos"
          value={minutos}
          onChangeText={(text) => setMinutos(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          maxLength={2}
        />
      </View>

        <TouchableOpacity style={styles.buttonUpload} onPress={seleccionarImagen}>
          <Text style={styles.buttonText}>Subir Imagen</Text>
        </TouchableOpacity>

        {imagenUri ? (
          <Image source={{ uri: imagenUri }} style={styles.previewImage} />
        ) : null}

        <TouchableOpacity style={styles.buttonSave} onPress={agregarDesafioAFirestore}>
          <Text style={styles.buttonText}>Guardar Desafío</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  tituloContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    marginTop: 30,
    fontFamily: 'Roboto',
    color: '#000',
  },
  instruccionesContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fondo blanco con transparencia
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  instruccionesTexto: {
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 16,
    justifyContent:'center',
    color:'black',
    fontWeight:'bold'
  },
  input: {
    fontSize: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 15,
    textAlignVertical:'top',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  pickerTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    padding: 10,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Roboto',
  },
  buttonUpload: {
    backgroundColor: '#FFA500',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonSave: {
    backgroundColor: '#006400',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  horasMinutosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  horasInput: {
    flex: 1,
    marginRight: 10,
  },

  minutosInput: {
    flex: 1,
    marginLeft: 10,
  },
});

export default CrearDesafioScreen;
