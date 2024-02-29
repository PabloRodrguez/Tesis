import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from '../screens/Home';
import LoginScreen from '../screens/LoginScreen';
import Menu from '../screens/Menu';
import CustomDrawerContent from "./CustomDrawerContent";
import ProfileScreen from '../screens/ProfileScreen';
import CrearJuegoScreen from '../screens/CrearJuegoScreen';
import AdminPreguntasScreen from '../screens/AdminPreguntasScreen';
import EditarPreguntaScreen from '../screens/EditarPreguntaScreen';
import RuletaScreen from '../screens/Ruleta';
import AvatarSelector from '../screens/AvatarSelector';
import Estadisticas from '../screens/Estadisticas';
import UserViewScreen from '../screens/UserViewScreen';
import QuestionView from '../screens/QuestionView';
import CrearDesafioScreen from '../screens/CrearDesafioScreen';
import DesafiosAceptadosScreen from '../screens/DesafiosAceptadosScreen';
import IdeasScreen from '../screens/IdeasScreen';
import CrearOpcionesScreen from '../screens/CrearOpcionesScreen';
import ListaIdeas from '../screens/Lista';
import UnirIdeasGame from '../screens/UnirIdeasGame';
import DiaryEntry from '../screens/safeArea';
import Jukebox from '../screens/jukebox';
import ModoProfesionalScreen from '../screens/ModoProfesionalScreen';
import AdditionalButtons from '../screens/AdditionalButtons';
import CustomComponent from '../screens/CustomComponent';
import CustomComponent2 from '../screens/CustomComponent2';
import CustomComponent3 from '../screens/CustomComponent3';
import AdminDesafiosScreen from '../screens/AdminDesafios';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen name="Perfil" component={ProfileScreen} />
      <Stack.Screen name="CrearJuego" component={CrearJuegoScreen} />
      <Stack.Screen name="MisPreguntas" component={AdminPreguntasScreen} />
      <Stack.Screen name="Editar" component={EditarPreguntaScreen} />
      <Stack.Screen name="Ruleta" component={RuletaScreen} />
      <Stack.Screen name="Avatar" component={AvatarSelector} />
      <Stack.Screen name="Estadisticas" component={Estadisticas} />
      <Stack.Screen name="UserView" component={UserViewScreen} />
      <Stack.Screen name="Qview" component={QuestionView} />
      <Stack.Screen name="Desafio" component={CrearDesafioScreen} />
      <Stack.Screen name="DesafioAceptado" component={DesafiosAceptadosScreen} />
      <Stack.Screen name="Ideas" component={IdeasScreen} />
      <Stack.Screen name="Opciones" component={CrearOpcionesScreen} />
      <Stack.Screen name="Lista" component={ListaIdeas} />
      <Stack.Screen name="Unir" component={UnirIdeasGame} />
      <Stack.Screen name="Diario" component={DiaryEntry} />
      <Stack.Screen name="juke" component={Jukebox} />
      <Stack.Screen name="m_profesional" component={ModoProfesionalScreen} />
      <Stack.Screen name="boton" component={CustomComponent} />
      <Stack.Screen name="boton2" component={CustomComponent2} />
      <Stack.Screen name="boton3" component={CustomComponent3} />
      <Stack.Screen name="EditarDesafios" component={AdminDesafiosScreen} />



    </Stack.Navigator>
  );
}

function AppNavigator() {
  return (
    <Drawer.Navigator 
      drawerContent={props => <CustomDrawerContent {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="HomeDrawer" component={AuthStack} />
      {/* Otros screens que quieras agregar al Drawer */}
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
