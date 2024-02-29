import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const ModoProfesionalScreen = () => {
    const navigation = useNavigation();
  const buttonsData = [
    {
      title: 'Trivia Social',
      icon: <FontAwesome name="check-square" size={windowWidth * 0.20} color="skyblue" />,
      instructions: 'En este apartado podrás crear preguntas, crear contextos y situaciones con las alternativas que quieras, además podrás elegir una habilidad, nivel e imagen para la pregunta.',
      screen: 'boton',
    },
    {
      title: 'Ruleta de desafíos',
      icon: <FontAwesome name="rocket" size={windowWidth * 0.20} color="tomato" />,
      instructions: 'En la Ruleta de desafíos, podrás crear desafíos para fomentar la habilidad que quieras tratar, además de poder elegir el tiempo que durará este desafío su nivel e imagen si quisieras.',
      screen: 'boton2',
    },
    {
      title: 'Unir Ideas',
      icon: <MaterialCommunityIcons name="vector-union" size={windowWidth * 0.20} color="violet" />,
      instructions: 'Unir Ideas es una sección en la que podrás crear Conjuntos de Ideas con ideas origen e ideas destino. El conjunto se visualizará completo por cada pantalla, en la que podrás elegir la dificultad y habilidad que tratará el conjunto.',
      screen: 'boton3',
    },
  ];

  return (
    <ScrollView>
    <LinearGradient colors={['#000000', '#000000', '#FFD700', ]} style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Modo Profesional</Text>
      </View>
  
      <View style={styles.instructionsContainer}>
        <View style={styles.borderContainer}>
          <Text style={styles.instructionsText}>
            Bienvenido al modo Profesional. En esta sección podrás crear diferentes elementos para los juegos de la aplicación, deberás elegir dificultades, contextos y en algunos casos imagenes para ser claro con tus creaciones.
          </Text>
        </View>
      </View>
  
      {buttonsData.map((button, index) => (
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(button.screen)}
          key={index}
        >
          <View style={styles.buttonContent}>
            <View style={styles.textContainer}>
              <Text style={styles.buttonTitle}>{button.title}</Text>
              <Text style={styles.instructions}>{button.instructions}</Text>
            </View>
            <View style={styles.iconContainer}>{button.icon}</View>
          </View>
        </TouchableOpacity>
      ))}
    </LinearGradient>
    </ScrollView>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: windowWidth * 0.05,
    paddingBottom: windowHeight * 0.05,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: windowHeight * 0.04,
  },
  title: {
    fontSize: windowWidth * 0.1,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionsContainer: {
    marginTop: windowHeight * 0.02,
    padding: windowWidth * 0.05,
    justifyContent:'center'
  },
  borderContainer: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    backgroundColor: 'transparent',
    padding: windowWidth * 0.02,
  },
  instructionsText: {
    color: 'white',
    fontSize: windowWidth * 0.04,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: windowWidth * 0.02,
    marginVertical: windowHeight * 0.01,
    width: '100%', // Ocupa el ancho completo de la pantalla
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  textContainer: {
    flex: 1,
    marginRight: windowWidth * 0.09,
    fontFamily:'Roboto',
    justifyContent:'center'
  },
  buttonTitle: {
    color: 'black',
    fontSize: windowWidth * 0.05,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    marginBottom: windowHeight * 0.01,
    // Quitar estas líneas
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  instructions: {
    color: 'black',
    fontSize: windowWidth * 0.035,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    textAlign: 'justify', // Añadir esta línea para justificar el texto
  },
  iconContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});

export default ModoProfesionalScreen;
