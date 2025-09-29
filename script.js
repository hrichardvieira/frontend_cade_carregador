const BACKEND_ADDRESS = "http://127.0.0.1";
const BACKEND_PORT = "5000"
const SJC_CITY_ID = 1;
const SP_STATE_ID = 1;
const BR_COUNTRY_ID = 1;

//Table Status ID
// id : name
const STATUS_MAP = new Map()
STATUS_MAP.set(1, "Ativo")
STATUS_MAP.set(2, "Inativo")
STATUS_MAP.set(3, "Manutenção")

//Table Type ID
// id : line
const TYPE_MAP = new Map()
TYPE_MAP.set(1, 'Wall Connector')
TYPE_MAP.set(2, 'Terra AC')

//Localização default São José dos Campos - SP Location
const MAP = L.map('map').setView([-23.1791, -45.8872], 14);

//Inicializando mapaß
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(MAP);


//Valição do formulário + criação do registro para o carregador.
(() => {
    'use strict';
  
    const form = document.getElementById('chargerForm');
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopPropagation();
  
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
  
      form.classList.add('was-validated');
  
      const name = document.getElementById('chargerName').value;
      const status = document.getElementById('chargerStatus').value;
      const type = document.getElementById('chargerType').value;
      const neighborhood = document.getElementById('chargerNeighborhood').value;
      const street = document.getElementById('chargerStreet').value;
      const cep = document.getElementById('chargerCep').value;
      const latitude = document.getElementById('chargerLatitude').value;
      const longitude = document.getElementById('chargerLongitude').value;
      const coordinates = `${latitude},${longitude}`;
  
      try {
        let neighborhoodData = await getNeighborhood(neighborhood);

        if (!neighborhoodData || !neighborhoodData.id) {
          await registerNeighborhood(neighborhood);
          neighborhoodData = await getNeighborhood(neighborhood);
        }
  
        const id_neighborhood = neighborhoodData.id_neighborhood;
        let addressData = await getAddress(cep);

        if (!addressData || !addressData.id || addressData.street !== street) {
          await registerAddress(street, id_neighborhood, cep, coordinates);
          addressData = await getAddress(cep);
        }
  
        const id_address = addressData.id_address;
        await registerCharger(id_address, status, type, name);
  
        form.reset();
        form.classList.remove('was-validated');
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerCharger'));
        modal.hide();
  
        alert("Carregador cadastrado com sucesso!");
        getChargerList();
  
      } catch (error) {
        console.error("Erro ao cadastrar carregador:", error);
        alert("Erro ao cadastrar carregador. Verifique os dados e tente novamente.");
      }
    });
})();

const addMarkerOnMap = async (name, id_address, id_type, id_status) => {
    const address = await getAddressById(id_address)

    const lat = address.coordinates.split(',')[0]
    const lng = address.coordinates.split(',')[1]

    const marker = L.marker([lat, lng]).addTo(MAP);
    marker.bindPopup(`
        <h1>${name}</h1>
        <table class="table">
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Tipo Carregador</th>
                <th scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${name}</td>
                <td>${TYPE_MAP.get(id_type)}</td>
                <td>${STATUS_MAP.get(id_status)}</td>
            </tr>
        </tbody>
        </table>
    `).openPopup();
}

//  --- Início do código para operações com a tabela charger  --- 
const registerCharger = async (id_address, id_status, id_type, name) => {
    const chargerFormData = new FormData();
    chargerFormData.append('id_address', id_address);
    chargerFormData.append('id_status', id_status);
    chargerFormData.append('id_type', id_type);
    chargerFormData.append('name', name);
    
    const chargerRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/charger';
    fetch(chargerRoute, {
        method : 'post',
        body: chargerFormData
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error('Error: ', error);
    });
}

const getCharger = async (chargerName) => {
    const chargerRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/charger?' + chargerName;
    try {
        const response = await fetch(chargerRoute, {method : 'get'});
        if (!response.ok)
            throw new Error(`HTTP error! status : ${response.status}`);

        const neighborhood = await response.json();
        return neighborhood;

    } catch (error) {
        console.error('Error', error);
        throw error;
    }
}

const getChargerList = async () => {
    const chargerListRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/chargers';
    fetch(chargerListRoute, {
        method : 'get',
    })
    .then((response) => response.json())
    .then((data) => {
        data.chargers.forEach(charger => fillTableItem(charger));
        data.chargers.forEach(charger => addMarkerOnMap(charger.name, charger.id_address, charger.id_type, charger.id_status))
    })
    .catch((error) => {
        console.error('Error', error);
    });
}

const fillTableItem = (item) => {
    //console.log(item)
}

const removeCharger = async (name) => {
    const chargerRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/charger?name=' + name;
    fetch(chargerRoute, {
        method : 'delete'
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error('Error: ', error);
    });
}

//  --- Fim do código para operações com a tabela charger  --- 

//  --- Início do código para operações com a tabela address  --- 
const registerAddress = async (street, id_neighborhood, postal_code, coordinates) => {
    const addressFormData = new FormData();
    addressFormData.append('street', street);
    addressFormData.append('id_neighborhood', id_neighborhood);
    addressFormData.append('postal_code', postal_code);
    addressFormData.append('coordinates', coordinates);
    
    const addressRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/address';
    fetch(addressRoute, {
        method : 'post',
        body: addressFormData
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error('Error: ', error);
    });
}

const getAddressById = async (id_address) => {
    const addressRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/addressId?id_address=' + id_address;
    try {
        const response = await fetch(addressRoute, {method : 'get'});
        if (!response.ok)
            throw new Error(`HTTP error! status : ${response.status}`);

        const address = await response.json();
        return address;

    } catch (error) {
        console.error('Error', error);
        throw error;
    }
} 

const getAddress = async (postalCode) => {
    const addressRoute = `${BACKEND_ADDRESS}:${BACKEND_PORT}/address?postal_code=${encodeURIComponent(postalCode)}`;
  
    try {
      const response = await fetch(addressRoute, { method: 'get' });
  
      if (response.status === 404) {
        return null;
      }
  
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
  
      const address = await response.json();
      return address;
  
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      return null;
    }
};
//  --- Fim do código para operações com a tabela address  --- 

//  --- Início do código para operações com a tabela Neighborhood  --- 
const registerNeighborhood = async (name) => {
    const neighborhoodFormData = new FormData();
    neighborhoodFormData.append('name', name);
    neighborhoodFormData.append('id_city', SJC_CITY_ID);
    
    const neighborhoodRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/neighborhood';
    fetch(neighborhoodRoute, {
        method : 'post',
        body: neighborhoodFormData
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error('Error: ', error);
    });
}

const getNeighborhood = async (name) => {
    const neighborhoodRoute = `${BACKEND_ADDRESS}:${BACKEND_PORT}/neighborhood?name=${encodeURIComponent(name)}`;

    try {
      const response = await fetch(neighborhoodRoute, { method: 'get' });
  
      if (response.status === 404) {
        return null;
      }
  
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
  
      const neighborhood = await response.json();
      return neighborhood;
  
    } catch (error) {
      console.error('Erro ao buscar bairro:', error);
      return null;
    }
};
//  --- Fim do código para operações com a tabela Neighborhood  --- 

console.log(getChargerList())