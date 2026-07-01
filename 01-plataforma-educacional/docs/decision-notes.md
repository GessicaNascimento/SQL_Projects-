### decision-notes.md

---

### Caderno de Arquitetura de Dados: Decisões e Trade-offs de Engenharia
Este artefato documenta as decisões de modelagem física, estratégias de indexação e restrições de integridade adotadas no ecossistema da Plataforma Educacional, justificando as escolhas de design com base na física do hardware e na cardinalidade das relações.

---

## 1. Estratégias de Indexação e Física do Hardware
A indexação não foi aplicada de maneira indiscriminada, mas sim calibrada de acordo com a cardinalidade (a proporção de valores únicos em uma coluna) e o comportamento esperado das buscas (*Access Patterns*).

### Chaves Primárias e Índices B-Tree Acoplados
Toda declaração de `PRIMARY KEY` (como `id_aluno`, `id_curso`, `id_departamento`) instrui o kernel do PostgreSQL a erguer automaticamente um índice baseado em árvore balanceada (*B-Tree Clustered Index*).
* **Mecânica de Baixo Nível:** Em vez de realizar um escopo linear $O(N)$ (*Sequential Scan*), que varre todas as páginas de 8KB salvas no SSD, a busca é reduzida para uma complexidade logarítmica $O(\log N)$.
* **Impacto no Hardware:** Para uma massa de dados de até 3.000 alunos, o motor alcança o nó folha da árvore em no máximo 3 ou 4 saltos de ponteiro de memória, poupando ciclos de clock da CPU.

### Índices Secundários Baseados em Cardinalidade Média/Alta
A criação manual do índice secundário foi isolada na tabela `cursos`:

**CREATE INDEX idx_cursos_nome ON cursos USING btree (nome_curso);** 


* **Justificativa de Cardinalidade:** O volume do escopo institucional prevê poucos registros fixos de cursos (escala de 10 a 50). Contudo, a coluna `nome_curso` possui alta taxa de seletividade (valores textuais únicos bem definidos).
* **O Trade-off de Escrita vs. Leitura:** Cada índice secundário criado exige que o PostgreSQL atualize a estrutura da árvore B-Tree a cada operação de `INSERT`, `UPDATE` ou `DELETE`, gerando um custo extra de I/O em disco. Optou-se por indexar `nome_curso` porque a tabela de cursos é quase estática (altíssima taxa de leitura via Front-end e baixíssima taxa de alteração), tornando o trade-off altamente favorável à performance da API.

---

## 2. Blindagem Perimetral e Integridade Referencial

### Restrição de Deleção com ON DELETE RESTRICT
Todas as chaves estrangeiras (`FOREIGN KEY`) foram acopladas com a diretiva `ON DELETE RESTRICT`.
* **Decisão Arquitetural:** Impede de forma absoluta que um registro pai (ex: um departamento) seja deletado do sistema enquanto houver registros filhos ativos (ex: cursos) apontando para ele.
* **Vantagem de Baixo Nível:** A validação ocorre diretamente no núcleo/kernel do banco. Se uma requisição destrutiva for disparada por uma falha de lógica no Back-end ou por uma injeção maliciosa, o motor intercepta o comando antes de alterar as páginas de metadados no disco, mitigando o risco de "registros órfãos".

### Segmentação de Tabelas e Normalização Lógica (3FN)
Durante o ciclo de modelagem, corrigiu-se a localização das métricas de desempenho. Elementos altamente voláteis e multivalorados (como `nota` e `frequencia`) foram extraídos da tabela core de alunos e movidos para uma tabela associativa/cruzamento (`grades_check`).
* **Mapeamento de Cardinalidade (N:M):** Um aluno pode cursar muitas disciplinas, e uma disciplina possui múltiplos alunos. Se as notas fossem gravadas na tabela do aluno, o disco sofreria com redundância maciça, duplicando dados fixos de texto (`nome`, `email`, `matricula`) a cada nova matéria matriculada, corrompendo a Terceira Forma Normal (3FN).

---

## 3. Matriz de Trade-offs das Decisões de Projeto

| Tecnologia / Diretiva | Vantagem Principal | Custo / Trade-off | Justificativa no Cenário |
| :--- | :--- | :--- | :--- |
| **VARCHAR(N) Dinâmico** | Economia drástica de espaço no SSD; aloca apenas o tamanho real da string + 1 byte de controle. | Pequeno *overhead* de processamento para calcular o tamanho dinâmico do campo. | Essencial para campos textuais variáveis como `nome_curso` e `email`. |
| **SERIAL (Contador Sequencial)** | Geração atômica e indivisível de IDs no kernel, eliminando queries manuais de `MAX(id)`. | Consumo de lacunas de numeração na memória caso uma transação sofra *rollback*. | Elimina condições de corrida (*Race Conditions*) quando múltiplos usuários cadastram dados simultaneamente. |
| **CHECK Constraints** | Última linha de defesa perimetral direto nas páginas físicas de dados. | Verificação matemática ativa a cada bloco de dados inserido. | Garante integridade absoluta das notas e frequências, impedindo corrupção por falhas na camada web. |

















