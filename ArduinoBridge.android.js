import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';


// =====================================================
// COMANDOS DO ARDUINO
// =====================================================

export const COMANDOS = {
  ALERTA_COMPLETO: 'DEMO|ALERTA|COMPLETO',

  LED_PISCAR: 'DEMO|LED|PISCAR',

  BUZZER_TOCAR: 'DEMO|BUZZER|TOCAR',
  BUZZER_PARAR: 'DEMO|BUZZER|PARAR',

  VIBRADOR_LIGAR: 'DEMO|VIBRADOR|LIGAR',
  VIBRADOR_PARAR: 'DEMO|VIBRADOR|PARAR',

  PARAR_TUDO: 'DEMO|PARAR',

  TESTE: 'TESTE',
};


// =====================================================
// DISPOSITIVO HC-05
// =====================================================

let dispositivoHC05 = null;


// =====================================================
// PERMISSÃO BLUETOOTH
// =====================================================

async function pedirPermissaoBluetooth() {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Android 12+
  if (Platform.Version >= 31) {
    const resultado = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Permissão de Bluetooth',
        message:
          'O PulseGuardVision precisa acessar dispositivos Bluetooth pareados.',
        buttonPositive: 'Permitir',
        buttonNegative: 'Cancelar',
      }
    );

    return resultado === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}


// =====================================================
// VERIFICAR BLUETOOTH DO CELULAR
// =====================================================

async function verificarBluetooth() {
  try {
    const permitido = await pedirPermissaoBluetooth();

    if (!permitido) {
      return {
        ok: false,
        message: 'Permissão de Bluetooth não concedida.',
      };
    }

    const disponivel =
      await RNBluetoothClassic.isBluetoothAvailable();

    if (!disponivel) {
      return {
        ok: false,
        message: 'Bluetooth não disponível neste aparelho.',
      };
    }

    const ligado =
      await RNBluetoothClassic.isBluetoothEnabled();

    if (!ligado) {
      return {
        ok: false,
        message: 'Bluetooth está desligado.',
      };
    }

    return {
      ok: true,
    };
  } catch (erro) {
    console.log(
      'Erro ao verificar Bluetooth:',
      erro
    );

    return {
      ok: false,
      message: 'Não foi possível verificar o Bluetooth.',
    };
  }
}


// =====================================================
// ENCONTRAR PAULIM02
// =====================================================

async function encontrarHC05() {
  try {
    const dispositivos =
      await RNBluetoothClassic.getBondedDevices();


    console.log(
      'Dispositivos Bluetooth pareados:',
      dispositivos.map(dispositivo => ({
        nome: dispositivo.name,
        endereco: dispositivo.address,
      }))
    );


    const dispositivoEncontrado =
      dispositivos.find(dispositivo => {
        const nome = (
          dispositivo.name || ''
        )
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '');


        console.log(
          'Dispositivo encontrado:',
          nome
        );


        return (
          nome === 'PAULIM02' ||
          nome === 'HC05' ||
          nome === 'HC06'
        );
      });


    if (!dispositivoEncontrado) {
      return null;
    }


    dispositivoHC05 =
      dispositivoEncontrado;


    console.log(
      'Paulim02 encontrado:',
      dispositivoHC05.name,
      dispositivoHC05.address
    );


    return dispositivoHC05;
  } catch (erro) {
    console.log(
      'Erro ao procurar Paulim02:',
      erro
    );

    return null;
  }
}


// =====================================================
// VERIFICAR SE ESTÁ CONECTADO
// =====================================================

export async function statusHC05() {
  try {
    if (!dispositivoHC05) {
      return {
        conectado: false,
      };
    }


    const conectado =
      await dispositivoHC05.isConnected();


    return {
      conectado,
      nome: dispositivoHC05.name,
      endereco: dispositivoHC05.address,
    };
  } catch (erro) {
    console.log(
      'Erro ao verificar conexão:',
      erro
    );


    dispositivoHC05 = null;


    return {
      conectado: false,
    };
  }
}


// =====================================================
// CONECTAR AO PAULIM02
// =====================================================

