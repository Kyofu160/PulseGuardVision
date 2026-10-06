import React, {
  createContext,
  useContext,
  useState,
  useMemo,
} from 'react';


// =============================================
// CONTEXTO
// =============================================

const HorariosContext = createContext();


// =============================================
// MEDICAMENTOS INICIAIS
// =============================================

const horariosIniciais = [

  {
    id: 1,
    nome: 'Dipirona',

    intervalo: 8,
    ultimaDose: '08:00',

    quantidadePorDose: 1,

    inicio: '08:00',
    fim: '16:00',

    quantidade: 5,

    som: 'Agudo',
    vibracao: 'Pulsar',

    cor: '#3B82F6',

    dias: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },


  {
    id: 2,
    nome: 'Neosaldina',

    intervalo: 6,
    ultimaDose: '10:00',

    quantidadePorDose: 1,

    inicio: '10:00',
    fim: '16:00',

    quantidade: 11,

    som: 'Grave',
    vibracao: 'Seguir',

    cor: '#6366F1',

    dias: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },


  {
    id: 3,
    nome: 'Dorflex',

    intervalo: 12,
    ultimaDose: '09:00',

    quantidadePorDose: 1,

    inicio: '09:00',
    fim: '21:00',

    quantidade: 5,

    som: 'Médio',
    vibracao: 'Longa',

    cor: '#8B5CF6',

    dias: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },

];


// =============================================
// COMPARTIMENTOS INICIAIS
// =============================================

const compartimentosIniciais = [

  {
    id: 1,
    horarioId: 1,
  },

  {
    id: 2,
    horarioId: 2,
  },

  {
    id: 3,
    horarioId: 3,
  },

];


// =============================================
// TEMAS
// =============================================

const temaClaro = {

  fundo: '#F4F7FB',

  card: '#FFFFFF',

  cardSecundario: '#EEF4FF',

  texto: '#172033',

  textoSecundario: '#64748B',

  borda: '#D8E1EF',

  destaque: '#2563EB',

  destaqueClaro: '#DBEAFE',

  alerta: '#DC2626',

  alertaFundo: '#FEF2F2',

  sucesso: '#16A34A',

  sucessoFundo: '#F0FDF4',

};


const temaEscuro = {

  fundo: '#071426',

  card: '#0D1F38',

  cardSecundario: '#142D4D',

  texto: '#F1F5F9',

  textoSecundario: '#AFC1D8',

  borda: '#234264',

  destaque: '#4F8CFF',

  destaqueClaro: '#173765',

  alerta: '#FF6B6B',

  alertaFundo: '#3A1C25',

  sucesso: '#4ADE80',

  sucessoFundo: '#123323',

};


// =============================================
// HORÁRIO → MINUTOS
// =============================================

function horarioParaMinutos(horario) {

  if (!horario) {
    return 0;
  }

  const partes =
    horario.split(':').map(Number);

  if (
    partes.length !== 2 ||
    Number.isNaN(partes[0]) ||
    Number.isNaN(partes[1])
  ) {
    return 0;
  }

  return (
    partes[0] * 60 +
    partes[1]
  );

}


// =============================================
// CALCULAR PRÓXIMA DOSE
// =============================================

