///////////////////////////////////////////////////
// Variables

// Location
const locationBtn = document.querySelector(".location__btn");
// Modal
const modal = document.querySelector(".modal");
const closeModalBtn = document.querySelector(".modal__btn");
const overlay = document.querySelector(".overlay");
// Form
const formInput = document.querySelector(".form__input");
const formBtn = document.querySelector(".form__btn");

//Countries
const countriesContainer = document.querySelector(".countries-container");
const displayMapBtn = document.querySelector("country__map");
const displayNeighboursBtn = document.querySelector("country__neighbours");

/////////////////////////////////////////////
// Functions

const getCountryData = async function (country, isNeighbour = false) {
  try {
    const res = await fetch(
      `https://restcountries.eu/rest/v2/${
        isNeighbour ? "alpha" : "name"
      }/${country}`
    );

    if (!isNeighbour) {
      const [data] = await res.json();
      return data;
    }

    if (isNeighbour) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.log(err);
  }
};

const displayCountry = async function (countryData) {
  const countryImg = countryData.flag;
  const countryName = countryData.name;
  const countryCapital = countryData.capital;
  const countryLanguage = countryData.languages[0].name;
  const countryPopulation = countryData.population;
  const countryCurrencies = countryData.currencies[0].name;

  const countryEl = document.createElement("div");
  countryEl.classList.add("country");
  countryEl.setAttribute("data-alpha2code", `${countryData.alpha2Code}`);
  countryEl.setAttribute("data-neighbours", `${countryData.borders}`);
  countryEl.innerHTML = `
              <img class="country__img" src="${countryImg}" alt="${countryName} flag" />
            <p class="country__name heading-2">${countryName}</p>
            <div class="country__info-container">
              <p class="country__info">Capital: ${countryCapital}</p>
              <p class="country__info">Language: ${countryLanguage}</p>
              <p class="country__info">Population: ${countryPopulation}</p>
              <p class="country__info">Currency: ${countryCurrencies}</p>
            </div>
            <p class="country__map">Show on map</p>
            <p class="country__neighbours">Neighbours</p>
  `;
  countriesContainer.insertAdjacentElement("afterbegin", countryEl);
  countryEl.scrollIntoView({ behavior: "smooth" });
};

displayMap = function (country) {
  const html = `
    <div class="map">
        <iframe
          width="800"
          height="600"
          style="border: 0"
          loading="lazy"
          allowfullscreen
          src="https://www.google.com/maps/embed/v1/place?q=${country}&key=AIzaSyBMqV1gALEitm4NmDfa3ZTvlHe-CgjQlk0"
        ></iframe>
      </div>`;
  closeModalBtn.insertAdjacentHTML("afterend", html);
};

displayNeighbour = async function (neighbour) {
  const countryData = await getCountryData(neighbour, true);
  const html = `
    <div class='neighbour'>
    <div class='neighbour__img-container'>
    <img alt="${neighbour} flag" src="https://www.countryflags.io/${countryData.alpha2Code}/shiny/64.png" class="neighbour__img"/></div>
    </div>
    `;
  document
    .querySelector(".neighbours-container")
    .insertAdjacentHTML("beforeend", html);
};

const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};
const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
  if (modal.querySelector(".map")) modal.querySelector(".map").remove();
  if (modal.querySelector(".neighbours"))
    modal.querySelector(".neighbours").remove();
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

// Display map/neighbours country you want
countriesContainer.addEventListener("click", function (e) {
  if (
    !e.target.classList.contains("country__map") &&
    !e.target.classList.contains("country__neighbours")
  )
    return;
  // Display map
  const countryName = e.target
    .closest(".country")
    .querySelector(".country__name").innerHTML;
  if (e.target.classList.contains("country__map")) {
    openModal();
    displayMap(countryName);
  }

  // Display neighbours
  if (e.target.classList.contains("country__neighbours")) {
    const neighbours = e.target
      .closest(".country")
      .dataset.neighbours.split(",");
    const html = `
    <div class="neighbours">
          <h3 class="neighbours__header">${countryName} neighbours</h3>
          <div class="neighbours-container"></div>
        </div>
    `;
    closeModalBtn.insertAdjacentHTML("afterend", html);
    openModal();
    neighbours.forEach((neighbour) => displayNeighbour(neighbour));
  }
});
// Close Modal
closeModalBtn.addEventListener("click", function () {
  closeModal();
});
