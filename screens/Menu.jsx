import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions, ImageBackground } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, getDoc } from 'firebase/firestore';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation }) {
  const [userName, setUserName] = useState("Usuario");
  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  const getUserData = async () => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.name) {
          setUserName(userData.name);
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getUserData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  return (
    <DrawerContentScrollView>
      <View style={styles.profileSection}>
        <Image source={{ uri: 'URL_de_la_imagen_del_usuario' }} style={styles.profileImage} />
        <Text style={styles.profileText}>Hola, {userName}</Text>
      </View>

      <DrawerItem
        label="Perfil"
        icon={() => <FontAwesome name="user" size={windowWidth * 0.06} color="black" />}
        onPress={() => navigation.navigate('Perfil')}
      />
      <DrawerItem
        label="Ayuda"
        icon={() => <FontAwesome name="question" size={windowWidth * 0.06} color="black" />}
        onPress={() => navigation.navigate('Ayuda')}
      />
      <DrawerItem
        label="Ajustes"
        icon={() => <FontAwesome name="cog" size={windowWidth * 0.06} color="black" />}
        onPress={() => navigation.navigate('DesafioAceptado')}
      />
      <DrawerItem
        label="Desconectate"
        icon={() => <FontAwesome name="cog" size={windowWidth * 0.06} color="black" />}
        onPress={() => navigation.navigate('juke')}
      />

      <DrawerItem
        label="Cerrar Sesión"
        icon={() => <FontAwesome name="sign-out" size={windowWidth * 0.06} color="black" />}
        onPress={() => {/* Lógica para cerrar sesión y volver a la pantalla de inicio de sesión */}}
      />
    </DrawerContentScrollView>
  );
}

function Menu({ navigation }) {
  const [userName, setUserName] = useState("Usuario");
  const[userRole, setUserRole]= useState("");

  useEffect(() => {
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;


    const getUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.name) {
            setUserName(userData.name);
          }if(userData.rol){
            setUserRole(userData.rol);
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    getUserData();
  }, []);

  return (
    <LinearGradient colors={['#000000', '#00CED1', '#FFFFFF']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 2, y: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <FontAwesome name="bars" size={windowWidth * 0.07} color="white" style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Hola {userName}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.genericButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Qview')}
          >
            <Feather name="check-square" size={windowWidth * 0.12} color="skyblue" />
            <Text style={styles.buttonText}>Trivia Social</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.genericButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Ruleta')}
          >
            <FontAwesome name="rocket" size={windowWidth * 0.12} color="tomato" />
            <Text style={styles.buttonText}>Ruleta de Desafíos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.genericButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Unir')}
          >
            <MaterialCommunityIcons name="vector-union" size={windowWidth * 0.12} color="#BA55D3" />
            <Text style={styles.buttonText}>Unir Ideas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.genericButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('juke')}
          >
            
            <MaterialCommunityIcons name="account-music" size={windowWidth * 0.12} color="limegreen" />
            <Text style={styles.buttonText}>Desconecta</Text>
          </TouchableOpacity>
          
        </View>
      </View>
      {userRole === "admin" && (
        <TouchableOpacity
          style={styles.roundButton}  // Utiliza un nuevo estilo
          activeOpacity={0.7}
          onPress={() => navigation.navigate('m_profesional')}
        >
         <FontAwesome name="pencil" size={windowWidth * 0.12} color="yellow" style={styles.icon} />
      <Text style={styles.buttonTextp}>Modo Profesional</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: windowWidth * 0.05,
    paddingBottom: windowHeight * 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: windowHeight * 0.04,
  },
  menuIcon: {
    marginRight: windowWidth * 0.02,
  },
  title: {
    fontSize: windowWidth * 0.1,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    marginTop: windowHeight * 0.02,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: windowHeight * 0.30,
  },
  genericButton: {
    backgroundColor: 'white',
    marginBottom: windowHeight * 0.03,
    width: windowWidth * 0.40,
    height: windowHeight * 0.20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: windowWidth * 0.08,
    shadowColor: '#000',
    shadowOffset: {
      width: windowWidth * 0.01,
      height: windowHeight * 0.01,
    },
    shadowOpacity: 0.25,
    shadowRadius: windowWidth * 0.02,
    elevation: 7,
  },
  buttonText: {
    fontSize: windowWidth * 0.045,
    fontWeight: 'bold',
    color: 'black',
    marginTop: windowHeight * 0.01,
    textAlign: 'center',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: windowWidth * 0.04,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: windowWidth * 0.05,
    width: windowWidth * 0.1,
    height: windowWidth * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: windowHeight * 0.02,
  },
  profileImage: {
    width: windowWidth * 0.4,
    height: windowWidth * 0.4,
    borderRadius: windowWidth * 0.2,
  },
  profileText: {
    fontSize: windowWidth * 0.05,
    color: 'black',
    marginTop: windowHeight * 0.01,
  },
  roundButton: {
    position: 'absolute',
    backgroundColor:'black',
    bottom: windowHeight * 0.02,
    alignSelf: 'center',
    borderRadius: 10,
    width: windowWidth * 0.65,
    height: windowWidth * 0.16,
    overflow: 'hidden',
    marginBottom: windowHeight * 0.015,
    flexDirection: 'row',  // Para alinear ícono y texto en una fila
    alignItems: 'center',  // Para centrar ícono y texto verticalmente
    justifyContent: 'center',  // Para centrar ícono y texto horizontalmente
  },
  buttonTextp: {
    fontSize: windowWidth * 0.045,
    fontWeight: 'bold',
    color: 'white',
    marginTop: windowHeight * 0.01,
    textAlign: 'center',
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  icon: {
    marginRight: windowWidth * 0.01,

      // Ajusta según sea necesario para el espacio entre ícono y texto

  },
});

export default Menu;