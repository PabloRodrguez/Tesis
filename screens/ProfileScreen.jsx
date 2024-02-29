import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getDocFromRef, collection, getDocs, query, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';
import { getAuth } from 'firebase/auth';

const celesteColors = ['#000', '#3498db', '#e74c3c', '#ffffff', '#8e44ad', '#f1c40f', '#2ecc71'];

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);
  const [isTraitModalVisible, setIsTraitModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [progressLevel, setProgressLevel] = useState(0);
  const [celesteColor, setCelesteColor] = useState('#3498db'); // Celeste predeterminado
  const [selectedTrait, setSelectedTrait] = useState(null); // Nuevo estado para almacenar el rasgo seleccionado
  const [habilidadesNiveles, setHabilidadesNiveles] = useState({
    empatia: 0,
    sarcasmo: 0,
    inteligencia_emocional: 0,
    comportamiento_social: 0,
  });



  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;
  const userRef = doc(firestore, 'users', user.uid);

  let [fontsLoaded] = useFonts({
    Roboto: Roboto_400Regular,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setAge(data.age);
        setOccupation(data.occupation);
        setCelesteColor(data.celesteColor);
  
        const resultadosQuery = query(collection(firestore, 'Resultados'), where('userId', '==', user.uid));
        const resultadosSnap = await getDocs(resultadosQuery);
        let totalPoints = 0;
        resultadosSnap.forEach((resultadosDoc) => {
          const resultadosData = resultadosDoc.data();
          totalPoints += resultadosData.puntos || 0; // Asegúrate de usar el nombre correcto de la propiedad "puntos"
        });
  
        let nivel = 0;
        if (totalPoints >= 2000) {
          nivel = 7;
        } else if (totalPoints >= 1800) {
          nivel = 6;
        } else if (totalPoints >= 1300) {
          nivel = 5;
        } else if (totalPoints >= 850) {
          nivel = 4;
        } else if (totalPoints >= 500) {
          nivel = 3;
        } else if (totalPoints >= 200) {
          nivel = 2;
        } else if (totalPoints >= 0) {
          nivel = 1;
        }
  
        setProgressLevel(nivel);
  
        const unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            if (userData.avatar) {
              setAvatarUri({ uri: userData.avatar });
            }
          }
        });
  
        return () => unsubscribe();
      } else {
        console.log('No such document!');
      }
    };
  
    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async () => {
    await updateDoc(userRef, {
      name,
      email,
      phone,
      age,
      occupation,
      progressLevel,
      celesteColor,
    });
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      name,
      email,
      phone,
      age,
      occupation,
      progressLevel,
      celesteColor,
    }));
    setIsModalVisible(false);
  };

  const handleOpenColorModal = () => {
    setIsColorModalVisible(true);
  };

  const handleCloseColorModal = () => {
    setIsColorModalVisible(false);
  };

  const handleOpenTraitModal = (trait) => {
    setSelectedTrait(trait);
    setHabilidadesNiveles((prevNiveles) => ({
      ...prevNiveles,
      [trait.name.toLowerCase()]: prevNiveles[trait.name.toLowerCase()] || 0,
    }));
    setIsTraitModalVisible(true);
  };

  const handleCloseTraitModal = () => {
    setSelectedTrait(null);
    setIsTraitModalVisible(false);
  };

  const guardarNivelHabilidad = async (habilidad, nivel) => {
    await updateDoc(userRef, {
      [`traits.${habilidad}`]: nivel,
    });
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <LinearGradient colors={[celesteColor, 'white', 'white']} style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isColorModalVisible}
        onRequestClose={handleCloseColorModal}
      >
        <LinearGradient
          colors={['#ffffff', '#000000']}
          style={styles.colorModalView}
        >
          <Text style={styles.inputLabel}>Selecciona un color:</Text>
          <View style={styles.colorPickerContainer}>
            {celesteColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setCelesteColor(color);
                  handleCloseColorModal();
                }}
                style={[styles.celesteColorPickerSwatch, { backgroundColor: color }]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.buttonClose}
            onPress={handleCloseColorModal}
          >
            <Text style={styles.textStyle}>Cerrar</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Modal>

      {selectedTrait && (
        <Modal
        animationType="slide"
        transparent={true}
        visible={isTraitModalVisible}
        onRequestClose={handleCloseTraitModal}
      >
        <LinearGradient
          colors={['#ffffff', '#ffffff']}
          style={styles.colorModalView}
        >
          <Text style={styles.inputLabel}>{`Selecciona un nivel para ${selectedTrait.name}:`}</Text>
          <View style={styles.colorPickerContainer}>
            {[1, 2, 3, 4, 5, 6, 7].map((nivel) => (
              <TouchableOpacity
                key={nivel}
                onPress={() => {
                  setHabilidadesNiveles((prevNiveles) => ({
                    ...prevNiveles,
                    [selectedTrait.name.toLowerCase()]: nivel,
                  }));
                }}
                style={styles.levelButton}
              >
                <Text style={styles.levelButtonText}>{nivel}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.buttonClose}
            onPress={() => {
              guardarNivelHabilidad(selectedTrait.name.toLowerCase(), habilidadesNiveles[selectedTrait.name.toLowerCase()]);
              handleCloseTraitModal();
            }}
          >
            <Text style={styles.textStyle}>Guardar Nivel</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Modal>
      )}

      <Image
        style={styles.avatar}
        source={avatarUri || require('../assets/Avatars/avatar1.png')}
      />
      <Text style={styles.nameText}>{name}</Text>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Nivel {progressLevel}</Text>
      </View>

      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={styles.dataContainer}
      >
        <Text style={styles.dataTitle}>Editar perfil</Text>
      </TouchableOpacity>

    
      <View style={styles.habilidadesContainer}>
        <Text style={styles.text}>Selecciona un nivel por habilidad</Text>
        <View style={styles.habilidades}>
          {[
            { id: 1, name: 'Empatía', color: '#9400D3' },
            { id: 2, name: 'Sarcasmo', color: '#FF8C00' },
            { id: 3, name: 'I. Emocional', color: '#1E90FF' },
            { id: 4, name: 'C. Social', color: '#32CD32' },
          ].map((trait) => (
            <TouchableOpacity
              key={trait.id}
              onPress={() => handleOpenTraitModal(trait)}
              style={[styles.traitButton, { backgroundColor: trait.color, marginRight: 10 }]}
            >
              <Text style={styles.traitButtonText}>{trait.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={handleOpenColorModal} style={styles.changeColorButton}>
        <Text style={styles.changeColorButtonText}>Cambiar Color</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <LinearGradient
          colors={['#ffffff', '#FFFFFF']}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <View style={styles.modaltitletext}>
              <Text style={styles.modalTitle}>Tus datos</Text>
            </View>
            <ScrollView style={{ flex: 1, width: '100%' }}>
              <Text style={styles.inputLabel}>Nombre Completo</Text>
              <TextInput
                style={styles.modalInput}
                onChangeText={setName}
                value={name}
                placeholder="Nombre Completo"
                placeholderTextColor="#c4c4c4"
              />
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.modalInput}
                onChangeText={setEmail}
                value={email}
                placeholder="Correo electrónico"
                placeholderTextColor="#c4c4c4"
                keyboardType="email-address"
              />
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.modalInput}
                onChangeText={setPhone}
                value={phone}
                placeholder="Teléfono"
                placeholderTextColor="#c4c4c4"
                keyboardType="phone-pad"
              />
              <Text style={styles.inputLabel}>Edad</Text>
              <TextInput
                style={styles.modalInput}
                onChangeText={setAge}
                value={age}
                placeholder="Edad"
                placeholderTextColor="#c4c4c4"
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Ocupación</Text>
              <TextInput
                style={styles.modalInput}
                onChangeText={setOccupation}
                value={occupation}
                placeholder="Ocupación"
                placeholderTextColor="#c4c4c4"
              />
            </ScrollView>
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={handleUpdateProfile}
            >
              <Text style={styles.textStyle}>Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Modal>

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateProfile}
      >
        <Text style={styles.updateButtonText}>Guardar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: 24,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 60,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 36,
    fontFamily: 'Roboto',
    color: '#000',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  levelContainer: {
    backgroundColor: 'black',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginBottom: 20,

  },
  levelText: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  text:{
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  habilidadesContainer: {
    backgroundColor: 'silver', // Fondo blanco
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    maxWidth:'90%'
  },
  habilidades: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10, // Ajusta el margen superior según sea necesario
  },
  traitButton: {
    backgroundColor: 'purple', // Puedes cambiar el color base
    borderRadius: 20,
    padding: 10,
  },
  traitButtonText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  dataContainer: {
    width: '90%',
    backgroundColor: 'silver',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  modalInput: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  inputLabel: {
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    padding: 20,
    alignItems: 'flex',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modaltitletext: {
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: 'red',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: 'green',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
  },
  updateButtonText: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  changeColorButton: {
    backgroundColor: 'purple',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  changeColorButtonText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  colorModalView: {
    margin: 20,
    backgroundColor: 'white',
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
  picker: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  celesteColorPickerSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pickerInput: {
    position: 'relative',
    zIndex: 1,
  },
  traitButton: {
    backgroundColor: 'purple', // Puedes cambiar el color base
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  traitButtonText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },

  // Nuevos estilos para el modal de niveles
  levelButton: {
    backgroundColor: 'black', // Puedes cambiar el color base
    borderRadius: 30,
    padding: 10,
    margin: 5,
  },
  levelButtonText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
});
export default ProfileScreen;
