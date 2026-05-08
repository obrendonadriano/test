import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LEAD_TABLES, type LeadProductType } from '../lib/leadTables';
import { LogOut, Download, Trash2, FileText, Search, Filter, MessageCircle, Users, CalendarDays, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './Admin.css';

type Lead = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  data_nascimento: string | null;
  placa: string;
  ano: number;
  valor_desejado: number;
  status?: string | null;
  created_at: string;
  leadTable: string;
  productType: LeadProductType;
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchLeads();
  }, []);

  const checkUser = async () => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn !== 'true') {
      navigate('/admin/login');
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [veiculoResponse, imovelResponse] = await Promise.all([
        supabase.from(LEAD_TABLES.veiculo).select('*').order('created_at', { ascending: false }),
        supabase.from(LEAD_TABLES.imovel).select('*').order('created_at', { ascending: false }),
      ]);

      if (veiculoResponse.error) throw veiculoResponse.error;
      if (imovelResponse.error) throw imovelResponse.error;

      const veiculoLeads = (veiculoResponse.data || []).map((lead) => ({
        ...lead,
        leadTable: LEAD_TABLES.veiculo,
        productType: 'veiculo' as const,
      }));

      const imovelLeads = (imovelResponse.data || []).map((lead) => ({
        ...lead,
        leadTable: LEAD_TABLES.imovel,
        productType: 'imovel' as const,
      }));

      setLeads([...veiculoLeads, ...imovelLeads].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }));
    } catch (err) {
      console.error("Erro ao buscar leads:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (lead: Lead) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        const { error } = await supabase.from(lead.leadTable).delete().eq('id', lead.id);
        if (error) throw error;
        fetchLeads();
      } catch (err) {
        console.error("Erro ao deletar lead:", err);
        alert("Erro ao excluir lead. Verifique o console.");
      }
    }
  };

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      const { error } = await supabase
        .from(lead.leadTable)
        .update({ status: newStatus })
        .eq('id', lead.id);
        
      if (error) throw error;
      
      // Atualiza o estado local para evitar recarregar tudo
      setLeads(leads.map((currentLead) => (
        currentLead.id === lead.id && currentLead.leadTable === lead.leadTable
          ? { ...currentLead, status: newStatus }
          : currentLead
      )));
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`Erro ao atualizar: Você precisa criar a coluna 'status' no Supabase primeiro! Detalhes: ${message}`);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin/login');
  };

  const exportToExcel = () => {
    const wsData = leads.map((lead) => ({
      Nome: lead.nome,
      Produto: lead.productType === 'imovel' ? 'Imóvel' : 'Veículo',
      CPF: lead.cpf,
      Telefone: lead.telefone,
      'Data de Nascimento': lead.data_nascimento,
      Placa: lead.placa,
      Ano: lead.ano,
      'Valor Desejado': lead.valor_desejado,
      'Data do Cadastro': new Date(lead.created_at).toLocaleDateString('pt-BR'),
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_averbai_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(67, 67, 69); // var(--color-text)
    doc.text('Relatório de Leads Capturados - Averbai', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total de leads: ${leads.length} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    const tableColumn = ["Data", "Produto", "Nome", "Telefone", "Garantia", "Valor"];
    const tableRows = leads.map(lead => [
      new Date(lead.created_at).toLocaleDateString('pt-BR'),
      lead.productType === 'imovel' ? 'Imóvel' : 'Veículo',
      lead.nome,
      lead.telefone,
      lead.productType === 'imovel' ? lead.placa.replace('IMOVEL-', '') : lead.placa,
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_desejado)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [78, 189, 56] }, // var(--color-primary)
      styles: { fontSize: 9, cellPadding: 3 },
    });

    doc.save(`leads_averbai_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getChartData = () => {
    const counts: Record<string, number> = {};
    leads.forEach(lead => {
      const date = new Date(lead.created_at).toLocaleDateString('pt-BR');
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).reverse();
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.cpf.includes(searchTerm);
    if (!matchesSearch) return false;

    if (dateFilter === 'all') return true;
    
    const leadDate = new Date(lead.created_at);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - leadDate.getTime()) / (1000 * 3600 * 24));
    
    if (dateFilter === 'today') return diffDays === 0;
    if (dateFilter === '7days') return diffDays <= 7;
    if (dateFilter === '30days') return diffDays <= 30;
    
    return true;
  });

  const leadsHoje = leads.filter(lead => new Date(lead.created_at).toDateString() === new Date().toDateString()).length;
  const valorTotal = leads.reduce((acc, lead) => acc + (lead.valor_desejado || 0), 0);

  const aguardando = leads.filter(l => !l.status || l.status === 'Novo').length;
  const emAtendimento = leads.filter(l => l.status === 'Em Atendimento').length;
  const fechados = leads.filter(l => l.status === 'Fechado').length;
  const cancelados = leads.filter(l => l.status === 'Sem Interesse').length;

  return (
    <div className="admin-wrapper">
      <main className="container admin-dashboard" style={{ paddingTop: '2rem' }}>
        <div className="dashboard-header">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Leads Capturados</h2>
          <div className="dashboard-filters">
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Total: <strong>{leads.length}</strong>
            </span>
            <button className="btn btn-primary" onClick={exportToExcel} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Download size={16} style={{ marginRight: '0.5rem' }} />
              Exportar Excel
            </button>
            <button className="btn" onClick={exportToPDF} style={{ display: 'flex', alignItems: 'center', background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <FileText size={16} style={{ marginRight: '0.5rem' }} />
              Exportar PDF
            </button>
            <button 
              onClick={handleLogout}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', color: 'var(--color-text)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Sair <LogOut size={16} />
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>Visão Geral</h3>
        <div className="premium-cards-grid">
          <div className="premium-card">
            <div className="premium-card-header">
              <span className="premium-card-title">Total de Leads</span>
              <div className="premium-card-icon" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                <Users size={20} />
              </div>
            </div>
            <div className="premium-card-value">{leads.length}</div>
            <div className="premium-card-sub">Cadastros totais no sistema</div>
          </div>
          
          <div className="premium-card">
            <div className="premium-card-header">
              <span className="premium-card-title" style={{ color: 'var(--color-primary)' }}>Novos Hoje</span>
              <div className="premium-card-icon" style={{ backgroundColor: '#dcfce7', color: 'var(--color-primary)' }}>
                <CalendarDays size={20} />
              </div>
            </div>
            <div className="premium-card-value" style={{ color: 'var(--color-primary)' }}>{leadsHoje}</div>
            <div className="premium-card-sub">Entradas nas últimas 24h</div>
          </div>
          
          <div className="premium-card">
            <div className="premium-card-header">
              <span className="premium-card-title">Valor Solicitado</span>
              <div className="premium-card-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className="premium-card-value">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valorTotal)}
            </div>
            <div className="premium-card-sub">Soma de todos os leads</div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)', marginTop: '2rem' }}>Funil de Vendas</h3>
        <div className="status-cards-grid">
          <div className="status-card" style={{ border: '1px solid #fef08a' }}>
            <div className="status-indicator" style={{ backgroundColor: '#eab308' }}></div>
            <div className="status-card-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={16} color="#ca8a04" />
                <h3 style={{ fontSize: '0.875rem', color: '#854d0e', fontWeight: 600 }}>Aguardando</h3>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#854d0e' }}>{aguardando}</p>
            </div>
          </div>
          
          <div className="status-card" style={{ border: '1px solid #bae6fd' }}>
            <div className="status-indicator" style={{ backgroundColor: '#0ea5e9' }}></div>
            <div className="status-card-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <MessageCircle size={16} color="#0284c7" />
                <h3 style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: 600 }}>Em Atendimento</h3>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369a1' }}>{emAtendimento}</p>
            </div>
          </div>
          
          <div className="status-card" style={{ border: '1px solid #bbf7d0' }}>
            <div className="status-indicator" style={{ backgroundColor: '#22c55e' }}></div>
            <div className="status-card-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={16} color="#16a34a" />
                <h3 style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 600 }}>Fechados</h3>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d' }}>{fechados}</p>
            </div>
          </div>
          
          <div className="status-card" style={{ border: '1px solid #e2e8f0' }}>
            <div className="status-indicator" style={{ backgroundColor: '#64748b' }}></div>
            <div className="status-card-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <XCircle size={16} color="#475569" />
                <h3 style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>Cancelados</h3>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#334155' }}>{cancelados}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados...</div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
            Nenhum lead encontrado.
          </div>
        ) : (
          <>
            <div className="table-container mb-8" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Evolução de Leads</h3>
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--color-text-light)' }} 
                      dy={10}
                    />
                    <YAxis 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false} 
                      tick={{ fill: 'var(--color-text-light)' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(78, 189, 56, 0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '0.25rem' }}
                      itemStyle={{ color: 'var(--color-primary)' }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="url(#colorPrimary)" 
                      radius={[6, 6, 0, 0]} 
                      name="Novos Leads" 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-container">
              <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar por Nome ou CPF..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                  <Filter size={18} style={{ color: 'var(--color-text-light)' }} />
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flex: '1', backgroundColor: '#fff' }}
                  >
                    <option value="all">Todas as datas</option>
                    <option value="today">Hoje</option>
                    <option value="7days">Últimos 7 dias</option>
                    <option value="30days">Últimos 30 dias</option>
                  </select>
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Nome / CPF</th>
                    <th>Status</th>
                    <th>Telefone</th>
                    <th>Garantia</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                  <tr key={`${lead.leadTable}-${lead.id}`}>
                    <td>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{lead.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>CPF: {lead.cpf}</div>
                    </td>
                    <td>
                      <select 
                        value={lead.status || 'Novo'} 
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '1rem', 
                          border: '1px solid var(--color-border)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          outline: 'none',
                          cursor: 'pointer',
                          backgroundColor: 
                            lead.status === 'Em Atendimento' ? '#e0f2fe' : 
                            lead.status === 'Fechado' ? '#dcfce7' : 
                            lead.status === 'Sem Interesse' ? '#f1f5f9' : '#fef9c3',
                          color:
                            lead.status === 'Em Atendimento' ? '#0369a1' : 
                            lead.status === 'Fechado' ? '#15803d' : 
                            lead.status === 'Sem Interesse' ? '#475569' : '#854d0e'
                        }}
                      >
                        <option value="Novo">Pendente</option>
                        <option value="Em Atendimento">Em Atendimento</option>
                        <option value="Fechado">Fechado</option>
                        <option value="Sem Interesse">Sem Interesse</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {lead.telefone}
                        <a 
                          href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.nome.split(' ')[0]}, somos da Averbai e estamos com sua simulação de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_desejado)}.`)}`}
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </a>
                      </div>
                    </td>
                    <td>
                      {lead.placa?.startsWith('IMOVEL-') ? (
                        <>
                          <div style={{ color: '#0369a1', fontWeight: 600 }}>Imóvel: {lead.placa.replace('IMOVEL-', '')}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                            Ano Const.: {lead.ano > 0 ? lead.ano : 'N/I'}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>Placa: {lead.placa}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Ano: {lead.ano}</div>
                        </>
                      )}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--color-primary)' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_desejado)}
                    </td>
                    <td>
                      <button onClick={() => handleDelete(lead)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }} title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </main>
    </div>
  );
}
