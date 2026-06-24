/**
 * Common question renderers for the static TSA exam system.
 * Supports:
 * single_choice, multiple_choice, true_false, fill_blank, numeric_answer, drag_drop.
 */
(function (global) {
  "use strict";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function getType(question) {
    return (question && (question.question_type || question.type)) || "single_choice";
  }

  function getQuestionId(question) {
    return String((question && (question.question_no || question.id)) || Math.random().toString(36).slice(2));
  }

  function clear(node) {
    if (node) node.innerHTML = "";
  }

  function createImage(url, altText) {
    var holder = document.createElement("div");
    holder.className = "question-image-wrap";

    var img = document.createElement("img");
    img.src = url;
    img.alt = altText || "Ảnh câu hỏi";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;

    img.addEventListener("error", function () {
      img.remove();
      var error = document.createElement("div");
      error.className = "image-error";
      error.textContent = "Không tìm thấy ảnh";
      holder.appendChild(error);
    }, { once: true });

    holder.appendChild(img);
    return holder;
  }

  function renderQuestionText(question, bodyEl) {
    if (!bodyEl) return;
    clear(bodyEl);

    var lead = document.createElement("div");
    lead.className = "question-lead";
    
    var rawText = (question && (question.question || question.prompt)) || "";
    
    // Auto bold instruction headers/titles
    var phrasesToBold = [
      "\\(Chọn nhiều đáp án\\)",
      "Chọn nhiều đáp án",
      "Kéo thả từ/ cụm từ phù hợp vào chỗ trống:",
      "Kéo thả từ/cụm từ phù hợp vào chỗ trống:",
      "Điền số nguyên thích hợp vào chỗ trống:",
      "Điền số thích hợp vào chỗ trống:",
      "Xét tính đúng/sai của các mệnh đề sau:",
      "Xét tính đúng sai của các mệnh đề sau:",
      "Xác định tính đúng sai của các nhận định dưới đây dựa vào văn bản.",
      "Chọn cụm từ phù hợp vào các chỗ trống để hoàn thiện câu tóm tắt.",
      "Xét tính đúng sai của các phát biểu sau về thuyết tiến hóa của Darwin.",
      "Chọn cụm từ phù hợp vào các chỗ trống để hoàn thiện nhận định khoa học."
    ];

    phrasesToBold.forEach(function (phrase) {
      var regex = new RegExp("(" + phrase + ")", "gi");
      rawText = rawText.replace(regex, "<strong>$1</strong>");
    });

    lead.innerHTML = rawText;
    bodyEl.appendChild(lead);

    if (question && question.image_url) {
      bodyEl.appendChild(createImage(question.image_url, "Ảnh câu hỏi " + (question.question_no || "")));
    }
  }

  function notify(onAnswerChange, value) {
    if (typeof onAnswerChange === "function") onAnswerChange(value);
  }

  function renderSingleChoice(question, savedAnswer, onAnswerChange, container) {
    if (!container) return;
    var wrap = document.createElement("div");
    wrap.className = "choices-container is-single-choice";

    ensureArray(question.options).forEach(function (opt) {
      var key = opt.key || "";
      var label = document.createElement("label");
      label.className = "choice-item";
      if (String(savedAnswer || "") === String(key)) label.classList.add("is-selected");

      var input = document.createElement("input");
      input.type = "radio";
      input.name = "single_" + getQuestionId(question);
      input.value = key;
      input.checked = String(savedAnswer || "") === String(key);
      input.className = "choice-input";

      var text = document.createElement("span");
      text.className = "choice-text";
      text.innerHTML = opt.text || ""; // Removed A., B., C., D. prefix

      input.addEventListener("change", function () {
        wrap.querySelectorAll(".choice-item").forEach(function (item) { item.classList.remove("is-selected"); });
        label.classList.add("is-selected");
        notify(onAnswerChange, key);
      });

      label.append(input, text);
      wrap.appendChild(label);
    });

    container.appendChild(wrap);
  }

  function renderMultipleChoice(question, savedAnswer, onAnswerChange, container) {
    if (!container) return;
    var current = new Set(Array.isArray(savedAnswer) ? savedAnswer.map(String) : []);
    var wrap = document.createElement("div");
    wrap.className = "choices-container is-multiple-choice";

    ensureArray(question.options).forEach(function (opt) {
      var key = opt.key || "";
      var label = document.createElement("label");
      label.className = "choice-item";
      if (current.has(String(key))) label.classList.add("is-selected");

      var input = document.createElement("input");
      input.type = "checkbox";
      input.name = "multiple_" + getQuestionId(question) + "_" + key;
      input.value = key;
      input.checked = current.has(String(key));
      input.className = "choice-input";

      var text = document.createElement("span");
      text.className = "choice-text";
      text.innerHTML = opt.text || ""; // Removed A., B., C., D. prefix

      input.addEventListener("change", function () {
        if (input.checked) {
          current.add(String(key));
          label.classList.add("is-selected");
        } else {
          current.delete(String(key));
          label.classList.remove("is-selected");
        }
        notify(onAnswerChange, Array.from(current));
      });

      label.append(input, text);
      wrap.appendChild(label);
    });

    container.appendChild(wrap);
  }

  function renderTrueFalse(question, savedAnswer, onAnswerChange, container) {
    if (!container) return;
    var current = savedAnswer && typeof savedAnswer === "object" && !Array.isArray(savedAnswer)
      ? Object.assign({}, savedAnswer)
      : {};

    var shell = document.createElement("div");
    shell.className = "true-false-answer-shell";

    // Header outside the statement box
    var headerOutside = document.createElement("div");
    headerOutside.className = "statement-header-outside";

    var dummyCell = document.createElement("div");
    
    var trueLabel = document.createElement("div");
    trueLabel.className = "statement-header-label";
    trueLabel.textContent = "Đúng";

    var falseLabel = document.createElement("div");
    falseLabel.className = "statement-header-label";
    falseLabel.textContent = "Sai";

    headerOutside.append(dummyCell, trueLabel, falseLabel);
    shell.appendChild(headerOutside);

    // Statement container wrapper
    var tableWrap = document.createElement("div");
    tableWrap.className = "statement-table";
    tableWrap.setAttribute("role", "table");

    ensureArray(question.statements).forEach(function (statement, index) {
      var id = statement.id || "";
      var row = document.createElement("div");
      row.className = "statement-row";
      row.setAttribute("role", "row");

      var textCell = document.createElement("div");
      textCell.className = "statement-cell-text";
      textCell.innerHTML = statement.text || ""; // Removed A), B), C), D) prefix
      textCell.setAttribute("role", "cell");

      var trueCell = document.createElement("div");
      trueCell.className = "statement-cell-btn";
      trueCell.setAttribute("role", "cell");

      var trueBtn = document.createElement("button");
      trueBtn.type = "button";
      trueBtn.className = "statement-btn";
      trueBtn.setAttribute("aria-label", "Chọn Đúng cho mệnh đề " + (index + 1));
      trueBtn.setAttribute("aria-pressed", current[id] === true ? "true" : "false");
      if (current[id] === true) trueBtn.classList.add("is-active");

      var falseCell = document.createElement("div");
      falseCell.className = "statement-cell-btn";
      falseCell.setAttribute("role", "cell");

      var falseBtn = document.createElement("button");
      falseBtn.type = "button";
      falseBtn.className = "statement-btn";
      falseBtn.setAttribute("aria-label", "Chọn Sai cho mệnh đề " + (index + 1));
      falseBtn.setAttribute("aria-pressed", current[id] === false ? "true" : "false");
      if (current[id] === false) falseBtn.classList.add("is-active");

      trueBtn.addEventListener("click", function () {
        if (current[id] === true) {
          delete current[id];
        } else {
          current[id] = true;
        }
        updateRowState();
        notify(onAnswerChange, Object.assign({}, current));
      });

      falseBtn.addEventListener("click", function () {
        if (current[id] === false) {
          delete current[id];
        } else {
          current[id] = false;
        }
        updateRowState();
        notify(onAnswerChange, Object.assign({}, current));
      });

      function updateRowState() {
        trueBtn.classList.remove("is-active");
        falseBtn.classList.remove("is-active");
        if (current[id] === true) {
          trueBtn.classList.add("is-active");
        } else if (current[id] === false) {
          falseBtn.classList.add("is-active");
        }
        trueBtn.setAttribute("aria-pressed", current[id] === true ? "true" : "false");
        falseBtn.setAttribute("aria-pressed", current[id] === false ? "true" : "false");
      }

      trueCell.appendChild(trueBtn);
      falseCell.appendChild(falseBtn);
      row.append(textCell, trueCell, falseCell);
      tableWrap.appendChild(row);
    });

    shell.appendChild(tableWrap);
    container.appendChild(shell);
  }

  function renderFillBlank(question, savedAnswer, onAnswerChange, container) {
    if (!container) return;
    var wrap = document.createElement("div");
    wrap.className = "short-answer";
    wrap.innerHTML = "<span>Điền đáp án:</span>";

    var input = document.createElement("input");
    input.type = "text";
    input.value = savedAnswer == null ? "" : savedAnswer;
    input.placeholder = ""; // Removed underscores to prevent double underline overlap
    input.addEventListener("input", function () { notify(onAnswerChange, input.value); });

    wrap.appendChild(input);
    container.appendChild(wrap);
  }

  function renderNumericAnswer(question, savedAnswer, onAnswerChange, container) {
    if (!container) return;
    var wrap = document.createElement("div");
    wrap.className = "short-answer";
    wrap.innerHTML = "<span>Điền đáp án:</span>";

    var input = document.createElement("input");
    input.type = "text"; // Use text type to avoid input clearing on space key press
    input.value = savedAnswer == null ? "" : savedAnswer;
    input.placeholder = ""; // Removed underscores to prevent double underline overlap
    input.addEventListener("input", function () {
      notify(onAnswerChange, input.value);
    });

    wrap.appendChild(input);
    container.appendChild(wrap);
  }

  function renderDragDrop(question, savedAnswer, onAnswerChange, container) {
    if (!container) return;
    var current = savedAnswer && typeof savedAnswer === "object" && !Array.isArray(savedAnswer)
      ? Object.assign({}, savedAnswer)
      : {};

    // If there are no items for dragging, render as inline text inputs directly
    if (!question.items || question.items.length === 0) {
      var textBlock = document.createElement("div");
      textBlock.className = "drag-drop-text";

      ensureArray(question.body).forEach(function (part) {
        if (part.type === "blank") {
          var input = document.createElement("input");
          input.type = "text";
          input.className = "inline-blank-input";
          input.value = current[part.id] || "";

          input.style.width = "180px";
          input.style.height = "20px"; // Bring underline closer to text baseline
          input.style.border = "none";
          input.style.borderBottom = "1px solid #93c5fd"; // Thin light blue underline
          input.style.background = "transparent";
          input.style.outline = "none";
          input.style.padding = "0px 6px 1px 6px"; // Zero top/bottom padding to bring text closer to border
          input.style.fontSize = "15px";
          input.style.textAlign = "center";
          input.style.color = "#000000"; // Black text when filled
          input.style.fontWeight = "500";

          input.addEventListener("input", function () {
            current[part.id] = input.value;
            notify(onAnswerChange, Object.assign({}, current));
          });

          textBlock.appendChild(input);
          return;
        }

        var span = document.createElement("span");
        span.innerHTML = part.content || "";
        textBlock.appendChild(span);
      });

      container.appendChild(textBlock);
      return;
    }

    var mainWrap = document.createElement("div");
    mainWrap.className = "drag-drop-container";

    var poolTitle = document.createElement("div");
    poolTitle.className = "drag-pool-title";
    poolTitle.textContent = "Các phương án lựa chọn (Kéo hoặc click để chọn):";
    mainWrap.appendChild(poolTitle);

    var pool = document.createElement("div");
    pool.className = "drag-pool";
    mainWrap.appendChild(pool);

    var usedItemIds = new Set();
    Object.keys(current).forEach(function (blankId) {
      if (current[blankId]) usedItemIds.add(current[blankId]);
    });

    var selectedChipId = null;

    ensureArray(question.items).forEach(function (item) {
      var chip = document.createElement("div");
      chip.className = "drag-chip";
      chip.textContent = item.text;
      chip.setAttribute("draggable", "true");
      chip.dataset.id = item.id;

      if (usedItemIds.has(item.id)) {
        chip.classList.add("is-used");
        chip.setAttribute("draggable", "false");
      }

      chip.addEventListener("dragstart", function (e) {
        if (usedItemIds.has(item.id)) {
          e.preventDefault();
          return;
        }
        chip.classList.add("is-dragging");
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
      });

      chip.addEventListener("dragend", function () {
        chip.classList.remove("is-dragging");
      });

      chip.addEventListener("click", function () {
        if (usedItemIds.has(item.id)) return;
        
        if (selectedChipId === item.id) {
          selectedChipId = null;
          chip.classList.remove("is-selected");
          chip.style.borderColor = "";
          chip.style.backgroundColor = "";
        } else {
          pool.querySelectorAll(".drag-chip").forEach(function (c) {
            c.classList.remove("is-selected");
            c.style.borderColor = "";
            c.style.backgroundColor = "";
          });
          selectedChipId = item.id;
          chip.classList.add("is-selected");
          chip.style.borderColor = "#1769d8";
          chip.style.backgroundColor = "#eff6ff";
        }
      });

      pool.appendChild(chip);
    });

    var textBlock = document.createElement("div");
    textBlock.className = "drag-drop-text";

    ensureArray(question.body).forEach(function (part) {
      if (part.type === "blank") {
        var zone = document.createElement("span");
        zone.className = "drop-zone";
        zone.dataset.blankId = part.id;

        var placedItemId = current[part.id];
        if (placedItemId) {
          zone.classList.add("has-item");
          var matchedItem = ensureArray(question.items).find(function (item) {
            return item.id === placedItemId;
          });
          if (matchedItem) {
            var placedChip = document.createElement("div");
            placedChip.className = "drag-chip";
            placedChip.textContent = matchedItem.text;
            zone.appendChild(placedChip);
          }
        }

        zone.addEventListener("dragover", function (e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          zone.classList.add("hovered");
        });

        zone.addEventListener("dragleave", function () {
          zone.classList.remove("hovered");
        });

        zone.addEventListener("drop", function (e) {
          e.preventDefault();
          zone.classList.remove("hovered");
          var itemId = e.dataTransfer.getData("text/plain");
          if (!itemId) return;

          Object.keys(current).forEach(function (bId) {
            if (current[bId] === itemId) {
              delete current[bId];
            }
          });

          current[part.id] = itemId;
          notify(onAnswerChange, Object.assign({}, current));
          container.innerHTML = "";
          renderDragDrop(question, current, onAnswerChange, container);
          if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
            window.MathJax.typesetPromise([container]).catch(function () {});
          }
        });

        zone.addEventListener("click", function () {
          if (placedItemId) {
            delete current[part.id];
            notify(onAnswerChange, Object.assign({}, current));
            container.innerHTML = "";
            renderDragDrop(question, current, onAnswerChange, container);
            if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
              window.MathJax.typesetPromise([container]).catch(function () {});
            }
          } else if (selectedChipId) {
            var itemId = selectedChipId;
            selectedChipId = null;

            Object.keys(current).forEach(function (bId) {
              if (current[bId] === itemId) {
                delete current[bId];
              }
            });

            current[part.id] = itemId;
            notify(onAnswerChange, Object.assign({}, current));
            container.innerHTML = "";
            renderDragDrop(question, current, onAnswerChange, container);
            if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
              window.MathJax.typesetPromise([container]).catch(function () {});
            }
          }
        });

        textBlock.appendChild(zone);
        return;
      }

      var span = document.createElement("span");
      span.innerHTML = part.content || "";
      textBlock.appendChild(span);
    });

    mainWrap.appendChild(textBlock);
    container.appendChild(mainWrap);
  }

  var QUESTION_RENDERERS = {
    single_choice: renderSingleChoice,
    multiple_choice: renderMultipleChoice,
    true_false: renderTrueFalse,
    fill_blank: renderFillBlank,
    numeric_answer: renderNumericAnswer,
    drag_drop: renderDragDrop
  };

  function preprocessQuestionMath(obj) {
    if (obj && typeof obj === "object") {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "string") {
            obj[key] = obj[key].replace(/\\frac/g, '\\dfrac');
          } else if (typeof obj[key] === "object") {
            preprocessQuestionMath(obj[key]);
          }
        }
      }
    }
    return obj;
  }

  function renderQuestionTo(question, savedAnswer, onAnswerChange, bodyEl, answerEl, options) {
    options = options || {};
    question = JSON.parse(JSON.stringify(question));
    preprocessQuestionMath(question);

    renderQuestionText(question, bodyEl);
    if (answerEl) {
      clear(answerEl);
      var renderer = QUESTION_RENDERERS[getType(question)];
      if (renderer) {
        renderer(question, savedAnswer, onAnswerChange, answerEl);
      } else {
        answerEl.innerHTML = '<div class="render-error">Không hỗ trợ dạng câu hỏi: ' + getType(question) + '</div>';
      }
    }

    if (options.typeset !== false && global.MathJax && typeof global.MathJax.typesetPromise === "function") {
      global.MathJax.typesetPromise([bodyEl, answerEl].filter(Boolean)).catch(function () {});
    }
  }

  function renderQuestion(question, savedAnswer, onAnswerChange, options) {
    options = options || {};
    var root = options.root || document;
    var bodyEl = options.bodyEl || options.target || root.querySelector("#question-body") || root.querySelector("[data-question-body]");
    var answerEl = options.answerEl || options.answerTarget || root.querySelector("#answer-area") || root.querySelector("[data-answer-area]");
    renderQuestionTo(question, savedAnswer, onAnswerChange, bodyEl, answerEl, options);
  }

  function renderStimulusGroup(group, options) {
    options = options || {};
    var box = document.createElement("article");
    box.className = "stimulus-card";

    var title = document.createElement("h3");
    title.textContent = (group && group.title) || "Ngữ liệu";
    box.appendChild(title);

    var content = document.createElement("div");
    content.className = "stimulus-content";
    content.innerHTML = (group && group.stimulus && group.stimulus.content) || "";
    box.appendChild(content);

    if (group && group.stimulus && group.stimulus.image_url) {
      box.appendChild(createImage(group.stimulus.image_url, group.title || "Ảnh ngữ liệu"));
    }

    if (options.target) {
      clear(options.target);
      options.target.appendChild(box);
    }

    if (options.typeset !== false && global.MathJax && typeof global.MathJax.typesetPromise === "function") {
      global.MathJax.typesetPromise([box]).catch(function () {});
    }

    return box;
  }

  global.QUESTION_RENDERERS = QUESTION_RENDERERS;
  global.renderQuestion = renderQuestion;
  global.renderQuestionTo = renderQuestionTo;
  global.renderSingleChoice = renderSingleChoice;
  global.renderMultipleChoice = renderMultipleChoice;
  global.renderTrueFalse = renderTrueFalse;
  global.renderFillBlank = renderFillBlank;
  global.renderNumericAnswer = renderNumericAnswer;
  global.renderDragDrop = renderDragDrop;
  global.renderStimulusGroup = renderStimulusGroup;
})(window);
