document.addEventListener("DOMContentLoaded", () => {
  const addButtons = document.querySelectorAll(".add-motoriasta");
  const container = document.getElementById("formularios-container");
  const urlPlanilha = "https://script.google.com/macros/s/AKfycbyhwJgbIvW6Y6XaesQL2smSnr5rAnpFv_U9A3lTVaWh356ebRd7Hfm2q28FIR-WaXP-/exec";

  let formularios = JSON.parse(localStorage.getItem("formularios")) || [];

  formularios.forEach((formData) => {
    criarFormulario(formData.motorista, formData);
  });

  addButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const input = btn.previousElementSibling;
      const nomeMotorista = input.value.trim();
      if (!nomeMotorista) return;

      const novoForm = {
        id: Date.now(),
        motorista: nomeMotorista,
        "data-retirada": "",
        "quantidade-retirada": "",
        "data-retorno": "",
        "quantidade-retorno": "",
        justificativa: "",
        bordaVermelha: false,
        temDivergencia: false
      };

      formularios.push(novoForm);
      localStorage.setItem("formularios", JSON.stringify(formularios));
      criarFormulario(nomeMotorista, novoForm);
      input.value = "";
    });
  });

  function criarFormulario(nomeMotorista, dados) {
    const form = document.createElement("form");
    form.style.position = "relative";

  form.innerHTML = `
  <legend>Dados da retirada</legend>
  <label>Motorista: <input type="text" name="motorista" value="${nomeMotorista}" readonly></label><br>
  <label>Data Retirada: <input type="date" name="data-retirada" value="${dados['data-retirada']}" required></label><br>
  <label>Quantidade: <input type="number" name="quantidade-retirada" value="${dados['quantidade-retirada']}" required></label><br>
  <label>Data Retorno: <input type="date" name="data-retorno" value="${dados['data-retorno']}" required></label><br>
  <label>Quantidade: <input type="number" name="quantidade-retorno" value="${dados['quantidade-retorno']}" required></label><br>
  <textarea name="justificativa" rows="2" cols="15" placeholder="Justificativa...">${dados.justificativa || ""}</textarea><br>
  <img class="adesivo" src="img/caminhao-de-carga.png" alt="Caminhão de carga">
  <button type="submit">Salvar dados</button>
`;

    const alertaDivergencia = document.createElement("div");
    alertaDivergencia.textContent = "Divergência!";
    alertaDivergencia.style.cssText = `
      position: absolute;
      top: 0px;
      right: 0px;
      color: white;
      font-weight: bold;
      background-color: rgb(255, 0, 0);
      padding: 2px 6px;
      display: ${dados.temDivergencia ? "block" : "none"};
      z-index: 10;
    `;
    form.appendChild(alertaDivergencia);

    if (dados.bordaVermelha) {
      form.style.border = "2px solid red";
    }

    let alertaTimeout;

    const updateStorageComDivergencia = () => {
      const idx = formularios.findIndex(f => f.id === dados.id);
      if (idx === -1) return;

      const quantidadeRetirada = Number(form.elements["quantidade-retirada"].value);
      const quantidadeRetorno = Number(form.elements["quantidade-retorno"].value);

      const camposPreenchidos = form.elements["quantidade-retirada"].value !== "" && form.elements["quantidade-retorno"].value !== "";
      const temDivergencia = camposPreenchidos && quantidadeRetirada !== quantidadeRetorno;

      formularios[idx] = {
        id: dados.id,
        motorista: nomeMotorista,
        "data-retirada": form.elements["data-retirada"].value,
        "quantidade-retirada": form.elements["quantidade-retirada"].value,
        "data-retorno": form.elements["data-retorno"].value,
        "quantidade-retorno": form.elements["quantidade-retorno"].value,
        justificativa: form.elements["justificativa"].value,
        bordaVermelha: temDivergencia,
        temDivergencia: temDivergencia
      };
      localStorage.setItem("formularios", JSON.stringify(formularios));

      if (alertaTimeout) clearTimeout(alertaTimeout);

      form.style.border = "";
      alertaDivergencia.style.display = "none";

      if (temDivergencia) {
        alertaTimeout = setTimeout(() => {
          form.style.border = "2px solid red"; 
          alertaDivergencia.style.display = "block";                 
        }, 700);
      }
    };

    const updateStorageSimples = () => {
      const idx = formularios.findIndex(f => f.id === dados.id);
      if (idx === -1) return;

      formularios[idx] = {
        ...formularios[idx],
        motorista: nomeMotorista,
        "data-retirada": form.elements["data-retirada"].value,
        "quantidade-retirada": form.elements["quantidade-retirada"].value,
        "data-retorno": form.elements["data-retorno"].value,
        "quantidade-retorno": form.elements["quantidade-retorno"].value,
        justificativa: form.elements["justificativa"].value
      };

      localStorage.setItem("formularios", JSON.stringify(formularios));
    };

    form.elements["quantidade-retirada"].addEventListener("input", updateStorageComDivergencia);
    form.elements["quantidade-retorno"].addEventListener("input", updateStorageComDivergencia);

    ["data-retirada", "data-retorno", "justificativa"].forEach(nomeCampo => {
      form.elements[nomeCampo].addEventListener("input", updateStorageSimples);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      updateStorageComDivergencia();

      const idx = formularios.findIndex(f => f.id === dados.id);
      if (idx === -1) return;

      if (formularios[idx].temDivergencia) {
        const confirmacao = confirm("Existe uma divergência na quantidade de retorno. Deseja salvar mesmo assim?");
        if (!confirmacao) {
          form.style.border = "2px solid red";
          localStorage.setItem("formularios", JSON.stringify(formularios));
          return;
        } else {
          form.style.border = "";
          formularios[idx].bordaVermelha = false;
          localStorage.setItem("formularios", JSON.stringify(formularios));
        }
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = "Salvando dados...";
      btn.disabled = true;
      const caminhão = form.querySelector(".adesivo");
      caminhão.classList.add("andando");

      const params = new URLSearchParams();
      Object.entries(formularios[idx]).forEach(([key, value]) => {
        if (key !== "bordaVermelha" && key !== "temDivergencia") {
          params.append(key, value);
        }
      });

      fetch(urlPlanilha, {
        method: "POST",
        body: params.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
        .then((res) => res.text())
        .then((resText) => {
          alert("Dados enviados com sucesso!");
          console.log("Resposta do servidor:", resText);

          formularios.splice(idx, 1);
          localStorage.setItem("formularios", JSON.stringify(formularios));
          form.remove();
        })
        .catch((err) => {
          console.error("Erro ao enviar:", err);
          alert("Falha no envio dos dados. Verifique sua conexão ou tente novamente.");
          btn.textContent = "Salvar dados";
          btn.disabled = false;
        });
    });

    container.appendChild(form);
  }
  
});

















