# Plataforma Educacional - Engine de Persistência e Visibilidade Abstrata

---

## Author: Géssica Nascimento

**Systems Analysis & Development Student**

**Date: 30/06/2026**

Este projeto foi desenvolvido como um objeto de estudo avançado focado em engenharia de dados, cobrindo todo o ciclo de vida de uma aplicação de banco de dados relacional. O escopo compreende desde o levantamento de requisitos abstratos e modelagem conceitual matemática até a implementação física no PostgreSQL, com otimização de buscas e blindagem de rede via criptografia em trânsito. O sistema simula as regras de negócio de um sistema de controle acadêmico de grande porte (como o SIGA), servindo de matriz arquitetural para aplicações corporativas.

---

## Ciclo de Engenharia e Pipeline de Modelagem

O desenvolvimento do ecossistema seguiu um pipeline rígido dividido em quatro estágios sequenciais, garantindo a transição sem perdas do ambiente abstrato para o físico:
* **Mundo Observado:** Análise macro do problema real e regras institucionais da faculdade.
* **Modelo Conceitual:** Construção do Modelo Entidade-Relacionamento (MER) abstrato.
* **Modelo Lógico:** Tradução do MER para o modelo relacional (definição de tabelas e chaves).
* **Modelo Físico:** Implementação prática dos scripts DDL no Sistema Gerenciador de Banco de Dados.

### Fases do Pipeline Executado
* **Levantamento de Requisitos:** Mapeamento de entidades físicas, restrições de volume (máximo de 3.000 alunos, 10 cursos distintos, 90 disciplinas e 40 professores) e regras institucionais de aprovação.
* **Identificação de Domínios:** Separação de elementos estruturais em categorias atômicas (Alunos, Professores, Disciplinas, Cursos, Departamentos).
* **Definição de Cardinalidades:** Mapeamento matemático das relações de participação mínima e máxima entre as tabelas.
* **Diagramação Estrutural (DER):** Modelagem gráfica baseada em diagramas de relacionamento de entidades para visualização do fluxo.
* **Dicionário de Dados:** Especificação exaustiva de atributos, tipos físicos de dados (caractere, inteiro, float, serial) e alocação de memória.
* **Normalização Formal:** Aplicação das regras matemáticas da 1FN, 2FN e 3FN/FNBC para eliminação de redundâncias e anomalias.
* **Implementação Física (DDL):** Escrita dos blocos estruturais (CREATE, ALTER, DROP) que modificam os metadados do kernel do banco.
* **Testes de Integridade:** Validação das restrições e simulação de consultas analíticas de controle de histórico.

---

## Arquitetura do Banco de Dados e Normalização (3FN)

Para mitigar anomalias de inserção, atualização e deleção, o banco de dados foi estruturado para alcançar a **Terceira Forma Normal (3FN)** e a **Forma Normal de Boyce-Codd (FNBC)** em todas as suas tabelas, eliminando qualquer dependência parcial ou transitiva.

### Resolução de Relacionamentos Muitos-para-Muitos (N:M)
Relacionamentos multivalorados complexos foram decompostos em tabelas associativas utilizando chaves primárias compostas (PK Compostas) e restrições de integridade referencial estritas (`ON DELETE RESTRICT`):
* **Matriz Curricular:** `cursos` (1:1) ──► `curso_disciplina` (1:N) ◄── (1:1) `disciplinas`
* **Histórico Acadêmico:** `disciplinas` (1:1) ──► `disc_hist` (1:N) ◄── (1:1) `historico`
* **Alocação de Corpo Docente:** `instructors` (1:1) ──► `prof_disciplina` (1:N) ◄── (1:1) `disciplinas`

