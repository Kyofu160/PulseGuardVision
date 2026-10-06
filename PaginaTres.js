import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

import {
  useHorarios,
} from './HorariosContext';

import * as ArduinoBridge from './ArduinoBridge';


const {
  COMANDOS,
  enviarComandoArduino,
} = ArduinoBridge;


// =============================================
// PÁGINA DE DEMONSTRAÇÃO
// =============================================

export default function PaginaTres() {

  const {
    tema,
  } = useHorarios();


  // ===========================================
  // TEMPO
  // ===========================================

  const [minutosInput, setMinutosInput] =
    useState('0');

  const [segundosInput, setSegundosInput] =
    useState('10');

  const [tempoTotal, setTempoTotal] =
    useState(10);

  const [tempoRestante, setTempoRestante] =
    useState(10);

  const [rodando, setRodando] =
    useState(false);


  // ===========================================
  // ESTADO DO ARDUINO
  // ===========================================

  const [arduinoAtivo, setArduinoAtivo] =
    useState(false);

  const [ledLigado, setLedLigado] =
    useState(false);

  const [buzzerLigado, setBuzzerLigado] =
    useState(false);

  const [vibradorLigado, setVibradorLigado] =
    useState(false);


  // ===========================================
  // BLUETOOTH
  // ===========================================

  const [bluetoothReal, setBluetoothReal] =
    useState(false);

  const [
    conectandoBluetooth,
    setConectandoBluetooth,
  ] =
    useState(false);

  const [
    mensagemBluetooth,
    setMensagemBluetooth,
  ] =
    useState(
      'HC-05 não conectado'
    );


  // ===========================================
  // REFERÊNCIAS
  // ===========================================

  const intervaloLed =
    useRef(null);

  const timeoutAlerta =
    useRef(null);


  // ===========================================
  // FORMATAR TEMPO
  // ===========================================

  function formatarTempo(segundos) {

    const minutos =
      Math.floor(
        segundos / 60
      );

    const segundosRestantes =
      segundos % 60;


    return (
      String(minutos)
        .padStart(2, '0') +
      ':' +
      String(segundosRestantes)
        .padStart(2, '0')
    );

  }


  // ===========================================
  // ATUALIZAR STATUS BLUETOOTH
  // ===========================================

  function atualizarStatusBluetooth(
    resultado
  ) {

    if (!resultado) {
      return;
    }


    if (
      resultado.simulado === false ||
      resultado.conectado === true
    ) {

      setBluetoothReal(true);

      setMensagemBluetooth(
        'Comunicação Bluetooth ativa'
      );

      return;

    }


    setBluetoothReal(false);

    setMensagemBluetooth(
      resultado.message ||
      'HC-05 não conectado'
    );

  }


  // ===========================================
  // DESLIGAR SIMULAÇÃO
  // ===========================================

  function desligarSimulacao() {

    if (
      intervaloLed.current
    ) {

      clearInterval(
        intervaloLed.current
      );

      intervaloLed.current =
        null;

    }


    if (
      timeoutAlerta.current
    ) {

      clearTimeout(
        timeoutAlerta.current
      );

      timeoutAlerta.current =
        null;

    }


    setArduinoAtivo(false);

    setLedLigado(false);

    setBuzzerLigado(false);

    setVibradorLigado(false);

  }


  // ===========================================
  // ATIVAR SIMULAÇÃO VISUAL
  // ===========================================

  function iniciarSimulacaoVisual() {

    if (
      intervaloLed.current
    ) {

      clearInterval(
        intervaloLed.current
      );

    }


    if (
      timeoutAlerta.current
    ) {

      clearTimeout(
        timeoutAlerta.current
      );

    }


    setArduinoAtivo(true);

    setLedLigado(true);

    setBuzzerLigado(true);

    setVibradorLigado(true);


    // LED piscando

    intervaloLed.current =
      setInterval(() => {

        setLedLigado(
          anterior =>
            !anterior
        );

      }, 400);


    // Desliga após 4 segundos

    timeoutAlerta.current =
      setTimeout(() => {

        desligarSimulacao();

      }, 4000);

  }


  // ===========================================
  // ATIVAR ARDUINO
  // ===========================================
  //
  // Só permite criar conexão quando:
  //
  // permitirConexao = true
  //
  // Isso acontece somente ao clicar em
  // "Ativar Arduino agora".
  //
  // O cronômetro chama com false.
  // ===========================================

  async function ativarArduino(
    permitirConexao = true
  ) {

    iniciarSimulacaoVisual();


    try {

      if (
        permitirConexao &&
        !bluetoothReal
      ) {

        setMensagemBluetooth(
          'Tentando conectar ao HC-05...'
        );

      }


      const resultado =
        await enviarComandoArduino(
          COMANDOS.ALERTA_COMPLETO,
          permitirConexao
        );


      atualizarStatusBluetooth(
        resultado
      );


      console.log(
        'Resultado Arduino:',
        resultado
      );

    } catch (erro) {

      console.log(
        'Erro ao ativar Arduino:',
        erro
      );


      setBluetoothReal(false);

      setMensagemBluetooth(
        'Falha na comunicação. Simulação ativa.'
      );

    }

  }


  // ===========================================
  // CONECTAR / DESCONECTAR HC-05
  // ===========================================

  async function alternarConexaoHC05() {

    if (
      conectandoBluetooth
    ) {

      return;

    }


    setConectandoBluetooth(true);


    try {

      // =======================================
      // DESCONECTAR
      // =======================================

      if (bluetoothReal) {

        if (
          typeof ArduinoBridge.desconectarHC05 ===
          'function'
        ) {

          const resultado =
            await ArduinoBridge
              .desconectarHC05();


          console.log(
            'Resultado desconexão HC-05:',
            resultado
          );

        }


        setBluetoothReal(false);

        setMensagemBluetooth(
          'HC-05 desconectado.'
        );


        return;

      }


      // =======================================
      // CONECTAR
      // =======================================

      if (
        typeof ArduinoBridge.conectarHC05 !==
        'function'
      ) {

        setBluetoothReal(false);

        setMensagemBluetooth(
          'Bluetooth real indisponível nesta plataforma.'
        );


        return;

      }


      setMensagemBluetooth(
        'Conectando ao HC-05...'
      );


      const resultado =
        await ArduinoBridge
          .conectarHC05();


      if (
        resultado &&
        resultado.ok &&
        resultado.simulado === false
      ) {

        setBluetoothReal(true);

        setMensagemBluetooth(
          'Comunicação Bluetooth ativa'
        );

      } else {

        setBluetoothReal(false);

        setMensagemBluetooth(
          resultado?.message ||
          'Não foi possível conectar ao HC-05.'
        );

      }


      console.log(
        'Resultado conexão HC-05:',
        resultado
      );

    } catch (erro) {

      console.log(
        'Erro ao alterar conexão HC-05:',
        erro
      );


      setBluetoothReal(false);

      setMensagemBluetooth(
        'Não foi possível conectar ao HC-05.'
      );

    } finally {

      setConectandoBluetooth(false);

    }

  }


  // ===========================================
  // PARAR ARDUINO
  // ===========================================

  async function pararArduino() {

    desligarSimulacao();


    try {

      const resultado =
        await enviarComandoArduino(
          COMANDOS.PARAR_TUDO,
          false
        );


      atualizarStatusBluetooth(
        resultado
      );


      console.log(
        'Resultado parar Arduino:',
        resultado
      );

    } catch (erro) {

      console.log(
        'Erro ao parar Arduino:',
        erro
      );

    }

  }


  // ===========================================
  // CRONÔMETRO
  // ===========================================

  useEffect(() => {

    if (!rodando) {
      return;
    }


    if (
      tempoRestante <= 0
    ) {

      setRodando(false);


      // Não cria conexão automaticamente.
      // Se já estiver conectado, envia.
      // Senão fica em simulação.

      ativarArduino(false);

      return;
    }


    const timer =
      setTimeout(() => {

        setTempoRestante(
          anterior =>
            Math.max(
              anterior - 1,
              0
            )
        );

      }, 1000);


    return () => {

      clearTimeout(timer);

    };

  }, [
    rodando,
    tempoRestante,
  ]);


  // ===========================================
  // LIMPEZA
  // ===========================================

  useEffect(() => {

    return () => {

      if (
        intervaloLed.current
      ) {

        clearInterval(
          intervaloLed.current
        );

      }


      if (
        timeoutAlerta.current
      ) {

        clearTimeout(
          timeoutAlerta.current
        );

      }

    };

  }, []);


  // ===========================================
  // APLICAR TEMPO
  // ===========================================

  function aplicarTempo() {

    let minutos =
      parseInt(
        minutosInput,
        10
      );

    let segundos =
      parseInt(
        segundosInput,
        10
      );


    if (
      Number.isNaN(minutos)
    ) {

      minutos = 0;

    }


    if (
      Number.isNaN(segundos)
    ) {

      segundos = 0;

    }


    minutos =
      Math.max(
        minutos,
        0
      );

    segundos =
      Math.max(
        segundos,
        0
      );


    const total =
      (
        minutos * 60
      ) +
      segundos;


    setTempoTotal(
      total
    );

    setTempoRestante(
      total
    );

    setRodando(false);

  }


  // ===========================================
  // TEMPOS RÁPIDOS
  // ===========================================

  function aplicarAtalho(segundos) {

    setTempoTotal(
      segundos
    );

    setTempoRestante(
      segundos
    );

    setRodando(false);


    const minutos =
      Math.floor(
        segundos / 60
      );

    const resto =
      segundos % 60;


    setMinutosInput(
      String(minutos)
    );

    setSegundosInput(
      String(resto)
    );

  }


  // ===========================================
  // ZERAR
  // ===========================================

  function zerarCronometro() {

    setRodando(false);

    setTempoRestante(
      tempoTotal
    );

  }


  // ===========================================
  // PROGRESSO
  // ===========================================

  const progresso =
    tempoTotal > 0
      ? tempoRestante /
        tempoTotal
      : 0;


  // ===========================================
  // INTERFACE
  // ===========================================

  return (

    <ScrollView

      style={[
        styles.scrollView,
        {
          backgroundColor:
            tema.fundo,
        },
      ]}

      contentContainerStyle={
        styles.scrollConteudo
      }

      keyboardShouldPersistTaps="handled"

    >

      {/* =================================== */}
      {/* CABEÇALHO */}
      {/* =================================== */}

      <Text
        style={[
          styles.titulo,
          {
            color:
              tema.texto,
          },
        ]}
      >

        Demonstração

      </Text>


      <Text
        style={[
          styles.subtitulo,
          {
            color:
              tema.textoSecundario,
          },
        ]}
      >

        Teste do alerta do dispensador

      </Text>


      {/* =================================== */}
      {/* ESTADO DO ARDUINO */}
      {/* =================================== */}

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              tema.card,

            borderColor:
              tema.borda,
          },
        ]}
      >

        <Text
          style={[
            styles.tituloCard,
            {
              color:
                tema.texto,
            },
          ]}
        >

          Estado do Arduino

        </Text>


        {/* ================================= */}
        {/* CÍRCULOS */}
        {/* ================================= */}

        <View
          style={
            styles.componentesLinha
          }
        >

          {/* LED */}

          <View
            style={
              styles.componente
            }
          >

            <View
              style={[
                styles.circuloComponente,
                {
                  backgroundColor:
                    ledLigado
                      ? tema.destaque
                      : tema.fundo,

                  borderColor:
                    ledLigado
                      ? tema.destaque
                      : tema.borda,
                },
              ]}
            >

              <Text
                style={
                  styles.iconeCirculo
                }
              >

                💡

              </Text>

            </View>


            <Text
              style={[
                styles.nomeComponente,
                {
                  color:
                    tema.texto,
                },
              ]}
            >

              LED

            </Text>


            <Text
              style={[
                styles.estadoComponente,
                {
                  color:
                    ledLigado
                      ? '#22C55E'
                      : tema.textoSecundario,
                },
              ]}
            >

              {
                ledLigado
                  ? 'Ativo'
                  : 'Desligado'
              }

            </Text>

          </View>


          {/* BUZZER */}

          <View
            style={
              styles.componente
            }
          >

            <View
              style={[
                styles.circuloComponente,
                {
                  backgroundColor:
                    buzzerLigado
                      ? tema.destaque
                      : tema.fundo,

                  borderColor:
                    buzzerLigado
                      ? tema.destaque
                      : tema.borda,
                },
              ]}
            >

              <Text
                style={
                  styles.iconeCirculo
                }
              >

                🔊

              </Text>

            </View>


            <Text
              style={[
                styles.nomeComponente,
                {
                  color:
                    tema.texto,
                },
              ]}
            >

              Buzzer

            </Text>


            <Text
              style={[
                styles.estadoComponente,
                {
                  color:
                    buzzerLigado
                      ? '#22C55E'
                      : tema.textoSecundario,
                },
              ]}
            >

              {
                buzzerLigado
                  ? 'Ativo'
                  : 'Desligado'
              }

            </Text>

          </View>


          {/* VIBRAÇÃO */}

          <View
            style={
              styles.componente
            }
          >

            <View
              style={[
                styles.circuloComponente,
                {
                  backgroundColor:
                    vibradorLigado
                      ? tema.destaque
                      : tema.fundo,

                  borderColor:
                    vibradorLigado
                      ? tema.destaque
                      : tema.borda,
                },
              ]}
            >

              <Text
                style={
                  styles.iconeCirculo
                }
              >

                📳

              </Text>

            </View>


            <Text
              style={[
                styles.nomeComponente,
                {
                  color:
                    tema.texto,
                },
              ]}
            >

              Vibração

            </Text>


            <Text
              style={[
                styles.estadoComponente,
                {
                  color:
                    vibradorLigado
                      ? '#22C55E'
                      : tema.textoSecundario,
                },
              ]}
            >

              {
                vibradorLigado
                  ? 'Ativo'
                  : 'Desligado'
              }

            </Text>

          </View>

        </View>


        {/* ================================= */}
        {/* STATUS */}
        {/* ================================= */}

        <View
          style={[
            styles.statusArduino,
            {
              backgroundColor:
                tema.fundo,

              borderColor:
                tema.borda,
            },
          ]}
        >

          <View
            style={[
              styles.bolinhaStatus,
              {
                backgroundColor:
                  arduinoAtivo
                    ? '#22C55E'
                    : tema.textoSecundario,
              },
            ]}
          />


          <Text
            style={[
              styles.textoStatusArduino,
              {
                color:
                  tema.texto,
              },
            ]}
          >

            {
              arduinoAtivo
                ? 'Arduino ativo'
                : 'Arduino aguardando'
            }

          </Text>

        </View>


        {/* ================================= */}
        {/* ATIVAR ARDUINO */}
        {/* ================================= */}

        <TouchableOpacity

          style={[
            styles.botaoArduino,
            {
              backgroundColor:
                arduinoAtivo
                  ? tema.alerta
                  : tema.destaque,
            },
          ]}

          onPress={
            arduinoAtivo
              ? pararArduino
              : () =>
                  ativarArduino(true)
          }

        >

          <Text
            style={
              styles.textoBotaoPrincipal
            }
          >

            {
              arduinoAtivo
                ? 'Parar Arduino'
                : 'Ativar Arduino agora'
            }

          </Text>

        </TouchableOpacity>


        {/* ================================= */}
        {/* BLUETOOTH */}
        {/* ================================= */}

        <View
          style={[
            styles.bluetoothManual,
            {
              borderTopColor:
                tema.borda,
            },
          ]}
        >

          <Text
            style={[
              styles.bluetoothTitulo,
              {
                color:
                  tema.texto,
              },
            ]}
          >

            Bluetooth

          </Text>


          <View
            style={
              styles.bluetoothStatusLinha
            }
          >

            <View
              style={[
                styles.bolinhaStatus,
                {
                  backgroundColor:
                    bluetoothReal
                      ? '#22C55E'
                      : tema.textoSecundario,
                },
              ]}
            />


            <View
              style={{
                flex: 1,
              }}
            >

              <Text
                style={[
                  styles.bluetoothStatusTitulo,
                  {
                    color:
                      tema.texto,
                  },
                ]}
              >

                {
                  bluetoothReal
                    ? 'HC-05 conectado'
                    : 'HC-05 desconectado'
                }

              </Text>


              <Text
                style={[
                  styles.bluetoothDescricao,
                  {
                    color:
                      tema.textoSecundario,
                  },
                ]}
              >

                {
                  mensagemBluetooth
                }

              </Text>

            </View>

          </View>


          <TouchableOpacity

            style={[
              styles.botaoConexao,
              {
                backgroundColor:
                  bluetoothReal
                    ? tema.alerta
                    : tema.destaque,

                opacity:
                  conectandoBluetooth
                    ? 0.65
                    : 1,
              },
            ]}

            disabled={
              conectandoBluetooth
            }

            onPress={
              alternarConexaoHC05
            }

          >

            <Text
              style={
                styles.textoBotaoPrincipal
              }
            >

              {
                conectandoBluetooth
                  ? 'Conectando...'
                  : bluetoothReal
                    ? 'Desconectar HC-05'
                    : 'Conectar HC-05'
              }

            </Text>

          </TouchableOpacity>

        </View>

      </View>


      {/* =================================== */}
      {/* CRONÔMETRO */}
      {/* =================================== */}

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              tema.card,

            borderColor:
              tema.borda,
          },
        ]}
      >

        <Text
          style={[
            styles.tituloCard,
            {
              color:
                tema.texto,
            },
          ]}
        >

          Cronômetro

        </Text>


        <Text
          style={[
            styles.tempo,
            {
              color:
                tempoRestante === 0
                  ? tema.alerta
                  : tema.texto,
            },
          ]}
        >

          {
            formatarTempo(
              tempoRestante
            )
          }

        </Text>


        {/* BARRA DE PROGRESSO */}

        <View
          style={[
            styles.barraFundo,
            {
              backgroundColor:
                tema.borda,
            },
          ]}
        >

          <View
            style={[
              styles.barraProgresso,
              {
                backgroundColor:
                  tema.destaque,

                width:
                  `${Math.max(
                    0,
                    Math.min(
                      progresso * 100,
                      100
                    )
                  )}%`,
              },
            ]}
          />

        </View>


        {/* INPUTS */}

        <View
          style={
            styles.inputsLinha
          }
        >

          <View
            style={
              styles.inputGrupo
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    tema.textoSecundario,
                },
              ]}
            >

              Minutos

            </Text>


            <TextInput

              value={
                minutosInput
              }

              onChangeText={
                setMinutosInput
              }

              keyboardType="number-pad"

              style={[
                styles.input,
                {
                  backgroundColor:
                    tema.fundo,

                  borderColor:
                    tema.borda,

                  color:
                    tema.texto,
                },
              ]}

            />

          </View>


          <View
            style={
              styles.inputGrupo
            }
          >

            <Text
              style={[
                styles.label,
                {
                  color:
                    tema.textoSecundario,
                },
              ]}
            >

              Segundos

            </Text>


            <TextInput

              value={
                segundosInput
              }

              onChangeText={
                setSegundosInput
              }

              keyboardType="number-pad"

              style={[
                styles.input,
                {
                  backgroundColor:
                    tema.fundo,

                  borderColor:
                    tema.borda,

                  color:
                    tema.texto,
                },
              ]}

            />

          </View>

        </View>


        {/* APLICAR TEMPO */}

        <TouchableOpacity

          style={[
            styles.botaoPrincipal,
            {
              backgroundColor:
                tema.destaque,
            },
          ]}

          onPress={
            aplicarTempo
          }

        >

          <Text
            style={
              styles.textoBotaoPrincipal
            }
          >

            Aplicar tempo

          </Text>

        </TouchableOpacity>


        {/* ATALHOS */}

        <Text
          style={[
            styles.labelAtalhos,
            {
              color:
                tema.textoSecundario,
            },
          ]}
        >

          Atalhos

        </Text>


        <View
          style={
            styles.atalhos
          }
        >

          {[
            [5, '5s'],
            [10, '10s'],
            [30, '30s'],
            [60, '1min'],
          ].map(
            ([segundos, texto]) => (

              <TouchableOpacity

                key={
                  segundos
                }

                style={[
                  styles.botaoAtalho,
                  {
                    backgroundColor:
                      tema.fundo,

                    borderColor:
                      tema.borda,
                  },
                ]}

                onPress={() =>
                  aplicarAtalho(
                    segundos
                  )
                }

              >

                <Text
                  style={[
                    styles.textoAtalho,
                    {
                      color:
                        tema.texto,
                    },
                  ]}
                >

                  {texto}

                </Text>

              </TouchableOpacity>

            )
          )}

        </View>


        {/* CONTROLES */}

        <View
          style={
            styles.controles
          }
        >

          <TouchableOpacity

            style={[
              styles.botaoPrincipal,
              styles.botaoControle,
              {
                backgroundColor:
                  tema.destaque,
              },
            ]}

            onPress={() => {

              if (
                tempoRestante <= 0
              ) {

                setTempoRestante(
                  tempoTotal
                );

              }


              setRodando(
                anterior =>
                  !anterior
              );

            }}

          >

            <Text
              style={
                styles.textoBotaoPrincipal
              }
            >

              {
                rodando
                  ? 'Pausar'
                  : 'Iniciar'
              }

            </Text>

          </TouchableOpacity>


          <TouchableOpacity

            style={[
              styles.botaoSecundario,
              styles.botaoControle,
              {
                borderColor:
                  tema.borda,

                backgroundColor:
                  tema.fundo,
              },
            ]}

            onPress={
              zerarCronometro
            }

          >

            <Text
              style={[
                styles.textoBotaoSecundario,
                {
                  color:
                    tema.texto,
                },
              ]}
            >

              Zerar

            </Text>

          </TouchableOpacity>

        </View>

      </View>

    </ScrollView>

  );

}


