import requests
import pandas as pd
import urllib3
from urllib3.exceptions import InsecureRequestWarning

# Desativar os avisos de certificado SSL
urllib3.disable_warnings(InsecureRequestWarning)

# Configurações
url = "https://kuehnenagel.eslcloud.com.br/graphql"
headers = {
    "Authorization": "Bearer MNHdezAD51jdNRU4sxPg6pVss2xtXWxePRyg_H1AUzg8z1nMAffcXQ",
    "Content-Type": "application/json"
}

# Query GraphQL para pessoas físicas
query = """
query individual($params: IndividualInput!, $after: String, $before: String, $first: Int, $last: Int){
  individual(params: $params, after: $after, before: $before, first: $first, last: $last){
    edges{
      cursor
      node{
        active
        averageUnloadingTime
        billingWarning
        birthdate
        cfopCode
        chargeTde
        checkingAccount
        civilState
        cnaeCode
        cnpj
        code
        comments
        cpf
        defaultDeliveryAgentId
        email
        enabled
        fatherName
        firstFreightAt
        freightWarning
        gender
        hasWs
        id
        importNfeProducts
        inscricaoEstadual
        lastFreightAt
        migrationId
        mobileNumber
        mobileOperator
        motherName
        name
        nickname
        outpostAccessActive
        outpostAccessCustomerPriceTableId
        outpostAccessDefaultUnloadingRecipientId
        outpostAccessDocumentModal
        outpostAccessEmissionType
        outpostAccessFreightOperationId
        outpostAccessMaximumCubicVolume
        outpostAccessMaximumInvoicesValue
        outpostAccessMaximumWeight
        outpostAccessModal
        outpostAccessServiceType
        ownerAgentId
        phoneNumber
        pickWarning
        pisCode
        preBoardingDefaultCorporationId
        quoteWarning
        rg
        rgExpeditionAgency
        rgExpeditionCityId
        rgExpeditionDate
        rntrc
        rntrcExpirationDate
        taxRegime
        taxpayer
        type
        userAgentId
        website
        wsPassword
        wsUsername
      }
    }
    pageInfo{
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}
"""

# Variáveis da consulta
variables = {
    "params": {},
    "first": 100  # Define quantos registros por página (ajuste conforme necessário)
}

def fetch_all_data(url, headers, query, variables):
    all_data = []
    has_next_page = True
    cursor = None
    
    while has_next_page:
        # Adicionar o cursor da página atual, se disponível
        if cursor:
            variables['after'] = cursor
        else:
            variables.pop('after', None)  # Remove a chave se não houver cursor

        # Realizar a requisição POST para a API GraphQL
        response = requests.post(url, headers=headers, json={"query": query, "variables": variables}, verify=False)
        
        if response.status_code == 200:
            data = response.json()
            individuals = data.get('data', {}).get('individual', {}).get('edges', [])
            page_info = data.get('data', {}).get('individual', {}).get('pageInfo', {})
            
            # Adicionar os dados da página atual
            if individuals:
                all_data.extend([edge['node'] for edge in individuals])
            
            # Atualizar o cursor e a flag de paginação
            cursor = page_info.get('endCursor')
            has_next_page = page_info.get('hasNextPage', False)
            
        else:
            print(f"Erro na requisição: {response.status_code}")
            print(response.text)
            break

    return all_data

# Buscar todos os dados
all_records = fetch_all_data(url, headers, query, variables)

# Convertendo os dados em um DataFrame do pandas e salvando em um arquivo Excel
file_path = 'individuals_data_all.xlsx'
if all_records:
    df = pd.json_normalize(all_records)
    df.to_excel(file_path, index=False)
    print(f"Todos os dados salvos com sucesso em '{file_path}'.")
else:
    print("Nenhum dado encontrado.")
