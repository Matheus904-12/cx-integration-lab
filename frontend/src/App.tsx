import { ThemeProvider, DEFAULT_THEME } from '@zendeskgarden/react-theming';
import { Body, Cell, Head, HeaderCell, Row, Table } from '@zendeskgarden/react-tables';
import { Button } from '@zendeskgarden/react-buttons';
import { useEffect, useState } from 'react';

// Define a "cara" do nosso Ticket (igual ao Python)
interface Ticket {
  id: number;
  external_id: string;
  source: string;
  customer_name: string;
  status: string;
  description: string;
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Função que busca dados do seu Python
  const fetchTickets = async () => {
    try {
      // O Vite precisa de configuração para proxy, ou usamos URL completa por enquanto
      const response = await fetch('http://127.0.0.1:8000/tickets/');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', fontFamily: 'system-ui' }}>
          BCR Integration Hub 🚀
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <Button isPrimary onClick={fetchTickets}>
            Atualizar Lista
          </Button>
        </div>

        <Table>
          <Head>
            <Row>
              <HeaderCell>ID Externo</HeaderCell>
              <HeaderCell>Origem</HeaderCell>
              <HeaderCell>Cliente</HeaderCell>
              <HeaderCell>Descrição</HeaderCell>
              <HeaderCell>Status</HeaderCell>
            </Row>
          </Head>
          <Body>
            {tickets.map((ticket) => (
              <Row key={ticket.id}>
                <Cell>{ticket.external_id}</Cell>
                <Cell>{ticket.source}</Cell>
                <Cell><b>{ticket.customer_name}</b></Cell>
                <Cell>{ticket.description}</Cell>
                <Cell>
                  <span style={{ 
                    background: ticket.status === 'Novo' ? '#1e7700ff' : '#eee', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    {ticket.status}
                  </span>
                </Cell>
              </Row>
            ))}
          </Body>
        </Table>
      </div>
    </ThemeProvider>
  );
}

export default App;