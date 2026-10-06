import {
  PermissionsAndroid,
  Platform,
} from 'react-native';

import RNBluetoothClassic from 'react-native-bluetooth-classic';


// =============================================
// COMANDOS DO ARDUINO
// =============================================

export const COMANDOS = {

  ALERTA_COMPLETO:
    'DEMO|ALERTA|COMPLETO',

  LED_PISCAR:
    'DEMO|LED|PISCAR',

  BUZZER_TOCAR:
    'DEMO|BUZZER|TOCAR',

  BUZZER_PARAR:
    'DEMO|BUZZER|PARAR',

  VIBRADOR_LIGAR:
    'DEMO|VIBRADOR|LIGAR',

  VIBRADOR_PARAR:
    'DEMO|VIBRADOR|PARAR',

  PARAR_TUDO:
    'DEMO|PARAR',

};


// =============================================
// DISPOSITIVO ATUAL
// =============================================

let dispositivoHC05 = null;


// =============================================
// ERRO PARA TEXTO
// =============================================

function textoErro(erro) {

  if (!erro) {
    return 'Erro desconhecido.';
  }


  if (
    typeof erro === 'string'
  ) {

    return erro;

  }


  if (erro.message) {

    return erro.message;

  }


  return String(erro);

}


// =============================================
// PERMISSÃO BLUETOOTH
// =============================================

async function pedirPermissaoBluetooth() {

  if (
    Platform.OS !== 'android'
  ) {

    return true;

  }


  const versaoAndroid =
    Number(
      Platform.Version
    );


  // Android 11 ou inferior

  if (
    versaoAndroid < 31
  ) {

    return true;

  }


  const permissao =
    PermissionsAndroid
      .PERMISSIONS
      .BLUETOOTH_CONNECT;


  try {

    const jaPermitido =
      await PermissionsAndroid.check(
        permissao
      );


    if (jaPermitido) {

      return true;

    }


    const resultado =
      await PermissionsAndroid.request(

        permissao,

        {
          title:
            'Permissão para Bluetooth',

          message:
            'O PulseGuardVision precisa acessar dispositivos Bluetooth próximos para se conectar ao HC-05.',

          buttonPositive:
            'Permitir',

          buttonNegative:
            'Cancelar',
        }

      );


    return (
      resultado ===
      PermissionsAndroid.RESULTS.GRANTED
    );

  } catch (erro) {

    console.log(
      'Erro ao solicitar permissão Bluetooth:',
      erro
    );


    return false;

  }

}


// =============================================
// VERIFICAR BLUETOOTH
// =============================================

async function verificarBluetooth() {

  const permissao =
    await pedirPermissaoBluetooth();


  if (!permissao) {

    return {

      ok: false,

      motivo:
        'Permissão Bluetooth não autorizada.',

    };

  }


  try {

    const disponivel =
      await RNBluetoothClassic
        .isBluetoothAvailable();


    if (!disponivel) {

      return {

        ok: false,

        motivo:
          'Bluetooth não disponível neste celular.',

      };

    }


    const ligado =
      await RNBluetoothClassic
        .isBluetoothEnabled();


    if (!ligado) {

      return {

        ok: false,

        motivo:
          'O Bluetooth do celular está desligado.',

      };

    }


    return {

      ok: true,

    };

  } catch (erro) {

    return {

      ok: false,

      motivo:
        'Não foi possível verificar o Bluetooth: ' +
        textoErro(erro),

    };

  }

}


// =============================================
// ENCONTRAR HC-05 PAREADO
// =============================================

async function encontrarHC05() {

  try {

    const dispositivos =
      await RNBluetoothClassic
        .getBondedDevices();


    console.log(
      'Dispositivos Bluetooth pareados:',
      dispositivos.map(
        dispositivo => ({
          nome:
            dispositivo.name,

          endereco:
            dispositivo.address,
        })
      )
    );


    const hc05 =
      dispositivos.find(
        dispositivo => {

          const nome =
            (
              dispositivo.name ||
              ''
            )
              .toUpperCase()
              .replace(
                /[^A-Z0-9]/g,
                ''
              );


          return (
            nome === 'HC05' ||
            nome.includes('HC05')
          );

        }
      );


    if (!hc05) {

      return {

        ok: false,

        motivo:
          'HC-05 não encontrado entre os dispositivos pareados.',

      };

    }


    return {

      ok: true,

      dispositivo:
        hc05,

    };

  } catch (erro) {

    return {

      ok: false,

      motivo:
        'Não foi possível acessar os dispositivos pareados: ' +
        textoErro(erro),

    };

  }

}


