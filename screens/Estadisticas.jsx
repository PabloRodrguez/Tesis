import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getFirestore, collection, query, getDocs, where } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { auth } from '../firebaseConfig'; // Importa tu objeto de autenticación
import { db } from '../firebaseConfig'; // Importa tu instancia de Firestore

function Estadisticas() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [skillPoints, setSkillPoints] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const uid = auth.currentUser.uid; // Asegúrate de que el usuario esté autenticado

      try {
        // Obtener puntos totales del usuario desde la colección "Resultados"
        const resultadosCollection = collection(db, 'Resultados');
        const resultadosQuery = query(resultadosCollection, where('userId', '==', uid));
        const resultadosSnapshot = await getDocs(resultadosQuery);

        let totalPoints = 0;

        resultadosSnapshot.forEach((doc) => {
          const resultado = doc.data();
          totalPoints += resultado.puntos;
        });

        setTotalPoints(totalPoints);
      } catch (error) {
        console.error("Error al obtener resultados del usuario:", error);
      }

      try {
        // Obtener puntos por habilidad social desde la colección "PuntosxHabilidad"
        const puntosHabilidadCollection = collection(db, 'PuntosxHabilidad');
        const puntosHabilidadQuery = query(puntosHabilidadCollection, where('userId', '==', uid));
        const puntosHabilidadSnapshot = await getDocs(puntosHabilidadQuery);

        let skillPointsData = {};

        puntosHabilidadSnapshot.forEach((doc) => {
          const puntosHabilidad = doc.data();
          const { habilidadSocial, puntos } = puntosHabilidad;
          skillPointsData[habilidadSocial] = (skillPointsData[habilidadSocial] || 0) + puntos;
        });

        setSkillPoints(skillPointsData);
      } catch (error) {
        console.error("Error al obtener puntos por habilidad social:", error);
      }
    };

    fetchStats();
  }, []);

  // Función que renderiza la habilidad individualmente
  function renderSkill(skillName, color, points) {
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.skillTitle}>{skillName}</Text>
        <Text style={styles.pointsText}>{points} puntos</Text>
        <View style={styles.progressBarContainer}>
          <View style={{ ...styles.progressBarFill, backgroundColor: color, width: `${(points / totalPoints) * 100}%` }}></View>
        </View>
        <View style={styles.medalContainer}>
          <FontAwesome name="trophy" size={24} color={color} />
          <Text style={{ ...styles.medalsTitle, marginLeft: 10 }}>Puntos por habilidad</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView>
      <LinearGradient colors={['#8A2BE2', '#FFFFFF']} style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Tus Resultados</Text>
          <Text style={styles.totalPointsText}>Puntos Totales: {totalPoints}</Text>
        </View>

        {/* Verifica que skillPoints no sea null antes de intentar renderizar las habilidades */}
        {Object.keys(skillPoints).length > 0 && (
          <>
            {renderSkill('Empatía', '#9400D3', skillPoints.empatia || 0)}
            {renderSkill('Sarcasmo', '#FF8C00', skillPoints.sarcasmo || 0)}
            {renderSkill('Inteligencia Emocional', '#1E90FF', skillPoints.inteligencia_emocional || 0)}
            {renderSkill('Comportamiento en Sociedad', '#32CD32', skillPoints.comportamiento_sociedad || 0)}
          </>
        )}
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalPointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginBottom: 10,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  medalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  medalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default Estadisticas;
