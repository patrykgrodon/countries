///////////////////////////////////////////////////
// Variables
const locationBtn = document.querySelector(".location__btn");
const closeModalBtn = document.querySelector(".modal__btn");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const formInput = document.querySelector(".form__input");
const formBtn = document.querySelector(".form__btn");
const countriesContainer = document.querySelector(".countries-container");

/////////////////////////////////////////////
// Functions

const getCountryData = async function (country) {
  try {
    const res = await fetch(`https://restcountries.eu/rest/v2/name/${country}`);
    const [data] = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};

const displayCountry = async function (countryData) {
  console.log(countryData);
  console.log(countryData.name, countryData.name.length);
  const countryImg = countryData.flag;
  const countryName = countryData.name;
  const countryCapital = countryData.capital;
  const countryLanguage = countryData.languages[0].name;
  const countryPopulation = countryData.population;
  const countryCurrencies = countryData.currencies[0].name;

  const html = `
  <div class="country">
              <img class="country__img" src="${countryImg}" alt="Country image" />
            <p class="country__name heading-2">${countryName}</p>
            <div class="country__info-container">
              <p class="country__info">Capital: ${countryCapital}</p>
              <p class="country__info">Language: ${countryLanguage}</p>
              <p class="country__info">Population: ${countryPopulation}</p>
              <p class="country__info">Currency: ${countryCurrencies}</p>
            </div>
            <p class="country__map">Show on map</p>
            <p class="country__neighbours">Neighbours</p>
          </div>
  `;
  countriesContainer.insertAdjacentHTML("afterbegin", html);
};

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

const succes = async function (pos) {
  const coords = pos.coords;
  const res = await fetch(
    `https://geocode.xyz/${coords.latitude},${coords.longitude}?geoit=json`
  );
  const { country } = await res.json();
  const countryData = await getCountryData(country);
  displayCountry(countryData);
};

/////////////////////////////////////////////////////
// Event listeners

// Display country you're in
locationBtn.addEventListener("click", function () {
  navigator.geolocation.getCurrentPosition(succes);
});
// Display country you're looking for
formBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  const countryData = await getCountryData(formInput.value);
  displayCountry(countryData);
  formInput.value = "";
});

// Close Modal
closeModalBtn.addEventListener("click", function () {
  closeModal();
});
displayMap = function (country) {
  const html = `
    <div class="modal__map">
        <iframe
          width="800"
          height="600"
          style="border: 0"
          loading="lazy"
          allowfullscreen
          src="https://www.google.com/maps/embed/v1/place?q=${country}&key=AIzaSyBMqV1gALEitm4NmDfa3ZTvlHe-CgjQlk0"
        ></iframe>
      </div>`;
  btnCloseModal.insertAdjacentHTML("afterend", html);
};

displayNeighbour = function (countryData) {
  const html = `
    <div class='neighbour'>
    <div class='neighbour__img-container'>
    <img alt="${countryData.name}" src="https://www.countryflags.io/${countryData.alpha2Code}/shiny/64.png" class="neighbour__img"/></div>
    </div>
    `;
};
