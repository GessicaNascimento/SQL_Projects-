### dev-engineering-resolutions-report.md

---

### Relatório de Resolução de Erros, Tratamento de Exceções e Latência
* **Abordagem:** System-Thinking & Engenharia de Confiabilidade (*Site Reliability Engineering* - SRE)

Este relatório mapeia os incidentes críticos interceptados durante a integração dos quatro blocos do projeto, detalhando os diagnósticos lógicos e as resoluções sistêmicas aplicadas.

---

## 1. Linha do Tempo e Pipeline de Resolução de Incidentes
O diagrama abaixo ilustra o fluxo de depuração e as zonas de interferência técnica tratadas no ecossistema:

`[Falha de Escopo CLI] ──► [Bug Lógico: Aninhamento DDL] ──► [Conexão JDBC Rejeitada] ──► [Gargalo de Latência no DOM]`

---

## 2. Diagnóstico Detalhado de Falhas de Infraestrutura (Banco de Dados)

### Incidente 01: Inversão de Escopo no Terminal do Host
* **Sintoma:** O prompt do shell do macOS/Linux travou com o caractere especial `plataforma_educacional-#`, ignorando comandos nativos do sistema operacional (como `cd ..` ou chamadas externas do `psql`).
* **Análise de Causa Raiz:** Quebra de contexto operacional. O operador executou instruções exclusivas do terminal do sistema de arquivos enquanto estava conectado à sessão interativa e síncrona do PostgreSQL. O interpretador léxico do banco de dados acumulou as strings na memória RAM temporária (Buffer de Transação), aguardando o caractere delimitador ponto e vírgula (`;`) para processar o bloco como uma query SQL inválida.
* **Resolução Sistêmica:** Injeção do sinal de interrupção forçada (`Ctrl + C`) a nível de sistema operacional para purgar o buffer de transação corrompido, seguido pelo comando nativo `\q` (quit) para devolver o controle ao terminal do host.

### Incidente 02: Corrupção do Interpretador Léxico por Duplicação Sintática
* **Sintoma:** O interpretador do arquivo `estrutura_banco.sql` abortou em lote exibindo: `psql:estrutura_banco.sql:50: ERROR: syntax error at or near "CREATE"`.
* **Análise de Causa Raiz:** Falha de aninhamento no script DDL. Uma instrução declarativa de tabela foi aberta (`CREATE TABLE departamentos (`) e, antes do fechamento dos parênteses de escopo e do terminador `;`, uma nova linha idêntica foi colada no arquivo. O parser do PostgreSQL entrou em colapso de estado ao tentar instanciar uma tabela dentro do escopo de definição de outra. Adicionalmente, detectou-se ausência de espaçamento léxico em tokens de tipo (ex: `nome_departamentoVARCHAR`), impossibilitando a compilação do dicionário de dados.
* **Resolução Sistêmica:** Refatoração estrutural do código fonte. Limpeza completa dos blocos redundantes de abertura e separação estrita entre o identificador do atributo e a palavra-chave de alocação de memória dinâmica (`VARCHAR(40)`).

### Incidente 03: Falha de Ponteiro de Metadados no Driver JDBC
* **Sintoma:** O software cliente visual (DBeaver) reportou rejeição de handshake de conexão: `FATAL: database "educacional_pltaform" does not exist`.
* **Análise de Causa Raiz:** Divergência de ponteiro de string. O utilitário tentou inicializar a conexão apontando para o nome do diretório físico do projeto local, enquanto o catálogo interno de metadados do PostgreSQL exigia o nome lógico exato gravado no servidor no momento do `CREATE DATABASE` (`plataforma_educacional`).
* **Resolução Sistêmica:** Ajuste manual das propriedades de conexão no DBeaver, corrigindo a string de destino no driver JDBC para espelhar cirurgicamente o dicionário de dados do banco.

### Incidente 04: Estado de Bloqueio por Falta de Idempotência
* **Sintoma:** Ao reexecutar o script de correção de bugs, o banco travou o pipeline emitindo: `ERROR: relation "grades_check" already exists`.
* **Análise de Causa Raiz:** Falha de sanitização do ambiente de teste. Como a tabela já havia sido persistida com sucesso em disco na tentativa anterior, o interpretador barrou a nova tentativa de criação para evitar a destruição inadvertida dos metadados salvos.
* **Resolução Sistêmica:** Implementação de travas de idempotência no topo do script de migration. O acoplamento de diretivas condicionais estruturadas na ordem inversa de suas dependências relacionais limpa o ambiente de testes de forma segura:


**DROP TABLE IF EXISTS grades_check;**
**DROP TABLE IF EXISTS curso_disciplina;**
**DROP TABLE IF EXISTS cursos;**
**DROP TABLE IF EXISTS departamentos;**

## 3. Otimização de Latência e Interface Humano-Computador (Front-End)

### Incidente 05: Gargalo de Latência Percebida e Travamento de Thread (UX Friction)
* **Sintoma:** A interface do painel acadêmico apresentava atrasos artificiais na transição e iluminação de chaves lógicas correlatas, degradando a experiência do usuário.
* **Análise de Causa Raiz:** Modelagem ineficiente de eventos e bloqueio síncrono da thread principal. O front-end acoplava o gatilho físico de clique a uma função de controle temporal baseada em `setTimeout` travando o estado da borda por 2000ms. Sabendo que o motor do banco opera buscas na faixa de microssegundos, o atraso de dois segundos gerava um descasamento de performance irreal. Além disso, o uso de `alert()` síncronos interrompia completamente o fluxo de execução do navegador.
* **Resolução Sistêmica:**
  1. **Eventos de Baixo Impacto:** Migração completa do modelo de captura para eventos de varredura ativa de ponteiro através das escutas de `mouseenter` e `mouseleave`.
  2. **Aceleração Gráfica por Hardware:** A manipulação de estados visuais foi delegada à GPU do host por meio de propriedades CSS estruturadas (`transition: 0.15s ease-in-out`), reduzindo o tempo de resposta à escala de instantaneidade visual perceptiva.
  3. **Idempotência no DOM:** Injeção da trava `.innerHTML = ''` na função `popularTabelas()`, limpando o contêiner na memória RAM do navegador antes de cada ciclo de renderização para impedir vazamentos de memória e duplicação de componentes na tela.














