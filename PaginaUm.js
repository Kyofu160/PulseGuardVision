import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import {
  useHorarios,
} from './HorariosContext';

import EditarHorario from './EditarHorario';


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
// CALCULAR PRÓXIMA DOSE DO CARD
// =============================================

function calcularProximaDoseCard(horario) {

  if (
    !horario.ultimaDose ||
    !horario.intervalo
  ) {
    return {
      horario: '--:--',
      tempo: '',
    };
  }


  const agora = new Date();

  const minutosAgora =
    agora.getHours() * 60 +
    agora.getMinutes();


  const partes =
    horario.ultimaDose
      .split(':')
      .map(Number);


  if (
    partes.length !== 2 ||
    Number.isNaN(partes[0]) ||
    Number.isNaN(partes[1])
  ) {
    return {
      horario: '--:--',
      tempo: '',
    };
  }


  const ultimaDose =
    partes[0] * 60 +
    partes[1];


  const intervalo =
    Number(horario.intervalo) * 60;


  if (
    !intervalo ||
    intervalo <= 0
  ) {
    return {
      horario: '--:--',
      tempo: '',
    };
  }


  let proxima =
    ultimaDose + intervalo;


  while (
    proxima <= minutosAgora
  ) {

    proxima += intervalo;

  }


  const diasAdicionados =
    Math.floor(
      proxima / 1440
    );


  const minutosDoDia =
    proxima % 1440;


  const horas =
    Math.floor(
      minutosDoDia / 60
    );


  const minutos =
    minutosDoDia % 60;


  const data =
    new Date(agora);


  data.setDate(
    agora.getDate() +
    diasAdicionados
  );


  data.setHours(horas);

  data.setMinutes(minutos);

  data.setSeconds(0);

  data.setMilliseconds(0);


  const diferenca =
    Math.max(
      0,
      Math.round(
        (
          data.getTime() -
          agora.getTime()
        ) / 60000
      )
    );


  let texto = 'agora';


  if (diferenca >= 60) {

    const h =
      Math.floor(
        diferenca / 60
      );

    const m =
      diferenca % 60;


    texto =
      m === 0
        ? `em ${h}h`
        : `em ${h}h ${m}min`;

  } else if (diferenca > 1) {

    texto =
      `em ${diferenca} min`;

  }


  return {

    horario:
      `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`,

    tempo:
      texto,

  };

}


// =============================================
// TELA PRINCIPAL
// =============================================

