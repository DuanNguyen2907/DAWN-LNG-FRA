// Bài tập điền từ gắn với chủ điểm ngữ pháp — dùng lại bộ máy chia động từ đã
// kiểm chứng đúng (conjugation.js) nên luôn chấm chính xác. Câu mẫu cố tình
// không dùng mạo từ/tân ngữ có giống để tránh rủi ro ngữ pháp (vd. "de" thay
// "un/une" sau phủ định) — giữ mọi câu luôn đúng 100% với mọi động từ.
window.GrammarExercises = (function () {
  const TEMPLATES = {
    present: [
      (unit) => `Aujourd'hui, ${unit} beaucoup.`,
      (unit) => `En général, ${unit} souvent.`,
      (unit) => `Chaque jour, ${unit} ici.`,
    ],
    imparfait: [
      (unit) => `Avant, ${unit} tous les jours.`,
      (unit) => `Quand j'étais petit, ${unit} souvent.`,
      (unit) => `À cette époque, ${unit} beaucoup.`,
    ],
    futur: [
      (unit) => `Demain, ${unit} sans doute.`,
      (unit) => `Bientôt, ${unit} encore.`,
      (unit) => `L'année prochaine, ${unit} plus.`,
    ],
  };

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function verbsForLevel(level) {
    const all = window.CONJUGATION_VERBS.filter((v) => level === "all" || v.level === level);
    return all.length ? all : window.CONJUGATION_VERBS;
  }

  function generateTenseExercise(tenseKey, level) {
    const verb = randomFrom(verbsForLevel(level));
    const forms = window.ConjugationEngine.getForms(verb, tenseKey);
    if (!forms) return generateTenseExercise(tenseKey, level);
    const pronounIndex = Math.floor(Math.random() * window.ConjugationEngine.PRONOUNS.length);
    const pronoun = window.ConjugationEngine.PRONOUNS[pronounIndex];
    const correctForm = forms[pronounIndex];
    const template = randomFrom(TEMPLATES[tenseKey]);
    const blankUnit = `${pronoun.label} ___ (${verb.infinitive})`;
    const answerUnit = window.ConjugationEngine.formatWithPronoun(pronoun.key, correctForm);
    const sentence = template(blankUnit);
    const fullSentence = template(answerUnit);
    return { type: tenseKey, prompt: sentence, answer: correctForm, fullSentence, verb };
  }

  function generateNegationExercise(level) {
    const verb = randomFrom(verbsForLevel(level));
    const forms = window.ConjugationEngine.getForms(verb, "present");
    if (!forms) return generateNegationExercise(level);
    const pronounIndex = Math.floor(Math.random() * window.ConjugationEngine.PRONOUNS.length);
    const pronoun = window.ConjugationEngine.PRONOUNS[pronounIndex];
    const verbForm = forms[pronounIndex];
    const complement = randomFrom(["beaucoup", "souvent", "ici", "vraiment", "encore"]);
    const affirmative = `${window.ConjugationEngine.formatWithPronoun(pronoun.key, verbForm)} ${complement}.`;
    const neWord = /^[aeiouhéèêàâîïôùûAEIOUH]/.test(verbForm) ? "n'" : "ne ";
    const answer = `${neWord}${verbForm} pas`;
    const fullSentence = `${pronoun.label} ${neWord}${verbForm} pas ${complement}.`;
    return { type: "negation", prompt: `Chuyển sang câu phủ định: "${affirmative}"`, answer, fullSentence, verb };
  }

  function generate(exerciseType, level) {
    if (exerciseType === "negation") return generateNegationExercise(level);
    return generateTenseExercise(exerciseType, level);
  }

  function checkAnswer(userInput, exercise) {
    const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");
    return normalize(userInput) === normalize(exercise.answer);
  }

  return { generate, checkAnswer };
})();
