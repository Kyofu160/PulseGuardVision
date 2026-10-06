// =============================================
// COMANDOS DO ARDUINO
// =============================================
//
// Aqui ficam todos os comandos que o aplicativo
// poderá enviar ao Arduino.
//
// No Expo Web os comandos são simulados.
// Posteriormente, no Android, esta mesma estrutura
// será usada para enviar pelo HC-05.
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
// ENVIAR COMANDO
// =============================================

export async function enviarComandoArduino(
  comando
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


  // ===========================================
  // EXPO WEB
  // ===========================================
  //
  // Neste momento o navegador apenas simula
  // a comunicação.
  //
  // Depois criaremos a implementação Android
  // que envia de verdade pelo HC-05.
  // ===========================================

  return {

    ok: true,

    simulado: true,

    comando: comando,

    message:
      'Comando simulado no Expo Web.',

  };

}