export default function PaginaUm() {

  const {
    horarios,
    setHorarios,
    modoEscuro,
    alternarTema,
    tema,
    avisos,
  } = useHorarios();


  const [editar, setEditar] =
    React.useState(null);


  // ===========================================
  // EDITAR
  // ===========================================

  function abrirHorario(horario) {

    setEditar({
      horario,
      novo: false,
    });

  }


  // ===========================================
  // NOVO
  // ===========================================

  function novoHorario() {

    const novo = {

      id: Date.now(),

      nome: 'Novo remédio',

      intervalo: 8,

      ultimaDose: '08:00',

      quantidadePorDose: 1,

      // COMPATIBILIDADE
      inicio: '08:00',

      fim: '16:00',

      quantidade: 1,

      som: 'Agudo',

      vibracao: 'Pulsar',

      cor: '#4D9EFF',

      dias: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],

    };


    setEditar({
      horario: novo,
      novo: true,
    });

  }


  // ===========================================
  // SALVAR
  // ===========================================

  function salvarHorario(horario) {

    if (editar.novo) {

      setHorarios([
        ...horarios,
        horario,
      ]);

    } else {

      setHorarios(

        horarios.map(item =>
          item.id === horario.id
            ? horario
            : item
        )

      );

    }


    setEditar(null);

  }


  // ===========================================
  // EXCLUIR
  // ===========================================

  function excluirHorario(id) {

    setHorarios(

      horarios.filter(
        item => item.id !== id
      )

    );

    setEditar(null);

  }


  // ===========================================
  // MOSTRAR DIAS
  // ===========================================

  function mostrarDias(dias) {

    if (!dias) {
      return '';
    }


    return dias

      .map(
        (ativo, index) =>
          ativo
            ? DIAS[index]
            : null
      )

      .filter(Boolean)

      .join(' ');

  }


  // ===========================================
  // EDITOR
  // ===========================================

  if (editar) {

    return (

      <EditarHorario

        horario={editar.horario}

        novo={editar.novo}

        voltar={() =>
          setEditar(null)
        }

        salvar={salvarHorario}

        excluir={excluirHorario}

      />

    );

  }


  // ===========================================
  // PLANNER
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
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
              Planner
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
              Seus medicamentos
            </Text>

          </View>


          <Pressable

            onPress={alternarTema}

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

            <Text style={styles.iconeTema}>

              {modoEscuro
                ? '☀️'
                : '🌙'}

            </Text>

          </Pressable>

        </View>


        {/* ================================= */}
        {/* AVISOS */}
        {/* ================================= */}

        <View
          style={[
            styles.avisos,
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
              styles.tituloAvisos,
              {
                color:
                  tema.texto,
              },
            ]}
          >
            Avisos
          </Text>


          {avisos.length === 0 ? (

            <Text
              style={[
                styles.avisoVazio,
                {
                  color:
                    tema.textoSecundario,
                },
              ]}
            >
              Nenhum aviso no momento.
            </Text>

          ) : (

            avisos.map(aviso => (

              <View
                key={aviso.id}
                style={styles.itemAviso}
              >

                {/* ÍCONE DO AVISO */}

                <View
                  style={[
                    styles.iconeAviso,
                    {
                      backgroundColor:
                        aviso.tipo === 'estoque'
                          ? tema.alertaFundo
                          : tema.destaqueClaro,
                    },
                  ]}
                >

                  <Text
                    style={[
                      styles.textoIconeAviso,
                      {
                        color:
                          aviso.tipo === 'estoque'
                            ? tema.alerta
                            : tema.destaque,
                      },
                    ]}
                  >
                    {aviso.tipo === 'estoque'
                      ? '⚠'
                      : '⏰'}
                  </Text>

                </View>


                <View style={styles.conteudoAviso}>

                  <Text
                    style={[
                      styles.aviso,
                      {
                        color:
                          tema.texto,
                      },
                    ]}
                  >
                    {aviso.titulo}
                  </Text>


                  <Text
                    style={[
                      styles.subAviso,
                      {
                        color:
                          tema.textoSecundario,
                      },
                    ]}
                  >
                    {aviso.texto}
                  </Text>


                  {aviso.tempo && (

                    <Text
                      style={[
                        styles.tempoAviso,
                        {
                          color:
                            tema.destaque,
                        },
                      ]}
                    >
                      {aviso.tempo}
                    </Text>

                  )}

                </View>

              </View>

            ))

          )}

        </View>


        {/* ================================= */}
        {/* MEDICAMENTOS */}
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
          Medicamentos
        </Text>


        {horarios.map((horario) => {

          /*
           * IMPORTANTE:
           * Não existe mais Hook aqui dentro.
           * A função é normal, então o .map()
           * pode chamá-la sem quebrar as regras
           * dos Hooks do React.
           */

          const proximo =
            calcularProximaDoseCard(
              horario
            );


          return (

            <Pressable

              key={horario.id}

              style={[
                styles.card,
                {
                  backgroundColor:
                    tema.card,

                  borderColor:
                    tema.borda,
                },
              ]}

              onPress={() =>
                abrirHorario(horario)
              }

            >

              {/* ============================= */}
              {/* TOPO */}
              {/* ============================= */}

              <View style={styles.topoCard}>

                <View style={styles.areaNome}>

                  <Text
                    style={[
                      styles.nome,
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
                      styles.dose,
                      {
                        color:
                          tema.textoSecundario,
                      },
                    ]}
                  >
                    {horario.quantidadePorDose || 1}
                    {' '}
                    {(
                      horario.quantidadePorDose || 1
                    ) === 1
                      ? 'unidade por dose'
                      : 'unidades por dose'}
                  </Text>

                </View>


                <View
                  style={[
                    styles.indicadorCor,
                    {
                      backgroundColor:
                        horario.cor,
                    },
                  ]}
                />

              </View>


              {/* ============================= */}
              {/* PRÓXIMA DOSE */}
              {/* ============================= */}

              <View
                style={[
                  styles.proximaDose,
                  {
                    backgroundColor:
                      tema.destaqueClaro,
                  },
                ]}
              >

                <Text
                  style={[
                    styles.proximaLabel,
                    {
                      color:
                        tema.textoSecundario,
                    },
                  ]}
                >
                  Próxima dose
                </Text>


                <Text
                  style={[
                    styles.proximaHorario,
                    {
                      color:
                        tema.destaque,
                    },
                  ]}
                >
                  {proximo.horario}
                </Text>


                <Text
                  style={[
                    styles.proximaTempo,
                    {
                      color:
                        tema.textoSecundario,
                    },
                  ]}
                >
                  {proximo.tempo}
                </Text>

              </View>


              {/* ============================= */}
              {/* INFORMAÇÕES */}
              {/* ============================= */}

              <View
                style={styles.informacoes}
              >

                <Text
                  style={[
                    styles.info,
                    {
                      color:
                        tema.textoSecundario,
                    },
                  ]}
                >
                  Intervalo: {horario.intervalo}h
                </Text>


                <Text
                  style={[
                    styles.info,
                    {
                      color:
                        tema.textoSecundario,
                    },
                  ]}
                >
                  Última dose: {horario.ultimaDose}
                </Text>


                <Text
                  style={[
                    styles.info,
                    {
                      color:
                        tema.textoSecundario,
                    },
                  ]}
                >
                  Som: {horario.som}
                </Text>


                <Text
                  style={[
                    styles.info,
                    {
                      color:
                        tema.textoSecundario,
                    },
                  ]}
                >
                  Vibração: {horario.vibracao}
                </Text>


                <Text
                  style={[
                    styles.info,
                    {
                      color:
                        tema.textoSecundario,
                    },
                  ]}
                >
                  Dias: {mostrarDias(horario.dias)}
                </Text>

              </View>


              {/* ============================= */}
              {/* ESTOQUE */}
              {/* ============================= */}

              <Text
                style={[
                  styles.quantidade,
                  {
                    color:
                      tema.textoSecundario,
                  },
                ]}
              >
                Estoque: {horario.quantidade} unidades
              </Text>

            </Pressable>

          );

        })}


        {/* ================================= */}
        {/* NOVO */}
        {/* ================================= */}

        <Pressable

          style={[
            styles.botaoNovo,
            {
              backgroundColor:
                tema.destaque,

              borderColor:
                tema.destaque,
            },
          ]}

          onPress={novoHorario}

        >

          <Text
            style={styles.textoBotao}
          >
            + Novo medicamento
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


  // ===========================================
  // CABEÇALHO
  // ===========================================

  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    alignItems: 'center',
  },


  iconeTema: {
    fontSize: 21,
  },


  // ===========================================
  // AVISOS
  // ===========================================

  avisos: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
  },


  tituloAvisos: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },


  itemAviso: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },


  iconeAviso: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },


  textoIconeAviso: {
    fontSize: 19,
  },


  conteudoAviso: {
    flex: 1,
  },


  aviso: {
    fontSize: 15,
    fontWeight: '600',
  },


  subAviso: {
    fontSize: 14,
    marginTop: 3,
  },


  tempoAviso: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },


  avisoVazio: {
    fontSize: 14,
  },


  // ===========================================
  // MEDICAMENTOS
  // ===========================================

  tituloSecao: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },


  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },


  topoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  areaNome: {
    flex: 1,
  },


  nome: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },


  dose: {
    fontSize: 13,
  },


  indicadorCor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 10,
  },


  // ===========================================
  // PRÓXIMA DOSE
  // ===========================================

  proximaDose: {
    borderRadius: 13,
    padding: 13,
    marginTop: 14,
  },


  proximaLabel: {
    fontSize: 12,
    marginBottom: 3,
  },


  proximaHorario: {
    fontSize: 27,
    fontWeight: '700',
  },


  proximaTempo: {
    fontSize: 13,
    marginTop: 2,
  },


  // ===========================================
  // INFORMAÇÕES
  // ===========================================

  informacoes: {
    marginTop: 13,
  },


  info: {
    fontSize: 14,
    marginBottom: 3,
  },


  quantidade: {
    marginTop: 8,
    fontSize: 13,
  },


  // ===========================================
  // NOVO
  // ===========================================

  botaoNovo: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 5,
  },


  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

});