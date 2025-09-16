(function() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const noResultsEl = document.getElementById('noResults');
  const categoriesSection = document.getElementById('categories');
  const exportBtn = document.getElementById('exportBtn');
  let categoryEls = Array.from(document.querySelectorAll('.category'));

  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  function resetView() {
    noResultsEl.hidden = true;
    categoryEls.forEach(cat => {
      cat.hidden = false;
      // Don't force close - preserve the original open state from HTML
      const items = cat.querySelectorAll('.item');
      items.forEach(it => { it.hidden = false; });
    });
  }

  function applySearch(query) {
    const q = normalize(query);
    if (!q) { resetView(); return; }

    let anyShown = false;
    categoryEls.forEach(cat => {
      const title = cat.querySelector('.category-title');
      const catName = normalize(title ? title.textContent : '');
      const catMatches = catName.includes(q);

      let visibleCount = 0;
      const items = Array.from(cat.querySelectorAll('.item'));

      if (catMatches) {
        items.forEach(it => { it.hidden = false; visibleCount++; });
      } else {
        items.forEach(it => {
          const en = normalize(it.getAttribute('data-en'));
          const es = normalize(it.getAttribute('data-es'));
          const matches = en.includes(q) || es.includes(q);
          it.hidden = !matches;
          if (matches) visibleCount++;
        });
      }

      cat.hidden = visibleCount === 0;
      cat.open = !cat.hidden;
      if (visibleCount > 0) anyShown = true;
    });

    noResultsEl.hidden = anyShown;
  }

  // --- Smooth open/close animation for details ---
  const ANIM_MS = 200;
  function animateOpen(detailsEl) {
    const content = detailsEl.querySelector('.items');
    if (!content) { detailsEl.open = true; return; }
    detailsEl.open = true; // make it visible so we can measure
    content.style.height = '0px';
    content.style.overflow = 'hidden';
    content.style.transition = 'height ' + ANIM_MS + 'ms ease';
    // Force reflow
    void content.offsetHeight;
    content.style.height = content.scrollHeight + 'px';
    const onEnd = () => {
      content.style.transition = '';
      content.style.height = '';
      content.style.overflow = '';
      content.removeEventListener('transitionend', onEnd);
    };
    content.addEventListener('transitionend', onEnd);
  }
  function animateClose(detailsEl) {
    const content = detailsEl.querySelector('.items');
    if (!content) { detailsEl.open = false; return; }
    const start = content.scrollHeight;
    content.style.height = start + 'px';
    content.style.overflow = 'hidden';
    content.style.transition = 'height ' + ANIM_MS + 'ms ease';
    // Force reflow
    void content.offsetHeight;
    content.style.height = '0px';
    const onEnd = () => {
      detailsEl.open = false;
      content.style.transition = '';
      content.style.height = '';
      content.style.overflow = '';
      content.removeEventListener('transitionend', onEnd);
    };
    content.addEventListener('transitionend', onEnd);
  }
  function wireDetailsAnimation(detailsEl) {
    // Skip parent categories - let them use native behavior
    if (detailsEl.classList.contains('parent')) return;

    const summary = detailsEl.querySelector('summary');
    if (!summary) return;
    if (summary.__wiredAnim) return;
    summary.__wiredAnim = true;
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (!detailsEl.open) {
        animateOpen(detailsEl);
      } else {
        animateClose(detailsEl);
      }
    });
  }

  // --- Persistence (localStorage) ---
  const STORAGE_KEY = 'espanolExtra.v1';
  function loadExtra() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { categories: [] }; }
    catch { return { categories: [] }; }
  }
  function saveExtra(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function findCategoryElByTitle(title) {
    return Array.from(document.querySelectorAll('.category')).find(d => {
      const t = d.querySelector('.category-title');
      return t && t.textContent.trim() === title.trim();
    }) || null;
  }

  function createCategoryEl(title) {
    const details = document.createElement('details');
    details.className = 'category';

    const summary = document.createElement('summary');
    const span = document.createElement('span');
    span.className = 'category-title';
    span.textContent = title;
    summary.appendChild(span);

    const ul = document.createElement('ul');
    ul.className = 'items';

    details.appendChild(summary);
    details.appendChild(ul);
    categoriesSection.appendChild(details);
    wireDetailsAnimation(details);
    categoryEls = Array.from(document.querySelectorAll('.category'));
    return details;
  }

  function addItemLi(ulEl, en, es, catTitle) {
    const li = document.createElement('li');
    li.className = 'item';
    li.setAttribute('data-en', en);
    li.setAttribute('data-es', es);
    li.setAttribute('data-cat', catTitle);

    const enSpan = document.createElement('span');
    enSpan.className = 'en';
    enSpan.textContent = en;

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'arrow';
    arrowSpan.textContent = '›';

    const esSpan = document.createElement('span');
    esSpan.className = 'es';
    esSpan.textContent = es;

    li.appendChild(enSpan);
    li.appendChild(arrowSpan);
    li.appendChild(esSpan);
    ulEl.appendChild(li);
  }

  function addItemToCategory(catTitle, en, es, persist = true) {
    let catEl = findCategoryElByTitle(catTitle);
    if (!catEl) {
      catEl = createCategoryEl(catTitle);
    }
    const ul = catEl.querySelector('.items');
    addItemLi(ul, en, es, catTitle);

    if (persist) {
      const data = loadExtra();
      let rec = data.categories.find(c => c.title === catTitle);
      if (!rec) {
        rec = { title: catTitle, items: [] };
        data.categories.push(rec);
      }
      rec.items.push({ en, es });
      saveExtra(data);
    }
  }


  function renderExtras() {
    const data = loadExtra();
    data.categories.forEach(c => {
      let catEl = findCategoryElByTitle(c.title) || createCategoryEl(c.title);
      const ul = catEl.querySelector('.items');
      c.items.forEach(it => addItemLi(ul, it.en, it.es, c.title));
    });
  }

  // Wire animations for existing categories
  categoryEls.forEach(wireDetailsAnimation);

  // Load extras from storage
  renderExtras();


  // Export current document (original + added) as HTML copied to clipboard
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const doc = document.documentElement.cloneNode(true);
        // Serialize
        const html = '<!DOCTYPE html>' + '\n' + doc.outerHTML;
        await navigator.clipboard.writeText(html);
        alert('Exported HTML copied to clipboard. Paste it into an email.');
      } catch (err) {
        alert('Failed to copy. ' + err);
      }
    });
  }

  input.addEventListener('input', () => applySearch(input.value));
  clearBtn.addEventListener('click', () => { input.value = ''; resetView(); input.focus(); });

  // Preserve the open state from HTML - don't force close any details

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // Quiz functionality
  const quizModal = document.getElementById('quizModal');
  const startTestBtn = document.getElementById('startTestBtn');
  const closeBtn = document.querySelector('.close');
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const nextBtn = document.getElementById('nextBtn');
  const resultContainer = document.getElementById('resultContainer');
  const scoreText = document.getElementById('scoreText');
  const restartBtn = document.getElementById('restartBtn');

  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function generateQuestions() {
    questions = [];
    const isRegularPage = document.title.includes('Regular');

    if (isRegularPage) {
      // Collect all verb forms (without pronouns) for random options
      const allVerbForms = new Set();
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        const conjugations = table.querySelectorAll('.conjugation');
        conjugations.forEach(conj => {
          const text = conj.textContent.trim();
          const parts = text.split(' ');
          if (parts.length >= 2) {
            const verbForm = parts.slice(1).join(' '); // Remove pronoun
            allVerbForms.add(verbForm);
          }
        });
      });

      // Generate questions from verb tables
      tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        const categoryTitle = table.closest('.category').querySelector('.category-title').textContent;
        const verb = categoryTitle.split(' ')[0]; // e.g., HABLAR
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const tense = cells[0].textContent.trim();
            const conjugations = cells[1].querySelectorAll('.conjugation');
            conjugations.forEach((conj, index) => {
              const person = ['yo', 'vos', 'él/ella', 'nosotros', 'ustedes/ellos'][index] || 'unknown';
              const fullText = conj.textContent.trim();
              const parts = fullText.split(' ');
              const verbForm = parts.slice(1).join(' '); // Correct verb form without pronoun
              const options = [verbForm];
              while (options.length < 8) {
                const randomForm = Array.from(allVerbForms)[Math.floor(Math.random() * allVerbForms.size)];
                if (!options.includes(randomForm)) {
                  options.push(randomForm);
                }
              }
              const coloredQuestion = `What is the conjugation of <span style="color: var(--accent); font-weight: bold;">${verb}</span> for <span style="color: var(--accent); font-weight: bold;">${person}</span> in <span style="color: var(--accent); font-weight: bold;">${tense.toLowerCase()}</span>?`;
              questions.push({
                question: coloredQuestion,
                correct: verbForm,
                options: shuffleArray(options)
              });
            });
          }
        });
      });
    } else {
      // For week1.html, generate balanced questions: 4 conjugations, 3 survival phrases, 3 vocabulary
      if (document.title.includes('Week 1')) {
        const conjugationQuestions = [];
        const survivalQuestions = [];
        const vocabularyQuestions = [];
        const powerVerbQuestions = [];

        // Generate conjugation questions from verb tables
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
          const rows = table.querySelectorAll('tbody tr');
          const categoryTitle = table.closest('.category').querySelector('.category-title').textContent;
          const verb = categoryTitle.split(' ')[1] || categoryTitle.split(' ')[0]; // e.g., SER, ESTAR
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const tense = cells[0].textContent.trim();
              if (tense !== 'Infinitive' && tense !== 'Gerund' && tense !== 'Participle') {
                // Use the new structure with .conjugation spans
                const conjugations = cells[1].querySelectorAll('.conjugation');
                conjugations.forEach((conj, index) => {
                  const fullText = conj.textContent.trim();
                  const parts = fullText.split(' ');
                  if (parts.length >= 2) {
                    const person = parts[0]; // yo, vos, él/ella, etc.
                    const verbForm = parts.slice(1).join(' '); // The actual conjugation
                    const options = [verbForm];
                    // Add some common wrong options
                    const commonWrong = ['hablo', 'comes', 'vamos', 'son', 'eres', 'tiene', 'hacen', 'digo'];
                    while (options.length < 8) {
                      const randomForm = commonWrong[Math.floor(Math.random() * commonWrong.length)];
                      if (!options.includes(randomForm)) {
                        options.push(randomForm);
                      }
                    }
                    const coloredQuestion = `What is the conjugation of <span style="color: var(--accent); font-weight: bold;">${verb}</span> for <span style="color: var(--accent); font-weight: bold;">${person}</span> in <span style="color: var(--accent); font-weight: bold;">${tense.toLowerCase()}</span>?`;
                    conjugationQuestions.push({
                      question: coloredQuestion,
                      correct: verbForm,
                      options: shuffleArray(options)
                    });
                  }
                });
              }
            }
          });
        });
        // Generate vocabulary questions, separating survival phrases from other vocabulary
        const allItems = document.querySelectorAll('.item');
        const allEs = [];

        allItems.forEach(item => {
          let en, es;

          // Check if item has data attributes (vocabulary section)
          if (item.hasAttribute('data-en') && item.hasAttribute('data-es')) {
            en = item.getAttribute('data-en');
            es = item.getAttribute('data-es');
          } else {
            // Parse from span content (survival phrases section)
            const enSpan = item.querySelector('.en');
            const esSpan = item.querySelector('.es');
            if (enSpan && esSpan) {
              en = enSpan.textContent.trim();
              es = esSpan.textContent.trim();
            }
          }

          if (en && es) {
            allEs.push(es);
          }
        });

        allItems.forEach(item => {
          let en, es;

          // Check if item has data attributes (vocabulary section)
          if (item.hasAttribute('data-en') && item.hasAttribute('data-es')) {
            en = item.getAttribute('data-en');
            es = item.getAttribute('data-es');
          } else {
            // Parse from span content (survival phrases section)
            const enSpan = item.querySelector('.en');
            const esSpan = item.querySelector('.es');
            if (enSpan && esSpan) {
              en = enSpan.textContent.trim();
              es = esSpan.textContent.trim();
            }
          }

          if (en && es) {
            // Find the main category title (not subcategory)
            let categoryEl = item.closest('.category');
            let categoryTitle = categoryEl.querySelector('.category-title').textContent;

            // If this is a subcategory (has parent category), get the parent title
            const parentCategory = categoryEl.parentElement?.closest('.category');
            if (parentCategory) {
              categoryTitle = parentCategory.querySelector('.category-title').textContent;
            }

            const options = [es];
            while (options.length < 8) {
              const randomEs = allEs[Math.floor(Math.random() * allEs.length)];
              if (!options.includes(randomEs)) {
                options.push(randomEs);
              }
            }
            const coloredQuestion = `What is the Spanish for <span style="color: var(--accent); font-weight: bold;">"${en}"</span>?`;
            const questionObj = {
              question: coloredQuestion,
              correct: es,
              options: shuffleArray(options)
            };

            // Check if this is a power verb from the vocabulary section
            const subcategoryEl = item.closest('.category');
            const subcategoryTitle = subcategoryEl.querySelector('.category-title')?.textContent || '';

            const powerVerbs = ['ser', 'estar', 'tener', 'ir', 'hacer', 'querer', 'gustar', 'hablar', 'comer', 'beber', 'vivir', 'venir', 'llamar', 'to be', 'to have', 'to go', 'to do', 'to want', 'to like', 'to speak', 'to eat', 'to drink', 'to live', 'to come', 'to call'];

            if (categoryTitle.includes('Survival')) {
              survivalQuestions.push(questionObj);
            } else if (subcategoryTitle.includes('Common Verbs') || subcategoryTitle.includes('Verbs') || powerVerbs.some(verb => en.toLowerCase().includes(verb.toLowerCase()) || es.toLowerCase().includes(verb.toLowerCase()))) {
              powerVerbQuestions.push(questionObj);
            } else if (!categoryTitle.includes('Week 1 Power verbs')) {
              vocabularyQuestions.push(questionObj);
            }
          }
        });

        // Select questions: 3 conjugations, 2 survival, 2 vocabulary, 3 power verbs
        const selectedConjugations = shuffleArray(conjugationQuestions).slice(0, Math.min(3, conjugationQuestions.length));
        const selectedSurvival = shuffleArray(survivalQuestions).slice(0, Math.min(2, survivalQuestions.length));
        const selectedVocabulary = shuffleArray(vocabularyQuestions).slice(0, Math.min(2, vocabularyQuestions.length));
        const selectedPowerVerbs = shuffleArray(powerVerbQuestions).slice(0, Math.min(3, powerVerbQuestions.length));

        questions = shuffleArray([...selectedConjugations, ...selectedSurvival, ...selectedVocabulary, ...selectedPowerVerbs]);

        // If we don't have 10 questions, fill with more from available categories
        while (questions.length < 10) {
          if (selectedPowerVerbs.length < powerVerbQuestions.length) {
            const remaining = powerVerbQuestions.filter(q => !selectedPowerVerbs.includes(q));
            if (remaining.length > 0) {
              questions.push(remaining[0]);
              selectedPowerVerbs.push(remaining[0]);
            }
          }
          if (questions.length >= 10) break;

          if (selectedConjugations.length < conjugationQuestions.length) {
            const remaining = conjugationQuestions.filter(q => !selectedConjugations.includes(q));
            if (remaining.length > 0) {
              questions.push(remaining[0]);
              selectedConjugations.push(remaining[0]);
            }
          }
          if (questions.length >= 10) break;

          if (selectedVocabulary.length < vocabularyQuestions.length) {
            const remaining = vocabularyQuestions.filter(q => !selectedVocabulary.includes(q));
            if (remaining.length > 0) {
              questions.push(remaining[0]);
              selectedVocabulary.push(remaining[0]);
            }
          }
          if (questions.length >= 10) break;

          if (selectedSurvival.length < survivalQuestions.length) {
            const remaining = survivalQuestions.filter(q => !selectedSurvival.includes(q));
            if (remaining.length > 0) {
              questions.push(remaining[0]);
              selectedSurvival.push(remaining[0]);
            }
          }
          if (questions.length >= 10) break;
        }

        // Final shuffle to randomize order
        questions = shuffleArray(questions);

      } else {
        // For index.html, generate questions from vocabulary items
        const items = document.querySelectorAll('.item[data-en]');
        const allEs = Array.from(items).map(item => item.getAttribute('data-es'));
        items.forEach(item => {
          const en = item.getAttribute('data-en');
          const correctEs = item.getAttribute('data-es');
          const options = [correctEs];
          while (options.length < 8) {
            const randomEs = allEs[Math.floor(Math.random() * allEs.length)];
            if (!options.includes(randomEs)) {
              options.push(randomEs);
            }
          }
          const coloredQuestion = `What is the Spanish for <span style="color: var(--accent); font-weight: bold;">"${en}"</span>?`;
          questions.push({
            question: coloredQuestion,
            correct: correctEs,
            options: shuffleArray(options)
          });
        });
      }
    }

    // Shuffle and take 10 questions
    questions = shuffleArray(questions).slice(0, 10);
  }

  function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
      showResult();
      return;
    }

    const q = questions[currentQuestionIndex];
    questionText.innerHTML = q.question;
    optionsContainer.innerHTML = '';

    q.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = option;
      btn.addEventListener('click', () => checkAnswer(option, btn));
      optionsContainer.appendChild(btn);
    });

    nextBtn.style.display = 'none';
  }

  function checkAnswer(selected, btn) {
    const correct = questions[currentQuestionIndex].correct;
    const buttons = optionsContainer.querySelectorAll('.option-btn');

    buttons.forEach(b => {
      b.disabled = true;
      if (b.textContent === correct) {
        b.classList.add('correct');
      } else if (b === btn && selected !== correct) {
        b.classList.add('incorrect');
      }
    });

    if (selected === correct) {
      score++;
    } else {
      // Show explanation for wrong answer (only for vocabulary/phrases, not conjugations)
      const isRegularPage = document.title.includes('Regular');
      if (!isRegularPage) {
        const explanation = getExplanationForWrongAnswer(selected);
        if (explanation) {
          const explanationEl = document.createElement('p');
          explanationEl.textContent = explanation;
          explanationEl.style.marginTop = '10px';
          explanationEl.style.fontSize = '14px';
          explanationEl.style.color = '#ff6b6b';
          optionsContainer.appendChild(explanationEl);
        }
      }
    }

    nextBtn.style.display = 'block';
  }

  function getExplanationForWrongAnswer(wrongAnswer) {
    const isRegularPage = document.title.includes('Regular');
    if (isRegularPage) {
      // For conjugations, find what person/tense this form would be for
      const tables = document.querySelectorAll('table');
      for (const table of tables) {
        const conjugations = table.querySelectorAll('.conjugation');
        for (const conj of conjugations) {
          const text = conj.textContent.trim();
          const parts = text.split(' ');
          if (parts.length >= 2) {
            const verbForm = parts.slice(1).join(' ');
            if (verbForm === wrongAnswer) {
              const index = Array.from(conjugations).indexOf(conj);
              const person = ['yo', 'vos', 'él/ella', 'nosotros', 'ustedes/ellos'][index] || 'unknown';
              const rows = table.querySelectorAll('tbody tr');
              let tense = 'unknown';
              for (const row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                  const conjInRow = cells[1].querySelectorAll('.conjugation')[index];
                  if (conjInRow && conjInRow.textContent.trim() === text) {
                    tense = cells[0].textContent.trim().toLowerCase();
                    break;
                  }
                }
              }
              return `"${wrongAnswer}" would be the conjugation for ${person} in ${tense}.`;
            }
          }
        }
      }
    } else {
      // For vocabulary, find the English meaning of the wrong Spanish word
      const items = document.querySelectorAll('.item[data-es]');
      for (const item of items) {
        if (item.getAttribute('data-es') === wrongAnswer) {
          const en = item.getAttribute('data-en');
          return `"${wrongAnswer}" means "${en}".`;
        }
      }
    }
    return null;
  }

  function showResult() {
    document.getElementById('questionContainer').style.display = 'none';
    resultContainer.style.display = 'block';
    scoreText.textContent = `${score} / ${questions.length}`;

    const messages = [
      "0/10 Noooooo Elise! You are the worst!",
      "1/10 Better than nothing. Still laaaaaaaame.",
      "2/10 Shaaaaaameeeeeeee",
      "3/10 I want biscuits! Fatso",
      "4/10 Still disgusting",
      "5/10 Half mediocre",
      "6/10 Keep it up, long way to go",
      "7/10 Ok, decent",
      "8/10 You looking good. Sexy.",
      "9/10 Almost as good as me",
      "10/10 You are the best. I <3 U"
    ];

    const messageEl = document.createElement('p');
    messageEl.textContent = messages[score] || "Well done!";
    messageEl.style.marginTop = '20px';
    messageEl.style.fontSize = '18px';
    messageEl.style.fontWeight = 'bold';
    messageEl.style.color = 'var(--accent)';

    // Remove previous message if exists
    const existingMessage = resultContainer.querySelector('p');
    if (existingMessage) {
      resultContainer.removeChild(existingMessage);
    }

    resultContainer.appendChild(messageEl);
  }

  function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('questionContainer').style.display = 'block';
    resultContainer.style.display = 'none';
    generateQuestions();
    if (questions.length === 0) {
      questionText.innerHTML = 'No questions available. Please check the page content.';
      optionsContainer.innerHTML = '';
      nextBtn.style.display = 'none';
    } else {
      showQuestion();
    }
  }

  if (startTestBtn) {
    startTestBtn.addEventListener('click', () => {
      quizModal.style.display = 'block';
      resetQuiz();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      quizModal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === quizModal) {
      quizModal.style.display = 'none';
    }
  });

  nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
  });

  restartBtn.addEventListener('click', resetQuiz);
})();
