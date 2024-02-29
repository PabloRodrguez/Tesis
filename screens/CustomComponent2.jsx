import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CustomComponent2 = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#FF6347', '#778899', '#000000']} style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Desafíos de Ruleta</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.genericButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Desafio')}
        >
          <Feather name="plus" size={windowWidth * 0.12} color="tomato" />
          <Text style={styles.buttonText}>Crear desafíos de ruleta</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.genericButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditarDesafios')}
        >
          <FontAwesome name="pencil" size={windowWidth * 0.12} color="tomato" />
          <Text style={styles.buttonText}>Editar desafíos de ruleta</Text>
        </TouchableOpacity>
      </View>

      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centra verticalmente
    paddingHorizontal: windowWidth * 0.05,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: windowHeight * 0.05, // Ajusta el espacio entre el título y los botones
  },
  title: {
    fontSize: windowWidth * 0.1,
    fontWeight: 'bold',
    color: 'white',
    fontFamily:'Roboto'
  },
  buttonContainer: {
    alignItems: 'center', // Centra horizontalmente
  },
  genericButton: {
    backgroundColor: 'white',
    width: windowWidth * 0.45,
    height: windowHeight * 0.20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: windowWidth * 0.08,
    marginBottom: windowHeight * 0.03, // Espacio entre los botones
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
});

export default CustomComponent2;
