import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';

import {
  useHorarios,
} from './HorariosContext';

import {
  COMANDOS,
  conectarHC05,
  desconectarHC05,
  enviarComandoArduino,
  statusHC05,
} from './ArduinoBridge';


// =====================================================
// TEMPO DA DEMONSTRAÇÃO
// =====================================================

// Servo:
// aproximadamente 1,2 segundo.
//
// Alerta:
// aproximadamente 4 segundos.
//
// Colocamos 6 segundos no app para deixar
// uma pequena margem para a comunicação Bluetooth.

const TEMPO_TOTAL_DEMO = 6000;


// =====================================================
// OPÇÕES DA DEMONSTRAÇÃO
// =====================================================

const CORES_LED = [
  {
    nome: 'Vermelho',
    r: 255,
    g: 0,
    b: 0,
    cor: '#EF4444',
  },
  {
    nome: 'Verde',
    r: 0,
    g: 255,
    b: 0,
    cor: '#22C55E',
  },
  {
    nome: 'Azul',
    r: 0,
    g: 0,
    b: 255,
    cor: '#3B82F6',
  },
  {
    nome: 'Amarelo',
    r: 255,
    g: 255,
    b: 0,
    cor: '#EAB308',
  },
  {
    nome: 'Ciano',
    r: 0,
    g: 255,
    b: 255,
    cor: '#06B6D4',
  },
  {
    nome: 'Roxo',
    r: 180,
    g: 0,
    b: 255,
    cor: '#A855F7',
  },
  {
    nome: 'Laranja',
    r: 255,
    g: 90,
    b: 0,
    cor: '#F97316',
  },
  {
    nome: 'Branco',
    r: 255,
    g: 255,
    b: 255,
    cor: '#FFFFFF',
  },
];


const TONS_BUZZER = [
  {
    nome: 'Muito grave',
    frequencia: 180,
  },
  {
    nome: 'Grave',
    frequencia: 262,
  },
  {
    nome: 'Médio',
    frequencia: 467,
  },
  {
    nome: 'Agudo',
    frequencia: 880,
  },
  {
    nome: 'Muito agudo',
    frequencia: 1400,
  },
];


const VIBRACOES = [
  {
    nome: 'Pulsar',
    codigo: 'PULSAR',
  },
  {
    nome: 'Seguir',
    codigo: 'SEGUIR',
  },
  {
    nome: 'Longa',
    codigo: 'LONGA',
  },
  {
    nome: 'Rápida',
    codigo: 'RAPIDA',
  },
];


// =====================================================
// PÁGINA
// =====================================================

