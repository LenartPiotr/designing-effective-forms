let clickCount = 0;

const countryInput = document.getElementById('country');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();
        const countries = data.map(country => country.name.common);
        countries.sort((a, b) => a.localeCompare(b))
        countryInput.innerHTML = countries.map(country => `<option value="${country}">${country}</option>`).join('');
        $(countryInput).on('change', e => getCountryCode($(e.target).val()))
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function getCountryByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            $('#country').val(country)
            getCountryCode(country)
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function getAddressByPostalCode(postalCode) {
    if (!(/^\d{2}-\d{3}$/.test(postalCode))) return;
    const apiKey = geocoding_api_key;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${postalCode}&key=${apiKey}&language=pl&pretty=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const city = result.components.city || result.components.town || result.components.village;
                const street = result.components.road || result.components.neighbourhood;
                const country = result.components.country;

                $('#street').val(street);
                $('#city').val(city);
                
            } else {
                console.error('Nie znaleziono informacji dla podanego kodu pocztowego.');
            }
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera OpenCage:', error);
        });
}

function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        return response.json();
    })
    .then(data => {        
        const countryCode = data[0].idd.root + data[0].idd.suffixes.join("")
        $('#countryCode').val(countryCode)
    })
    .catch(error => {
        console.error('Wystąpił błąd:', error);
    });
}

(async () => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener('click', handleClick);

    await fetchAndFillCountries();
    getCountryByIP();

    $('#zipCode').on('input', e => getAddressByPostalCode($(e.target).val()))
})()
