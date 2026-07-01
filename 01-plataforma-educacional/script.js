// MAPA COMPLETO DE METADADOS (Dicionário de Dados do Sistema)
const dicionarioMetadados = {
    "tb-students": {
        tabela: "students",
        descricao: "Armazena os registros cadastrais unificados dos discentes. O campo RA possui um índice B-Tree associado, permitindo buscas logarítmicas de alta performance na camada de persistência física.",
        campos: [
            { nome: "id_aluno", tipo: "SERIAL", restricao: "PRIMARY KEY" },
            { nome: "ra", tipo: "CHAR(8)", restricao: "UNIQUE / B-TREE INDEXED" },
            { nome: "id_curso", tipo: "INT", restricao: "FOREIGN KEY (cursos)" }
        ]
    },
    "tb-cursos": {
        tabela: "cursos",
        descricao: "Estrutura as matrizes de cursos da instituição acadêmica. Está associada rigidamente aos departamentos via restrições do tipo ON DELETE RESTRICT no Kernel.",
        campos: [
            { nome: "id_curso", tipo: "SERIAL", restricao: "PRIMARY KEY" },
            { nome: "nome_curso", tipo: "VARCHAR(50)", restricao: "NOT NULL / B-TREE INDEXED" },
            { nome: "id_departamento", tipo: "INT", restricao: "FOREIGN KEY (departamentos)" }
        ]
    }
};

const bancoDadosMock = {
    cursos: [{ id_curso: 1, nome_curso: "Análise e Des. de Sistemas" }, { id_curso: 2, nome_curso: "Segurança da Informação" }],
    students: [{ id_aluno: 1, ra: "26040812", id_curso: 1 }, { id_aluno: 2, ra: "20261145", id_curso: 1 }]
};

document.addEventListener("DOMContentLoaded", () => {
    popularTabelas();

    const cardStudents = document.getElementById("tb-students");
    const cardCursos = document.getElementById("tb-cursos");
    const noFolhaAtivo = document.querySelector(".no-folha.ativo");
    const sidebar = document.getElementById("painel-metadados");
    const btnFechar = document.getElementById("btn-fechar-sidebar");

    // 1. MAPEAMENTO DE INTERATIVIDADE (Hover de Relacionamentos)
    if (cardStudents && cardCursos) {
        cardStudents.addEventListener("mouseenter", () => {
            cardStudents.classList.add("tabela-relacionada-ativa");
            cardCursos.classList.add("tabela-relacionada-ativa");
        });
        cardStudents.addEventListener("mouseleave", () => {
            cardStudents.classList.remove("tabela-relacionada-ativa");
            cardCursos.classList.remove("tabela-relacionada-ativa");
        });

        // 2. CAPTURA DE EVENTO DOM: Clique abre dicionário de dados na Sidebar
        cardStudents.addEventListener("click", () => abrirInspecaoMetadados("tb-students"));
        cardCursos.addEventListener("click", () => abrirInspecaoMetadados("tb-cursos"));
    }

    // 3. EVENTO DE FECHAMENTO DA SIDEBAR
    if (btnFechar && sidebar) {
        btnFechar.addEventListener("click", () => {
            sidebar.classList.remove("ativa");
        });
    }

    if (noFolhaAtivo) {
        noFolhaAtivo.addEventListener("click", () => {
            exibirNotificacao("⚡ Index Scan O(log N): RA localizado no Bloco de Disco 0x4F2A em 0.4ms!");
        });
    }
});

// FUNÇÃO DO MOTOR DO BLOCO 3: Lê os metadados e manipula o DOM da Sidebar
function abrirInspecaoMetadados(idComponente) {
    const dadosMeta = dicionarioMetadados[idComponente];
    const sidebar = document.getElementById("painel-metadados");
    
    if (!dadosMeta || !sidebar) return;

    // Injeta os textos estruturais nos nós do DOM
    document.getElementById("meta-nome-tabela").innerText = dadosMeta.tabela;
    document.getElementById("meta-descricao").innerText = dadosMeta.descricao;

    // Monta as linhas da tabela de metadados internos
    const corpoTabelaMeta = document.getElementById("meta-linhas-tabela");
    corpoTabelaMeta.innerHTML = dadosMeta.campos.map(campo => `
        <tr>
            <td style="color: #04d361; font-weight: bold;">${campo.nome}</td>
            <td><code>${campo.tipo}</code></td>
            <td style="color: #e1a412;">${campo.restricao}</td>
        </tr>
    `).join('');

    // Dispara a animação adicionando a classe CSS
    sidebar.classList.add("ativa");
}

function popularTabelas() {
    const containerCursos = document.getElementById("dados-cursos");
    const containerStudents = document.getElementById("dados-students");

    if (containerCursos) {
        containerCursos.innerHTML = bancoDadosMock.cursos.map(c => `
            <div class="tupla-linha">
                <span class="tupla-id">#${c.id_curso}</span>
                <span>${c.nome_curso}</span>
            </div>
        `).join('');
    }
    if (containerStudents) {
        containerStudents.innerHTML = bancoDadosMock.students.map(a => `
            <div class="tupla-linha">
                <span class="tupla-id">ID:${a.id_aluno}</span>
                <span>RA:${a.ra}</span>
                <span style="color:#8257e5">FK_Curso:${a.id_curso}</span>
            </div>
        `).join('');
    }
}

function exibirNotificacao(mensagem) {
    const notification = document.createElement("div");
    notification.innerText = mensaje || mensagem;
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.backgroundColor = "#04d361";
    notification.style.color = "#000000";
    notification.style.padding = "15px";
    notification.style.borderRadius = "4px";
    notification.style.zIndex = "3000";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
}