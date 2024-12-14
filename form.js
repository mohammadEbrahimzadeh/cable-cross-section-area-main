let modalContent = document.querySelector(".modal-content");

// تابع برای نمایش ورودی دستی یا انتخاب از لیست کشویی
function toggleManualInput(selectElement, manualInputDiv, inputId) {
  if (selectElement.value === "manual") {
    manualInputDiv.style.display = "block";
  } else {
    manualInputDiv.style.display = "none";
    document.getElementById(inputId).value = "";
  }
}
// اضافه کردن EventListener برای نمایش ورودی دستی
document.getElementById("conductivity").addEventListener("change", function () {
  toggleManualInput(
    this,
    document.getElementById("manualConductivity"),
    "manualConductivityInput"
  );
});
document.getElementById("voltageDrop").addEventListener("change", function () {
  toggleManualInput(
    this,
    document.getElementById("manualVoltageDrop"),
    "manualVoltageDropInput"
  );
});

function getInputValues() {
  const voltage = document.getElementById("voltage").value;
  const conductivity =
    document.getElementById("conductivity").value === "manual"
      ? document.getElementById("manualConductivityInput").value
      : document.getElementById("conductivity").value;
  const length = document.getElementById("length").value;
  const power = document.getElementById("power").value;
  const voltageDropPercentage =
    document.getElementById("voltageDrop").value === "manual"
      ? document.getElementById("manualVoltageDropInput").value
      : document.getElementById("voltageDrop").value;
  const phases = document.getElementById("phases").value;
  const powerFactor = document.getElementById("powerFactor").value;
  const efficiency = document.getElementById("efficiency").value;
  const powerUnit = document.getElementById("powerUnit").value;

  return {
    voltage,
    conductivity,
    length,
    voltageDropPercentage,
    phases,
    powerFactor,
    efficiency,
    powerUnit,
    power,
  };
}

function calculateCurrent() {
  const { voltage, phases, powerFactor, efficiency, power } = getInputValues();

  let p = power;
  let pf = powerFactor;
  let q = efficiency;
  let v = voltage;
  let i;

  // تبدیل توان از اسب بخار به وات
  if (document.getElementById("powerUnit").value == "hp") {
    p = p * 736; // 1 hp = 736 W
  }
  if (phases == 1) {
    //   محاسبه جریان تک فاز
    i = p / (v * pf * q);
  } else {
    //   محاسبه جریان سه فاز
    i = p / (v * pf * q * Math.sqrt(3));
  }

  return i;
}

function calculateVoltageDrop() {
  const {
    voltage,
    conductivity,
    length,
    voltageDropPercentage,
    phases,
    powerFactor,
  } = getInputValues();
  const i = calculateCurrent();
  let A;
  if (phases == 1) {
    // تک فاز
    A =
      (200 * length * i * powerFactor) /
      (conductivity * voltage * voltageDropPercentage);
  } else {
    // سه فاز
    A =
      (100 * Math.sqrt(3) * length * i * powerFactor) /
      (conductivity * voltageDropPercentage);
  }

  return A;
}

function calculateCableCrossSection() {
  const { voltage, conductivity, length, voltageDropPercentage, phases } =
    getInputValues();
  const I = calculateCurrent();
  const voltageDrop = calculateVoltageDrop();
  let S;
  if (phases == 1) {
    S = (length * I * 200) / voltageDrop;
  } else {
    S = (length * I * 200) / (voltageDrop * Math.sqrt(3));
  }
  return S;
}

function displayResults() {
  let inputValues = getInputValues();
  let calculateCable = calculateCableCrossSection();
  function truncateToTwoDecimals(num) {
    return Math.floor(num * 100) / 100;
  }

  let CableCrossSection = truncateToTwoDecimals(calculateCable);

  function convertToPersianArray(obj, persianNames) {
    let result = {};

    for (const key in obj) {
      if (obj[key]) {
        if (obj.hasOwnProperty(key)) {
          result[key] = [
            {
              value: obj[key],
              fa: persianNames[key] || "نام فارسی مشخص نشده",
            },
          ];
        }
      } else {
        result = false;
        return result;
      }
    }

    return result;
  }

  const fa = {
    voltage: "ولتاژ",
    conductivity: "هدایت ویژه",
    length: "طول کابل",
    voltageDropPercentage: "درصد افت ولتاژ",
    phases: "فاز",
    powerFactor: "ضریب قدرت مصرف ‌کننده",
    efficiency: "راندمان",
    powerUnit: "واحد توان مصرف‌ کننده",
    power: "توان مصرف‌ کننده",
  };

  const result = convertToPersianArray(inputValues, fa);

  if (result) {
    for (const key in result) {
      let titleFa = result[key][0].fa;
      let value = result[key][0].value;

      modalContent.insertAdjacentHTML(
        "beforeend",
        `   
      
        <div class="mt-3">
                    <div
                      class="d-flex flex-column gap-1 align-items-center justify-content-end"
                    >
                      <div
                        class="col-10 p-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10"
                      >
                        <h5 class="text-center">${titleFa}:</h5>
                        <h6 class="pe-1">${value}</h6>
                      </div>
                    </div>
                  </div>`
      );
    }
    modalContent.insertAdjacentHTML(
      "afterbegin",
      `    <div class="col-12 p-1 bg-primary text-white text-center">
                  <h4 class="text-center">نتیجه</h4>
                </div>`
    );
    modalContent.insertAdjacentHTML(
      "beforeend",
      ` 
       <div class="mt-3">
                    <div
                      class="d-flex flex-column gap-1 align-items-center justify-content-end"
                    >
                      <div
                        class="col-10 p-3 d-flex align-items-center justify-content-center bg-success bg-opacity-25"
                      >
                        <h5 class="text-center">سطح مقطع کابل:</h5>
                        <h6 class="pe-1">${CableCrossSection} میلی متر مربع</h6>
                      </div>
                    </div>
                  </div>
                          <div
                  class="col-12 d-flex align-items-center justify-content-end"
                >
                  <div>
                    <button
                      type="button"
                      class="btn btn-secondary col-12 mt-3 bg-danger"
                      data-dismiss="modal"
                    >
                      بستن
                    </button>
                  </div>
                </div>
      `
    );
  } else {
    modalContent.insertAdjacentHTML(
      "beforeend",

      ` 
    
      </div>
             <div class="col-12 p-1 bg-primary text-white text-center">
                  <h4 class="text-center">نتیجه</h4>
                </div>
       <div
                  class="col-12 mt-3 d-flex justify-content-center align-content-center"
                >
                  <div
                    class="col-11 p-3 d-flex align-items-center text-center justify-content-center bg-danger bg-opacity-10"
                  >
                    <h6 class="p-0">لطفا مقادیر صحیح را وارد نمایید</h6>
                  </div>
                </div>
                      <div
                  class="col-12 d-flex align-items-center justify-content-end"
                >
                  <div>
                    <button
                      type="button"
                      class="btn btn-secondary col-12 mt-3 bg-danger"
                      data-dismiss="modal"
                    >
                      بستن
                    </button>
                  </div>
                </div>
`
    );
  }
}

document
  .getElementById("calculateBtn")
  .addEventListener("click", function (event) {
    modalContent.innerHTML = "";
    displayResults();
  });
