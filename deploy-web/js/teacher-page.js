// State management for Student lists
    var approvedStudents = [];
    var lmsCourses = [];
    
    async function loadStudents() {
      if (window.supabaseClient) {
        try {
          var { data: dbStudents, error } = await window.supabaseClient
            .from('students')
            .select('*');
          if (error) throw error;
          
          approvedStudents = (dbStudents || []).map(s => ({
            email: s.email,
            username: s.email,
            name: s.name,
            dob: s.dob || "",
            gender: s.gender || "",
            cccd: s.cccd || "",
            phone: s.phone || "",
            school: s.school || "",
            className: s.class_name || "",
            province: s.province || "",
            district: s.district || "",
            ward: s.ward || "",
            street: s.street || ""
          }));
          return;
        } catch (dbErr) {
          console.warn("Failed to load students from Supabase:", dbErr);
        }
      }
      
      try {
        var saved = localStorage.getItem("tmaTsaUsers");
        if (saved) {
          approvedStudents = JSON.parse(saved);
        } else {
          approvedStudents = [];
        }
      } catch (e) {
        console.warn("Failed to load students from localStorage:", e);
      }
    }

    async function renderStudents() {
      await loadStudents();

      var approvedGrid = document.getElementById("approved-students-grid");
      if (!approvedGrid) return;

      if (approvedStudents.length === 0) {
        approvedGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">Chưa có học sinh nào đăng ký tài khoản.</div>';
        return;
      }

      approvedGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">Đang tải danh sách học sinh...</div>';

      // Fetch all enrollments from Supabase to match
      var enrollsList = [];
      try {
        if (window.supabaseClient) {
          var { data: dbEnrolls } = await window.supabaseClient.from('enrollments').select('*');
          enrollsList = dbEnrolls || [];
        } else {
          // Offline mock enrollments
          enrollsList = [];
        }
      } catch (err) {
        console.warn("Failed to fetch enrollments from Supabase for student grid:", err);
      }

      approvedGrid.innerHTML = "";
      approvedStudents.forEach(function(s) {
        var firstChar = s.name ? s.name.trim().charAt(0).toUpperCase() : "H";

        var card = document.createElement("div");
        card.className = "student-card";
        card.style.cssText = "background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.015);";
        card.setAttribute("onmouseover", "this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.05)'; this.style.borderColor='var(--brand)';");
        card.setAttribute("onmouseout", "this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px rgba(0,0,0,0.015)'; this.style.borderColor='#e5e7eb';");
        card.onclick = function() {
          viewStudentDetails(s.email);
        };
        
        card.innerHTML = '\n' +
'          <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--brand-soft); color: var(--brand); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; border: 1px solid rgba(19, 92, 151, 0.15); text-transform: uppercase;">\n' +
'            ' + esc(firstChar) + '\n' +
'          </div>\n' +
'          <div style="font-weight: 700; color: #1e293b; font-size: 14px; word-break: break-word;">' + esc(s.name) + '</div>\n' +
'        ';
        approvedGrid.appendChild(card);
      });
    }

    async function kickStudent(email) {
      var idx = approvedStudents.findIndex(function(s) { return String(s.email).toLowerCase() === String(email).toLowerCase(); });
      if (idx !== -1) {
        var student = approvedStudents[idx];
        if (await showCustomConfirm(`Bạn có chắc muốn kích học sinh: ${student.name} ra khỏi lớp học? Quyền truy cập các khóa học của học sinh này sẽ bị xóa khỏi hệ thống.`)) {
          // Delete from Supabase enrollments
          if (window.supabaseClient) {
            await window.supabaseClient.from('enrollments').delete().eq('user_email', student.email);
          }
          // Remove from local array
          approvedStudents.splice(idx, 1);
          localStorage.setItem("tmaTsaUsers", JSON.stringify(approvedStudents));
          
          window.closeStudentDetailView();
          renderStudents();
        }
      }
    }

    async function viewStudentDetails(email) {
      var student = approvedStudents.find(function(s) { return String(s.email).toLowerCase() === String(email).toLowerCase(); });
      if (student) {
        var firstChar = student.name ? student.name.trim().charAt(0).toUpperCase() : "H";
        
        var avatarCircle = document.getElementById("detail-avatar-circle");
        if (avatarCircle) avatarCircle.textContent = firstChar;
        
        document.getElementById("detail-student-name").textContent = student.name;
        document.getElementById("detail-student-code").textContent = "Mã học sinh: " + (student.email || "").split("@")[0].toUpperCase();
        document.getElementById("detail-student-email").textContent = student.email || "Chưa cập nhật";
        document.getElementById("detail-student-phone").textContent = student.phone || "Chưa cập nhật";
        document.getElementById("detail-student-school").textContent = student.school || "Chưa cập nhật";
        document.getElementById("detail-student-class").textContent = student.className || "Chưa cập nhật";
        
        var regDate = student.created_at ? student.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
        document.getElementById("detail-student-reg-date").textContent = regDate;
        
        var kickBtn = document.getElementById("detail-kick-btn");
        if (kickBtn) {
          kickBtn.onclick = function() {
            kickStudent(student.email);
          };
        }
        
        // Fetch exam results and calculate stats
        var testsCompletedEl = document.getElementById("detail-tests-completed");
        var avgAccuracyEl = document.getElementById("detail-avg-accuracy");
        if (testsCompletedEl && avgAccuracyEl) {
          testsCompletedEl.textContent = "Đang tính toán...";
          avgAccuracyEl.textContent = "Đang tính toán...";
          
          try {
            if (window.supabaseClient) {
              var { data: examResults, error: resultsError } = await window.supabaseClient
                .from('exam_results')
                .select('correct_count, total_questions')
                .eq('user_email', student.email);
              
              if (!resultsError && examResults) {
                var totalTests = examResults.length;
                testsCompletedEl.textContent = totalTests + " đề";
                
                if (totalTests > 0) {
                  var totalCorrect = examResults.reduce((acc, curr) => acc + (curr.correct_count || 0), 0);
                  var totalQs = examResults.reduce((acc, curr) => acc + (curr.total_questions || 0), 0);
                  var avgAcc = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
                  avgAccuracyEl.textContent = avgAcc + "%";
                } else {
                  avgAccuracyEl.textContent = "0%";
                }
              } else {
                testsCompletedEl.textContent = "0 đề";
                avgAccuracyEl.textContent = "0%";
              }
            } else {
              testsCompletedEl.textContent = "0 đề";
              avgAccuracyEl.textContent = "0%";
            }
          } catch (statErr) {
            console.warn("Failed to calculate student exam stats:", statErr);
            testsCompletedEl.textContent = "0 đề";
            avgAccuracyEl.textContent = "0%";
          }
        }
        
        var progressContainer = document.getElementById("detail-student-lms-progress");
        if (progressContainer) {
          progressContainer.innerHTML = "<p style='color: var(--muted); font-size: 12px; margin: 0;'>Đang tải thông tin tiến độ...</p>";
          
          try {
            var studentCode = student.email;
            var enrolledCourses = [];
            var completedLessonIds = [];
            
            if (window.supabaseClient) {
              var { data: enrolls } = await window.supabaseClient
                .from('enrollments')
                .select('course_id')
                .eq('user_email', studentCode);
              var enrolledIds = (enrolls || []).map(e => e.course_id);
              
              enrolledCourses = lmsCourses.filter(c => enrolledIds.includes(c.id));
              
              var { data: progress } = await window.supabaseClient
                .from('lesson_progress')
                .select('lesson_id')
                .eq('user_email', studentCode);
              completedLessonIds = (progress || []).map(p => p.lesson_id);
            } else {
              enrolledCourses = lmsCourses;
              completedLessonIds = JSON.parse(localStorage.getItem(`tmaTsaLessonProgress_${student.email}`) || "[]");
            }
            
            if (enrolledCourses.length === 0) {
              progressContainer.innerHTML = "<p style='color: var(--muted); font-size: 12px; margin: 0;'>Chưa tham gia khóa học nào.</p>";
            } else {
              progressContainer.innerHTML = "";
              for (const course of enrolledCourses) {
                var courseLessons = [];
                if (window.supabaseClient) {
                  var { data: dbLessons } = await window.supabaseClient
                    .from('lessons')
                    .select('*')
                    .eq('course_id', course.id)
                    .order('order_index', { ascending: true })
                    .order('created_at', { ascending: true });
                  courseLessons = dbLessons || [];
                } else {
                  var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
                  courseLessons = allMockLessons.filter(l => l.course_id === course.id);
                }
                
                var courseLessonsCount = courseLessons.length;
                var completedInCourse = courseLessons.filter(l => completedLessonIds.includes(l.id));
                var percent = courseLessonsCount > 0 ? Math.round((completedInCourse.length / courseLessonsCount) * 100) : 0;
                
                var section = document.createElement("div");
                section.style.cssText = "margin-bottom:12px; padding:8px; border:1px solid #e2e8f0; border-radius:6px; background:#f8fafc;";
                section.innerHTML = `
                  <div style="font-weight:700; font-size:12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                    <span style="flex:1; word-break:break-word;">${course.title}</span>
                    <span style="color:#16a34a; white-space:nowrap;">${completedInCourse.length}/${courseLessonsCount} bài (${percent}%)</span>
                    <button class="btn btn-danger btn-xs" style="background:#b91c1c; color:#ffffff; font-weight:800; padding:2px 6px; font-size:10px; margin:0; line-height:1.2; border:none; border-radius:4px; cursor:pointer;" onclick="revokeCourseAccess('${student.email}', '${course.id}', '${course.title.replace(/'/g, "\\'")}')">Xóa quyền</button>
                  </div>
                  <div style="font-size:11px; color:#64748b; padding-left:8px; border-top: 1px dashed #e2e8f0; margin-top: 4px; padding-top: 4px;">
                    ${completedInCourse.length > 0 ? completedInCourse.map(l => "✅ " + l.title).join("<br>") : "❌ Chưa học bài nào"}
                  </div>
                `;
                progressContainer.appendChild(section);
              }
            }
          } catch (progressErr) {
            console.error(progressErr);
            progressContainer.innerHTML = "<p style='color: #b9152a; font-size: 12px; margin: 0;'>Lỗi khi tải thông tin tiến độ.</p>";
          }
        }
        
        document.getElementById("students-list-view").style.display = "none";
        document.getElementById("students-detail-view").style.display = "block";
      }
    }

    async function revokeCourseAccess(email, courseId, courseTitle) {
      if (await showCustomConfirm(`Bạn có chắc chắn muốn xóa học sinh khỏi khóa học "${courseTitle}"? Sau khi xóa, học sinh sẽ không còn quyền truy cập học tập khóa này.`)) {
        try {
          if (window.supabaseClient) {
            const { error } = await window.supabaseClient
              .from('enrollments')
              .delete()
              .eq('user_email', email)
              .eq('course_id', courseId);
            
            if (error) throw error;
          }
          
          var student = approvedStudents.find(function(s) { return String(s.email).toLowerCase() === String(email).toLowerCase(); });
          var username = student ? student.username || student.email.split("@")[0] : email.split("@")[0];
          var key = "tmaTsaRegisteredCourses_" + username;
          var current = [];
          try {
            current = JSON.parse(localStorage.getItem(key) || "[]");
          } catch(e){}
          current = current.filter(id => id !== courseId);
          localStorage.setItem(key, JSON.stringify(current));
          
          await showCustomAlert(`Đã xóa quyền truy cập khóa học "${courseTitle}" thành công!`);
          await viewStudentDetails(email);
          renderStudents();
        } catch (err) {
          console.error("Failed to revoke course access:", err);
          await showCustomAlert("Lỗi khi xóa quyền truy cập khóa học: " + (err.message || err));
        }
      }
    }

    function closeStudentDetailView() {
      document.getElementById("students-list-view").style.display = "block";
      document.getElementById("students-detail-view").style.display = "none";
    }

    window.kickStudent = kickStudent;
    window.viewStudentDetails = viewStudentDetails;
    window.revokeCourseAccess = revokeCourseAccess;
    window.closeStudentDetailView = closeStudentDetailView;

    

    function esc(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

// State management for categories and subtabs (Practice & Exams)
    var currentPracticeCategory = "tsa";
    var currentExamCategory = "tsa";
    var currentTsaPracticeSubtab = "tong-hop";

    function selectCategoryTab(type, category, element) {
      // 1. Update UI state in sidebar
      document.querySelectorAll(".submenu-item").forEach(function(item) {
        item.classList.remove("active");
      });
      element.classList.add("active");

      // Set has-active for parent groups
      document.querySelectorAll(".menu-group").forEach(function(g) {
        g.classList.remove("has-active");
      });
      element.closest(".menu-group").classList.add("has-active");

      // Update sidebar nav active classes
      document.querySelectorAll("#sidebar-normal-nav > button.nav-button").forEach(function(btn) {
        btn.classList.remove("active");
      });

      // 2. Open dashboard tabs
      if (type === "practice") {
        currentPracticeCategory = category;
        switchSystemTab("practice");
      } else if (type === "exams") {
        currentExamCategory = category;
        switchSystemTab("exams");
      }
    }

    // Expose selectCategoryTab
    window.selectCategoryTab = selectCategoryTab;

    // KHO TÀI LIỆU (DRIVE LINKS) MANAGEMENT (FULLY DYNAMIC)
    var currentMaterialsList = [];

    function initializeMaterialsList() {
      var savedLinks = null;
      try {
        savedLinks = JSON.parse(localStorage.getItem("tmaTsaDriveLinks") || "{}");
      } catch(e) {}
      
      var defaultMaterials = [
        { title: "Đề TSA số 01", category: "ĐGTD", subject: "TOÁN" },
        { title: "Đề TSA số 02", category: "ĐGTD", subject: "TOÁN" },
        { title: "Đề TSA số 03", category: "ĐGTD", subject: "TOÁN" },
        { title: "Đề TSA số 04", category: "ĐGTD", subject: "TOÁN" },
        { title: "Đề TSA số 05", category: "ĐGTD", subject: "TOÁN" },
        { title: "Đề TSA số 06", category: "ĐGTD", subject: "TOÁN" },
        { title: "Đề HSA số 01", category: "ĐGNL", subject: "TOÁN" },
        { title: "Đề HSA số 02", category: "ĐGNL", subject: "TOÁN" },
        { title: "Đề HSA số 03", category: "ĐGNL", subject: "TOÁN" },
        { title: "Đề HSA số 04", category: "ĐGNL", subject: "TOÁN" },
        { title: "Đề THPTQG số 01", category: "LỚP 12", subject: "TOÁN" },
        { title: "Đề THPTQG số 02", category: "LỚP 12", subject: "TOÁN" },
        { title: "Đề THPTQG số 03", category: "LỚP 12", subject: "TOÁN" },
        { title: "Đề THPTQG số 04", category: "LỚP 12", subject: "TOÁN" }
      ];

      if (savedLinks && typeof savedLinks === "object" && !Array.isArray(savedLinks)) {
        currentMaterialsList = defaultMaterials.map(function(m, idx) {
          return {
            id: "doc_" + Date.now() + "_" + idx,
            title: m.title,
            category: m.category,
            subject: m.subject,
            url: savedLinks[idx] || ""
          };
        });
      } else if (Array.isArray(savedLinks)) {
        currentMaterialsList = savedLinks.map(function(m) {
          var cat = m.category;
          if (cat === "TSA") cat = "ĐGTD";
          else if (cat === "HSA") cat = "ĐGNL";
          else if (cat === "THPT") cat = "LỚP 12";
          return {
            id: m.id || "doc_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            title: m.title || "",
            category: cat || "ĐGTD",
            subject: m.subject || "TOÁN",
            url: m.url || ""
          };
        });
      } else {
        currentMaterialsList = defaultMaterials.map(function(m, idx) {
          return {
            id: "doc_" + Date.now() + "_" + idx,
            title: m.title,
            category: m.category,
            subject: m.subject,
            url: ""
          };
        });
      }
    }

    window.activeTeacherCategory = "ALL";
    window.activeTeacherSubject = "ALL";

    window.filterTeacherCategory = function(cat) {
      window.activeTeacherCategory = cat;
      document.querySelectorAll(".library-category-pills .lib-pill-btn").forEach(function(btn) {
        if (btn.getAttribute("data-category") === cat) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
      const selectEl = document.getElementById("new-doc-category");
      if (selectEl && cat !== "ALL") {
        selectEl.value = cat;
      }
      renderManageDocuments();
    };

    window.filterTeacherSubject = function(sub) {
      window.activeTeacherSubject = sub;
      document.querySelectorAll(".library-subject-tabs .lib-sub-tab").forEach(function(btn) {
        if (btn.getAttribute("data-teacher-subject") === sub) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
      const selectEl = document.getElementById("new-doc-subject");
      if (selectEl && sub !== "ALL") {
        selectEl.value = sub;
      }
      renderManageDocuments();
    };

    window.onTeacherLibrarySearchInput = function() {
      renderManageDocuments();
    };

    window.editingMaterialId = null;
    window.editingMaterialBackup = null;

    window.startEditingRow = function(id) {
      const material = currentMaterialsList.find(m => m.id === id);
      if (material) {
        window.editingMaterialBackup = {
          title: material.title,
          category: material.category,
          subject: material.subject,
          url: material.url,
          note: material.note || ""
        };
        window.editingMaterialId = id;
        renderManageDocuments();
      }
    };

    window.cancelEditingRow = function() {
      if (window.editingMaterialId && window.editingMaterialBackup) {
        const material = currentMaterialsList.find(m => m.id === window.editingMaterialId);
        if (material) {
          Object.assign(material, window.editingMaterialBackup);
        }
      }
      window.editingMaterialId = null;
      window.editingMaterialBackup = null;
      renderManageDocuments();
    };

    window.saveEditingRow = function(id) {
      const material = currentMaterialsList.find(m => m.id === id);
      if (material) {
        if (!material.title.trim()) {
          window.alert("Tiêu đề tài liệu không được để trống!");
          return;
        }
        if (!material.url.trim()) {
          window.alert("Đường dẫn không được để trống!");
          return;
        }
      }
      window.editingMaterialId = null;
      window.editingMaterialBackup = null;
      renderManageDocuments();
      autoSaveDocuments();
    };

    function renderManageDocuments() {
      var container = document.getElementById("teacher-materials-inputs");
      if (!container) return;
      
      if (currentMaterialsList.length === 0) {
        initializeMaterialsList();
      }

      var subjectOptions = ["TOÁN", "LÝ", "SINH", "ANH", "HOÁ", "VĂN"];

      // Setup Search filter
      const searchInput = document.getElementById("teacher-lib-search-input");
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

      // Setup category & subject dropdown filters
      const filterCatEl = document.getElementById("teacher-lib-filter-category");
      const filterSubEl = document.getElementById("teacher-lib-filter-subject");
      const activeCat = filterCatEl ? filterCatEl.value : "ALL";
      const activeSub = filterSubEl ? filterSubEl.value : "ALL";

      function removeAccents(str) {
        return String(str || "")
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[đĐ]/g, function(m) { return m === 'đ' ? 'd' : 'D'; })
          .toLowerCase();
      }

      // Filter all documents
      var filtered = currentMaterialsList.filter(function(m) { 
        if (activeCat !== "ALL" && m.category !== activeCat) return false;
        if (activeSub !== "ALL" && m.subject !== activeSub) return false;
        if (keyword) {
          const cleanTitle = removeAccents(m.title);
          const cleanKeyword = removeAccents(keyword);
          if (!cleanTitle.includes(cleanKeyword)) return false;
        }
        return true;
      });

      var html = "";

      if (filtered.length === 0) {
        container.innerHTML = '<tr><td colspan="5" class="empty" style="padding: 24px; text-align: center; color: var(--muted); font-size: 13px; font-style: italic;">Không tìm thấy tài liệu phù hợp.</td></tr>';
        return;
      }

      filtered.forEach(function(material) {
        if (window.editingMaterialId === material.id) {
          // Editable Row mode
          var categorySelect = `<select class="select" data-field="category" data-doc-id="${material.id}" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: white; box-sizing: border-box; height: 34px; cursor: pointer; font-size: 12.5px; outline: none;">`;
          ["ĐGTD", "ĐGNL", "LỚP 12", "LỚP 11", "LỚP 10", "LỚP 9"].forEach(function(catOpt) {
            var selected = material.category === catOpt ? "selected" : "";
            categorySelect += `<option value="${catOpt}" ${selected}>${catOpt}</option>`;
          });
          categorySelect += `</select>`;

          var subjectSelect = `<select class="select" data-field="subject" data-doc-id="${material.id}" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: white; box-sizing: border-box; height: 34px; cursor: pointer; font-size: 12.5px; text-transform: uppercase; outline: none;">`;
          subjectOptions.forEach(function(sub) {
            var selected = material.subject === sub ? "selected" : "";
            subjectSelect += `<option value="${sub}" ${selected}>${sub}</option>`;
          });
          subjectSelect += `</select>`;

          html += `
            <tr style="background: #fffbeb;">
              <td style="padding: 12px 16px;">
                <input class="input" type="text" data-field="title" data-doc-id="${material.id}" value="${esc(material.title)}" placeholder="Tên tài liệu..." style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); font-weight: 700; box-sizing: border-box; width: 100%; height: 34px; font-size: 13px; outline: none; background: white;">
                <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 10.5px; font-weight: 700; color: #78350f;">Môn:</span>
                  <div style="width: 100px;">${subjectSelect}</div>
                </div>
              </td>
              <td style="padding: 12px 16px;">
                ${categorySelect}
              </td>
              <td style="padding: 12px 16px;">
                <input class="input" type="text" data-field="url" data-doc-id="${material.id}" value="${esc(material.url)}" placeholder="Đường dẫn URL..." style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); box-sizing: border-box; width: 100%; height: 34px; font-size: 12.5px; outline: none; background: white;">
              </td>
              <td style="padding: 12px 16px;">
                <input class="input" type="text" data-field="note" data-doc-id="${material.id}" value="${esc(material.note || '')}" placeholder="Ghi chú..." style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); box-sizing: border-box; width: 100%; height: 34px; font-size: 12.5px; outline: none; background: white;">
              </td>
              <td style="padding: 12px 16px;">
                <div style="display: flex; gap: 6px;">
                  <button class="btn" type="button" onclick="window.saveEditingRow('${material.id}')" style="background: #16a34a; color: white; border: none; font-weight: 700; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 11.5px;">Lưu</button>
                  <button class="btn" type="button" onclick="window.cancelEditingRow()" style="background: #cbd5e1; color: #475569; border: none; font-weight: 700; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 11.5px;">Hủy</button>
                </div>
              </td>
            </tr>
          `;
        } else {
          // Read-only Row mode
          html += `
            <tr>
              <td style="padding: 16px 20px;">
                <div style="font-weight: 700; color: #1e293b; font-size: 13.5px;">${esc(material.title)}</div>
                <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; display: inline-block; margin-top: 6px;">
                  ${material.subject}
                </span>
              </td>
              <td style="padding: 16px 20px;">
                <span style="background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                  ${material.category}
                </span>
              </td>
              <td style="padding: 16px 20px;">
                <a href="${esc(material.url)}" target="_blank" style="color: #0f5a9e; font-size: 13px; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px; display: inline-flex; align-items: center; gap: 6px;" title="${esc(material.url)}">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2 2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  Link tài liệu
                </a>
              </td>
              <td style="padding: 16px 20px; font-size: 12.5px; color: #64748b;">
                ${esc(material.note || "Không có")}
              </td>
              <td style="padding: 16px 20px;">
                <div style="display: flex; gap: 6px;">
                  <button class="btn" type="button" onclick="window.startEditingRow('${material.id}')" style="color: #0f5a9e; border: 1px solid #bfdbfe; background: #eff6ff; font-weight: 700; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 11.5px;">Sửa</button>
                  <button class="btn" type="button" onclick="window.removeDocumentFromList('${material.id}')" style="color: #ff3b30; border: 1px solid #ffcccc; background: #fff0f0; font-weight: 700; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 11.5px;">Xóa</button>
                </div>
              </td>
            </tr>
          `;
        }
      });
      container.innerHTML = html;

      // Add input/change event listeners to save changes immediately in-memory
      container.querySelectorAll("input, select").forEach(function(el) {
        var updateFn = function() {
          var id = el.getAttribute("data-doc-id");
          var field = el.getAttribute("data-field");
          var value = el.value.trim();
          var doc = currentMaterialsList.find(function(m) { return m.id === id; });
          if (doc) {
            doc[field] = value;
          }
        };
        el.addEventListener("input", updateFn);
        el.addEventListener("change", updateFn);
      });
    }

    async function autoSaveDocuments() {
      var client = window.supabaseClient;
      if (!client) return;

      var saveIndicator = document.getElementById("save-documents-indicator");
      if (saveIndicator) {
        saveIndicator.style.display = "inline-flex";
        saveIndicator.style.background = "#eff6ff";
        saveIndicator.style.color = "var(--brand)";
        saveIndicator.textContent = "⌛ Đang tự động lưu...";
      }

      try {
        localStorage.setItem("tmaTsaDriveLinks", JSON.stringify(currentMaterialsList));

        var jsonStr = JSON.stringify(currentMaterialsList, null, 2);
        var blob = new Blob([jsonStr], { type: "application/json" });
        await client.storage
          .from('exams')
          .upload('drive_links.json', blob, {
            cacheControl: '3600',
            upsert: true
          });

        if (saveIndicator) {
          saveIndicator.textContent = "✓ Đã tự động lưu lên Cloud";
          saveIndicator.style.background = "#f0fdf4";
          saveIndicator.style.color = "var(--green)";
          setTimeout(function() {
            if (saveIndicator.textContent === "✓ Đã tự động lưu lên Cloud") {
              saveIndicator.style.display = "none";
            }
          }, 3000);
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        if (saveIndicator) {
          saveIndicator.textContent = "⚠ Lỗi lưu tự động!";
          saveIndicator.style.background = "#fef2f2";
          saveIndicator.style.color = "var(--danger)";
        }
      }
    }

    function addNewDocumentToList() {
      var titleInput = document.getElementById("new-doc-title");
      var catSelect = document.getElementById("new-doc-category");
      var subSelect = document.getElementById("new-doc-subject");
      var urlInput = document.getElementById("new-doc-url");
      var noteInput = document.getElementById("new-doc-note");

      if (!titleInput || !catSelect || !urlInput) return;

      var title = titleInput.value.trim();
      var cat = catSelect.value;
      var sub = subSelect ? subSelect.value : "TOÁN";
      var url = urlInput.value.trim();
      var note = noteInput ? noteInput.value.trim() : "";

      if (!title) {
        window.alert("Vui lòng nhập tiêu đề tài liệu!");
        titleInput.focus();
        return;
      }

      var newDoc = {
        id: "doc_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        title: title,
        category: cat,
        subject: sub,
        url: url,
        note: note
      };

      currentMaterialsList.push(newDoc);
      renderManageDocuments();

      titleInput.value = "";
      urlInput.value = "";
      if (noteInput) noteInput.value = "";

      autoSaveDocuments();
    }

    function removeDocumentFromList(id) {
      if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này khỏi danh sách không?")) {
        return;
      }
      currentMaterialsList = currentMaterialsList.filter(function(m) { return m.id !== id; });
      renderManageDocuments();
      autoSaveDocuments();
    }

    async function saveDocumentsToSupabase() {
      var client = window.supabaseClient;
      if (!client) {
        window.alert("Supabase Client chưa được khởi tạo. Vui lòng đợi.");
        return;
      }

      var btn = document.getElementById("save-documents-btn");
      var originalText = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Đang lưu lên Cloud...";
      }

      try {
        localStorage.setItem("tmaTsaDriveLinks", JSON.stringify(currentMaterialsList));

        var jsonStr = JSON.stringify(currentMaterialsList, null, 2);
        var blob = new Blob([jsonStr], { type: "application/json" });
        var { error } = await client.storage
          .from('exams')
          .upload('drive_links.json', blob, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;
        window.alert("✓ Đã lưu danh sách tài liệu lên Supabase Cloud thành công!");
      } catch(err) {
        console.error(err);
        window.alert("Lỗi khi tải tài liệu lên Supabase:\n" + (err.message || err));
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }
    }

    function clearAllDocumentLinks() {
      if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách tài liệu không?")) {
        return;
      }
      currentMaterialsList = [];
      renderManageDocuments();
      localStorage.removeItem("tmaTsaDriveLinks");
      autoSaveDocuments();
    }

    window.addNewDocumentToList = addNewDocumentToList;
    window.removeDocumentFromList = removeDocumentFromList;
    window.saveDocumentsToSupabase = saveDocumentsToSupabase;
    window.clearAllDocumentLinks = clearAllDocumentLinks;
    window.onTeacherLibFilterChange = function() {
      renderManageDocuments();
    };

    function renderPracticeRoom() {
      function normalizeCode(value) {
        return String(value || "TSA001").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "") || "TSA001";
      }
      var grid = document.getElementById("practice-grid-dynamic");
      if (!grid) return;
      grid.innerHTML = "";

      var category = currentPracticeCategory.toUpperCase();
      var subtabsContainer = document.getElementById("practice-subtabs-container");

      // Update Page Headers
      var roomTitle = document.getElementById("practice-room-title");
      var roomDesc = document.getElementById("practice-room-desc");
      
      var labels = {
        TSA: ["Đánh giá tư duy - TSA", "Khám phá các chế độ rèn luyện cấu trúc đề thi TSA Bách Khoa để khắc phục điểm yếu kiến thức."],
        HSA: ["Đánh giá năng lực - HSA", "Khám phá các chế độ rèn luyện cấu trúc đề thi HSA ĐHQGHN để khắc phục điểm yếu kiến thức."],
        VACT: ["Đánh giá năng lực - VACT", "Khám phá các chế độ rèn luyện cấu trúc đề thi VACT ĐHQG TP.HCM để khắc phục điểm yếu kiến thức."],
        QDA: ["Đánh giá năng lực - QDA", "Khám phá các chế độ rèn luyện cấu trúc đề thi QDA Bộ Quốc phòng để khắc phục điểm yếu kiến thức."],
        THPT: ["Thi tốt nghiệp THPTQG", "Khám phá các chế độ rèn luyện cấu trúc đề thi tốt nghiệp THPTQG để khắc phục điểm yếu kiến thức."]
      };
      
      var info = labels[category] || labels.TSA;
      if (roomTitle) roomTitle.textContent = "Phòng luyện đề: " + info[0];
      if (roomDesc) roomDesc.textContent = info[1];

      if (category === "TSA") {
        if (subtabsContainer) {
          subtabsContainer.style.display = "flex";
          subtabsContainer.innerHTML = `
            <div style="display: flex; background: #e2e8f0; padding: 4px; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); gap: 4px; overflow-x: auto; max-width: 100%;">
              <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'tong-hop' ? 'active' : ''}" data-subtab="tong-hop" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${currentTsaPracticeSubtab === 'tong-hop' ? '#ffffff' : 'transparent'}; color: ${currentTsaPracticeSubtab === 'tong-hop' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Đề tổng hợp</button>
              <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'math' ? 'active' : ''}" data-subtab="math" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${currentTsaPracticeSubtab === 'math' ? '#ffffff' : 'transparent'}; color: ${currentTsaPracticeSubtab === 'math' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Toán học</button>
              <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'reading' ? 'active' : ''}" data-subtab="reading" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${currentTsaPracticeSubtab === 'reading' ? '#ffffff' : 'transparent'}; color: ${currentTsaPracticeSubtab === 'reading' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Đọc hiểu</button>
              <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'science' ? 'active' : ''}" data-subtab="science" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${currentTsaPracticeSubtab === 'science' ? '#ffffff' : 'transparent'}; color: ${currentTsaPracticeSubtab === 'science' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Khoa học</button>
            </div>
          `;
          // Attach subtab click listeners
          subtabsContainer.querySelectorAll(".tsa-practice-subtab-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              currentTsaPracticeSubtab = btn.getAttribute("data-subtab");
              renderPracticeRoom();
            });
          });
        }

        // Generate dynamic count of exams for selected TSA subtab
        var maxPracticeIndex = 10;
        var practiceIndexList = [];
        try {
          var rawIdx = localStorage.getItem("tma_tsa_exam_index");
          if (rawIdx) {
            var parsedIdx = JSON.parse(rawIdx);
            if (Array.isArray(parsedIdx)) {
              practiceIndexList = parsedIdx;
              parsedIdx.forEach(e => {
                if (e.exam_code && e.exam_code.startsWith("TSA_PRACTICE_FULL_")) {
                  var parts = e.exam_code.split("_");
                  var num = parseInt(parts[parts.length - 1], 10);
                  if (num > maxPracticeIndex) maxPracticeIndex = num;
                }
              });
            }
          }
        } catch(e) {}

        let openStatus = {};
        try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}

        for (let i = 1; i <= maxPracticeIndex; i++) {
          var numStr = String(i).padStart(2, "0");
          var examTitle = "";
          var examCode = `TSA_PRACTICE_${currentTsaPracticeSubtab.toUpperCase()}_${numStr}`;

          if (currentTsaPracticeSubtab === "tong-hop") {
            examTitle = `Đề tổng hợp số ${numStr}`;
            examCode = `TSA_PRACTICE_FULL_${numStr}`;
          } else if (currentTsaPracticeSubtab === "math") {
            examTitle = `Đề TSA số ${numStr} - Tư duy Toán học`;
          } else if (currentTsaPracticeSubtab === "reading") {
            examTitle = `Đề TSA số ${numStr} - Đọc hiểu`;
          } else if (currentTsaPracticeSubtab === "science") {
            examTitle = `Đề TSA số ${numStr} - Khoa học`;
          }

          var inList = practiceIndexList.find(e => normalizeCode(e.exam_code) === normalizeCode(examCode));
          var hasExam = !!inList;
          const isOpen = inList && (inList.is_open === true || openStatus[examCode] === true);

          var card = document.createElement("div");
          card.className = "exam-card";
          card.innerHTML = `
            <header class="exam-card-header">
              <h3 style="text-transform: none;">${examTitle}</h3>
            </header>
            <div class="exam-card-body">
              <div class="exam-info-row">
                <span class="info-label">Mã đề:</span>
                <span class="info-value font-bold">${examCode}</span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Trạng thái:</span>
                <span class="${hasExam ? 'badge-green' : 'badge-red'}" style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">
                  ${hasExam ? 'ĐÃ CÓ ĐỀ' : 'CHƯA CÓ ĐỀ'}
                </span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Trạng thái phòng thi:</span>
                <span class="${isOpen ? 'badge-green' : ''}" style="${!isOpen ? 'color:#94a3b8;font-size:12px;font-weight:600;' : ''}">
                  ${isOpen ? 'Đang mở đề' : 'Đang đóng đề'}
                </span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Hình thức:</span>
                <span class="info-value font-bold">Thi trực tuyến</span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Lệ phí:</span>
                <span class="info-value font-bold">Miễn phí</span>
              </div>
            </div>
            <footer class="exam-card-footer" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
              <button class="btn btn-sm btn-primary" style="font-weight: 800; padding: 6px 12px; font-size: 12px;" onclick="startEditingExam('${examTitle}', '${examCode}')">Chỉnh sửa</button>
              ${hasExam ? `
                ${isOpen ? `
                  <button class="btn btn-sm btn-danger" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #ef4444; border-color: #ef4444; color: #fff;" onclick="toggleExamOpen('${examCode}', false)">
                    Đóng đề
                  </button>
                ` : `
                  <button class="btn btn-sm" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #16a34a; border-color: #16a34a; color: #fff;" onclick="toggleExamOpen('${examCode}', true)">
                    Mở đề
                  </button>
                `}
                <button class="btn btn-sm btn-danger" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #94a3b8; border-color: #94a3b8; color: #fff;" onclick="deleteExamPermanently('${examCode}', '${examTitle}')">Xóa đề</button>
              ` : ''}
            </footer>
          `;
          grid.appendChild(card);
        }
        return;
      }

      // Other categories
      if (subtabsContainer) subtabsContainer.style.display = "none";

      var displayCategory = category === "THPT" ? "THPTQG" : category;
      for (let i = 1; i <= 10; i++) {
        var numStr = String(i).padStart(2, "0");
        var examTitle = `Đề ${displayCategory} số ${numStr}`;
        var examCode = `${displayCategory}_PRACTICE_${numStr}`;

        var card = document.createElement("div");
        card.className = "exam-card";
        card.innerHTML = `
          <header class="exam-card-header">
            <h3 style="text-transform: none;">${examTitle}</h3>
          </header>
          <div class="exam-card-body">
            <div class="exam-info-row">
              <span class="info-label">Hình thức thi:</span>
              <span class="badge-green">Thi trực tuyến</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Thời gian đăng ký:</span>
              <span class="info-value">Hằng ngày</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Lệ phí:</span>
              <span class="info-value font-bold">Miễn phí</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Thời gian thi:</span>
              <span class="info-value">Hằng ngày</span>
            </div>
          </div>
          <footer class="exam-card-footer">
            <button class="btn btn-sm btn-primary" style="font-weight: 800;" onclick="startEditingExam('${examTitle}', '${examCode}')">Chỉnh sửa</button>
          </footer>
        `;
        grid.appendChild(card);
      }
    }

    var EXAMS_DATA_MOCK = [
      { id: "tsa-online", title: "Thi thử Bài thi Đánh giá tư duy TSA", category: "TSA", code: "TSA001", badge: "badge-green", label: "Thi trực tuyến" },
      { id: "hsa-online", title: "Thi thử Bài thi Đánh giá năng lực HSA", category: "HSA", code: "HSA_MOCK", badge: "badge-green", label: "Thi trực tuyến" },
      { id: "vact-online", title: "Thi thử Bài thi Đánh giá năng lực VACT", category: "VACT", code: "VACT_MOCK", badge: "badge-green", label: "Thi trực tuyến" },
      { id: "qda-online", title: "Thi thử Bài thi Đánh giá năng lực QDA", category: "QDA", code: "QDA_MOCK", badge: "badge-green", label: "Thi trực tuyến" },
      { id: "thpt-online", title: "Thi thử tốt nghiệp THPTQG", category: "THPT", code: "THPT_MOCK", badge: "badge-green", label: "Thi trực tuyến" }
    ];

    function renderExamsList() {
      var grid = document.getElementById("exams-list-grid");
      if (!grid) return;
      grid.innerHTML = "";

      // Update Page Headers
      var examTitle = document.getElementById("exam-tab-title");
      var examDesc = document.getElementById("exam-tab-desc");

      var labels = {
        tsa: ["Bài thi Đánh giá tư duy - TSA", "Các kỳ thi thử được tổ chức theo cấu trúc Đại học Bách Khoa Hà Nội."],
        hsa: ["Bài thi Đánh giá năng lực - HSA", "Các kỳ thi thử được tổ chức theo cấu trúc ĐHQG Hà Nội."],
        vact: ["Bài thi Đánh giá năng lực - VACT", "Các kỳ thi thử được tổ chức theo cấu trúc ĐHQG TP.HCM."],
        qda: ["Bài thi Đánh giá năng lực - QDA", "Các kỳ thi thử được tổ chức theo cấu trúc Bộ Quốc Phòng."],
        thpt: ["Thi tốt nghiệp THPTQG", "Các kỳ thi thử được tổ chức theo cấu trúc kỳ thi tốt nghiệp THPT Quốc gia."]
      };
      
      var info = labels[currentExamCategory] || labels.tsa;
      if (examTitle) examTitle.textContent = info[0];
      if (examDesc) examDesc.textContent = info[1];

      if (currentExamCategory.toLowerCase() === "tsa") {
        let indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(indexList)) indexList = [];

        let openStatus = {};
        try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}

        for (let i = 1; i <= 1; i++) {
          const numStr = String(i).padStart(2, "0");
          const examCode = "TSA_EXAM_" + numStr;
          const examTitleStr = "Đề thi thử TSA";

          const inList = indexList.find(e => e.exam_code === examCode);
          const hasExam = !!inList;
          const isOpen = inList && (inList.is_open === true || openStatus[examCode] === true);

          var card = document.createElement("div");
          card.className = "exam-card";
          card.innerHTML = `
            <header class="exam-card-header">
              <h3 style="text-transform:none;">${examTitleStr}</h3>
            </header>
            <div class="exam-card-body">
              <div class="exam-info-row">
                <span class="info-label">Mã đề:</span>
                <span class="info-value font-bold">${examCode}</span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Trạng thái soạn đề:</span>
                <span class="${hasExam ? 'badge-green' : 'badge-red'}" style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">
                  ${hasExam ? 'ĐÃ CÓ ĐỀ' : 'CHƯA CÓ ĐỀ'}
                </span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Trạng thái phòng thi:</span>
                <span class="${isOpen ? 'badge-green' : ''}" style="${!isOpen ? 'color:#94a3b8;font-size:12px;font-weight:600;' : ''}">
                  ${isOpen ? 'Đang mở đề' : 'Đang đóng đề'}
                </span>
              </div>
            </div>
            <footer class="exam-card-footer" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
              <button class="btn btn-sm btn-primary" style="font-weight: 800; padding: 6px 12px; font-size: 12px;" onclick="startEditingExam('${examTitleStr}', '${examCode}')">
                Chỉnh sửa
              </button>
              ${isOpen ? `
                <button class="btn btn-sm btn-danger" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #ef4444; border-color: #ef4444; color: #fff;" onclick="toggleExamOpen('${examCode}', false)">
                  Đóng đề
                </button>
              ` : `
                <button class="btn btn-sm" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #16a34a; border-color: #16a34a; color: #fff; cursor: ${hasExam ? 'pointer' : 'not-allowed'}; opacity: ${hasExam ? 1 : 0.6};" ${hasExam ? '' : 'disabled'} onclick="toggleExamOpen('${examCode}', true)">
                  Mở đề
                </button>
              `}
              <button class="btn btn-sm" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #3b82f6; border-color: #3b82f6; color: #fff; cursor: ${hasExam ? 'pointer' : 'not-allowed'}; opacity: ${hasExam ? 1 : 0.6};" ${hasExam ? '' : 'disabled'} onclick="archiveMockToPractice()">
                Chuyển vào Phòng luyện
              </button>
            </footer>
          `;
          grid.appendChild(card);
        }
        return;
      }

      var filtered = EXAMS_DATA_MOCK.filter(function(item) {
        return item.category.toLowerCase() === currentExamCategory.toLowerCase();
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty" style="grid-column: 1/-1;">Chưa có kỳ thi thử chính thức nào cho danh mục này.</div>';
        return;
      }

      filtered.forEach(function(examItem) {
        var card = document.createElement("div");
        card.className = "exam-card";
        card.innerHTML = `
          <header class="exam-card-header">
            <h3>${examItem.title}</h3>
          </header>
          <div class="exam-card-body">
            <div class="exam-info-row">
              <span class="info-label">Hình thức thi:</span>
              <span class="${examItem.badge}">${examItem.label}</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Thời gian đăng ký:</span>
              <span class="info-value">Hằng ngày</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Lệ phí:</span>
              <span class="info-value font-bold">Miễn phí</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Thời gian thi:</span>
              <span class="info-value">Hằng ngày</span>
            </div>
          </div>
          <footer class="exam-card-footer">
            <button class="btn btn-sm btn-primary" style="font-weight: 800;" onclick="startEditingExam('${examItem.title}', '${examItem.code}')">Chỉnh sửa</button>
          </footer>
        `;
        grid.appendChild(card);
      });
    }

    function switchSystemTab(tabId) {
      // Show correct dashboard panel
      document.querySelectorAll("#dashboard-container .tab-panel").forEach(function(panel) {
        panel.classList.toggle("active", panel.id === "tab-" + tabId);
      });

      // Update sidebar nav active states
      if (tabId === "approve-students" || tabId === "manage-students" || tabId === "manage-documents" || tabId === "manage-courses" || tabId === "activation-codes" || tabId === "security-logs" || tabId === "approve-courses") {
        document.querySelectorAll("#sidebar-normal-nav .nav-button").forEach(function(btn) {
          var target = btn.getAttribute("data-tab-target");
          btn.classList.toggle("active", target === tabId);
        });
        document.querySelectorAll(".submenu-item").forEach(function(item) {
          item.classList.remove("active");
        });
        document.querySelectorAll(".menu-group").forEach(function(g) {
          g.classList.remove("has-active");
        });
      }

      if (tabId === "practice") {
        renderPracticeRoom();
      } else if (tabId === "exams") {
        renderExamsList();
      } else if (tabId === "manage-documents") {
        renderManageDocuments();
      } else if (tabId === "manage-courses") {
        renderManageCourses();
      } else if (tabId === "activation-codes") {
        renderActivationCodes();
      } else if (tabId === "security-logs") {
        renderSecurityLogs();
      } else if (tabId === "approve-courses") {
        renderManageCourses();
      }
    }

    

    // Attach normal sidebar listeners (for non-accordion simple buttons)
    document.querySelectorAll("#sidebar-normal-nav > button.nav-button").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var tabId = btn.getAttribute("data-tab-target");
        switchSystemTab(tabId);
      });
    });

    // Accordion sidebar toggles
    document.querySelectorAll(".menu-group").forEach(function(group) {
      var header = group.querySelector(".group-header");
      var submenu = group.querySelector(".submenu-wrapper");

      header.addEventListener("click", function(e) {
        e.preventDefault();
        var isOpen = group.classList.contains("open");

        // Close all other groups
        document.querySelectorAll(".menu-group").forEach(function(g) {
          g.classList.remove("open");
          var sub = g.querySelector(".submenu-wrapper");
          if (sub) {
            sub.classList.remove("open");
            sub.style.maxHeight = "0px";
          }
        });

        // Toggle current group
        if (!isOpen) {
          group.classList.add("open");
          submenu.classList.add("open");
          submenu.style.maxHeight = "250px";
        }
      });
    });

