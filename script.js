const BACKEND_ADDRESS = "http://127.0.0.1";
const BACKEND_PORT = "5001"
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

//Default São José dos Campos - SP Location
const MAP = L.map('map').setView([-23.1791, -45.8872], 14);

//Initialize map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(MAP);

// var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(MAP);
// }
// MAP.on('click', onMapClick);

(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()

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
    const addressRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/address?' + postalCode;
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
    const neighborhoodRoute = BACKEND_ADDRESS + ':' + BACKEND_PORT + '/neighborhood?' + name;
    try {
        const response = await fetch(neighborhoodRoute, {method : 'get'});
        if (!response.ok)
            throw new Error(`HTTP error! status : ${response.status}`);

        const neighborhood = await response.json();
        return neighborhood;

    } catch (error) {
        console.error('Error', error);
        throw error;
    }
}

//getCharger("Tauste")
console.log(getChargerList())
//registerCharger(1, 1, 1, 'Centro')
//removeCharger('Centro')