/**
 * TRAVEL CHURCH — script.js
 * Lógica da tela principal: login, cadastro, pagamento, regras,
 * confirmação, painel do viajante e perfil.
 * 
 * IMPORTANTE: usa o mesmo localStorage do data.js (painel admin),
 * garantindo que novos cadastros apareçam imediatamente no admin.
 */

/* ============================================================
   SINCRONIZAÇÃO COM LOCALSTORAGE
   Garante que os dados de viajantes sejam os mesmos
   usados pelo painel admin (data.js)
   ============================================================ */
const AppState = {
  currentUser: null,
  newTraveler: null,

  // Sempre lê do localStorage — mesmo banco do painel admin
  get travelers() {
    return JSON.parse(localStorage.getItem('tc_travelers') || '[]');
  },
  set travelers(v) {
    localStorage.setItem('tc_travelers', JSON.stringify(v));
  },
};

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Garante que o localStorage foi populado com os dados iniciais
  // (chama o init do data.js caso ainda não tenha rodado)
  if (!localStorage.getItem('tc_initialized')) {
    initDefaultData();
  }

  setTimeout(() => {
    document.getElementById('loadingOverlay')?.classList.add('hidden');
  }, 1200);

  setupCPFMasks();
  setupPhoneMask();
  setupLoginForms();
  setupRegisterForm();
  setupConditionalFields();
});

/**
 * Popula o localStorage com dados iniciais caso ainda não exista.
 * Espelha o _defaults do data.js para garantir consistência.
 */
