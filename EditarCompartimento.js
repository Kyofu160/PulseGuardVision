import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import {
  useHorarios,
} from './HorariosContext.js';


// =============================================
// TELA
// =============================================

export default function EditarCompartimento({

  compartimento,

  voltar,

  salvar,

  excluir,

}) {

  const {

    horarios = [],

    tema,

  } = useHorarios();


  const [

    horarioId,

    setHorarioId,

  ] = useState(

    compartimento.horarioId === undefined

      ? null

      : compartimento.horarioId

  );


  // ===========================================
  // SALVAR
  // ===========================================

  function salvarAlteracoes() {

    salvar({

      ...compartimento,

      horarioId,

    });

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

      {/* ===================================== */}
      {/* CABEÇALHO */}
      {/* ===================================== */}

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
          style={
            styles.botaoVoltar
          }
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
          Editar compartimento
        </Text>

      </View>


      <ScrollView

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.scroll
        }

      >

        {/* ================================= */}
        {/* TÍTULO */}
        {/* ================================= */}

        <Text
          style={[
            styles.tituloSecao,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Compartimento {compartimento.id}
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
          Escolha qual medicamento ficará
          neste compartimento.
        </Text>


        {/* ================================= */}
        {/* NENHUM REMÉDIO */}
        {/* ================================= */}

        <Pressable

          onPress={() =>
            setHorarioId(null)
          }

          style={[
            styles.opcao,

            {
              backgroundColor:
                horarioId === null
                  ? tema.destaque
                  : tema.card,

              borderColor:
                horarioId === null
                  ? tema.destaque
                  : tema.borda,
            },
          ]}

        >

          <View
            style={
              styles.conteudoOpcao
            }
          >

            <View
              style={[
                styles.icone,
                {
                  backgroundColor:
                    horarioId === null
                      ? 'rgba(255,255,255,0.18)'
                      : tema.destaqueClaro,
                },
              ]}
            >

              <Text
                style={[
                  styles.iconeTexto,
                  {
                    color:
                      horarioId === null
                        ? '#FFFFFF'
                        : tema.destaque,
                  },
                ]}
              >
                ∅
              </Text>

            </View>


            <View
              style={
                styles.textosOpcao
              }
            >

              <Text
                style={[
                  styles.nomeOpcao,
                  {
                    color:
                      horarioId === null
                        ? '#FFFFFF'
                        : tema.texto,
                  },
                ]}
              >
                Nenhum remédio
              </Text>


              <Text
                style={[
                  styles.descricaoOpcao,
                  {
                    color:
                      horarioId === null
                        ? 'rgba(255,255,255,0.8)'
                        : tema.textoSecundario,
                  },
                ]}
              >
                Deixar este compartimento vazio
              </Text>

            </View>


            {horarioId === null && (

              <Text
                style={
                  styles.check
                }
              >
                ✓
              </Text>

            )}

          </View>

        </Pressable>


        {/* ================================= */}
        {/* MEDICAMENTOS */}
        {/* ================================= */}

        <Text
          style={[
            styles.subtituloSecao,
            {
              color:
                tema.texto,
            },
          ]}
        >
          Medicamentos
        </Text>


        {horarios.map(
          horario => {

            const selecionado =
              horarioId ===
              horario.id;


            return (

              <Pressable

                key={
                  horario.id
                }

                onPress={() =>
                  setHorarioId(
                    horario.id
                  )
                }

                style={[
                  styles.opcao,

                  {
                    backgroundColor:
                      selecionado
                        ? tema.destaque
                        : tema.card,

                    borderColor:
                      selecionado
                        ? tema.destaque
                        : tema.borda,
                  },
                ]}

              >

                <View
                  style={
                    styles.conteudoOpcao
                  }
                >

                  {/* COR DO REMÉDIO */}

                  <View
                    style={[
                      styles.iconeRemedio,
                      {
                        backgroundColor:
                          horario.cor ||
                          tema.destaque,
                      },
                    ]}
                  />

                  <View
                    style={
                      styles.textosOpcao
                    }
                  >

                    <Text
                      style={[
                        styles.nomeOpcao,
                        {
                          color:
                            selecionado
                              ? '#FFFFFF'
                              : tema.texto,
                        },
                      ]}
                    >
                      {horario.nome}
                    </Text>


                    <Text
                      style={[
                        styles.descricaoOpcao,
                        {
                          color:
                            selecionado
                              ? 'rgba(255,255,255,0.8)'
                              : tema.textoSecundario,
                        },
                      ]}
                    >
                      {horario.quantidade || 0}{' '}
                      unidades disponíveis
                    </Text>

                  </View>


                  {selecionado && (

                    <Text
                      style={
                        styles.check
                      }
                    >
                      ✓
                    </Text>

                  )}

                </View>

              </Pressable>

            );

          }
        )}


        {/* ================================= */}
        {/* SALVAR */}
        {/* ================================= */}

        <Pressable

          onPress={
            salvarAlteracoes
          }

          style={[
            styles.botaoSalvar,
            {
              backgroundColor:
                tema.destaque,
            },
          ]}

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

        <Pressable

          onPress={() =>
            excluir(
              compartimento.id
            )
          }

          style={[
            styles.botaoExcluir,
            {
              borderColor:
                tema.alerta,
            },
          ]}

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
            Excluir compartimento
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

    justifyContent:
      'center',

    alignItems:
      'center',
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


  scroll: {
    padding: 20,

    paddingBottom: 50,
  },


  tituloSecao: {
    fontSize: 24,

    fontWeight: '700',

    marginBottom: 6,
  },


  explicacao: {
    fontSize: 14,

    lineHeight: 20,

    marginBottom: 20,
  },


  subtituloSecao: {
    fontSize: 18,

    fontWeight: '700',

    marginTop: 25,

    marginBottom: 10,
  },


  opcao: {
    borderWidth: 1,

    borderRadius: 14,

    padding: 14,

    marginBottom: 10,
  },


  conteudoOpcao: {
    flexDirection: 'row',

    alignItems: 'center',
  },


  icone: {
    width: 44,

    height: 44,

    borderRadius: 22,

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  iconeTexto: {
    fontSize: 24,

    fontWeight: '600',
  },


  iconeRemedio: {
    width: 16,

    height: 16,

    borderRadius: 8,

    marginHorizontal: 14,
  },


  textosOpcao: {
    flex: 1,
  },


  nomeOpcao: {
    fontSize: 16,

    fontWeight: '700',
  },


  descricaoOpcao: {
    fontSize: 13,

    marginTop: 3,
  },


  check: {
    color: '#FFFFFF',

    fontSize: 23,

    fontWeight: '700',

    marginLeft: 10,
  },


  botaoSalvar: {
    marginTop: 30,

    borderRadius: 12,

    paddingVertical: 15,

    alignItems: 'center',
  },


  textoSalvar: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '600',
  },


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