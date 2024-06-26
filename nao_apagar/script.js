{//variaveis
    let numeros = [];
    let dataInicial, dataFinal;
}

{// parte visual, exibe botões
    function tornarDivPegaResultadoVisivel() {
        const divPegaResulta = document.getElementById("pegaResultado");
        const divGeraNumeros = document.getElementById("divGeraNumeros");
        const divGeraRanking = document.getElementById("divRanking");
        const divGeraAjuda = document.getElementById("divAjuda");
        divGeraAjuda.style.display = "none";
        divGeraNumeros.style.display = "none";
        divGeraRanking.style.display = "none";
        divPegaResulta.style.display = "block"
    }

    function tornarDivGeraNumerosVisivel() {
        const divPegaResulta = document.getElementById("pegaResultado");
        const divGeraNumeros = document.getElementById("divGeraNumeros");
        const divGeraRanking = document.getElementById("divRanking");
        const divGeraAjuda = document.getElementById("divAjuda");
        divGeraAjuda.style.display = "none";
        divGeraNumeros.style.display = "block";
        divGeraRanking.style.display = "none";
        divPegaResulta.style.display = "none"
    }

    function tornarDivGeraRankingVisivel() {
        const divPegaResulta = document.getElementById("pegaResultado");
        const divGeraNumeros = document.getElementById("divGeraNumeros");
        const divGeraRanking = document.getElementById("divRanking");
        const divGeraAjuda = document.getElementById("divAjuda");
        divGeraAjuda.style.display = "none";
        divGeraNumeros.style.display = "none";
        divGeraRanking.style.display = "block";
        divPegaResulta.style.display = "none"
    }

    function tornarDivAjudaVisivel() {
        const divPegaResulta = document.getElementById("pegaResultado");
        const divGeraNumeros = document.getElementById("divGeraNumeros");
        const divGeraRanking = document.getElementById("divRanking");
        const divGeraAjuda = document.getElementById("divAjuda");
        divGeraAjuda.style.display = "block";
        divGeraNumeros.style.display = "none";
        divGeraRanking.style.display = "none";
        divPegaResulta.style.display = "none"
    }
}

{// Função que busca os resultados no site da Caixa
    function fetchPegaResultado() {
        if (!document.getElementById('startRange').value || !document.getElementById('endRange').value) {
            alert('Por favor, preencha tanto o numero do concurso inicial quanto o numero do concurso final.');
            return; // Retorna sem fazer nada se uma das datas estiver vazia
        }

        const startRange = parseInt(document.getElementById("startRange").value);
        const endRange = parseInt(document.getElementById("endRange").value);
        const resultsDiv = document.getElementById("results");

        // resultsDiv.innerHTML = "<p>Consultando resultados...</p>";
        async function fetchData(url, concurso) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                //data.dataApuracao = undefined;

                if (response.ok) {
                    const dataSorteio = data.dataApuracao;
                    let acumulou;

                    if (data.acumulado === true) {
                        acumulou = "sim";
                    } else acumulou = "não";

                    const dezenasSorteadas = data.listaDezenas.join(", ");
                    const resultDiv = document.createElement('div');
                    resultDiv.innerHTML = `Data sorteio: ${dataSorteio}; Acumulou: ${acumulou}; Número do Concurso: ${concurso}; Dezenas Sorteadas: ${dezenasSorteadas}`;
                    resultsDiv.appendChild(resultDiv);
                } else {
                    const errorDiv = document.createElement('div');
                    errorDiv.innerHTML = `Erro ao obter resultados do concurso ${concurso}: ${data.message}`;
                    resultsDiv.appendChild(errorDiv);
                }
            } catch (error) {
                const errorDiv = document.createElement('div');
                errorDiv.innerHTML = `Erro ao fazer requisição para o concurso ${concurso}: ${error.message}`;
                resultsDiv.appendChild(errorDiv);
            }
        }

        async function fetchWithRandomInterval() {
            for (let i = startRange; i <= endRange; i++) {
                const url = `https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${i}`;
                await fetchData(url, i);
                const randomInterval = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // Intervalo entre 2 e 5 segundos
                await new Promise(resolve => setTimeout(resolve, randomInterval));
            }
        }

        fetchWithRandomInterval();
    }
}//fim pega resultado

