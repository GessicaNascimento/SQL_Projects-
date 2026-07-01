### Dev Work Report | Plataforma Educacional
Este relatório consolida o sumário de entregas, os marcos temporais, as decisões de infraestrutura e a homologação técnica dos quatro blocos de desenvolvimento da Plataforma Educacional.

---

* **Author:** Géssica Nascimento
* **Title:** Systems Analysis & Development Student
* **Date:** 30/06/2026

--- 

### Mapeamento Estrutural do Banco de Dados
 
## 1. Entidade: Alunos (students)
* **Chave-Primária:** id_aluno
* **Chaves-Estrangeiras:** id_disciplina, id_instrutor, id_curso
* **Relacionamentos:** Conecta-se com professor, disciplina e semestre.
* **Atributos:** id_aluno, id_nome, id_matrícula, id_email, id_curso, id_semestre, id_disciplina, id_instrutor, id_nota, id_frequencia.
 
## 2. Entidade: Cursos (courses)
* **Chave-Primária:** id_cursos
* **Chaves-Estrangeiras:** id_disciplina, id_aluno, id_semestre
* **Relacionamentos:** Conecta-se com aluno, professor, disciplina e semestre.
* **Atributos:** id_cursos, id_ads, id_cybersecurity, id_sistemas_embarcados, id_ciencia_de_dados, id_tecnologia_da_informacao, id_disciplinas, id_semestre, id_aluno.
 
## 3. Entidade: Professores (instructors)
* **Chave-Primária:** id_instructors
* **Chaves-Estrangeiras:** id_disciplinas
* **Relacionamentos:** Conecta-se com alunos, disciplinas, cursos e semestres.
* **Atributos:** id_instructors, id_prof fabio, id_prof loraine, id_prof viviane, id_prof peter, id_prof celio, id_prof sandra, id_prof gerson, id_prof paulo, id_prof claudio, id_prof dimas, id_email, id_disciplinas.
 
## 4. Entidade: Nota (grades)
* **Atributos:** id_grades.
* **Tipo de dado:** float.
* **Restrição física:** $N \ge 6.0$.
 
## 5. Entidade: Presença (frequency)
* **Atributos:** id_frequency.
* **Tipo de dado:** inteiro.
* **Restrição física:** $F \ge 75\%$.
 
## 6. Entidade: Disciplina (disciplinas)
* **Chave-Primária:** id_disciplinas
* **Chaves-Estrangeiras:** id_cursos, id_instrutores
* **Relacionamentos:** Conecta-se com alunos, professores e notas.
* **Atributos:** id_disciplinas, id_matemática, id_banco_de_dados, id_redes, id_programação, id_arquitetura, id_so, id_IA, id_lógica, id_inglês, id_calculo_I, id_calculo_II, id_criptografia, id_analise_de_dados, id_engenharia, id_linux, id_cursos, id_instrutores.

---
 
### Bloco 1: Engenharia de Dados e Engenharia Reversa do Diagrama
 
#### Resumo Técnico
* **Status do Bloco 1:** CONCLUÍDO & HOMOLOGADO
* **Tecnologia Principal:** PostgreSQL 15+ (Ambiente macOS/Homebrew)
* **Ferramenta de Modelagem Visual:** DBeaver Community via Engine de Engenharia Reversa
* **Paradigma de Arquitetura:** Relacional ANSI SQL Estrito, Normalização 3FN/FNBC, Integridade Referencial Baseada em Kernel.
 
A engenharia reversa leu perfeitamente todas as constraints. A estrutura encontra-se perfeitamente normalizada em 3FN/FNBC, onde as tabelas associativas (curso_disciplina, prof_disciplina, disc_hist) quebram os relacionamentos Muitos-para-Muitos (N:M) e as tabelas fortes servem como pilares de metadados.
 
## 1. Linha do Tempo de Execução e Pipeline de Deployment
O desenvolvimento da camada física seguiu o fluxo aplicado a um único script de migração (estrutura_banco.sql):
 
`[Mecanismo de Teste Limpo] ──► [DDL Alocação Física] ──► [Constraints & Chaves] ──► [Índices B-Tree] ──► [Testes de Estresse]`

