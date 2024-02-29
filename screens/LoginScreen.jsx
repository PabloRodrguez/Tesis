import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Modal } from 'react-native';
import { Button } from 'react-native-elements';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import {db, auth} from '../firebaseConfig'; // Asegúrate de que este es el camino correcto al archivo de configuración de Firebase.
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Importación de imágenes, asegúrate de que las rutas son correctas.
import successIcon from '../assets/success_icon.png';
import errorIcon from '../assets/error.png';

// La inicialización de Firebase ya se hace en firebaseConfig.js, así que no es necesario hacerlo de nuevo aquí.


function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const handleCreateAccount = () => {
    console.log('Iniciando proceso de creación de cuenta...');

    // Verifica que el correo electrónico tenga un formato válido.
    if (email.trim() === '' || !email.includes('@')) {
      setErrorMessage('Por favor, introduce un correo electrónico válido.');
      setIsModalVisible(true); // Muestra el modal con el mensaje de error
      console.error('Correo electrónico inválido:', email);
      return;
    }

    console.log('Creando nuevo usuario en Firebase...');
    // Intenta crear un nuevo usuario.
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Usuario creado exitosamente:', userCredential.user);

        // Usuario creado exitosamente, ahora crea el perfil en Firestore.
        const user = userCredential.user;
        if (!user) throw new Error('No se pudo obtener la información del usuario.'); // Lanza un error si el usuario es null.

        // Cierra el modal y borra mensajes de error previos.
        setIsModalVisible(false);
        setErrorMessage('');

        console.log('Creando perfil en Firestore...');
        // Crea el perfil en Firestore.
        return setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          level: 1, // Establece el nivel inicial del usuario.
        });
      })
      .then(() => {
        // Perfil creado exitosamente.
        console.log('Perfil creado exitosamente.');

        setSuccessMessage('Cuenta y perfil creados con éxito.');

        // Espera 2 segundos, luego limpia el mensaje y navega al perfil.
        setTimeout(() => {
          setSuccessMessage('');
          navigation.navigate('Perfil'); // Asegúrate de que 'Perfil' es el nombre correcto de la ruta.
        }, 2000);
      })
      .catch((error) => {
        // Maneja cualquier error que ocurra durante la creación de la cuenta o el perfil.
        setErrorMessage(error.message);
        setIsModalVisible(true); // Muestra el modal con el mensaje de error.

        console.error('Error durante la creación de la cuenta o el perfil:', error);

        // Espera 2 segundos, luego limpia el mensaje de error.
        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
      });
  };

  const handleSignin = () => {
    console.log('Iniciando proceso de inicio de sesión...');

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Inicio de sesión exitoso:', userCredential.user);
        navigation.navigate('Menu');
      })
      .catch(error => {
        console.error('Error durante el inicio de sesión:', error);

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          setErrorMessage('Correo o contraseña inválidos');
        } else {
          setErrorMessage('Error al iniciar sesión. Intente de nuevo.');
        }

        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
      });
  };
  const handlePasswordReset = () => {
    console.log('Iniciando proceso de restablecimiento de contraseña...');
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
      return;
    }

    signInWithEmailAndPassword(auth, resetEmail, password)
      .then(() => {
        updatePassword(auth.currentUser, newPassword).then(() => {
          setIsResetModalVisible(false);
          setSuccessMessage('Contraseña actualizada con éxito. Por favor, inicia sesión de nuevo.');
          setTimeout(() => {
            setSuccessMessage('');
          }, 4000);
        }).catch(error => {
          setIsResetModalVisible(false);
          setErrorMessage('Error al actualizar la contraseña. Intente de nuevo.');
          setTimeout(() => {
            setErrorMessage('');
          }, 2000);
          console.log(error);
        });
      })
      .catch(error => {
        setIsResetModalVisible(false);
        setErrorMessage('Correo no encontrado o contraseña anterior incorrecta.');
        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
        console.log(error);
      });
  };


  return (
    <View style={styles.container}>
    {/* Esto garantiza que los mensajes se muestren encima de otros elementos */}
    {successMessage !== '' && (
      <View style={[styles.messageContainer, { zIndex: 1 }]}>
        <Image source={successIcon} style={styles.successIcon} />
        <Text style={styles.successText}>{successMessage}</Text>
      </View>
    )}
  
    {errorMessage !== '' && (
      <View style={[styles.messageContainer, { zIndex: 1 }]}>
        <Image source={errorIcon} style={styles.errorIcon} />
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['white', 'snow']} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Crear cuenta</Text>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              placeholder="Nombre"
              style={styles.input}
            />
            <Text style={styles.label}>Correo Electrónico:</Text>
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholder="Correo electrónico"
              style={styles.input}
            />
            <Text style={styles.label}>Contraseña:</Text>
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholder="Contraseña"
              style={styles.input}
              secureTextEntry
            />
            <Button
              title="Registrar"
              onPress={handleCreateAccount}
              buttonStyle={styles.loginButton}
            />
            <Button
              title="Cancelar"
              onPress={() => setIsModalVisible(false)}
              buttonStyle={styles.cancelButton}
            />
          </LinearGradient>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isResetModalVisible}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['white', 'snow']} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Restablecer Contraseña</Text>
            <Text style={styles.label}>Correo Electrónico:</Text>
            <TextInput
              value={resetEmail}
              onChangeText={(text) => setResetEmail(text)}
              placeholder="Correo electrónico"
              style={styles.input}
            />
            <Text style={styles.label}>Nueva Contraseña:</Text>
            <TextInput
              value={newPassword}
              onChangeText={(text) => setNewPassword(text)}
              placeholder="Nueva Contraseña"
              style={styles.input}
              secureTextEntry
            />
            <Text style={styles.label}>Confirmar Contraseña:</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              placeholder="Confirmar Contraseña"
              style={styles.input}
              secureTextEntry
            />
            <Button
              title="Restablecer Contraseña"
              onPress={handlePasswordReset}
              buttonStyle={styles.loginButton}
            />
            <Button
              title="Cancelar"
              onPress={() => setIsResetModalVisible(false)}
              buttonStyle={styles.cancelButton}
            />
          </LinearGradient>
        </View>
      </Modal>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo_login.png')} style={styles.logo} />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
          placeholder="Ingresa tu correo electrónico"
        />
        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          placeholder="Ingresa tu contraseña"
          secureTextEntry
        />
        <Button
          title="Iniciar Sesión"
          onPress={handleSignin}
          buttonStyle={styles.loginButton}
        />
        <Button
          title="Crear cuenta"
          onPress={() => setIsModalVisible(true)}
          buttonStyle={{...styles.loginButton, backgroundColor: '#01B2EB'}}
        />
      <Button
        title="Olvidaste tu contraseña?"
        onPress={() => setIsResetModalVisible(true)}
        buttonStyle={styles.forgotPasswordButton}
        titleStyle={styles.forgotPasswordButtonText}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#01B2EB',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    marginTop: -20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  input: {
    fontSize: 16,
    padding: 10,
    marginBottom: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'gray',
  },
  loginButton: {
    backgroundColor: 'limegreen',
    borderRadius: 25,
    marginTop: 10,
    alignSelf: 'center',
    width: 200,
  },
  forgotPasswordButton: {
    backgroundColor: '',
    borderRadius: 25,
    marginTop: 10,
    fontWeight: 'bold',
  },
  forgotPasswordButtonText: {
    color: 'black',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'red',
    borderRadius: 25,
    marginTop: 10,
    alignSelf: 'center',
    width: 200,
  },
  messageContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    zIndex: 1,  // Asegurándonos de que esté encima de otros elementos
  },
  successIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  successText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
