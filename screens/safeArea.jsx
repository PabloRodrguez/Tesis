import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, where, query } from 'firebase/firestore';
import { auth } from '../firebaseConfig'; // Asegúrate de importar tu objeto de autenticación
import { db } from '../firebaseConfig'; // Asegúrate de importar tu instancia de Firestore

const DiaryEntry = () => {
  const [emotion, setEmotion] = useState('');
  const [theme, setTheme] = useState('');
  const [text, setText] = useState('');
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const loadEntriesFromFirebase = async () => {
      try {
        const user = auth.currentUser;
        const diaryCollection = collection(db, 'diario');
        const entriesQuery = query(diaryCollection, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(entriesQuery);
        const loadedEntries = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEntries(loadedEntries);
      } catch (error) {
        console.error('Error fetching entries from Firebase:', error);
      }
    };

    loadEntriesFromFirebase();
  }, []);

  const handleSaveEntry = async () => {
    try {
      const user = auth.currentUser;
      const newEntry = {
        emotion,
        theme,
        text,
        date: new Date().toLocaleString(),
        userId: user.uid,
      };

      // Guardar la nueva entrada en Firebase
      const docRef = await addDoc(collection(db, 'diario'), newEntry);

      // Recargar las entradas desde Firebase
      const entriesQuery = query(collection(db, 'diario'), where('userId', '==', user.uid));
      const updatedEntries = await getDocs(entriesQuery);
      const updatedEntriesData = updatedEntries.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(updatedEntriesData);

      // Reiniciar los campos después de guardar la entrada
      setEmotion('');
      setTheme('');
      setText('');
    } catch (error) {
      console.error('Error saving entry to Firebase:', error);
    }
  };

  const handleDeleteEntry = async (entry) => {
    try {
      const user = auth.currentUser;
      if (entry.userId === user.uid) {
        await deleteDoc(doc(db, 'diario', entry.id));

        const entriesQuery = query(collection(db, 'diario'), where('userId', '==', user.uid));
        const updatedEntries = await getDocs(entriesQuery);
        const updatedEntriesData = updatedEntries.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEntries(updatedEntriesData);
      } else {
        console.warn('No tienes permisos para eliminar esta entrada.');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const renderEntryItem = ({ item }) => (
    <View style={styles.entryItem}>
      <Text style={styles.entryText}>{item.date}</Text>
      <Text style={styles.entryText}>Emoción: {item.emotion}</Text>
      <Text style={styles.entryText}>Tema: {item.theme}</Text>
      <Text style={styles.entryText}>Texto: {item.text}</Text>
      <Button title="Eliminar" onPress={() => handleDeleteEntry(item)} color="#FF0000" style={styles.deleteButton} />
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/Background.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={[styles.label, styles.title]}>Diario</Text>
        </View>
        <Text style={[styles.label, styles.titlepicker]}>Emoción:</Text>
        <Picker
          selectedValue={emotion}
          onValueChange={(value) => setEmotion(value)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Selecciona una emoción" value={null} />
          <Picker.Item label="Feliz" value="feliz" />
          <Picker.Item label="Triste" value="triste" />
          <Picker.Item label="Enojado" value="enojado" />
          <Picker.Item label="Ansioso" value="ansioso" />
          <Picker.Item label="Estresado" value="estresado" />
          <Picker.Item label="Cansado" value="cansado" />
        </Picker>

        <Text style={[styles.label, styles.titlepicker]}>Tema:</Text>
        <Picker
          selectedValue={theme}
          onValueChange={(value) => setTheme(value)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Selecciona un tema" value={null} />
          <Picker.Item label="Personal" value="personal" />
          <Picker.Item label="Universidad" value="universidad" />
          <Picker.Item label="Familia" value="familia" />
          <Picker.Item label="Amigos" value="amigos" />
          <Picker.Item label="Pareja" value="pareja" />
          <Picker.Item label="Otros" value="otros" />
        </Picker>
        <Text style={[styles.label, styles.textInputLabel]}>Texto:</Text>
        <TextInput
          style={[styles.textInput, { color: 'black' }]}
          multiline
          onChangeText={(text) => setText(text)}
          value={text}
        />

        <Button
          title="Guardar"
          onPress={handleSaveEntry}
          color="#00CED1"
          style={styles.saveButton}
        />

        <FlatList
          data={entries}
          keyExtractor={(item) => item.date}
          renderItem={renderEntryItem}
          style={styles.entryList}
        />
      </View>
    </ImageBackground>
  );

};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    padding: 20,
    marginTop: 50,
  },
  label: {
    color: 'white',
    marginBottom: 5,
  },
  picker: {
    inputIOS: {
      color: 'black',
      backgroundColor: 'white',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
    inputAndroid: {
      color: 'black',
      backgroundColor: 'white',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
  },
  textInputLabel: {
    marginTop: 10,
  },
  textInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  entryList: {
    marginTop: 20,
  },
  entryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 40,
    fontWeight: 'bold',
  },
  titlepicker: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  saveButton: {
    alignSelf: 'flex-end', // Align the button to the right
    borderRadius: 8,
  },
  deleteButton: {
    borderRadius: 8,
  },
  entryText: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
});

export default DiaryEntry;