function baixarArquivo() {
    var link = document.createElement('a');
    link.href = 'Resultados_mega_sena.txt';
    link.download = 'Resultados_mega_sena.txt';
    document.body.appendChild(link); // Adiciona o link ao corpo do documento
    link.click(); // Simula um clique no link
    document.body.removeChild(link); // Remove o link do corpo do documento após o download
}//baixa Arquivo

async function selecionaRanking() { //Seleciona o Ranking
    if (!document.getElementById('dataInicial1').value || !document.getElementById('dataFinal1').value) {
        alert('Por favor, preencha tanto a data inicial quanto a data final.');
        return; // Retorna sem fazer nada se uma das datas estiver vazia
    }

    dataInicial = new Date(document.getElementById('dataInicial1').value);
    dataFinal = new Date(document.getElementById('dataFinal1').value);
    console.log(document.getElementById('dataFinal1').value)


    await openFileSelector(2);
}

function openFileSelector(opcao) {
    return new Promise(resolve => {
        const fileInput = document.getElementById('fileInput');
        const onChangeHandler = (event) => {
            const file = event.target.files[0];
            if (file) {
                lerArquivoTexto(file)
                    .then(contagemOrdenada => {
                        if (opcao == 1) {
                            numeros=[];
                            const top30MaisSorteados = criaRanking30mais(contagemOrdenada);
                            escreveRanking30mais(top30MaisSorteados);
                            top30MaisSorteados.forEach((contagem, numero) => {
                                numeros.push(numero);
                            });
                        }
                        if (opcao == 2) {
                            escreveRankingGeral(contagemOrdenada);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao ler o arquivo:', error);
                    })
                    .finally(() => {
                        fileInput.value = null; // Limpar o valor do input de arquivo
                        resolve();
                    });
            }
        };
        fileInput.addEventListener('change', onChangeHandler);
        fileInput.click();
    });
}


function escreveRankingGeral(lista) {
    let resultadoHTML = '<table>';
    resultadoHTML += '<tr><th>Sequência</th><th>Número</th><th>Quantidade</th></tr>';
    let sequencia = 1;

    lista.forEach((contagem, numero) => {
        resultadoHTML += `<tr><td>${sequencia}</td><td>${numero}</td><td>${contagem}</td></tr>`; // Adicionar cada número com sua contagem à tabela
        sequencia++;
    });

    resultadoHTML += '</table>';

    // Exibir a tabela do ranking completo na página
    document.getElementById('rank').innerHTML = resultadoHTML;
}// escreveRankingGeral

{ // cria um ranking com os 30 mais sorteados
    function criaRanking30mais(listaOrdenada) {
        // Criar um novo Map para armazenar os 30 números mais sorteados
        const top30MaisSorteados = new Map();
    
        // Iterar sobre os primeiros 30 elementos do Map ordenado
        let contador = 0;
        listaOrdenada.forEach((contagem, numero) => {
            if (contador < 30) {
                top30MaisSorteados.set(numero, contagem); // Adicionar número e contagem ao novo Map
                contador++;
            }
        });
    
        return top30MaisSorteados;
    }
    
    function escreveRanking30mais(listaNumeros) {
        // Construir a string para exibir os 30 números mais sorteados
        const contagemOrdenada = new Map([...listaNumeros.entries()].sort((a, b) => a[0] - b[0]));

        let top30HTML = "";
        contagemOrdenada.forEach((contagem, numero) => {
            top30HTML += numero + ", ";
        });
    
        // Exibir os 30 números mais sorteados na página
        document.getElementById('top30').innerHTML = top30HTML;
    }
}// cria um ranking com os 30 mais sorteados


function lerArquivoTexto(arquivo) { // retorna um map com os numeros e a quantidade de vez que ele foi sorteado
    const leitor = new FileReader();

    return new Promise((resolve, reject) => {
        leitor.onload = function (evento) {
            const texto = evento.target.result;
            const linhas = texto.split('\n'); // Dividir o texto em linhas

            // Map para armazenar a contagem de cada dezena
            const contagemDezenas = new Map();
            for (let i = 1; i <= 60; i++) {
                contagemDezenas.set(i, 0); // Inicializa o mapa com chaves de 1 a 60 e valores 0
            }

            // Iterar sobre as linhas do arquivo
            linhas.forEach(linha => {
                const partes = linha.split('; '); // Dividir a linha em partes com base no ponto e vírgula seguido de espaço
                partes.forEach(parte => {
                    if (parte.includes('Data sorteio:')) {
                        const dataSorteio = parte.split(': ')[1].trim(); // Extrair a data de sorteio da parte da linha
                        const [dia, mes, ano] = dataSorteio.split('/').map(Number); // Extrair dia, mês e ano
                        const numeros = partes[3].replace("Dezenas Sorteadas: ", "").split(', ').map(Number); // Extrair as dezenas sorteadas da parte da linha
                        const data = new Date(ano, mes - 1, dia); // Criar objeto Date com a data de sorteio
                        // Verificar se a data do sorteio está dentro do intervalo especificado                               

                        if (data >= dataInicial && data <= dataFinal) {
                            numeros.forEach(numero => {
                                contagemDezenas.set(numero, contagemDezenas.get(numero) + 1); // Incrementar contagem para cada número
                            });
                        }
                    }
                });
            });

            // Ordenar o Map pelos valores
            const contagemOrdenada = new Map([...contagemDezenas.entries()].sort((a, b) => b[1] - a[1]));

            resolve(contagemOrdenada);
        };

        leitor.onerror = function (evento) {
            reject(evento.target.error);
        };

        leitor.readAsText(arquivo);
    });
}// lerArquivoTexto


async function gerarApostas() {
    const qtApostas = parseInt(document.getElementById("qtApostas").value);
    const qtNumeros = parseInt(document.getElementById("qtNumeros").value);
    const opcao = parseInt(document.getElementById("opcao").value);

    if (document.getElementById("atualiza").checked) {
        if (!document.getElementById('dataInicial').value || !document.getElementById('dataFinal').value) {
            alert('Por favor, preencha tanto a data inicial quanto a data final.');
            return; // Retorna sem fazer nada se uma das datas estiver vazia
        }

        dataInicial = new Date(document.getElementById('dataInicial').value);
        dataFinal = new Date(document.getElementById('dataFinal').value);
        await openFileSelector(1);
    }/////aJUSTAR.


    const apostasDiv = document.getElementById("apostas");

    apostasDiv.innerHTML = ""; // Limpar apostas anteriores

    for (let i = 0; i < qtApostas; i++) {// aqui é gerada as apostas
        const apostaSet = new Set();
        const apostaArray = [];

        while (apostaSet.size < qtNumeros) {
            let numero;
            if (opcao === 1 || opcao === 3) {
                numero = numeros[Math.floor(Math.random() * numeros.length)];

            } else if (opcao === 2 || opcao === 3) {
                numero = Math.floor(Math.random() * 60) + 1;
            }
            apostaSet.add(numero);
        }

        apostaSet.forEach(numero => {
            apostaArray.push(numero);
        });

        const apostaString = apostaArray.sort((a, b) => a - b).join(" - ");
        const div = document.createElement("div");
        div.textContent = apostaString;
        apostasDiv.appendChild(div);
    }// fim For - aqui é gerada as apostas

}//geraApostas    



function clearResults() {
    const resultsDiv = document.getElementById("results");
    while (resultsDiv.firstChild) {
        resultsDiv.removeChild(resultsDiv.firstChild);
    }
}

function copyToClipboard() {
    const resultsText = document.getElementById("results").innerText;
    navigator.clipboard.writeText(resultsText)
        .then(() => alert("Resultados copiados para a área de transferência"))
        .catch(error => console.error("Erro ao copiar resultados:", error));
}





