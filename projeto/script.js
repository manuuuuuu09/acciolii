// script.js
let pedido = [];
let desconto = 0;
let cupomAtivo = '';

const cupons = {
  MANU50: 50,
  CLA25: 25,
  MOARA25: 25,
  VICTORIA30: 30,
  LULU60: 60
};

// Mapeamento de produtos para descrições e ingredientes
const infoProdutos = {
    'Brownie Clássico': {
        descricao: '100g, com 350 kcal',
        ingredientes: 'Farinha, cacau, ovos, açúcar, manteiga.'
    },
    'Pudim': {
        descricao: '180g, com 420 kcal',
        ingredientes: 'Leite condensado, leite, ovos, açúcar.'
    },
    'Brookies': {
        descricao: '120g, com 380 kcal',
        ingredientes: 'Farinha, cacau, gotas de chocolate, açúcar.'
    },
    'Brownie c/ Morango': {
        descricao: '130g, com 390 kcal',
        ingredientes: 'Brownie clássico, morangos frescos.'
    },

    'Biscoito Gatinho': {
  descricao: '80g, com 320 kcal',
  ingredientes: 'Farinha de trigo, manteiga, açúcar, ovo, essência de baunilha.'
},
'Tanghulu Hello Kitty': {
  descricao: '120g, com 250 kcal',
  ingredientes: 'Morango, uva, açúcar caramelizado.'
},
'Cupcake Red Velvet': {
  descricao: '140g, com 410 kcal',
  ingredientes: 'Farinha, cacau, açúcar, ovos, manteiga, cream cheese.'
},
'Donut do Bob Esponja': {
  descricao: '110g, com 360 kcal',
  ingredientes: 'Farinha, açúcar, leite, ovos, cobertura colorida.'
}, 
'Bolo Girassol': {
  descricao: '1 fatia (160g), com 430 kcal',
  ingredientes: 'Farinha de trigo, ovos, açúcar, manteiga, leite, chocolate branco, corantes alimentícios.'
}



};


// ADICIONAR ITEM
function adicionarItem(nome, preco) {
  const itemExistente = pedido.find(i => i.nome === nome);
  if (itemExistente) {
    itemExistente.qtd++;
  } else {
    // Adiciona descrição e ingredientes ao objeto do item do pedido
    const info = infoProdutos[nome] || { descricao: 'Sem descrição', ingredientes: 'Sem ingredientes' };
    pedido.push({ nome, preco, qtd: 1, descricao: info.descricao, ingredientes: info.ingredientes });
  }
  atualizarPedido();
}

// EXCLUIR ITEM
function excluirItem(index) {
  pedido.splice(index, 1);
  atualizarPedido();
}

// ATUALIZAR PEDIDO
function atualizarPedido() {
  const lista = document.getElementById("listaPedido");
  lista.innerHTML = "";
  let total = 0;

  pedido.forEach((item, index) => {
    total += item.preco * item.qtd;
    lista.innerHTML += `
      <li>
        ${item.nome} x${item.qtd} - R$ ${(item.preco * item.qtd).toFixed(2)}
        <button class="excluir" onclick="excluirItem(${index})">X</button>
        <p class="descricao-item">${item.descricao}</p>
        <p class="descricao-item">Ingredientes: ${item.ingredientes}</p>
      </li>
    `;
  });

  if (desconto > 0) {
    total = total - (total * desconto) / 100;
  }

  document.getElementById("totalItens").innerText = pedido.reduce((acc, i) => acc + i.qtd, 0);
  document.getElementById("totalValor").innerText = total.toFixed(2);
document.getElementById("totalItens").innerText = pedido.reduce((acc, i) => acc + i.qtd, 0);
document.getElementById("contadorCarrinho").innerText = pedido.reduce((acc, i) => acc + i.qtd, 0); // 👈 ADICIONE ESTA LINHA

  // Garante que o botão de finalizar pedido esteja visível se houver itens
  if (pedido.length > 0) {
      document.querySelector('.finalizar').style.display = 'block';
  } else {
      document.querySelector('.finalizar').style.display = 'none';
  }
}

// CUPOM
function aplicarCupom() {
  const cupom = document.getElementById('inputCupom').value.toUpperCase();
  const msgCupom = document.getElementById('msgCupom');

  if (cupons[cupom]) {
    desconto = cupons[cupom];
    cupomAtivo = cupom;
    msgCupom.innerText = `Cupom ${cupom} aplicado! ${desconto}% de desconto.`;
    msgCupom.classList.remove('erro');
    atualizarPedido();
  } else {
    desconto = 0;
    cupomAtivo = '';
    msgCupom.innerText = 'Cupom inválido.';
    msgCupom.classList.add('erro');
    atualizarPedido();
  }
}

// PAGAMENTO
function atualizarPagamento() {
  const metodo = document.getElementById('metodoPagamento').value;
  const pixArea = document.getElementById('pixArea');
  const cartaoArea = document.getElementById('cartaoArea');
  const areaParcelas = document.getElementById('areaParcelas');
  const tituloCartao = document.getElementById('tituloCartao');

  // Esconde tudo no início
  pixArea.style.display = 'none';
  cartaoArea.style.display = 'none';
  areaParcelas.style.display = 'none';

  if (metodo === 'Pix') {
    pixArea.style.display = 'block';
  } 
  // Agora inclui o CartaoVirtual na verificação
  else if (metodo === 'CartaoDebito' || metodo === 'CartaoCredito' || metodo === 'CartaoVirtual') {
    cartaoArea.style.display = 'block';
    
    // Ajusta o título conforme a escolha
    if (metodo === 'CartaoDebito') tituloCartao.innerText = 'Dados do Débito';
    else if (metodo === 'CartaoVirtual') tituloCartao.innerText = 'Dados do Cartão Virtual';
    else tituloCartao.innerText = 'Dados do Crédito';

    // Crédito e Virtual permitem parcelamento
    if (metodo === 'CartaoCredito' || metodo === 'CartaoVirtual') {
      areaParcelas.style.display = 'block';
      gerarParcelas();
    }
  }
}

