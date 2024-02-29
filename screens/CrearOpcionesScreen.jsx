import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

function CrearOpcionesScreen({ navigation }) {
    return (
      <View style={styles.container}>
        {/* Agrega un título a la vista */}
        <Text style={styles.title}>Opciones</Text>
  
        {/* Botón 1: "Crea Preguntas" */}
        <TouchableOpacity style={styles.optionButton}>
         {/*} <Image source={require('ruta_a_tu_imagen')} style={styles.optionImage} />*/}
          <Text style={styles.optionText}>Crea Preguntas</Text>
        </TouchableOpacity>
  
        {/* Botón 2: "Crea Desafíos" */}
        <TouchableOpacity style={styles.optionButton}>
           {/*} <Image source={require('ruta_a_tu_imagen')} style={styles.optionImage} />*/}
          <Text style={styles.optionText}>Crea Desafíos</Text>
        </TouchableOpacity>
  
        {/* Botón 3: "Crea Ideas" */}
        <TouchableOpacity style={styles.optionButton}>
           {/*} <Image source={require('ruta_a_tu_imagen')} style={styles.optionImage} />*/}
          <Text style={styles.optionText}>Crea Ideas</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000', // Color de fondo
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 20,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%', // Alargado ocupando el ancho de la pantalla
      padding: 20,
      backgroundColor: 'linear-gradient: orange, purple, black', // Configura el degradado de colores
      marginBottom: 10,
    },
    optionImage: {
      width: 60,
      height: 60,
      marginRight: 20,
    },
    optionText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
  });
export default CrearOpcionesScreen;