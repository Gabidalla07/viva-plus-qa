let participanteAtivo = true;

let simulacaoEstoque = false;
let simulacaoFalhaParceiro = false;
let simulacaoFalhaEnvio = false;

let carrinho = {};

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


/* ============================
   NAVEGAÇÃO
   ============================ */

function irParaCatalogo() {

  document
    .getElementById('catalogo')
    .scrollIntoView({
      behavior: 'smooth'
    });

}


/* ============================
   SALDO
   ============================ */

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


  const loteAntigo =
    lotes.find(
      (lote) => lote.id === 1
    );

  const loteRecente =
    lotes.find(
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


  atualizarCarrinho();

}


/* ============================
   STATUS DO PARTICIPANTE
   ============================ */

function alternarStatus() {

  participanteAtivo =
    !participanteAtivo;


  const status =
    document.getElementById('status');

  const mensagem =
    document.getElementById('status-message');

  const botaoStatus =
    document.getElementById('toggle-status');


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

  }

}


/* ============================
   CARRINHO
   ============================ */

function adicionarAoCarrinho(
  nomeProduto,
  pontos
) {

  if (!participanteAtivo) {

    mostrarModal(
      'Resgate não permitido',
      'Participantes bloqueados não podem realizar resgates.'
    );

    return;
  }


  if (simulacaoEstoque) {

    mostrarModal(
      'Prêmio indisponível',
      'O estoque do prêmio foi esgotado durante a tentativa de resgate.'
    );

    return;
  }


  if (!carrinho[nomeProduto]) {

    carrinho[nomeProduto] = {
      pontos: pontos,
      quantidade: 0
    };

  }


  carrinho[nomeProduto].quantidade++;


  atualizarCarrinho();


  document
    .getElementById('carrinho')
    .scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

}


function alterarQuantidade(
  nomeProduto,
  quantidade
) {

  if (!carrinho[nomeProduto]) {
    return;
  }


  if (quantidade <= 0) {

    delete carrinho[nomeProduto];

  } else {

    carrinho[nomeProduto].quantidade =
      quantidade;

  }


  atualizarCarrinho();

}


function calcularTotalCarrinho() {

  return Object
    .values(carrinho)
    .reduce(
      (total, item) =>
        total +
        item.pontos *
        item.quantidade,
      0
    );

}


function atualizarCarrinho() {

  const vazio =
    document.getElementById(
      'carrinho-vazio'
    );

  const conteudo =
    document.getElementById(
      'carrinho-conteudo'
    );

  const itens =
    document.getElementById(
      'carrinho-itens'
    );

  const totalElemento =
    document.getElementById(
      'carrinho-total'
    );


  if (
    !vazio ||
    !conteudo ||
    !itens ||
    !totalElemento
  ) {

    return;

  }


  const produtos =
    Object.entries(carrinho);


  if (
    produtos.length === 0
  ) {

    vazio.style.display =
      'flex';

    conteudo.style.display =
      'none';

    totalElemento.textContent =
      '0 pts';

    return;

  }


  vazio.style.display =
    'none';

  conteudo.style.display =
    'block';


  itens.innerHTML =
    produtos
      .map(
        ([nome, item]) => `

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:20px;
              padding:16px 0;
              border-bottom:1px solid #e8e0f5;
              flex-wrap:wrap;
            "
          >

            <div>

              <strong
                style="
                  display:block;
                "
              >
                ${nome}
              </strong>

              <span>
                ${item.pontos.toLocaleString('pt-BR')}
                pts por unidade
              </span>

            </div>


            <div
              style="
                display:flex;
                align-items:center;
                gap:10px;
              "
            >

              <button
                type="button"
                onclick="alterarQuantidade(
                  '${nome}',
                  ${item.quantidade - 1}
                )"
                style="
                  width:36px;
                  height:36px;
                  border:0;
                  border-radius:10px;
                  cursor:pointer;
                  font-size:20px;
                "
              >
                −
              </button>


              <strong
                style="
                  min-width:25px;
                  text-align:center;
                "
              >
                ${item.quantidade}
              </strong>


              <button
                type="button"
                onclick="alterarQuantidade(
                  '${nome}',
                  ${item.quantidade + 1}
                )"
                style="
                  width:36px;
                  height:36px;
                  border:0;
                  border-radius:10px;
                  cursor:pointer;
                  font-size:20px;
                "
              >
                +
              </button>

            </div>


            <strong>

              ${
                (
                  item.pontos *
                  item.quantidade
                ).toLocaleString('pt-BR')
              }

              pts

            </strong>

          </div>

        `
      )
      .join('');


  const total =
    calcularTotalCarrinho();


  totalElemento.textContent =
    `${total.toLocaleString('pt-BR')} pts`;

}