export default function PaginaTres() {

  const {
    tema,
  } = useHorarios();


  // ===================================================
  // BLUETOOTH
  // ===================================================

  const [
    conectado,
    setConectado,
  ] = useState(false);

  const [
    mensagemBluetooth,
    setMensagemBluetooth,
  ] = useState(
    'Paulim02 desconectado'
  );


  // ===================================================
  // ESTADO DA DEMONSTRAÇÃO
  // ===================================================

  const [
    arduinoAtivo,
    setArduinoAtivo,
  ] = useState(false);

  const [
    ledAtivo,
    setLedAtivo,
  ] = useState(false);

  const [
    buzzerAtivo,
    setBuzzerAtivo,
  ] = useState(false);

  const [
    vibracaoAtiva,
    setVibracaoAtiva,
  ] = useState(false);


  // ===================================================
  // CONFIGURAÇÕES
  // ===================================================

  const [
    indiceCor,
    setIndiceCor,
  ] = useState(0);

  const [
    indiceTom,
    setIndiceTom,
  ] = useState(2);

  const [
    indiceVibracao,
    setIndiceVibracao,
  ] = useState(0);


  const corSelecionada =
    CORES_LED[indiceCor];

  const tomSelecionado =
    TONS_BUZZER[indiceTom];

  const vibracaoSelecionada =
    VIBRACOES[indiceVibracao];


  // ===================================================
  // CRONÔMETRO
  // ===================================================

  const [
    minutos,
    setMinutos,
  ] = useState('0');

  const [
    segundos,
    setSegundos,
  ] = useState('10');

  const [
    tempoRestante,
    setTempoRestante,
  ] = useState(10);

  const [
    rodando,
    setRodando,
  ] = useState(false);


  const timeoutAlerta =
    useRef(null);


  // ===================================================
  // VERIFICAR STATUS
  // ===================================================

  useEffect(() => {

    async function verificar() {

      try {

        const resultado =
          await statusHC05();


        if (
          resultado?.conectado
        ) {

          setConectado(true);

          setMensagemBluetooth(
            `${
              resultado.nome ||
              'Paulim02'
            } conectado`
          );

        }

      } catch (erro) {

        // Não conecta automaticamente.

      }

    }


    verificar();


    return () => {

      if (
        timeoutAlerta.current
      ) {

        clearTimeout(
          timeoutAlerta.current
        );

      }

    };

  }, []);


  // ===================================================
  // TROCAR COR
  // ===================================================

  function proximaCor() {

    if (arduinoAtivo)
      return;


    setIndiceCor(
      atual =>
        (atual + 1) %
        CORES_LED.length
    );

  }


  // ===================================================
  // TROCAR TOM
  // ===================================================

  function proximoTom() {

    if (arduinoAtivo)
      return;


    setIndiceTom(
      atual =>
        (atual + 1) %
        TONS_BUZZER.length
    );

  }


  // ===================================================
  // TROCAR VIBRAÇÃO
  // ===================================================

  function proximaVibracao() {

    if (arduinoAtivo)
      return;


    setIndiceVibracao(
      atual =>
        (atual + 1) %
        VIBRACOES.length
    );

  }


  // ===================================================
  // COMANDO DA DEMONSTRAÇÃO
  // ===================================================

  function montarComando() {

    return (
      'DEMO|ALERTA|CONFIG|' +
      corSelecionada.r +
      '|' +
      corSelecionada.g +
      '|' +
      corSelecionada.b +
      '|' +
      tomSelecionado.frequencia +
      '|' +
      vibracaoSelecionada.codigo
    );

  }


  // ===================================================
  // ATIVAR ARDUINO
  // ===================================================

  async function ativarArduino(
    conectarSeNecessario = true
  ) {

    // Remove qualquer temporizador
    // de uma demonstração anterior.

    if (
      timeoutAlerta.current
    ) {

      clearTimeout(
        timeoutAlerta.current
      );

      timeoutAlerta.current =
        null;

    }


    const comando =
      montarComando();


    const resultado =
      await enviarComandoArduino(
        comando,
        conectarSeNecessario
      );


    if (
      resultado?.enviado
    ) {

      setConectado(true);

      setMensagemBluetooth(
        'Paulim02 conectado'
      );

    }


    // O Arduino inteiro está ativo,
    // incluindo o tempo do servo.

    setArduinoAtivo(true);

    setLedAtivo(true);

    setBuzzerAtivo(true);

    setVibracaoAtiva(true);


    // =================================================
    // IMPORTANTE:
    //
    // Não são mais apenas 4 segundos.
    //
    // O aplicativo espera também o tempo do servo,
    // mantendo "Parar Arduino" disponível durante
    // toda a demonstração.
    // =================================================

    timeoutAlerta.current =
      setTimeout(() => {

        setArduinoAtivo(false);

        setLedAtivo(false);

        setBuzzerAtivo(false);

        setVibracaoAtiva(false);

        timeoutAlerta.current =
          null;

      }, TEMPO_TOTAL_DEMO);

  }


  // ===================================================
  // PARAR ARDUINO
  // ===================================================

  async function pararArduino() {

    // Primeiro cancela o temporizador do aplicativo.

    if (
      timeoutAlerta.current
    ) {

      clearTimeout(
        timeoutAlerta.current
      );

      timeoutAlerta.current =
        null;

    }


    // Depois manda o Arduino parar imediatamente.

    await enviarComandoArduino(
      COMANDOS.PARAR_TUDO,
      false
    );


    // Interface volta ao estado inicial.

    setArduinoAtivo(false);

    setLedAtivo(false);

    setBuzzerAtivo(false);

    setVibracaoAtiva(false);

  }


  // ===================================================
  // CONECTAR BLUETOOTH
  // ===================================================

  async function conectar() {

    setMensagemBluetooth(
      'Conectando ao Paulim02...'
    );


    const resultado =
      await conectarHC05();


    if (
      resultado?.ok &&
      resultado?.conectado
    ) {

      setConectado(true);

      setMensagemBluetooth(
        `${
          resultado.nome ||
          'Paulim02'
        } conectado`
      );

      return;

    }


    setConectado(false);

    setMensagemBluetooth(
      resultado?.message ||
      'Não foi possível conectar'
    );

  }


  // ===================================================
  // DESCONECTAR BLUETOOTH
  // ===================================================

  async function desconectar() {

    // Se o Arduino estiver em uma demonstração,
    // manda parar antes de desconectar.

    if (arduinoAtivo) {

      await pararArduino();

    }


    await desconectarHC05();


    setConectado(false);

    setMensagemBluetooth(
      'Paulim02 desconectado'
    );

  }


  // ===================================================
  // APLICAR TEMPO
  // ===================================================

  function aplicarTempo() {

    const min =
      Math.max(
        0,
        Number(minutos) || 0
      );

    const seg =
      Math.max(
        0,
        Number(segundos) || 0
      );


    const total =
      min * 60 + seg;


    setTempoRestante(total);

    setRodando(false);

  }


  // ===================================================
  // TEMPOS RÁPIDOS
  // ===================================================

  function tempoRapido(
    total
  ) {

    setTempoRestante(total);

    setRodando(false);


    setMinutos(
      String(
        Math.floor(
          total / 60
        )
      )
    );


    setSegundos(
      String(
        total % 60
      )
    );

  }


  // ===================================================
  // CRONÔMETRO
  // ===================================================

  useEffect(() => {

    if (!rodando)
      return;


    if (
      tempoRestante <= 0
    ) {

      setRodando(false);


      // O cronômetro não tenta conectar sozinho.
      // Só dispara se já existir conexão.

      ativarArduino(false);


      return;

    }


    const intervalo =
      setInterval(() => {

        setTempoRestante(
          atual =>
            Math.max(
              0,
              atual - 1
            )
        );

      }, 1000);


    return () =>
      clearInterval(
        intervalo
      );

  }, [
    rodando,
    tempoRestante,
  ]);


  // ===================================================
  // FORMATAR TEMPO
  // ===================================================

  function formatarTempo(
    total
  ) {

    const min =
      Math.floor(
        total / 60
      );

    const seg =
      total % 60;


    return (
      String(min).padStart(
        2,
        '0'
      ) +
      ':' +
      String(seg).padStart(
        2,
        '0'
      )
    );

  }


  // ===================================================
  // INTERFACE
  // ===================================================

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor:
            tema.fundo,
        },
      ]}
    >

      <ScrollView

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.scroll
        }

      >

        {/* ================================= */}
        {/* CABEÇALHO */}
        {/* ================================= */}

        <View
          style={
            styles.cabecalho
          }
        >

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

        </View>


        {/* ================================= */}
        {/* ESTADO DO ARDUINO */}
        {/* ================================= */}

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
          {/* ATUADORES */}
          {/* ================================= */}

          <View
            style={
              styles.atuadores
            }
          >

            {/* LED */}

            <Pressable

              onPress={
                proximaCor
              }

              style={
                styles.atuador
              }

            >

              <View
                style={[
                  styles.circulo,

                  {
                    borderColor:
                      tema.borda,

                    backgroundColor:
                      ledAtivo
                        ? corSelecionada.cor
                        : tema.fundo,
                  },
                ]}
              >

                <Text
                  style={
                    styles.emoji
                  }
                >
                  💡
                </Text>

              </View>


              <Text
                style={[
                  styles.nomeAtuador,
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
                  styles.estadoAtuador,
                  {
                    color:
                      tema.textoSecundario,
                  },
                ]}
              >
                {ledAtivo
                  ? 'Ligado'
                  : 'Desligado'}
              </Text>


              <Text
                style={[
                  styles.opcaoAtuador,
                  {
                    color:
                      tema.destaque,
                  },
                ]}
              >
                {
                  corSelecionada.nome
                }
              </Text>

            </Pressable>


            {/* BUZZER */}

            <Pressable

              onPress={
                proximoTom
              }

              style={
                styles.atuador
              }

            >

              <View
                style={[
                  styles.circulo,

                  {
                    borderColor:
                      tema.borda,

                    backgroundColor:
                      buzzerAtivo
                        ? tema.destaque
                        : tema.fundo,
                  },
                ]}
              >

                <Text
                  style={
                    styles.emoji
                  }
                >
                  🔊
                </Text>

              </View>


              <Text
                style={[
                  styles.nomeAtuador,
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
                  styles.estadoAtuador,
                  {
                    color:
                      tema.textoSecundario,
                  },
                ]}
              >
                {buzzerAtivo
                  ? 'Ligado'
                  : 'Desligado'}
              </Text>


              <Text
                style={[
                  styles.opcaoAtuador,
                  {
                    color:
                      tema.destaque,
                  },
                ]}
              >
                {
                  tomSelecionado.nome
                }
              </Text>

            </Pressable>


            {/* VIBRAÇÃO */}

            <Pressable

              onPress={
                proximaVibracao
              }

              style={
                styles.atuador
              }

            >

              <View
                style={[
                  styles.circulo,

                  {
                    borderColor:
                      tema.borda,

                    backgroundColor:
                      vibracaoAtiva
                        ? tema.destaque
                        : tema.fundo,
                  },
                ]}
              >

                <Text
                  style={
                    styles.emoji
                  }
                >
                  📳
                </Text>

              </View>


              <Text
                style={[
                  styles.nomeAtuador,
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
                  styles.estadoAtuador,
                  {
                    color:
                      tema.textoSecundario,
                  },
                ]}
              >
                {vibracaoAtiva
                  ? 'Ligada'
                  : 'Desligada'}
              </Text>


              <Text
                style={[
                  styles.opcaoAtuador,
                  {
                    color:
                      tema.destaque,
                  },
                ]}
              >
                {
                  vibracaoSelecionada.nome
                }
              </Text>

            </Pressable>

          </View>


          {/* ================================= */}
          {/* STATUS */}
          {/* ================================= */}

          <View
            style={
              styles.statusLinha
            }
          >

            <View
              style={[
                styles.statusPonto,
                {
                  backgroundColor:
                    arduinoAtivo
                      ? '#22C55E'
                      : '#9CA3AF',
                },
              ]}
            />


            <Text
              style={[
                styles.statusTexto,
                {
                  color:
                    tema.textoSecundario,
                },
              ]}
            >
              {arduinoAtivo
                ? 'Arduino ativo'
                : 'Arduino aguardando'}
            </Text>

          </View>


          {/* ================================= */}
          {/* BOTÃO PRINCIPAL */}
          {/* ================================= */}

          <Pressable

            onPress={
              arduinoAtivo
                ? pararArduino
                : () =>
                    ativarArduino(
                      true
                    )
            }

            style={[
              styles.botaoPrincipal,

              {
                backgroundColor:
                  arduinoAtivo
                    ? '#EF4444'
                    : tema.destaque,
              },
            ]}

          >

            <Text
              style={
                styles.textoBotaoPrincipal
              }
            >
              {arduinoAtivo
                ? 'Parar Arduino'
                : 'Ativar Arduino agora'}
            </Text>

          </Pressable>


          {/* ================================= */}
          {/* BLUETOOTH */}
          {/* ================================= */}

          <View
            style={[
              styles.divisoria,
              {
                backgroundColor:
                  tema.borda,
              },
            ]}
          />


          <View
            style={
              styles.statusLinha
            }
          >

            <View
              style={[
                styles.statusPonto,

                {
                  backgroundColor:
                    conectado
                      ? '#22C55E'
                      : '#9CA3AF',
                },
              ]}
            />


            <View
              style={
                styles.bluetoothTexto
              }
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
                {conectado
                  ? 'HC-05 conectado'
                  : 'HC-05 desconectado'}
              </Text>


              <Text
                style={[
                  styles.bluetoothMensagem,

                  {
                    color:
                      tema.textoSecundario,
                  },
                ]}
              >
                {mensagemBluetooth}
              </Text>

            </View>

          </View>


          <Pressable

            onPress={
              conectado
                ? desconectar
                : conectar
            }

            style={[
              styles.botaoBluetooth,

              {
                borderColor:
                  tema.destaque,
              },
            ]}

          >

            <Text
              style={[
                styles.textoBotaoBluetooth,

                {
                  color:
                    tema.destaque,
                },
              ]}
            >
              {conectado
                ? 'Desconectar HC-05'
                : 'Conectar HC-05'}
            </Text>

          </Pressable>

        </View>


        {/* ================================= */}
        {/* CRONÔMETRO */}
        {/* ================================= */}

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
                  tema.destaque,
              },
            ]}
          >
            {
              formatarTempo(
                tempoRestante
              )
            }
          </Text>


          <View
            style={
              styles.camposTempo
            }
          >

            <View
              style={
                styles.campoGrupo
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
                  minutos
                }

                onChangeText={
                  setMinutos
                }

                keyboardType="number-pad"

                style={[
                  styles.input,

                  {
                    color:
                      tema.texto,

                    borderColor:
                      tema.borda,

                    backgroundColor:
                      tema.fundo,
                  },
                ]}

              />

            </View>


            <View
              style={
                styles.campoGrupo
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
                  segundos
                }

                onChangeText={
                  setSegundos
                }

                keyboardType="number-pad"

                style={[
                  styles.input,

                  {
                    color:
                      tema.texto,

                    borderColor:
                      tema.borda,

                    backgroundColor:
                      tema.fundo,
                  },
                ]}

              />

            </View>

          </View>


          <Pressable

            onPress={
              aplicarTempo
            }

            style={[
              styles.botaoAplicar,

              {
                backgroundColor:
                  tema.destaque,
              },
            ]}

          >

            <Text
              style={
                styles.textoBotaoPrincipal
              }
            >
              Aplicar tempo
            </Text>

          </Pressable>


          {/* ================================= */}
          {/* TEMPOS RÁPIDOS */}
          {/* ================================= */}

          <View
            style={
              styles.temposRapidos
            }
          >

            {[
              {
                texto: '5s',
                valor: 5,
              },
              {
                texto: '10s',
                valor: 10,
              },
              {
                texto: '30s',
                valor: 30,
              },
              {
                texto: '1min',
                valor: 60,
              },

            ].map(
              item => (

                <Pressable

                  key={
                    item.texto
                  }

                  onPress={() =>
                    tempoRapido(
                      item.valor
                    )
                  }

                  style={[
                    styles.botaoRapido,

                    {
                      borderColor:
                        tema.borda,

                      backgroundColor:
                        tema.fundo,
                    },
                  ]}

                >

                  <Text
                    style={[
                      styles.textoRapido,

                      {
                        color:
                          tema.texto,
                      },
                    ]}
                  >
                    {item.texto}
                  </Text>

                </Pressable>

              )
            )}

          </View>


          {/* ================================= */}
          {/* CONTROLES */}
          {/* ================================= */}

          <View
            style={
              styles.controlesCronometro
            }
          >

            <Pressable

              onPress={() => {

                if (
                  tempoRestante > 0
                ) {

                  setRodando(
                    atual =>
                      !atual
                  );

                }

              }}

              style={[
                styles.botaoCronometro,

                {
                  backgroundColor:
                    tema.destaque,
                },
              ]}

            >

              <Text
                style={
                  styles.textoBotaoPrincipal
                }
              >
                {rodando
                  ? 'Pausar'
                  : 'Iniciar'}
              </Text>

            </Pressable>


            <Pressable

              onPress={() => {

                setRodando(false);

                setTempoRestante(
                  0
                );

              }}

              style={[
                styles.botaoCronometro,

                styles.botaoReset,

                {
                  borderColor:
                    tema.borda,

                  backgroundColor:
                    tema.fundo,
                },
              ]}

            >

              <Text
                style={[
                  styles.textoReset,

                  {
                    color:
                      tema.texto,
                  },
                ]}
              >
                Reset
              </Text>

            </Pressable>

          </View>

        </View>

      </ScrollView>

    </View>

  );

}


