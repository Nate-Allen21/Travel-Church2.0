/**
 * data.js — Estado global compartilhado entre todas as páginas
 * Simula um banco de dados em memória via localStorage
 */

const DB = {
  _defaults: {
    travelers: [
      { cpf:'111.111.111-11', nome:'Maria Silva',    email:'maria@email.com',    telefone:'(11) 99999-0001', idade:'maior', alergia:'nao', alergiaDesc:'', transporte:'onibus', familia:'Família Silva',   parentesco:'conjuge', senha:'viagem123', payStatus:'pago',     payMethod:'pix',    seat:'01', andar:'Piso Superior', quarto:'101', tipoQuarto:'Duplo Standard' },
      { cpf:'222.222.222-22', nome:'João Silva',     email:'joao@email.com',     telefone:'(11) 99999-0002', idade:'maior', alergia:'sim', alergiaDesc:'Alergia a amendoim', transporte:'onibus', familia:'Família Silva', parentesco:'conjuge', senha:'viagem123', payStatus:'pago', payMethod:'pix', seat:'02', andar:'Piso Superior', quarto:'101', tipoQuarto:'Duplo Standard' },
      { cpf:'333.333.333-33', nome:'Ana Oliveira',   email:'ana@email.com',      telefone:'(11) 99999-0003', idade:'maior', alergia:'nao', alergiaDesc:'', transporte:'proprio',familia:'Família Oliveira',parentesco:'pai',     senha:'viagem123', payStatus:'pendente', payMethod:'boleto', seat:null, andar:null, quarto:'102', tipoQuarto:'Single' },
      { cpf:'444.444.444-44', nome:'Lucas Mendes',   email:'lucas@email.com',    telefone:'(11) 99999-0004', idade:'menor', alergia:'nao', alergiaDesc:'', transporte:'onibus', familia:'Família Silva',   parentesco:'filho',   senha:'viagem123', payStatus:'analise',  payMethod:'pix',    seat:'05', andar:'Piso Superior', quarto:null, tipoQuarto:null, nascimento:'2012-06-15', responsavelCPF:'111.111.111-11' },
      { cpf:'555.555.555-55', nome:'Fernanda Costa', email:'fernanda@email.com', telefone:'(11) 99999-0005', idade:'maior', alergia:'sim', alergiaDesc:'Necessita cadeira de rodas', transporte:'onibus', familia:'Família Costa', parentesco:'pai', senha:'viagem123', payStatus:'desistiu', payMethod:'boleto', seat:null, andar:null, quarto:null, tipoQuarto:null },
      { cpf:'666.666.666-66', nome:'Carlos Souza',   email:'carlos@email.com',   telefone:'(11) 99999-0006', idade:'maior', alergia:'nao', alergiaDesc:'', transporte:'onibus', familia:'Família Souza',   parentesco:'pai',     senha:'viagem123', payStatus:'pago',     payMethod:'pix',    seat:'09', andar:'Piso Superior', quarto:'103', tipoQuarto:'Triplo' },
      { cpf:'777.777.777-77', nome:'Beatriz Lima',   email:'bea@email.com',      telefone:'(11) 99999-0007', idade:'maior', alergia:'nao', alergiaDesc:'', transporte:'proprio',familia:'Família Lima',    parentesco:'conjuge', senha:'viagem123', payStatus:'pago',     payMethod:'pix',    seat:null, andar:null, quarto:'104', tipoQuarto:'Duplo Luxo' },
    ],
    hotelRooms: [
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
    ],
    busSeats: { 1:{}, 2:{} },
    currentUser: null
  },

  init() {
    if (!localStorage.getItem('tc_initialized')) {
      localStorage.setItem('tc_travelers',  JSON.stringify(this._defaults.travelers));
      localStorage.setItem('tc_hotel',      JSON.stringify(this._defaults.hotelRooms));
      localStorage.setItem('tc_bus',        JSON.stringify(this._defaults.busSeats));
      localStorage.setItem('tc_initialized','1');
      // Pre-populate bus seats
      const travelers = this._defaults.travelers;
      const busSeats = { 1:{}, 2:{} };
      travelers.forEach(t => {
        if (t.seat && t.andar) {
          const f = t.andar.includes('Superior') ? 1 : 2;
          busSeats[f][t.seat] = t.cpf;
        }
      });
      localStorage.setItem('tc_bus', JSON.stringify(busSeats));
    }
  },

  get travelers() { return JSON.parse(localStorage.getItem('tc_travelers') || '[]'); },
  set travelers(v) { localStorage.setItem('tc_travelers', JSON.stringify(v)); },

  get hotelRooms() { return JSON.parse(localStorage.getItem('tc_hotel') || '[]'); },
  set hotelRooms(v) { localStorage.setItem('tc_hotel', JSON.stringify(v)); },

  get busSeats() { return JSON.parse(localStorage.getItem('tc_bus') || '{"1":{},"2":{}}'); },
  set busSeats(v) { localStorage.setItem('tc_bus', JSON.stringify(v)); },

  get currentUser() { return JSON.parse(sessionStorage.getItem('tc_user') || 'null'); },
  set currentUser(v) { sessionStorage.setItem('tc_user', JSON.stringify(v)); },

  findTraveler(cpf) { return this.travelers.find(t => t.cpf === cpf) || null; },

  saveTraveler(updated) {
    const list = this.travelers;
    const idx = list.findIndex(t => t.cpf === updated.cpf);
    if (idx >= 0) list[idx] = updated; else list.push(updated);
    this.travelers = list;
  },

  requireAdmin() {
    const u = this.currentUser;
    if (!u || u.role !== 'admin') { window.location.href = '../index.html'; }
  },

  requireTraveler() {
    const u = this.currentUser;
    if (!u || u.role !== 'traveler') { window.location.href = 'index.html'; }
  },

  logout() {
    sessionStorage.removeItem('tc_user');
    const isAdmin = window.location.pathname.includes('/admin/');
    window.location.href = isAdmin ? '../index.html' : 'index.html';
  }
};

// Auto-init
DB.init();

// Shared toast
function showToast(msg, type = 'success') {
  const existing = document.getElementById('globalToast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'globalToast';
  t.className = 'toast';
  t.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}" style="color:${type==='success'?'#3dba7a':'#e85555'}"></i><span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function formatCPF(v) {
  return v.replace(/\D/g,'')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
}