/* ============================
   FINALIZAR RESGATE
   ============================ */

function finalizarResgate() {

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


  const total =
    calcularTotalCarrinho();


  /*
   * Carrinho vazio.
   */

  if (total === 0) {

    mostrarModal(
      'Carrinho vazio',
      'Adicione pelo menos um prêmio antes de finalizar o resgate.'
    );

    return;

  }


  /*
   * CT6
   *
   * O mínimo de 500 pontos
   * é aplicado ao total do carrinho.
   *
   * Exemplo:
   *
   * 1 Vale Presente = 300 pts ❌
   *
   * 2 Vale Presentes = 600 pts ✅
   */

  if (total < 500) {

    mostrarModal(
      'Resgate não permitido',
      `O total do carrinho é de ${total.toLocaleString('pt-BR')} pontos. O resgate mínimo do programa Viva+ é de 500 pontos.`
    );

    return;

  }


  /*
   * CT2
   * Saldo insuficiente.
   */

  const saldoAtual =
    calcularSaldo();


  if (saldoAtual < total) {

    mostrarModal(
      'Saldo insuficiente',
      'Saldo insuficiente para realizar este resgate.'
    );

    return;

  }


  /*
   * CT3
   * Estoque esgotado.
   */

  if (simulacaoEstoque) {

    mostrarModal(
      'Prêmio indisponível',
      'O estoque de um dos prêmios foi esgotado durante a tentativa de resgate.'
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
   * Falha no envio ao parceiro.
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
    total;


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


  /*
   * Monta resumo dos produtos.
   */

  const resumo =
    Object.entries(carrinho)
      .map(
        ([nome, item]) =>
          `${item.quantidade}x ${nome}`
      )
      .join(', ');


  /*
   * Limpa o carrinho.
   */

  carrinho = {};


  atualizarTela();


  /*
   * Gera número fictício do pedido.
   */

  const numeroPedido =
    `VIVA-${Date.now()
      .toString()
      .slice(-6)}`;


  mostrarModal(
    'Resgate realizado!',
    `Seu resgate foi solicitado com sucesso: ${resumo}. Total: ${total.toLocaleString('pt-BR')} pontos. Número do pedido: ${numeroPedido}.`
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


/* ============================
   CT5 — SALDO EXATO
   ============================ */

function simularSaldoExato() {

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


  carrinho = {};


  simulacaoEstoque =
    false;

  simulacaoFalhaParceiro =
    false;

  simulacaoFalhaEnvio =
    false;


  atualizarTela();


  mostrarModal(
    'Cenário CT5',
    'Saldo ajustado para exatamente 500 pontos. O próximo resgate de 500 pontos deve consumir todo o saldo.'
  );

}


/* ============================
   RESTAURAR LABORATÓRIO
   ============================ */

function resetarLaboratorio() {

  participanteAtivo =
    true;


  simulacaoEstoque =
    false;

  simulacaoFalhaParceiro =
    false;

  simulacaoFalhaEnvio =
    false;


  carrinho = {};


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


  const status =
    document.getElementById(
      'status'
    );

  const mensagem =
    document.getElementById(
      'status-message'
    );

  const botao =
    document.getElementById(
      'toggle-status'
    );


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

  botao.textContent =
    'Simular bloqueio';


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