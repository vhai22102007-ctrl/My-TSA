(function () {
  "use strict";

  var PRIVATE_QUESTION_FIELDS = new Set([
    "correct_answer",
    "accepted_answers",
    "explanation",
    "solution",
    "solution_details"
  ]);

  function removePrivateFields(value) {
    if (Array.isArray(value)) {
      value.forEach(removePrivateFields);
      return value;
    }
    if (!value || typeof value !== "object") return value;

    Object.keys(value).forEach(function (key) {
      if (PRIVATE_QUESTION_FIELDS.has(key)) delete value[key];
      else removePrivateFields(value[key]);
    });
    return value;
  }

  function createPublicExamCopy(exam) {
    if (!exam || typeof exam !== "object") throw new Error("Dữ liệu đề thi không hợp lệ.");
    return removePrivateFields(JSON.parse(JSON.stringify(exam)));
  }

  function containsPrivateAnswers(exam) {
    var found = false;
    (function inspect(value) {
      if (found || !value || typeof value !== "object") return;
      if (Array.isArray(value)) return value.forEach(inspect);
      Object.keys(value).forEach(function (key) {
        if (PRIVATE_QUESTION_FIELDS.has(key)) found = true;
        else inspect(value[key]);
      });
    })(exam);
    return found;
  }

  window.TMAExamSecurity = {
    createPublicExamCopy: createPublicExamCopy,
    containsPrivateAnswers: containsPrivateAnswers
  };
})();
