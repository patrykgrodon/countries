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

const displayCountry = function (countryData) {
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
  try {
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
  } catch (err) {
    showNoNeighboursMsg();
  }
};
const showNoResults = function () {
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
const showNoLocationMsg = function () {
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
  try {
    const coords = pos.coords;
    const res = await fetch(
      `https://geocode.xyz/${coords.latitude},${coords.longitude}?geoit=json`
    );
    if (!res.ok) throw new Error(`Couldn't get user position (${res.status})`);
    const { country } = await res.json();
    const countryData = await getCountryData(country);
    displayCountry(countryData);
  } catch (err) {
    showNoLocationMsg();
  }
};

/////////////////////////////////////////////////////
// Event listeners

// Display country you're in
locationBtn.addEventListener("click", function () {
  navigator.geolocation.getCurrentPosition(succes);
});
// Display country you're looking for
formBtn.addEventListener("click", async function (e) {
  try {
    e.preventDefault();
    const countryData = await getCountryData(formInput.value);
    displayCountry(countryData);
    formInput.value = "";
  } catch (err) {
    console.log(err.message);
    showNoResults();
  }
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
