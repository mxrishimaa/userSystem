const form = document.querySelector('#formCadastro');
const buscarcep = document.querySelector('#buscarcep');
const cep = document.querySelector('#cep');
const estado = document.querySelector('#estado');
const cidade = document.querySelector('#cidade');

form.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log(Object.fromEntries([...form.elements]
        .filter(element => element.id)
        .map(element => [element.id, element.value])
    ));
    form.reset();
});

function mensagem(texto, tipo = "sucesso") {
    Toastify({
        text: texto,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: tipo === "sucesso"
            ? "#198754"
            : "#dc3545"
        }
    }).showToast();
}

buscarcep.addEventListener("click", async function () {
    const valor = cep.value.replace(/\D/g, "");

    if (valor.length !== 8) {
        alert("CEP Inválido! Tente novamente.")
        return;
    } try {
        const resposta = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
        const dados = await resposta.json();
        if (!resposta.ok || dados.erro)
            throw new Error("CEP não encontrado.")
        document.querySelector('#logradouro').value = dados.logradouro;
        document.querySelector('#bairro').value = dados.bairro;
        document.querySelector('#cidade').value = dados.localidade;
        document.querySelector('#estado').value = dados.uf;
        mensagem("Endereço encontrado!")
    } catch (erro) {
        mensagem(erro.message, "CEP não encontrado")
    } 
});

function adicionarOpcao(select, texto, valor) {
    select.add(new Option(texto, valor));
}

async function carregarEstados() {
    try {
        cidade.disabled = true;
        const resposta = await fetch ("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os estados");
        }
        const estados = await resposta.json();
        estados.forEach(item => adicionarOpcao(estado, item.nome, item.sigla));
    } catch (erro) {}
    mensagem.erro(erro.message, "error")
}

estado.addEventListener("change", async function() {
    cidade.replaceChildren(new Option("Carregando cidades...", ""));
    if (!estado.value) {
        cidade.replaceChildren(new Option("Selecione o estado primeiro", ""));
        return;
    }
    try {
        const resposta = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.value}/municipios`); 
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as cidades.");
        }
        const cidades = await resposta.json();
        cidade.replaceChildren(new Option("Selecione a cidade", ""));
        cidades.forEach(item => adicionarOpcao(cidade, item.nome, item.nome));
        if (cidade.dataset.localidade) {
            cidade.value = cidade.dataset.localidade;
            delete cidade.dataset.localidade;
        }
        cidade.disabled = false;
    } catch (erro) {}
});

carregarEstados();

