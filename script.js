document.addEventListener("DOMContentLoaded", async function () {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAx6ryap0wknNxNkaLgOs4Dd7d3frNlJ80",
        authDomain: "ferias-c3c7f.firebaseapp.com",
        projectId: "ferias-c3c7f",
        storageBucket: "ferias-c3c7f.appspot.com",
        messagingSenderId: "486103733731",
        appId: "1:486103733731:web:424370a5220d5fad557cd6",
        measurementId: "G-27HE626TJT"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const form = document.getElementById('cadastro-form');
    const mesAno = document.getElementById('mes-ano');
    mesAno.style.textTransform = 'uppercase';
    const diasCalendario = document.getElementById('dias-calendario');
    const feriasLista = document.getElementById('ferias-lista'); // Lista de profissionais de férias
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const modal = document.getElementById("edit-modal");
    const closeModal = document.querySelector(".close");

    const editForm = document.getElementById("edit-form");
    const deleteButton = document.getElementById("delete-button");
    let editId = null;

    // Função para gerar cores dinâmicas para os profissionais
    function generateColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Função para salvar dados no Firestore
    async function saveToFirestore(data) {
        if (editId) {
            await db.collection('ferias').doc(editId).update(data);
            editId = null;
        } else {
            await db.collection('ferias').add(data);
        }
    }

    // Função para obter os dados do Firestore
    async function getFirestoreData() {
        const snapshot = await db.collection('ferias').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Função para adicionar o evento de cadastro
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const nome = document.getElementById('nome').value;
        const squad = document.getElementById('squad').value;
        const tipo = document.getElementById('tipo').value;
        const dataInicio = document.getElementById('data-inicio').value;
        const dataFim = document.getElementById('data-fim').value;

        const feriasData = {
            nome,
            squad,
            tipo,
            dataInicio,
            dataFim,
            cor: generateColor()  // Gera uma cor diferente para cada profissional
        };

        // Salva os dados no Firestore
        await saveToFirestore(feriasData);

        // Atualiza o calendário após o cadastro
        generateCalendar(currentMonth, currentYear);
    });

    // Função para gerar o calendário
    async function generateCalendar(month, year) {
        diasCalendario.innerHTML = '';
        feriasLista.innerHTML = ''; // Limpa a lista antes de gerar novamente
        const firstDay = new Date(year, month).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date(); // Obtemos a data atual
        const todayDay = today.getDate(); // Dia atual
        const todayMonth = today.getMonth(); // Mês atual
        const todayYear = today.getFullYear(); // Ano atual

        mesAno.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

        let date = 1;
        const storedData = await getFirestoreData();
        const professionalsOnLeave = [];

        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    const cell = document.createElement('td');
                    cell.textContent = '';
                    row.appendChild(cell);
                } else if (date > daysInMonth) {
                    break;
                } else {
                    const cell = document.createElement('td');
                    const cellText = document.createTextNode(date);

                    // Verifica se o dia atual coincide com o dia do calendário
                    if (date === todayDay && month === todayMonth && year === todayYear) {
                        cell.classList.add('highlight-today'); // Adiciona uma classe para destacar o dia atual
                    }

                    cell.appendChild(cellText);

                    const cellDate = new Date(year, month, date); // Objeto Date para o dia atual do calendário
                    storedData.forEach((entry) => {
                        const dataInicio = new Date(entry.dataInicio); // Convertendo a dataInicio para objeto Date
                        const dataFim = new Date(entry.dataFim); // Convertendo a dataFim para objeto Date

                        // Lógica para garantir que todas as férias sejam mostradas corretamente, incluindo o último dia
                        if (cellDate >= dataInicio && cellDate <= dataFim.setDate(dataFim.getDate() + 1)) {
                            const span = document.createElement('span');
                            let displayName = entry.nome; // Exibe o nome completo do profissional

                            // Se for "Day Off", adiciona um asterisco
                            if (entry.tipo === "Day Off") {
                                displayName += " *";
                            }

                            // Se a data final já passou, aplica o estilo taxado
                            if (dataFim < today) {
                                span.style.textDecoration = "line-through"; // Aplica o estilo taxado
                            }

                            // Tooltip para mostrar informações adicionais
                            const tooltip = document.createElement('div');
                            tooltip.className = 'tooltip';
                            tooltip.textContent = displayName;

                            const tooltipText = document.createElement('div');
                            tooltipText.className = 'tooltiptext';
                            tooltipText.innerHTML = `
                            <strong>Nome:</strong> ${entry.nome}<br>
                            <strong>Squad:</strong> ${entry.squad}<br>
                            <strong>Tipo:</strong> ${entry.tipo}<br>
                            <strong>Data de Início:</strong> ${entry.dataInicio}<br>
                            <strong>Data de Término:</strong> ${entry.dataFim}
                        `;
                            tooltip.appendChild(tooltipText);

                            span.appendChild(tooltip);
                            span.style.backgroundColor = entry.cor;
                            span.style.padding = '2px 4px'; // Melhorar a aparência
                            span.style.color = '#FFF'; // Texto branco para contraste
                            span.style.borderRadius = '4px'; // Bordas arredondadas
                            span.style.marginTop = '1px'; // Distância entre spans
                            span.style.fontSize = '8px';
                            span.style.display = 'block'; // Garantir que o span ocupe o espaço necessário
                            span.style.whiteSpace = 'normal'; // Permitir quebra de linha
                            span.style.overflowWrap = 'break-word'; // Quebra de texto longa para evitar estouro
                            span.style.maxHeight = '100%'; // Garantir que o conteúdo não exceda o tamanho da célula
                            span.className = 'profissional-color';
                            span.setAttribute("data-id", entry.id);
                            span.addEventListener('click', () => openEditModal(entry.id));
                            cell.appendChild(span);

                            // Adiciona o nome à lista de profissionais de férias, se ainda não estiver na lista
                            if (!professionalsOnLeave.includes(entry)) {
                                professionalsOnLeave.push(entry);
                            }
                        }
                    });

                    row.appendChild(cell);
                    date++;
                }
            }
            diasCalendario.appendChild(row);
        }

        // Gerar a lista de profissionais de férias com hint (tooltip)
        professionalsOnLeave.forEach(profissional => {
            const listItem = document.createElement('li');

            // Tooltip para a lista
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = profissional.nome;

            const tooltipText = document.createElement('div');
            tooltipText.className = 'tooltiptext';
            tooltipText.innerHTML = `
            <strong>Nome:</strong> ${profissional.nome}<br>
            <strong>Squad:</strong> ${profissional.squad}<br>
            <strong>Tipo:</strong> ${profissional.tipo}<br>
            <strong>Data de Início:</strong> ${profissional.dataInicio}<br>
            <strong>Data de Término:</strong> ${profissional.dataFim}
        `;

            tooltip.appendChild(tooltipText);
            listItem.appendChild(tooltip);
            feriasLista.appendChild(listItem);
        });
    }

    // Função para abrir o modal de edição
    async function openEditModal(id) {
        const doc = await db.collection('ferias').doc(id).get();
        if (doc.exists) {
            const entry = doc.data();
            document.getElementById('edit-nome').value = entry.nome;
            document.getElementById('edit-squad').value = entry.squad;
            document.getElementById('edit-tipo').value = entry.tipo;
            document.getElementById('edit-data-inicio').value = entry.dataInicio;
            document.getElementById('edit-data-fim').value = entry.dataFim;

            editId = id; // Atribuir corretamente o editId ao documento em edição
            modal.style.display = "block";
        } else {
            console.error("Documento não encontrado para edição: ", id);
        }
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = "none";
        editId = null;
    });

    editForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const nome = document.getElementById('edit-nome').value;
        const squad = document.getElementById('edit-squad').value;
        const tipo = document.getElementById('edit-tipo').value;
        const dataInicio = document.getElementById('edit-data-inicio').value;
        const dataFim = document.getElementById('edit-data-fim').value;

        const updatedData = {
            nome,
            squad,
            tipo,
            dataInicio,
            dataFim,
            cor: generateColor()
        };

        await saveToFirestore(updatedData);

        modal.style.display = "none";
        generateCalendar(currentMonth, currentYear);
    });

    // Função para excluir um registro
    deleteButton.addEventListener('click', async function () {
        if (editId) {
            const docRef = db.collection('ferias').doc(editId);
            const docSnapshot = await docRef.get();
            if (docSnapshot.exists) {
                await docRef.delete();
                console.log("Documento excluído: ", editId);
            } else {
                console.error("Documento não encontrado para exclusão: ", editId);
            }
            modal.style.display = "none";
            generateCalendar(currentMonth, currentYear); // Atualiza o calendário após a exclusão
        }
    });

    document.getElementById('mes-anterior').addEventListener('click', function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });

    document.getElementById('mes-posterior').addEventListener('click', function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });

    // Função para exportar os dados para CSV
    function exportToCSV(data) {
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["Nome,Squad,Tipo,Data Início,Data Fim"]
                .concat(data.map(entry => `${entry.nome},${entry.squad},${entry.tipo},${entry.dataInicio},${entry.dataFim}`))
                .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ferias.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Evento para exportar CSV
    document.getElementById('export-csv').addEventListener('click', async function () {
        const storedData = await getFirestoreData();
        exportToCSV(storedData);
    });

    generateCalendar(currentMonth, currentYear);
});
