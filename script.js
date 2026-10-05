let participanteAtivo = true;

let simulacaoEstoque = false;
let simulacaoFalhaParceiro = false;
let simulacaoFalhaEnvio = false;

let lotes = [
  {
    id: 1,
    nome: 'Lote 001 — Crédito antigo',
    pontos: 400,
    data: '10/10/2025',
    expiracao: '10/10/2026',
    expirado: false
  },

  {
    id: 2,
    nome: 'Lote 002 — Crédito recente',
    pontos: 850,
    data: '20/09/2026',
    expiracao: '20/09/2027',
    expirado: false
  },

  {
    id: 3,
    nome: 'Lote 003 — Crédito expirado',
    pontos: 300,
    data: '30/09/2025',
    expiracao: '30/09/2026',
    expirado: true
  }
];


function irParaCatalogo() {

  document
    .getElementById('catalogo')
    .scrollIntoView({
      behavior: 'smooth'
    });

}


function calcularSaldo() {

  return lotes
    .filter((lote) => !lote.expirado)
    .reduce(
      (total, lote) => total + lote.pontos,
      0
    );

}


function atualizarTela() {

  const saldo = calcularSaldo();

  document.getElementById('saldo').textContent =
    saldo.toLocaleString('pt-BR');

  document.getElementById('saldo-card').textContent =
    saldo.toLocaleString('pt-BR');


  const loteAntigo = lotes.find(
    (lote) => lote.id === 1
  );

  const loteRecente = lotes.find(
    (lote) => lote.id === 2
  );


  document.getElementById('lote-antigo').textContent =
    loteAntigo
      ? loteAntigo.pontos
      : 0;


  document.getElementById('lote-recente').textContent =
    loteRecente
      ? loteRecente.pontos
      : 0;

}


function alternarStatus() {

  participanteAtivo =
    !participanteAtivo;


  const status =
    document.getElementById('status');

  const mensagem =
    document.getElementById('status-message');

  const botaoStatus =
    document.getElementById('toggle-status');

  const botoesResgate =
    document.querySelectorAll(
      '.resgate-button'
    );


  if (participanteAtivo) {

    status.textContent =
      '● Ativo';

    status.classList.remove(
      'blocked'
    );

    status.classList.add(
      'active'
    );

    mensagem.textContent =
      'Troque seus pontos por prêmios exclusivos no catálogo Viva+.';

    botaoStatus.textContent =
      'Simular bloqueio';


    botoesResgate.forEach(
      (botao) => {

        if (
          !botao.dataset.estoqueEsgotado
        ) {
          botao.disabled = false;
        }

      }
    );

  } else {

    status.textContent =
      '● Bloqueado';

    status.classList.remove(
      'active'
    );

    status.classList.add(
      'blocked'
    );

    mensagem.textContent =
      'Participante bloqueado. O resgate de pontos não está disponível.';

    botaoStatus.textContent =
      'Simular desbloqueio';


    botoesResgate.forEach(
      (botao) => {

        botao.disabled = true;

      }
    );

  }

}


function resgatar(
  nomeProduto,
  pontos
) {

  /*
   * CT7
   * Participante bloqueado não pode resgatar.
   */

  if (!participanteAtivo) {

    mostrarModal(
      'Resgate não permitido',
      'Participantes bloqueados não podem realizar resgates.'
    );

    return;
  }


  /*
   * CT6
   * Regra do mínimo de 500 pontos.
   */

  if (pontos < 500) {

    mostrarModal(
      'Resgate não permitido',
      'O resgate mínimo do programa Viva+ é de 500 pontos.'
    );

    return;
  }


  /*
   * CT3
   * Simulação de estoque esgotado
   * durante uma tentativa de resgate.
   */

  if (simulacaoEstoque) {

    mostrarModal(
      'Prêmio indisponível',
      'O estoque do prêmio foi esgotado durante a tentativa de resgate.'
    );

    return;
  }


  /*
   * CT2
   * Saldo insuficiente.
   */

  const saldoAtual =
    calcularSaldo();


  if (saldoAtual < pontos) {

    mostrarModal(
      'Saldo insuficiente',
      'Saldo insuficiente para este prêmio.'
    );

    return;
  }


  /*
   * CT4
   * Falha na confirmação do parceiro.
   */

  if (simulacaoFalhaParceiro) {

    mostrarModal(
      'Processamento pendente',
      'O parceiro não confirmou o pedido. O resgate não foi considerado concluído.'
    );

    return;
  }


  /*
   * CT10
   * Falha no envio do pedido ao parceiro.
   */

  if (simulacaoFalhaEnvio) {

    mostrarModal(
      'Falha no processamento',
      'O pedido não pôde ser enviado ao parceiro. O resgate não foi considerado concluído.'
    );

    return;
  }


  /*
   * CT1 / CT5 / CT8
   *
   * Consumo dos pontos mais antigos primeiro.
   */

  let restante =
    pontos;


  for (
    const lote of lotes
  ) {

    if (
      lote.expirado
    ) {
      continue;
    }


    if (
      restante === 0
    ) {
      break;
    }


    const consumo =
      Math.min(
        lote.pontos,
        restante
      );


    lote.pontos -=
      consumo;

    restante -=
      consumo;

  }


  atualizarTela();


  /*
   * Confirmação do resgate.
   */

  const numeroPedido =
    `VIVA-${Date.now()
      .toString()
      .slice(-6)}`;


  mostrarModal(
    'Resgate realizado!',
    `Seu prêmio "${nomeProduto}" foi solicitado com sucesso. Número do pedido: ${numeroPedido}.`
  );

}


