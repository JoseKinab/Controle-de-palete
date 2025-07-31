document.addEventListener('DOMContentLoaded', () => {
  const urlPlanilha = "https://script.google.com/macros/s/AKfycbypO9FQ235aRfnWeP5sk1UcwNTaYvgwKvzGgLc-Ija3VGV82ykztJeuOhal7QG7VuVJ/exec";
  const container = document.querySelector('footer #dados-planilha');

  if (!container) {
    console.error("Elemento #dados-planilha não encontrado dentro do <footer>");
    return;
  }

  function atualizarDados() {
    fetch(urlPlanilha)
      .then(response => response.json())
      .then(data => {
        const primeiroItem = data[0];
        if (primeiroItem) {
          const novoTexto = `Total retirado = ${primeiroItem.colunaG} | Total retornado = ${primeiroItem.colunaH}`;
          const divExistente = container.querySelector('.item-dado');

          if (divExistente) {
            if (divExistente.textContent !== novoTexto) {
              divExistente.textContent = novoTexto;
            } // senão, não faz nada — evita piscar!
          } else {
            const novaDiv = document.createElement('div');
            novaDiv.className = 'item-dado';
            novaDiv.textContent = novoTexto;
            container.appendChild(novaDiv);
          }
        } else {
          console.warn("Nenhum dado encontrado.");
        }
      })
      .catch(error => {
        console.error('Erro ao buscar os dados:', error);
      });
  }

  atualizarDados();
  setInterval(atualizarDados, 1000);
});