function initDefaultData() {
  const defaultTravelers = [
    { cpf:'111.111.111-11', nome:'Maria Silva',    email:'maria@email.com',    telefone:'(11) 99999-0001', idade:'maior', alergia:'nao', alergiaDesc:'',                           transporte:'onibus', familia:'Família Silva',    parentesco:'conjuge', senha:'viagem123', payStatus:'pago',     payMethod:'pix',    seat:'01', andar:'Piso Superior', quarto:'101', tipoQuarto:'Duplo Standard' },
    { cpf:'222.222.222-22', nome:'João Silva',     email:'joao@email.com',     telefone:'(11) 99999-0002', idade:'maior', alergia:'sim', alergiaDesc:'Alergia a amendoim',        transporte:'onibus', familia:'Família Silva',    parentesco:'conjuge', senha:'viagem123', payStatus:'pago',     payMethod:'pix',    seat:'02', andar:'Piso Superior', quarto:'101', tipoQuarto:'Duplo Standard' },
    { cpf:'333.333.333-33', nome:'Ana Oliveira',   email:'ana@email.com',      telefone:'(11) 99999-0003', idade:'maior', alergia:'nao', alergiaDesc:'',                           transporte:'proprio',familia:'Família Oliveira', parentesco:'pai',     senha:'viagem123', payStatus:'pendente', payMethod:'boleto', seat:null, andar:null, quarto:'102', tipoQuarto:'Single' },
    { cpf:'444.444.444-44', nome:'Lucas Mendes',   email:'lucas@email.com',    telefone:'(11) 99999-0004', idade:'menor', alergia:'nao', alergiaDesc:'',                           transporte:'onibus', familia:'Família Silva',    parentesco:'filho',   senha:'viagem123', payStatus:'analise',  payMethod:'pix',    seat:'05', andar:'Piso Superior', quarto:null, tipoQuarto:null, nascimento:'2012-06-15', responsavelCPF:'111.111.111-11' },
    { cpf:'555.555.555-55', nome:'Fernanda Costa', email:'fernanda@email.com', telefone:'(11) 99999-0005', idade:'maior', alergia:'sim', alergiaDesc:'Necessita cadeira de rodas', transporte:'onibus', familia:'Família Costa',    parentesco:'pai',     senha:'viagem123', payStatus:'desistiu', payMethod:'boleto', seat:null, andar:null, quarto:null, tipoQuarto:null },
    { cpf:'666.666.666-66', nome:'Carlos Souza',   email:'carlos@email.com',   telefone:'(11) 99999-0006', idade:'maior', alergia:'nao', alergiaDesc:'',                           transporte:'onibus', familia:'Família Souza',    parentesco:'pai',     senha:'viagem123', payStatus:'pago',     payMethod:'pix',    seat:'09', andar:'Piso Superior', quarto:'103', tipoQuarto:'Triplo' },
    { cpf:'777.777.777-77', nome:'Beatriz Lima',   email:'bea@email.com',      telefone:'(11) 99999-0007', idade:'maior', alergia:'nao', alergiaDesc:'',                           transporte:'proprio',familia:'Família Lima',     parentesco:'conjuge', senha:'viagem123', payStatus:'pago',     payMethod:'pix',    seat:null, andar:null, quarto:'104', tipoQuarto:'Duplo Luxo' },
  ];

  const defaultHotel = [
    { id:'101', tipo:'Duplo Standard', capacidade:2, ocupantes:['111.111.111-11','222.222.222-22'] },
    { id:'102', tipo:'Single',         capacidade:1, ocupantes:['333.333.333-33'] },
    { id:'103', tipo:'Triplo',         capacidade:3, ocupantes:['666.666.666-66'] },
    { id:'104', tipo:'Duplo Luxo',     capacidade:2, ocupantes:['777.777.777-77'] },
    { id:'105', tipo:'Quádruplo',      capacidade:4, ocupantes:[] },
    { id:'106', tipo:'Single',         capacidade:1, ocupantes:[] },
    { id:'107', tipo:'Duplo Standard', capacidade:2, ocupantes:[] },
    { id:'108', tipo:'Triplo',         capacidade:3, ocupantes:[] },
    { id:'201', tipo:'Suíte Dupla',    capacidade:2, ocupantes:[] },
    { id:'202', tipo:'Quádruplo',      capacidade:4, ocupantes:[] },
    { id:'203', tipo:'Triplo',         capacidade:3, ocupantes:[] },
    { id:'204', tipo:'Duplo Standard', capacidade:2, ocupantes:[] },
  ];

  // Pré-popula assentos do ônibus
  const busSeats = { 1:{}, 2:{} };
  defaultTravelers.forEach(t => {
    if (t.seat && t.andar) {
      const f = t.andar.includes('Superior') ? 1 : 2;
      busSeats[f][t.seat] = t.cpf;
    }
  });

  localStorage.setItem('tc_travelers',  JSON.stringify(defaultTravelers));
  localStorage.setItem('tc_hotel',      JSON.stringify(defaultHotel));
  localStorage.setItem('tc_bus',        JSON.stringify(busSeats));
  localStorage.setItem('tc_initialized','1');
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
}

function showToast(msg, type = 'success') {
  const existing = document.getElementById('toastNotif');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toastNotif';
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}"
       style="color:${type === 'success' ? '#3dba7a' : '#e85555'}"></i>
    <span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function togglePass(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function formatCPF(value) {
  return value.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function setupCPFMasks() {
  document.querySelectorAll('[id*="CPF"],[id*="Cpf"],[id*="cpf"]').forEach(input => {
    input.addEventListener('input', e => { e.target.value = formatCPF(e.target.value); });
  });
}

function setupPhoneMask() {
  const tel = document.getElementById('regTelefone');
  if (!tel) return;
  tel.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  });
}

function findTravelerByCPF(cpf) {
  return AppState.travelers.find(t => t.cpf === cpf) || null;
}

/* ============================================================
   LOGIN
   ============================================================ */
function setupLoginForms() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('loginForm').classList.toggle('hidden', tab === 'admin');
      document.getElementById('adminLoginForm').classList.toggle('hidden', tab === 'viajante');
    });
  });

  document.getElementById('loginForm').addEventListener('submit', handleTravelerLogin);
  document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
  document.getElementById('goRegister')?.addEventListener('click', e => {
    e.preventDefault(); goTo('registerScreen');
  });
}