// =====================================================
// ESTILOS
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
    },


    scroll: {
      padding: 18,
      paddingBottom: 40,
    },


    cabecalho: {
      marginBottom: 20,
    },


    titulo: {
      fontSize: 28,
      fontWeight: '700',
    },


    subtitulo: {
      fontSize: 14,
      marginTop: 3,
    },


    card: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
    },


    tituloCard: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 18,
    },


    atuadores: {
      flexDirection: 'row',
      justifyContent:
        'space-around',
      marginBottom: 20,
    },


    atuador: {
      alignItems: 'center',
      width: 90,
    },


    circulo: {
      width: 65,
      height: 65,
      borderRadius: 33,
      borderWidth: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      marginBottom: 7,
    },


    emoji: {
      fontSize: 25,
    },


    nomeAtuador: {
      fontSize: 13,
      fontWeight: '700',
    },


    estadoAtuador: {
      fontSize: 11,
      marginTop: 2,
    },


    opcaoAtuador: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      textAlign: 'center',
    },


    statusLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },


    statusPonto: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 9,
    },


    statusTexto: {
      fontSize: 14,
    },


    botaoPrincipal: {
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
    },


    textoBotaoPrincipal: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },


    divisoria: {
      height: 1,
      marginVertical: 18,
    },


    bluetoothTexto: {
      flex: 1,
    },


    bluetoothTitulo: {
      fontSize: 14,
      fontWeight: '700',
    },


    bluetoothMensagem: {
      fontSize: 12,
      marginTop: 2,
    },


    botaoBluetooth: {
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },


    textoBotaoBluetooth: {
      fontSize: 14,
      fontWeight: '700',
    },


    tempo: {
      fontSize: 42,
      fontWeight: '700',
      textAlign: 'center',
      marginVertical: 15,
    },


    camposTempo: {
      flexDirection: 'row',
      gap: 10,
    },


    campoGrupo: {
      flex: 1,
    },


    label: {
      fontSize: 12,
      marginBottom: 5,
    },


    input: {
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 16,
      textAlign: 'center',
    },


    botaoAplicar: {
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 12,
    },


    temposRapidos: {
      flexDirection: 'row',
      justifyContent:
        'center',
      gap: 7,
      marginTop: 14,
    },


    botaoRapido: {
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },


    textoRapido: {
      fontSize: 12,
      fontWeight: '600',
    },


    controlesCronometro: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 15,
    },


    botaoCronometro: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },


    botaoReset: {
      borderWidth: 1,
    },


    textoReset: {
      fontSize: 15,
      fontWeight: '700',
    },

  });