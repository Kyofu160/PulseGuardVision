import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';

import {
  useHorarios,
} from './HorariosContext.js';


// =============================================
// DIAS
// =============================================

const DIAS = [
  'D',
  'S',
  'T',
  'Q',
  'Q',
  'S',
  'S',
];


// =============================================
// CONVERTER HORÁRIO
// =============================================

function horarioValido(horario) {

  if (!horario) {
    return false;
  }


  const partes =
    horario.split(':');


  if (partes.length !== 2) {
    return false;
  }


  const hora =
    Number(partes[0]);


  const minuto =
    Number(partes[1]);


  return (
    !Number.isNaN(hora) &&
    !Number.isNaN(minuto) &&
    hora >= 0 &&
    hora <= 23 &&
    minuto >= 0 &&
    minuto <= 59
  );

}


// =============================================
// TELA
// =============================================

export default function EditarHorario({

  horario,

  novo,

  voltar,

  salvar,

  excluir,

}) {

  const {
    tema,
  } = useHorarios();


  // ===========================================
  // ESTADOS
  // ===========================================

  const [nome, setNome] =
    useState(
      horario.nome
    );


  const [ultimaDose, setUltimaDose] =
    useState(
      horario.ultimaDose ||
      horario.inicio ||
      '08:00'
    );


  const [intervalo, setIntervalo] =
    useState(
      String(
        horario.intervalo ||
        8
      )
    );


  const [
    quantidadePorDose,
    setQuantidadePorDose,
  ] = useState(
    String(
      horario.quantidadePorDose ||
      1
    )
  );


  const [quantidade, setQuantidade] =
    useState(
      String(
        horario.quantidade || 0
      )
    );


  const [som, setSom] =
    useState(
      horario.som
    );


  const [vibracao, setVibracao] =
    useState(
      horario.vibracao
    );


  const [cor, setCor] =
    useState(
      horario.cor
    );


  const [dias, setDias] =
    useState(
      [...horario.dias]
    );


  // ===========================================
  // ALTERAR DIA
  // ===========================================

  function alternarDia(index) {

    const novosDias =
      [...dias];


    novosDias[index] =
      !novosDias[index];


    setDias(novosDias);

  }


  // ===========================================
  // HORÁRIO ATUAL
  // ===========================================

  function usarHorarioAtual() {

    const agora =
      new Date();


    const hora =
      String(
        agora.getHours()
      ).padStart(2, '0');


    const minuto =
      String(
        agora.getMinutes()
      ).padStart(2, '0');


    setUltimaDose(
      `${hora}:${minuto}`
    );

  }


  // ===========================================
  // SALVAR
  // ===========================================

  function salvarHorario() {

    const intervaloNumero =
      Number(intervalo);


    const quantidadeDoseNumero =
      Number(
        quantidadePorDose
      );


    const estoqueNumero =
      Number(quantidade);


    if (!nome.trim()) {

      Alert.alert(
        'Nome obrigatório',
        'Digite o nome do medicamento.'
      );

      return;

    }


    if (!horarioValido(ultimaDose)) {

      Alert.alert(
        'Horário inválido',
        'Digite um horário válido no formato HH:MM.'
      );

      return;

    }


    if (
      !intervaloNumero ||
      intervaloNumero <= 0
    ) {

      Alert.alert(
        'Intervalo inválido',
        'Informe de quantas em quantas horas o medicamento deve ser tomado.'
      );

      return;

    }


    if (
      !quantidadeDoseNumero ||
      quantidadeDoseNumero <= 0
    ) {

      Alert.alert(
        'Quantidade inválida',
        'Informe quantas unidades devem ser tomadas por dose.'
      );

      return;

    }


    const horarioAtualizado = {

      ...horario,

      id:
        horario.id,

      nome:
        nome.trim(),

      intervalo:
        intervaloNumero,

      ultimaDose:
        ultimaDose,

      quantidadePorDose:
        quantidadeDoseNumero,

      quantidade:
        estoqueNumero,

      som:
        som,

      vibracao:
        vibracao,

      cor:
        cor,

      dias:
        dias,

      // ========================================
      // COMPATIBILIDADE
      // ========================================

      inicio:
        ultimaDose,

      fim:
        ultimaDose,

    };


    salvar(
      horarioAtualizado
    );

  }


  // ===========================================
  // EXCLUIR
  // ===========================================

  function excluirHorario() {

    Alert.alert(

      'Excluir medicamento',

      'Tem certeza que deseja excluir este medicamento?',

      [

        {
          text: 'Cancelar',

          style: 'cancel',
        },


        {
          text: 'Excluir',

          style: 'destructive',

          onPress: () =>
            excluir(
              horario.id
            ),
        },

      ]

    );

  }


  // ===========================================
  // INTERVALOS RÁPIDOS
  // ===========================================

  const intervalos = [
    4,
    6,
    8,
    12,
    24,
  ];


  // ===========================================
  // INTERFACE
  // ===========================================

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


      {/* ================================= */}
      {/* CABEÇALHO */}
      {/* ================================= */}

      <View
        style={[
          styles.cabecalho,
          {
            backgroundColor:
              tema.card,

            borderBottomColor:
              tema.borda,
          },
        ]}
      >

        <Pressable
          onPress={voltar}
          style={styles.botaoVoltar}
        >

          <Text
            style={[
              styles.textoVoltar,
              {
                color:
                  tema.texto,
              },
            ]}
          >
            ‹
          </Text>

        </Pressable>


        <Text
          style={[
            styles.titulo,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Editar medicamento
        </Text>

      </View>


      <ScrollView

        showsVerticalScrollIndicator={false}

        contentContainerStyle={
          styles.scroll
        }

      >


        {/* ================================= */}
        {/* NOME */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Nome
        </Text>


        <TextInput

          value={nome}

          onChangeText={
            setNome
          }

          style={[
            styles.input,
            {
              backgroundColor:
                tema.card,

              borderColor:
                tema.borda,

              color:
                tema.texto,
            },
          ]}

          placeholder="Nome do medicamento"

          placeholderTextColor={
            tema.textoSecundario
          }

        />


        {/* ================================= */}
        {/* ÚLTIMA DOSE */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Última dose
        </Text>


        <Text
          style={[
            styles.explicacao,
            {
              color:
                tema.textoSecundario,
            },
          ]}
        >
          Informe o horário em que você tomou
          a última dose.
        </Text>


        <View
          style={styles.linhaDose}
        >

          <TextInput

            value={ultimaDose}

            onChangeText={
              setUltimaDose
            }

            style={[
              styles.inputHorario,
              {
                backgroundColor:
                  tema.card,

                borderColor:
                  tema.borda,

                color:
                  tema.texto,
              },
            ]}

            placeholder="08:00"

            placeholderTextColor={
              tema.textoSecundario
            }

            keyboardType="numeric"

            maxLength={5}

          />


          <Pressable

            onPress={
              usarHorarioAtual
            }

            style={[
              styles.botaoAgora,
              {
                backgroundColor:
                  tema.destaqueClaro,

                borderColor:
                  tema.borda,
              },
            ]}

          >

            <Text
              style={[
                styles.textoAgora,
                {
                  color:
                    tema.destaque,
                },
              ]}
            >
              Tomei agora
            </Text>

          </Pressable>

        </View>


        {/* ================================= */}
        {/* INTERVALO */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Intervalo entre doses
        </Text>


        <Text
          style={[
            styles.explicacao,
            {
              color:
                tema.textoSecundario,
            },
          ]}
        >
          De quantas em quantas horas o medicamento
          deve ser tomado?
        </Text>


        <View
          style={styles.intervalos}
        >

          {intervalos.map(
            opcao => (

              <Pressable

                key={opcao}

                onPress={() =>
                  setIntervalo(
                    String(opcao)
                  )
                }

                style={[
                  styles.intervalo,
                  {
                    backgroundColor:
                      String(intervalo) ===
                      String(opcao)
                        ? tema.destaque
                        : tema.card,

                    borderColor:
                      String(intervalo) ===
                      String(opcao)
                        ? tema.destaque
                        : tema.borda,
                  },
                ]}

              >

                <Text
                  style={[
                    styles.textoIntervalo,
                    {
                      color:
                        String(intervalo) ===
                        String(opcao)
                          ? '#FFFFFF'
                          : tema.texto,
                    },
                  ]}
                >
                  {opcao}h
                </Text>

              </Pressable>

            )
          )}

        </View>


        <TextInput

          value={intervalo}

          onChangeText={
            setIntervalo
          }

          style={[
            styles.input,
            {
              backgroundColor:
                tema.card,

              borderColor:
                tema.borda,

              color:
                tema.texto,
            },
          ]}

          placeholder="Outro intervalo em horas"

          placeholderTextColor={
            tema.textoSecundario
          }

          keyboardType="numeric"

        />


        {/* ================================= */}
        {/* QUANTIDADE POR DOSE */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Quantidade por dose
        </Text>


        <TextInput

          value={
            quantidadePorDose
          }

          onChangeText={
            setQuantidadePorDose
          }

          style={[
            styles.input,
            {
              backgroundColor:
                tema.card,

              borderColor:
                tema.borda,

              color:
                tema.texto,
            },
          ]}

          placeholder="Ex.: 1"

          placeholderTextColor={
            tema.textoSecundario
          }

          keyboardType="numeric"

        />


        {/* ================================= */}
        {/* ESTOQUE */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Estoque atual
        </Text>


        <TextInput

          value={
            quantidade
          }

          onChangeText={
            setQuantidade
          }

          style={[
            styles.input,
            {
              backgroundColor:
                tema.card,

              borderColor:
                tema.borda,

              color:
                tema.texto,
            },
          ]}

          placeholder="Quantidade disponível"

          placeholderTextColor={
            tema.textoSecundario
          }

          keyboardType="numeric"

        />


        {/* ================================= */}
        {/* REPETIR */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Repetir
        </Text>


        <View
          style={styles.dias}
        >

          {DIAS.map(
            (dia, index) => (

              <Pressable

                key={index}

                onPress={() =>
                  alternarDia(index)
                }

                style={[
                  styles.dia,

                  dias[index]
                    ? {
                        backgroundColor:
                          tema.destaque,

                        borderColor:
                          tema.destaque,
                      }
                    : {
                        backgroundColor:
                          tema.card,

                        borderColor:
                          tema.borda,
                      },
                ]}

              >

                <Text
                  style={[
                    styles.textoDia,
                    {
                      color:
                        dias[index]
                          ? '#FFFFFF'
                          : tema.texto,
                    },
                  ]}
                >
                  {dia}
                </Text>

              </Pressable>

            )
          )}

        </View>


        {/* ================================= */}
        {/* SOM */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Som
        </Text>


        <View
          style={styles.opcoes}
        >

          {[
            'Agudo',
            'Médio',
            'Grave',
          ].map(
            opcao => (

              <Pressable

                key={opcao}

                onPress={() =>
                  setSom(opcao)
                }

                style={[
                  styles.opcao,

                  {
                    backgroundColor:
                      som === opcao
                        ? tema.destaque
                        : tema.card,

                    borderColor:
                      som === opcao
                        ? tema.destaque
                        : tema.borda,
                  },
                ]}

              >

                <Text
                  style={[
                    styles.textoOpcao,
                    {
                      color:
                        som === opcao
                          ? '#FFFFFF'
                          : tema.texto,
                    },
                  ]}
                >
                  {opcao}
                </Text>

              </Pressable>

            )
          )}

        </View>


        {/* ================================= */}
        {/* VIBRAÇÃO */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Vibração
        </Text>


        <View
          style={styles.opcoes}
        >

          {[
            'Pulsar',
            'Seguir',
            'Longa',
          ].map(
            opcao => (

              <Pressable

                key={opcao}

                onPress={() =>
                  setVibracao(opcao)
                }

                style={[
                  styles.opcao,

                  {
                    backgroundColor:
                      vibracao === opcao
                        ? tema.destaque
                        : tema.card,

                    borderColor:
                      vibracao === opcao
                        ? tema.destaque
                        : tema.borda,
                  },
                ]}

              >

                <Text
                  style={[
                    styles.textoOpcao,
                    {
                      color:
                        vibracao === opcao
                          ? '#FFFFFF'
                          : tema.texto,
                    },
                  ]}
                >
                  {opcao}
                </Text>

              </Pressable>

            )
          )}

        </View>


        {/* ================================= */}
        {/* COR */}
        {/* ================================= */}

        <Text
          style={[
            styles.label,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Cor
        </Text>


        <View
          style={styles.cores}
        >

          {[
            '#3B82F6',
            '#6366F1',
            '#8B5CF6',
            '#EC4899',
            '#EF4444',
            '#F97316',
            '#EAB308',
            '#22C55E',
            '#14B8A6',
          ].map(
            corEscolhida => (

              <Pressable

                key={corEscolhida}

                onPress={() =>
                  setCor(
                    corEscolhida
                  )
                }

                style={[
                  styles.cor,

                  {
                    backgroundColor:
                      corEscolhida,

                    borderColor:
                      cor === corEscolhida
                        ? tema.texto
                        : tema.card,
                  },

                  cor === corEscolhida &&
                    styles.corSelecionada,
                ]}

              />

            )
          )}

        </View>


        {/* ================================= */}
        {/* SALVAR */}
        {/* ================================= */}

        <Pressable

          style={[
            styles.botaoSalvar,
            {
              backgroundColor:
                tema.destaque,
            },
          ]}

          onPress={
            salvarHorario
          }

        >

          <Text
            style={
              styles.textoSalvar
            }
          >
            Salvar
          </Text>

        </Pressable>


        {/* ================================= */}
        {/* EXCLUIR */}
        {/* ================================= */}

        {!novo && (

          <Pressable

            style={[
              styles.botaoExcluir,
              {
                borderColor:
                  tema.alerta,
              },
            ]}

            onPress={
              excluirHorario
            }

          >

            <Text
              style={[
                styles.textoExcluir,
                {
                  color:
                    tema.alerta,
                },
              ]}
            >
              Excluir medicamento
            </Text>

          </Pressable>

        )}

      </ScrollView>

    </View>

  );

}


// =============================================
// ESTILOS
// =============================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },


  scroll: {
    padding: 20,
    paddingBottom: 50,
  },


  // ===========================================
  // CABEÇALHO
  // ===========================================

  cabecalho: {
    height: 60,

    borderBottomWidth: 1,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 15,
  },


  botaoVoltar: {
    width: 42,

    height: 42,

    justifyContent: 'center',

    alignItems: 'center',
  },


  textoVoltar: {
    fontSize: 38,

    lineHeight: 42,
  },


  titulo: {
    fontSize: 20,

    fontWeight: '600',

    marginLeft: 5,
  },


  // ===========================================
  // CAMPOS
  // ===========================================

  label: {
    fontSize: 16,

    fontWeight: '600',

    marginTop: 20,

    marginBottom: 7,
  },


  explicacao: {
    fontSize: 13,

    lineHeight: 19,

    marginBottom: 9,
  },


  input: {
    height: 48,

    borderWidth: 1,

    borderRadius: 10,

    paddingHorizontal: 14,

    fontSize: 16,
  },


  inputHorario: {
    width: 125,

    height: 58,

    borderWidth: 1,

    borderRadius: 12,

    paddingHorizontal: 14,

    fontSize: 24,

    fontWeight: '600',

    textAlign: 'center',
  },


  linhaDose: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,
  },


  botaoAgora: {
    height: 58,

    flex: 1,

    borderWidth: 1,

    borderRadius: 12,

    justifyContent: 'center',

    alignItems: 'center',
  },


  textoAgora: {
    fontSize: 15,

    fontWeight: '600',
  },


  // ===========================================
  // INTERVALOS
  // ===========================================

  intervalos: {
    flexDirection: 'row',

    gap: 8,

    marginBottom: 10,
  },


  intervalo: {
    flex: 1,

    height: 43,

    borderWidth: 1,

    borderRadius: 10,

    justifyContent: 'center',

    alignItems: 'center',
  },


  textoIntervalo: {
    fontSize: 14,

    fontWeight: '600',
  },


  // ===========================================
  // DIAS
  // ===========================================

  dias: {
    flexDirection: 'row',

    justifyContent: 'space-between',
  },


  dia: {
    width: 42,

    height: 42,

    borderRadius: 21,

    justifyContent: 'center',

    alignItems: 'center',

    borderWidth: 1,
  },


  textoDia: {
    fontSize: 15,

    fontWeight: '600',
  },


  // ===========================================
  // OPÇÕES
  // ===========================================

  opcoes: {
    flexDirection: 'row',

    gap: 8,
  },


  opcao: {
    flex: 1,

    borderWidth: 1,

    borderRadius: 10,

    paddingVertical: 13,

    alignItems: 'center',
  },


  textoOpcao: {
    fontSize: 14,

    fontWeight: '600',
  },


  // ===========================================
  // CORES
  // ===========================================

  cores: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 14,

    alignItems: 'center',
  },


  cor: {
    width: 38,

    height: 38,

    borderRadius: 19,

    borderWidth: 2,
  },


  corSelecionada: {
    borderWidth: 4,
  },


  // ===========================================
  // SALVAR
  // ===========================================

  botaoSalvar: {
    marginTop: 40,

    borderRadius: 12,

    paddingVertical: 15,

    alignItems: 'center',
  },


  textoSalvar: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '600',
  },


  // ===========================================
  // EXCLUIR
  // ===========================================

  botaoExcluir: {
    marginTop: 15,

    borderWidth: 1,

    borderRadius: 12,

    paddingVertical: 14,

    alignItems: 'center',
  },


  textoExcluir: {
    fontSize: 16,

    fontWeight: '600',
  },

});