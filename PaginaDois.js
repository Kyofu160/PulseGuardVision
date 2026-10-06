import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';

import {
  useHorarios,
} from './HorariosContext';

import EditarCompartimento from './EditarCompartimento';


// =============================================
// PÁGINA
// =============================================

export default function PaginaDois() {

  const {

    horarios = [],

    compartimentos = [],

    setCompartimentos,

    modoEscuro,

    alternarTema,

    tema,

  } = useHorarios();


  const [
    editar,
    setEditar,
  ] = React.useState(null);


  // ===========================================
  // ABRIR COMPARTIMENTO
  // ===========================================

  function abrirCompartimento(
    compartimento
  ) {

    setEditar(compartimento);

  }


  // ===========================================
  // NOVO COMPARTIMENTO
  // ===========================================

  function novoCompartimento() {

    const ids =
      compartimentos.map(
        item => Number(item.id)
      );

    let novoId = 1;

    while (
      ids.includes(novoId)
    ) {
      novoId++;
    }

    const novo = {

      id: novoId,

      horarioId: null,

    };

    setCompartimentos([

      ...compartimentos,

      novo,

    ]);

    setEditar(novo);

  }


  // ===========================================
  // SALVAR COMPARTIMENTO
  // ===========================================

  function salvarCompartimento(
    compartimentoAtualizado
  ) {

    const antigo =
      compartimentos.find(
        item =>
          item.id ===
          compartimentoAtualizado.id
      );


    const novoHorarioId =
      compartimentoAtualizado.horarioId;


    // =========================================
    // SE ESCOLHEU NENHUM REMÉDIO
    // =========================================

    if (
      novoHorarioId === null ||
      novoHorarioId === undefined
    ) {

      setCompartimentos(

        compartimentos.map(
          item =>
            item.id ===
            compartimentoAtualizado.id

              ? {
                  ...item,
                  horarioId: null,
                }

              : item
        )

      );

      setEditar(null);

      return;

    }


    // =========================================
    // ENCONTRAR ONDE O REMÉDIO JÁ ESTÁ
    // =========================================

    const outroCompartimento =
      compartimentos.find(
        item =>
          item.horarioId ===
          novoHorarioId &&
          item.id !==
          compartimentoAtualizado.id
      );


    // =========================================
    // TROCAR OS REMÉDIOS
    // =========================================

    if (outroCompartimento) {

      const remedioAntigo =
        antigo
          ? antigo.horarioId
          : null;


      setCompartimentos(

        compartimentos.map(
          item => {

            // O compartimento que está
            // sendo editado recebe
            // o novo remédio.

            if (
              item.id ===
              compartimentoAtualizado.id
            ) {

              return {

                ...item,

                horarioId:
                  novoHorarioId,

              };

            }


            // O compartimento que já tinha
            // esse remédio recebe o antigo.

            if (
              item.id ===
              outroCompartimento.id
            ) {

              return {

                ...item,

                horarioId:
                  remedioAntigo,

              };

            }


            return item;

          }
        )

      );

    } else {

      // =======================================
      // REMÉDIO ESTAVA LIVRE
      // =======================================

      setCompartimentos(

        compartimentos.map(
          item =>
            item.id ===
            compartimentoAtualizado.id

              ? {
                  ...item,
                  horarioId:
                    novoHorarioId,
                }

              : item
        )

      );

    }


    setEditar(null);

  }


  // ===========================================
  // EXCLUIR COMPARTIMENTO
  // ===========================================

  function excluirCompartimento(
    id
  ) {

    Alert.alert(

      'Excluir compartimento',

      'Tem certeza que deseja excluir este compartimento? O medicamento não será excluído.',

      [

        {
          text: 'Cancelar',

          style: 'cancel',

        },

        {

          text: 'Excluir',

          style: 'destructive',

          onPress: () => {

            setCompartimentos(

              compartimentos.filter(
                item =>
                  item.id !== id
              )

            );

            setEditar(null);

          },

        },

      ]

    );

  }


  // ===========================================
  // ENCONTRAR REMÉDIO
  // ===========================================

  function encontrarHorario(
    horarioId
  ) {

    return horarios.find(
      horario =>
        horario.id ===
        horarioId
    );

  }


  // ===========================================
  // EDITOR
  // ===========================================

  if (editar) {

    return (

      <EditarCompartimento

        compartimento={editar}

        voltar={() =>
          setEditar(null)
        }

        salvar={
          salvarCompartimento
        }

        excluir={
          excluirCompartimento
        }

      />

    );

  }


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

        <View style={styles.cabecalho}>

          <View>

            <Text
              style={[
                styles.titulo,
                {
                  color:
                    tema.texto,
                },
              ]}
            >
              Compartimentos
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
              Organização dos seus remédios
            </Text>

          </View>


          <Pressable

            onPress={
              alternarTema
            }

            style={[
              styles.botaoTema,
              {
                backgroundColor:
                  tema.card,

                borderColor:
                  tema.borda,
              },
            ]}

          >

            <Text
              style={
                styles.iconeTema
              }
            >
              {modoEscuro
                ? '☀️'
                : '🌙'}
            </Text>

          </Pressable>

        </View>


        {/* ================================= */}
        {/* INFORMAÇÃO */}
        {/* ================================= */}

        <View
          style={[
            styles.infoBox,
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
              styles.infoTitulo,
              {
                color:
                  tema.texto,
              },
            ]}
          >
            Seus compartimentos
          </Text>


          <Text
            style={[
              styles.infoTexto,
              {
                color:
                  tema.textoSecundario,
              },
            ]}
          >
            Toque em um compartimento
            para escolher qual remédio
            ficará nele.
          </Text>

        </View>


        {/* ================================= */}
        {/* COMPARTIMENTOS */}
        {/* ================================= */}

        {compartimentos.map(
          compartimento => {

            const horario =
              encontrarHorario(
                compartimento.horarioId
              );


            return (

              <Pressable

                key={
                  compartimento.id
                }

                onPress={() =>
                  abrirCompartimento(
                    compartimento
                  )
                }

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

                {/* ======================= */}
                {/* CABEÇALHO */}
                {/* ======================= */}

                <View
                  style={
                    styles.cabecalhoCard
                  }
                >

                  <View
                    style={
                      styles.numeroContainer
                    }
                  >

                    <Text
                      style={[
                        styles.numero,
                        {
                          color:
                            tema.destaque,
                        },
                      ]}
                    >
                      {compartimento.id}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.tituloCardContainer
                    }
                  >

                    <Text
                      style={[
                        styles.nomeCompartimento,
                        {
                          color:
                            tema.texto,
                        },
                      ]}
                    >
                      Compartimento{' '}
                      {compartimento.id}
                    </Text>


                    <Text
                      style={[
                        styles.toque,
                        {
                          color:
                            tema.textoSecundario,
                        },
                      ]}
                    >
                      Toque para editar
                    </Text>

                  </View>


                  {horario && (

                    <View
                      style={[
                        styles.indicadorCor,
                        {
                          backgroundColor:
                            horario.cor,
                        },
                      ]}
                    />

                  )}

                </View>


                {/* ======================= */}
                {/* DIVISÓRIA */}
                {/* ======================= */}

                <View
                  style={[
                    styles.divisoria,
                    {
                      backgroundColor:
                        tema.borda,
                    },
                  ]}
                />


                {/* ======================= */}
                {/* REMÉDIO */}
                {/* ======================= */}

                {horario ? (

                  <View
                    style={
                      styles.remedioArea
                    }
                  >

                    <Text
                      style={[
                        styles.remedio,
                        {
                          color:
                            tema.texto,
                        },
                      ]}
                    >
                      {horario.nome}
                    </Text>


                    <Text
                      style={[
                        styles.horario,
                        {
                          color:
                            tema.destaque,
                        },
                      ]}
                    >
                      {horario.ultimaDose ||
                        horario.inicio ||
                        '--:--'}
                    </Text>

                  </View>

                ) : (

                  <View
                    style={
                      styles.vazio
                    }
                  >

                    <Text
                      style={[
                        styles.vazioTitulo,
                        {
                          color:
                            tema.texto,
                        },
                      ]}
                    >
                      Nenhum remédio
                    </Text>


                    <Text
                      style={[
                        styles.vazioTexto,
                        {
                          color:
                            tema.textoSecundario,
                        },
                      ]}
                    >
                      Toque para escolher
                    </Text>

                  </View>

                )}


                {/* ======================= */}
                {/* QUANTIDADE */}
                {/* ======================= */}

                {horario && (

                  <View
                    style={
                      styles.rodapeCard
                    }
                  >

                    <Text
                      style={[
                        styles.quantidade,
                        {
                          color:
                            tema.textoSecundario,
                        },
                      ]}
                    >
                      {horario.quantidade}{' '}
                      unidades
                    </Text>


                    <Text
                      style={[
                        styles.seta,
                        {
                          color:
                            tema.destaque,
                        },
                      ]}
                    >
                      ›
                    </Text>

                  </View>

                )}

              </Pressable>

            );

          }
        )}


        {/* ================================= */}
        {/* NOVO COMPARTIMENTO */}
        {/* ================================= */}

        <Pressable

          onPress={
            novoCompartimento
          }

          style={[
            styles.botaoNovo,
            {
              backgroundColor:
                tema.destaque,

              borderColor:
                tema.destaque,
            },
          ]}

        >

          <Text
            style={
              styles.textoBotaoNovo
            }
          >
            + Novo compartimento
          </Text>

        </Pressable>


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
    padding: 18,
    paddingBottom: 40,
  },


  cabecalho: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

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


  botaoTema: {
    width: 48,

    height: 48,

    borderRadius: 24,

    borderWidth: 1,

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  iconeTema: {
    fontSize: 21,
  },


  infoBox: {
    borderWidth: 1,

    borderRadius: 16,

    padding: 16,

    marginBottom: 18,
  },


  infoTitulo: {
    fontSize: 16,

    fontWeight: '700',

    marginBottom: 5,
  },


  infoTexto: {
    fontSize: 14,

    lineHeight: 20,
  },


  card: {
    borderWidth: 1,

    borderRadius: 18,

    padding: 16,

    marginBottom: 14,
  },


  cabecalhoCard: {
    flexDirection: 'row',

    alignItems: 'center',
  },


  numeroContainer: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor:
      '#173765',

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  numero: {
    fontSize: 18,

    fontWeight: '700',
  },


  tituloCardContainer: {
    flex: 1,

    marginLeft: 12,
  },


  nomeCompartimento: {
    fontSize: 16,

    fontWeight: '700',
  },


  toque: {
    fontSize: 12,

    marginTop: 3,
  },


  indicadorCor: {
    width: 22,

    height: 22,

    borderRadius: 11,
  },


  divisoria: {
    height: 1,

    marginVertical: 14,
  },


  remedioArea: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',
  },


  remedio: {
    fontSize: 18,

    fontWeight: '600',

    flex: 1,
  },


  horario: {
    fontSize: 15,

    fontWeight: '600',
  },


  quantidade: {
    fontSize: 13,
  },


  rodapeCard: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginTop: 14,
  },


  seta: {
    fontSize: 28,

    lineHeight: 24,
  },


  vazio: {
    paddingVertical: 8,
  },


  vazioTitulo: {
    fontSize: 17,

    fontWeight: '600',
  },


  vazioTexto: {
    fontSize: 13,

    marginTop: 4,
  },


  botaoNovo: {
    borderRadius: 14,

    paddingVertical: 15,

    alignItems: 'center',

    marginTop: 5,
  },


  textoBotaoNovo: {
    color: '#FFFFFF',

    fontSize: 16,

    fontWeight: '700',
  },

});