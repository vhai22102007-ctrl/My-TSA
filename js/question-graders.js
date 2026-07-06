/**
 * Common frontend graders for TSA static exams.
 * Each grader returns true/false; scoring is handled by the exam engine.
 */
(function (global) {
  "use strict";

  function normalizeText(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function normalizeKey(value) {
    return String(value == null ? "" : value).trim().toUpperCase();
  }

  function gradeSingleChoice(question, userAnswer) {
    if (userAnswer == null || question.correct_answer == null) return false;
    return normalizeKey(userAnswer) === normalizeKey(question.correct_answer);
  }

  function gradeMultipleChoice(question, userAnswer) {
    if (!Array.isArray(userAnswer) || !Array.isArray(question.correct_answer)) return false;
    var user = userAnswer.map(normalizeKey).filter(Boolean).sort();
    var correct = question.correct_answer.map(normalizeKey).filter(Boolean).sort();
    if (user.length !== correct.length) return false;
    return correct.every(function (key, index) { return key === user[index]; });
  }

  function gradeTrueFalse(question, userAnswer) {
    if (!userAnswer || typeof userAnswer !== "object" || Array.isArray(userAnswer)) return false;
    var correct = question.correct_answer || {};
    var keys = Object.keys(correct);
    if (!keys.length) return false;
    return keys.every(function (key) { return userAnswer[key] === correct[key]; });
  }

  function gradeFillBlank(question, userAnswer) {
    var answer = normalizeText(userAnswer);
    if (!answer) return false;

    var accepted = [];
    if (question.correct_answer != null) accepted.push(question.correct_answer);
    if (Array.isArray(question.accepted_answers)) {
      accepted = accepted.concat(question.accepted_answers);
    }

    return accepted.some(function (item) { return normalizeText(item) === answer; });
  }

  function gradeNumericAnswer(question, userAnswer) {
    if (userAnswer == null || userAnswer === "") return false;
    var user = Number(userAnswer);
    var correct = Number(question.correct_answer);
    if (!Number.isFinite(user) || !Number.isFinite(correct)) return false;
    var tolerance = Number(question.tolerance);
    if (!Number.isFinite(tolerance)) tolerance = 0;
    return Math.abs(user - correct) <= tolerance;
  }

  function gradeDragDrop(question, userAnswer) {
    if (!userAnswer || typeof userAnswer !== "object" || Array.isArray(userAnswer)) return false;
    var correct = question.correct_answer || {};
    var keys = Object.keys(correct);
    if (!keys.length) return false;
    return keys.every(function (key) { return userAnswer[key] === correct[key]; });
  }

  var QUESTION_GRADERS = {
    single_choice: gradeSingleChoice,
    single_choice_2: gradeSingleChoice,
    multiple_choice: gradeMultipleChoice,
    true_false: gradeTrueFalse,
    fill_blank: gradeFillBlank,
    numeric_answer: gradeNumericAnswer,
    drag_drop: gradeDragDrop
  };

  function gradeQuestion(question, userAnswer) {
    var type = (question && (question.question_type || question.type)) || "";
    var grader = QUESTION_GRADERS[type];
    return grader ? grader(question, userAnswer) : false;
  }

  global.QUESTION_GRADERS = QUESTION_GRADERS;
  global.gradeQuestion = gradeQuestion;
  global.gradeSingleChoice = gradeSingleChoice;
  global.gradeMultipleChoice = gradeMultipleChoice;
  global.gradeTrueFalse = gradeTrueFalse;
  global.gradeFillBlank = gradeFillBlank;
  global.gradeNumericAnswer = gradeNumericAnswer;
  global.gradeDragDrop = gradeDragDrop;
})(window);