function handleTravelerLogin(e) {
  e.preventDefault();
  const cpf   = document.getElementById('loginCPF').value.trim();
  const senha = document.getElementById('loginSenha').value.trim();
  const err   = document.getElementById('loginError');

  const traveler = findTravelerByCPF(cpf);
  if (!traveler) {
    err.textContent = 'CPF não encontrado. Verifique ou cadastre-se.';
    err.classList.remove('hidden'); return;
  }
  if (traveler.senha !== senha) {
    err.textContent = 'Senha incorreta. A senha inicial é "viagem123".';
    err.classList.remove('hidden'); return;
  }

  err.classList.add('hidden');
  AppState.currentUser = { cpf, role: 'traveler', data: traveler };
  loadTravelerDashboard(traveler);
  goTo('travelerDashboard');
}

function handleAdminLogin(e) {
  e.preventDefault();
  const user  = document.getElementById('adminUser').value.trim();
  const senha = document.getElementById('adminPass').value.trim();
  const err   = document.getElementById('adminLoginError');

  if (user === 'admin' && senha === 'admin123') {
    err.classList.add('hidden');
    AppState.currentUser = { role: 'admin' };
    // Salva na sessionStorage para que o painel admin reconheça o login
    sessionStorage.setItem('tc_user', JSON.stringify({ role: 'admin' }));
    window.location.href = 'admin/index.html';
  } else {
    err.textContent = 'Credenciais inválidas. Usuário: admin | Senha: admin123';
    err.classList.remove('hidden');
  }
}

function logout() {
  AppState.currentUser = null;
  sessionStorage.removeItem('tc_user');
  document.getElementById('loginSenha').value = '';
  document.getElementById('adminPass').value  = '';
  goTo('loginScreen');
}

/* ============================================================
   CADASTRO
   ============================================================ */
function setupConditionalFields() {
  document.querySelectorAll('input[name="idade"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isMenor = document.getElementById('radioMenor').checked;
      document.getElementById('menorFields').classList.toggle('hidden', !isMenor);
      document.getElementById('regResponsavel').required = isMenor;
      document.getElementById('regNascimento').required  = isMenor;
    });
  });

  document.querySelectorAll('input[name="alergia"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const haAlergia = document.getElementById('radioAlergiaSim').checked;
      document.getElementById('alergiaFields').classList.toggle('hidden', !haAlergia);
      document.getElementById('regAlergia').required = haAlergia;
    });
  });
}

function setupRegisterForm() {
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
}

function handleRegister(e) {
  e.preventDefault();
  const errEl = document.getElementById('registerError');
  errEl.classList.add('hidden');

  const nome       = document.getElementById('regNome').value.trim();
  const cpf        = document.getElementById('regCPF').value.trim();
  const email      = document.getElementById('regEmail').value.trim();
  const telefone   = document.getElementById('regTelefone').value.trim();
  const idadeVal   = document.querySelector('input[name="idade"]:checked');
  const alergiaVal = document.querySelector('input[name="alergia"]:checked');
  const transpVal  = document.querySelector('input[name="transporte"]:checked');

  if (!nome || !cpf || !email || !telefone || !idadeVal || !alergiaVal || !transpVal) {
    errEl.textContent = 'Preencha todos os campos obrigatórios (*).';
    errEl.classList.remove('hidden'); return;
  }

  if (findTravelerByCPF(cpf)) {
    errEl.textContent = 'Este CPF já está cadastrado. Faça login.';
    errEl.classList.remove('hidden'); return;
  }

  const isMenor = idadeVal.value === 'menor';
  let responsavelCPF = null, nascimento = null;

  if (isMenor) {
    responsavelCPF = document.getElementById('regResponsavel').value.trim();
    nascimento     = document.getElementById('regNascimento').value;
    if (!responsavelCPF || !nascimento) {
      errEl.textContent = 'Informe o responsável e a data de nascimento.';
      errEl.classList.remove('hidden'); return;
    }
    if (!findTravelerByCPF(responsavelCPF)) {
      errEl.textContent = 'CPF do responsável não encontrado no sistema.';
      errEl.classList.remove('hidden'); return;
    }
  }

  const newTraveler = {
    cpf, nome, email, telefone,
    idade: idadeVal.value, nascimento: nascimento || null, responsavelCPF: responsavelCPF || null,
    alergia: alergiaVal.value,
    alergiaDesc: alergiaVal.value === 'sim' ? document.getElementById('regAlergia').value : '',
    transporte: transpVal.value,
    familia: document.getElementById('regFamilia').value.trim(),
    parentesco: document.getElementById('regParentesco').value,
    senha: 'viagem123', payStatus: 'analise', payMethod: null,
    seat: null, andar: null, quarto: null, tipoQuarto: null
  };

  AppState.newTraveler = newTraveler;
  goTo('paymentScreen');
}