// =============================================
// STATUS DO HC-05
// =============================================

export async function statusHC05() {

  if (!dispositivoHC05) {

    return {

      conectado: false,

    };

  }


  try {

    const conectado =
      await dispositivoHC05
        .isConnected();


    if (!conectado) {

      dispositivoHC05 =
        null;


      return {

        conectado: false,

      };

    }


    return {

      conectado: true,

      nome:
        dispositivoHC05.name,

      endereco:
        dispositivoHC05.address,

    };

  } catch (erro) {

    dispositivoHC05 =
      null;


    return {

      conectado: false,

    };

  }

}


// =============================================
// CONECTAR AO HC-05
// =============================================
//
// ESTA FUNÇÃO SÓ É EXECUTADA QUANDO:
// 1. usuário toca em "Conectar HC-05"
// 2. usuário toca em "Ativar Arduino agora"
//
// Não existe conexão automática ao abrir a página.
// =============================================

export async function conectarHC05() {

  console.log(
    'Tentando conectar ao HC-05...'
  );


  // ===========================================
  // VERIFICAR BLUETOOTH
  // ===========================================

  const verificacao =
    await verificarBluetooth();


  if (!verificacao.ok) {

    console.log(
      verificacao.motivo
    );


    return {

      ok: false,

      simulado: true,

      conectado: false,

      message:
        verificacao.motivo,

    };

  }


  try {

    // =========================================
    // VERIFICAR SE JÁ EXISTE CONEXÃO
    // =========================================

    if (dispositivoHC05) {

      try {

        const conectado =
          await dispositivoHC05
            .isConnected();


        if (conectado) {

          console.log(
            'HC-05 já está conectado.'
          );


          return {

            ok: true,

            simulado: false,

            conectado: true,

            nome:
              dispositivoHC05.name,

            endereco:
              dispositivoHC05.address,

            message:
              'Comunicação Bluetooth ativa.',

          };

        }

      } catch (erro) {

        dispositivoHC05 =
          null;

      }

    }


    // =========================================
    // PROCURAR HC-05 PAREADO
    // =========================================

    const encontrado =
      await encontrarHC05();


    if (!encontrado.ok) {

      console.log(
        encontrado.motivo
      );


      return {

        ok: false,

        simulado: true,

        conectado: false,

        message:
          encontrado.motivo,

      };

    }


    dispositivoHC05 =
      encontrado.dispositivo;


    console.log(
      'HC-05 encontrado:',
      dispositivoHC05.name,
      dispositivoHC05.address
    );


    // =========================================
    // VERIFICAR SE JÁ ESTÁ CONECTADO
    // =========================================

    const jaConectado =
      await dispositivoHC05
        .isConnected();


    if (!jaConectado) {

      console.log(
        'Abrindo conexão Bluetooth...'
      );


      const conectado =
        await dispositivoHC05.connect({

          CONNECTOR_TYPE:
            'rfcomm',

          CONNECTION_TYPE:
            'delimited',

          DELIMITER:
            '\n',

          DEVICE_CHARSET:
            'utf-8',

        });


      if (!conectado) {

        throw new Error(
          'O HC-05 foi encontrado, mas a conexão não foi estabelecida.'
        );

      }

    }


    console.log(
      'HC-05 conectado com sucesso.'
    );


    return {

      ok: true,

      simulado: false,

      conectado: true,

      nome:
        dispositivoHC05.name,

      endereco:
        dispositivoHC05.address,

      message:
        'Comunicação Bluetooth ativa.',

    };

  } catch (erro) {

    console.log(
      'Erro ao conectar HC-05:',
      erro
    );


    dispositivoHC05 =
      null;


    return {

      ok: false,

      simulado: true,

      conectado: false,

      message:
        'Não foi possível conectar ao HC-05: ' +
        textoErro(erro),

    };

  }

}


