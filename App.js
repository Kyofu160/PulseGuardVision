import React from 'react';

import {
  View,
  Text,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';

import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  StatusBar,
} from 'expo-status-bar';

import * as SystemUI from 'expo-system-ui';

import * as NavigationBar from 'expo-navigation-bar';

import PaginaUm from './PaginaUm';
import PaginaDois from './PaginaDois';
import PaginaTres from './PaginaTres';

import {
  HorariosProvider,
  useHorarios,
} from './HorariosContext';


// =============================================
// NAVEGAÇÃO
// =============================================

const Tab =
  createBottomTabNavigator();


// =============================================
// ESPAÇO SEGURO SOMENTE NO TOPO
// =============================================

function TelaComTopoSeguro({
  children,
  corFundo,
}) {

  return (

    <View
      style={{
        flex: 1,

        backgroundColor:
          corFundo,

        paddingTop:
          Platform.OS === 'android'
            ? RNStatusBar.currentHeight || 0
            : 0,
      }}
    >

      {children}

    </View>

  );

}


// =============================================
// PLANNER
// =============================================

function TelaPlanner() {

  const {
    tema,
  } = useHorarios();


  return (

    <TelaComTopoSeguro
      corFundo={
        tema.fundo
      }
    >

      <PaginaUm />

    </TelaComTopoSeguro>

  );

}


// =============================================
// COMPARTIMENTOS
// =============================================

function TelaCompartimentos() {

  const {
    tema,
  } = useHorarios();


  return (

    <TelaComTopoSeguro
      corFundo={
        tema.fundo
      }
    >

      <PaginaDois />

    </TelaComTopoSeguro>

  );

}


// =============================================
// DEMONSTRAÇÃO
// =============================================

function TelaDemonstracao() {

  const {
    tema,
  } = useHorarios();


  return (

    <TelaComTopoSeguro
      corFundo={
        tema.fundo
      }
    >

      <PaginaTres />

    </TelaComTopoSeguro>

  );

}


// =============================================
// NAVEGADOR
// =============================================

function Navegacao() {

  const {
    tema,
    modoEscuro,
  } = useHorarios();


  // ===========================================
  // SINCRONIZAR TEMA COM O ANDROID
  // ===========================================

  React.useEffect(() => {

    async function atualizarSistema() {

      try {

        // =====================================
        // FUNDO NATIVO DO APLICATIVO
        // =====================================

        await SystemUI.setBackgroundColorAsync(
          tema.fundo
        );


        // =====================================
        // BOTÕES DA NAVEGAÇÃO ANDROID
        // =====================================
        //
        // Em celulares com os três botões,
        // eles ficam claros no tema escuro
        // e escuros no tema claro.
        //
        // Em navegação por gestos, o Android
        // controla parte da aparência sozinho.
        // =====================================

        if (
          Platform.OS === 'android'
        ) {

          await NavigationBar.setButtonStyleAsync(

            modoEscuro
              ? 'light'
              : 'dark'

          );

        }

      } catch (erro) {

        console.log(
          'Erro ao atualizar tema do sistema:',
          erro
        );

      }

    }


    atualizarSistema();

  }, [
    modoEscuro,
    tema.fundo,
  ]);


  // ===========================================
  // TEMA DO REACT NAVIGATION
  // ===========================================

  const temaNavegacao =
    modoEscuro
      ? {
          ...DarkTheme,

          colors: {

            ...DarkTheme.colors,

            background:
              tema.fundo,

            card:
              tema.card,

            text:
              tema.texto,

            border:
              tema.borda,

            primary:
              tema.destaque,

          },

        }
      : {
          ...DefaultTheme,

          colors: {

            ...DefaultTheme.colors,

            background:
              tema.fundo,

            card:
              tema.card,

            text:
              tema.texto,

            border:
              tema.borda,

            primary:
              tema.destaque,

          },

        };


  return (

    <>

      {/* =================================== */}
      {/* BARRA DE STATUS */}
      {/* =================================== */}

      <StatusBar

        style={
          modoEscuro
            ? 'light'
            : 'dark'
        }

        backgroundColor={
          tema.fundo
        }

      />


      <NavigationContainer
        theme={
          temaNavegacao
        }
      >

        <Tab.Navigator

          screenOptions={{

            headerShown: false,


            // =================================
            // BARRA INFERIOR DO APP
            // =================================

            tabBarStyle: {

              backgroundColor:
                tema.card,

              borderTopColor:
                tema.borda,

              borderTopWidth: 1,

              paddingTop: 7,

            },


            // =================================
            // CORES DAS ABAS
            // =================================

            tabBarActiveTintColor:
              tema.destaque,

            tabBarInactiveTintColor:
              tema.textoSecundario,


            // =================================
            // TEXTO
            // =================================

            tabBarLabelStyle: {

              fontSize: 12,

              fontWeight: '600',

            },

          }}

        >

          {/* ================================= */}
          {/* PLANNER */}
          {/* ================================= */}

          <Tab.Screen

            name="Planner"

            component={
              TelaPlanner
            }

            options={{

              tabBarLabel:
                'Planner',

              tabBarIcon: ({
                focused,
              }) => (

                <View
                  style={{
                    opacity:
                      focused
                        ? 1
                        : 0.65,
                  }}
                >

                  <TextIcon

                    texto="⌂"

                    cor={
                      focused
                        ? tema.destaque
                        : tema.textoSecundario
                    }

                  />

                </View>

              ),

            }}

          />


          {/* ================================= */}
          {/* COMPARTIMENTOS */}
          {/* ================================= */}

          <Tab.Screen

            name="Compartimentos"

            component={
              TelaCompartimentos
            }

            options={{

              tabBarLabel:
                'Compartimentos',

              tabBarIcon: ({
                focused,
              }) => (

                <View
                  style={{
                    opacity:
                      focused
                        ? 1
                        : 0.65,
                  }}
                >

                  <TextIcon

                    texto="▦"

                    cor={
                      focused
                        ? tema.destaque
                        : tema.textoSecundario
                    }

                  />

                </View>

              ),

            }}

          />


          {/* ================================= */}
          {/* DEMONSTRAÇÃO */}
          {/* ================================= */}

          <Tab.Screen

            name="Demonstração"

            component={
              TelaDemonstracao
            }

            options={{

              tabBarLabel:
                'Demonstração',

              tabBarIcon: ({
                focused,
              }) => (

                <View
                  style={{
                    opacity:
                      focused
                        ? 1
                        : 0.65,
                  }}
                >

                  <TextIcon

                    texto="⏱"

                    cor={
                      focused
                        ? tema.destaque
                        : tema.textoSecundario
                    }

                  />

                </View>

              ),

            }}

          />

        </Tab.Navigator>

      </NavigationContainer>

    </>

  );

}


// =============================================
// ÍCONES
// =============================================

function TextIcon({
  texto,
  cor,
}) {

  return (

    <Text
      style={{

        fontSize: 23,

        color:
          cor,

        fontWeight:
          '600',

        lineHeight:
          25,

      }}
    >

      {texto}

    </Text>

  );

}


// =============================================
// APP
// =============================================

export default function App() {

  return (

    <HorariosProvider>

      <View
        style={{
          flex: 1,
        }}
      >

        <Navegacao />

      </View>

    </HorariosProvider>

  );

}