/* ============================
   SIMULAÇÕES DO QA LAB
   ============================ */


function simularSaldoInsuficiente() {

  mostrarModal(
    'Cenário CT2',
    'Saldo insuficiente para este prêmio. O resgate não deve ser realizado.'
  );

}


function simularEstoque() {

  simulacaoEstoque =
    true;

  mostrarModal(
    'Cenário CT3',
    'Simulação ativada: o estoque será considerado esgotado durante a tentativa de resgate.'
  );

}


function simularFalhaParceiro() {

  simulacaoFalhaParceiro =
    true;

  simulacaoFalhaEnvio =
    false;

  mostrarModal(
    'Cenário CT4',
    'Simulação ativada: o parceiro não irá confirmar o pedido.'
  );

}


function simularFalhaEnvio() {

  simulacaoFalhaEnvio =
    true;

  simulacaoFalhaParceiro =
    false;

  mostrarModal(
    'Cenário CT10',
    'Simulação ativada: o envio do pedido ao parceiro irá falhar.'
  );

}


function simularSaldoExato() {

  /*
   * Para demonstrar CT5, criamos temporariamente
   * um saldo equivalente a 500 pontos.
   */

  lotes = [
    {
      id: 1,
      nome: 'Lote de teste',
      pontos: 500,
      data: '05/10/2026',
      expiracao: '05/10/2027',
      expirado: false
    }
  ];

  simulacaoEstoque = false;
  simulacaoFalhaParceiro = false;
  simulacaoFalhaEnvio = false;

  atualizarTela();


  mostrarModal(
    'Cenário CT5',
    'Saldo ajustado para exatamente 500 pontos. O próximo resgate de 500 pontos deve consumir todo o saldo.'
  );

}


function resetarLaboratorio() {

  participanteAtivo = true;

  simulacaoEstoque = false;
  simulacaoFalhaParceiro = false;
  simulacaoFalhaEnvio = false;


  lotes = [
    {
      id: 1,
      nome: 'Lote 001 — Crédito antigo',
      pontos: 400,
      data: '10/10/2025',
      expiracao: '10/10/2026',
      expirado: false
    },

    {
      id: 2,
      nome: 'Lote 002 — Crédito recente',
      pontos: 850,
      data: '20/09/2026',
      expiracao: '20/09/2027',
      expirado: false
    },

    {
      id: 3,
      nome: 'Lote 003 — Crédito expirado',
      pontos: 300,
      data: '30/09/2025',
      expiracao: '30/09/2026',
      expirado: true
    }
  ];


  atualizarTela();

  alternarStatus();

  alternarStatus();


  mostrarModal(
    'Laboratório restaurado',
    'O cenário inicial do Viva+ foi restaurado.'
  );

}


/* ============================
   MODAL
   ============================ */


function mostrarModal(
  titulo,
  mensagem
) {

  document.getElementById(
    'modal-title'
  ).textContent =
    titulo;


  document.getElementById(
    'modal-message'
  ).textContent =
    mensagem;


  document
    .getElementById('modal')
    .classList.remove(
      'hidden'
    );

}


function fecharModal() {

  document
    .getElementById('modal')
    .classList.add(
      'hidden'
    );

}


/* ============================
   INICIALIZAÇÃO
   ============================ */

atualizarTela();