// =============================================
// DESCONECTAR HC-05
// =============================================

export async function desconectarHC05() {

  if (!dispositivoHC05) {

    return {

      ok: true,

      conectado: false,

      message:
        'HC-05 não conectado.',

    };

  }


  try {

    const conectado =
      await dispositivoHC05
        .isConnected();


    if (conectado) {

      await dispositivoHC05
        .disconnect();

    }


    dispositivoHC05 =
      null;


    console.log(
      'HC-05 desconectado manualmente.'
    );


    return {

      ok: true,

      conectado: false,

      message:
        'HC-05 desconectado.',

    };

  } catch (erro) {

    console.log(
      'Erro ao desconectar HC-05:',
      erro
    );


    dispositivoHC05 =
      null;


    return {

      ok: false,

      conectado: false,

      message:
        'Erro ao desconectar: ' +
        textoErro(erro),

    };

  }

}


// =============================================
// ENVIAR COMANDO AO ARDUINO
// =============================================
//
// conectarSeNecessario = true
// somente quando "Ativar Arduino agora"
// for pressionado.
//
// Nos outros comandos NÃO reconecta sozinho.
// =============================================

export async function enviarComandoArduino(
  comando,
  conectarSeNecessario = false
) {

  console.log(
    '================================='
  );

  console.log(
    'COMANDO PARA O ARDUINO'
  );

  console.log(
    comando
  );

  console.log(
    '================================='
  );


  try {

    // =========================================
    // VERIFICAR SE ESTÁ CONECTADO
    // =========================================

    let conectado = false;


    if (dispositivoHC05) {

      try {

        conectado =
          await dispositivoHC05
            .isConnected();

      } catch (erro) {

        conectado =
          false;

        dispositivoHC05 =
          null;

      }

    }


    // =========================================
    // PODE CONECTAR AUTOMATICAMENTE?
    // =========================================
    //
    // Isso só acontece quando a Página 3
    // envia "true", que será somente no botão
    // Ativar Arduino.
    // =========================================

    if (
      !conectado &&
      conectarSeNecessario
    ) {

      const conexao =
        await conectarHC05();


      if (
        conexao.ok &&
        conexao.simulado === false
      ) {

        conectado =
          true;

      } else {

        console.log(
          'HC-05 indisponível. Usando simulação.'
        );


        return {

          ok: true,

          simulado: true,

          conectado: false,

          comando,

          message:
            conexao.message ||
            'HC-05 não conectado. Usando modo de simulação.',

        };

      }

    }


    // =========================================
    // NÃO ESTÁ CONECTADO
    // E NÃO PODE CONECTAR AUTOMATICAMENTE
    // =========================================

    if (!conectado) {

      return {

        ok: true,

        simulado: true,

        conectado: false,

        comando,

        message:
          'HC-05 não conectado. Usando modo de simulação.',

      };

    }


    // =========================================
    // ENVIAR
    // =========================================

    const mensagem =
      comando + '\n';


    console.log(
      'Enviando para HC-05:',
      mensagem
    );


    const enviado =
      await dispositivoHC05.write(
        mensagem,
        'utf-8'
      );


    if (!enviado) {

      throw new Error(
        'O HC-05 não confirmou o envio.'
      );

    }


    console.log(
      'Comando enviado com sucesso.'
    );


    return {

      ok: true,

      simulado: false,

      conectado: true,

      comando,

      message:
        'Comando enviado ao Arduino.',

    };

  } catch (erro) {

    console.log(
      'Erro no envio Bluetooth:',
      erro
    );


    dispositivoHC05 =
      null;


    return {

      ok: true,

      simulado: true,

      conectado: false,

      comando,

      message:
        'Falha na comunicação Bluetooth: ' +
        textoErro(erro) +
        ' Simulação mantida.',

    };

  }

}