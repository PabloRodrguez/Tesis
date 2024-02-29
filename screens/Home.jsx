import React, { useEffect } from 'react';
import { StyleSheet, ImageBackground, View, Image, Text, TouchableOpacity } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Roboto_900Black } from '@expo-google-fonts/roboto';
import { useNavigation } from '@react-navigation/native';

SplashScreen.preventAutoHideAsync(); // Mantener la splash screen visible

export default function Home() {
  const navigation= useNavigation();  
  let [fontsLoaded] = useFonts({
    'Roboto-Black': Roboto_900Black,
  });

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync(); // Ocultar la splash screen cuando las fuentes estén cargadas
      }
    }

    hideSplashScreen();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Retornar null mientras las fuentes están cargando
  }

  return (
    <ImageBackground
      source={require('../assets/Home.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/Icono.png')} // Asegúrate de tener una imagen llamada logo.png en tu carpeta de assets
          style={styles.logo}
        />
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>¡Bienvenido!</Text>
        <View style={styles.resumen}>
          <Text style={styles.resumenText}>
            Esta aplicación está orientada para jóvenes que quieran fortalecer sus habilidades sociales. 
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.buttonText}>Continuar como invitado</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop:100,
  },
  logo: {
    width: 200,
    height: 200,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 62,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Black',
    color: 'black',
    textAlign: 'center',
  },
  resumen: {
    justifyContent: 'center',
    marginTop: 10,
  },
  resumenText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Black',
    color: 'black',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 20,
  },
  loginButton: {
    backgroundColor: 'black',
    padding: 10,
    flex: 1,
    marginRight: 10,
    borderRadius: 30,
    justifyContent: 'center',
  },
  guestButton: {
    backgroundColor: 'black',
    padding: 10,
    flex: 1,
    marginLeft: 10,
    borderRadius: 30,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
  },
});