* **Idempotência (Sanitização do Ambiente):** Implementação de travas de limpeza condicional (DROP TABLE IF EXISTS) respeitando a árvore de dependências para viabilizar reexecuções.
* **Data Definition Language (DDL):** Declaração explícita de tipos de dados alocados em disco, mapeamento de memória dinâmica e sequenciadores de metadados.
* **Mapeamento de Restrições (Constraints):** Fixação de limites físicos para mitigar corrupção de dados por falhas nas camadas superiores da aplicação.
* **Indexação:** Criação direcionada de estruturas de busca otimizada baseada no comportamento esperado das requisições.
 
## 2. Log de Erros e Resolução de Incidentes (Troubleshooting)
 
* **Incidente 01:** Travamento de Escopo e Prompt Retido (plataforma_educacional-#)
  * **Sintoma:** O terminal parou de responder a comandos do sistema operacional e passou a acumular linhas com o caractere `-`.
  * **Causa Raiz:** Inversão de escopo. Comandos do Shell do SO foram digitados dentro da sessão interativa aberta do PostgreSQL, que interpretou as instruções como código SQL incompleto devido à ausência do ponto e vírgula (`;`).
  * **Solução:** Aplicação do sinal de interrupção em nível de kernel (Ctrl + C) para limpar o buffer e execução do comando nativo `\q` para encerrar a sessão.
 
* **Incidente 02:** Falha Crítica de Sintaxe de Aninhamento (Linha 50)
  * **Sintoma:** O interpretador abortou a transação com a mensagem `ERROR: syntax error at or near "CREATE"`.
  * **Causa Raiz:** Bloco declarativo corrompido por duplicação. Uma instrução `CREATE TABLE departamentos (` foi aberta e, antes de seu fechamento sintático, uma nova linha idêntica foi declarada. Também identificou-se a falta de espaçamento em palavras reservadas (`nome_departamentoVARCHAR`).
  * **Solução:** Refatoração estrutural do código fonte, remoção do bloco redundante e inserção do caractere de espaço regulamentar para separar o identificador de seu tipo de dado.
 
* **Incidente 03:** Conexão Rejeitada via Handshake TCP/IP (DBeaver)
  * **Sintoma:** O DBeaver reportou o erro `FATAL: database "educacional_plataform" does not exist`.
  * **Causa Raiz:** Erro de ponteiro de metadados. O DBeaver tentou conectar utilizando o nome do diretório local do projeto, enquanto o catálogo interno do PostgreSQL esperava a string exata do banco criado (`plataforma_educacional`).
  * **Solução:** Reconfiguração do driver JDBC de conexão do DBeaver, alinhando a propriedade de destino ao nome exato gravado no servidor.
 
## 3. Decisões de Projeto e Arquitetura de Baixo Nível
* **Alocação Dinâmica com VARCHAR(N):** Escolha do tipo de dado de tamanho variável para campos de texto para garantir economia de armazenamento físico nas páginas de disco (blocos de 8KB do Postgres), pois o banco aloca apenas o tamanho real da string acrescido de 1 byte de controle.
* **Automação de Metadados com SERIAL:** Utilizado para gerenciar chaves primárias. O Postgres injeta automaticamente um objeto oculto do tipo `SEQUENCE` associado ao valor `DEFAULT` della coluna, garantindo unicidade e auto-incremento.
* **Blindagem Perimetral com ON DELETE RESTRICT:** Injeção da regra de integridade referencial nas chaves estrangeiras (`FOREIGN KEY`), impedindo a deleção inadvertida de registros pais enquanto houver registros filhos ativos vinculados.
* **Minimização de I/O via Índices B-Tree:** Criação de índices secundários utilizando a estrutura de árvore balanceada (`USING btree`) sobre as colunas mais visadas (`cursos.nome_curso`, `students.ra` e `turmas.cod_turma`), alterando a complexidade de busca de um escopo linear $O(N)$ para uma performance logarítmica $O(\log N)$.
 
## 4. Validação e Testes de Estresse
Para homologar a resiliência física do banco, simulou-se a injeção de anomalias lógicas diretamente no console:

* **-- Cenário de Teste: Injeção de nota fora do intervalo parametrizado [0.0 , 10.0]
INSERT INTO disc_hist (id_historico, id_disciplina, nota_final, frequencia, reprovacoes_acumuladas) 
VALUES (1, 1, 11.5, 90, 0);**


* **Massa de Dados Coerente:** Retornou `INSERT 0 1`, confirmando a persistência correta.
* **Massa de Dados Inválida (Nota 11.5):** Bloqueada imediatamente na camada de kernel com a mensagem: `ERROR: new row for relation "disc_hist" violates check constraint "chk_nota_valida"`.
* **Massa de Dados Inválida (Reprovações Excedidas):** Bloqueada imediatamente com a mensagem: `ERROR: new row for relation "disc_hist" violates check constraint "chk_reprovacoes"`.

---

### Bloco 2: Front-End Abstrato e Mapeamento Geométrico

#### Resumo Técnico
* **Status do Bloco 2:** CONCLUÍDO & HOMOLOGADO
* **Camada Superior:** Front-End Abstrato (HTML5 Semântico / CSS Grid & Flexbox / Vanilla JavaScript)
* **Objetivo de Negócio:** Converter a complexidade estrutural do banco de dados físico em uma interface geométrica, reativa e interativa em tempo real.

## 1. Pipeline de Arquitetura de Visualização
A construção da camada de visualização realizou o acoplamento estrutural direto dos componentes:

`[Mocks de Dados in RAM] ──► [Injeção Dinâmica via DOM] ──► [Estilização por Grid/Flexbox] ──► [Otimização de Eventos de Ponteiro]`

* **Camada de Dados Volátil (Mocks):** Vetores contendo dados relacionais simulados para emular o payload de uma API REST.
* **Motor de Renderização Dinâmica:** Varredura dos arrays via método `.map()` do JS para gerar o HTML das tuplas físicas em tempo de execução, eliminando codificação estática rígida.
* **Mapeamento Geométrico (Layout):** Emprego de CSS Grid para isolar zonas de memória (Tabelas Core vs. Índices) e CSS Flexbox para alinhar atributos internos, chaves e nós folha da árvore B-Tree.

## 2. Diagnóstico de Latência e Otimização de Interface
* **Incidente:** Gargalo de Latência Percebida (UX Friction)
  * **Sintoma:** O acoplamento relacional entre as tabelas apresentava um atraso perceptível de resposta, gerando degradação visual do sistema.
  * **Causa Raiz:** O uso do evento de clique combinado com a função de controle temporal `setTimeout` travava o estado visual da borda por 2000ms, não refletindo a agilidade do banco de dados real que opera em microssegundos.
  * **Solução:** Substituição completa do modelo de eventos. Removeu-se o clique e o `setTimeout`, adotando eventos nativos de varredura de ponteiro (`mouseenter` e `mouseleave`). A transição de estado foi movida para o hardware gráfico via CSS `transition: 0.15s ease-in-out`, alcançando instantaneidade visual.

## 3. Decisões Lógicas e Estrutura de Código
* **Idempotência de Renderização:** A função `popularTabelas()` limpa o contêiner interno via `.innerHTML = ''` antes de injetar os dados mapeados, prevenindo duplicação de registros em caso de múltiplos gatilhos.
* **Semântica de Chaves:** Chaves Estrangeiras (`FK_Curso`) foram destacadas na cor roxa corporativa com bordas rígidas à esquerda, mapeando o relacionamento direto com o cabeçalho dourado da Chave Primária (PK) correspondente.
* **Notificação Assíncrona Não-Bloqueante:** O método de alerta tradicional do navegador (`alert()`), que congela a thread principal de forma síncrona, foi descartado. Implementou-se uma função injetora de elementos `div` assíncronos que flutuam na tela e se destroem sozinhos após o tempo de leitura.

---

### Bloco 3: Unificação e Injeção Dinâmica de Metadados

#### Resumo Técnico
* **Status do Bloco 3:** CONCLUÍDO & HOMOLOGADO
* **Tecnologias Utilizadas:** Vanilla JavaScript, HTML5 Estrutural (Elemento `<aside>`), CSS Transitions.
* **Foco da Engenharia:** Manipulação do DOM (Document Object Model), mapeamento dinâmico de Dicionários de Dados e emulação de telemetria física (Index Scan).

## 1. Pipeline de Engenharia de Eventos
A integração unificou os dados lógicos e visuais em uma árvore de renderização atômica:

`[Árvore de Objetos DOM] ──► [Escopo de Escuta do Clique] ──► [Parsing de Metadados] ──► [Injeção na Sidebar]`

* **Unificação Arquitetural:** Fusão dos subsistemas de dados, styles e comportamento em um único artefato independente (`index.html`) para eliminar latência de I/O de rede local.
* **Captação de Eventos Assíncronos:** Configuração de escutas de eventos (`EventListeners`) ligadas aos IDs físicos dos blocos geométricos das tabelas.
* **Mapeamento do Dicionário de Dados:** O clique em um nó aciona o interpretador JS que lê a matriz de metadados correspondente e reestrutura as células da tabela lateral em milissegundos.

## 2. Decisões de Projeto e Infraestrutura
* **Substituição de Chamadas Bloqueantes:** O método síncrono `alert()` foi definitivamente banido para impedir o congelamento da thread principal de processamento do navegador. Foi implementado um resolvedor assíncrono de notificações que se autodestrói após a execução.
* **Transição Computacional Exata:** A animação da Sidebar foi vinculada à aceleração de hardware através de curvas bezier no CSS (`cubic-bezier(0.16, 1, 0.3, 1)`), granting uma taxa de atualização estável no navegador do macOS.

---

### Bloco 4: Segurança de Infraestrutura e Criptografia de Transporte

#### Resumo Técnico
* **Status do Bloco 4:** CONCLUÍDO & HOMOLOGADO
* **Camada Superior:** Segurança de Infraestrutura e Criptografia em Trânsito (TLS / HTTPS).
* **Mecanismos Utilizados:** OpenSSL (RSA 2048-bit), Módulo `ssl` do Kernel do Python 3, Telemetria Visual em CSS Grid.

## 1. Engenharia de Blindagem (O Fluxo de Criptografia)
A segurança foi implementada diretamente na camada de transporte da aplicação local, envelopando o tráfego de dados voláteis:

`[Navegador / Recrutador] ──(Canal TLS Criptografado)──► [Certificado Autoassinado RSA] ──► [Soquete Seguro Python]`

* **Geração de Credenciais Físicas:** Uso do ecossistema OpenSSL para criar o par de chaves assimétricas (`key.pem` e `cert.pem`), garantindo uma assinatura criptográfica estável para o domínio `localhost`.
* **Acoplamento TLS no Back-end:** O script `server.py` intercepta o soquete HTTP padrão do interpretador Python e injeta um contexto de segurança `ssl.PROTOCOL_TLS_SERVER`. Isso garante que nenhum dado trafegue em texto claro (evitando vulnerabilidades do tipo Man-in-the-Middle).
* **Telemetria de Front-End para Recrutadores:** Inclusão de um dashboard estático de segurança que documenta as etapas lógicas do Handshake TLS e expõe os algoritmos envolvidos (TLSv1.3 e RSA de 2048 bits).

## 2. Diagnóstico de Arquitetura e Validação Local
* **Comportamento das Autoridades Certificadoras (CA):** O aviso de segurança emitido pelo navegador (Safari/Chrome) ao acessar a porta 4443 é o comportamento esperado (POSIX/W3C Compliance) para certificados autoassinados. Ele valida que o algoritmo RSA está operando corretamente e forçando a criptografia local, mesmo sem uma validação de uma entidade certificadora global paga.
* **Consolidação do Portfólio:** Com a unificação feita no Bloco 3 e a blindagem do Bloco 4, o repositório entrega um entregável de alta qualidade: o recrutador visualiza a modelagem lógica (3FN), a mecânica de indexação física (B-Tree) e as diretrizes de segurança (HTTPS) em um único painel limpo e reativo.

---

### Ciclo de Engenharia Concluído
* **Bloco 1:** Modelagem 3FN e persistência no PostgreSQL.
* **Bloco 2:** Construção da interface geométrica reativa sem delays.
* **Bloco 3:** Injeção dinâmica de tuplas e a Sidebar do Dicionário de Dados.
* **Bloco 4:** Proteção da rede com HTTPS/TLS local via Python e OpenSSL.