(function () {
      "use strict";

      // Khởi tạo Supabase Client từ cấu hình dùng chung
      var supabaseClient = null;
      if (typeof supabase !== 'undefined' && supabase.createClient && window.SUPABASE_CONFIG) {
        var teacherInfo = null;
        try {
          teacherInfo = JSON.parse(localStorage.getItem("teacherInfo") || "null");
        } catch (e) {}
        var teacherToken = teacherInfo ? teacherInfo.token : "";

        supabaseClient = supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey, {
          global: {
            headers: {
              'Authorization': 'Bearer ' + teacherToken,
              'x-teacher-token': teacherToken || '',
              'x-teacher-email': teacherInfo ? (teacherInfo.email || '') : ''
            }
          }
        });
        window.supabaseClient = supabaseClient;

        // [NÂNG CẤP BẢO MẬT]: Xác thực Token Giáo viên thời gian thực trên Database
        if (teacherToken) {
          supabaseClient
            .from('students')
            .select('role')
            .eq('email', teacherInfo ? teacherInfo.email.toLowerCase() : '')
            .eq('role', 'teacher')
            .maybeSingle()
            .then(res => {
              if (res.error || !res.data) {
                console.error("Xác thực Token Giáo viên thất bại:", res.error);
                localStorage.removeItem("teacherInfo");
                window.location.href = "login.html#teacher";
              }
            })
            .catch(err => {
              console.error("Lỗi mạng khi xác thực token:", err);
            });
        } else {
          localStorage.removeItem("teacherInfo");
          window.location.href = "login.html#teacher";
        }
      }

      var QUESTION_TYPES = [
        ["single_choice", "Trắc nghiệm 4 đáp án"],
        ["single_choice_2", "Trắc nghiệm 2 đáp án"],
        ["multiple_choice", "Trắc nghiệm nhiều đáp án"],
        ["true_false", "Đúng / Sai"],
        ["fill_blank", "Điền đáp án"],
        ["drag_drop", "Chọn thẻ vào chỗ trống"]
      ];

      var SECTION_LABELS = {
        math: "Tư duy Toán học",
        reading: "Đọc hiểu",
        science: "Khoa học"
      };

      var activeEditorTab = "setup";
      var activeGroupIds = { reading: "", science: "" };
      var editingQuestion = { math: null, reading: null, science: null };
      var activeMathQuestionNo = 1;
      var importedQuestions = [];
      var exam = createEmptyExam("TSA001", "Đề TSA số 01", 45, "published");

      function $(selector) { return document.querySelector(selector); }
      function $all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
      function clone(value) { return JSON.parse(JSON.stringify(value)); }
      function esc(value) {
        return String(value == null ? "" : value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }
      var attr = esc;

      function normalizeCode(value) {
        return String(value || "TSA001").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "") || "TSA001";
      }
      function nowTime() {
        var d = new Date();
        return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + ":" + String(d.getSeconds()).padStart(2, "0");
      }

      var FORMULA_CONTENT_PATTERN = new RegExp([
        "\\\\\\(", "\\\\\\[", "\\\\d?frac", "\\\\sqrt", "\\\\lim", "\\\\sin", "\\\\cos", "\\\\tan",
        "\\\\text", "\\\\mathbb", "\\\\left", "\\\\right", "\\\\begin", "\\\\end",
        "\\^\\{", "_\\{", "\\bsqrt\\s*\\{", "\\bRightarrow\\b", "\\bLeftrightarrow\\b"
      ].join("|"));

      function hasFormulaContent(value) {
        // Disabled to allow saving LaTeX and math formulas successfully
        return false;
      }

      function stripFormulaQuestions(targetExam) {
        var changed = false;
        if (!targetExam) return false;

        if (Array.isArray(targetExam.questions)) {
          var keptRootQuestions = targetExam.questions.filter(function (question) { return !hasFormulaContent(question); });
          if (keptRootQuestions.length !== targetExam.questions.length) changed = true;
          targetExam.questions = keptRootQuestions;
        }

        if (!Array.isArray(targetExam.sections)) return changed;

        targetExam.sections.forEach(function (section) {
          if (Array.isArray(section.questions)) {
            var kept = section.questions.filter(function (question) { return !hasFormulaContent(question); });
            if (kept.length !== section.questions.length) changed = true;
            section.questions = kept;
          }

          if (Array.isArray(section.groups)) {
            section.groups.forEach(function (group) {
              if (hasFormulaContent(group.stimulus)) {
                group.stimulus = { type: "text", content: "", image_url: "", image_width: 100 };
                changed = true;
              }
              if (Array.isArray(group.questions)) {
                var keptGroupQuestions = group.questions.filter(function (question) { return !hasFormulaContent(question); });
                if (keptGroupQuestions.length !== group.questions.length) changed = true;
                group.questions = keptGroupQuestions;
              }
            });
          }
        });

        return changed;
      }

      function stripStoredFormulaQuestions() {
        try {
          var keys = [];
          for (var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
          keys.forEach(function (key) {
            if (!/^tma_tsa_(teacher_draft|exam)_/.test(key)) return;
            try {
              var storedExam = JSON.parse(localStorage.getItem(key));
              if (stripFormulaQuestions(storedExam)) {
                localStorage.setItem(key, JSON.stringify(storedExam));
              }
            } catch (error) {}
          });
        } catch (error) {}
      }

      function createEmptyExam(code, title, duration, status) {
        return {
          exam_code: normalizeCode(code),
          title: title || "Đề TSA",
          duration_minutes: Number(duration) || 45,
          status: status || "draft",
          sections: [
            { section_id: "math", section_label: SECTION_LABELS.math, layout: "single", questions: [] },
            { section_id: "reading", section_label: SECTION_LABELS.reading, layout: "passage", groups: [] },
            { section_id: "science", section_label: SECTION_LABELS.science, layout: "passage", groups: [] }
          ]
        };
      }

      function ensureSchema() {
        if (!Array.isArray(exam.sections)) exam.sections = createEmptyExam(exam.exam_code, exam.title, exam.duration_minutes, exam.status).sections;
        ["math", "reading", "science"].forEach(function (id) {
          if (!getSection(id)) {
            if (id === "math") {
              var mathQuestions = [];
              for (var i = 1; i <= 40; i++) {
                mathQuestions.push({
                  question_no: i,
                  question_type: "single_choice",
                  question: "",
                  image_url: "",
                  options: [
                    { "key": "A", "text": "" },
                    { "key": "B", "text": "" },
                    { "key": "C", "text": "" },
                    { "key": "D", "text": "" }
                  ],
                  correct_answer: "A",
                  explanation: "",
                  points: 1
                });
              }
              exam.sections.push({ section_id: id, section_label: SECTION_LABELS[id], layout: "single", questions: mathQuestions });
            } else {
              exam.sections.push({ section_id: id, section_label: SECTION_LABELS[id], layout: "passage", groups: [] });
            }
          }
        });
        
        var mathSec = getSection("math");
        if (!Array.isArray(mathSec.questions)) {
          mathSec.questions = [];
        }
        
        // Populate up to 40 questions for math section
        while (mathSec.questions.length < 40) {
          var nextNo = mathSec.questions.length + 1;
          mathSec.questions.push({
            question_no: nextNo,
            question_type: "single_choice",
            question: "",
            image_url: "",
            options: [
              { "key": "A", "text": "" },
              { "key": "B", "text": "" },
              { "key": "C", "text": "" },
              { "key": "D", "text": "" }
            ],
            correct_answer: "A",
            explanation: "",
            points: 1
          });
        }

        // Clean placeholders from existing questions and option values
        mathSec.questions.forEach(function (q) {
          var qText = (q.question || "").trim();
          if (qText.indexOf("Nội dung câu hỏi") === 0 && qText.indexOf("chưa được nhập.") !== -1) {
            q.question = "";
          }
          if (Array.isArray(q.options)) {
            q.options.forEach(function (opt) {
              if (opt.text === "Đáp án A" || opt.text === "Đáp án B" || opt.text === "Đáp án C" || opt.text === "Đáp án D") {
                opt.text = "";
              }
            });
          }
        });

        // Keep sorted by question no
        mathSec.questions.sort(function (a, b) {
          return (Number(a.question_no) || 0) - (Number(b.question_no) || 0);
        });

        // Normalize: always make question_no match the 1-based array position
        for (var i = 0; i < mathSec.questions.length; i++) {
          mathSec.questions[i].question_no = i + 1;
        }

        ["reading", "science"].forEach(function (id) {
          if (!Array.isArray(getSection(id).groups)) getSection(id).groups = [];
        });

        // Enforce Reading Section Schema (exactly 2 groups, 10 questions each)
        var readingSec = getSection("reading");
        if (readingSec) {
          if (!Array.isArray(readingSec.groups)) readingSec.groups = [];
          
          // Keep only g1 and g2
          readingSec.groups = readingSec.groups.filter(function(g) {
            return g.group_id === "g1" || g.group_id === "g2";
          });
          
          // Check/Create Group 1 (g1)
          var g1 = readingSec.groups.find(function(g) { return g.group_id === "g1"; });
          if (!g1) {
            g1 = {
              group_id: "g1",
              title: "",
              stimulus: { type: "text", content: "", image_url: "", image_width: 100 },
              questions: []
            };
            readingSec.groups.push(g1);
          }
          if (!Array.isArray(g1.questions)) g1.questions = [];
          if (g1.questions.length > 10) {
            g1.questions = g1.questions.slice(0, 10);
          }
          // Strip legacy demo placeholder text if still present
          if (g1.title === "Ngữ liệu Đọc hiểu số 01") g1.title = "";
          if (g1.stimulus && g1.stimulus.content === "Nhập nội dung ngữ liệu 1 ở đây...") g1.stimulus.content = "";
          while (g1.questions.length < 10) {
            var nextNo = g1.questions.length + 1;
            g1.questions.push({
              question_no: nextNo,
              question_type: "single_choice",
              question: "",
              image_url: "",
              options: [
                { key: "A", text: "" },
                { key: "B", text: "" },
                { key: "C", text: "" },
                { key: "D", text: "" }
              ],
              correct_answer: "A",
              explanation: "",
              points: 1
            });
          }
          // Sort and assign question numbers 1 to 10
          g1.questions.sort(function(a, b) { return (Number(a.question_no) || 0) - (Number(b.question_no) || 0); });
          for (var i = 0; i < g1.questions.length; i++) {
            g1.questions[i].question_no = i + 1;
          }

          // Check/Create Group 2 (g2)
          var g2 = readingSec.groups.find(function(g) { return g.group_id === "g2"; });
          if (!g2) {
            g2 = {
              group_id: "g2",
              title: "",
              stimulus: { type: "text", content: "", image_url: "", image_width: 100 },
              questions: []
            };
            readingSec.groups.push(g2);
          }
          if (!Array.isArray(g2.questions)) g2.questions = [];
          if (g2.questions.length > 10) {
            g2.questions = g2.questions.slice(0, 10);
          }
          // Strip legacy demo placeholder text if still present
          if (g2.title === "Ngữ liệu Đọc hiểu số 02") g2.title = "";
          if (g2.stimulus && g2.stimulus.content === "Nhập nội dung ngữ liệu 2 ở đây...") g2.stimulus.content = "";
          while (g2.questions.length < 10) {
            var nextNo = g2.questions.length + 11; // 11 to 20
            g2.questions.push({
              question_no: nextNo,
              question_type: "single_choice",
              question: "",
              image_url: "",
              options: [
                { key: "A", text: "" },
                { key: "B", text: "" },
                { key: "C", text: "" },
                { key: "D", text: "" }
              ],
              correct_answer: "A",
              explanation: "",
              points: 1
            });
          }
          // Sort and assign question numbers 11 to 20
          g2.questions.sort(function(a, b) { return (Number(a.question_no) || 0) - (Number(b.question_no) || 0); });
          for (var i = 0; i < g2.questions.length; i++) {
            g2.questions[i].question_no = i + 11;
          }
          
          readingSec.g1 = g1;
          readingSec.g2 = g2;
          readingSec.g1_questions = g1.questions;
          readingSec.g2_questions = g2.questions;
          
          if (!activeGroupIds["reading"]) {
            activeGroupIds["reading"] = "g1";
          }
        }

        // Enforce Science Section Schema (exactly 8 groups, 5 questions each)
        var scienceSec = getSection("science");
        if (scienceSec) {
          if (!Array.isArray(scienceSec.groups)) scienceSec.groups = [];
          
          // Keep only g1 to g8
          var allowedScienceGroups = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"];
          scienceSec.groups = scienceSec.groups.filter(function(g) {
            return allowedScienceGroups.indexOf(g.group_id) !== -1;
          });
          
          for (var gIdx = 1; gIdx <= 8; gIdx++) {
            var gId = "g" + gIdx;
            var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
            if (!group) {
              group = {
                group_id: gId,
                title: "",
                stimulus: { type: "text", content: "", image_url: "", image_width: 100 },
                questions: []
              };
              scienceSec.groups.push(group);
            }
            if (!Array.isArray(group.questions)) group.questions = [];
            if (group.questions.length > 5) {
              group.questions = group.questions.slice(0, 5);
            }
            // Strip legacy demo placeholder text if still present
            if (group.title === "Ngữ liệu Khoa học số 0" + gIdx) group.title = "";
            if (group.stimulus && group.stimulus.content === "Nhập nội dung ngữ liệu khoa học " + gIdx + " ở đây...") group.stimulus.content = "";
            
            var startNo = (gIdx - 1) * 5 + 1;
            while (group.questions.length < 5) {
              var nextNo = startNo + group.questions.length;
              group.questions.push({
                question_no: nextNo,
                question_type: "single_choice",
                question: "",
                image_url: "",
                options: [
                  { key: "A", text: "" },
                  { key: "B", text: "" },
                  { key: "C", text: "" },
                  { key: "D", text: "" }
                ],
                correct_answer: "A",
                explanation: "",
                points: 1
              });
            }
            // Sort and assign question numbers
            group.questions.sort(function(a, b) { return (Number(a.question_no) || 0) - (Number(b.question_no) || 0); });
            for (var i = 0; i < group.questions.length; i++) {
              group.questions[i].question_no = startNo + i;
            }
            
            scienceSec[gId] = group;
            scienceSec[gId + "_questions"] = group.questions;
          }
          
          // Keep groups ordered from g1 to g8 in scienceSec.groups array
          scienceSec.groups.sort(function(a, b) {
            return allowedScienceGroups.indexOf(a.group_id) - allowedScienceGroups.indexOf(b.group_id);
          });
          
          if (!activeGroupIds["science"]) {
            activeGroupIds["science"] = "g1";
          }
        }
      }

      function getSection(id) {
        return (exam.sections || []).find(function (section) { return section.section_id === id; });
      }

      function draftKey(code) {
        return "tma_tsa_teacher_draft_" + normalizeCode(code || exam.exam_code);
      }

      function saveDraft() {
        syncMetadataFromForm(false);
        stripFormulaQuestions(exam);
        ensureSchema();
        try {
          localStorage.setItem(draftKey(), JSON.stringify(exam));
          localStorage.setItem("tma_tsa_teacher_last_exam_code", exam.exam_code);
          var statusEl = $("#autosave-status");
          if (statusEl) statusEl.textContent = "Đã lưu nháp " + nowTime();
        } catch (error) {
          var statusEl = $("#autosave-status");
          if (statusEl) statusEl.textContent = "Không lưu được nháp";
          console.warn(error);
        }
      }

      function loadDraft(code) {
        try {
          var raw = localStorage.getItem(draftKey(code));
          return raw ? JSON.parse(raw) : null;
        } catch (error) {
          return null;
        }
      }

      function syncMetadataToForm() {
        var codeEl = $("#exam-code");
        var titleEl = $("#exam-title-input");
        var durEl = $("#exam-duration");
        var statEl = $("#exam-status");

        if (codeEl) codeEl.value = exam.exam_code || "TSA001";
        if (titleEl) titleEl.value = exam.title || "";
        if (durEl) durEl.value = exam.duration_minutes || 45;
        if (statEl) statEl.value = exam.status || "draft";
      }

      function syncMetadataFromForm(allowCodeChange) {
        var codeEl = $("#exam-code");
        var titleEl = $("#exam-title-input");
        var durEl = $("#exam-duration");
        var statEl = $("#exam-status");

        var oldCode = exam.exam_code;
        var newCode = normalizeCode(codeEl ? codeEl.value : "");
        if (allowCodeChange !== false) exam.exam_code = newCode;
        else exam.exam_code = oldCode || newCode;

        if (titleEl) exam.title = titleEl.value.trim() || "Đề TSA";
        if (durEl) exam.duration_minutes = Number(durEl.value) || 45;
        if (statEl) exam.status = statEl.value || "draft";
      }

      function countAllQuestions() {
        var math = getSection("math").questions.length;
        var reading = getSection("reading").groups.reduce(function (sum, group) { return sum + (group.questions || []).length; }, 0);
        var science = getSection("science").groups.reduce(function (sum, group) { return sum + (group.questions || []).length; }, 0);
        return { math: math, reading: reading, science: science, total: math + reading + science };
      }

      function renderSummary() {
        ensureSchema();
        var counts = countAllQuestions();
        var summaryGrid = $("#summary-grid");
        if (summaryGrid) {
          summaryGrid.innerHTML =
            '<div class="summary-item"><span>Mã đề</span><strong>' + esc(exam.exam_code) + '</strong></div>' +
            '<div class="summary-item"><span>Toán</span><strong>' + counts.math + '/40</strong></div>' +
            '<div class="summary-item"><span>Đọc hiểu</span><strong>' + counts.reading + '</strong></div>' +
            '<div class="summary-item"><span>Khoa học</span><strong>' + counts.science + '</strong></div>';
        }
        var exportSummary = $("#export-summary");
        if (exportSummary) {
          exportSummary.innerHTML =
            '<div class="summary-item"><span>Trạng thái</span><strong>' + esc(exam.status) + '</strong></div>' +
            '<div class="summary-item"><span>Thời gian</span><strong>' + esc(exam.duration_minutes) + '</strong></div>' +
            '<div class="summary-item"><span>Tổng câu</span><strong>' + counts.total + '</strong></div>' +
            '<div class="summary-item"><span>File đề</span><strong>' + esc(exam.exam_code) + '.json</strong></div>';
        }
      }

      function moveGroupTabsToTopbar(tab) {
        var container = document.getElementById("topbar-group-tabs-container");
        if (!container) return;
        container.innerHTML = "";
        if (tab === "reading") {
          var nav = document.querySelector("#tab-reading .reading-tabs-nav") || document.querySelector(".reading-tabs-nav");
          if (nav) {
            container.appendChild(nav);
            container.style.display = "block";
          } else {
            container.style.display = "none";
          }
        } else if (tab === "science") {
          var nav = document.querySelector("#tab-science .science-tabs-nav") || document.querySelector(".science-tabs-nav");
          if (nav) {
            container.appendChild(nav);
            container.style.display = "block";
          } else {
            container.style.display = "none";
          }
        } else {
          container.style.display = "none";
        }
      }

      function restoreGroupTabsToPanels() {
        var container = document.getElementById("topbar-group-tabs-container");
        if (container) container.style.display = "none";

        var readingNav = document.querySelector("#topbar-group-tabs-container .reading-tabs-nav");
        if (readingNav) {
          var readingPanel = document.getElementById("tab-reading");
          if (readingPanel) {
            readingPanel.insertBefore(readingNav, readingPanel.firstChild);
          }
        }
        var scienceNav = document.querySelector("#topbar-group-tabs-container .science-tabs-nav");
        if (scienceNav) {
          var sciencePanel = document.getElementById("tab-science");
          if (sciencePanel) {
            sciencePanel.insertBefore(scienceNav, sciencePanel.firstChild);
          }
        }
      }

      function switchEditorTab(tab) {
        restoreGroupTabsToPanels();
        activeEditorTab = tab;
        // Update navigation UI
        document.querySelectorAll("#sidebar-editor-nav .editor-step, #sidebar-editor-nav .nav-button").forEach(function (button) {
          button.classList.toggle("active", button.getAttribute("data-editor-tab-target") === tab);
        });
        
        // Show correct panel inside editor view
        document.querySelectorAll("#editor-container .tab-panel").forEach(function (panel) {
          panel.classList.toggle("active", panel.id === "tab-" + tab);
        });

        var titles = {
          setup: "Tạo đề",
          math: "Soạn phần Toán",
          reading: "Soạn phần Đọc hiểu",
          science: "Soạn phần Khoa học",
          export: "Lưu và xuất đề"
        };
        $("#page-title").textContent = titles[tab] || "Bộ soạn đề TSA";

        // Hide/show topbar title/subtitle, autosave, and summary grid on math, reading, science tabs
        var isSubjectTab = (tab === "math" || tab === "reading" || tab === "science");
        var titleWrapper = document.getElementById("topbar-title-wrapper");
        var editorControls = document.getElementById("topbar-editor-controls");
        var autosaveStatus = document.getElementById("autosave-status");
        var summaryGrid = document.getElementById("summary-grid");
        var topbar = document.querySelector("#editor-container .topbar");

        if (isSubjectTab) {
          if (titleWrapper) titleWrapper.style.display = "none";
          if (editorControls) editorControls.style.display = "flex";
          if (autosaveStatus) autosaveStatus.style.display = "none";
          if (summaryGrid) summaryGrid.style.display = "none";
          if (topbar) {
            topbar.style.marginBottom = (tab === "math") ? "12px" : "0px";
            topbar.style.paddingBottom = "0px";
          }
          updateTopbarQNo();
        } else {
          if (titleWrapper) titleWrapper.style.display = "block";
          if (editorControls) editorControls.style.display = "none";
          if (autosaveStatus) autosaveStatus.style.display = "block";
          if (summaryGrid) summaryGrid.style.display = "grid";
          if (topbar) {
            topbar.style.marginBottom = "18px";
            topbar.style.paddingBottom = "";
          }
        }

        var previewBtn = document.getElementById("header-preview-btn");
        if (previewBtn) {
          if (tab === "math") {
            previewBtn.style.display = "none";
          } else {
            previewBtn.style.display = "block";
          }
        }

        renderAll();
        moveGroupTabsToTopbar(tab);
      }

      // Expose to window for clicks
      window.switchEditorTab = switchEditorTab;

      function defaultQuestion(sectionId) {
        return {
          question_no: nextQuestionNo(sectionId),
          question_type: "single_choice",
          question: "",
          image_url: "",
          options: [
            { key: "A", text: "" },
            { key: "B", text: "" },
            { key: "C", text: "" },
            { key: "D", text: "" }
          ],
          correct_answer: "A",
          explanation: "",
          points: 1
        };
      }

      function nextQuestionNo(sectionId) {
        if (sectionId === "math") {
          var mathQs = getSection("math").questions;
          return mathQs.length ? Math.max.apply(null, mathQs.map(function (q) { return Number(q.question_no) || 0; })) + 1 : 1;
        }
        var group = getActiveGroup(sectionId);
        var list = group ? (group.questions || []) : [];
        return list.length ? Math.max.apply(null, list.map(function (q) { return Number(q.question_no) || 0; })) + 1 : 1;
      }

      function getQuestionDraft(sectionId) {
        if (sectionId === "math") {
          ensureSchema();
          if (!editingQuestion["math"] || editingQuestion["math"].index !== activeMathQuestionNo - 1) {
            var mathQs = getSection("math").questions;
            var q = clone(mathQs[activeMathQuestionNo - 1]);
            q.question_no = activeMathQuestionNo; // always align displayed number with slot
            editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: q };
          }
        } else if (sectionId === "reading" || sectionId === "science") {
          ensureSchema();
          var gId = activeGroupIds[sectionId] || "g1";
          if (!editingQuestion[sectionId] || editingQuestion[sectionId].index === -1) {
            var sec = getSection(sectionId);
            var group = sec.groups.find(function(g) { return g.group_id === gId; });
            var q = group && group.questions && group.questions[0] ? clone(group.questions[0]) : defaultQuestion(sectionId);
            editingQuestion[sectionId] = { index: 0, question: q };
          }
        } else {
          if (!editingQuestion[sectionId]) editingQuestion[sectionId] = { index: -1, question: defaultQuestion(sectionId) };
        }
        return editingQuestion[sectionId].question;
      }

      function resetQuestion(sectionId) {
        editingQuestion[sectionId] = { index: -1, question: defaultQuestion(sectionId) };
        renderQuestionForm(sectionId);
        updatePreview(sectionId);
      }

      function switchQuestionType(sectionId, type) {
        var current = collectBaseQuestion(sectionId, false);
        current.question_type = type;
        applyTypeDefaults(current);
        editingQuestion[sectionId].question = current;
        renderQuestionForm(sectionId);
        updatePreview(sectionId);
      }
      window.switchQuestionType = switchQuestionType;

      function typeTabsHtml(sectionId, selected) {
        var icons = {
          single_choice: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
          single_choice_2: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
          multiple_choice: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
          true_false: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
          fill_blank: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m14 4 4 4"/><path d="M21.5 2.5a2.12 2.12 0 0 1 0 3l-12 12-4 1-1-4 12-12a2.12 2.12 0 0 1 3 0Z"/><path d="M3 22h18"/></svg>',
          drag_drop: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/></svg>'
        };

        return QUESTION_TYPES.map(function (item) {
          var isActive = selected === item[0];
          var icon = icons[item[0]] || "";
          return '<button type="button" class="q-type-tab-btn' + (isActive ? ' active' : '') + '" data-value="' + item[0] + '" onclick="switchQuestionType(\'' + sectionId + '\', \'' + item[0] + '\')">' + icon + '<span>' + item[1] + '</span></button>';
        }).join("");
      }

      function renderQuestionForm(sectionId) {
        var q = getQuestionDraft(sectionId);
        var form = $("#" + sectionId + "-question-form");
        if (!form) return;
        updateTopbarQNo();
        form.innerHTML =
          '<div class="form-grid" style="grid-template-columns: 1fr; gap: 10px; align-items: center; margin-bottom: 8px;">' +
            '<input type="hidden" id="' + sectionId + '-q-no" value="' + attr(q.question_no || 1) + '">' +
            '<input type="hidden" id="' + sectionId + '-q-type" value="' + attr(q.question_type) + '">' +

            // Editor View Wrapper
            '<div id="' + sectionId + '-editor-view" style="width: 100%; display: flex; flex-direction: column; gap: 20px;">' +
              // Row 2: Question Type tabs
              '<div class="q-type-tabs-nav" style="width: 100%; margin-bottom: 8px;">' +
                typeTabsHtml(sectionId, q.question_type) +
              '</div>' +
              // Inputs
              '<div class="field full"><label>Nội dung câu hỏi</label><textarea class="textarea" id="' + sectionId + '-q-text" placeholder="Nhập nội dung câu hỏi">' + esc(q.question || "") + '</textarea></div>' +
              '<div class="field full" style="display: ' + (sectionId === "reading" ? 'none' : 'grid') + '; grid-template-columns: 360px 180px 1fr; gap: 10px; align-items: end; margin-bottom: 0;">' +
                '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Đường dẫn ảnh nếu có</label><input class="input" id="' + sectionId + '-q-image" value="' + attr(q.image_url || "") + '" placeholder="https://assets.tmastudy.io.vn/assets/questions/' + attr(exam.exam_code) + '/cau-01.webp"></div>' +
                '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Kích thước ảnh: <span id="' + sectionId + '-q-image-width-val">' + (q.image_width || 100) + '</span>%</label>' +
                  '<input type="range" class="slider" id="' + sectionId + '-q-image-width" min="10" max="100" value="' + (q.image_width || 100) + '" style="width: 100%; display: block; height: 28px; margin: 0; padding: 0; cursor: pointer;">' +
                '</div>' +
              '</div>' +
              '<div class="field full" id="' + sectionId + '-type-fields" style="width: 100%;"></div>' +
              '<div class="field full"><label>Giải thích lời giải</label><textarea class="textarea" id="' + sectionId + '-q-explanation">' + esc(q.explanation || "") + '</textarea></div>' +
            '</div>' +

            // Preview View Wrapper
            '<div id="' + sectionId + '-preview-view" style="display: none; width: 100%;">' +
              (sectionId === "math"
                ? ('<div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">' +
                    '<div class="question-card" style="width: 100%; box-sizing: border-box;">' +
                      '<div class="question-layout-row" style="width: 100%;">' +
                        '<div class="question-number-circle" id="' + sectionId + '-preview-qno-circle">' + attr(q.question_no || 1) + '</div>' +
                        '<div class="question-text-content" style="flex: 1; min-width: 0;">' +
                          '<div class="question-body" id="' + sectionId + '-preview-body" style="width: 100%; word-break: break-word;"></div>' +
                          '<div class="answer-area" id="' + sectionId + '-preview-answer" style="width: 100%;"></div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>')
                : ('<div style="display: grid; grid-template-columns: minmax(280px, 1fr) minmax(320px, 1fr); gap: 0; width: 100%; min-height: 480px; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff;">' +
                    '<div id="' + sectionId + '-preview-stimulus" style="overflow-y: auto; padding: 20px 24px; border-right: 1.5px solid var(--line); background: #f8fafc; line-height: 1.85;"></div>' +
                    '<div style="overflow-y: auto; padding: 20px 24px;">' +
                      '<div class="question-layout-row" style="width: 100%; align-items: flex-start;">' +
                        '<div class="question-number-circle" id="' + sectionId + '-preview-qno-circle">' + attr(q.question_no || 1) + '</div>' +
                        '<div class="question-text-content" style="flex: 1; min-width: 0;">' +
                          '<div class="question-body" id="' + sectionId + '-preview-body" style="width: 100%; word-break: break-word;"></div>' +
                          '<div class="answer-area" id="' + sectionId + '-preview-answer" style="width: 100%;"></div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>')
              ) +
            '</div>' +
          '</div>';
        renderTypeFields(sectionId, q);
        
        var slider = $("#" + sectionId + "-q-image-width");
        var indicator = $("#" + sectionId + "-q-image-width-val");
        if (slider && indicator) {
          slider.addEventListener("input", function () {
            indicator.textContent = this.value;
          });
        }

        $all("#" + sectionId + "-question-form input, #" + sectionId + "-question-form textarea, #" + sectionId + "-question-form select").forEach(function (input) {
          input.addEventListener("input", function () { updatePreview(sectionId); });
          input.addEventListener("change", function () { updatePreview(sectionId); });
        });

        var saveBtn = document.querySelector('button[data-save-question="' + sectionId + '"]');
        if (saveBtn) {
          if (sectionId === "reading") {
            saveBtn.textContent = "Lưu câu hỏi";
          } else {
            saveBtn.textContent = (editingQuestion[sectionId]?.index === -1) ? "Thêm vào ngữ liệu" : "Lưu câu hỏi";
          }
        }
      }

      function applyTypeDefaults(q) {
        if (q.question_type === "single_choice_2") {
          if (!Array.isArray(q.options) || q.options.length !== 2) {
            q.options = [{ key: "A", text: "Đúng" }, { key: "B", text: "Sai" }];
          }
        } else if (q.question_type === "single_choice" || q.question_type === "multiple_choice") {
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            q.options = [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }];
          }
        }
        if ((q.question_type === "single_choice" || q.question_type === "single_choice_2") && Array.isArray(q.correct_answer)) q.correct_answer = q.correct_answer[0] || "A";
        if (q.question_type === "multiple_choice" && !Array.isArray(q.correct_answer)) q.correct_answer = q.correct_answer ? [q.correct_answer] : [];
        if (q.question_type === "true_false") {
          q.statements = q.statements || [{ id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }, { id: "d", text: "" }];
          q.correct_answer = q.correct_answer && typeof q.correct_answer === "object" && !Array.isArray(q.correct_answer) ? q.correct_answer : { a: true, b: false, c: true, d: false };
        }
        if (q.question_type === "fill_blank") {
          q.correct_answer = typeof q.correct_answer === "string" ? q.correct_answer : "";
          q.accepted_answers = Array.isArray(q.accepted_answers) ? q.accepted_answers : [];
        }
        if (q.question_type === "numeric_answer") {
          q.correct_answer = Number.isFinite(Number(q.correct_answer)) ? Number(q.correct_answer) : 0;
          q.tolerance = Number.isFinite(Number(q.tolerance)) ? Number(q.tolerance) : 0;
        }
        if (q.question_type === "drag_drop") {
          q.body = Array.isArray(q.body) ? q.body : [{ type: "text", content: "Điền " }, { type: "blank", id: "b1" }, { type: "text", content: " vào chỗ trống." }];
          q.items = Array.isArray(q.items) ? q.items : [{ id: "i1", text: "đáp án" }];
          q.correct_answer = q.correct_answer && typeof q.correct_answer === "object" && !Array.isArray(q.correct_answer) ? q.correct_answer : { b1: "i1" };
        }
      }

      function optionByKey(options, key) {
        var found = (options || []).find(function (item) { return item.key === key; });
        return found ? found.text : "";
      }

      function renderChoicesForm(q, isMulti, sectionId) {
        var options = q.options || [];
        var ans = q.correct_answer || (isMulti ? [] : "A");
        var containerClass = isMulti ? "is-multiple-choice" : "is-single-choice";
        var optionsAreImages = q.options_are_images === true;
        
        var html = '<div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">' +
          '<input type="checkbox" id="' + sectionId + '-options-are-images" ' + (optionsAreImages ? 'checked' : '') + ' onchange="toggleTeacherOptionsAreImages(this, \'' + sectionId + '\')" style="width: 16px; height: 16px; cursor: pointer;">' +
          '<label for="' + sectionId + '-options-are-images" style="font-weight: bold; cursor: pointer; color: var(--text-dark); font-size: 13.5px;">Đáp án bằng hình ảnh (4 lựa chọn là ảnh)</label>' +
          '</div>';

        html += '<div class="choices-container ' + containerClass + '" style="display: flex; flex-direction: column; gap: 10px;">';
        options.forEach(function (opt) {
          var isSelected = false;
          if (isMulti) {
            isSelected = Array.isArray(ans) ? ans.includes(opt.key) : false;
          } else {
            isSelected = ans === opt.key;
          }
          var selectedClass = isSelected ? " is-selected" : "";
          var inputType = isMulti ? "checkbox" : "radio";
          var checkedAttr = isSelected ? " checked" : "";
          
          if (optionsAreImages) {
            html += '<div class="choice-item' + selectedClass + '" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff;">' +
              '<input type="' + inputType + '" name="choice-correct" value="' + opt.key + '"' + checkedAttr + ' style="display:none;">' +
              '<div class="choice-item-image-wrap" style="display: flex; flex-direction: column; gap: 6px; flex: 1;" onclick="event.stopPropagation();">' +
                '<div style="display: flex; gap: 8px; align-items: center; width: 100%;">' +
                  '<span style="font-weight: bold; color: var(--brand-red); min-width: 20px; font-size: 14px;">' + opt.key + '.</span>' +
                  '<input class="choice-input-field input" data-choice-key="' + opt.key + '" value="' + attr(opt.text || "") + '" placeholder="Dán link ảnh hoặc bấm nút Tải ảnh..." style="flex: 1; height: 36px; font-size: 13px; padding: 0 10px;" onchange="updateChoiceImagePreview(this)">' +
                  '<button type="button" class="btn btn-secondary btn-sm" style="height: 36px; padding: 0 12px; font-size: 12px; border-radius: 6px; font-weight: 600;" onclick="triggerChoiceImageUpload(this)">Tải ảnh</button>' +
                  '<input type="file" accept="image/*" class="choice-image-file-input" style="display: none;" onchange="handleChoiceImageUpload(this, \'' + opt.key + '\', \'' + sectionId + '\')">' +
                '</div>' +
                (opt.text ? '<img class="choice-image-preview" src="' + attr(opt.text) + '" style="max-height: 80px; width: auto; max-width: 150px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 6px;" />' : '') +
              '</div>' +
              '<div style="min-width: 80px; text-align: right; font-size: 13px; color: ' + (isSelected ? 'var(--brand-red)' : '#64748b') + '; font-weight: bold; cursor: pointer; user-select: none;" onclick="event.stopPropagation(); toggleTeacherChoiceSelection(this.parentElement, \'' + opt.key + '\', ' + isMulti + ')">' +
                (isSelected ? '✔️ Đúng' : 'Chọn đúng') +
              '</div>' +
              '</div>';
          } else {
            html += '<div class="choice-item' + selectedClass + '" onclick="toggleTeacherChoiceSelection(this, \'' + opt.key + '\', ' + isMulti + ')">' +
              '<input type="' + inputType + '" name="choice-correct" value="' + opt.key + '"' + checkedAttr + ' style="display:none;">' +
              '<span style="font-weight: bold; color: var(--brand-red); min-width: 20px; font-size: 14px; margin-right: 6px;">' + opt.key + '.</span>' +
              '<input class="choice-input-field" data-choice-key="' + opt.key + '" value="' + attr(opt.text || "") + '" placeholder="Nhập đáp án..." onclick="event.stopPropagation();" style="flex:1;">' +
              '</div>';
          }
        });
        html += '</div>';
        return html;
      }

      function renderNumericForm(q) {
        return '<div class="form-grid">' +
          '<div class="field"><label>Đáp án số chính xác</label><input class="input" type="number" step="any" id="num-answer" value="' + attr(q.correct_answer || "") + '" placeholder="Nhập đáp án số"></div>' +
          '<div class="field"><label>Sai số cho phép (Tolerance)</label><input class="input" type="number" step="any" id="num-tolerance" value="' + attr(q.tolerance || 0) + '" placeholder="Ví dụ: 0.01"></div>' +
          '</div>';
      }

      function renderTrueFalseForm(q, sectionId) {
        var list = q.statements || [];
        var ans = q.correct_answer || {};
        
        var html = '<div class="statement-header-outside">';
        html += '<div></div>';
        html += '<div class="statement-header-label">Đúng</div>';
        html += '<div class="statement-header-label">Sai</div>';
        html += '<div></div>';
        html += '</div>';

        html += '<div class="statement-table">';
        list.forEach(function (item) {
          var id = item.id;
          var textVal = item.text || "";
          var isTrue = ans[id] === true;
          var isFalse = ans[id] === false;
          
          var trueActive = isTrue ? " is-active" : "";
          var falseActive = isFalse ? " is-active" : "";

          html +=
            '<div class="statement-row">' +
            '<div class="statement-cell-text"><input class="input-inline-editor" data-tf-id="' + id + '" value="' + attr(textVal) + '" placeholder="Nhập nhận định..."></div>' +
            '<div class="statement-cell-btn">' +
            '<button type="button" class="statement-btn' + trueActive + '" onclick="toggleTeacherTfSelection(\'' + id + '\', true, this)"></button>' +
            '<input type="radio" name="tf-correct-' + id + '" value="T"' + (isTrue ? " checked" : "") + ' style="display:none;">' +
            '</div>' +
            '<div class="statement-cell-btn">' +
            '<button type="button" class="statement-btn' + falseActive + '" onclick="toggleTeacherTfSelection(\'' + id + '\', false, this)"></button>' +
            '<input type="radio" name="tf-correct-' + id + '" value="F"' + (isFalse ? " checked" : "") + ' style="display:none;">' +
            '</div>' +
            '<div class="statement-cell-btn">' +
             '<button type="button" style="background: none; border: none; color: #b91c1c; font-weight: 700; font-size: 13.5px; cursor: pointer; padding: 0; margin: 0; display: inline-flex; align-items: center; justify-content: center;" onclick="removeTfStatement(\'' + sectionId + '\', \'' + id + '\')">Xóa</button>' +
            '</div>' +
            '</div>';
        });
        html += '</div>';
        html += '<button type="button" class="btn btn-outline" style="margin-top: 6px; font-weight: 700; min-height: 24px; height: 24px; padding: 0 8px; font-size: 11px; border-radius: 6px;" onclick="addTfStatement(\'' + sectionId + '\')">+ Thêm nhận định</button>';
        return html;
      }

      function renderTypeFields(sectionId, q) {
        var box = $("#" + sectionId + "-type-fields");
        var type = q.question_type || "single_choice";
        if (!box) return;
        box.innerHTML = "";
        if (type === "single_choice" || type === "single_choice_2" || type === "multiple_choice") {
          box.innerHTML = renderChoicesForm(q, type === "multiple_choice", sectionId);
        } else if (type === "true_false") {
          box.innerHTML = renderTrueFalseForm(q, sectionId);
        } else if (type === "fill_blank") {
          box.innerHTML = renderShortAnswerForm(q);
        } else if (type === "numeric_answer") {
          box.innerHTML = renderNumericForm(q);
        } else if (type === "drag_drop") {
          box.innerHTML = renderDragDropForm(q);
        }
      }

      function addTfStatement(sectionId) {
        var q = getQuestionDraft(sectionId);
        if (!Array.isArray(q.statements)) q.statements = [];
        
        var nextIdNum = q.statements.length + 1;
        var nextId = "s" + nextIdNum;
        while (q.statements.some(function(s) { return s.id === nextId; })) {
          nextIdNum++;
          nextId = "s" + nextIdNum;
        }

        q.statements.push({ id: nextId, text: "" });
        if (!q.correct_answer || typeof q.correct_answer !== "object") q.correct_answer = {};
        q.correct_answer[nextId] = true;

        renderQuestionForm(sectionId);
        updatePreview(sectionId);
      }
      window.addTfStatement = addTfStatement;

      function removeTfStatement(sectionId, id) {
        var q = getQuestionDraft(sectionId);
        if (!Array.isArray(q.statements)) return;
        q.statements = q.statements.filter(function(s) { return s.id !== id; });
        if (q.correct_answer && typeof q.correct_answer === "object") {
          delete q.correct_answer[id];
        }
        renderQuestionForm(sectionId);
        updatePreview(sectionId);
      }
      window.removeTfStatement = removeTfStatement;

      function renderShortAnswerForm(q) {
        var accepts = Array.isArray(q.accepted_answers) ? q.accepted_answers.join(" | ") : "";
        return '<div class="form-grid">' +
          '<div class="field"><label>Đáp án chính xác</label><input class="input" id="fill-correct" value="' + attr(q.correct_answer || "") + '" placeholder="Đáp án viết thường hoặc hoa đều chấp nhận"></div>' +
          '<div class="field"><label>Các đáp án đồng nghĩa khác (Ngăn cách bởi dấu |)</label><input class="input" id="fill-accepted" value="' + attr(accepts) + '" placeholder="ví dụ: 0.5 | 1/2"></div>' +
          '</div>';
      }

      function renderDragDropForm(q) {
        var itemsVal = (q.items || []).map(function (it) { return it.text; }).join(" | ");
        var bodyVal = (q.body || []).map(function (block) {
          return block.type === "blank" ? "[" + block.id + "]" : block.content;
        }).join("");
        var corrVal = Object.keys(q.correct_answer || {}).map(function (k) { return k + "=" + q.correct_answer[k]; }).join(" | ");
        return '<div style="display:grid;gap:10px;">' +
          '<div class="field"><label>Các nhãn thẻ kéo (Ngăn cách bởi dấu |)</label><input class="input" id="drag-items" value="' + attr(itemsVal) + '" placeholder="nhãn 1 | nhãn 2"></div>' +
          '<div class="field"><label>Nội dung chứa ô trống. Dùng [o1], [o2] làm vị trí ô trống.</label><textarea class="textarea" id="drag-body" style="min-height: 100px;" placeholder="Ví dụ: Ban đầu: [o1] | Lúc sau: [o2]">' + esc(bodyVal) + '</textarea></div>' +
          '<div class="field"><label>Đáp án đúng từng ô (Dạng: o1=nhãn1 | o2=nhãn2)</label><input class="input" id="drag-correct" value="' + attr(corrVal) + '" placeholder="Ví dụ: o1=5 | o2=8"></div>' +
          '</div>';
      }

      function collectBaseQuestion(sectionId, doValidation) {
        var base = {
          question_no: Number($("#" + sectionId + "-q-no")?.value) || nextQuestionNo(sectionId),
          question_type: $("#" + sectionId + "-q-type")?.value || "single_choice",
          question: $("#" + sectionId + "-q-text")?.value || "",
          image_url: $("#" + sectionId + "-q-image")?.value || "",
          image_width: Number($("#" + sectionId + "-q-image-width")?.value) || 100,
          explanation: $("#" + sectionId + "-q-explanation")?.value || "",
          points: 1
        };
        var type = base.question_type;
        if (type === "single_choice" || type === "single_choice_2" || type === "multiple_choice") {
          var opts = [];
          $all("#" + sectionId + "-type-fields input[data-choice-key]").forEach(function (input) {
            opts.push({ key: input.getAttribute("data-choice-key"), text: input.value.trim() });
          });
          base.options = opts;
          var isImageOpts = $("#" + sectionId + "-type-fields #" + sectionId + "-options-are-images")?.checked || false;
          base.options_are_images = isImageOpts;
          if (type === "single_choice" || type === "single_choice_2") {
            var checkedRadio = $("#"+sectionId+"-type-fields input[name='choice-correct']:checked");
            base.correct_answer = checkedRadio ? checkedRadio.value : "A";
          } else {
            var corrects = [];
            $all("#" + sectionId + "-type-fields input[name='choice-correct']:checked").forEach(function (cb) {
              corrects.push(cb.value);
            });
            base.correct_answer = corrects;
          }
        } else if (type === "true_false") {
          var statements = [];
          var correct_answer = {};
          $all("#" + sectionId + "-type-fields input[data-tf-id]").forEach(function (input) {
            var id = input.getAttribute("data-tf-id");
            statements.push({ id: id, text: input.value.trim() });
            var correctRadio = $("#"+sectionId+"-type-fields input[name='tf-correct-" + id + "']:checked");
            correct_answer[id] = correctRadio ? (correctRadio.value === "T") : true;
          });
          base.statements = statements;
          base.correct_answer = correct_answer;
        } else if (type === "fill_blank") {
          base.correct_answer = ($("#fill-correct")?.value || "").trim();
          var accs = ($("#fill-accepted")?.value || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean);
          base.accepted_answers = accs;
        } else if (type === "numeric_answer") {
          base.correct_answer = Number($("#num-answer")?.value) || 0;
          base.tolerance = Number($("#num-tolerance")?.value) || 0;
        } else if (type === "drag_drop") {
          var rawItems = ($("#drag-items")?.value || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean);
          var items = rawItems.map(function (text, index) { return { id: "item" + (index + 1), text: text }; });
          base.items = items;

          var bodyStr = $("#drag-body")?.value || "";
          var bodyBlocks = [];
          var lastIdx = 0;
          var regex = /\[(o\d+)\]/g;
          var match;
          while ((match = regex.exec(bodyStr)) !== null) {
            var textBefore = bodyStr.substring(lastIdx, match.index);
            if (textBefore) bodyBlocks.push({ type: "text", content: textBefore });
            bodyBlocks.push({ type: "blank", id: match[1] });
            lastIdx = regex.lastIndex;
          }
          var textAfter = bodyStr.substring(lastIdx);
          if (textAfter) bodyBlocks.push({ type: "text", content: textAfter });
          base.body = bodyBlocks;

          var correct_answer = {};
          var corrStr = $("#drag-correct")?.value || "";
          corrStr.split("|").forEach(function (pair) {
            var parts = pair.split("=");
            if (parts.length === 2) {
              var blankId = parts[0].trim();
              var matchText = parts[1].trim();
              var foundItem = items.find(function (it) { return it.text === matchText; });
              correct_answer[blankId] = foundItem ? foundItem.id : matchText;
            }
          });
          base.correct_answer = correct_answer;
        }
        return base;
      }

      function saveQuestion(sectionId) {
        var base = collectBaseQuestion(sectionId, true);
        ensureSchema();
        var targetSection = getSection(sectionId);
        var qList = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);
        if (sectionId !== "math" && !getActiveGroup(sectionId)) {
          window.alert("Vui lòng tạo hoặc chọn một Ngữ liệu trước.");
          return;
        }

        var idx = editingQuestion[sectionId].index;
        if (idx === -1) {
          qList.push(base);
        } else {
          qList[idx] = base;
        }
        saveDraft();
        if (sectionId === "reading" || sectionId === "science") {
          editingQuestion[sectionId].question = clone(base);
          window.alert("Đã lưu câu hỏi " + base.question_no + " thành công!");
        } else {
          resetQuestion(sectionId);
        }
        renderAll();
      }

      function renderMathWizardNav() {
        var grid = $("#math-wizard-grid");
        if (!grid) return;
        grid.innerHTML = "";
        
        ensureSchema();
        var mathSec = getSection("math");
        var questions = mathSec.questions || [];
        
        var editedCount = 0;
        for (var i = 1; i <= 40; i++) {
          var q = questions.find(function(item) { return (Number(item.question_no) || 0) === i; });
          var isFilled = false;
          if (q) {
            var qText = (q.question || "").trim();
            var hasImage = (q.image_url || "").trim() !== "";
            var hasText = qText !== "" && qText !== ("Nội dung câu hỏi " + i + " chưa được nhập.");
            var hasOptions = false;
            if (Array.isArray(q.options)) {
              hasOptions = q.options.some(function (opt) {
                var oText = (opt.text || "").trim();
                return oText !== "" && oText !== "Đáp án A" && oText !== "Đáp án B" && oText !== "Đáp án C" && oText !== "Đáp án D";
              });
            }
            if (hasText || hasImage || hasOptions) {
              isFilled = true;
            }
          }
          if (isFilled) {
            editedCount++;
          }
          
          var isActive = i === activeMathQuestionNo;
          
          var styleStr = "display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; padding: 0;";
          if (isFilled) {
            styleStr += " background: var(--brand); border: 1.5px solid var(--brand-dark); color: #fff;";
          } else {
            styleStr += " background: #fff; border: 1.5px solid var(--line); color: var(--muted);";
          }
          if (isActive) {
            styleStr += " box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--brand); z-index: 1; font-weight: 800;";
          }
          
          var btnHtml = '<button type="button" style="' + styleStr + '" onclick="selectMathWizardQuestion(' + i + ')">' + i + '</button>';
          grid.innerHTML += btnHtml;
        }
        
        var progressEl = $("#math-wizard-progress");
        if (progressEl) {
          progressEl.textContent = "Tiến độ: " + editedCount + "/40 câu đã soạn";
        }
        
        var prevBtn = $("#math-wizard-prev");
        var nextBtn = $("#math-wizard-save-next");
        var navNextBtn = $("#math-wizard-next");
        if (prevBtn) {
          prevBtn.disabled = (activeMathQuestionNo === 1);
        }
        if (navNextBtn) {
          navNextBtn.disabled = (activeMathQuestionNo === 40);
        }
        if (nextBtn) {
          if (activeMathQuestionNo === 40) {
            nextBtn.textContent = "Lưu câu cuối cùng";
          } else {
            nextBtn.textContent = "Lưu & Câu tiếp →";
          }
        }
      }
      window.renderMathWizardNav = renderMathWizardNav;

      function selectMathWizardQuestion(qNo) {
        if (qNo < 1 || qNo > 40) return;
        
        // Auto-save current draft before switching
        if (editingQuestion["math"]) {
          var currentVal = collectBaseQuestion("math", false);
          currentVal.question_no = activeMathQuestionNo; // always keep question_no correct
          ensureSchema();
          var mathSec2 = getSection("math");
          mathSec2.questions[activeMathQuestionNo - 1] = currentVal;
          saveDraft();
        }
        
        activeMathQuestionNo = qNo;
        ensureSchema();
        var mathSec = getSection("math");
        // Load by array slot (ensureSchema ensures 40 items), then force question_no to match slot
        var targetQ = clone(mathSec.questions[activeMathQuestionNo - 1]);
        targetQ.question_no = activeMathQuestionNo; // always correct the displayed number
        
        editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: targetQ };
        renderQuestionForm("math");
        renderMathWizardNav();
        setEditorRoleView("math", "teacher");
        
        var form = $("#math-question-form");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      window.selectMathWizardQuestion = selectMathWizardQuestion;

      function navigateMathWizard(dir) {
        var targetQNo = activeMathQuestionNo + dir;
        if (targetQNo >= 1 && targetQNo <= 40) {
          selectMathWizardQuestion(targetQNo);
        }
      }
      window.navigateMathWizard = navigateMathWizard;

      function saveMathWizardQuestion(goToNext) {
        ensureSchema();
        var base = collectBaseQuestion("math", true);
        base.question_no = activeMathQuestionNo; // always keep question_no aligned with slot
        var targetSection = getSection("math");
        
        targetSection.questions[activeMathQuestionNo - 1] = base;
        
        saveDraft();
        renderMathWizardNav();
        
        if (goToNext && activeMathQuestionNo < 40) {
          selectMathWizardQuestion(activeMathQuestionNo + 1);
        } else {
          editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: clone(base) };
          renderQuestionForm("math");
          window.alert("Đã lưu câu hỏi " + activeMathQuestionNo + " thành công!");
        }
      }
      window.saveMathWizardQuestion = saveMathWizardQuestion;

      function editQuestion(sectionId, index) {
        ensureSchema();
        var targetSection = getSection(sectionId);
        var qList = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);
        var q = clone(qList[index]);
        if (!q) return;

        editingQuestion[sectionId] = { index: index, question: q };
        renderQuestionForm(sectionId);
        setEditorRoleView(sectionId, "teacher");
        updatePreview(sectionId);
        
        var form = $("#" + sectionId + "-question-form");
        if (form) form.scrollIntoView({ behavior: "smooth" });
      }

      async function deleteQuestion(sectionId, index) {
        if (!await showCustomConfirm("Bạn chắc chắn muốn xóa câu hỏi này?")) return;
        ensureSchema();
        var targetSection = getSection(sectionId);
        var qList = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);
        qList.splice(index, 1);
        saveDraft();
        renderAll();
      }

      async function clearAllQuestions(sectionId) {
        if (!await showCustomConfirm("Bạn có chắc chắn muốn xóa TOÀN BỘ câu hỏi của phần này? Hành động này không thể hoàn tác.")) return;
        ensureSchema();
        var targetSection = getSection(sectionId);
        if (sectionId === "math") {
          targetSection.questions = [];
          activeMathQuestionNo = 1;
          editingQuestion["math"] = null;
        } else {
          var group = getActiveGroup(sectionId);
          if (group) {
            group.questions = [];
          }
        }
        saveDraft();
        renderAll();
      }
      window.clearAllQuestions = clearAllQuestions;

      async function clearSectionContent(sectionId) {
        var label = sectionId === "math" ? "Toán" : (sectionId === "reading" ? "Đọc hiểu" : "Khoa học");
        if (!await showCustomConfirm("Bạn có chắc chắn muốn xóa SẠCH TOÀN BỘ nội dung (bao gồm đề bài, đoạn văn ngữ liệu, tất cả câu hỏi và đáp án) của phần " + label + " không? Hành động này sẽ đưa phần " + label + " về trạng thái trống ban đầu và không thể hoàn tác!")) {
          return;
        }
        ensureSchema();
        if (sectionId === "math") {
          var targetSection = getSection("math");
          targetSection.questions = [];
          activeMathQuestionNo = 1;
          editingQuestion["math"] = null;
        } else {
          var targetSection = getSection(sectionId);
          targetSection.groups = [];
          if (sectionId === "reading") {
            activeReadingGroupIdx = 0;
            activeReadingQuestionNo = 1;
            editingQuestion["reading"] = null;
          } else if (sectionId === "science") {
            activeScienceGroupIdx = 0;
            activeScienceQuestionNo = 1;
            editingQuestion["science"] = null;
          }
        }
        ensureSchema();
        saveDraft();
        renderAll();
      }
      window.clearSectionContent = clearSectionContent;

      function cloneQuestion(sectionId, index) {
        ensureSchema();
        var targetSection = getSection(sectionId);
        var qList = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);
        var original = qList[index];
        if (!original) return;

        var copied = clone(original);
        copied.question_no = nextQuestionNo(sectionId);
        qList.push(copied);
        saveDraft();
        renderAll();
      }

      // Group / Passage functions
      function getActiveGroup(sectionId) {
        var section = getSection(sectionId);
        if (!section || !Array.isArray(section.groups)) return null;
        var activeId = activeGroupIds[sectionId];
        if (!activeId) {
          if (section.groups.length) {
            activeGroupIds[sectionId] = section.groups[0].group_id;
            return section.groups[0];
          }
          return null;
        }
        return section.groups.find(function (g) { return g.group_id === activeId; }) || null;
      }

      function newGroup(sectionId) {
        var newId = "group_" + Date.now();
        var groupObj = {
          group_id: newId,
          title: "",
          stimulus: {
            type: "text",
            content: "",
            image_url: ""
          },
          questions: []
        };
        ensureSchema();
        getSection(sectionId).groups.push(groupObj);
        activeGroupIds[sectionId] = newId;
        saveDraft();
        renderAll();
      }

      function saveGroup(sectionId) {
        var group = getActiveGroup(sectionId);
        if (!group) return;
        var titleInp = $("#" + sectionId + "-g-title");
        var textInp = $("#" + sectionId + "-g-text");
        var imgInp = $("#" + sectionId + "-g-image");
        var imgWidthInp = $("#" + sectionId + "-g-image-width");

        if (titleInp) group.title = titleInp.value.trim() || "Chủ đề ngữ liệu";
        if (!group.stimulus) group.stimulus = {};
        if (textInp) group.stimulus.content = textInp.value || "";
        if (imgInp) group.stimulus.image_url = imgInp.value.trim() || "";
        if (imgWidthInp) group.stimulus.image_width = Number(imgWidthInp.value) || 100;

        saveDraft();
        renderAll();
        window.alert("Đã lưu nội dung ngữ liệu bên trái.");
      }

      function selectGroup(sectionId, id) {
        activeGroupIds[sectionId] = id;
        resetQuestion(sectionId);
        renderAll();
      }

      async function deleteGroup(sectionId, id) {
        if (!await showCustomConfirm("Xóa ngữ liệu này sẽ xóa TOÀN BỘ các câu hỏi đi kèm bên trong. Bạn chắc chắn?")) return;
        var section = getSection(sectionId);
        var idx = section.groups.findIndex(function (g) { return g.group_id === id; });
        if (idx !== -1) {
          section.groups.splice(idx, 1);
          if (activeGroupIds[sectionId] === id) activeGroupIds[sectionId] = "";
          saveDraft();
          resetQuestion(sectionId);
          renderAll();
        }
      }

      function renderAll() {
        renderSummary();
        if (activeEditorTab === "reading") {
          updateReadingTabsUI();
        }
        if (activeEditorTab === "science") {
          updateScienceTabsUI();
        }
        ["math", "reading", "science"].forEach(function (sectionId) {
          if (activeEditorTab === sectionId) {
            if (sectionId === "math") {
              ensureSchema();
              if (!editingQuestion["math"] || editingQuestion["math"].index !== activeMathQuestionNo - 1) {
                var mathQs = getSection("math").questions;
                editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: clone(mathQs[activeMathQuestionNo - 1]) };
              }
              renderQuestionForm("math");
              renderMathWizardNav();
            } else {
              renderQuestionForm(sectionId);
              renderQuestionList(sectionId);
              renderGroupList(sectionId);
              renderActiveGroupDetails(sectionId);
              renderSubjectWizardNav(sectionId);
            }
            updatePreview(sectionId);
          }
        });
      }

      function renderImportGroups() {
        var select = $("#import-group");
        if (!select) return;
        var secId = $("#import-section").value;
        select.innerHTML = "";
        if (secId === "math") {
          select.innerHTML = '<option value="">Không dùng ngữ liệu (Mặc định phần Toán)</option>';
          return;
        }
        ensureSchema();
        var groups = getSection(secId).groups || [];
        if (!groups.length) {
          select.innerHTML = '<option value="">(Chưa có ngữ liệu nào, hãy sang tab ' + (secId === "reading" ? "Đọc hiểu" : "Khoa học") + ' tạo trước)</option>';
          return;
        }
        select.innerHTML = groups.map(function (g) {
          return '<option value="' + g.group_id + '">' + esc(g.title) + '</option>';
        }).join("");
      }

      function renderQuestionList(sectionId) {
        var tbody = $("#" + sectionId + "-question-list");
        if (!tbody) return;
        tbody.innerHTML = "";
        ensureSchema();

        if (sectionId === "reading") {
          var readingSec = getSection("reading");
          var gId = activeGroupIds["reading"] || "g1";
          var group = readingSec.groups.find(function(g) { return g.group_id === gId; });
          var numberLabel = gId === "g1" ? "1" : "2";
          var rangeLabel = gId === "g1" ? "Câu 1 - 10" : "Câu 11 - 20";
          
          var html = "";
          
          html += '<tr><td colspan="4" style="background: #f8fafc; font-weight: 700; color: var(--brand); padding: 8px 12px; border-bottom: 1.5px solid var(--line);">Ngữ liệu ' + numberLabel + ' (' + rangeLabel + ')</td></tr>';
          var gList = group ? (group.questions || []) : [];
          if (!gList.length) {
            html += '<tr><td colspan="4" class="empty">Chưa có câu hỏi nào cho Ngữ liệu ' + numberLabel + '.</td></tr>';
          } else {
            html += gList.map(function (q, index) {
              var label = (QUESTION_TYPES.find(function (t) { return t[0] === q.question_type; }) || ["", "Khác"])[1];
              var isActive = editingQuestion["reading"]?.index === index;
              return '<tr class="' + (isActive ? 'table-row-active' : '') + '">' +
                '<td class="table-main" style="text-align:center;">' + q.question_no + '</td>' +
                '<td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(q.question || "Nội dung trống") + '</td>' +
                '<td><span class="status type">' + label + '</span></td>' +
                '<td><div class="actions">' +
                '<button class="btn btn-small btn-outline" onclick="editReadingQuestion(\'' + gId + '\', ' + index + ')">Sửa</button>' +
                '</div></td>' +
                '</tr>';
            }).join("");
          }
          
          tbody.innerHTML = html;
          return;
        }

        var targetSection = getSection(sectionId);
        var list = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);

        if (!list.length) {
          tbody.innerHTML = '<tr><td colspan="4" class="empty">Chưa có câu hỏi nào được thêm.</td></tr>';
          return;
        }

        tbody.innerHTML = list.map(function (q, index) {
          var label = (QUESTION_TYPES.find(function (t) { return t[0] === q.question_type; }) || ["", "Khác"])[1];
          return '<tr>' +
            '<td class="table-main" style="text-align:center;">' + q.question_no + '</td>' +
            '<td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(q.question) + '</td>' +
            '<td><span class="status type">' + label + '</span></td>' +
            '<td><div class="actions">' +
            '<button class="btn btn-small btn-outline" data-edit-question="' + sectionId + '" data-index="' + index + '">Sửa</button>' +
            '<button class="btn btn-small btn-outline" data-clone-question="' + sectionId + '" data-index="' + index + '">Nhân bản</button>' +
            '<button class="btn btn-small btn-danger" data-delete-question="' + sectionId + '" data-index="' + index + '">Xóa</button>' +
            '</div></td>' +
            '</tr>';
        }).join("");
      }



      function editReadingQuestion(groupId, index) {
        ensureSchema();
        activeGroupIds["reading"] = groupId;
        editQuestion("reading", index);
      }
      window.editReadingQuestion = editReadingQuestion;

      function renderGroupList(sectionId) {
        var listEl = $("#" + sectionId + "-group-list");
        if (!listEl) return;
        listEl.innerHTML = "";
        ensureSchema();
        var groups = getSection(sectionId).groups || [];
        if (!groups.length) {
          listEl.innerHTML = '<div class="empty">Chưa có chủ đề ngữ liệu nào. Hãy bấm "Thêm ngữ liệu".</div>';
          return;
        }

        var activeId = activeGroupIds[sectionId];
        listEl.innerHTML = groups.map(function (g) {
          var count = (g.questions || []).length;
          var activeClass = g.group_id === activeId ? " active" : "";
          return '<div class="mini-item' + activeClass + '">' +
            '<h4>' + esc(g.title || "Chưa có tiêu đề") + '</h4>' +
            '<p>' + count + ' câu hỏi đi kèm</p>' +
            '<div class="btn-row" style="margin-top:8px;">' +
            '<button class="btn btn-small btn-outline" data-select-group="' + sectionId + '" data-group-id="' + g.group_id + '">Chọn</button>' +
            '<button class="btn btn-small btn-danger" data-delete-group="' + sectionId + '" data-group-id="' + g.group_id + '">Xóa</button>' +
            '</div>' +
            '</div>';
        }).join("");
      }

      function renderActiveGroupDetails(sectionId) {
        var form = $("#" + sectionId + "-group-form");
        if (!form) return;
        form.innerHTML = "";
        
        if (sectionId === "reading") {
          ensureSchema();
          var readingSec = getSection("reading");
          var gId = activeGroupIds["reading"] || "g1";
          var group = readingSec.groups.find(function(g) { return g.group_id === gId; });
          if (!group) return;
          
          var numberLabel = gId === "g1" ? "1" : "2";
          var rangeLabel = gId === "g1" ? "Câu 1 - 10" : "Câu 11 - 20";
          
          form.innerHTML = 
            '<div class="passage-group-card" style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; background: #fff;">' +
              '<h3 style="font-size: 14px; font-weight: 700; color: var(--brand); margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">' +
                '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--brand);"></span> Ngữ liệu ' + numberLabel + ' (' + rangeLabel + ')' +
              '</h3>' +
              '<div class="form-grid" style="gap: 18px 20px;">' +
                '<div class="field full"><label>Tiêu đề ngữ liệu ' + numberLabel + '</label><input class="input" id="reading-' + gId + '-title" value="' + attr(group.title || "") + '" placeholder="Ví dụ: Ngữ liệu Đọc hiểu số 0' + numberLabel + '"></div>' +
                '<div class="field full" style="display:flex; flex-direction:column; gap:6px;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                  '<label style="margin-bottom:0;">Nội dung văn bản / dữ liệu ' + numberLabel + '</label>' +
                  '<button type="button" class="btn btn-secondary btn-sm" style="height:26px; padding:0 8px; font-size:11px; border-radius:4px; font-weight:600;" onclick="insertCloudImageIntoGroupText(\'reading\', \'reading-' + gId + '-text\')">🖼️ Chèn ảnh từ Cloud</button>' +
                '</div>' +
                '<textarea class="textarea" id="reading-' + gId + '-text" style="min-height:240px;" placeholder="Nhập nội dung đoạn văn / ngữ liệu ' + numberLabel + ' vào đây...">' + esc(group.stimulus?.content || "") + '</textarea>' +
              '</div>' +
                '<div class="btn-row" style="margin-top: 8px;">' +
                  '<button class="btn btn-primary btn-small" type="button" onclick="saveReadingGroupDirect(\'' + gId + '\')" style="background-color: var(--brand); border-color: var(--brand); font-weight: 700; color: #fff; border-radius: 8px; padding: 6px 12px;">Lưu ngữ liệu ' + numberLabel + '</button>' +
                '</div>' +
              '</div>' +
            '</div>';
            
          var titleInp = $("#reading-" + gId + "-title");
          var textInp = $("#reading-" + gId + "-text");
          [titleInp, textInp].forEach(function(inp) {
            if (inp) {
              inp.addEventListener("input", function() {
                var readingSec = getSection("reading");
                var group = readingSec.groups.find(function(g) { return g.group_id === gId; });
                if (group) {
                  if (inp.id.includes("title")) {
                    group.title = inp.value;
                  } else {
                    if (!group.stimulus) group.stimulus = {};
                    group.stimulus.content = inp.value;
                  }
                }
                updatePreview("reading");
              });
            }
          });
          return;
        }

        if (sectionId === "science") {
          ensureSchema();
          var scienceSec = getSection("science");
          var gId = activeGroupIds["science"] || "g1";
          var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
          if (!group) return;
          
          var gIdx = Number(gId.replace("g", "")) || 1;
          var startNo = (gIdx - 1) * 5 + 1;
          var rangeLabel = "Câu " + startNo + " - " + (startNo + 4);
          
          var groupImgWidth = group.stimulus?.image_width || 100;
          
          form.innerHTML = 
            '<div class="passage-group-card" style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; background: #fff;">' +
              '<h3 style="font-size: 14px; font-weight: 700; color: var(--brand); margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">' +
                '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--brand);"></span> Ngữ liệu ' + gIdx + ' (' + rangeLabel + ')' +
              '</h3>' +
              '<div class="form-grid" style="gap: 18px 20px;">' +
                '<div class="field full"><label>Tiêu đề ngữ liệu ' + gIdx + '</label><input class="input" id="science-' + gId + '-title" value="' + attr(group.title || "") + '" placeholder="Ví dụ: Ngữ liệu Khoa học số 0' + gIdx + '"></div>' +
                '<div class="field full" style="display:flex; flex-direction:column; gap:6px;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                  '<label style="margin-bottom:0;">Nội dung văn bản / dữ liệu ' + gIdx + '</label>' +
                  '<button type="button" class="btn btn-secondary btn-sm" style="height:26px; padding:0 8px; font-size:11px; border-radius:4px; font-weight:600;" onclick="insertCloudImageIntoGroupText(\'science\', \'science-' + gId + '-text\')">🖼️ Chèn ảnh từ Cloud</button>' +
                '</div>' +
                '<textarea class="textarea" id="science-' + gId + '-text" style="min-height:240px;" placeholder="Nhập nội dung dữ liệu khoa học ' + gIdx + ' vào đây...">' + esc(group.stimulus?.content || "") + '</textarea>' +
              '</div>' +
                '<div class="field full" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 0;">' +
                  '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Kích thước ảnh ngữ liệu ' + gIdx + ': <span id="science-' + gId + '-image-width-val" style="font-weight:700; color:var(--brand);">' + groupImgWidth + '</span>%</label>' +
                    '<input type="range" class="slider" id="science-' + gId + '-image-width" min="10" max="100" value="' + groupImgWidth + '" style="width: 100%; display: block; height: 28px; margin: 0; padding: 0; cursor: pointer;">' +
                  '</div>' +
                  '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Đường dẫn ảnh ngữ liệu ' + gIdx + ' nếu có</label><input class="input" id="science-' + gId + '-image" value="' + attr(group.stimulus?.image_url || "") + '" placeholder="https://assets.tmastudy.io.vn/assets/questions/' + attr(exam.exam_code) + '/ngu-lieu-01.webp"></div>' +
                '</div>' +
                '<div class="btn-row" style="margin-top: 8px;">' +
                  '<button class="btn btn-primary btn-small" type="button" onclick="saveScienceGroupDirect(\'' + gId + '\')" style="background-color: var(--brand); border-color: var(--brand); font-weight: 700; color: #fff; border-radius: 8px; padding: 6px 12px;">Lưu ngữ liệu ' + gIdx + '</button>' +
                '</div>' +
              '</div>' +
            '</div>';
            
          var titleInp = $("#science-" + gId + "-title");
          var textInp = $("#science-" + gId + "-text");
          var imgInp = $("#science-" + gId + "-image");
          var slider = $("#science-" + gId + "-image-width");
          var indicator = $("#science-" + gId + "-image-width-val");
          
          if (slider && indicator) {
            slider.addEventListener("input", function() {
              indicator.textContent = this.value;
              var scienceSec = getSection("science");
              var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
              if (group) {
                if (!group.stimulus) group.stimulus = {};
                group.stimulus.image_width = Number(this.value);
              }
              updatePreview("science");
            });
          }
          
          [titleInp, textInp, imgInp].forEach(function(inp) {
            if (inp) {
              inp.addEventListener("input", function() {
                var scienceSec = getSection("science");
                var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
                if (group) {
                  if (inp.id.includes("title")) {
                    group.title = inp.value;
                  } else if (inp.id.includes("text")) {
                    if (!group.stimulus) group.stimulus = {};
                    group.stimulus.content = inp.value;
                  } else if (inp.id.includes("image")) {
                    if (!group.stimulus) group.stimulus = {};
                    group.stimulus.image_url = inp.value;
                  }
                }
                updatePreview("science");
              });
            }
          });
          return;
        }

        var group = getActiveGroup(sectionId);
        if (!group) return;

        var groupImgWidth = group.stimulus?.image_width || 100;
        form.innerHTML =
          '<div class="form-grid" style="gap: 12px 14px;">' +
          '<div class="field full"><label>Tiêu đề ngữ liệu</label><input class="input" id="' + sectionId + '-g-title" value="' + attr(group.title) + '"></div>' +
          '<div class="field full" style="display:flex; flex-direction:column; gap:6px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<label style="margin-bottom:0;">Nội dung văn bản / dữ liệu</label>' +
              '<button type="button" class="btn btn-secondary btn-sm" style="height:26px; padding:0 8px; font-size:11px; border-radius:4px; font-weight:600;" onclick="insertCloudImageIntoGroupText(\'' + sectionId + '\', \'' + sectionId + '-g-text\')">🖼️ Chèn ảnh từ Cloud</button>' +
            '</div>' +
            '<textarea class="textarea" id="' + sectionId + '-g-text" style="min-height:180px;">' + esc(group.stimulus?.content || "") + '</textarea>' +
          '</div>' +
          '<div class="field full" style="display: grid; grid-template-columns: 360px 180px 1fr; gap: 10px; align-items: end; margin-bottom: 0;">' +
            '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Đường dẫn ảnh ngữ liệu nếu có</label><input class="input" id="' + sectionId + '-g-image" value="' + attr(group.stimulus?.image_url || "") + '" placeholder="https://assets.tmastudy.io.vn/assets/questions/' + attr(exam.exam_code) + '/ngu-lieu-01.webp"></div>' +
            '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Kích thước ảnh: <span id="' + sectionId + '-g-image-width-val">' + groupImgWidth + '</span>%</label>' +
              '<input type="range" class="slider" id="' + sectionId + '-g-image-width" min="10" max="100" value="' + groupImgWidth + '" style="width: 100%; display: block; height: 38px; margin: 0; padding: 0; cursor: pointer;">' +
            '</div>' +
          '</div>' +
          '</div>';

        var slider = $("#" + sectionId + "-g-image-width");
        var indicator = $("#" + sectionId + "-g-image-width-val");
        if (slider && indicator) {
          slider.addEventListener("input", function() {
            indicator.textContent = this.value;
            updatePreview(sectionId);
          });
        }
        var titleInp = $("#" + sectionId + "-g-title");
        var textInp = $("#" + sectionId + "-g-text");
        var imgInp = $("#" + sectionId + "-g-image");
        [titleInp, textInp, imgInp].forEach(function(inp) {
          if (inp) {
            inp.addEventListener("input", function() { updatePreview(sectionId); });
          }
        });
      }

      function saveReadingGroupDirect(gId) {
        ensureSchema();
        var readingSec = getSection("reading");
        var group = readingSec.groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        var titleInp = $("#reading-" + gId + "-title");
        var textInp = $("#reading-" + gId + "-text");
        if (titleInp) group.title = titleInp.value.trim() || "Chủ đề ngữ liệu";
        if (!group.stimulus) group.stimulus = {};
        if (textInp) group.stimulus.content = textInp.value || "";
        
        saveDraft();
        renderAll();
        window.alert("Đã lưu nội dung " + (gId === "g1" ? "ngữ liệu 1" : "ngữ liệu 2") + " thành công!");
      }
      window.saveReadingGroupDirect = saveReadingGroupDirect;

      function switchReadingGroupTab(groupId) {
        activeGroupIds["reading"] = groupId;
        
        // Reset the active question index to the first question of this group
        ensureSchema();
        var readingSec = getSection("reading");
        var group = readingSec.groups.find(function(g) { return g.group_id === groupId; });
        var firstQ = group && group.questions && group.questions[0] ? clone(group.questions[0]) : defaultQuestion("reading");
        
        editingQuestion["reading"] = { index: 0, question: firstQ };
        
        renderAll();
      }
      window.switchReadingGroupTab = switchReadingGroupTab;

      function updateReadingTabsUI() {
        var activeId = activeGroupIds["reading"] || "g1";
        var btnG1 = document.getElementById("reading-tab-btn-g1");
        var btnG2 = document.getElementById("reading-tab-btn-g2");
        if (btnG1 && btnG2) {
          btnG1.classList.toggle("active", activeId === "g1");
          btnG2.classList.toggle("active", activeId === "g2");
        }
      }

      function switchScienceGroupTab(groupId) {
        activeGroupIds["science"] = groupId;
        
        // Reset the active question index to the first question of this group
        ensureSchema();
        var scienceSec = getSection("science");
        var group = scienceSec.groups.find(function(g) { return g.group_id === groupId; });
        var firstQ = group && group.questions && group.questions[0] ? clone(group.questions[0]) : defaultQuestion("science");
        
        editingQuestion["science"] = { index: 0, question: firstQ };
        
        renderAll();
      }
      window.switchScienceGroupTab = switchScienceGroupTab;


      function getActiveQuestionNo(sectionId) {
        if (sectionId === "math") {
          return activeMathQuestionNo;
        }
        var gId = activeGroupIds[sectionId] || "g1";
        var gIdx = Number(gId.replace("g", "")) || 1;
        var startNo = (sectionId === "reading") ? (gId === "g1" ? 1 : 11) : ((gIdx - 1) * 5 + 1);
        var activeIdx = (editingQuestion[sectionId] && editingQuestion[sectionId].index !== undefined) ? editingQuestion[sectionId].index : 0;
        if (activeIdx === -1) activeIdx = 0;
        return startNo + activeIdx;
      }
      window.getActiveQuestionNo = getActiveQuestionNo;

      function updateTopbarQNo() {
        var qNoCircle = document.getElementById("topbar-qno-circle");
        if (qNoCircle && activeEditorTab) {
          qNoCircle.textContent = getActiveQuestionNo(activeEditorTab);
        }
      }
      window.updateTopbarQNo = updateTopbarQNo;

      function setGlobalEditorRoleView(role) {
        if (role === "student") {
          saveDraft();
          var subject = activeEditorTab;
          if (subject !== "math" && subject !== "reading" && subject !== "science") {
            subject = "math";
          }
          var qNo = getActiveQuestionNo(subject) || 1;
          var url = "exam-" + subject + ".html?exam=" + exam.exam_code + "&preview=true&preview_qno=" + qNo;
          window.open(url, "_blank");
          return;
        }
        if (activeEditorTab) {
          setEditorRoleView(activeEditorTab, role);
        }
      }
      window.setGlobalEditorRoleView = setGlobalEditorRoleView;


      function setEditorRoleView(sectionId, role) {
        var editorView = document.getElementById(sectionId + "-editor-view");
        var previewView = document.getElementById(sectionId + "-preview-view");
        var btnTeacher = document.getElementById("global-role-tab-teacher");
        var btnStudent = document.getElementById("global-role-tab-student");
        var saveRow = document.getElementById(sectionId + "-editor-save-btn-row");

        if (role === "student") {
          // Save the current question inputs to state before rendering preview
          var currentVal = collectBaseQuestion(sectionId, false);
          if (sectionId === "math") {
            currentVal.question_no = activeMathQuestionNo;
            ensureSchema();
            getSection("math").questions[activeMathQuestionNo - 1] = currentVal;
          } else {
            var idx = editingQuestion[sectionId].index;
            var group = getActiveGroup(sectionId);
            if (group) {
              if (idx === -1) {
                editingQuestion[sectionId].question = currentVal;
              } else {
                group.questions[idx] = currentVal;
                editingQuestion[sectionId].question = currentVal;
              }
            }
          }

          if (editorView) editorView.style.display = "none";
          if (previewView) previewView.style.display = "block";
          if (btnTeacher) btnTeacher.classList.remove("active");
          if (btnStudent) btnStudent.classList.add("active");
          if (saveRow) saveRow.style.display = "none";

          updatePreview(sectionId);
        } else {
          if (editorView) editorView.style.display = "block";
          if (previewView) previewView.style.display = "none";
          if (btnTeacher) btnTeacher.classList.add("active");
          if (btnStudent) btnStudent.classList.remove("active");
          if (saveRow) saveRow.style.display = "";
        }
      }
      window.setEditorRoleView = setEditorRoleView;




      function updateScienceTabsUI() {
        var activeId = activeGroupIds["science"] || "g1";
        for (var i = 1; i <= 8; i++) {
          var btn = document.getElementById("science-tab-btn-g" + i);
          if (btn) {
            btn.classList.toggle("active", activeId === "g" + i);
          }
        }
      }

      function saveScienceGroupDirect(gId) {
        ensureSchema();
        var scienceSec = getSection("science");
        var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        var titleInp = $("#science-" + gId + "-title");
        var textInp = $("#science-" + gId + "-text");
        var imgInp = $("#science-" + gId + "-image");
        var widthInp = $("#science-" + gId + "-image-width");
        
        if (titleInp) group.title = titleInp.value.trim() || "Chủ đề ngữ liệu";
        if (!group.stimulus) group.stimulus = {};
        if (textInp) group.stimulus.content = textInp.value || "";
        if (imgInp) group.stimulus.image_url = imgInp.value || "";
        if (widthInp) group.stimulus.image_width = Number(widthInp.value) || 100;
        
        saveDraft();
        renderAll();
        var gIdx = Number(gId.replace("g", "")) || 1;
        window.alert("Đã lưu nội dung ngữ liệu " + gIdx + " thành công!");
      }
      window.saveScienceGroupDirect = saveScienceGroupDirect;

      function renderSubjectWizardNav(sectionId) {
        var grid = $("#" + sectionId + "-wizard-grid");
        if (!grid) return;
        grid.innerHTML = "";
        
        ensureSchema();
        var sec = getSection(sectionId);
        var gId = activeGroupIds[sectionId] || "g1";
        var group = sec.groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        
        var questions = group.questions || [];
        var numQuestions = sectionId === "reading" ? 10 : 5;
        
        var gIdx = Number(gId.replace("g", "")) || 1;
        var startNo = sectionId === "reading" ? (gId === "g1" ? 1 : 11) : ((gIdx - 1) * 5 + 1);
        
        var editedCount = 0;
        var activeIdx = editingQuestion[sectionId]?.index || 0;
        
        for (var i = 0; i < numQuestions; i++) {
          var qNo = startNo + i;
          var q = questions[i];
          var isFilled = false;
          if (q) {
            var qText = (q.question || "").trim();
            var hasImage = (q.image_url || "").trim() !== "";
            var hasText = qText !== "";
            var hasOptions = false;
            if (Array.isArray(q.options)) {
              hasOptions = q.options.some(function (opt) {
                return (opt.text || "").trim() !== "";
              });
            }
            if (hasText || hasImage || hasOptions) {
              isFilled = true;
            }
          }
          if (isFilled) {
            editedCount++;
          }
          
          var isActive = i === activeIdx;
          
          var styleStr = "display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; padding: 0;";
          if (isFilled) {
            styleStr += " background: var(--brand); border: 1.5px solid var(--brand-dark); color: #fff;";
          } else {
            styleStr += " background: #fff; border: 1.5px solid var(--line); color: var(--muted);";
          }
          if (isActive) {
            styleStr += " box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--brand); z-index: 1; font-weight: 800;";
          }
          
          var btnHtml = '<button type="button" style="' + styleStr + '" onclick="selectSubjectWizardQuestion(\'' + sectionId + '\', ' + i + ')">' + qNo + '</button>';
          grid.innerHTML += btnHtml;
        }
        
        var progressEl = $("#" + sectionId + "-wizard-progress");
        if (progressEl) {
          progressEl.textContent = "Tiến độ: " + editedCount + "/" + numQuestions + " câu đã soạn";
        }
      }
      window.renderSubjectWizardNav = renderSubjectWizardNav;

      function selectSubjectWizardQuestion(sectionId, idx) {
        ensureSchema();
        var sec = getSection(sectionId);
        var gId = activeGroupIds[sectionId] || "g1";
        var group = sec.groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        
        // Auto-save currently edited question in the active group's question slot before switching
        if (editingQuestion[sectionId]) {
          var currentVal = collectBaseQuestion(sectionId, false);
          var activeIdx = editingQuestion[sectionId].index;
          if (activeIdx >= 0 && activeIdx < group.questions.length) {
            currentVal.question_no = group.questions[activeIdx].question_no; // preserve number
            group.questions[activeIdx] = currentVal;
            saveDraft();
          }
        }
        
        // Load target question
        var targetQ = clone(group.questions[idx]);
        editingQuestion[sectionId] = { index: idx, question: targetQ };
        
        renderQuestionForm(sectionId);
        renderSubjectWizardNav(sectionId);
        setEditorRoleView(sectionId, "teacher");
        updatePreview(sectionId);
        
        var form = $("#" + sectionId + "-question-form");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      window.selectSubjectWizardQuestion = selectSubjectWizardQuestion;

      function updatePreview(sectionId) {
        var bodyEl = $("#" + sectionId + "-preview-body");
        var ansEl = $("#" + sectionId + "-preview-answer");
        var stimEl = $("#" + sectionId + "-preview-stimulus");

        if (!bodyEl) return;
        bodyEl.innerHTML = "";
        if (ansEl) ansEl.innerHTML = "";
        if (stimEl) stimEl.innerHTML = "";

        var qNo = getActiveQuestionNo(sectionId);
        var qnoCircle = document.getElementById(sectionId + "-preview-qno-circle");
        if (qnoCircle) {
          qnoCircle.textContent = qNo;
        }

        var q = collectBaseQuestion(sectionId, false);
        if (sectionId !== "math") {
          var group = getActiveGroup(sectionId);
          if (stimEl && group) {
            var stimTitle = group.title || (sectionId === "reading" ? "Ngữ liệu đọc hiểu" : "Dữ liệu khoa học");
            stimEl.innerHTML =
              '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--brand);margin-bottom:10px;opacity:0.8;">' + esc(stimTitle) + '</div>' +
              '<div class="stimulus-content" style="font-size:14px;line-height:1.85;color:#1e293b;">' + esc(group.stimulus?.content || "") + '</div>';
            if (group.stimulus?.image_url) {
              var gWidth = group.stimulus?.image_width || 100;
              var widthStyle = 'style="width:' + gWidth + '%;max-width:100%;height:auto;"';
              stimEl.innerHTML += '<div class="question-image-wrap" style="text-align:center;"><img src="' + esc(group.stimulus.image_url) + '" alt="Group Image" ' + widthStyle + '></div>';
            }
          }
        }

        if (typeof window.renderQuestion === "function") {
          window.renderQuestion(q, null, function () {}, { bodyEl: bodyEl, answerEl: ansEl });
        } else {
          bodyEl.textContent = q.question;
        }
        if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
          window.MathJax.typesetPromise();
        }
      }

      function downloadJson(filename, obj) {
        var str = JSON.stringify(obj, null, 2);
        var blob = new Blob([str], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function getIndexListWithCurrent() {
        var draftList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) draftList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(draftList)) draftList = [];

        var idx = draftList.findIndex(function (e) { return e.exam_code === exam.exam_code; });
        var existingMeta = idx !== -1 ? draftList[idx] : null;
        var isOpen = existingMeta ? (existingMeta.is_open === true) : false;

        var meta = {
          exam_code: exam.exam_code,
          title: exam.title,
          status: exam.status,
          duration_minutes: exam.duration_minutes,
          is_open: isOpen,
          subject: (function() {
            if (exam.exam_code.includes("_MATH_")) return "math";
            if (exam.exam_code.includes("_READING_")) return "reading";
            if (exam.exam_code.includes("_SCIENCE_")) return "science";
            if (exam.exam_code.includes("_FULL_") || exam.exam_code.startsWith("TSA_EXAM_")) return "tong-hop";
            return "math";
          })(),
          file: "data/exams/" + exam.exam_code + ".json"
        };
        if (idx === -1) draftList.push(meta);
        else draftList[idx] = meta;
        return draftList;
      }

      async function toggleExamOpen(examCode, open) {
        let openStatus = {};
        try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}
        openStatus[examCode] = open;
        localStorage.setItem("tma_exam_open_status", JSON.stringify(openStatus));

        let indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(indexList)) indexList = [];

        var examMeta = indexList.find(function (e) { return e.exam_code === examCode; });
        if (examMeta) {
          examMeta.is_open = open;
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
          try {
            var indexJsonStr = JSON.stringify(indexList, null, 2);
            var indexBlob = new Blob([indexJsonStr], { type: "application/json" });
            await supabaseClient.storage.from('exams').upload('index.json', indexBlob, {
              cacheControl: '3600',
              upsert: true
            });
          } catch (err) {
            console.warn("Failed to sync index.json to Supabase:", err);
          }
        }

        if (examCode.startsWith("TSA_PRACTICE_") || examCode.startsWith("TSA_PRACTICE_FULL_")) {
          renderPracticeRoom();
        } else {
          renderExamsList();
        }
      }
      window.toggleExamOpen = toggleExamOpen;

      async function archiveMockToPractice() {
        if (!confirm("Bạn có chắc chắn muốn chuyển Đề thi thử TSA hiện tại vào Phòng luyện không?\nĐề này sẽ được chuyển sang phần Phòng luyện dưới dạng Đề TSA số XX (ví dụ TSA số 11) và đề thi thử cũ vẫn được giữ nguyên.")) {
          return;
        }

        var mockCode = "TSA_EXAM_01";
        var examData = null;

        // 1. Lấy dữ liệu của Đề thi thử TSA
        try {
          var localDraft = localStorage.getItem("tma_tsa_teacher_draft_" + mockCode);
          if (localDraft) {
            examData = JSON.parse(localDraft);
          }
        } catch (e) {
          console.warn("Lỗi đọc local draft:", e);
        }

        if (!examData) {
          try {
            var localExam = localStorage.getItem("tma_tsa_exam_" + mockCode);
            if (localExam) {
              examData = JSON.parse(localExam);
            }
          } catch (e) {
            console.warn("Lỗi đọc local exam:", e);
          }
        }

        if (!examData) {
          try {
            var response = await fetch(`https://assets.tmastudy.io.vn/data/exams/${mockCode}.json`, { cache: "no-store" });
            if (response.ok) {
              examData = await response.json();
            }
          } catch (e) {
            console.warn("Lỗi fetch từ Supabase:", e);
          }
        }

        if (!examData) {
          window.alert("Không tìm thấy nội dung của Đề thi thử TSA để chuyển. Vui lòng bấm 'Chỉnh sửa' đề thi thử và Lưu lại trước.");
          return;
        }

        // 2. Tìm index tiếp theo cho Phòng luyện
        var indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch (e) {}
        if (!Array.isArray(indexList)) indexList = [];

        var maxIdx = 10;
        indexList.forEach(e => {
          if (e.exam_code && e.exam_code.startsWith("TSA_PRACTICE_FULL_")) {
            var parts = e.exam_code.split("_");
            var num = parseInt(parts[parts.length - 1], 10);
            if (num > maxIdx) maxIdx = num;
          }
        });

        var nextIdx = maxIdx + 1;
        var nextIdxStr = String(nextIdx).padStart(2, "0");
        var newExamCode = "TSA_PRACTICE_FULL_" + nextIdxStr;
        var newExamTitle = "Đề tổng hợp số " + nextIdxStr;

        // 3. Clone và cập nhật thông tin mã đề mới
        var clonedExam = JSON.parse(JSON.stringify(examData));
        clonedExam.exam_code = newExamCode;
        clonedExam.title = newExamTitle;
        clonedExam.status = "published";

        // Lưu nháp mới
        try {
          localStorage.setItem("tma_tsa_teacher_draft_" + newExamCode, JSON.stringify(clonedExam));
          localStorage.setItem("tma_tsa_exam_" + newExamCode, JSON.stringify(clonedExam));
        } catch (e) {
          console.warn("Lỗi lưu nháp mới:", e);
        }

        // 4. Đồng bộ lên Supabase Cloud
        if (!supabaseClient) {
          window.alert("Đã sao lưu nháp offline dưới mã đề " + newExamCode + ".\nLưu ý: Không tìm thấy kết nối Supabase Client để đồng bộ tự động.");
          renderExamsList();
          renderPracticeRoom();
          return;
        }

        var btn = $("#upload-supabase-button");
        var originalText = btn ? btn.textContent : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Đang lưu lên Cloud...";
        }

        try {
          // Giai đoạn 2: Tách đáp án và lưu lên Database, chỉ upload đề đã xóa đáp án lên Storage
          var answersToInsert = [];
          if (clonedExam.sections && Array.isArray(clonedExam.sections)) {
            clonedExam.sections.forEach(function(section) {
              var subject = section.section_id;
              if (Array.isArray(section.questions)) {
                section.questions.forEach(function(q) {
                  if (q.correct_answer !== undefined) {
                    answersToInsert.push({
                      exam_code: newExamCode,
                      subject: subject,
                      question_no: q.question_no,
                      question_type: q.question_type || q.type || "single_choice",
                      correct_answer: JSON.stringify(q.correct_answer),
                      accepted_answers: q.accepted_answers ? JSON.stringify(q.accepted_answers) : null,
                      points: q.points || 1,
                      solution_details: q.explanation || "",
                      course_id: examCopy.course_id || null,
                      course_id: clonedExam.course_id || null
                    });
                    // delete q.correct_answer;
                    // delete q.accepted_answers;
                  }
                });
              }
              if (Array.isArray(section.groups)) {
                section.groups.forEach(function(group) {
                  if (Array.isArray(group.questions)) {
                    group.questions.forEach(function(q) {
                      if (q.correct_answer !== undefined) {
                        answersToInsert.push({
                          exam_code: newExamCode,
                          subject: subject,
                          question_no: q.question_no,
                          question_type: q.question_type || q.type || "single_choice",
                          correct_answer: JSON.stringify(q.correct_answer),
                          accepted_answers: q.accepted_answers ? JSON.stringify(q.accepted_answers) : null,
                          points: q.points || 1,
                          solution_details: q.explanation || ""
                        });
                        // delete q.correct_answer;
                        // delete q.accepted_answers;
                      }
                    });
                  }
                });
              }
            });
          }

          if (answersToInsert.length > 0) {
            // Xóa đáp án cũ trước để tránh trùng lặp (unique constraint)
            await supabaseClient.from('exam_answers').delete().eq('exam_code', newExamCode);

            var { error: answersInsertError } = await supabaseClient
              .from('exam_answers')
              .insert(answersToInsert);
            if (answersInsertError) {
              console.warn("Lỗi lưu đáp án:", answersInsertError);
              throw new Error("Không thể lưu đáp án lên Database: " + (answersInsertError.message || answersInsertError));
            }
          }

          var examJsonStr = JSON.stringify(clonedExam, null, 2);
          var examBlob = new Blob([examJsonStr], { type: "application/json" });
          var { error: uploadExamError } = await supabaseClient.storage
            .from('exams')
            .upload(newExamCode + ".json", examBlob, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadExamError) throw uploadExamError;

          // Cập nhật index.json
          var meta = {
            exam_code: newExamCode,
            title: newExamTitle,
            status: "published",
            duration_minutes: clonedExam.duration_minutes || 150,
            is_open: true,
            subject: "tong-hop",
            file: "data/exams/" + newExamCode + ".json"
          };

          var existIdx = indexList.findIndex(e => e.exam_code === newExamCode);
          if (existIdx === -1) {
            indexList.push(meta);
          } else {
            indexList[existIdx] = meta;
          }

          var indexJsonStr = JSON.stringify(indexList, null, 2);
          var indexBlob = new Blob([indexJsonStr], { type: "application/json" });
          var { error: uploadIndexError } = await supabaseClient.storage
            .from('exams')
            .upload('index.json', indexBlob, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadIndexError) throw uploadIndexError;

          // Đồng bộ lại local index
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          window.alert("✓ Đã chuyển Đề thi thử TSA thành công sang Phòng luyện dưới dạng:\n\"" + newExamTitle + "\" (" + newExamCode + ")");
          
          // Re-render UI
          renderExamsList();
          renderPracticeRoom();

        } catch (err) {
          console.error(err);
          window.alert("Lỗi khi tải dữ liệu lên Supabase:\n" + (err.message || err));
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
          }
        }
      }
      window.archiveMockToPractice = archiveMockToPractice;

      async function saveToSupabaseCloud() {
        if (!supabaseClient) {
          window.alert("Thư viện Supabase chưa được nhúng hoặc bị lỗi kết nối.");
          return;
        }

        var btn = $("#upload-supabase-button");
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Đang lưu lên Cloud...";

        try {
          // Giai đoạn 2: Tách đáp án và lưu lên Database, chỉ upload đề đã xóa đáp án lên Storage
          var answersToInsert = [];
          var examCopy = JSON.parse(JSON.stringify(exam));
          var newExamCode = examCopy.exam_code;
          if (examCopy.sections && Array.isArray(examCopy.sections)) {
            examCopy.sections.forEach(function(section) {
              var subject = section.section_id;
              if (Array.isArray(section.questions)) {
                section.questions.forEach(function(q) {
                  if (q.correct_answer !== undefined) {
                    answersToInsert.push({
                      exam_code: newExamCode,
                      subject: subject,
                      question_no: q.question_no,
                      question_type: q.question_type || q.type || "single_choice",
                      correct_answer: JSON.stringify(q.correct_answer),
                      accepted_answers: q.accepted_answers ? JSON.stringify(q.accepted_answers) : null,
                      points: q.points || 1,
                      solution_details: q.explanation || ""
                    });
                    // delete q.correct_answer;
                    // delete q.accepted_answers;
                  }
                });
              }
              if (Array.isArray(section.groups)) {
                section.groups.forEach(function(group) {
                  if (Array.isArray(group.questions)) {
                    group.questions.forEach(function(q) {
                      if (q.correct_answer !== undefined) {
                        answersToInsert.push({
                          exam_code: newExamCode,
                          subject: subject,
                          question_no: q.question_no,
                          question_type: q.question_type || q.type || "single_choice",
                          correct_answer: JSON.stringify(q.correct_answer),
                          accepted_answers: q.accepted_answers ? JSON.stringify(q.accepted_answers) : null,
                          points: q.points || 1,
                          solution_details: q.explanation || ""
                        });
                        // delete q.correct_answer;
                        // delete q.accepted_answers;
                      }
                    });
                  }
                });
              }
            });
          }

          if (answersToInsert.length > 0) {
            // Xóa đáp án cũ trước để tránh trùng lặp (unique constraint)
            await supabaseClient.from('exam_answers').delete().eq('exam_code', newExamCode);

            var { error: answersInsertError } = await supabaseClient
              .from('exam_answers')
              .insert(answersToInsert);
            if (answersInsertError) {
              console.warn("Lỗi lưu đáp án:", answersInsertError);
              throw new Error("Không thể lưu đáp án lên Database: " + (answersInsertError.message || answersInsertError));
            }
          }

          // 1. Lưu file JSON đề: [exam_code].json
          var examJsonStr = JSON.stringify(examCopy, null, 2);
          var examBlob = new Blob([examJsonStr], { type: "application/json" });
          
          var examFileName = examCopy.exam_code + ".json";
          var { data: uploadExamData, error: uploadExamError } = await supabaseClient.storage
            .from('exams')
            .upload(examFileName, examBlob, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadExamError) throw uploadExamError;

          // 2. Lưu file mục lục: index.json
          var indexList = getIndexListWithCurrent();
          var indexJsonStr = JSON.stringify(indexList, null, 2);
          var indexBlob = new Blob([indexJsonStr], { type: "application/json" });

          var { data: uploadIndexData, error: uploadIndexError } = await supabaseClient.storage
            .from('exams')
            .upload('index.json', indexBlob, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadIndexError) throw uploadIndexError;

          // Lưu index vào localStorage của giáo viên luôn để đồng bộ giao diện quản trị
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          window.alert("✓ Đã tải đề thi lên Supabase Cloud thành công!\nĐề thi hiện đã sẵn sàng phục vụ học sinh.");
        } catch (error) {
          console.error(error);
          window.alert("Lỗi khi tải đề lên Supabase:\n" + (error.message || error));
        } finally {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }

      async function saveToProjectFolder() {
        if (!window.showDirectoryPicker) {
          window.alert("Trình duyệt này không hỗ trợ ghi trực tiếp (File System Access API). Vui lòng sử dụng Chrome/Edge mới nhất hoặc tải file JSON về.");
          return;
        }
        try {
          var handle = await window.showDirectoryPicker({ mode: "readwrite" });
          
          var dataHandle = await handle.getDirectoryHandle("data", { create: true });
          var examsHandle = await dataHandle.getDirectoryHandle("exams", { create: true });

          // Write [exam_code].json
          var examFile = await examsHandle.getFileHandle(exam.exam_code + ".json", { create: true });
          var examWritable = await examFile.createWritable();
          await examWritable.write(JSON.stringify(exam, null, 2));
          await examWritable.close();

          // Write index.json
          var indexList = getIndexListWithCurrent();
          var indexFile = await examsHandle.getFileHandle("index.json", { create: true });
          var indexWritable = await indexFile.createWritable();
          await indexWritable.write(JSON.stringify(indexList, null, 2));
          await indexWritable.close();

          // Also save in localStorage
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          window.alert("Đã ghi đè thành công các file sau vào thư mục dự án:\n1. data/exams/" + exam.exam_code + ".json\n2. data/exams/index.json");
        } catch (error) {
          console.error(error);
          window.alert("Không thể ghi file. Có thể bạn đã từ chối cấp quyền truy cập thư mục.");
        }
      }

      function previewInStudentRoom() {
        // Collect and save active question state to draft before previewing
        if (activeEditorTab === "math") {
          var currentVal = collectBaseQuestion("math", false);
          currentVal.question_no = activeMathQuestionNo;
          ensureSchema();
          getSection("math").questions[activeMathQuestionNo - 1] = currentVal;
        } else if (activeEditorTab === "reading" || activeEditorTab === "science") {
          var currentVal = collectBaseQuestion(activeEditorTab, false);
          var idx = editingQuestion[activeEditorTab].index;
          var group = getActiveGroup(activeEditorTab);
          if (group) {
            if (idx === -1) {
              group.questions.push(currentVal);
              editingQuestion[activeEditorTab].index = group.questions.length - 1;
            } else {
              group.questions[idx] = currentVal;
            }
          }
        }
        saveDraft();

        var link = "";
        var qNo = 1;
        if (activeEditorTab === "reading") {
          var q = editingQuestion["reading"] ? editingQuestion["reading"].question : null;
          qNo = q ? q.question_no : 1;
          link = "exam-reading.html?exam=" + exam.exam_code + "&preview=true&preview_qno=" + qNo;
        } else if (activeEditorTab === "science") {
          var q = editingQuestion["science"] ? editingQuestion["science"].question : null;
          qNo = q ? q.question_no : 1;
          link = "exam-science.html?exam=" + exam.exam_code + "&preview=true&preview_qno=" + qNo;
        } else {
          qNo = activeMathQuestionNo;
          link = "exam-math.html?exam=" + exam.exam_code + "&preview=true&preview_qno=" + qNo;
        }
        openPreviewModal(link);
      }


      window.previewInStudentRoom = previewInStudentRoom;

      function toggleSidebar() {
        var shell = document.querySelector(".teacher-shell");
        if (shell) {
          shell.classList.toggle("sidebar-collapsed");
          var isCollapsed = shell.classList.contains("sidebar-collapsed");
          localStorage.setItem("tma_teacher_sidebar_collapsed", isCollapsed ? "true" : "false");
        }
      }
      window.toggleSidebar = toggleSidebar;

      function toggleTeacherChoiceSelection(el, key, isMulti) {
        var input = el.querySelector('input[name="choice-correct"]');
        if (!input) return;
        
        if (isMulti) {
          input.checked = !input.checked;
          el.classList.toggle("is-selected", input.checked);
        } else {
          var container = el.closest(".choices-container");
          container.querySelectorAll(".choice-item").forEach(function (item) {
            item.classList.remove("is-selected");
          });
          container.querySelectorAll('input[name="choice-correct"]').forEach(function (rad) {
            rad.checked = false;
          });
          input.checked = true;
          el.classList.add("is-selected");
        }
        updatePreview(activeEditorTab);
      }
      window.toggleTeacherChoiceSelection = toggleTeacherChoiceSelection;

      function toggleTeacherTfSelection(id, value, btn) {
        var row = btn.closest(".statement-row");
        var radios = row.querySelectorAll('input[type="radio"]');
        
        row.querySelectorAll(".statement-btn").forEach(function (b) {
          b.classList.remove("is-active");
        });
        
        var targetRadio = value ? radios[0] : radios[1];
        if (targetRadio.checked) {
          targetRadio.checked = false;
        } else {
          targetRadio.checked = true;
          btn.classList.add("is-active");
        }
        updatePreview(activeEditorTab);
      }
      window.toggleTeacherTfSelection = toggleTeacherTfSelection;

      function startEditingExam(title, code, startTab) {
        var cleanCode = normalizeCode(code);
        var existing = loadDraft(cleanCode);
        if (existing) {
          exam = existing;
          ensureSchema();
        } else {
          exam = createEmptyExam(cleanCode, title, 45, "published");
        }

        // Enter Editing Mode
        document.getElementById("dashboard-container").style.display = "none";
        document.getElementById("sidebar-normal-nav").style.display = "none";

        document.getElementById("editor-container").style.display = "block";
        document.getElementById("sidebar-editor-nav").style.display = "flex";

        $("#editor-subtitle").textContent = `Đang chỉnh sửa: ${title} (${cleanCode})`;
        syncMetadataToForm();
        saveDraft();

        // Load saved Gemini Key if exists
        try {
          var savedKey = localStorage.getItem("tma_gemini_api_key") || "";
          var keyInput = document.getElementById("ai-gemini-key");
          if (keyInput) keyInput.value = savedKey;
        } catch (e) {}

        switchEditorTab(startTab || "setup");
      }

      async function syncExamFromSource() {
        if (!exam || !exam.exam_code) return;
        var code = exam.exam_code;
        var cleanCode = normalizeCode(code);
        if (!confirm("Bạn có chắc chắn muốn xóa bản nháp hiện tại và tải lại dữ liệu đề " + cleanCode + " từ File/Cloud không?\nMọi thay đổi chưa lưu trên giao diện sẽ bị mất.")) {
          return;
        }
        
        var btn = document.getElementById("btn-reload-exam");
        var originalText = btn ? btn.innerHTML : "";
        if (btn) btn.innerHTML = "Đang tải dữ liệu...";
        
        try {
          var fetchedData = null;
          var fetched = false;
          
          // 0a. If running via file:// protocol, prioritize pre-embedded fallback data
          if (window.location.protocol === "file:" && window.TSA001_FALLBACK_DATA && (cleanCode === "TSA001" || cleanCode === "TSA_EXAM_01")) {
            fetchedData = JSON.parse(JSON.stringify(window.TSA001_FALLBACK_DATA));
            fetched = true;
            console.log("Loaded exam from pre-embedded fallback script (file:// protocol).");
          }

          // 0a-2. Check if running locally and the exam is a split directory (e.g. data/exams/tsa001.json/math.json etc.)
          if (!fetched && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:")) {
            try {
              var folderPath = "data/exams/" + cleanCode.toLowerCase() + ".json/";
              var [mathData, readingData, scienceData] = await Promise.all([
                fetch(folderPath + "math.json").then(r => r.ok ? r.json() : null),
                fetch(folderPath + "reading.json").then(r => r.ok ? r.json() : null),
                fetch(folderPath + "science.json").then(r => r.ok ? r.json() : null)
              ]);
              if (mathData && readingData && scienceData) {
                fetchedData = {
                  exam_code: code,
                  title: mathData.title || title || code,
                  duration_minutes: mathData.duration_minutes || 150,
                  status: mathData.status || "published",
                  sections: [
                    (mathData.sections && mathData.sections[0]) ? mathData.sections[0] : mathData,
                    (readingData.sections && readingData.sections[0]) ? readingData.sections[0] : readingData,
                    (scienceData.sections && scienceData.sections[0]) ? scienceData.sections[0] : scienceData
                  ]
                };
                fetched = true;
                console.log("Loaded split exam sections from directory:", folderPath);
              }
            } catch (err) {}
          }

          // 0b. If running locally on a server, try local file first to prioritize local updates
          if (!fetched && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
            var possibleFiles = [
              "data/exams/" + cleanCode.toLowerCase() + ".json",
              "data/exams/" + cleanCode + ".json"
            ];
            for (var fPath of possibleFiles) {
              try {
                var response = await fetch(fPath, { cache: "no-store" });
                if (response.ok) {
                  var data = await response.json();
                  if (data && data.exam_code) {
                    fetchedData = data;
                    fetched = true;
                    console.log("Loaded exam from local file:", fPath);
                    break;
                  }
                }
              } catch (err) {}
            }
          }

          // 1. Try fetching from Cloud (Supabase Storage) - works on both http/https and file:// protocols due to CORS wildcard
          if (!fetched) {
            var supabaseStorageUrl = 'https://jlnfnnrboozwywikxtel.supabase.co/storage/v1/object/public/exams/';
            var possibleUrls = [
              supabaseStorageUrl + cleanCode + ".json",
              supabaseStorageUrl + cleanCode.toLowerCase() + ".json"
            ];
            
            // Cross-check fallback codes
            if (cleanCode === "TSA001") {
              possibleUrls.push(supabaseStorageUrl + "TSA_EXAM_01.json");
            } else if (cleanCode === "TSA_EXAM_01") {
              possibleUrls.push(supabaseStorageUrl + "TSA001.json");
            }
            
            for (var url of possibleUrls) {
              try {
                var response = await fetch(url, { cache: "no-store" });
                if (response.ok) {
                  var data = await response.json();
                  if (data && data.exam_code) {
                    fetchedData = data;
                    fetched = true;
                    break;
                  }
                }
              } catch (err) {}
            }
          }
          
          // 2. If running locally on a server and cloud failed, fall back to local files
          if (!fetched && window.location.protocol !== "file:") {
            var possibleFiles = [
              "data/exams/" + cleanCode.toLowerCase() + ".json",
              "data/exams/" + cleanCode + ".json",
              "data/exams/tsa001.json"
            ];
            for (var fPath of possibleFiles) {
              try {
                var response = await fetch(fPath, { cache: "no-store" });
                if (response.ok) {
                  var data = await response.json();
                  if (data && data.exam_code) {
                    fetchedData = data;
                    fetched = true;
                    break;
                  }
                }
              } catch (err) {}
            }
          }
          
          // 3. Last resort offline fallback for TSA001 / TSA_EXAM_01
          if (!fetched && window.TSA001_FALLBACK_DATA && (cleanCode === "TSA001" || cleanCode === "TSA_EXAM_01")) {
            fetchedData = JSON.parse(JSON.stringify(window.TSA001_FALLBACK_DATA));
            fetched = true;
            console.log("Loaded exam from pre-embedded fallback script.");
          }
          
          if (!fetched) {
            throw new Error("Không thể kết nối đến Cloud hoặc tệp tin để tải đề.");
          }
          
          if (fetchedData) {
            exam = fetchedData;
            ensureSchema();
            // Reset active editing state to prevent stale editor inputs from overwriting newly synced questions
            ["math", "reading", "science"].forEach(function (sectionId) {
              editingQuestion[sectionId] = { index: -1, question: defaultQuestion(sectionId) };
            });
            saveDraft();
            renderAll();
            alert("✓ Đã đồng bộ và tải lại đề thi thành công!");
          }
        } catch (error) {
          console.error(error);
          alert("Lỗi khi tải đề: " + error.message);
        } finally {
          if (btn) btn.innerHTML = originalText;
        }
      }
      window.syncExamFromSource = syncExamFromSource;

      function exitEditingMode() {
        document.getElementById("editor-container").style.display = "none";
        document.getElementById("sidebar-editor-nav").style.display = "none";

        document.getElementById("dashboard-container").style.display = "block";
        document.getElementById("sidebar-normal-nav").style.display = "block";

        // Refresh views
        renderPracticeRoom();
        renderExamsList();
      }

      // Expose to window object so clicking edit buttons work
      window.startEditingExam = startEditingExam;
      window.exitEditingMode = exitEditingMode;

      async function deleteExamPermanently(examCode, examTitle) {
        var cleanCode = normalizeCode(examCode);
        if (!window.confirm(`⚠️ CẢNH BÁO CỰC KỲ QUAN TRỌNG!\n\nBạn có chắc chắn muốn XÓA TẬN GỐC đề thi:\n"${examTitle}" (${cleanCode}) không?\n\nHành động này sẽ:\n1. Xóa vĩnh viễn tệp đề JSON trên Supabase Storage.\n2. Gỡ bỏ đề khỏi danh sách mục lục hiển thị của học sinh.\n3. Xóa toàn bộ điểm số và bài làm của tất cả học sinh liên quan đến đề này trong cơ sở dữ liệu.\n\nHÀNH ĐỘNG NÀY KHÔNG THỂ KHÔI PHỤC!`)) {
          return;
        }

        var confirmCode = window.prompt(`Để xác nhận xóa, vui lòng nhập chính xác mã đề "${cleanCode}":`);
        if (confirmCode !== cleanCode) {
          window.alert("Nhập mã đề không khớp! Đã hủy lệnh xóa.");
          return;
        }

        try {
          // 1. Xóa file JSON của đề trên Storage
          var examFileName = cleanCode + ".json";
          var { error: delStorageError } = await supabaseClient.storage
            .from('exams')
            .remove([examFileName]);
          if (delStorageError) {
            console.warn("Storage deletion warning/error:", delStorageError);
          }

          // 2. Cập nhật file mục lục index.json
          var indexList = [];
          var rawIdx = localStorage.getItem("tma_tsa_exam_index");
          if (rawIdx) {
            try { indexList = JSON.parse(rawIdx); } catch(e) {}
          }
          
          indexList = indexList.filter(e => normalizeCode(e.exam_code) !== cleanCode);
          
          var indexJsonStr = JSON.stringify(indexList, null, 2);
          var indexBlob = new Blob([indexJsonStr], { type: "application/json" });
          var { error: uploadIndexError } = await supabaseClient.storage
            .from('exams')
            .upload('index.json', indexBlob, {
              cacheControl: '3600',
              upsert: true
            });
          if (uploadIndexError) throw uploadIndexError;

          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          // 3. Xóa điểm số và bài làm trong Database
          var { error: delAnswersError } = await supabaseClient
            .from('exam_answers')
            .delete()
            .eq('exam_code', cleanCode);
          if (delAnswersError) {
            console.warn("DB exam_answers deletion warning:", delAnswersError);
          }

          var { error: delResultsError } = await supabaseClient
            .from('exam_results')
            .delete()
            .eq('exam_code', cleanCode);
          if (delResultsError) {
            console.warn("DB exam_results deletion warning:", delResultsError);
          }

          localStorage.removeItem("tma_tsa_draft_" + cleanCode);

          window.alert("✓ Đã xóa tận gốc đề thi và toàn bộ dữ liệu liên quan thành công!");
          
          renderPracticeRoom();
          renderExamsList();
        } catch (error) {
          console.error(error);
          window.alert("Lỗi khi thực hiện xóa đề:\n" + (error.message || error));
        }
      }
      window.deleteExamPermanently = deleteExamPermanently;

      function bindEvents() {
        document.addEventListener("click", function (event) {
          var target = event.target.closest("button");
          if (!target) return;
          if (target.id === "btn-reload-exam") { syncExamFromSource(); return; }
          var tab = target.getAttribute("data-editor-tab-target");
          if (tab) { switchEditorTab(tab); return; }
          var reset = target.getAttribute("data-reset-question");
          if (reset) { resetQuestion(reset); return; }
          var preview = target.getAttribute("data-preview-question");
          if (preview) { updatePreview(preview); return; }
          var saveQ = target.getAttribute("data-save-question");
          if (saveQ) { saveQuestion(saveQ); return; }
          var edit = target.getAttribute("data-edit-question");
          if (edit) { editQuestion(edit, Number(target.getAttribute("data-index"))); return; }
          var del = target.getAttribute("data-delete-question");
          if (del) { deleteQuestion(del, Number(target.getAttribute("data-index"))); return; }
          var cloneAttr = target.getAttribute("data-clone-question");
          if (cloneAttr) { cloneQuestion(cloneAttr, Number(target.getAttribute("data-index"))); return; }
          var newGroupAttr = target.getAttribute("data-new-group");
          if (newGroupAttr) { newGroup(newGroupAttr); return; }
          var saveGroupAttr = target.getAttribute("data-save-group");
          if (saveGroupAttr) { saveGroup(saveGroupAttr); return; }
          var selectGroupAttr = target.getAttribute("data-select-group");
          if (selectGroupAttr) { selectGroup(selectGroupAttr, target.getAttribute("data-group-id")); return; }
          var deleteGroupAttr = target.getAttribute("data-delete-group");
          if (deleteGroupAttr) { deleteGroup(deleteGroupAttr, target.getAttribute("data-group-id")); return; }
        });

        var createExamBtn = $("#create-exam-button");
        if (createExamBtn) {
          createExamBtn.addEventListener("click", function () {
            var code = normalizeCode($("#exam-code").value);
            var existing = loadDraft(code);
            if (existing) {
              exam = existing;
              ensureSchema();
            } else {
              exam = createEmptyExam(code, $("#exam-title-input").value.trim() || "Đề TSA", Number($("#exam-duration").value) || 45, $("#exam-status").value || "draft");
            }
            syncMetadataToForm();
            saveDraft();
            switchEditorTab("math");
          });
        }

        var saveMetaBtn = $("#save-metadata-button");
        if (saveMetaBtn) {
          saveMetaBtn.addEventListener("click", function () {
            syncMetadataFromForm(true);
            saveDraft();
            renderAll();
          });
        }

        ["exam-title-input", "exam-duration", "exam-status"].forEach(function (id) {
          var inputEl = $("#" + id);
          if (inputEl) {
            inputEl.addEventListener("input", function () { saveDraft(); renderSummary(); });
            inputEl.addEventListener("change", function () { saveDraft(); renderSummary(); });
          }
        });

        var dlExamBtn = $("#download-exam-button");
        if (dlExamBtn) {
          dlExamBtn.addEventListener("click", function () {
            downloadJson(exam.exam_code + ".json", exam);
          });
        }
        var importExamBtn = $("#import-exam-button");
        if (importExamBtn) {
          importExamBtn.addEventListener("click", function () {
            var fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".json";
            fileInput.addEventListener("change", function (e) {
              var file = e.target.files[0];
              if (!file) return;
              var reader = new FileReader();
              reader.onload = function (evt) {
                try {
                  var imported = JSON.parse(evt.target.result);
                  if (!imported || !imported.exam_code) {
                    window.alert("File JSON không hợp lệ! Thiếu trường 'exam_code'.");
                    return;
                  }
                  if (window.confirm("Bạn có chắc chắn muốn nhập đề thi từ file này không? Toàn bộ câu hỏi hiện tại trong trình soạn thảo sẽ bị ghi đè.")) {
                    exam = imported;
                    
                    // Force reset editing cache for all sections
                    editingQuestion = { math: null, reading: null, science: null };
                    
                    ensureSchema();
                    syncMetadataToForm();
                    saveDraft();
                    renderAll();
                    window.alert("✓ Đã nhập đề thi từ file JSON thành công! Hãy kiểm tra lại các câu hỏi và nhấn 'Lưu lên Supabase Cloud' để lưu đề.");
                  }
                } catch (err) {
                  window.alert("Lỗi khi đọc file JSON: " + err.message);
                }
              };
              reader.readAsText(file);
            });
            fileInput.click();
          });
        }

        function setupSectionImportExport(subject, dlBtnId, importBtnId, label) {
          var dlBtn = $("#" + dlBtnId);
          if (dlBtn) {
            dlBtn.addEventListener("click", function () {
              if (!exam || !exam.sections) return;
              var section = exam.sections.find(s => s.section_id === subject);
              if (!section) {
                section = {
                  section_id: subject,
                  section_label: label,
                  layout: subject === 'science' ? 'passage' : 'single',
                  questions: []
                };
              }
              downloadJson(exam.exam_code + "_" + subject + ".json", section);
            });
          }

          var importBtn = $("#" + importBtnId);
          if (importBtn) {
            importBtn.addEventListener("click", function () {
              var fileInput = document.createElement("input");
              fileInput.type = "file";
              fileInput.accept = ".json";
              fileInput.addEventListener("change", function (e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function (evt) {
                  try {
                    var imported = JSON.parse(evt.target.result);
                    if (!imported) {
                      window.alert("File JSON rỗng hoặc không hợp lệ!");
                      return;
                    }
                    if (window.confirm(`Bạn có chắc chắn muốn nhập dữ liệu phần ${label} từ file này không? Toàn bộ câu hỏi phần ${label} hiện tại sẽ bị ghi đè.`)) {
                      let targetSection = null;
                      if (imported.sections && Array.isArray(imported.sections)) {
                        targetSection = imported.sections.find(s => s.section_id === subject);
                      } else if (imported.section_id === subject) {
                        targetSection = imported;
                      } else {
                        targetSection = imported;
                      }

                      if (!targetSection) {
                        window.alert(`Không tìm thấy dữ liệu hợp lệ cho phần ${label} (ID: ${subject}) trong file JSON.`);
                        return;
                      }

                      if (!exam.sections) exam.sections = [];
                      var idx = exam.sections.findIndex(s => s.section_id === subject);
                      
                      targetSection.section_id = subject;
                      targetSection.section_label = label;
                      if (!targetSection.layout) {
                        targetSection.layout = subject === 'science' ? 'passage' : 'single';
                      }

                      if (idx === -1) {
                        exam.sections.push(targetSection);
                      } else {
                        exam.sections[idx] = targetSection;
                      }

                      // Force reset cache for this specific subject to load newly imported questions
                      editingQuestion[subject] = null;

                      ensureSchema();
                      syncMetadataToForm();
                      saveDraft();
                      renderAll();
                      window.alert(`✓ Nhập phần ${label} thành công! Hãy kiểm tra và nhấn 'Lưu lên Supabase Cloud' để đồng bộ.`);
                    }
                  } catch (err) {
                    window.alert("Lỗi khi đọc file JSON: " + err.message);
                  }
                };
                reader.readAsText(file);
              });
              fileInput.click();
            });
          }
        }

        setupSectionImportExport('math', 'sidebar-download-math-button', 'sidebar-import-math-button', 'Tư duy Toán học');
        setupSectionImportExport('reading', 'sidebar-download-reading-button', 'sidebar-import-reading-button', 'Đọc hiểu');
        setupSectionImportExport('science', 'sidebar-download-science-button', 'sidebar-import-science-button', 'Khoa học');
        var aiRunBtn = $("#ai-run-button");
        if (aiRunBtn) {
          aiRunBtn.addEventListener("click", async function () {
            var apiKeyInput = $("#ai-gemini-key");
            var examTextInput = $("#ai-exam-text");
            var importSectionSelect = $("#ai-import-section");
            if (!apiKeyInput || !examTextInput) return;

            var apiKey = apiKeyInput.value.trim();
            var rawText = examTextInput.value.trim();
            var selectedSection = importSectionSelect ? importSectionSelect.value : "math";

            if (!apiKey) {
              window.alert("Vui lòng nhập Gemini API Key để sử dụng tính năng này!");
              apiKeyInput.focus();
              return;
            }
            if (!rawText) {
              window.alert("Vui lòng dán nội dung đề thi vào ô văn bản!");
              examTextInput.focus();
              return;
            }

            // Save key to local storage
            localStorage.setItem("tma_gemini_api_key", apiKey);

            var originalText = aiRunBtn.textContent;
            aiRunBtn.disabled = true;
            aiRunBtn.textContent = "AI đang phân tích & tách câu hỏi... (5-10s)";

            try {
              var jsonStructureText = "";
              if (selectedSection === "math") {
                jsonStructureText = JSON.stringify({
                  exam_code: exam.exam_code || "TSA001",
                  title: exam.title || "Đề thi",
                  duration_minutes: exam.duration_minutes || 60,
                  status: "published",
                  sections: [
                    {
                      section_id: "math",
                      section_label: "Tư duy Toán học",
                      layout: "single",
                      questions: []
                    }
                  ]
                }, null, 2);
              } else if (selectedSection === "reading" || selectedSection === "science") {
                var sLabel = selectedSection === "reading" ? "Đọc hiểu" : "Khoa học";
                jsonStructureText = JSON.stringify({
                  exam_code: exam.exam_code || "TSA001",
                  title: exam.title || "Đề thi",
                  duration_minutes: exam.duration_minutes || 60,
                  status: "published",
                  sections: [
                    {
                      section_id: selectedSection,
                      section_label: sLabel,
                      layout: "split",
                      groups: [
                        {
                          group_id: "g1",
                          title: "Tiêu đề văn bản/ngữ liệu số 01",
                          stimulus: {
                            type: "text",
                            content: "Nội dung văn bản dài..."
                          },
                          questions: []
                        }
                      ]
                    }
                  ]
                }, null, 2);
              } else {
                jsonStructureText = JSON.stringify({
                  exam_code: exam.exam_code || "TSA001",
                  title: exam.title || "Đề thi",
                  duration_minutes: exam.duration_minutes || 60,
                  status: "published",
                  sections: [
                    {
                      section_id: "math",
                      section_label: "Tư duy Toán học",
                      layout: "single",
                      questions: []
                    },
                    {
                      section_id: "reading",
                      section_label: "Đọc hiểu",
                      layout: "split",
                      groups: [
                        {
                          group_id: "g1",
                          title: "Tiêu đề văn bản Đọc hiểu số 01",
                          stimulus: { type: "text", content: "..." },
                          questions: []
                        }
                      ]
                    },
                    {
                      section_id: "science",
                      section_label: "Khoa học",
                      layout: "split",
                      groups: [
                        {
                          group_id: "g1",
                          title: "Tiêu đề văn bản Khoa học số 01",
                          stimulus: { type: "text", content: "..." },
                          questions: []
                        }
                      ]
                    }
                  ]
                }, null, 2);
              }

              var systemInstruction = `
Bạn là một trợ lý AI chuyên môn cao về EdTech. Bạn được yêu cầu chuyển đổi văn bản đề thi thô thành định dạng JSON cấu trúc đúng như sau.

CHỈ THỊ PHÂN LOẠI PHẦN THI CHỌN LỰA:
- Giáo viên đã chọn nạp đề thi này vào phần thi: "${selectedSection.toUpperCase()}".
- Nếu chọn "math", toàn bộ câu hỏi được phân tích phải nằm trong mảng "questions" của phần "math" (Danh sách phẳng không gom nhóm).
- Nếu chọn "reading" hoặc "science", toàn bộ câu hỏi phải được gom nhóm theo đoạn văn ngữ liệu tương ứng và đặt trong mảng "groups" (mỗi nhóm gồm văn bản đọc hiểu/khoa học và các câu hỏi đi kèm, mã nhóm bắt đầu là g1, g2, g3...).
- Nếu chọn "auto", bạn hãy tự động phân tách đề bài thành 3 phần Toán học (math), Đọc hiểu (reading) và Khoa học (science) theo đúng cấu trúc đề thi TSA.

CẤU TRÚC JSON ĐẦU RA YÊU CẦU:
${jsonStructureText}

CÁC DẠNG CÂU HỎI HỖ TRỢ:

1. Trắc nghiệm chọn 1 đáp án (single_choice):
{
  "question_no": 1,
  "question_type": "single_choice",
  "question": "Nội dung câu hỏi (sử dụng LaTeX \\( ... \\) cho công thức toán)",
  "image_url": "",
  "options": [
    { "key": "A", "text": "Phương án A" },
    { "key": "B", "text": "Phương án B" },
    { "key": "C", "text": "Phương án C" },
    { "key": "D", "text": "Phương án D" }
  ],
  "correct_answer": "B", // Phím đáp án đúng (A, B, C hoặc D)
  "explanation": "Giải thích...",
  "points": 1
}

2. Trắc nghiệm chọn nhiều đáp án (multiple_choice):
{
  "question_no": 2,
  "question_type": "multiple_choice",
  "question": "Nội dung câu hỏi...",
  "image_url": "",
  "options": [
    { "key": "A", "text": "Phương án A" },
    { "key": "B", "text": "Phương án B" }
  ],
  "correct_answer": ["A", "B"], // Mảng các đáp án đúng
  "explanation": "Giải thích...",
  "points": 1
}

3. Câu hỏi Đúng/Sai (true_false):
{
  "question_no": 3,
  "question_type": "true_false",
  "question": "Nội dung câu dẫn...",
  "image_url": "",
  "statements": [
    { "id": "a", "text": "Mệnh đề a..." },
    { "id": "b", "text": "Mệnh đề b..." }
  ],
  "correct_answer": {
    "a": true, // Đúng
    "b": false // Sai
  },
  "explanation": "Giải thích...",
  "points": 1
}

4. Câu hỏi kéo thả / điền chỗ trống (drag_drop):
Dùng dạng này khi đề thi yêu cầu điền vào các ô trống trong đoạn văn.
{
  "question_no": 4,
  "question_type": "drag_drop",
  "question": "Nội dung câu dẫn...",
  "image_url": "",
  "body": [
    { "type": "text", "content": "Văn bản trước ô trống thứ nhất " },
    { "type": "blank", "id": "o1" },
    { "type": "text", "content": " văn bản trước ô trống thứ hai " },
    { "type": "blank", "id": "o2" }
  ],
  "items": [ // Các thẻ từ để kéo thả (nếu có) hoặc các từ khóa đáp án
    { "id": "i1", "text": "đáp án đúng 1" },
    { "id": "i2", "text": "đáp án đúng 2" },
    { "id": "i3", "text": "đáp án gây nhiễu" }
  ],
  "correct_answer": {
    "o1": "i1",
    "o2": "i2"
  },
  "explanation": "Giải thích...",
  "points": 1
}

5. Điền số (numeric_answer):
{
  "question_no": 5,
  "question_type": "numeric_answer",
  "question": "Nội dung câu hỏi...",
  "image_url": "",
  "correct_answer": 12.5, // Số thực hoặc số nguyên đáp án đúng
  "tolerance": 0,
  "explanation": "Giải thích...",
  "points": 1
}

YÊU CẦU QUAN TRỌNG:
- Trả về cấu trúc JSON hợp lệ hoàn toàn dựa theo cấu trúc trên.
- Sử dụng chuẩn toán học LaTeX với ký hiệu \\( ... \\) cho công thức nội dòng (inline) và \\[ ... \\] cho công thức khối (display math). Ví dụ: \\(f(x) = x^2\\). Hãy chắc chắn escape đúng các ký tự chéo ngược \\ thành \\\\ trong chuỗi JSON.
- ĐỂ CÔNG THỨC TOÁN HIỂN THỊ TO RÕ ĐẸP MẮT: BẮT BUỘC sử dụng lệnh \\dfrac thay vì \\frac cho tất cả các phân số. Đối với các ký hiệu tổng hoặc tích, sử dụng thêm \\limits (ví dụ: \\sum\\limits_{k=1}^{n} hoặc \\prod\\limits_{i=1}^{2026}) để giới hạn hiển thị ngay ngắn phía trên và phía dưới ký hiệu và có kích thước to rõ như sách giáo khoa.
- BẮT BUỘC GIỮ NGUYÊN các đoạn mã vẽ hình vector <svg>...</svg> hoặc bảng dữ liệu <table>...</table> có sẵn trong văn bản đề thi thô. Hãy lồng trực tiếp các đoạn mã này vào nội dung câu hỏi "question" hoặc phần ngữ liệu của nhóm mà không được tự ý xóa bỏ hay lược dịch thành chữ.
- Nếu câu hỏi có liên quan đến hình ảnh tải lên từ máy tính, hãy để trống trường "image_url": "". Giáo viên sẽ tự tải ảnh lên sau.
`;

              var apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
              var response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  contents: [
                    {
                      role: "user",
                      parts: [
                        {
                          text: systemInstruction + "\n\nNỘI DUNG ĐỀ THI CẦN PHÂN TÍCH:\n" + rawText
                        }
                      ]
                    }
                  ],
                  generationConfig: {
                    responseMimeType: "application/json"
                  }
                })
              });

              if (!response.ok) {
                var errBody = await response.text();
                throw new Error(`Gemini API trả về lỗi: ${response.status} - ${errBody}`);
              }

              var resData = await response.json();
              var jsonText = resData.candidates[0].content.parts[0].text;
              var imported = JSON.parse(jsonText.trim());

              if (!imported || !imported.sections) {
                throw new Error("Không thể trích xuất cấu trúc đề thi hợp lệ từ AI!");
              }

              if (window.confirm("✓ AI đã phân tích đề thành công! Bạn có chắc chắn muốn nạp toàn bộ câu hỏi này vào phần cấu trúc đề hiện tại không?")) {
                if (!exam.sections) exam.sections = [];
                
                imported.sections.forEach(function (newSec) {
                  var existSecIdx = exam.sections.findIndex(function (s) { return s.section_id === newSec.section_id; });
                  if (existSecIdx !== -1) {
                    var existSec = exam.sections[existSecIdx];
                    if (newSec.section_id === "math") {
                      existSec.questions = existSec.questions || [];
                      (newSec.questions || []).forEach(function (newQ) {
                        var existQIdx = existSec.questions.findIndex(function (q) { return q.question_no === newQ.question_no; });
                        if (existQIdx !== -1) {
                          existSec.questions[existQIdx] = newQ;
                        } else {
                          existSec.questions.push(newQ);
                        }
                      });
                      existSec.questions.sort(function (a, b) { return (a.question_no || 0) - (b.question_no || 0); });
                    } else {
                      existSec.groups = existSec.groups || [];
                      (newSec.groups || []).forEach(function (newG) {
                        var existGIdx = existSec.groups.findIndex(function (g) {
                          return g.group_id === newG.group_id || g.title === newG.title;
                        });
                        if (existGIdx !== -1) {
                          var existG = existSec.groups[existGIdx];
                          if (newG.stimulus && newG.stimulus.content) {
                            existG.stimulus = newG.stimulus;
                          }
                          if (newG.title) {
                            existG.title = newG.title;
                          }
                          existG.questions = existG.questions || [];
                          (newG.questions || []).forEach(function (newQ) {
                            var existQIdx = existG.questions.findIndex(function (q) { return q.question_no === newQ.question_no; });
                            if (existQIdx !== -1) {
                              existG.questions[existQIdx] = newQ;
                            } else {
                              existG.questions.push(newQ);
                            }
                          });
                          existG.questions.sort(function (a, b) { return (a.question_no || 0) - (b.question_no || 0); });
                        } else {
                          existSec.groups.push(newG);
                        }
                      });
                    }
                  } else {
                    exam.sections.push(newSec);
                  }
                });

                ensureSchema();
                saveDraft();
                renderAll();
                window.alert("✓ Đã nạp thành công toàn bộ câu hỏi từ AI! Bạn có thể chuyển qua các tab Toán, Đọc hiểu, Khoa học để kiểm tra và sau đó bấm 'Lưu lên Supabase Cloud' để hoàn tất.");
              }
            } catch (err) {
              console.error(err);
              window.alert("Có lỗi xảy ra khi gọi AI phân tích đề:\n" + err.message);
            } finally {
              aiRunBtn.disabled = false;
              aiRunBtn.textContent = originalText;
            }
          });
        }
        var dlIdxBtn = $("#download-index-button");
        if (dlIdxBtn) {
          dlIdxBtn.addEventListener("click", function () {
            downloadJson("index.json", getIndexListWithCurrent());
          });
        }
        var saveProjBtn = $("#save-project-button");
        if (saveProjBtn) {
          saveProjBtn.addEventListener("click", function () {
            saveToProjectFolder().catch(function (error) {
              console.error(error);
              window.alert("Không lưu được vào thư mục dự án. Bạn vẫn có thể tải JSON rồi đặt file thủ công.");
            });
          });
        }
        var uploadCloudBtn = $("#upload-supabase-button");
        if (uploadCloudBtn) {
          uploadCloudBtn.addEventListener("click", function () {
            saveToSupabaseCloud().catch(function (error) {
              console.error(error);
              window.alert("Lỗi không mong muốn: " + error);
            });
          });
        }
      }

                  // ─── LMS COURSE & LESSON & CODE & SECURITY MANAGEMENT (TEACHER PANEL) ───────────
    var activeCourseId = null;
    var activeLessonId = null;
    lmsCourses = [];

    // Helper: show modal
    function openModal(modalId) {
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = "flex";
      }
    }

    // Helper: close modal
    function closeModal(modalId) {
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = "none";
      }
    }

    // 1. COURSES MANAGEMENT
    async function renderManageCourses() {
      // Toggle views
      var listView = document.getElementById("lms-courses-list-view");
      var editorView = document.getElementById("lms-course-editor-view");
      if (listView) listView.style.display = "block";
      if (editorView) editorView.style.display = "none";

      var container = document.getElementById("lms-courses-grid");
      if (!container) return;
      container.innerHTML = "<p style='color:var(--muted); grid-column: 1 / -1; text-align: center;'>Đang tải danh sách khóa học...</p>";

      var selectDropdown = document.getElementById("lms-new-code-course-select");
      if (selectDropdown) selectDropdown.innerHTML = "";

      var manualEnrollSelect = document.getElementById("lms-enroll-course-select");
      if (manualEnrollSelect) manualEnrollSelect.innerHTML = "";

      try {
        if (supabaseClient) {
          // Fetch real Supabase courses
          var { data: dbCourses, error: err } = await supabaseClient
            .from("courses")
            .select("*")
            .order("created_at", { ascending: false });

          if (err) throw err;
          lmsCourses = dbCourses || [];
        } else {
          // Offline fallback
          var saved = localStorage.getItem("tmaTsaMockCourses");
          if (saved) {
            lmsCourses = JSON.parse(saved);
          } else {
            lmsCourses = [
              {
                id: "thpt-math-luyen-de",
                title: "Khoá Luyện Đề THPT Môn Toán",
                description: "Luyện đề thi thử tốt nghiệp THPT Quốc gia bám sát cấu trúc đề minh họa mới nhất.",
                teacher: "Trần Hoàng Anh",
                category: "THPT",
                cover_image: "https://assets.tmastudy.io.vn/assets/thpt.png"
              }
            ];
            localStorage.setItem("tmaTsaMockCourses", JSON.stringify(lmsCourses));
          }
        }
      } catch (e) {
        console.warn("Failed to fetch courses from Supabase, using local fallback:", e);
        lmsCourses = JSON.parse(localStorage.getItem("tmaTsaMockCourses") || "[]");
      }

      if (lmsCourses.length === 0) {
        container.innerHTML = "<p style='color:var(--muted); grid-column: 1 / -1; text-align:center; padding: 20px 0;'>Chưa có khóa học nào. Hãy nhấn nút 'Thêm khóa học mới' để bắt đầu!</p>";
        return;
      }

      // Pre-fetch/calculate lesson counts for all courses
      var lessonsCountMap = {};
      try {
        if (supabaseClient) {
          var { data: allLessons } = await supabaseClient.from("lessons").select("id, course_id");
          (allLessons || []).forEach(function(l) {
            lessonsCountMap[l.course_id] = (lessonsCountMap[l.course_id] || 0) + 1;
          });
        } else {
          var mockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
          mockLessons.forEach(function(l) {
            lessonsCountMap[l.course_id] = (lessonsCountMap[l.course_id] || 0) + 1;
          });
        }
      } catch (ce) {
        console.warn("Failed to fetch lesson counts:", ce);
      }

      container.innerHTML = "";
      lmsCourses.forEach(function(course) {
        // Populate dropdown select for codes creation
        if (selectDropdown) {
          var opt = document.createElement("option");
          opt.value = course.id;
          opt.textContent = course.title;
          selectDropdown.appendChild(opt);
        }

        // Populate dropdown select for manual enrollment
        if (manualEnrollSelect) {
          var optEnroll = document.createElement("option");
          optEnroll.value = course.id;
          optEnroll.textContent = course.title;
          manualEnrollSelect.appendChild(optEnroll);
        }

        // Create Grid Card
        var card = document.createElement("div");
        card.className = "course-card";
        
        var coverUrl = course.cover_image || (course.category === "THPT" ? "https://assets.tmastudy.io.vn/assets/thpt.png" : "https://assets.tmastudy.io.vn/assets/anhnen.png");
        var count = lessonsCountMap[course.id] || 0;

        card.innerHTML = `
          <div class="course-hero" style="background-image: url('${coverUrl}')"></div>
          <div class="course-body">
            <h4 class="course-name">${esc(course.title)}</h4>
            <p class="course-desc">${esc(course.category)} | ${esc(course.teacher || "TMA TSA")}</p>
            <div class="divider"></div>
            <div class="course-footer">
              <span class="lesson-count">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>${count} bài học</span>
              </span>
              <button class="enter-btn" onclick="selectCourseForEditing('${course.id}')" type="button">Chỉnh sửa</button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      // If active course is still in list, keep it selected, else select first
      if (activeCourseId) {
        var exists = lmsCourses.some(function(c) { return c.id === activeCourseId; });
        if (!exists) activeCourseId = lmsCourses[0].id;
      } else {
        activeCourseId = lmsCourses.length ? lmsCourses[0].id : null;
      }
    }

    function selectCourseForEditing(courseId) {
      activeCourseId = courseId;
      var listView = document.getElementById("lms-courses-list-view");
      var editorView = document.getElementById("lms-course-editor-view");
      if (listView) listView.style.display = "none";
      if (editorView) editorView.style.display = "block";
      renderCourseDetails();
    }
    window.selectCourseForEditing = selectCourseForEditing;

    function backToCoursesList() {
      var listView = document.getElementById("lms-courses-list-view");
      var editorView = document.getElementById("lms-course-editor-view");
      if (listView) listView.style.display = "block";
      if (editorView) editorView.style.display = "none";
      renderManageCourses();
    }
    window.backToCoursesList = backToCoursesList;

    async function renderCourseDetails() {
      var editorCard = document.getElementById("lms-course-editor-card");
      if (!editorCard || !activeCourseId) return;

      var course = lmsCourses.find(function(c) { return c.id === activeCourseId; });
      if (!course) {
        editorCard.style.display = "none";
        return;
      }

      editorCard.style.display = "block";

      // Bind basic info
      document.getElementById("lms-editor-course-name").textContent = course.title;
      document.getElementById("lms-editor-course-category").textContent = "Danh mục: " + course.category;
      document.getElementById("lms-editor-course-desc").textContent = course.description || "";
      
      var coverUrl = course.cover_image || (course.category === "THPT" ? "https://assets.tmastudy.io.vn/assets/thpt.png" : "https://assets.tmastudy.io.vn/assets/anhnen.png");
      document.getElementById("lms-editor-course-cover").style.backgroundImage = "url('" + coverUrl + "')";

      // Load lessons list
      var lessonsContainer = document.getElementById("lms-lessons-list-container");
      lessonsContainer.innerHTML = "<p style='color:var(--muted);'>Đang tải danh sách bài học...</p>";

      var lessonsList = [];
      try {
        if (supabaseClient) {
          var { data: dbLessons, error: err } = await supabaseClient
            .from("lessons")
            .select("*")
            .eq("course_id", activeCourseId)
            .order("order_index", { ascending: true })
            .order("created_at", { ascending: true });

          if (err) throw err;
          lessonsList = dbLessons || [];
        } else {
          // Offline mock lessons
          var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
          lessonsList = allMockLessons.filter(function(l) { return l.course_id === activeCourseId; });
        }
      } catch (e) {
        console.warn("Failed to fetch lessons from Supabase, using local fallback:", e);
        var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
        lessonsList = allMockLessons.filter(function(l) { return l.course_id === activeCourseId; });
      }

      // Define SVGs
      var SVG_PLAY = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="#475569" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.85; display:inline-block; vertical-align:middle;"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="none" stroke="#475569" stroke-width="1.8"></polygon></svg>`;
      var SVG_DOC = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="#16a34a" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
      var SVG_TEST = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="#b45309" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="2"></rect><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="16" x2="13" y2="16"></line></svg>`;

      function getLessonType(title) {
        var raw = (title || "").trim();
        if (raw.startsWith("↳") || raw.startsWith("&rarr;") || raw.startsWith("->")) return "phan";
        var t = raw.toLowerCase();
        if (t.startsWith("phần") || t.startsWith("phan") || t.startsWith("phân") || t.startsWith("phản") || t.match(/^p\d/)) return "phan";
        if (t.startsWith("tài liệu") || t.startsWith("tai lieu") || t.startsWith("file")) return "document";
        if (t.startsWith("thi online") || t.startsWith("bài tập kiểm tra") || t.startsWith("bài kiểm tra")) return "test";
        return "bai"; // default
      }

      if (lessonsList.length === 0) {
        lessonsContainer.innerHTML = `
          <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
            <button class="btn btn-primary btn-sm" onclick="showAddChapterPrompt()" style="font-weight: 700; background: #0f5a9e; border-color: #0f5a9e;">+ Thêm chương mới</button>
          </div>
          <div style="padding: 40px 20px; text-align: center; background: #ffffff; border-radius: 12px; border: 1px dashed #cbd5e1; color: var(--muted); font-size: 13.5px;">
            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" fill="none" stroke-width="1.5" style="margin: 0 auto 12px; display: block; opacity: 0.4;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Chưa có bài học hoặc chuyên đề nào trong khóa học này. Hãy bấm nút phía trên để bắt đầu!
          </div>
        `;
        return;
      }

      // Group lessons by chapter and sort chronologically by upload order (created_at)
      var chapters = {};
      var chapterMinCreatedAt = {};
      lessonsList.forEach(function(lesson, idx) {
        var chName = lesson.chapter_name || "Chương 1: Bài học cơ bản";
        if (!chapters[chName]) {
          chapters[chName] = [];
        }
        chapters[chName].push(lesson);
        
        var lessonCreated = lesson.created_at ? new Date(lesson.created_at).getTime() : idx;
        if (chapterMinCreatedAt[chName] === undefined || lessonCreated < chapterMinCreatedAt[chName]) {
          chapterMinCreatedAt[chName] = lessonCreated;
        }
      });
      
      var chapterOrder = Object.keys(chapters);
      chapterOrder.sort(function(a, b) {
        var timeA = chapterMinCreatedAt[a] || 0;
        var timeB = chapterMinCreatedAt[b] || 0;
        return timeA - timeB;
      });

      lessonsContainer.innerHTML = "";
      lessonsContainer.style.cssText = "padding: 0; background: transparent; border: none;";

      // Top action header
      var actionHeader = document.createElement("div");
      actionHeader.style.cssText = "display: flex; justify-content: flex-end; margin-bottom: 16px;";
      actionHeader.innerHTML = `
        <button class="btn btn-primary btn-sm" onclick="showAddChapterPrompt()" style="font-weight: 700; background: #0f5a9e; border-color: #0f5a9e;">
          + Thêm chương mới
        </button>
      `;
      lessonsContainer.appendChild(actionHeader);

      function getLessonSortKey(title) {
        var t = String(title || "").toLowerCase().trim();
        var phanMatch = t.match(/(?:ph[aầ]n|p)\s*(\d+)\.(\d+)/i);
        if (phanMatch) {
          return [parseInt(phanMatch[1], 10), parseInt(phanMatch[2], 10), 1];
        }
        var numMatch = t.match(/(?:c[aâ]u|b[aà]i)\s*(\d+)/i);
        if (numMatch) {
          return [parseInt(numMatch[1], 10), 0, 0];
        }
        var generalNumMatch = t.match(/(\d+)/);
        if (generalNumMatch) {
          return [parseInt(generalNumMatch[1], 10), 0, 2];
        }
        return [9999, 0, 3];
      }

      function compareLessonSortKeys(a, b) {
        var keyA = getLessonSortKey(a.title);
        var keyB = getLessonSortKey(b.title);
        if (keyA[0] !== keyB[0]) return keyA[0] - keyB[0];
        if (keyA[1] !== keyB[1]) return keyA[1] - keyB[1];
        if (keyA[2] !== keyB[2]) return keyA[2] - keyB[2];
        if ((a.order_index || 0) !== (b.order_index || 0)) {
          return (a.order_index || 0) - (b.order_index || 0);
        }
        return a.title.localeCompare(b.title);
      }

      // Render chapters and lessons tree-view list
      chapterOrder.forEach(function(chName) {
        var chapterLessons = chapters[chName];
        chapterLessons.sort(compareLessonSortKeys);

        var chBlock = document.createElement("div");
        chBlock.style.cssText = "margin-bottom: 16px;";

        // Chapter Header row
        var chHeaderRow = document.createElement("div");
        chHeaderRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #e2e8f0; border-radius: 8px; cursor: pointer; user-select: none;";
        
        var chLeftGroup = document.createElement("div");
        chLeftGroup.style.cssText = "display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;";
        
        // Collapse toggle button (chevron)
        var collapseBtn = document.createElement("button");
        collapseBtn.type = "button";
        collapseBtn.style.cssText = "background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; color: #64748b; transition: transform 0.2s; flex-shrink: 0;";
        collapseBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        collapseBtn.title = "Thu gọn / Mở rộng";
        chLeftGroup.appendChild(collapseBtn);
        
        // Chapter name
        var chNameSpan = document.createElement("span");
        chNameSpan.style.cssText = "font-weight: 800; font-size: 13px; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
        chNameSpan.textContent = chName;
        chLeftGroup.appendChild(chNameSpan);
        
        chHeaderRow.appendChild(chLeftGroup);
        
        // Right group: rename + add lesson buttons
        var chRightGroup = document.createElement("div");
        chRightGroup.style.cssText = "display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: 8px;";
        
        // Nút đổi tên chương
        var btnRename = document.createElement("button");
        btnRename.type = "button";
        btnRename.className = "btn btn-outline btn-xs";
        btnRename.style.cssText = "font-size: 11px; font-weight: 600; color: #475569; border-color: #cbd5e1; background: #ffffff; padding: 2px 8px; cursor: pointer;";
        btnRename.title = "Đổi tên chương";
        btnRename.textContent = "✏️ Đổi tên";
        btnRename.addEventListener("click", function(e) {
          e.stopPropagation();
          renameChapter(chName);
        });
        chRightGroup.appendChild(btnRename);

        // Nút thêm bài giảng
        var btnAddLesson = document.createElement("button");
        btnAddLesson.type = "button";
        btnAddLesson.className = "btn btn-outline btn-xs";
        btnAddLesson.style.cssText = "font-size: 11px; font-weight: 700; color: #0f5a9e; border-color: #0f5a9e; background: #ffffff; padding: 2px 10px; cursor: pointer;";
        btnAddLesson.textContent = "+ Thêm bài";
        btnAddLesson.addEventListener("click", function(e) {
          e.stopPropagation();
          showAddLessonForChapter(chName);
        });
        chRightGroup.appendChild(btnAddLesson);

        chHeaderRow.appendChild(chRightGroup);
        chBlock.appendChild(chHeaderRow);

        // Lessons container (collapsible)
        var lessonsWrapper = document.createElement("div");
        lessonsWrapper.style.cssText = "display: flex; flex-direction: column; gap: 0; overflow: hidden; transition: all 0.2s ease;";
        var isCollapsed = false;

        // Toggle collapse on header click
        chHeaderRow.onclick = function(e) {
          // Don't toggle if clicking buttons
          if (e.target.closest("button")) return;
          isCollapsed = !isCollapsed;
          if (isCollapsed) {
            lessonsWrapper.style.display = "none";
            collapseBtn.style.transform = "rotate(-90deg)";
          } else {
            lessonsWrapper.style.display = "flex";
            collapseBtn.style.transform = "rotate(0deg)";
          }
        };
        collapseBtn.onclick = function(e) {
          e.stopPropagation();
          isCollapsed = !isCollapsed;
          if (isCollapsed) {
            lessonsWrapper.style.display = "none";
            collapseBtn.style.transform = "rotate(-90deg)";
          } else {
            lessonsWrapper.style.display = "flex";
            collapseBtn.style.transform = "rotate(0deg)";
          }
        };

        // Lessons of this chapter
        chapterLessons.forEach(function(lesson) {
          var type = lesson.type === "header" ? "header" : getLessonType(lesson.title);
          var lessonRow = document.createElement("div");
          
          var previewTag = lesson.preview_allowed ? ` <span style="font-size: 9px; background: #e2fbe8; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 800; text-transform: uppercase; margin-left: 6px; display: inline-block; vertical-align: middle;">Free</span>` : "";

          if (type === "header") {
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 8px; margin-bottom: 4px; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #64748b; font-size: 15px; display: inline-flex; align-items: center; justify-content: center;">📌</span>
                <span style="font-weight: 800; color: #0f5a9e; font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.5px;">${esc(lesson.title)}</span>
              </div>
            `;
          } else if (type === "phan") {
            // Thụt lề sub-item phẳng
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; margin-left: 24px; position: relative; transition: all 0.15s;";
            
            // Draw connector line
            var connLine = document.createElement("div");
            connLine.style.cssText = "position: absolute; left: -14px; top: 0; bottom: 0; width: 1px; background: #cbd5e1;";
            lessonRow.appendChild(connLine);

            lessonRow.innerHTML += `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #94a3b8; font-weight: 700; font-size: 13px;">↳</span>
                <span style="color: #64748b; font-size: 13px; display: inline-flex; align-items: center; justify-content: center;">${SVG_PLAY}</span>
                <span style="font-weight: 600; color: #334155; font-size: 13px;">${esc(lesson.title)}</span>
                ${previewTag}
              </div>
            `;
          } else if (type === "document") {
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #16a34a; display: inline-flex; align-items: center; justify-content: center;">${SVG_DOC}</span>
                <span style="font-weight: 600; color: #334155; font-size: 13px;">${esc(lesson.title)}</span>
                ${previewTag}
              </div>
            `;
          } else if (type === "test") {
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #b45309; display: inline-flex; align-items: center; justify-content: center;">${SVG_TEST}</span>
                <span style="font-weight: 600; color: #334155; font-size: 13px;">${esc(lesson.title)}</span>
                ${previewTag}
              </div>
            `;
          } else {
            // Main lesson row (Bài) phẳng
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #64748b; font-size: 15px; display: inline-flex; align-items: center; justify-content: center;">${SVG_PLAY}</span>
                <span style="font-weight: 700; color: #1e293b; font-size: 13.5px;">${esc(lesson.title)}</span>
                ${previewTag}
              </div>
            `;
          }

          // Right controls container
          var rightControls = document.createElement("div");
          rightControls.style.cssText = "display: flex; align-items: center; gap: 16px; flex-shrink: 0; margin-left: 12px;";

          // Media badges
          var mediaBadges = document.createElement("div");
          mediaBadges.style.cssText = "font-size: 11px; color: #64748b; display: flex; gap: 8px; align-items: center;";
          
          var hasVideo = !!lesson.video_drive_id;
          var hasDoc = !!lesson.doc_link;
          
          if (type === "header") {
            // No media toggles
          } else if (type !== "document" && type !== "test") {
            // Video button
            var btnVideo = document.createElement("button");
            btnVideo.className = "btn-media-toggle";
            btnVideo.type = "button";
            btnVideo.style.cssText = "cursor: pointer; border: 1px solid " + (hasVideo ? "#bfdbfe" : "#e2e8f0") + "; background: " + (hasVideo ? "#eff6ff" : "#ffffff") + "; color: " + (hasVideo ? "#1d4ed8" : "#94a3b8") + "; padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; gap: 4px; transition: all 0.15s; outline: none;";
            btnVideo.innerHTML = `Video <span style="font-size: 9px; color: ${hasVideo ? '#22c55e' : '#ef4444'};">${hasVideo ? '● Có' : '○ Trống'}</span>`;
            btnVideo.onclick = function(lessonId) {
              return function() { openLessonMediaEditor(lessonId, 'video'); };
            }(lesson.id);
            
            // PDF button
            var btnPdf = document.createElement("button");
            btnPdf.className = "btn-media-toggle";
            btnPdf.type = "button";
            btnPdf.style.cssText = "cursor: pointer; border: 1px solid " + (hasDoc ? "#bbf7d0" : "#e2e8f0") + "; background: " + (hasDoc ? "#f0fdf4" : "#ffffff") + "; color: " + (hasDoc ? "#15803d" : "#94a3b8") + "; padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; gap: 4px; transition: all 0.15s; outline: none;";
            btnPdf.innerHTML = `PDF <span style="font-size: 9px; color: ${hasDoc ? '#22c55e' : '#ef4444'};">${hasDoc ? '● Có' : '○ Trống'}</span>`;
            btnPdf.onclick = function(lessonId) {
              return function() { openLessonMediaEditor(lessonId, 'doc'); };
            }(lesson.id);

            mediaBadges.appendChild(btnVideo);
            mediaBadges.appendChild(btnPdf);
          } else if (type === "document") {
            var btnPdf = document.createElement("button");
            btnPdf.className = "btn-media-toggle";
            btnPdf.type = "button";
            btnPdf.style.cssText = "cursor: pointer; border: 1px solid " + (hasDoc ? "#bbf7d0" : "#e2e8f0") + "; background: " + (hasDoc ? "#f0fdf4" : "#ffffff") + "; color: " + (hasDoc ? "#15803d" : "#94a3b8") + "; padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; gap: 4px; transition: all 0.15s; outline: none;";
            btnPdf.innerHTML = `Link Drive <span style="font-size: 9px; color: ${hasDoc ? '#22c55e' : '#ef4444'};">${hasDoc ? '● Có' : '○ Trống'}</span>`;
            btnPdf.onclick = function(lessonId) {
              return function() { openLessonMediaEditor(lessonId, 'doc'); };
            }(lesson.id);
            
            mediaBadges.appendChild(btnPdf);
          } else {
            mediaBadges.innerHTML = `<span style="background: #fff8e1; color: #b45309; padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; display: inline-block;">Bài kiểm tra</span>`;
          }
          rightControls.appendChild(mediaBadges);

          // Action buttons
          var actionButtons = document.createElement("div");
          actionButtons.style.cssText = "display: flex; gap: 6px;";
          
          var addBranchBtnHtml = (type === "bai" || type === "header" || type === "phan") ? `<button class="btn btn-outline btn-xs" type="button" onclick="showAddSubLessonForLesson('${escJs(chName)}', '${escJs(lesson.title)}')" style="padding: 2px 8px; font-size: 11px; color: #0f5a9e; border-color: #0f5a9e;" title="Thêm nhánh con (Phần...)">+ Thêm nhánh</button>` : '';
          
          actionButtons.innerHTML = `
            ${addBranchBtnHtml}
            <button class="btn btn-outline btn-xs" type="button" onclick="showEditLessonModal('${lesson.id}')" style="padding: 2px 8px; font-size: 11px; border-color: #cbd5e1;">Sửa</button>
            <button class="btn btn-danger btn-xs" type="button" onclick="deleteLmsLesson('${lesson.id}')" style="padding: 2px 8px; font-size: 11px;">Xóa</button>
          `;
          rightControls.appendChild(actionButtons);
          
          lessonRow.appendChild(rightControls);
          
          // Hover effect
          lessonRow.onmouseenter = function() {
            if (type === "header") {
              lessonRow.style.background = "#f1f5f9";
            } else {
              lessonRow.style.background = "rgba(15, 90, 158, 0.04)";
            }
          };
          lessonRow.onmouseleave = function() {
            if (type === "header") {
              lessonRow.style.background = "#f8fafc";
            } else {
              lessonRow.style.background = "transparent";
            }
          };

          lessonsWrapper.appendChild(lessonRow);
        });

        chBlock.appendChild(lessonsWrapper);
        lessonsContainer.appendChild(chBlock);
      });
    }

    function escJs(str) {
      return (str || "").replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    async function renameChapter(oldName) {
      var newName = prompt("Đổi tên chương:", oldName);
      if (!newName || !newName.trim() || newName.trim() === oldName) return;
      newName = newName.trim();
      if (!activeCourseId) {
        alert("Không thể kết nối database. Vui lòng tải lại trang.");
        return;
      }
      try {
        if (supabaseClient) {
          var { error } = await supabaseClient
            .from("lessons")
            .update({ chapter_name: newName })
            .eq("course_id", activeCourseId)
            .eq("chapter_name", oldName);
          if (error) throw error;
        } else {
          var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
          var renamedAny = false;
          allMockLessons = allMockLessons.map(function(lesson) {
            if (lesson.course_id === activeCourseId && (lesson.chapter_name || oldName) === oldName) {
              renamedAny = true;
              return Object.assign({}, lesson, { chapter_name: newName });
            }
            return lesson;
          });
          if (!renamedAny) {
            throw new Error("Không tìm thấy chương cần đổi tên.");
          }
          localStorage.setItem("tmaTsaMockLessons", JSON.stringify(allMockLessons));
        }
        await renderCourseDetails();
      } catch(e) {
        await window.showCustomAlert("Lỗi đổi tên chương: " + (e.message || e));
      }
    }

    function showAddChapterPrompt() {
      var chName = prompt("Nhập tên chương / chuyên đề mới:");
      if (chName && chName.trim()) {
        showAddLessonForChapter(chName.trim());
      }
    }
    window.showAddChapterPrompt = showAddChapterPrompt;

    function showAddLessonForChapter(chName) {
      showAddLessonModal();
      var chInput = document.getElementById("lms-lesson-modal-chapter");
      if (chInput) {
        chInput.value = chName;
      }
    }
    window.showAddLessonForChapter = showAddLessonForChapter;

    function showAddSubLessonForLesson(chName, parentTitle) {
      showAddLessonModal();
      document.getElementById("lms-lesson-modal-chapter").value = chName;
      
      // Auto extract number from parent title e.g. "Bài 1: ..." -> "Phần 1.1: "
      var matchNum = parentTitle.match(/Bài\s*(\d+)/i);
      var nextPartPrefix = "Phần 1.1: ";
      if (parentTitle.toLowerCase().indexOf("đề thi thử hsa số") !== -1) {
        var matchHsaNum = parentTitle.match(/HSA\s*số\s*(\d+)/i);
        if (matchHsaNum && matchHsaNum[1]) {
          nextPartPrefix = "Phần " + matchHsaNum[1] + ".1: ";
        }
      } else if (matchNum && matchNum[1]) {
        nextPartPrefix = "Phần " + matchNum[1] + ".1: ";
      }
      document.getElementById("lms-lesson-modal-name").value = nextPartPrefix;
      document.getElementById("lms-lesson-modal-name").focus();
    }
    window.showAddSubLessonForLesson = showAddSubLessonForLesson;

    async function openLessonMediaEditor(lessonId, fieldType) {
      await showEditLessonModal(lessonId);
      setTimeout(function() {
        if (fieldType === 'video') {
          var input = document.getElementById("lms-lesson-modal-drive-id");
          if (input) {
            input.focus();
            input.select();
          }
        } else {
          var input = document.getElementById("lms-lesson-modal-doc-link");
          if (input) {
            input.focus();
            input.select();
          }
        }
      }, 400);
    }
    window.openLessonMediaEditor = openLessonMediaEditor;

    // Modal Course Toggles
    function showAddCourseModal() {
      document.getElementById("lms-course-modal-title").textContent = "Thêm khóa học mới";
      document.getElementById("lms-course-modal-id").value = "";
      document.getElementById("lms-course-modal-form").reset();
      openModal("lms-course-modal");
    }

    function showEditCourseModal() {
      var course = lmsCourses.find(function(c) { return c.id === activeCourseId; });
      if (!course) return;

      document.getElementById("lms-course-modal-title").textContent = "Chỉnh sửa khóa học";
      document.getElementById("lms-course-modal-id").value = course.id;
      document.getElementById("lms-course-modal-name").value = course.title;
      document.getElementById("lms-course-modal-category").value = course.category;
      document.getElementById("lms-course-modal-desc").value = course.description || "";
      document.getElementById("lms-course-modal-teacher").value = course.teacher;
      document.getElementById("lms-course-modal-cover").value = course.cover_image || "";
      
      openModal("lms-course-modal");
    }

    function closeLmsCourseModal() {
      closeModal("lms-course-modal");
    }

    async function saveLmsCourse(e) {
      if (e) e.preventDefault();

      var id = document.getElementById("lms-course-modal-id").value;
      var name = document.getElementById("lms-course-modal-name").value.trim();
      var category = document.getElementById("lms-course-modal-category").value;
      var desc = document.getElementById("lms-course-modal-desc").value.trim();
      var teacher = document.getElementById("lms-course-modal-teacher").value.trim();
      var cover = document.getElementById("lms-course-modal-cover").value.trim();

      try {
        if (supabaseClient) {
          if (id) {
            // Update
            var { error } = await supabaseClient
              .from("courses")
              .update({
                title: name,
                category: category,
                description: desc,
                teacher: teacher,
                cover_image: cover
              })
              .eq("id", id);
            if (error) throw error;
          } else {
            // Insert
            var { error } = await supabaseClient
              .from("courses")
              .insert({
                title: name,
                category: category,
                description: desc,
                teacher: teacher,
                cover_image: cover
              });
            if (error) throw error;
          }
        } else {
          // Offline mock save
          var mockId = id || "mock-" + Math.floor(Math.random() * 100000);
          var courseObj = {
            id: mockId,
            title: name,
            category: category,
            description: desc,
            teacher: teacher,
            cover_image: cover
          };

          if (id) {
            lmsCourses = lmsCourses.map(function(c) { return c.id === id ? courseObj : c; });
          } else {
            lmsCourses.push(courseObj);
          }
          localStorage.setItem("tmaTsaMockCourses", JSON.stringify(lmsCourses));
        }

        if (!id) {
          await showCustomAlert("Lưu thông tin khóa học thành công!");
        }
        closeLmsCourseModal();
        
        // Refresh grid
        renderManageCourses();
      } catch (err) {
        console.error(err);
        await showCustomAlert("Gặp lỗi khi lưu khóa học: " + (err.message || err));
      }
    }

    async function deleteActiveCourse() {
      if (!activeCourseId) return;
      var course = lmsCourses.find(function(c) { return c.id === activeCourseId; });
      if (!course) return;

      if (await showCustomConfirm(`Bạn có chắc chắn muốn xóa vĩnh viễn khóa học "${course.title}"? Tất cả bài học liên quan sẽ bị xóa sạch.`)) {
        try {
          if (supabaseClient) {
            var { error } = await supabaseClient
              .from("courses")
              .delete()
              .eq("id", activeCourseId);
            if (error) throw error;
          } else {
            lmsCourses = lmsCourses.filter(function(c) { return c.id !== activeCourseId; });
            localStorage.setItem("tmaTsaMockCourses", JSON.stringify(lmsCourses));
          }

          await showCustomAlert("Xóa khóa học thành công!");
          activeCourseId = null;
          renderManageCourses();
        } catch (err) {
          console.error(err);
          await showCustomAlert("Gặp lỗi khi xóa khóa học: " + (err.message || err));
        }
      }
    }

    // Modal Lessons Toggles
    function showAddLessonModal() {
      document.getElementById("lms-lesson-modal-title").textContent = "Thêm bài học mới";
      document.getElementById("lms-lesson-modal-id").value = "";
      document.getElementById("lms-lesson-modal-form").reset();
      document.getElementById("lms-lesson-modal-chapter").value = "Chương 1";
      document.getElementById("lms-lesson-modal-order").value = "0";
      
      openModal("lms-lesson-modal");
      onLmsLessonTypeChange();
    }

    async function showEditLessonModal(lessonId) {
      var lesson = null;
      try {
        if (supabaseClient) {
          var { data, error } = await supabaseClient
            .from("lessons")
            .select("*")
            .eq("id", lessonId)
            .single();
          if (error) throw error;
          lesson = data;
        } else {
          var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
          lesson = allMockLessons.find(function(l) { return l.id === lessonId; });
        }
      } catch (err) {
        console.error(err);
        var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
        lesson = allMockLessons.find(function(l) { return l.id === lessonId; });
      }

      if (!lesson) return;

      document.getElementById("lms-lesson-modal-title").textContent = "Chỉnh sửa bài học";
      document.getElementById("lms-lesson-modal-id").value = lesson.id;
      document.getElementById("lms-lesson-modal-chapter").value = lesson.chapter_name || "Chương 1";
      document.getElementById("lms-lesson-modal-name").value = lesson.title;
      
      var selectType = document.getElementById("lms-lesson-modal-type");
      var inputUrl = document.getElementById("lms-lesson-modal-drive-id");
      
      // Determine selection type and display link based on filled field
      if (lesson.type === "header") {
        selectType.value = "header";
        inputUrl.value = "";
      } else if (lesson.video_drive_id) {
        selectType.value = "video";
        inputUrl.value = lesson.video_drive_id;
      } else if (lesson.doc_link) {
        selectType.value = "pdf";
        inputUrl.value = lesson.doc_link;
      } else {
        // Fallback or default
        if (lesson.type === "pdf" || lesson.title.toLowerCase().indexOf("tài liệu") !== -1 || lesson.title.toLowerCase().indexOf("file") !== -1) {
          selectType.value = "pdf";
        } else {
          selectType.value = "video";
        }
        inputUrl.value = "";
      }

      document.getElementById("lms-lesson-modal-doc-link").value = lesson.doc_link || "";
      document.getElementById("lms-lesson-modal-order").value = lesson.order_index || 0;
      document.getElementById("lms-lesson-modal-preview").checked = lesson.preview_allowed || false;

      openModal("lms-lesson-modal");
      onLmsLessonTypeChange();
    }

    function closeLmsLessonModal() {
      closeModal("lms-lesson-modal");
    }

    function onLmsLessonTypeChange() {
      var select = document.getElementById("lms-lesson-modal-type");
      var label = document.getElementById("lms-lesson-modal-url-label");
      var input = document.getElementById("lms-lesson-modal-drive-id");
      var wrap = document.getElementById("lms-lesson-modal-drive-wrap");
      if (!select || !label || !input) return;
      
      if (select.value === "header") {
        if (wrap) wrap.style.display = "none";
        input.required = false;
        input.value = "";
      } else {
        if (wrap) wrap.style.display = "block";
        input.required = true;
        if (select.value === "video") {
          label.textContent = "Đường dẫn Video bài giảng (YouTube Link / Google Drive Link)";
          input.placeholder = "Dán link YouTube (ví dụ: https://youtu.be/...) hoặc link Drive vào đây";
        } else {
          label.textContent = "Đường dẫn Tài liệu PDF / Google Drive link";
          input.placeholder = "Dán link Drive tài liệu hoặc link file PDF vào đây";
        }
      }
    }
    window.onLmsLessonTypeChange = onLmsLessonTypeChange;

    async function saveLmsLesson(e) {
      if (e) e.preventDefault();

      var id = document.getElementById("lms-lesson-modal-id").value;
      var chapter = document.getElementById("lms-lesson-modal-chapter").value.trim() || "Chương 1";
      var name = document.getElementById("lms-lesson-modal-name").value.trim();
      var type = document.getElementById("lms-lesson-modal-type").value;
      var rawUrl = document.getElementById("lms-lesson-modal-drive-id").value.trim();
      
      var order = parseInt(document.getElementById("lms-lesson-modal-order").value) || 0;
      var preview = document.getElementById("lms-lesson-modal-preview").checked;

      var driveId = "";
      var docLink = "";

      if (type === "video") {
        if (rawUrl.includes("/folders/")) {
          alert("Lưu ý: Bạn đang nhập liên kết Thư mục (folders) của Google Drive. Vui lòng mở đúng tệp video, nhấn nút 'Chia sẻ' ở góc phải và chọn 'Sao chép liên kết' để lấy đúng link video.");
          return;
        }
        // Auto extract YouTube Video ID from full URL
        var ytMatch = rawUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^\"&?\/ ]{11})/i);
        if (ytMatch && ytMatch[1]) {
          driveId = ytMatch[1];
        } else {
          // Auto extract Google Drive Video File ID from full URL
          var driveMatch = rawUrl.match(/\/d\/([a-zA-Z0-9_-]{25,100})/);
          if (driveMatch && driveMatch[1]) {
            driveId = driveMatch[1];
          } else {
            driveId = rawUrl; // fallback
          }
        }
        docLink = "";
      } else if (type === "pdf") {
        driveId = "";
        docLink = rawUrl;
      } else {
        // header
        driveId = "";
        docLink = "";
      }

      try {
        if (supabaseClient) {
          if (id) {
            // Update
            var { error } = await supabaseClient
              .from("lessons")
              .update({
                chapter_name: chapter,
                title: name,
                type: type,
                video_drive_id: driveId,
                doc_link: docLink,
                order_index: order,
                preview_allowed: preview
              })
              .eq("id", id);
            if (error) throw error;
          } else {
            // Insert
            var { error } = await supabaseClient
              .from("lessons")
              .insert({
                course_id: activeCourseId,
                chapter_name: chapter,
                title: name,
                type: type,
                video_drive_id: driveId,
                doc_link: docLink,
                order_index: order,
                preview_allowed: preview
              });
            if (error) throw error;
          }
        } else {
          // Offline mock save
          var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
          var mockId = id || "mock-lesson-" + Math.floor(Math.random() * 100000);
          var lessonObj = {
            id: mockId,
            course_id: activeCourseId,
            chapter_name: chapter,
            title: name,
            type: type,
            video_drive_id: driveId,
            doc_link: docLink,
            order_index: order,
            preview_allowed: preview
          };

          if (id) {
            allMockLessons = allMockLessons.map(function(l) { return l.id === id ? lessonObj : l; });
          } else {
            allMockLessons.push(lessonObj);
          }
          localStorage.setItem("tmaTsaMockLessons", JSON.stringify(allMockLessons));
        }

        if (!id) {
          await showCustomAlert("Lưu thông tin bài học thành công!");
        }
        closeLmsLessonModal();
        renderCourseDetails();
      } catch (err) {
        console.error(err);
        await showCustomAlert("Gặp lỗi khi lưu bài học: " + (err.message || err));
      }
    }

    async function deleteLmsLesson(lessonId) {
      if (await showCustomConfirm("Bạn có chắc chắn muốn xóa bài học này khỏi khóa học?")) {
        try {
          if (supabaseClient) {
            var { error } = await supabaseClient
              .from("lessons")
              .delete()
              .eq("id", lessonId);
            if (error) throw error;
          } else {
            var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
            allMockLessons = allMockLessons.filter(function(l) { return l.id !== lessonId; });
            localStorage.setItem("tmaTsaMockLessons", JSON.stringify(allMockLessons));
          }

          await showCustomAlert("Xóa bài học thành công!");
          renderCourseDetails();
        } catch (err) {
          console.error(err);
          await showCustomAlert("Gặp lỗi khi xóa bài học: " + (err.message || err));
        }
      }
    }


    // 2. ACTIVATION CODES MANAGEMENT
    var lmsCodes = [];

    async function renderActivationCodes() {
      var tbody = document.getElementById("lms-codes-table-body");
      if (!tbody) return;
      tbody.innerHTML = "<tr><td colspan='5' style='padding:20px; text-align:center; color:var(--muted);'>Đang tải danh sách mã kích hoạt...</td></tr>";

      try {
        if (supabaseClient) {
          var { data: dbCodes, error: err } = await supabaseClient
            .from("activation_codes")
            .select(`
              id,
              code,
              course_id,
              max_uses,
              used_count,
              active,
              courses (
                title
              )
            `)
            .order("created_at", { ascending: false });

          if (err) throw err;
          lmsCodes = dbCodes || [];
        } else {
          // Offline fallback
          var saved = localStorage.getItem("tmaTsaMockCodes");
          if (saved) {
            lmsCodes = JSON.parse(saved);
          } else {
            lmsCodes = [
              {
                id: "mock-code-1",
                code: "123",
                course_id: "thpt-math-luyen-de",
                max_uses: 9999,
                used_count: 14,
                active: true,
                courses: { title: "Khoá Luyện Đề THPT Môn Toán" }
              }
            ];
            localStorage.setItem("tmaTsaMockCodes", JSON.stringify(lmsCodes));
          }
        }
      } catch (e) {
        console.warn("Failed to fetch codes from Supabase, using local fallback:", e);
        lmsCodes = JSON.parse(localStorage.getItem("tmaTsaMockCodes") || "[]");
      }

      if (lmsCodes.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='padding:30px; text-align:center; color:var(--muted);'>Chưa có mã kích hoạt nào được tạo.</td></tr>";
        return;
      }

      tbody.innerHTML = "";
      lmsCodes.forEach(function(codeObj) {
        var tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--border)";

        var courseTitle = codeObj.courses ? (codeObj.courses.title || "Khóa học") : "Khóa học (Mock)";
        var statusBadge = codeObj.active 
          ? `<span style="color:#15803d; background:#e2fbe8; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">Đang chạy</span>`
          : `<span style="color:#b9152a; background:#fee2e2; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">Tạm khóa</span>`;

        tr.innerHTML = `
          <td style="padding:12px 16px; font-weight:700; color:var(--brand); font-size:13px;">${codeObj.code}</td>
          <td style="padding:12px 16px; font-size:13px;">${courseTitle}</td>
          <td style="padding:12px 16px; font-size:13px; font-weight:600;">${codeObj.used_count || 0} / ${codeObj.max_uses || 1}</td>
          <td style="padding:12px 16px; font-size:13px;">${statusBadge}</td>
          <td style="padding:12px 16px; text-align:right; display:flex; gap:6px; justify-content:flex-end;">
            <button class="btn btn-outline btn-xs" type="button" onclick="toggleActivationCodeActive('${codeObj.id}', ${codeObj.active})">${codeObj.active ? 'Khóa' : 'Mở'}</button>
            <button class="btn btn-danger btn-xs" type="button" onclick="deleteActivationCode('${codeObj.id}')">Xóa</button>
          </td>
        `;

        tbody.appendChild(tr);
      });
    }

    function generateRandomCodeString() {
      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      var result = "VIP_";
      for (var i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      document.getElementById("lms-new-code-text").value = result;
    }

    async function saveActivationCode(e) {
      if (e) e.preventDefault();

      var code = document.getElementById("lms-new-code-text").value.trim().toUpperCase();
      var courseId = document.getElementById("lms-new-code-course-select").value;
      var maxUses = parseInt(document.getElementById("lms-new-code-max-uses").value) || 1;

      if (!courseId) {
        await showCustomAlert("Vui lòng tạo khóa học trước khi tạo mã kích hoạt!");
        return;
      }

      try {
        if (supabaseClient) {
          var { error } = await supabaseClient
            .from("activation_codes")
            .insert({
              code: code,
              course_id: courseId,
              max_uses: maxUses,
              used_count: 0,
              active: true
            });
          if (error) throw error;
        } else {
          // Offline mock save
          var course = lmsCourses.find(function(c) { return c.id === courseId; });
          var newCode = {
            id: "mock-code-" + Math.floor(Math.random() * 100000),
            code: code,
            course_id: courseId,
            max_uses: maxUses,
            used_count: 0,
            active: true,
            courses: { title: course ? course.title : "Khóa học Mock" }
          };
          lmsCodes.push(newCode);
          localStorage.setItem("tmaTsaMockCodes", JSON.stringify(lmsCodes));
        }

        await showCustomAlert(`Tạo thành công mã kích hoạt "${code}"!`);
        document.getElementById("lms-create-code-form").reset();
        
        renderActivationCodes();
      } catch (err) {
        console.error(err);
        await showCustomAlert("Lỗi khi tạo mã kích hoạt: " + (err.message || err));
      }
    }

    async function deleteActivationCode(codeId) {
      if (await showCustomConfirm("Bạn có chắc chắn muốn xóa mã kích hoạt này không?")) {
        try {
          if (supabaseClient) {
            var { error } = await supabaseClient
              .from("activation_codes")
              .delete()
              .eq("id", codeId);
            if (error) throw error;
          } else {
            lmsCodes = lmsCodes.filter(function(c) { return c.id !== codeId; });
            localStorage.setItem("tmaTsaMockCodes", JSON.stringify(lmsCodes));
          }
          await showCustomAlert("Xóa mã kích hoạt thành công!");
          renderActivationCodes();
        } catch (err) {
          console.error(err);
          await showCustomAlert("Gặp lỗi khi xóa mã kích hoạt: " + (err.message || err));
        }
      }
    }

    async function toggleActivationCodeActive(codeId, currentStatus) {
      try {
        if (supabaseClient) {
          var { error } = await supabaseClient
            .from("activation_codes")
            .update({ active: !currentStatus })
            .eq("id", codeId);
          if (error) throw error;
        } else {
          lmsCodes = lmsCodes.map(function(c) {
            if (c.id === codeId) {
              c.active = !currentStatus;
            }
            return c;
          });
          localStorage.setItem("tmaTsaMockCodes", JSON.stringify(lmsCodes));
        }
        renderActivationCodes();
      } catch (err) {
        console.error(err);
        await showCustomAlert("Lỗi khi thay đổi trạng thái mã: " + (err.message || err));
      }
    }

    // 3. MANUAL ENROLLMENT
    async function saveManualEnrollment(e) {
      if (e) e.preventDefault();

      var emailInput = document.getElementById("lms-enroll-student-email").value.trim();
      var courseId = document.getElementById("lms-enroll-course-select").value;

      if (!courseId) {
        await showCustomAlert("Vui lòng tạo khóa học trước khi cấp quyền!");
        return;
      }

      try {
        if (supabaseClient) {
          var { error } = await supabaseClient
            .from("enrollments")
            .insert({
              user_email: emailInput,
              course_id: courseId
            });

          if (error) {
            if (error.message.toLowerCase().includes("unique")) {
              await showCustomAlert(`Học sinh "${emailInput}" đã được cấp quyền học khóa này rồi!`);
            } else {
              throw error;
            }
          } else {
            await showCustomAlert(`Cấp quyền học tập thành công cho học sinh "${emailInput}"!`);
            document.getElementById("lms-manual-enroll-form").reset();
          }
        } else {
          // Offline mock save
          await showCustomAlert(`[Offline Mock] Cấp quyền mở khóa thành công cho học sinh "${emailInput}"!`);
          document.getElementById("lms-manual-enroll-form").reset();
        }

        // Sync to student's local storage immediately for same-browser testing
        try {
          var cleanEmail = emailInput.trim().toLowerCase();
          var studentObj = approvedStudents.find(function(s) {
            return String(s.email).toLowerCase() === cleanEmail;
          });
          var username = studentObj ? studentObj.username || studentObj.email.split("@")[0] : cleanEmail.split("@")[0];
          var key = "tmaTsaRegisteredCourses_" + username;
          var current = [];
          try {
            current = JSON.parse(localStorage.getItem(key) || "[]");
          } catch(e){}
          if (!current.includes(courseId)) {
            current.push(courseId);
            localStorage.setItem(key, JSON.stringify(current));
          }
        } catch(e) {
          console.warn("Failed to sync enrollment to local storage:", e);
        }

      } catch (err) {
        console.error(err);
        await showCustomAlert("Lỗi khi cấp quyền thủ công: " + (err.message || err));
      }
    }

    // 4. SECURITY LOGS & AUDITING (ACCOUNT SHARING ANOMALY DETECTION)
    var lmsLogs = [];

    async function renderSecurityLogs() {
      var tbody = document.getElementById("lms-security-logs-tbody");
      var warningsTbody = document.getElementById("lms-security-warnings-tbody");
      if (!tbody || !warningsTbody) return;

      tbody.innerHTML = "<tr><td colspan='6' style='padding:20px; text-align:center; color:var(--muted);'>Đang tải nhật ký xem video...</td></tr>";
      warningsTbody.innerHTML = "<tr><td colspan='5' style='padding:20px; text-align:center; color:var(--muted);'>Đang quét cảnh báo...</td></tr>";

      try {
        if (supabaseClient) {
          var { data: dbLogs, error: err } = await supabaseClient
            .from("video_view_logs")
            .select("*")
            .order("viewed_at", { ascending: false });

          if (err) throw err;
          lmsLogs = dbLogs || [];
        } else {
          // Offline mock read
          lmsLogs = JSON.parse(localStorage.getItem("tmaTsaLocalViewLogs") || "[]");
        }
      } catch (e) {
        console.warn("Failed to fetch security logs, using local fallback:", e);
        lmsLogs = JSON.parse(localStorage.getItem("tmaTsaLocalViewLogs") || "[]");
      }

      // Filter logs by search query
      var searchQuery = (document.getElementById("lms-logs-search")?.value || "").trim().toLowerCase();
      var filteredLogs = lmsLogs.filter(function(log) {
        return log.user_email.toLowerCase().includes(searchQuery);
      });

      // Render main logs table
      if (filteredLogs.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='padding:20px; text-align:center; color:var(--muted);'>Không tìm thấy lượt truy cập nào.</td></tr>";
      } else {
        tbody.innerHTML = "";
        filteredLogs.forEach(function(log) {
          var tr = document.createElement("tr");
          tr.style.borderBottom = "1px solid var(--border)";
          
          var timeStr = new Date(log.viewed_at).toLocaleString('vi-VN');
          var uaShort = log.user_agent ? (log.user_agent.includes("Chrome") ? "Chrome/Web" : log.user_agent.includes("Safari") ? "Safari/iOS" : "Mobile/Device") : "Unknown";

          tr.innerHTML = `
            <td style="padding:12px 16px; font-weight:700; font-size:13px;">${log.user_email}</td>
            <td style="padding:12px 16px; font-size:13px; font-weight:600;">${log.lesson_title || "Bài học"}</td>
            <td style="padding:12px 16px; font-size:13px; color:var(--muted);">${log.course_title || "Khóa học"}</td>
            <td style="padding:12px 16px; font-size:13px; font-family:monospace; color:var(--brand);">${log.ip_address}</td>
            <td style="padding:12px 16px; font-size:13px;">${timeStr}</td>
            <td style="padding:12px 16px; font-size:12px; color:var(--muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.user_agent}">${uaShort}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      // Group by user_email to check unique IPs in the last 24 hours
      var oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      var ipGroups = {};

      lmsLogs.forEach(function(log) {
        var logTime = new Date(log.viewed_at).getTime();
        if (logTime < oneDayAgo) return; // only evaluate last 24h anomalies

        if (!ipGroups[log.user_email]) {
          ipGroups[log.user_email] = {
            ips: new Set(),
            lastLesson: log.lesson_title,
            lastTime: log.viewed_at
          };
        }
        ipGroups[log.user_email].ips.add(log.ip_address);
      });

      // Filter warnings (emails with > 2 unique IPs within 24h)
      var warningAccounts = Object.keys(ipGroups).filter(function(email) {
        return ipGroups[email].ips.size >= 3; // Trigger alert on 3+ distinct IPs in 24h
      });

      if (warningAccounts.length === 0) {
        warningsTbody.innerHTML = "<tr><td colspan='5' style='padding:20px; text-align:center; color:#15803d; background:#e2fbe8; font-weight:700;'>✅ Hệ thống an toàn. Chưa phát hiện tài khoản nào nghi ngờ chia sẻ thiết bị trong 24h qua.</td></tr>";
      } else {
        warningsTbody.innerHTML = "";
        warningAccounts.forEach(function(email) {
          var info = ipGroups[email];
          var tr = document.createElement("tr");
          tr.style.cssText = "border-bottom: 1px solid #fee2e2; background:#fff1f2;";

          var lastTimeStr = new Date(info.lastTime).toLocaleString('vi-VN');

          tr.innerHTML = `
            <td style="padding:12px 16px; font-weight:800; font-size:13px; color:#b91c1c;">🚨 ${email}</td>
            <td style="padding:12px 16px; font-size:13px; font-weight:800; color:#b91c1c;">${info.ips.size} Địa chỉ IP khác nhau</td>
            <td style="padding:12px 16px; font-size:13px; font-weight:600;">${info.lastLesson}</td>
            <td style="padding:12px 16px; font-size:13px;">${lastTimeStr}</td>
            <td style="padding:12px 16px; text-align:right;">
              <button class="btn btn-danger btn-xs" type="button" onclick="kickAnomalyStudent('${email}')" style="background:#b91c1c; font-weight:800;">Khóa tài khoản</button>
            </td>
          `;
          warningsTbody.appendChild(tr);
        });
      }
    }

    async function kickAnomalyStudent(email) {
      if (await showCustomConfirm(`Bạn có chắc chắn muốn KHÓA vĩnh viễn quyền học của tài khoản "${email}" không? Tất cả các khóa học đã mở của học sinh này sẽ bị xóa khỏi hệ thống.`)) {
        try {
          if (supabaseClient) {
            // Delete enrollments for this email
            var { error } = await supabaseClient
              .from("enrollments")
              .delete()
              .eq("user_email", email);
            if (error) throw error;
          } else {
            // Offline mock kick
            await showCustomAlert(`[Offline Mock] Đã thu hồi toàn bộ quyền học của học sinh "${email}"`);
          }

          await showCustomAlert(`Đã khóa thành công tài khoản nghi vấn: "${email}". Quyền truy cập các khóa học đã bị thu hồi.`);
          
          // Refresh lists
          renderStudents();
          renderSecurityLogs();
        } catch (err) {
          console.error(err);
          await showCustomAlert("Lỗi khi khóa tài khoản: " + (err.message || err));
        }
      }
    }

    async function clearOldSecurityLogs() {
      if (await showCustomConfirm("Bạn có chắc chắn muốn xóa toàn bộ nhật ký xem video cũ hơn 30 ngày để làm gọn database không?")) {
        try {
          var thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          var isoStr = thirtyDaysAgo.toISOString();

          if (supabaseClient) {
            var { error } = await supabaseClient
              .from("video_view_logs")
              .delete()
              .lt("viewed_at", isoStr);
            if (error) throw error;
          } else {
            var logs = JSON.parse(localStorage.getItem("tmaTsaLocalViewLogs") || "[]");
            logs = logs.filter(function(log) {
              return new Date(log.viewed_at).getTime() >= thirtyDaysAgo.getTime();
            });
            localStorage.setItem("tmaTsaLocalViewLogs", JSON.stringify(logs));
          }

          await showCustomAlert("Đã dọn dẹp nhật ký cũ hơn 30 ngày thành công!");
          renderSecurityLogs();
        } catch (err) {
          console.error(err);
          await showCustomAlert("Lỗi khi dọn dẹp nhật ký: " + (err.message || err));
        }
      }
    }

    // Attach listeners on form submissions
    document.addEventListener("DOMContentLoaded", function() {
      var courseForm = document.getElementById("lms-course-modal-form");
      if (courseForm) courseForm.addEventListener("submit", saveLmsCourse);

      var lessonForm = document.getElementById("lms-lesson-modal-form");
      if (lessonForm) lessonForm.addEventListener("submit", saveLmsLesson);

      var codeForm = document.getElementById("lms-create-code-form");
      if (codeForm) codeForm.addEventListener("submit", saveActivationCode);

      var enrollForm = document.getElementById("lms-manual-enroll-form");
      if (enrollForm) enrollForm.addEventListener("submit", saveManualEnrollment);
    });

    // Expose to window
    function teacherLogout() {
      localStorage.removeItem("teacherInfo");
      window.location.href = "login.html#teacher";
    }
    window.teacherLogout = teacherLogout;
    window.renderManageCourses = renderManageCourses;
    window.renderCourseDetails = renderCourseDetails;
    window.showAddCourseModal = showAddCourseModal;
    window.showEditCourseModal = showEditCourseModal;
    window.closeLmsCourseModal = closeLmsCourseModal;
    window.saveLmsCourse = saveLmsCourse;
    window.deleteActiveCourse = deleteActiveCourse;
    window.showAddLessonModal = showAddLessonModal;
    window.showEditLessonModal = showEditLessonModal;
    window.closeLmsLessonModal = closeLmsLessonModal;
    window.onLmsLessonTypeChange = onLmsLessonTypeChange;
    window.saveLmsLesson = saveLmsLesson;
    window.deleteLmsLesson = deleteLmsLesson;

    window.renderActivationCodes = renderActivationCodes;
    window.generateRandomCodeString = generateRandomCodeString;
    window.saveActivationCode = saveActivationCode;
    window.deleteActivationCode = deleteActivationCode;
    window.toggleActivationCodeActive = toggleActivationCodeActive;
    window.saveManualEnrollment = saveManualEnrollment;

    window.renderSecurityLogs = renderSecurityLogs;
    window.kickAnomalyStudent = kickAnomalyStudent;
    window.clearOldSecurityLogs = clearOldSecurityLogs;



      function init() {
        // One-time clear of previous mock students
        try {
          var existing = localStorage.getItem("tmaTsaUsers");
          if (existing && existing.includes("vhai2@tma.edu.vn")) {
            localStorage.removeItem("tmaTsaUsers");
          }
        } catch (e) {}

        // Listen for student registrations in other tabs and refresh grid instantly
        window.addEventListener('storage', function(e) {
          if (e.key === 'tmaTsaUsers') {
            renderStudents();
          }
        });

        stripStoredFormulaQuestions();
        var isCollapsed = localStorage.getItem("tma_teacher_sidebar_collapsed") === "true";
        if (isCollapsed) {
          var shell = document.querySelector(".teacher-shell");
          if (shell) shell.classList.add("sidebar-collapsed");
        }
        var lastCode = localStorage.getItem("tma_tsa_teacher_last_exam_code") || "TSA001";
        var draft = loadDraft(lastCode);
        if (draft) exam = draft;
        stripFormulaQuestions(exam);
        ensureSchema();
        syncMetadataToForm();
        initSocialLinksForm();
        initSocialLinksForm();
        ["math", "reading", "science"].forEach(function (sectionId) {
          editingQuestion[sectionId] = { index: -1, question: defaultQuestion(sectionId) };
        });
        bindEvents();
        renderAll();
        saveDraft();

        // Tự động đồng bộ dữ liệu khi quay lại trang giáo viên từ tab/cửa sổ xem thử
        window.addEventListener('focus', function() {
          if (typeof exam !== "undefined" && exam && exam.exam_code) {
            var latest = loadDraft(exam.exam_code);
            if (latest) {
              var currentStr = JSON.stringify(exam);
              var latestStr = JSON.stringify(latest);
              if (currentStr !== latestStr) {
                console.log("Draft updated on another tab, reloading...");
                exam = latest;
                
                ["math", "reading", "science"].forEach(function(secId) {
                  if (editingQuestion[secId] && editingQuestion[secId].index >= 0) {
                    var idx = editingQuestion[secId].index;
                    if (secId === "math") {
                      var mathSection = getSection("math");
                      var mathQs = mathSection ? mathSection.questions : [];
                      if (mathQs && mathQs[idx]) {
                        editingQuestion[secId].question = clone(mathQs[idx]);
                      }
                    } else {
                      var group = getActiveGroup(secId);
                      if (group && group.questions && group.questions[idx]) {
                        editingQuestion[secId].question = clone(group.questions[idx]);
                      }
                    }
                  }
                });
                
                syncMetadataToForm();
                renderAll();
              }
            }
          }
        });

        // Initial setup for the system dashboard
        renderPracticeRoom();
        renderExamsList();
        renderStudents();

        // Tải danh sách đề từ Supabase Storage để đồng bộ local storage của giáo viên
        if (window.SUPABASE_CONFIG) {
          var supabaseStorageUrl = 'https://jlnfnnrboozwywikxtel.supabase.co/storage/v1/object/public/exams/';
          fetch(`${supabaseStorageUrl}index.json`, { cache: "no-store" })
            .then(res => {
              if (res.ok) return res.json();
            })
            .then(data => {
              if (data && Array.isArray(data)) {
                localStorage.setItem('tma_tsa_exam_index', JSON.stringify(data));
                renderPracticeRoom();
                renderExamsList();
              }
            })
            .catch(err => console.warn("Cannot sync index from Supabase on start:", err));

          fetch(`${supabaseStorageUrl}drive_links.json`, { cache: "no-store" })
            .then(res => {
              if (res.ok) return res.json();
            })
            .then(data => {
              if (data && typeof data === "object") {
                localStorage.setItem('tmaTsaDriveLinks', JSON.stringify(data));
                var activePanel = document.querySelector("#dashboard-container .tab-panel.active");
                if (activePanel && activePanel.id === "tab-manage-documents") {
                  renderManageDocuments();
                }
              }
            })
            .catch(err => console.warn("Cannot sync documents index from Supabase on start:", err));
        }
      }

      function insertCloudImageIntoGroupText(sectionId, elementId) {
        var textarea = document.getElementById(elementId);
        if (!textarea) return;

        var url = prompt("Nhập link ảnh từ Cloud R2 hoặc Supabase muốn chèn:");
        if (!url) return;
        url = url.trim();
        if (!url) return;

        var widthPercent = prompt("Nhập kích thước ảnh (%) (Ví dụ: 30, 50, 80):", "80");
        if (widthPercent === null) return; // User cancelled
        widthPercent = widthPercent.trim();
        var widthVal = Number(widthPercent) || 80;

        var alignOption = prompt("Chọn vị trí căn lề của ảnh:\n1 - Căn giữa (dòng mới riêng biệt)\n2 - Nằm bên trái (chữ bao quanh bên phải)\n3 - Nằm bên phải (chữ bao quanh bên trái)", "1");
        if (alignOption === null) return;

        var styleStr = "max-width: 100%; border-radius: 8px; width: " + widthVal + "%;";
        if (alignOption === "2") {
          styleStr += " float: left; margin: 8px 15px 15px 0;";
        } else if (alignOption === "3") {
          styleStr += " float: right; margin: 8px 0 15px 15px;";
        } else {
          styleStr += " display: block; margin: 15px auto;";
        }

        var imgHtml = '\n<img src="' + url + '" style="' + styleStr + '" />\n';
        
        // Insert at cursor position
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var val = textarea.value;
        textarea.value = val.substring(0, start) + imgHtml + val.substring(end);
        
        // Put cursor after the inserted HTML
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + imgHtml.length;
        
        // Trigger change event to update exam draft
        textarea.dispatchEvent(new Event('input'));
      }
      window.insertCloudImageIntoGroupText = insertCloudImageIntoGroupText;

      function toggleTeacherOptionsAreImages(cb, sectionId) {
        var q = getQuestionDraft(sectionId);
        q.options_are_images = cb.checked;
        
        // Re-render only the choices form
        var typeFields = document.getElementById(sectionId + "-type-fields");
        if (typeFields) {
          typeFields.innerHTML = renderChoicesForm(q, q.question_type === "multiple_choice", sectionId);
        }
        updatePreview(sectionId);
      }
      window.toggleTeacherOptionsAreImages = toggleTeacherOptionsAreImages;

      function triggerChoiceImageUpload(btn) {
        var fileInput = btn.nextElementSibling;
        if (fileInput) fileInput.click();
      }
      window.triggerChoiceImageUpload = triggerChoiceImageUpload;

      async function handleChoiceImageUpload(input, key, sectionId) {
        var file = input.files[0];
        if (!file) return;
        
        var uploadBtn = input.previousElementSibling;
        var originalText = uploadBtn.textContent;
        uploadBtn.disabled = true;
        uploadBtn.textContent = "Tải...";
        
        try {
          if (!supabaseClient) {
            alert("Vui lòng kết nối Supabase để tải ảnh lên Cloud!");
            uploadBtn.disabled = false;
            uploadBtn.textContent = originalText;
            return;
          }
          
          var examCode = window.exam?.exam_code || "temp";
          var questionId = getQuestionDraft(sectionId)?.id || "qtemp";
          var path = "questions/" + examCode + "/" + questionId + "_" + key + "_" + Date.now() + ".png";
          
          var { data, error } = await supabaseClient.storage
            .from('exams')
            .upload(path, file, { cacheControl: '3600', upsert: true });
            
          if (error) throw error;
          
          var supabaseStorageUrl = 'https://jlnfnnrboozwywikxtel.supabase.co/storage/v1/object/public/exams/';
          var imageUrl = supabaseStorageUrl + path;
          
          // Update input value
          var textInput = uploadBtn.parentElement.querySelector('input[data-choice-key]');
          if (textInput) {
            textInput.value = imageUrl;
            updateChoiceImagePreview(textInput);
          }
          
          // Auto-save this to draft
          var q = getQuestionDraft(sectionId);
          if (q && q.options) {
            var opt = q.options.find(function(o) { return o.key === key; });
            if (opt) opt.text = imageUrl;
          }
          
          updatePreview(sectionId);
          
        } catch (err) {
          console.error("Option image upload error:", err);
          alert("Lỗi tải ảnh lên: " + err.message);
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.textContent = originalText;
        }
      }
      window.handleChoiceImageUpload = handleChoiceImageUpload;

      function updateChoiceImagePreview(input) {
        var wrap = input.parentElement.parentElement;
        var preview = wrap.querySelector('.choice-image-preview');
        var val = input.value.trim();
        
        if (val) {
          if (!preview) {
            preview = document.createElement('img');
            preview.className = 'choice-image-preview';
            preview.style.cssText = 'max-height: 80px; width: auto; max-width: 150px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 6px;';
            wrap.appendChild(preview);
          }
          preview.src = val;
        } else {
          if (preview) preview.remove();
        }
      }
      function triggerPassageImageUpload(btn) {
        var fileInp = btn.nextElementSibling;
        if (fileInp) fileInp.click();
      }
      window.triggerPassageImageUpload = triggerPassageImageUpload;

      async function handlePassageImageUpload(input, sectionId, elementId) {
        var file = input.files[0];
        if (!file) return;

        var uploadBtn = input.previousElementSibling;
        var originalText = uploadBtn.textContent;
        uploadBtn.disabled = true;
        uploadBtn.textContent = "Tải...";

        try {
          if (!supabaseClient) {
            alert("Vui lòng kết nối Supabase để tải ảnh lên Cloud!");
            uploadBtn.disabled = false;
            uploadBtn.textContent = originalText;
            return;
          }

          var ext = file.name.split('.').pop() || "png";
          var examCode = window.exam?.exam_code || "temp";
          var path = "passages/" + examCode + "/" + Date.now() + "." + ext;

          var { data, error } = await supabaseClient.storage
            .from('exams')
            .upload(path, file, { cacheControl: '3600', upsert: true });

          if (error) throw error;

          var supabaseStorageUrl = 'https://jlnfnnrboozwywikxtel.supabase.co/storage/v1/object/public/exams/';
          var publicUrl = supabaseStorageUrl + path;

          var widthPercent = prompt("Ảnh tải lên thành công! Nhập kích thước ảnh (%) (Ví dụ: 30, 50, 80):", "80");
          if (widthPercent === null) widthPercent = "80"; // default if cancelled
          widthPercent = widthPercent.trim();
          var widthVal = Number(widthPercent) || 80;

          var alignOption = prompt("Chọn vị trí căn lề của ảnh:\n1 - Căn giữa (dòng mới riêng biệt)\n2 - Nằm bên trái (chữ bao quanh bên phải)\n3 - Nằm bên phải (chữ bao quanh bên trái)", "1");
          if (alignOption === null) alignOption = "1";

          var styleStr = "max-width: 100%; border-radius: 8px; width: " + widthVal + "%;";
          if (alignOption === "2") {
            styleStr += " float: left; margin: 8px 15px 15px 0;";
          } else if (alignOption === "3") {
            styleStr += " float: right; margin: 8px 0 15px 15px;";
          } else {
            styleStr += " display: block; margin: 15px auto;";
          }

          var imgHtml = '\n<img src="' + publicUrl + '" style="' + styleStr + '" />\n';

          var textarea = document.getElementById(elementId);
          if (textarea) {
            var start = textarea.selectionStart;
            var end = textarea.selectionEnd;
            var text = textarea.value;
            textarea.value = text.substring(0, start) + imgHtml + text.substring(end);
            
            // Trigger change event to update exam draft
            textarea.dispatchEvent(new Event('input'));
          }

          alert("✓ Đã tải và chèn ảnh thành công!");
        } catch (err) {
          console.error("Passage image upload error:", err);
          alert("Lỗi tải ảnh lên: " + err.message);
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.textContent = originalText;
          input.value = ""; // clear file input
        }
      }
      window.handlePassageImageUpload = handlePassageImageUpload;

      // ==========================================
      // DYNAMIC LMS ASSET COVER MANAGER
      // ==========================================
      var selectedAssetUrl = "";

      function openLmsAssetModal() {
        document.getElementById("lms-asset-modal").style.display = "flex";
        selectedAssetUrl = "";
        loadLmsAssets();
      }

      function closeLmsAssetModal() {
        document.getElementById("lms-asset-modal").style.display = "none";
      }

      async function loadLmsAssets() {
        var client = window.supabaseClient;
        var grid = document.getElementById("lms-asset-grid");
        if (!grid) return;
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; font-size: 13px; padding: 20px;">Đang tải danh sách ảnh...</div>';

        if (!client) {
          grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; font-size: 13px; padding: 20px;">Lỗi: Supabase Client chưa sẵn sàng!</div>';
          return;
        }

        try {
          var { data, error } = await client.storage
            .from('exams')
            .list('assets/course_covers', {
              limit: 100,
              sortBy: { column: 'name', order: 'desc' }
            });

          if (error) throw error;

          var files = (data || []).filter(function(item) {
            return item.name && item.name !== '.empty' && item.name !== 'placeholder.txt';
          });

          if (files.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; font-size: 13px; padding: 40px 20px;">Thư viện trống. Hãy tải lên ảnh nền đầu tiên!</div>';
            return;
          }

          var html = "";
          files.forEach(function(file) {
            var path = 'assets/course_covers/' + file.name;
            var { data: urlData } = client.storage.from('exams').getPublicUrl(path);
            var publicUrl = urlData.publicUrl;

            html += `
              <div class="asset-item-card" data-url="${publicUrl}" onclick="selectLmsAsset('${publicUrl}', this)">
                <img class="asset-item-thumb" src="${publicUrl}" alt="${esc(file.name)}" />
                <div class="asset-item-title" title="${esc(file.name)}">${esc(file.name.substring(file.name.indexOf('_') + 1))}</div>
                <button class="asset-item-delete-btn" type="button" onclick="deleteLmsAsset('${esc(file.name)}', event)">&times;</button>
              </div>
            `;
          });
          grid.innerHTML = html;
        } catch (err) {
          console.error("Failed to load assets:", err);
          grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; font-size: 13px; padding: 20px;">Lỗi: ' + (err.message || err) + '</div>';
        }
      }

      function selectLmsAsset(url, element) {
        selectedAssetUrl = url;
        document.querySelectorAll("#lms-asset-grid .asset-item-card").forEach(function(card) {
          card.classList.remove("selected");
        });
        element.classList.add("selected");
      }

      function confirmLmsAssetSelection() {
        if (!selectedAssetUrl) {
          alert("Vui lòng chọn một ảnh nền hoặc tải lên ảnh mới!");
          return;
        }
        var inputCover = document.getElementById("lms-course-modal-cover");
        if (inputCover) {
          inputCover.value = selectedAssetUrl;
        }
        closeLmsAssetModal();
      }

      async function uploadAssetFile(event) {
        var client = window.supabaseClient;
        if (!client) {
          alert("Supabase Client chưa sẵn sàng!");
          return;
        }

        var file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          alert("Chỉ chấp nhận tệp hình ảnh!");
          return;
        }

        var progress = document.getElementById("lms-asset-upload-progress");
        if (progress) progress.style.display = "flex";

        try {
          var cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
          var uploadPath = 'assets/course_covers/' + Date.now() + '_' + cleanName;

          var { error } = await client.storage
            .from('exams')
            .upload(uploadPath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (error) throw error;

          await loadLmsAssets();

          var { data: urlData } = client.storage.from('exams').getPublicUrl(uploadPath);
          var publicUrl = urlData.publicUrl;
          selectedAssetUrl = publicUrl;

          setTimeout(function() {
            var cards = document.querySelectorAll("#lms-asset-grid .asset-item-card");
            cards.forEach(function(card) {
              if (card.getAttribute("data-url") === publicUrl) {
                selectLmsAsset(publicUrl, card);
              }
            });
          }, 100);

          alert("✓ Tải ảnh lên thành công!");
        } catch (err) {
          console.error("Upload error:", err);
          alert("Lỗi tải ảnh lên: " + (err.message || err));
        } finally {
          if (progress) progress.style.display = "none";
          event.target.value = "";
        }
      }

      async function deleteLmsAsset(filename, event) {
        if (event) event.stopPropagation();

        if (!confirm("Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện không?")) {
          return;
        }

        var client = window.supabaseClient;
        if (!client) return;

        try {
          var path = 'assets/course_covers/' + filename;
          var { error } = await client.storage.from('exams').remove([path]);
          if (error) throw error;

          if (selectedAssetUrl && selectedAssetUrl.includes(filename)) {
            selectedAssetUrl = "";
          }

          loadLmsAssets();
          alert("✓ Đã xóa ảnh thành công!");
        } catch (err) {
          console.error("Delete error:", err);
          alert("Lỗi khi xóa ảnh: " + (err.message || err));
        }
      }

      window.openLmsAssetModal = openLmsAssetModal;
      window.closeLmsAssetModal = closeLmsAssetModal;
      window.selectLmsAsset = selectLmsAsset;
      window.confirmLmsAssetSelection = confirmLmsAssetSelection;
      window.uploadAssetFile = uploadAssetFile;
      window.deleteLmsAsset = deleteLmsAsset;

      document.addEventListener("DOMContentLoaded", init);

      function initSocialLinksForm() {
        var form = document.getElementById("social-links-form");
        if (!form) return;

        var defaultLinks = {
          facebook: { url: "https://facebook.com/mapstudy", text: "Facebook TMA Study" },
          youtube: { url: "https://youtube.com/c/ThayVuNgocAnh", text: "Youtube TMA Study" },
          tiktok: { url: "https://tiktok.com/@mapstudy", text: "Tiktok TMA Study" },
          messenger: { url: "https://m.me/mapstudy", text: "Messenger TMA Study" }
        };

        var saved = defaultLinks;
        try {
          var localData = localStorage.getItem("tmaTsaSocialLinks");
          if (localData) {
            saved = JSON.parse(localData);
          }
        } catch(e) {}

        // Populate fields
        var fbText = document.getElementById("link-fb-text");
        var fbUrl = document.getElementById("link-fb-url");
        if (fbText && fbUrl && saved.facebook) {
          fbText.value = saved.facebook.text || defaultLinks.facebook.text;
          fbUrl.value = saved.facebook.url || defaultLinks.facebook.url;
        }

        var ytText = document.getElementById("link-yt-text");
        var ytUrl = document.getElementById("link-yt-url");
        if (ytText && ytUrl && saved.youtube) {
          ytText.value = saved.youtube.text || defaultLinks.youtube.text;
          ytUrl.value = saved.youtube.url || defaultLinks.youtube.url;
        }

        var tkText = document.getElementById("link-tk-text");
        var tkUrl = document.getElementById("link-tk-url");
        if (tkText && tkUrl && saved.tiktok) {
          tkText.value = saved.tiktok.text || defaultLinks.tiktok.text;
          tkUrl.value = saved.tiktok.url || defaultLinks.tiktok.url;
        }

        var msgText = document.getElementById("link-msg-text");
        var msgUrl = document.getElementById("link-msg-url");
        if (msgText && msgUrl && saved.messenger) {
          msgText.value = saved.messenger.text || defaultLinks.messenger.text;
          msgUrl.value = saved.messenger.url || defaultLinks.messenger.url;
        }

        form.onsubmit = function(e) {
          e.preventDefault();

          var updated = {
            facebook: {
              text: (document.getElementById("link-fb-text").value || "").trim(),
              url: (document.getElementById("link-fb-url").value || "").trim()
            },
            youtube: {
              text: (document.getElementById("link-yt-text").value || "").trim(),
              url: (document.getElementById("link-yt-url").value || "").trim()
            },
            tiktok: {
              text: (document.getElementById("link-tk-text").value || "").trim(),
              url: (document.getElementById("link-tk-url").value || "").trim()
            },
            messenger: {
              text: (document.getElementById("link-msg-text").value || "").trim(),
              url: (document.getElementById("link-msg-url").value || "").trim()
            }
          };

          try {
            localStorage.setItem("tmaTsaSocialLinks", JSON.stringify(updated));
            alert("✓ Cấu hình liên kết đã được lưu thành công!");
          } catch(err) {
            alert("Lỗi khi lưu cấu hình: " + err.message);
          }
        };
      }

    })();