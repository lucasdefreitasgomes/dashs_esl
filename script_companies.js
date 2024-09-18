document.addEventListener('DOMContentLoaded', function() {
    // Mostra a sobreposição de carregamento
    document.getElementById('loading-overlay').style.display = 'flex';

    // Lê a planilha diretamente da mesma pasta
    fetch('companies_data_all.xlsx')
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
        const days = Math.floor(date);
        const dateObj = new Date(Date.UTC(1899, 11, 30 + days));
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); 
        const year = dateObj.getUTCFullYear();
        return `${day}/${month}/${year}`;
    }

    if (typeof date === 'string' && date.includes('T')) {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'N/A';

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

function updateCards(data) {
    const totalCompanies = data.length;
    const activeCompaniesCount = data.filter(company => company['active'] === true).length;
    const inactiveCompaniesCount = data.filter(company => company['active'] === false).length;
    const totalCnpj = new Set(data.map(company => company['cnpj'])).size;

    document.getElementById('total-companies').innerText = totalCompanies;
    document.getElementById('active-companies-count').innerText = activeCompaniesCount;
    document.getElementById('inactive-companies-count').innerText = inactiveCompaniesCount;
    document.getElementById('total-cnpj').innerText = totalCnpj;
}

function processTables(data) {
    const inactiveCompaniesTable = document.getElementById('inactive-companies').getElementsByTagName('tbody')[0];
    const lastFreightsTable = document.getElementById('last-freights').getElementsByTagName('tbody')[0];
    const noFreightsTable = document.getElementById('no-freights').getElementsByTagName('tbody')[0];

    data.forEach(company => {
        if (company['active'] === false) {
            const row = inactiveCompaniesTable.insertRow();
            row.insertCell(0).innerText = company['name'];
            row.insertCell(1).innerText = company['cnpj'];
        }

        if (company['lastFreightAt']) {
            const row = lastFreightsTable.insertRow();
            row.insertCell(0).innerText = company['name'];
            row.insertCell(1).innerText = formatDate(company['lastFreightAt']);
        }

        if (!company['lastFreightAt']) {
            const row = noFreightsTable.insertRow();
            row.insertCell(0).innerText = company['name'];
        }
    });
}

function updateCharts(data) {
    const ctx1 = document.createElement('canvas');
    document.querySelector('.charts').appendChild(ctx1);
    new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: ['Ativas', 'Inativas'],
            datasets: [{
                data: [
                    data.filter(company => company['active'] === true).length,
                    data.filter(company => company['active'] === false).length
                ],
                backgroundColor: ['#007bff', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });
}
