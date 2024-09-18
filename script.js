document.addEventListener('DOMContentLoaded', function() {
    // Mostra a sobreposição de carregamento
    document.getElementById('loading-overlay').style.display = 'flex';

    // Lê a planilha diretamente da mesma pasta
    fetch('individuals_data_all.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const sheetName = workbook.SheetNames[0]; // Assume que os dados estão na primeira aba
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            // Processa os dados e atualiza o dashboard
            updateCards(jsonData);
            processTables(jsonData);
            updateCharts(jsonData);

            // Oculta a sobreposição de carregamento
            document.getElementById('loading-overlay').style.display = 'none';
        })
        .catch(error => {
            console.error('Erro ao carregar a planilha:', error);

            // Oculta a sobreposição de carregamento em caso de erro
            document.getElementById('loading-overlay').style.display = 'none';
        });
});

function formatDate(date) {
    if (!date) return 'N/A';

    // Verifica se a data é um número (formato serial do Excel)
    if (typeof date === 'number') {
        // Converte o número serial em uma data
        const days = Math.floor(date);
        const dateObj = new Date(Date.UTC(1899, 11, 30 + days));
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // Janeiro é 0!
        const year = dateObj.getUTCFullYear();
        return `${day}/${month}/${year}`;
    }

    // Verifica se a data é uma string no formato DD/MM/YYYY
    if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date;
    }
    
    return 'N/A'; // Retorna 'N/A' se o formato não for reconhecido
}

function processTables(data) {
    const inactivePeopleTable = document.getElementById('inactive-people').getElementsByTagName('tbody')[0];
    const inactivePeople = data.filter(d => d.active === 'FALSO' || d.active === false); // Verifica também por booleano
    inactivePeopleTable.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados
    inactivePeople.forEach(person => {
        const row = inactivePeopleTable.insertRow();
        const cell = row.insertCell(0);
        cell.textContent = person.name || 'N/A';
    });

    const lastFreightsTable = document.getElementById('last-freights').getElementsByTagName('tbody')[0];
    const lastFreights = data.filter(d => d.lastFreightAt);
    lastFreightsTable.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados
    lastFreights.forEach(person => {
        const row = lastFreightsTable.insertRow();
        row.insertCell(0).textContent = person.name || 'N/A';
        row.insertCell(1).textContent = formatDate(person.lastFreightAt) || 'N/A';
    });

    const noFreightsTable = document.getElementById('no-freights').getElementsByTagName('tbody')[0];
    const noFreights = data.filter(d => !d.lastFreightAt); // Corrigido para verificar a ausência de última data de frete
    noFreightsTable.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados
    noFreights.forEach(person => {
        const row = noFreightsTable.insertRow();
        const cell = row.insertCell(0);
        cell.textContent = person.name || 'N/A';
    });
}

function updateCards(data) {
    const totalPeople = data.length;

    // Verifica as colunas 'active' para diferentes possíveis valores
    const activePeopleCount = data.filter(d => d.active === 'VERDADEIRO' || d.active === true).length;
    const inactivePeopleCount = data.filter(d => d.active === 'FALSO' || d.active === false).length;

    const maleCount = data.filter(d => d.gender && d.gender.toLowerCase() === 'male').length;
    const femaleCount = data.filter(d => d.gender && d.gender.toLowerCase() === 'female').length;
    const otherCount = data.filter(d => !d.gender || d.gender.toLowerCase() === 'other').length;

    // Atualiza os valores dos cards com as contagens corretas
    document.getElementById('total-people').textContent = totalPeople;
    document.getElementById('active-people-count').textContent = activePeopleCount;
    document.getElementById('inactive-people-count').textContent = inactivePeopleCount;
    document.getElementById('total-male').textContent = maleCount;
    document.getElementById('total-female').textContent = femaleCount;
    document.getElementById('total-other').textContent = otherCount;

    // Efeito de contagem
    const countElements = document.querySelectorAll('.card p');
    countElements.forEach(el => {
        const target = parseInt(el.textContent, 10);
        el.textContent = '0'; // Inicializa o texto como 0
        let count = 0;
        const interval = setInterval(() => {
            if (count >= target) {
                clearInterval(interval);
                el.textContent = target; // Define o valor final
                return;
            }
            count += Math.ceil(target / 100);
            el.textContent = count;
        }, 20);
    });
}