// A função gerarParcelas continua a mesma, aplicando juros após 2 meses
function gerarParcelas() {
  const totalStr = document.getElementById("totalValor").innerText;
  const total = parseFloat(totalStr);
  const select = document.getElementById("selectParcelas");
  select.innerHTML = "";

  for (let i = 1; i <= 12; i++) {
    let valorFinal = total;
    let infoJuros = "sem juros";

    // Juros de 5% ao mês após a 2ª parcela (começa na 3ª)
    if (i > 2) {
      const mesesComJuros = i - 2;
      valorFinal = total * Math.pow(1 + 0.05, mesesComJuros);
      infoJuros = "c/ juros 5% a.m.";
    }

    const valorParcela = valorFinal / i;
    const option = document.createElement("option");
    option.value = i;
    option.text = `${i}x de R$ ${valorParcela.toFixed(2)} (${infoJuros})`;
    select.appendChild(option);
  }
}



// FINALIZAR PEDIDO
function finalizarPedido() {
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const obs = document.getElementById('obs').value.trim();
  const metodo = document.getElementById('metodoPagamento').value;

  if (!nome || !telefone || !endereco) {
    alert('Por favor, preencha todos os dados do cliente.');
    return;
  }
  if (pedido.length === 0) {
    alert('Seu pedido está vazio.');
    return;
  }
  if (!metodo) {
    alert('Por favor, selecione o método de pagamento.');
    return;
  }

  let resumo = '===== RESUMO DO PEDIDO =====\n\n';
  resumo += `Nome: ${nome}\nTelefone: ${telefone}\nEndereço: ${endereco}\n\n`;
  if (obs) resumo += `Observações: ${obs}\n\n`;

  resumo += 'Itens do pedido:\n';
  let total = 0;
  pedido.forEach(item => {
    // Inclui descrição e ingredientes no alerta final
    resumo += `• ${item.nome} (${item.descricao}) x${item.qtd} — R$ ${(item.preco * item.qtd).toFixed(2)}\n`;
    resumo += `  Ingredientes: ${item.ingredientes}\n`;
    total += item.preco * item.qtd;
  });

  if (desconto > 0) {
    resumo += `\nCupom: ${cupomAtivo} (${desconto}% de desconto)\n`;
    total -= (total * desconto) / 100;
  }

  resumo += `\nTotal a pagar: R$ ${total.toFixed(2)}\n`;
  resumo += `Método de pagamento: ${metodo}\n\n`;
  resumo += 'Obrigado pela preferência!';

  alert(resumo);

  // Limpar tudo para o próximo pedido
  pedido = [];
  desconto = 0;
  cupomAtivo = '';
  document.getElementById('inputCupom').value = '';
  document.getElementById('msgCupom').innerText = '';
  document.getElementById('metodoPagamento').value = '';
  atualizarPagamento();

  document.getElementById('nome').value = '';
  document.getElementById('telefone').value = '';
  document.getElementById('endereco').value = '';
  document.getElementById('obs').value = '';
document.getElementById("totalValor").innerText = total.toFixed(2);

if (pedido.length > 0) {
  document.querySelector('.finalizar').style.display = 'block';
} else {
  document.querySelector('.finalizar').style.display = 'none';
}

atualizarCarrinhoTopo(); // 👈 AQUI

  atualizarPedido(); // Isso também esconde o botão Finalizar
atualizarCarrinhoTopo();

  // Torna a lista de pedidos visível novamente (se tinha sido escondida antes por algum outro motivo)
  document.getElementById('listaPedido').style.display = 'block';

  // Exibe a mensagem de sucesso, sem esconder o restante da interface
  document.getElementById('mensagemFinal').innerText =
    'Pedido finalizado com sucesso! Entraremos em contato ❤️';
}

function atualizarCarrinhoTopo() {
  const total = pedido.reduce((acc, item) => acc + item.qtd, 0);
  document.getElementById("contadorCarrinho").innerText = total;
}

function irParaCarrinho() {
  document.querySelector('.pedido').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

// Função para mudar o número que aparece no card
function alterarQtdInterna(idElemento, mudança) {
  const span = document.getElementById('qtd-' + idElemento);
  let qtdAtual = parseInt(span.innerText);
  qtdAtual += mudança;

  if (qtdAtual < 1) qtdAtual = 1; // Não deixa ser menor que 1
  span.innerText = qtdAtual;
}

// Função para adicionar ao carrinho com a quantidade escolhida
function adicionarItemComQtd(nome, preco, idElemento) {
  const span = document.getElementById('qtd-' + idElemento);
  const quantidadeParaAdicionar = parseInt(span.innerText);

  const itemExistente = pedido.find(i => i.nome === nome);

  if (itemExistente) {
    itemExistente.qtd += quantidadeParaAdicionar;
  } else {
    const info = infoProdutos[nome] || { descricao: 'Sem descrição', ingredientes: 'N/A' };
    pedido.push({ 
      nome, 
      preco, 
      qtd: quantidadeParaAdicionar, 
      descricao: info.descricao, 
      ingredientes: info.ingredientes 
    });
  }

  // Reseta o contador do card para 1 após adicionar
  span.innerText = 1;

  atualizarPedido();
  atualizarCarrinhoTopo();
}


// Inicializa
atualizarPedido();