export async function conectarHC05() {
  try {
    console.log(
      'Tentando conectar ao Paulim02...'
    );


    // -------------------------------------------------
    // Verificar Bluetooth do celular
    // -------------------------------------------------

    const verificacao =
      await verificarBluetooth();


    if (!verificacao.ok) {
      return {
        ok: false,
        conectado: false,
        message: verificacao.message,
      };
    }


    // -------------------------------------------------
    // Já temos um dispositivo salvo?
    // -------------------------------------------------

    if (dispositivoHC05) {
      try {
        const jaConectado =
          await dispositivoHC05.isConnected();


        if (jaConectado) {
          return {
            ok: true,
            conectado: true,
            nome: dispositivoHC05.name,
            message: `${dispositivoHC05.name} já está conectado.`,
          };
        }
      } catch (erro) {
        dispositivoHC05 = null;
      }
    }


    // -------------------------------------------------
    // Procurar entre os dispositivos pareados
    // -------------------------------------------------

    const dispositivo =
      await encontrarHC05();


    if (!dispositivo) {
      return {
        ok: false,
        conectado: false,
        message:
          'Paulim02 não foi encontrado entre os dispositivos pareados.',
      };
    }


    console.log(
      'Conectando em:',
      dispositivo.name
    );


    // -------------------------------------------------
    // Conexão Bluetooth Classic RFCOMM / SPP
    // -------------------------------------------------

    await dispositivo.connect({
      CONNECTOR_TYPE: 'rfcomm',

      CONNECTION_TYPE: 'delimited',

      DELIMITER: '\n',

      DEVICE_CHARSET: 'utf-8',
    });


    // -------------------------------------------------
    // Confirmar conexão
    // -------------------------------------------------

    const conectado =
      await dispositivo.isConnected();


    if (!conectado) {
      dispositivoHC05 = null;


      return {
        ok: false,
        conectado: false,
        message:
          'O Paulim02 foi encontrado, mas a conexão não foi concluída.',
      };
    }


    dispositivoHC05 =
      dispositivo;


    console.log(
      'Paulim02 conectado com sucesso!'
    );


    return {
      ok: true,
      conectado: true,
      nome: dispositivo.name,
      endereco: dispositivo.address,
      message: `${dispositivo.name} conectado.`,
    };
  } catch (erro) {
    console.log(
      'Erro ao conectar ao Paulim02:',
      erro
    );


    dispositivoHC05 = null;


    return {
      ok: false,
      conectado: false,
      message:
        'Não foi possível conectar ao Paulim02.',
      erro: String(erro),
    };
  }
}


// =====================================================
// DESCONECTAR
// =====================================================

export async function desconectarHC05() {
  try {
    if (!dispositivoHC05) {
      return {
        ok: true,
        conectado: false,
        message: 'Bluetooth já está desconectado.',
      };
    }


    const conectado =
      await dispositivoHC05.isConnected();


    if (conectado) {
      await dispositivoHC05.disconnect();
    }


    console.log(
      'Paulim02 desconectado.'
    );


    dispositivoHC05 = null;


    return {
      ok: true,
      conectado: false,
      message: 'Paulim02 desconectado.',
    };
  } catch (erro) {
    console.log(
      'Erro ao desconectar:',
      erro
    );


    dispositivoHC05 = null;


    return {
      ok: false,
      conectado: false,
      message:
        'Erro ao desconectar o Paulim02.',
      erro: String(erro),
    };
  }
}


// =====================================================
// ENVIAR COMANDO AO ARDUINO
// =====================================================

export async function enviarComandoArduino(
  comando,
  conectarSeNecessario = false
) {
  try {
    let conectado = false;


    // -------------------------------------------------
    // Verificar conexão atual
    // -------------------------------------------------

    if (dispositivoHC05) {
      try {
        conectado =
          await dispositivoHC05.isConnected();
      } catch (erro) {
        conectado = false;
        dispositivoHC05 = null;
      }
    }


    // -------------------------------------------------
    // Conectar somente quando solicitado
    // -------------------------------------------------

    if (
      !conectado &&
      conectarSeNecessario
    ) {
      const resultadoConexao =
        await conectarHC05();


      if (resultadoConexao.ok) {
        conectado = true;
      }
    }


    // -------------------------------------------------
    // Sem Bluetooth = simulação
    // -------------------------------------------------

    if (
      !conectado ||
      !dispositivoHC05
    ) {
      console.log(
        'Arduino não conectado. Simulando:',
        comando
      );


      return {
        ok: true,
        enviado: false,
        simulado: true,
        comando,
        message:
          'Paulim02 não conectado. Comando simulado.',
      };
    }


    // -------------------------------------------------
    // Enviar comando
    // -------------------------------------------------

    const mensagem =
      `${comando}\n`;


    console.log(
      'Enviando para o Arduino:',
      comando
    );


    await dispositivoHC05.write(
      mensagem,
      'utf-8'
    );


    console.log(
      'Comando enviado com sucesso.'
    );


    return {
      ok: true,
      enviado: true,
      simulado: false,
      comando,
      message:
        'Comando enviado ao Arduino.',
    };
  } catch (erro) {
    console.log(
      'Erro ao enviar comando:',
      erro
    );


    dispositivoHC05 = null;


    return {
      ok: false,
      enviado: false,
      simulado: true,
      comando,
      message:
        'Erro na comunicação com o Paulim02.',
      erro: String(erro),
    };
  }
}