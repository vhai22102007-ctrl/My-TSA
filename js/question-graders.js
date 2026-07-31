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
    var correct = question.correct_answer;
    if (typeof correct === "string") {
      try { correct = JSON.parse(correct); } catch (e) {}
    }
    return normalizeKey(userAnswer) === normalizeKey(correct);
  }

  function gradeMultipleChoice(question, userAnswer) {
    var correct = question.correct_answer;
    if (typeof correct === "string") {
      try {
        if (correct.trim().startsWith("[")) {
          correct = JSON.parse(correct);
        } else {
          correct = correct.split(",").map(function(s) { return s.trim(); });
        }
      } catch (e) {
        correct = correct.split(",").map(function(s) { return s.trim(); });
      }
    }
    if (typeof userAnswer === "string") {
      try {
        if (userAnswer.trim().startsWith("[")) {
          userAnswer = JSON.parse(userAnswer);
        } else {
          userAnswer = userAnswer.split(",").map(function(s) { return s.trim(); });
        }
      } catch (e) {
        userAnswer = userAnswer.split(",").map(function(s) { return s.trim(); });
      }
    }

    if (!Array.isArray(userAnswer) || !Array.isArray(correct)) return false;
    var user = userAnswer.map(normalizeKey).filter(Boolean).sort();
    var corr = correct.map(normalizeKey).filter(Boolean).sort();
    if (user.length !== corr.length) return false;
    return corr.every(function (key, index) { return key === user[index]; });
  }

  function gradeTrueFalse(question, userAnswer) {
    var correct = question.correct_answer;
    if (typeof correct === "string") {
      try { correct = JSON.parse(correct); } catch (e) { correct = {}; }
    }
    correct = correct || {};

    if (typeof userAnswer === "string") {
      try { userAnswer = JSON.parse(userAnswer); } catch (e) { userAnswer = {}; }
    }
    if (!userAnswer || typeof userAnswer !== "object" || Array.isArray(userAnswer)) return false;

    var keys = Object.keys(correct);
    if (!keys.length) return false;

    return keys.every(function (key) {
      var normKey = key.toLowerCase();
      var userKey = Object.keys(userAnswer).find(function(k) { return k.toLowerCase() === normKey; }) || normKey;
      var userVal = userAnswer[userKey];
      var correctVal = correct[key];
      var userBool = (userVal === true || userVal === 'true' || userVal === 1 || userVal === '1' || String(userVal).toLowerCase() === 'đúng');
      var correctBool = (correctVal === true || correctVal === 'true' || correctVal === 1 || correctVal === '1' || String(correctVal).toLowerCase() === 'đúng');
      return userBool === correctBool;
    });
  }

  function gradeFillBlank(question, userAnswer) {
    if (typeof userAnswer === "string") {
      try { userAnswer = JSON.parse(userAnswer); } catch (e) {}
    }

    if (userAnswer && typeof userAnswer === "object" && !Array.isArray(userAnswer)) {
      var correct = {};
      var corrAns = question.correct_answer;
      if (typeof corrAns === "string") {
        try { corrAns = JSON.parse(corrAns); } catch (e) {}
      }
      if (corrAns && typeof corrAns === "object") {
        correct = corrAns;
      } else if (typeof corrAns === "string") {
        corrAns.split("|").forEach(function (pair) {
          var parts = pair.split("=");
          if (parts.length === 2) {
            correct[parts[0].trim()] = parts[1].trim();
          }
        });
      }
      var keys = Object.keys(correct);
      if (!keys.length) return false;
      return keys.every(function (key) {
        var userKey = Object.keys(userAnswer).find(function(k) { return k.toLowerCase() === key.toLowerCase(); }) || key;
        return normalizeText(userAnswer[userKey]) === normalizeText(correct[key]);
      });
    }

    var answer = normalizeText(userAnswer);
    if (!answer) return false;

    var accepted = [];
    var corrAnsSingle = question.correct_answer;
    if (typeof corrAnsSingle === "string") {
      try { corrAnsSingle = JSON.parse(corrAnsSingle); } catch (e) {}
    }
    if (corrAnsSingle != null) accepted.push(corrAnsSingle);
    if (Array.isArray(question.accepted_answers)) {
      accepted = accepted.concat(question.accepted_answers);
    }

    return accepted.some(function (item) { return normalizeText(item) === answer; });
  }

  function gradeNumericAnswer(question, userAnswer) {
    if (userAnswer == null || userAnswer === "") return false;
    var correct = question.correct_answer;
    if (typeof correct === "string") {
      try { correct = JSON.parse(correct); } catch (e) {}
    }
    var user = Number(userAnswer);
    var corr = Number(correct);
    if (!Number.isFinite(user) || !Number.isFinite(corr)) return false;
    var tolerance = Number(question.tolerance);
    if (!Number.isFinite(tolerance)) tolerance = 0;
    return Math.abs(user - corr) <= tolerance;
  }

  function gradeDragDrop(question, userAnswer) {
    var correct = question.correct_answer;
    if (typeof correct === "string") {
      try {
        if (correct.trim().startsWith("{")) {
          correct = JSON.parse(correct);
        } else {
          var parsed = {};
          correct.split("|").forEach(function (pair) {
            var parts = pair.split("=");
            if (parts.length === 2) {
              parsed[parts[0].trim()] = parts[1].trim();
            }
          });
          correct = parsed;
        }
      } catch (e) {
        correct = {};
      }
    }
    if (typeof correct === "string") {
      var parsed = {};
      correct.split("|").forEach(function (pair) {
        var parts = pair.split("=");
        if (parts.length === 2) {
          parsed[parts[0].trim()] = parts[1].trim();
        }
      });
      correct = parsed;
    }
    correct = correct || {};

    if (typeof userAnswer === "string") {
      try { userAnswer = JSON.parse(userAnswer); } catch (e) { userAnswer = {}; }
    }
    if (!userAnswer || typeof userAnswer !== "object" || Array.isArray(userAnswer)) return false;

    var keys = Object.keys(correct);
    if (!keys.length) return false;

    var items = Array.isArray(question.items) ? question.items : [];

    return keys.every(function (key) {
      var normKey = key.toLowerCase();
      var userKey = Object.keys(userAnswer).find(function(k) { return k.toLowerCase() === normKey; }) || normKey;
      var userVal = userAnswer[userKey];
      var corrVal = correct[key];
      if (userVal === undefined || corrVal === undefined) return false;

      var normUser = normalizeText(userVal);
      var normCorr = normalizeText(corrVal);

      // Direct ID or text match
      if (normUser === normCorr) return true;

      // Find item by ID to check its text/value
      var userItem = items.find(function(it) { return normalizeText(it.id) === normUser; });
      if (userItem) {
        var itemText = normalizeText(userItem.text);
        if (itemText === normCorr) return true;
        if ("val_" + itemText === normCorr) return true;
      }

      // Find item by text if userAnswer saved the text instead of ID
      var userItemByText = items.find(function(it) { return normalizeText(it.text) === normUser; });
      if (userItemByText) {
        var itemId = normalizeText(userItemByText.id);
        if (itemId === normCorr) return true;
        if ("val_" + normUser === normCorr) return true;
      }

      // Find item by ID in correct answer if correct answer saved the ID and userAnswer saved text
      var corrItem = items.find(function(it) { return normalizeText(it.id) === normCorr; });
      if (corrItem) {
        var corrItemText = normalizeText(corrItem.text);
        if (normUser === corrItemText) return true;
        if (normUser === "val_" + corrItemText) return true;
      }

      return false;
    });
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