function calcularProximaDose(horario) {

  if (
    !horario ||
    !horario.ultimaDose ||
    !horario.intervalo
  ) {
    return null;
  }

  const agora = new Date();

  const minutosAgora =
    agora.getHours() * 60 +
    agora.getMinutes();

  const ultimaDose =
    horarioParaMinutos(
      horario.ultimaDose
    );

  const intervalo =
    Number(horario.intervalo) * 60;

  if (
    !intervalo ||
    intervalo <= 0
  ) {
    return null;
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

  const data =
    new Date(agora);

  data.setDate(
    agora.getDate() +
    diasAdicionados
  );

  data.setHours(
    Math.floor(
      minutosDoDia / 60
    )
  );

  data.setMinutes(
    minutosDoDia % 60
  );

  data.setSeconds(0);
  data.setMilliseconds(0);

  return data;

}


// =============================================
// TEXTO DO TEMPO
// =============================================

function textoTempo(data) {

  if (!data) {
    return '';
  }

  const agora =
    new Date();

  const diferenca =
    data.getTime() -
    agora.getTime();

  const minutos =
    Math.max(
      0,
      Math.round(
        diferenca / 60000
      )
    );

  if (minutos < 60) {

    if (minutos <= 1) {
      return 'agora';
    }

    return `em ${minutos} min`;

  }

  const horas =
    Math.floor(
      minutos / 60
    );

  const minutosRestantes =
    minutos % 60;

  if (
    minutosRestantes === 0
  ) {
    return `em ${horas}h`;
  }

  return (
    `em ${horas}h ` +
    `${minutosRestantes}min`
  );

}


// =============================================
// PROVIDER
// =============================================

export function HorariosProvider({
  children,
}) {

  const [
    horarios,
    setHorarios,
  ] = useState(
    horariosIniciais
  );


  const [
    compartimentos,
    setCompartimentos,
  ] = useState(
    compartimentosIniciais
  );


  const [
    modoEscuro,
    setModoEscuro,
  ] = useState(true);


  // ===========================================
  // TEMA
  // ===========================================

  function alternarTema() {

    setModoEscuro(
      atual => !atual
    );

  }


  const tema =
    modoEscuro
      ? temaEscuro
      : temaClaro;


  // ===========================================
  // AVISOS DE ESTOQUE
  // ===========================================

  const avisosEstoque =
    useMemo(() => {

      return horarios

        .filter(
          horario =>
            Number(
              horario.quantidade
            ) <= 5
        )

        .sort(
          (a, b) =>
            Number(a.quantidade) -
            Number(b.quantidade)
        );

    }, [horarios]);


  // ===========================================
  // PRÓXIMAS DOSES
  // ===========================================

  const proximosHorarios =
    useMemo(() => {

      return horarios

        .map(horario => {

          const proximo =
            calcularProximaDose(
              horario
            );

          let proximoTexto = '';

          if (proximo) {

            proximoTexto =
              `${String(
                proximo.getHours()
              ).padStart(2, '0')}:${String(
                proximo.getMinutes()
              ).padStart(2, '0')}`;

          }

          return {

            ...horario,

            proximo,

            proximoTexto,

            textoTempo:
              textoTempo(proximo),

          };

        })

        .filter(
          horario =>
            horario.proximo !== null
        )

        .sort(
          (a, b) =>
            a.proximo.getTime() -
            b.proximo.getTime()
        );

    }, [horarios]);


  // ===========================================
  // AVISOS
  // ===========================================

  const avisos =
    useMemo(() => {

      const resultado = [];


      // -----------------------------------------
      // ESTOQUE
      // -----------------------------------------

      avisosEstoque.forEach(
        horario => {

          resultado.push({

            tipo: 'estoque',

            id:
              `estoque-${horario.id}`,

            nome:
              horario.nome,

            quantidade:
              horario.quantidade,

            titulo:
              `${horario.nome} está acabando`,

            texto:
              `Restam ${horario.quantidade} unidades.`,

          });

        }
      );


      // -----------------------------------------
      // PRÓXIMAS DOSES
      // -----------------------------------------

      proximosHorarios
        .slice(0, 3)
        .forEach(
          horario => {

            resultado.push({

              tipo: 'proximo',

              id:
                `proximo-${horario.id}`,

              nome:
                horario.nome,

              horario:
                horario.proximoTexto,

              titulo:
                'Próxima dose',

              texto:
                `${horario.nome} às ${horario.proximoTexto}`,

              tempo:
                horario.textoTempo,

            });

          }
        );


      return resultado;

    }, [
      avisosEstoque,
      proximosHorarios,
    ]);


  // ===========================================
  // VALOR DO CONTEXTO
  // ===========================================

  const valor = {

    horarios,

    setHorarios,

    compartimentos,

    setCompartimentos,

    modoEscuro,

    alternarTema,

    tema,

    avisos,

    avisosEstoque,

    proximosHorarios,

  };


  return (

    <HorariosContext.Provider
      value={valor}
    >

      {children}

    </HorariosContext.Provider>

  );

}


// =============================================
// HOOK
// =============================================

export function useHorarios() {

  return useContext(
    HorariosContext
  );

}