### Dicionário de Tabelas do Schema Público
A estrutura física do banco de dados está consolidada através das seguintes tabelas core:
* **`students`:** Cadastro de discentes. Chave primária (`id_aluno`), chave estrangeira (`id_curso`) e restrição `UNIQUE` no registro de matrícula (`ra`).
* **`courses`:** Grade de cursos oferecidos pela instituição. Chave primária (`id_curso`).
* **`instructors`:** Cadastro de professores. Chave primária (`id_instructors`) e vínculo obrigatório com departamentos.
* **`disciplinas`:** Matriz de matérias da instituição (Matemática, Banco de Dados, Redes, etc.). Chave primária (`id_disciplinas`).
* **`grades`:** Controle de pontuação de alunos. Contem validação física via `CHECK constraint` exigindo Nota $\ge$ 6.0.
* **`frequency`:** Controle de presença. Contem validação física via `CHECK constraint` exigindo Presença $\ge$ 75%.

---

## Visualização de Infraestrutura e Blindagem de Rede

A interface visual do projeto foi projetada para atuar como um painel de telemetria arquitetural, exibindo de forma interativa o funcionamento interno do back-end.

### Componentes de Front-End e Algoritmos
* **Mapeamento Dinâmico no DOM:** Desenvolvimento em Vanilla JavaScript e CSS Grid para iluminar e correlacionar chaves primárias e estrangeiras instantaneamente via eventos de cursor (`mouseenter` / `mouseleave`), sem delays de renderização.
* **Painel Deslizante de Metadados (Sidebar):** Elemento HTML5 `<aside>` integrado para injeção dinâmica de dicionários de dados direto da memória ao clicar em qualquer tabela.
* **Telemetria O(log N):** Emulação interativa de varreduras indexadas em árvores balanceadas (**B-Tree Index Scan**), demonstrando visualmente a otimização de I/O em disco em oposição a buscas sequenciais.

### Blindagem de Protocolo HTTPS (TLSv1.3)
A infraestrutura de rede foi configurada para forçar a criptografia de dados em trânsito, encapsulando o servidor local em um túnel seguro de transporte de dados.
* **Par de Chaves Assimétricas:** Geradas via OpenSSL local utilizando algoritmo RSA de 2048 bits para assinatura digital (`key.pem` e `cert.pem`).
* **Handshake TLS no Kernel:** Servidor back-end em Python estruturado com o módulo nativo `ssl` atuando no modo `PROTOCOL_TLS_SERVER`. O fluxo intercepta requisições inseguras e estabelece a sessão segura através do acoplamento criptográfico de chaves.

---

## Como Executar o Ambiente Blindado

### 1. Pré-requisitos
* Ambiente Python 3.x instalado.
* OpenSSL configurado no terminal do sistema operacional.

### 2. Geração dos Certificados de Segurança
Execute o comando abaixo no diretório raiz do projeto para criar as chaves locais:
**openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/CN=localhost"**

### 3. Inicialização do Servidor de Borda
Inicie o servidor customizado em Python que carrega o contexto TLS:
**python3 server.py**

### 4. Acesso Seguro via Navegador
Abra o navegador e acesse o endereço utilizando o prefixo HTTPS na porta de escuta configurada:
   **https://localhost:4443**

*(Nota técnica: Como o certificado foi gerado localmente e não por uma autoridade assinadora global, clique em "Avançado" e selecione "Prosseguir para localhost" para permitir o handshake no navegador).*

---

### Estrutura de Documentação do Repositório
A trilha analítica e os relatórios técnicos do projeto estão isolados e estruturados na seguinte árvore de diretórios:

## docs
* **dev-work-report.md:** Sumário de entregas, marcos temporais e homologação de blocos de desenvolvimento.
* **dev-studies-report.md:** Fundamentação acadêmica de álgebra relacional, conjuntos numéricos e estruturas B-Tree.
* **decision-notes.md:** Caderno de arquitetura justificando decisões de projeto e trade-offs de engenharia.
* **dev-engineering-resolutions-report.md:** Relatório de resolução de bugs, tratamento de exceções em tempo de execução e correções de latência na interface.