// =============================================
// ESTILOS
// =============================================

const styles =
  StyleSheet.create({

    scrollView: {

      flex: 1,

    },


    scrollConteudo: {

      paddingHorizontal: 18,

      paddingTop: 18,

      paddingBottom: 30,

    },


    titulo: {

      fontSize: 28,

      fontWeight: '700',

    },


    subtitulo: {

      fontSize: 14,

      marginTop: 4,

      marginBottom: 18,

    },


    card: {

      borderWidth: 1,

      borderRadius: 18,

      padding: 18,

      marginBottom: 16,

    },


    tituloCard: {

      fontSize: 18,

      fontWeight: '700',

      marginBottom: 16,

    },


    // =========================================
    // COMPONENTES EM CÍRCULOS
    // =========================================

    componentesLinha: {

      flexDirection: 'row',

      justifyContent: 'space-around',

      alignItems: 'flex-start',

      marginTop: 4,

      marginBottom: 18,

    },


    componente: {

      alignItems: 'center',

      width: 90,

    },


    circuloComponente: {

      width: 65,

      height: 65,

      borderRadius: 33,

      borderWidth: 1,

      alignItems: 'center',

      justifyContent: 'center',

      marginBottom: 8,

    },


    iconeCirculo: {

      fontSize: 28,

    },


    nomeComponente: {

      fontSize: 14,

      fontWeight: '600',

      textAlign: 'center',

    },


    estadoComponente: {

      fontSize: 12,

      marginTop: 3,

      textAlign: 'center',

    },


    // =========================================
    // STATUS DO ARDUINO
    // =========================================

    statusArduino: {

      borderWidth: 1,

      borderRadius: 12,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 14,

      paddingVertical: 11,

      marginTop: 4,

    },


    bolinhaStatus: {

      width: 10,

      height: 10,

      borderRadius: 5,

      marginRight: 9,

    },


    textoStatusArduino: {

      fontSize: 14,

      fontWeight: '600',

    },


    botaoArduino: {

      borderRadius: 12,

      paddingVertical: 14,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 14,

    },


    // =========================================
    // BLUETOOTH
    // =========================================

    bluetoothManual: {

      marginTop: 20,

      paddingTop: 18,

      borderTopWidth: 1,

    },


    bluetoothTitulo: {

      fontSize: 16,

      fontWeight: '700',

      marginBottom: 12,

    },


    bluetoothStatusLinha: {

      flexDirection: 'row',

      alignItems: 'center',

    },


    bluetoothStatusTitulo: {

      fontSize: 15,

      fontWeight: '600',

    },


    bluetoothDescricao: {

      fontSize: 13,

      marginTop: 3,

      lineHeight: 18,

    },


    botaoConexao: {

      borderRadius: 12,

      paddingVertical: 14,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 14,

    },


    // =========================================
    // TIMER
    // =========================================

    tempo: {

      fontSize: 54,

      fontWeight: '700',

      textAlign: 'center',

      marginVertical: 12,

      fontVariant: [
        'tabular-nums',
      ],

    },


    barraFundo: {

      height: 7,

      borderRadius: 20,

      overflow: 'hidden',

      marginBottom: 22,

    },


    barraProgresso: {

      height: '100%',

      borderRadius: 20,

    },


    inputsLinha: {

      flexDirection: 'row',

      gap: 12,

    },


    inputGrupo: {

      flex: 1,

    },


    label: {

      fontSize: 13,

      marginBottom: 6,

    },


    input: {

      borderWidth: 1,

      borderRadius: 12,

      paddingHorizontal: 14,

      paddingVertical: 11,

      fontSize: 16,

      textAlign: 'center',

    },


    botaoPrincipal: {

      borderRadius: 12,

      paddingVertical: 13,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 14,

    },


    textoBotaoPrincipal: {

      color: '#FFFFFF',

      fontSize: 15,

      fontWeight: '700',

    },


    labelAtalhos: {

      marginTop: 20,

      marginBottom: 9,

      fontSize: 13,

      textAlign: 'center',

    },


    atalhos: {

      flexDirection: 'row',

      justifyContent: 'center',

      flexWrap: 'wrap',

      gap: 8,

    },


    botaoAtalho: {

      borderWidth: 1,

      borderRadius: 20,

      paddingHorizontal: 15,

      paddingVertical: 8,

    },


    textoAtalho: {

      fontSize: 14,

      fontWeight: '600',

    },


    controles: {

      flexDirection: 'row',

      gap: 10,

      marginTop: 4,

    },


    botaoControle: {

      flex: 1,

    },


    botaoSecundario: {

      borderRadius: 12,

      paddingVertical: 13,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 14,

      borderWidth: 1,

    },


    textoBotaoSecundario: {

      fontSize: 15,

      fontWeight: '600',

    },

  });