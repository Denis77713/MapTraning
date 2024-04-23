"use strict";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const inviz = document.querySelector(".inviz");
const form = document.querySelector(".form");
const formRow = document.querySelectorAll(".form__row");
const inputs = document.querySelectorAll(".form__input");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// Мои координаты
// Geolocation API
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
class Map {
  _map;
  mark;
  _workouts = [];
  _markers = [];
  _workoutsArr = [];
  _workoutsArrRender = [];
  _workoutsRun = [];
  _workoutsVel = [];
  _markNew = {};
  constructor() {}
  // Основой метод в котором все просто записанно
  _main() {
    navigator.geolocation.getCurrentPosition(this._mainFunction.bind(this));
    console.log(navigator.geolocation);
  }
  _mainFunction(position) {
    console.log(position);
    let longitude = position.coords.longitude;
    let latitude = position.coords.latitude;
    const arrCords = [latitude, longitude];
    //  Мои координаты
    // Подключение карты
    this._map = L.map("map").setView(arrCords, 20);
    // Настройки маркера
    let pop = L.popup({
      content: "<p>Дом</p>",
      className: "mark-popup",
      autoClose: false,
      closeOnClick: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);
    // Клик создает новый маркер
    this._map.on("click", this._mapClick.bind(this));
    // Маркер по умолчанию
    L.marker(arrCords).addTo(this._map).bindPopup(pop).openPopup();
    // Отправка формы
    this._formSubmit();
    this._targetMarker();
    this._localStoreGet();
    if (this._workoutsArrRender != null) {
      this._workoutsArr = this._workoutsArrRender;
    }
    // Рендер маркеров
    this._markNew = JSON.parse(localStorage.getItem("markers"));
    if (this._markNew != null) {
      this._markers = this._markNew;
      for (let i = 0; i < this._markNew.length; i++) {
        let markArr = L.marker([
          this._markNew[i]._latlng.lat,
          this._markNew[i]._latlng.lng,
        ])
          .addTo(this._map)
          .bindPopup(
            L.popup({
              autoClose: false,
              closeOnClick: false,
              className: "mark-popup",
            })
          )
          .openPopup();
        if (this._markNew[i]._leaflet_id === this._workoutsArrRender[i].id) {
          if (this._workoutsArrRender[i].traning === "run") {
            markArr.setPopupContent(
              `<ul class = "popUp__run">
                  <li>🏃‍♂️ Дистанция: ${
                    this._workoutsArrRender[i].distance
                  } км</li> 
                  <li>Время: ${this._workoutsArrRender[i].duration} мин</li>
                  <li>Мин/км: ${(
                    this._workoutsArrRender[i].distance /
                    this._workoutsArrRender[i].duration
                  ).toFixed(1)}</li>
                  <li> Шаг: ${this._workoutsArrRender[i].cadence}</li>
                </ul>`
            );
            // console.log(this._markNew[i]);
            // console.log(this._workoutsArrRender[i]);
          } else if (this._workoutsArrRender[i].traning === "vel") {
            // console.log(this._workoutsArrRender[i]);
            // console.log(this._markNew[i]);
            markArr.setPopupContent(
              `<ul class = "popUp__run">
                <li>🚴‍♀️ Дистанция: ${
                  this._workoutsArrRender[i].distance
                } км</li> 
                <li>Время: ${this._workoutsArrRender[i].duration} мин</li>
                <li>Мин/км: ${(
                  this._workoutsArrRender[i].distance /
                  this._workoutsArrRender[i].duration
                ).toFixed(1)}</li>
                <li> Шаг: ${this._workoutsArrRender[i].elevation}</li>
              </ul>`
            );
          }
        }
      }
    }
  }
  arrClear() {
    if (this._markNew != null || this._markNew != null) {
      this._markNew.length = 0;
      this._workoutsArrRender.length = 0;
      this._workoutsArr.length = 0;
      this._markers.length = 0;
    }
  }
  _localStore() {
    localStorage.setItem("worcouts", JSON.stringify(this._workoutsArr));
    localStorage.setItem("markers", JSON.stringify(this._markers));
  }
  _localStoreGet() {
    this._workoutsArrRender = JSON.parse(localStorage.getItem("worcouts"));
    if (this._workoutsArrRender != null) {
      for (let i = 0; i < this._workoutsArrRender.length; i++) {
        if (this._workoutsArrRender[i].traning == "run") {
          this._renderWorkouts(
            "workout workout--running",
            this._workoutsArrRender[i].id,
            "🏃‍♂️",
            this._workoutsArrRender[i].distance,
            "⏱",
            this._workoutsArrRender[i].duration,
            "⚡️",
            "🦶🏼",
            this._workoutsArrRender[i].cadence
          );
        } else if (this._workoutsArrRender[i].traning == "vel") {
          this._renderWorkouts(
            "workout workout--cycling",
            this._workoutsArrRender[i].id,
            "🚴‍♀️",
            this._workoutsArrRender[i].elevation,
            "⏱",
            this._workoutsArrRender[i].duration,
            "⚡️",
            "⛰",
            this._workoutsArrRender[i].distance
          );
        }
      }
      // console.log(...this._workoutsArrRender);
    }
  }
  // Клик на тренировку перебрасывает на маркер
  _targetMarker() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.value === "workout--running__wrapper") {
        this._markers.forEach((marker) => {
          if (marker._leaflet_id === Number(e.target.parentNode.id)) {
            this._map.setView(marker._latlng, 18);
            console.log(this._workouts);
          }
        });
      }
    });
  }
  // Отправка формы
  _formSubmit() {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      document.querySelector(".clear").disabled = "";
      // Появленеие маркера после заполнения формы
      // Проверка значений полей
      if (
        isNaN(Number(inputDistance.value)) === false &&
        isNaN(Number(inputDuration.value)) === false &&
        isNaN(Number(inputCadence.value)) === false &&
        isNaN(Number(inputElevation.value)) === false &&
        inputDistance.value != "" &&
        inputDuration.value != ""
      ) {
        this.mark._icon.classList.remove("d-none");
        this.mark._shadow.classList.remove("d-none");
        this.mark.openPopup();
        // Добавление нового dom элемента
        if (inputType.value == "running") {
          //
          this.mark.setPopupContent(
            `<ul class = "popUp__run">
              <li>🏃‍♂️ Дистанция: ${inputDistance.value} км</li> 
              <li>Время: ${inputDuration.value} мин</li>
              <li>Мин/км: ${Math.round(
                inputDistance.value / inputDuration.value
              )}</li>
              <li> Шаг: ${inputCadence.value}</li>
            </ul>`
          );
          // Запись маркера в массив
          let obj = {
            options: this.mark.options,
            _latlng: this.mark._latlng,
            _leaflet_id: this.mark._leaflet_id,
            _icon: this.mark._icon,
            _shadow: this.mark._shadow,
          };
          // Запись маркеров в массив
          this._markers.push(obj);
          obj = null;
          // Объект с данными
          this._workoutsRun = {
            id: this.mark._leaflet_id,
            distance: inputDistance.value,
            duration: inputDuration.value,
            cadence: inputCadence.value,
            traning: "run",
          };
          // Запись данных в массив
          this._workoutsArr.push(this._workoutsRun);
          // console.log(this._workoutsArr);
          this._renderWorkouts(
            "workout workout--running",
            this._workoutsRun.id,
            "🏃‍♂️",
            this._workoutsRun.distance,
            "⏱",
            this._workoutsRun.duration,
            "⚡️",
            "🦶🏼",
            this._workoutsRun.cadence
          );
          // Добавляю тренировки в список
          this._workouts = document.querySelectorAll(".workout");
          // console.log(this.mark._leaflet_id);
        } else if (inputType.value == "cycling") {
          this.mark.setPopupContent(
            `<ul class = "popUp__run">
              <li>🚴‍♀️ Дистанция: ${inputDistance.value} км</li> 
              <li>Время: ${inputDuration.value} мин</li>
              <li>Мин/км: ${Math.round(
                inputDistance.value / inputDuration.value
              )}</li>
              <li> Шаг: ${inputDistance.value}</li>
            </ul>`
          );
          // Запись маркера в массив
          let obj = {
            options: this.mark.options,
            _latlng: this.mark._latlng,
            _leaflet_id: this.mark._leaflet_id,
            _icon: this.mark._icon,
            _shadow: this.mark._shadow,
          };
          // Запись маркеров в массив
          this._markers.push(obj);
          obj = null;
          console.log(this._markers);
          // Объект с данными
          this._workoutsVel = {
            id: this.mark._leaflet_id,
            elevation: inputElevation.value,
            duration: inputDuration.value,
            distance: inputDistance.value,
            traning: "vel",
          };
          this._workoutsArr.push(this._workoutsVel);
          console.log(this._workoutsArr);

          // Отрисовка
          this._renderWorkouts(
            "workout workout--cycling",
            this._workoutsVel.id,
            "🚴‍♀️",
            this._workoutsVel.elevation,
            "⏱",
            this._workoutsVel.duration,
            "⚡️",
            "⛰",
            this._workoutsVel.distance
          );
          // Добавляю тренировки в список
          this._workouts = document.querySelectorAll(".workout");
        }
        this._localStore();
      } else {
        this.mark._icon.remove();
        this.mark._shadow.remove();
        alert(`Заполните поля числами, например: 2.5 или 2`);
      }
      // Очистка полей
      this._inputClear();
      form.classList.add("hidden");
      inviz.style = "display: none;";
      console.log(this._markNew);
      console.log(this._workoutsArrRender);
      console.log(this._workoutsArr);
      console.log(this._markers);
    });
  }
  _renderWorkouts(
    liClass,
    id,
    ico,
    distance,
    icoTwo,
    duration,
    icoTree,
    icoFour,
    cadence
  ) {
    form.insertAdjacentHTML(
      "afterend",
      `
    <li class="${liClass}" id="${id}" >
    <div class= "workout--running__wrapper"></div>
    <h2 class="workout__title">Бег - 10 Мая</h2>
    <div class="workout__details">
      <span class="workout__icon">${ico}</span>
      <span class="workout__value">${distance}</span>
      <span class="workout__unit">км</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">${icoTwo}</span>
      <span class="workout__value">${duration}</span>
      <span class="workout__unit">мин</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">${icoTree}</span>
      <span class="workout__value">${distance / duration}</span>
      <span class="workout__unit">мин/км</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">${icoFour}</span>
      <span class="workout__value">${cadence}</span>
      <span class="workout__unit">шаг</span>
    </div>
  </li>
    `
    );
  }
  // Очистка полей
  _inputClear() {
    inputs.forEach(function (dom) {
      if (
        dom.textContent.includes("Бег") != true ||
        dom.textContent.includes("Велосипед") != true
      ) {
        dom.value = null;
      }
    });
  }
  // Клик по карте
  _mapClick(ev) {
    document.querySelector(".clear").disabled = "disabled";
    // Удаление
    form.classList.remove("hidden");
    inputDistance.focus();
    inviz.style = "display: inline;";
    // Настройки маркера
    // let newPop = ;
    //  Создает новый маркер
    this.mark = L.marker(ev.latlng, {
      draggable: true,
      opacity: 1,
    })
      .addTo(this._map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: "mark-popup",
        })
      );

    // Скрытие маркера после клика
    this.mark._icon.classList.add("d-none");
    this.mark._shadow.classList.add("d-none");
    console.log();
  }
}
// Родительский класс тренировка
class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-5);
  constructor(duration, distance) {
    this.duration = duration;
    this.distance = distance;
  }
}
// Класс бег
class WorkoutRun extends Workout {
  constructor(duration, distance, tempo) {
    super(duration, distance, tempo);
    this.tempo = tempo;
  }
}
// Клас велик
class WorkoutBike extends Workout {
  constructor(duration, distance, tempo) {
    super(duration, distance, tempo);
    this.tempo = tempo;
  }
}
// Экземпляр
const demo = new Map();
demo._main();
// Выбор в выпадающем меню ТИП
inputType.addEventListener("change", function () {
  if (inputType.value == "cycling") {
    addInput("Высота", "Темп");
  } else if (inputType.value == "running") {
    addInput("Темп", "Высота");
  }
});
// Меняет Темп и Высоту по клику на Бег и Высоту
function addInput(textOne, textTwo) {
  formRow.forEach(function (dom) {
    if (dom.textContent.includes(textOne) === true) {
      dom.classList.remove("form__row--hidden");
    } else if (dom.textContent.includes(textTwo) === true) {
      dom.classList.add("form__row--hidden");
    }
  });
}
document.querySelector(".clear").addEventListener("click", function () {
  localStorage.clear();
  document.querySelectorAll(".workout").forEach((dom) => dom.remove());
  let marker = document.querySelectorAll(".leaflet-marker-icon");
  let popup = document.querySelectorAll(".leaflet-popup");
  let shadow = document.querySelectorAll(".leaflet-marker-shadow");
  for (let i = 1; i < marker.length; i++) {
    marker[i].remove();
    if (popup[i] != undefined) {
      popup[i].remove();
    }
    shadow[i].remove();
  }
  demo.arrClear();
});