/* ============================================================
   PAGAMENTO
   ============================================================ */
function selectPayment(method) {
  document.getElementById('pixMethod').classList.toggle('selected', method === 'pix');
  document.getElementById('boletoMethod').classList.toggle('selected', method === 'boleto');
  document.getElementById('pixDetails').classList.toggle('hidden', method !== 'pix');
  document.getElementById('boletoDetails').classList.toggle('hidden', method !== 'boleto');
  if (AppState.newTraveler) AppState.newTraveler.payMethod = method;
}

function copyPix() {
  const key = document.getElementById('pixKey').textContent;
  navigator.clipboard.writeText(key).then(() => showToast('Chave PIX copiada!'));
}

function calcParcelas() {
  const valorTotal   = 850;
  const parcelas     = parseInt(document.getElementById('parcelas').value);
  const valorParcela = (valorTotal / parcelas).toFixed(2);
  const label = parcelas === 1
    ? `Total: R$ ${valorTotal},00 à vista`
    : `Total: ${parcelas}x de R$ ${valorParcela} (R$ ${valorTotal},00)`;
  document.getElementById('parcelaLabel').textContent = label;
}

function confirmPayment() {
  if (!AppState.newTraveler) return;
  AppState.newTraveler.payMethod = 'pix';
  finishPayment();
}

function gerarBoleto() {
  if (!AppState.newTraveler) return;
  AppState.newTraveler.payMethod = 'boleto';
  showToast('Boleto gerado! Verifique seu e-mail.');
  finishPayment();
}

function finishPayment() {
  if (!AppState.newTraveler?.payMethod) {
    showToast('Selecione uma forma de pagamento.', 'error'); return;
  }
  goTo('rulesScreen');
}

/* ============================================================
   REGRAS
   ============================================================ */
function checkTerms() {
  document.getElementById('btnContinueRules').disabled =
    !document.getElementById('acceptTerms').checked;
}

function goToConfirmation() {
  if (!AppState.newTraveler) return;

  // ✅ Salva no localStorage — aparece imediatamente no painel admin
  const list = AppState.travelers;
  list.push(AppState.newTraveler);
  AppState.travelers = list;

  AppState.currentUser = {
    cpf: AppState.newTraveler.cpf,
    role: 'traveler',
    data: AppState.newTraveler
  };

  updateConfirmationScreen(AppState.newTraveler);
  goTo('confirmationScreen');
}

function updateConfirmationScreen(traveler) {
  document.getElementById('summaryNome').textContent       = traveler.nome;
  document.getElementById('summaryCPF').textContent        = traveler.cpf;
  document.getElementById('summaryEmail').textContent      = traveler.email;
  document.getElementById('summaryTransporte').textContent =
    traveler.transporte === 'onibus' ? 'Ônibus da Igreja' : 'Veículo Próprio';
  document.getElementById('confirmAsiento').textContent    = traveler.seat || 'A ser definido';
  document.getElementById('confirmAndar').textContent      = traveler.andar || '—';
  document.getElementById('confirmQuarto').textContent     = traveler.quarto || 'A ser definido';
  document.getElementById('confirmTipoQuarto').textContent = traveler.tipoQuarto || '—';
}

