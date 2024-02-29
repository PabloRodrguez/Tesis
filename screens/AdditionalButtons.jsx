import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const AdditionalButtons = ({ route }) => {
  const { themeColor } = route.params;

  const backgroundColor = `${themeColor}80`; // Añade opacidad al color

  const styles = StyleSheet.create({
    additionalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    secondaryButton: {
      backgroundColor: backgroundColor,
      padding: 5,
      borderRadius: 5,
    },
    secondaryButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.additionalButtons}>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {/* Acción para crear preguntas */}}
      >
        <Text style={styles.secondaryButtonText}>Crear</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {/* Acción para editar preguntas */}}
      >
        <Text style={styles.secondaryButtonText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdditionalButtons;
