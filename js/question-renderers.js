/**
 * Common question renderers for the static TSA exam system.
 * Supports:
 * single_choice, single_choice_2, multiple_choice, true_false, fill_blank, numeric_answer, drag_drop.
 */
(function (global) {
  "use strict";

  function preprocessMathContent(text) {
    if (!text) return "";
    var str = String(text);
    // Parse Markdown bold **text** or ++text++ -> <strong>text</strong>
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    str = str.replace(/\+\+(.*?)\+\+/g, '<strong>$1</strong>');
    // Replace standalone bullet points
    str = str.replace(/(^|\n)[\s]*[\*\-]\s+(.*?)(?=\n|$)/g, '$1&bull; $2');

    return str
      .replace(/\\\(/g, '\\(\\displaystyle ')
      .replace(/\$(?!\$)/g, '$\\displaystyle ')
      .replace(/\\frac(?![a-zA-Z])/g, '\\dfrac')
      .replace(/\\int(?!\\limits)(?![a-zA-Z])/g, '\\int\\limits')
      .replace(/\\sum(?!\\limits)(?![a-zA-Z])/g, '\\sum\\limits')
      .replace(/\\prod(?!\\limits)(?![a-zA-Z])/g, '\\prod\\limits')
      .replace(/\\lim(?!\\limits)(?![a-zA-Z])/g, '\\lim\\limits');
  }

  function sanitizeHTML(html) {
    if (!html) return "";
    var processed = preprocessMathContent(html);
    if (typeof DOMPurify !== "undefined" && DOMPurify.sanitize) {
      return DOMPurify.sanitize(processed, {
        USE_PROFILES: { html: true, svg: true, mathMl: true },
        ADD_TAGS: ["style"],
        ADD_ATTR: ["stroke-dasharray", "marker-end", "orient", "refX", "refY", "markerWidth", "markerHeight"]
      });
    }
    return String(processed)
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/on\w+\s*=\s*(['"\s])[\s\S]*?\1/gi, "")
      .replace(/javascript:\s*/gi, "");
  }

  function typesetMath(elements) {
    var mathJax = global.MathJax;
    var targets = ensureArray(elements).filter(Boolean);
    if (!mathJax || !targets.length) return;

    if (typeof mathJax.typesetPromise === "function") {
      mathJax.typesetPromise(targets).catch(function () {});
      return;
    }

    if (mathJax.startup && mathJax.startup.promise) {
      mathJax.startup.promise.then(function () {
        if (typeof mathJax.typesetPromise === "function") {
          return mathJax.typesetPromise(targets);
        }
        return null;
      }).catch(function () {});
    }
  }

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

  function createImage(url, altText, widthPercent) {
    var holder = document.createElement("div");
    holder.className = "question-image-wrap";
    holder.style.textAlign = "center"; // Center align by default

    var img = document.createElement("img");
    img.src = url;
    img.alt = altText || "Ảnh câu hỏi";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;

    if (widthPercent) {
      img.style.width = widthPercent + "%";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
    } else {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
    }

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

    lead.innerHTML = sanitizeHTML(rawText);
    bodyEl.appendChild(lead);

    if (question && question.image_url) {
      bodyEl.appendChild(createImage(question.image_url, "Ảnh câu hỏi " + (question.question_no || ""), question.image_width));
    }
  }

  function notify(onAnswerChange, value) {
    if (typeof onAnswerChange === "function") onAnswerChange(value);
  }

  function renderSingleChoice(question, savedAnswer, onAnswerChange, container) {
    if (!container) return;
    var wrap = document.createElement("div");
    wrap.className = "choices-container is-single-choice";
    if (question.question_type === "single_choice_2") {
      wrap.classList.add("is-single-choice-2");
    }
    
    var isImageOptions = question.options_are_images === true;
    if (isImageOptions) {
      wrap.classList.add("has-image-options");
      wrap.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%; margin-top: 10px;";
    }

    ensureArray(question.options).forEach(function (opt) {
      var key = opt.key || "";
      var label = document.createElement("label");
      label.className = "choice-item";
      if (isImageOptions) {
        label.style.cssText = "display: flex; align-items: center; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s;";
      }
      if (String(savedAnswer || "") === String(key)) label.classList.add("is-selected");

      var input = document.createElement("input");
      input.type = "radio";
      input.name = "single_" + getQuestionId(question);
      input.value = key;
      input.checked = String(savedAnswer || "") === String(key);
      input.className = "choice-input";

      var text = document.createElement("span");
      text.className = "choice-text";
      
      if (isImageOptions) {
        var img = document.createElement("img");
        img.src = opt.text || "";
        img.className = "choice-image";
        img.style.cssText = "max-height: 120px; width: auto; max-width: 100%; object-fit: contain; display: block; border-radius: 4px; transition: transform 0.15s ease;";
        img.addEventListener("mouseenter", function() { img.style.transform = "scale(1.05)"; });
        img.addEventListener("mouseleave", function() { img.style.transform = "scale(1.0)"; });
        text.appendChild(img);
      } else {
        text.innerHTML = sanitizeHTML(opt.text || "");
      }

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
    
    var isImageOptions = question.options_are_images === true;
    if (isImageOptions) {
      wrap.classList.add("has-image-options");
      wrap.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%; margin-top: 10px;";
    }

    ensureArray(question.options).forEach(function (opt) {
      var key = opt.key || "";
      var label = document.createElement("label");
      label.className = "choice-item";
      if (isImageOptions) {
        label.style.cssText = "display: flex; align-items: center; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s;";
      }
      if (current.has(String(key))) label.classList.add("is-selected");

      var input = document.createElement("input");
      input.type = "checkbox";
      input.name = "multiple_" + getQuestionId(question) + "_" + key;
      input.value = key;
      input.checked = current.has(String(key));
      input.className = "choice-input";

      var text = document.createElement("span");
      text.className = "choice-text";
      
      if (isImageOptions) {
        var img = document.createElement("img");
        img.src = opt.text || "";
        img.className = "choice-image";
        img.style.cssText = "max-height: 120px; width: auto; max-width: 100%; object-fit: contain; display: block; border-radius: 4px; transition: transform 0.15s ease;";
        img.addEventListener("mouseenter", function() { img.style.transform = "scale(1.05)"; });
        img.addEventListener("mouseleave", function() { img.style.transform = "scale(1.0)"; });
        text.appendChild(img);
      } else {
        text.innerHTML = sanitizeHTML(opt.text || "");
      }

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
      textCell.innerHTML = sanitizeHTML(statement.text || ""); // Removed A), B), C), D) prefix
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
          input.placeholder = "";

          input.style.width = "180px";

          input.addEventListener("input", function () {
            current[part.id] = input.value;
            notify(onAnswerChange, Object.assign({}, current));
          });

          textBlock.appendChild(input);
          return;
        }

        var span = document.createElement("span");
        span.innerHTML = sanitizeHTML(part.content || "");
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
      span.innerHTML = sanitizeHTML(part.content || "");
      textBlock.appendChild(span);
    });

    mainWrap.appendChild(textBlock);
    container.appendChild(mainWrap);
  }

  var QUESTION_RENDERERS = {
    single_choice: renderSingleChoice,
    single_choice_2: renderSingleChoice,
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

    var type = getType(question);
    var rawText = question.question || question.prompt || "";
    
    var hasInlineBlanks = (type === "fill_blank" && /\[(o\d+|blank)\]/.test(rawText));
    if (hasInlineBlanks) {
      if (bodyEl) {
        clear(bodyEl);
        
        var lead = document.createElement("div");
        lead.className = "question-lead";
        
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
          var r = new RegExp("(" + phrase + ")", "gi");
          rawText = rawText.replace(r, "<strong>$1</strong>");
        });

        var matches = [];
        var tempMatch;
        var tempRegex = /\[(o\d+|blank)\]/g;
        while ((tempMatch = tempRegex.exec(rawText)) !== null) {
          matches.push({ id: tempMatch[1], index: tempMatch.index });
        }
        var isMultiBlank = (matches.length > 1);

        var currentAnswers = {};
        if (isMultiBlank) {
          currentAnswers = (savedAnswer && typeof savedAnswer === "object" && !Array.isArray(savedAnswer))
            ? Object.assign({}, savedAnswer)
            : {};
        } else {
          var singleId = matches[0] ? matches[0].id : "blank";
          currentAnswers[singleId] = (savedAnswer && typeof savedAnswer === "object")
            ? (savedAnswer[singleId] || "")
            : (savedAnswer || "");
        }

        var lastIdx = 0;
        var regex = /\[(o\d+|blank)\]/g;
        var match;
        while ((match = regex.exec(rawText)) !== null) {
          var textBefore = rawText.substring(lastIdx, match.index);
          if (textBefore) {
            var span = document.createElement("span");
            span.innerHTML = sanitizeHTML(textBefore);
            lead.appendChild(span);
          }

          var blankId = match[1];
          (function (bId) {
            var input = document.createElement("input");
            input.type = "text";
            input.className = "inline-blank-input";
            input.value = currentAnswers[bId] || "";
            input.placeholder = "";
            input.style.width = "180px";

            input.addEventListener("input", function () {
              if (isMultiBlank) {
                currentAnswers[bId] = input.value;
                notify(onAnswerChange, Object.assign({}, currentAnswers));
              } else {
                currentAnswers[bId] = input.value;
                notify(onAnswerChange, input.value);
              }
            });
            lead.appendChild(input);
          })(blankId);

          lastIdx = regex.lastIndex;
        }

        var textAfter = rawText.substring(lastIdx);
        if (textAfter) {
          var span = document.createElement("span");
          span.innerHTML = sanitizeHTML(textAfter);
          lead.appendChild(span);
        }

        bodyEl.appendChild(lead);
        if (question.image_url) {
          bodyEl.appendChild(createImage(question.image_url, "Ảnh câu hỏi " + (question.question_no || ""), question.image_width));
        }
      }
      if (answerEl) {
        clear(answerEl);
      }
    } else {
      renderQuestionText(question, bodyEl);
      if (answerEl) {
        clear(answerEl);
        var renderer = QUESTION_RENDERERS[type];
        if (renderer) {
          renderer(question, savedAnswer, onAnswerChange, answerEl);
        } else {
          answerEl.innerHTML = '<div class="render-error">Không hỗ trợ dạng câu hỏi: ' + type + '</div>';
        }
      }
    }

    // Check if in student preview mode
    var isUrlPreview = new URLSearchParams(window.location.search).get("preview") === "true";
    if (isUrlPreview && answerEl) {
      var previewControls = document.createElement("div");
      previewControls.className = "preview-answer-drawer-container";
      previewControls.style.cssText = "margin-top: 20px; border-top: 1.5px dashed #cbd5e1; padding-top: 16px; width: 100%; font-family: inherit;";
      
      // Determine the answer string to display
      var answerStr = "";
      var corr = question.correct_answer;
      if (corr !== undefined && corr !== null) {
        if (type === "single_choice" || type === "multiple_choice") {
          if (Array.isArray(corr)) {
            answerStr = corr.join(", ");
          } else {
            answerStr = String(corr);
          }
        } else if (type === "true_false") {
          if (typeof corr === "object") {
            answerStr = Object.keys(corr).map(function(k) {
              return k.toUpperCase() + ": " + (corr[k] ? "Đúng" : "Sai");
            }).join(" | ");
          } else {
            answerStr = String(corr);
          }
        } else {
          answerStr = String(corr);
        }
      } else {
        answerStr = "Chưa có đáp án cấu hình.";
      }
      
      var explanationStr = (question.explanation || question.solution_details || question.solution_detail || question.solution || "").trim() || "Chưa có lời giải chi tiết.";
      
      previewControls.innerHTML = `
        <button type="button" class="btn" style="background: #f1f5f9; color: #475569; border: 1.5px solid #cbd5e1; font-weight: 700; font-size: 13px; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onclick="window.togglePreviewAnswerDrawer(this)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Xem đáp án &amp; Lời giải (Preview)
        </button>
        <div class="preview-answer-content" style="display: none; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 12px; font-family: inherit;">
          <div style="margin-bottom: 10px; font-size: 14px;">
            <span style="font-weight: 800; color: #1e293b;">🎯 Đáp án đúng:</span> 
            <span class="badge" style="background: #dcfce7; color: #166534; font-weight: 800; padding: 4px 8px; border-radius: 6px; font-size: 13.5px; border: 1px solid #bbf7d0; margin-left: 6px;">${answerStr}</span>
          </div>
          <div>
            <span style="font-weight: 800; color: #1e293b; display: block; margin-bottom: 6px;">💡 Lời giải chi tiết:</span>
            <div style="font-size: 13.5px; color: #334155; line-height: 1.6; word-break: break-word;">${explanationStr}</div>
          </div>
        </div>
      `;
      answerEl.appendChild(previewControls);
      
      if (!window.togglePreviewAnswerDrawer) {
        window.togglePreviewAnswerDrawer = function(btn) {
          var content = btn.nextElementSibling;
          if (content.style.display === "none") {
            content.style.display = "block";
            btn.innerHTML = `
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              Ẩn đáp án &amp; Lời giải
            `;
            if (window.MathJax && window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise([content]).catch(function() {});
            }
          } else {
            content.style.display = "none";
            btn.innerHTML = `
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Xem đáp án &amp; Lời giải (Preview)
            `;
          }
        };
      }
    }

    if (options.typeset !== false) {
      typesetMath([bodyEl, answerEl]);
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

    // 1. Dòng chữ Dựa vào thông tin...
    if (group && group.rangeText) {
      var prefix = document.createElement("div");
      prefix.className = "stimulus-range-prefix";
      prefix.textContent = group.rangeText;
      prefix.style.cssText = "font-weight:700; font-size:16px; color:#1e293b; margin-bottom:12px; line-height:1.5;";
      box.appendChild(prefix);
    }

    // 2. Tiêu đề chính (Centered, bold, large)
    var mainTitleText = (group && group.title) || "";
    if (mainTitleText && !/^ngữ liệu\s*\d*$/i.test(mainTitleText) && !/^đọc hiểu\s*\d*$/i.test(mainTitleText)) {
      var mainTitle = document.createElement("h2");
      mainTitle.className = "stimulus-main-title";
      mainTitle.textContent = mainTitleText;
      mainTitle.style.cssText = "text-align:center; font-weight:800; font-size:18px; color:#000; margin:15px 0 20px 0; text-transform:uppercase; line-height:1.5;";
      box.appendChild(mainTitle);
    } else {
      // Nếu không có tiêu đề cụ thể và không có rangeText, giữ h3 mặc định làm khoảng cách hoặc ẩn
      if (!group || !group.rangeText) {
        var title = document.createElement("h3");
        title.textContent = mainTitleText || "Ngữ liệu";
        box.appendChild(title);
      }
    }

    var content = document.createElement("div");
    content.className = "stimulus-content";
    content.innerHTML = sanitizeHTML((group && group.stimulus && group.stimulus.content) || "");
    box.appendChild(content);

    if (group && group.stimulus && group.stimulus.image_url) {
      box.appendChild(createImage(group.stimulus.image_url, group.title || "Ảnh ngữ liệu", group.stimulus.image_width));
    }

    if (options.target) {
      clear(options.target);
      options.target.appendChild(box);
    }

    if (options.typeset !== false) {
      typesetMath([box]);
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
