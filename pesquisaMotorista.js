
let lupa = document.getElementById("lupa-pesquisa");
let inputPesquisa = document.querySelector(".pesquisa-motorista");

lupa.addEventListener("click", function (params) {
    inputPesquisa.classList.toggle("open");
    
})



inputPesquisa.addEventListener('input', () => {
  const termo = inputPesquisa.value.toLowerCase();
  const cards = document.querySelectorAll('form');

  for (let card of cards) {
    const nomeInput = card.querySelector('input[name="motorista"]');
    const nome = nomeInput.value.toLowerCase();

    if (nome.includes(termo)) {
      card.style.display = ''; 
    } else {
      card.style.display = 'none'; 
    }
  }
});