/* ============================================================
   PAINEL DO VIAJANTE
   ============================================================ */
function loadTravelerDashboard(traveler) {
  document.getElementById('travelerName').textContent = `Olá, ${traveler.nome.split(' ')[0]}`;
  document.getElementById('profileName').textContent  = traveler.nome;

  const statusMap = {
    pago:     { label:'Confirmado',  cls:'badge-paid'    },
    pendente: { label:'Pendente',    cls:'badge-pending' },
    analise:  { label:'Em análise',  cls:'badge-analise' },
    desistiu: { label:'Desistência', cls:'badge-cancel'  },
  };
  const st = statusMap[traveler.payStatus] || statusMap.analise;
  const badgeEl = document.getElementById('dashPayStatus');
  badgeEl.textContent = st.label;
  badgeEl.className   = `badge ${st.cls}`;

  document.getElementById('dashPayMethod').textContent =
    traveler.payMethod === 'pix' ? 'PIX' : traveler.payMethod === 'boleto' ? 'Boleto' : '—';
  document.getElementById('dashPayValue').textContent = 'R$ 850,00';

  document.getElementById('dashSeatInfo').innerHTML = traveler.seat
    ? `<i class="fa-solid fa-couch"></i> <strong>Assento ${traveler.seat}</strong> — ${traveler.andar}`
    : `<i class="fa-solid fa-hourglass-half"></i> <span>Aguardando atribuição pelo administrador</span>`;

  document.getElementById('dashRoomInfo').innerHTML = traveler.quarto
    ? `<i class="fa-solid fa-door-closed"></i> <strong>Quarto ${traveler.quarto}</strong> — ${traveler.tipoQuarto}`
    : `<i class="fa-solid fa-hourglass-half"></i> <span>Aguardando atribuição pelo administrador</span>`;

  const dependentes = AppState.travelers.filter(t => t.responsavelCPF === traveler.cpf);
  if (dependentes.length > 0) {
    document.getElementById('dependentsCard').style.display = 'block';
    document.getElementById('dependentsList').innerHTML = dependentes.map(d => `
      <div class="summary-row">
        <span>${d.nome}</span>
        <span class="badge badge-analise">Dependente</span>
      </div>
    `).join('');
  }
}

/* ============================================================
   PERFIL — ALTERAR SENHA
   ============================================================ */
function changePassword() {
  const currentPass = document.getElementById('currentPass').value;
  const newPass     = document.getElementById('newPass').value;
  const confirmPass = document.getElementById('confirmPass').value;
  const msgEl       = document.getElementById('passChangeMsg');
  const traveler    = AppState.currentUser?.data;
  if (!traveler) return;

  if (currentPass !== traveler.senha) {
    msgEl.className   = 'error-msg';
    msgEl.textContent = 'Senha atual incorreta.';
    msgEl.classList.remove('hidden'); return;
  }
  if (newPass.length < 6) {
    msgEl.className   = 'error-msg';
    msgEl.textContent = 'A nova senha deve ter pelo menos 6 caracteres.';
    msgEl.classList.remove('hidden'); return;
  }
  if (newPass !== confirmPass) {
    msgEl.className   = 'error-msg';
    msgEl.textContent = 'As senhas não coincidem.';
    msgEl.classList.remove('hidden'); return;
  }

  // Atualiza no localStorage também
  traveler.senha = newPass;
  AppState.currentUser.data.senha = newPass;
  const list = AppState.travelers;
  const idx  = list.findIndex(t => t.cpf === traveler.cpf);
  if (idx >= 0) { list[idx].senha = newPass; AppState.travelers = list; }

  msgEl.className   = 'alert-info';
  msgEl.textContent = '✓ Senha alterada com sucesso!';
  msgEl.classList.remove('hidden');
  document.getElementById('currentPass').value = '';
  document.getElementById('newPass').value     = '';
  document.getElementById('confirmPass').value = '';
  showToast('Senha alterada com sucesso!');
}
