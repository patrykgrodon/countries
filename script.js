///////////////////////////////////////////////////
// Variables
let countries = [];
const geolocation = {
  isLoaded: false,
  countryName: "",
};
// Location
const locationBtn = document.querySelector(".location__btn");
const locationValidMsg = document.querySelector(".location__valid-msg");
// Modal
const modal = document.querySelector(".modal");
const closeModalBtn = document.querySelector(".modal__btn");
const overlay = document.querySelector(".overlay");
// Form
const formInput = document.querySelector(".form__input");
const formBtn = document.querySelector(".form__btn");
const formPlaceholder = document.querySelector(".form__error-msg");

// Countries
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
    if (!res.ok) throw new Error(`Country not found (${res.status})`);
    if (!isNeighbour) {
      const [data] = await res.json();
      return data;
    }

    if (isNeighbour) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    throw err;
  }
};

const displayCountry = function (countryData, isLocation = false) {
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
            <p class="country__name">${countryName}</p>
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
  countries.push({ el: countryEl, name: countryName });
  if (isLocation) geolocation.countryName = countryName;
};

displayMap = function (country) {
  const spinner = renderSpinner();
  spinner.classList.add("spinner--map");

  closeModalBtn.insertAdjacentElement("afterend", spinner);
  const map = document.createElement("div");
  map.classList.add("map");
  map.innerHTML = `
  <iframe
          width="800"
          height="600"
          style="border: 0"
          loading="lazy"
          allowfullscreen
          src="https://www.google.com/maps/embed/v1/place?q=${country}&key=AIzaSyBMqV1gALEitm4NmDfa3ZTvlHe-CgjQlk0"
        ></iframe>
  `;
  closeModalBtn.insertAdjacentElement("afterend", map);
  setTimeout(() => {
    spinner.remove();
  }, 5000);
};

displayNeighbour = async function (neighbour) {
  const spinner = renderSpinner();
  try {
    const neighboursEl = document.querySelector(".neighbours-container");
    neighboursEl.insertAdjacentElement("beforeend", spinner);
    const countryData = await getCountryData(neighbour, true);
    const html = `
    <div class='neighbour'>
    <div class='neighbour__img-container'>
    <img alt="${neighbour} flag" src="https://www.countryflags.io/${countryData.alpha2Code}/shiny/64.png" class="neighbour__img"/></div>
    </div>
    `;
    neighboursEl.insertAdjacentHTML("beforeend", html);
  } catch (err) {
    showNoNeighboursMsg();
  }
  spinner.remove();
};
const showErrorMsg = function () {
  const msg = document.querySelector(".form__error-msg");
  msg.style.transform = "scaleY(1)";
  setTimeout(() => {
    msg.style.transform = "scaleY(0)";
  }, 4000);
};

const showNoNeighboursMsg = function () {
  document.querySelector(".neighbours-container").innerHTML = `
  <h3 class='neighbours__valid-msg'>This country does not have neighbours.</h3>
  `;
};

const showLocationErrorMsg = function () {
  const msgEl = document.querySelector(".location__valid-msg");
  if (msgEl.classList.contains("msg--active")) return;
  msgEl.style.transform = "translateY(50%) scaleY(1)";
  msgEl.classList.add("msg--active");
  setTimeout(hideNoLocationMsg, 4000);
};

const hideNoLocationMsg = function () {
  const msgEl = document.querySelector(".location__valid-msg");
  msgEl.style.transform = "translateY(50%) scaleY(0)";
  msgEl.classList.remove("msg--active");
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
  // Checking if information about geolocation is saved, if it's scroll to country you're in.
  if (geolocation.countryName) {
    const existingCountryEl = getExistingCountry(geolocation.countryName);
    existingCountryEl.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const spinner = renderSpinner();
  try {
    countriesContainer.insertAdjacentElement("afterbegin", spinner);

    const coords = pos.coords;
    // Getting name of country you're in.
    const res = await fetch(
      `https://geocode.xyz/${coords.latitude},${coords.longitude}?geoit=json`
    );
    if (!res.ok) throw new Error(`Couldn't get user position (${res.status})`);
    const { country } = await res.json();
    // Getting data about country you're in.
    const countryData = await getCountryData(country);
    geolocation.countryName = countryData.name;

    // Checking if country we received is already displayed, if it's scroll to. If not, display.
    const existingCountryEl = getExistingCountry(countryData.name);
    console.log();
    if (existingCountryEl) {
      existingCountryEl.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      displayCountry(countryData, true);
    }
    geolocation.isLoaded = true;
  } catch (err) {
    showLocationErrorMsg();
  }
  spinner.remove();
};

const renderSpinner = function () {
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  spinner.innerHTML = `
  <svg>
    <use href="../img/icons.svg#icon-loader"></use>
  </svg>`;
  return spinner;
};

const getExistingCountry = function (countryName) {
  const existingCountry = countries.find(
    (country) => country.name === countryName
  );
  console.log(existingCountry);
  return existingCountry ? existingCountry.el : "";
};
/////////////////////////////////////////////////////
// Event listeners

// Display country you're in
locationBtn.addEventListener("click", function () {
  navigator.geolocation.getCurrentPosition(succes);
});
// Display country you're looking for
formBtn.addEventListener("click", async function (e) {
  const spinner = renderSpinner();
  try {
    countriesContainer.insertAdjacentElement("afterbegin", spinner);
    e.preventDefault();
    const countryData = await getCountryData(formInput.value);

    // Check if country you're looking for is already displayed.
    // If it's scroll to. If not, display.
    if (countries.length === 0) {
      displayCountry(countryData);
    } else {
      const existingCountryEl = getExistingCountry(countryData.name);
      existingCountryEl.scrollIntoView({ behavior: "smooth" });
    }
    formInput.value = "";
  } catch (err) {
    showErrorMsg();
  }
  spinner.remove();
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
    if (neighbours[0] === "") {
      showNoNeighboursMsg();
      return;
    }
    neighbours.forEach((neighbour) => displayNeighbour(neighbour));
  }
});
// Close Modal
closeModalBtn.addEventListener("click", function () {
  closeModal();
});
