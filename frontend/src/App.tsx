import { useEffect, useState } from 'react';
import { ThemeProvider, DEFAULT_THEME } from '@zendeskgarden/react-theming';
import { Body, Cell, Head, HeaderCell, Row, Table } from '@zendeskgarden/react-tables';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Label, Input, Textarea } from '@zendeskgarden/react-forms';
import { Alert, Title as AlertTitle } from '@zendeskgarden/react-notifications';

// Tipagem do Ticket
interface Ticket {
  id?: number;
  external_id: string;
  source: string;
  customer_name: string;
  description: string;
  status: string;
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- A MÁGICA ACONTECE AQUI ---
  // Se estiver na Vercel, usa a variável de ambiente. 
  // Se não tiver variável (local), usa o localhost.
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  // -----------------------------

  const [formData, setFormData] = useState<Ticket>({
    external_id: '',
    source: 'Mercado Livre',
    customer_name: '',
    description: '',
    status: 'new'
  });

  // Buscar Tickets
  const fetchTickets = async () => {
    try {
      // Usa a variável API_URL
      const response = await fetch(`${API_URL}/tickets/`); 
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  // Criar Ticket (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Usa a variável API_URL aqui também
      const response = await fetch(`${API_URL}/tickets/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        fetchTickets(); 
        setFormData({ 
          ...formData, 
          external_id: `MLB-${Math.floor(Math.random() * 10000)}`, 
          customer_name: '', 
          description: '' 
        });
      } else {
        alert("Erro ao criar ticket.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px' }}>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto 40px auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '40px' }}>🚀</span>
          <div>
            <h1 style={{ margin: 0, color: '#2f3941', fontSize: '24px', fontWeight: 'bold' }}>BCR Integration Hub</h1>
            <p style={{ margin: 0, color: '#68737d' }}>Simulador de Integração CX (Zendesk Channel Framework)</p>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          
          {/* Formulário */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: 'fit-content' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#2f3941' }}>Novo Chamado</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Field>
                <Label>ID do Pedido (Externo)</Label>
                <Input value={formData.external_id} placeholder="Ex: MLB-2026-99" onChange={e => setFormData({...formData, external_id: e.target.value})} required />
              </Field>
              <Field>
                <Label>Origem</Label>
                <Input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
              </Field>
              <Field>
                <Label>Nome do Cliente</Label>
                <Input value={formData.customer_name} placeholder="Nome do cliente" onChange={e => setFormData({...formData, customer_name: e.target.value})} required />
              </Field>
              <Field>
                <Label>Mensagem / Dúvida</Label>
                <Textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </Field>
              <Button isPrimary type="submit" disabled={loading} style={{ marginTop: '10px' }}>{loading ? 'Enviando...' : 'Simular Webhook'}</Button>
            </form>
            {success && (<div style={{ marginTop: '20px' }}><Alert type="success"><AlertTitle>Sucesso</AlertTitle>Ticket criado no Neon e Log salvo no Mongo!</Alert></div>)}
          </div>

          {/* Tabela */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#2f3941' }}>Fila de Atendimento</h2>
              <Button onClick={fetchTickets} size="small" isBasic>Atualizar</Button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <Head><Row><HeaderCell>ID</HeaderCell><HeaderCell>Origem</HeaderCell><HeaderCell>Cliente</HeaderCell><HeaderCell>Mensagem</HeaderCell><HeaderCell>Status</HeaderCell></Row></Head>
                <Body>
                  {tickets.length === 0 ? (<Row><Cell colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Nenhum ticket encontrado</Cell></Row>) : (tickets.map((ticket) => (<Row key={ticket.id}><Cell><b>{ticket.external_id}</b></Cell><Cell><span style={{ fontSize: '12px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', color: '#555' }}>{ticket.source}</span></Cell><Cell>{ticket.customer_name}</Cell><Cell style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.description}</Cell><Cell><span style={{ background: '#d1f7c4', color: '#0f4c05', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>{ticket.status.toUpperCase()}</span></Cell></Row>)))}
                </Body>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
export default App;