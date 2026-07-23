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
        
        var cuteThemes = [
          { bg: '#eff6ff', fg: '#135c97', border: '#bfdbfe' },
          { bg: '#fdf2f8', fg: '#db2777', border: '#fbcfe8' },
          { bg: '#f5f3ff', fg: '#7c3aed', border: '#ddd6fe' },
          { bg: '#ecfdf5', fg: '#059669', border: '#a7f3d0' },
          { bg: '#fff7ed', fg: '#d97706', border: '#fed7aa' },
          { bg: '#ecfeff', fg: '#0891b2', border: '#a5f3fc' }
        ];
        var nameHash = 0;
        var nameStr = s.name || "";
        for (var i = 0; i < nameStr.length; i++) {
          nameHash += nameStr.charCodeAt(i);
        }
        var theme = cuteThemes[nameHash % cuteThemes.length];

        var card = document.createElement("div");
        card.className = "student-card";
        card.style.cssText = "background: #ffffff; border: none; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.25s ease; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.015); box-sizing: border-box; width: 100%;";
        card.setAttribute("onmouseover", "this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(194, 39, 45, 0.08)';");
        card.setAttribute("onmouseout", "this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.015)';");
        card.onclick = function() {
          viewStudentDetails(s.email);
        };
        
        var displayEmail = s.email || "";
        var displayPhone = s.phone || "Chưa cập nhật";
        var displaySchool = s.school || "Chưa cập nhật";

        card.innerHTML = '\n' +
'          <div style="width: 52px; height: 52px; border-radius: 50%; background: #fff5f6; color: #c2272d; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; border: 1.5px solid #ffe4e6; text-transform: uppercase; box-shadow: inset 0 2px 4px rgba(194,39,45,0.03);">\n' +
'            ' + esc(firstChar) + '\n' +
'          </div>\n' +
'          <div style="font-weight: 700; color: #1e293b; font-size: 14.5px; word-break: break-word; margin-bottom: 2px;">' + esc(s.name) + '</div>\n' +
'          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; font-size: 11.5px; color: #64748b; text-align: left; padding: 10px 14px; background: #fff5f6; border-radius: 10px; border: none; box-sizing: border-box; overflow: hidden; box-shadow: inset 0 1px 2px rgba(194,39,45,0.015);">\n' +
'            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> <span style="overflow: hidden; text-overflow: ellipsis;" title="' + esc(displayEmail) + '">' + esc(displayEmail) + '</span></div>\n' +
'            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> <span style="overflow: hidden; text-overflow: ellipsis;" title="' + esc(displayPhone) + '">' + esc(displayPhone) + '</span></div>\n' +
'            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg> <span style="overflow: hidden; text-overflow: ellipsis;" title="' + esc(displaySchool) + '">' + esc(displaySchool) + '</span></div>\n' +
'          </div>\n' +
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
      if (avatarCircle) {
        avatarCircle.textContent = firstChar;
        var cuteThemes = [
          { bg: '#eff6ff', fg: '#135c97', border: '#bfdbfe' },
          { bg: '#fdf2f8', fg: '#db2777', border: '#fbcfe8' },
          { bg: '#f5f3ff', fg: '#7c3aed', border: '#ddd6fe' },
          { bg: '#ecfdf5', fg: '#059669', border: '#a7f3d0' },
          { bg: '#fff7ed', fg: '#d97706', border: '#fed7aa' },
          { bg: '#ecfeff', fg: '#0891b2', border: '#a5f3fc' }
        ];
        var nameHash = 0;
        var nameStr = student.name || "";
        for (var i = 0; i < nameStr.length; i++) {
          nameHash += nameStr.charCodeAt(i);
        }
        var theme = cuteThemes[nameHash % cuteThemes.length];
        avatarCircle.style.background = theme.bg;
        avatarCircle.style.color = theme.fg;
        avatarCircle.style.border = '1.5px solid ' + theme.border;
      }
        
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

    window.activeTeacherPracticePackage = null;
    window.selectTeacherPracticePackage = function(pkg) {
      window.activeTeacherPracticePackage = pkg;
      renderPracticeRoom();
    };
    window.goBackToTeacherPackages = function() {
      window.activeTeacherPracticePackage = null;
      renderPracticeRoom();
    };

    window.filterTeacherPracticeInput = function() {
      const query = (document.getElementById("teacher-practice-search-input")?.value || "").toLowerCase().trim();
      if (window.activeTeacherPracticePackage === "random") {
        const rows = document.querySelectorAll("#practice-grid-dynamic table tbody tr");
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          if (!query || text.includes(query)) {
            row.style.display = "";
          } else {
            row.style.display = "none";
          }
        });
      } else {
        const cards = document.querySelectorAll("#practice-grid-dynamic .exam-card");
        cards.forEach(card => {
          const title = (card.querySelector("h3")?.textContent || "").toLowerCase();
          const code = (card.querySelector(".exam-info-row .info-value")?.textContent || "").toLowerCase();
          if (!query || title.includes(query) || code.includes(query)) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      }
    };

    window.teacherAddPracticeExam = function() {
      var category = currentPracticeCategory.toUpperCase();
      var pkg = window.activeTeacherPracticePackage || "free";
      
      var indexList = [];
      try {
        var raw = localStorage.getItem("tma_tsa_exam_index");
        if (raw) indexList = JSON.parse(raw);
      } catch(e) {}
      if (!Array.isArray(indexList)) indexList = [];

      var defaultTitle = "";
      var autoCode = "";
      var displayCategory = category === "THPT" ? "THPTQG" : category;
      
      if (category === "TSA") {
        if (pkg === "free") {
          var freeCount = indexList.filter(e => e.exam_code.startsWith("TMA_FREE_")).length;
          var nextNum = freeCount + 1;
          do {
            autoCode = `TMA_FREE_${String(nextNum).padStart(3, "0")}`;
            var exists = indexList.some(e => e.exam_code === autoCode);
            if (!exists) break;
            nextNum++;
          } while(true);
          defaultTitle = `Đề Số ${String(nextNum + 1).padStart(2, "0")}`;
        } else if (pkg === "random") {
          var randomCount = indexList.filter(e => e.exam_code.startsWith("TMA_RANDOM_")).length;
          var nextNum = randomCount + 1;
          do {
            autoCode = `TMA_RANDOM_${String(nextNum).padStart(3, "0")}`;
            var exists = indexList.some(e => e.exam_code === autoCode);
            if (!exists) break;
            nextNum++;
          } while(true);
          defaultTitle = `Đề ngẫu nhiên số ${String(nextNum).padStart(2, "0")}`;
        } else {
          if (currentTsaPracticeSubtab === "tong-hop") {
            var premiumCount = indexList.filter(e => e.exam_code.startsWith("TMA") && !e.exam_code.startsWith("TMA_FREE_")).length;
            var nextNum = Math.max(11, premiumCount + 1);
            do {
              autoCode = `TMA_${String(nextNum).padStart(3, "0")}`;
              var exists = indexList.some(e => e.exam_code === autoCode);
              if (!exists) break;
              nextNum++;
            } while(true);
            defaultTitle = `Đề tổng hợp số ${String(nextNum).padStart(2, "0")}`;
          } else {
            var subPrefix = currentTsaPracticeSubtab.toUpperCase();
            var prefix = `TSA_PRACTICE_${subPrefix}_`;
            var count = indexList.filter(e => e.exam_code.startsWith(prefix)).length;
            var nextNum = Math.max(10, count + 1);
            do {
              autoCode = `${prefix}${String(nextNum).padStart(2, "0")}`;
              var exists = indexList.some(e => e.exam_code === autoCode);
              if (!exists) break;
              nextNum++;
            } while(true);
            var subLabel = currentTsaPracticeSubtab === "math" ? "Tư duy Toán học" : currentTsaPracticeSubtab === "reading" ? "Đọc hiểu" : "Khoa học";
            defaultTitle = `Đề TSA số ${String(nextNum).padStart(2, "0")} - ${subLabel}`;
          }
        }
      } else {
        if (pkg === "free") {
          var prefix = category;
          var count = indexList.filter(e => e.exam_code.startsWith(prefix)).length;
          var nextNum = Math.max(2, count + 1);
          do {
            autoCode = `${prefix}${String(nextNum).padStart(2, "0")}`;
            var exists = indexList.some(e => e.exam_code === autoCode);
            if (!exists) break;
            nextNum++;
          } while(true);
          defaultTitle = `Đề ${displayCategory} số ${String(nextNum).padStart(2, "0")}`;
        } else {
          var prefix = `${displayCategory}_PRACTICE_`;
          var count = indexList.filter(e => e.exam_code.startsWith(prefix)).length;
          var nextNum = Math.max(2, count + 1);
          do {
            autoCode = `${prefix}${String(nextNum).padStart(2, "0")}`;
            var exists = indexList.some(e => e.exam_code === autoCode);
            if (!exists) break;
            nextNum++;
          } while(true);
          defaultTitle = `Đề ${displayCategory} số ${String(nextNum).padStart(2, "0")}`;
        }
      }

      var newTitle = window.prompt("Nhập tên đề mới:", defaultTitle);
      if (!newTitle) return;

      var newExam = window.createEmptyExam(autoCode, newTitle, 45, "published");
      localStorage.setItem("tma_tsa_exam_" + autoCode, JSON.stringify(newExam));

      var idx = indexList.findIndex(e => e.exam_code === autoCode);
      var meta = {
        exam_code: autoCode,
        title: newTitle,
        status: "published",
        duration_minutes: 45,
        is_open: false,
        subject: (function() {
          if (autoCode.includes("_MATH_")) return "math";
          if (autoCode.includes("_READING_")) return "reading";
          if (autoCode.includes("_SCIENCE_")) return "science";
          return "tong-hop";
        })(),
        file: "data/exams/" + autoCode + ".json"
      };
      if (idx === -1) indexList.push(meta);
      else indexList[idx] = meta;
      localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

      if (window.TMAR2) {
        try {
          window.TMAR2.putJson('data/exams/index.json', indexList).catch(function(){});
          window.TMAR2.putJson('data/exams/' + autoCode + '.json', window.TMAExamSecurity.createPublicExamCopy(newExam)).catch(function(){});
        } catch(err) {}
      }

      renderPracticeRoom();
    };

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

      // Reset package state when switching tabs
      window.activeTeacherPracticePackage = null;

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

    window.selectExamCategoryLobby = function(category) {
      currentExamCategory = category;
      
      // Update heading title based on category
      var titleEl = document.getElementById("exam-tab-title");
      if (titleEl) {
        var titles = {
          'tsa': 'Bài thi Đánh giá tư duy - TSA',
          'hsa': 'Bài thi Đánh giá năng lực - HSA',
          'vact': 'Bài thi Đánh giá năng lực - VACT',
          'qda': 'Bài thi Đánh giá năng lực - QDA',
          'thpt': 'Bài thi tốt nghiệp THPTQG'
        };
        titleEl.textContent = titles[category] || 'Quản lý đề Thi thử';
      }

      // Hide lobby, show list view
      var lobbyView = document.getElementById("exams-lobby-view");
      var managementView = document.getElementById("exams-management-view");
      if (lobbyView) lobbyView.style.display = "none";
      if (managementView) managementView.style.display = "block";

      // Render the exam list
      if (typeof renderExamsList === "function") renderExamsList();
    };

    window.backToExamsLobby = function() {
      var lobbyView = document.getElementById("exams-lobby-view");
      var managementView = document.getElementById("exams-management-view");
      var operationsView = document.getElementById("mock-operations-view");
      if (lobbyView) lobbyView.style.display = "block";
      if (managementView) managementView.style.display = "none";
      if (operationsView) operationsView.hidden = true;
      
      // Clear sidebar active subtabs (since we went back to lobby)
      document.querySelectorAll(".submenu-item").forEach(function(item) {
        item.classList.remove("active");
      });
    };

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
          html += `
            <tr>
              <td style="padding: 16px 20px;">
                <div style="font-weight: 700; color: #1e293b; font-size: 13.5px; display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c2272d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <span>${esc(material.title)}</span>
                </div>
                <span style="padding: 2.5px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; margin-top: 6px; ${
                  material.subject === 'TOÁN' ? 'background: #fff5f6; color: #c2272d;' :
                  material.subject === 'LÝ' ? 'background: #eff6ff; color: #1d4ed8;' :
                  material.subject === 'HOÁ' ? 'background: #f5f3ff; color: #6d28d9;' :
                  material.subject === 'SINH' ? 'background: #ecfdf5; color: #047857;' :
                  material.subject === 'ANH' ? 'background: #fffbeb; color: #b45309;' :
                  'background: #f1f5f9; color: #475569;'
                }">
                  ${material.subject}
                </span>
              </td>
              <td style="padding: 16px 20px;">
                <span style="padding: 4px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 700; ${
                  material.category === 'ĐGTD' ? 'background: #fff5f6; color: #c2272d;' :
                  material.category === 'ĐGNL' ? 'background: #eff6ff; color: #1d4ed8;' :
                  material.category === 'LỚP 12' ? 'background: #ecfdf5; color: #047857;' :
                  material.category === 'LỚP 11' ? 'background: #fffbeb; color: #b45309;' :
                  'background: #f1f5f9; color: #475569;'
                }">
                  ${material.category}
                </span>
              </td>
              <td style="padding: 16px 20px;">
                <a href="${esc(material.url)}" target="_blank" style="color: #c2272d; font-size: 13px; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;" title="${esc(material.url)}">
                  <svg viewBox="0 0 24 24" width="13" height="13" stroke="#c2272d" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2 2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  Link tài liệu
                </a>
              </td>
              <td style="padding: 16px 20px; font-size: 12.5px; color: #64748b;">
                ${esc(material.note || "Không có")}
              </td>
              <td style="padding: 16px 20px;">
                <div style="display: flex; gap: 6px;">
                  <button class="btn" type="button" onclick="window.startEditingRow('${material.id}')" style="color: #c2272d; border: none; background: #fff5f6; font-weight: 700; border-radius: 6px; padding: 5px 12px; cursor: pointer; font-size: 11.5px; transition: opacity 0.15s;">Sửa</button>
                  <button class="btn" type="button" onclick="window.removeDocumentFromList('${material.id}')" style="color: #ff3b30; border: none; background: #fff0f0; font-weight: 700; border-radius: 6px; padding: 5px 12px; cursor: pointer; font-size: 11.5px; transition: opacity 0.15s;">Xóa</button>
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
      if (!window.TMAR2) return;

      var saveIndicator = document.getElementById("save-documents-indicator");
      if (saveIndicator) {
        saveIndicator.style.display = "inline-flex";
        saveIndicator.style.background = "#eff6ff";
        saveIndicator.style.color = "var(--brand)";
        saveIndicator.textContent = "⌛ Đang tự động lưu...";
      }

      try {
        localStorage.setItem("tmaTsaDriveLinks", JSON.stringify(currentMaterialsList));

        await window.TMAR2.putJson('data/exams/drive_links.json', currentMaterialsList);

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

    async function saveDocumentsToR2() {
      if (!window.TMAR2) {
        window.alert("Cloudflare R2 chưa được cấu hình. Vui lòng tải lại trang.");
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

        await window.TMAR2.putJson('data/exams/drive_links.json', currentMaterialsList);
        window.alert("✓ Đã lưu danh sách tài liệu lên Cloudflare R2 thành công!");
      } catch(err) {
        console.error(err);
        window.alert("Lỗi khi tải tài liệu lên R2:\n" + (err.message || err));
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
    window.saveDocumentsToR2 = saveDocumentsToR2;
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

      // 1. Render Package Lobby if no package is selected
      if (!window.activeTeacherPracticePackage) {
        document.querySelector(".teacher-shell")?.classList.remove("hide-sidebar");
        var headerBox = document.getElementById("teacher-practice-header-box");
        if (headerBox) headerBox.style.display = "none";
        if (roomTitle) roomTitle.innerHTML = "Phòng luyện đề: " + info[0];
        if (roomDesc) {
          roomDesc.style.display = "block";
          roomDesc.textContent = info[1];
        }
        if (subtabsContainer) subtabsContainer.style.display = "none";
        
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
        grid.style.gap = "20px";

        var freeCard = document.createElement("div");
        freeCard.className = "pkg-card";
        freeCard.style.cssText = "background: white; border: none; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.02); height: 260px; text-align: left; box-sizing: border-box; font-family: 'Inter', system-ui, -apple-system, sans-serif;";
        freeCard.innerHTML = `
          <div>
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              <div style="background: #c2272d; width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(194, 39, 45, 0.15);">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0; text-transform: none; line-height: 1.2; font-family: inherit;">Phòng Luyện Miễn Phí</h3>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span style="font-size: 11px; background: #fff5f6; color: #c2272d; padding: 2px 10px; border-radius: 9999px; font-weight: 500; font-family: inherit;">${category}</span>
                  <span style="font-size: 11px; background: #f0fdf4; color: #16a34a; padding: 2px 10px; border-radius: 9999px; font-weight: 500; font-family: inherit;">Miễn phí</span>
                </div>
              </div>
            </div>
            <p style="color: #64748b; font-size: 14px; font-weight: 400; margin: 16px 0 0 0; font-family: inherit;">Tổng số lượng đề thi công khai phục vụ ôn luyện tự do.</p>
            <div style="margin-top: 12px; display: flex; align-items: center; gap: 4px; font-size: 13.5px; color: #64748b; font-weight: 400; font-family: inherit;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> 1 Đề
            </div>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; width: 100%;">
            <button class="btn" style="background: #c2272d; border-color: #c2272d; color: white; font-weight: 600; width: 100%; padding: 10px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid #c2272d; transition: all 0.2s; font-family: inherit;" onclick="window.selectTeacherPracticePackage('free')">
              Quản lý phòng đề &rarr;
            </button>
          </div>
        `;

        var premiumCard = document.createElement("div");
        premiumCard.className = "pkg-card";
        premiumCard.style.cssText = "background: white; border: none; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.02); height: 260px; text-align: left; box-sizing: border-box; font-family: 'Inter', system-ui, -apple-system, sans-serif;";
        premiumCard.innerHTML = `
          <div>
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              <div style="background: #c2272d; width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(194, 39, 45, 0.15);">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0; text-transform: none; line-height: 1.2; font-family: inherit;">Phòng Luyện thực chiến ${category} 2027</h3>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span style="font-size: 11px; background: #fff5f6; color: #c2272d; padding: 2px 10px; border-radius: 9999px; font-weight: 500; font-family: inherit;">${category}</span>
                  <span style="font-size: 11px; background: #fff5f5; color: #e03131; padding: 2px 10px; border-radius: 9999px; font-weight: 500; font-family: inherit;">Premium</span>
                </div>
              </div>
            </div>
            <p style="color: #64748b; font-size: 14px; font-weight: 400; margin: 16px 0 0 0; font-family: inherit;">Danh sách đề thực chiến có cấu trúc phân mảnh theo các phần thi.</p>
            <div style="margin-top: 12px; display: flex; align-items: center; gap: 4px; font-size: 13.5px; color: #64748b; font-weight: 400; font-family: inherit;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> 9 Đề
            </div>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; width: 100%;">
            <button class="btn" style="background: #c2272d; border-color: #c2272d; color: white; font-weight: 600; width: 100%; padding: 10px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid #c2272d; transition: all 0.2s; font-family: inherit;" onclick="window.selectTeacherPracticePackage('premium')">
              Quản lý phòng đề &rarr;
            </button>
          </div>
        `;

        var rRaw = localStorage.getItem("tma_tsa_exam_TMA_RANDOM_001") || localStorage.getItem("tma_tsa_teacher_draft_TMA_RANDOM_001");
        var rQList = [];
        if (rRaw) {
          try {
            var rObj = JSON.parse(rRaw);
            if (Array.isArray(rObj.questions)) rQList = rQList.concat(rObj.questions);
            if (Array.isArray(rObj.sections)) {
              rObj.sections.forEach(function(sec) {
                if (Array.isArray(sec.questions)) rQList = rQList.concat(sec.questions);
                if (Array.isArray(sec.groups)) {
                  sec.groups.forEach(function(g) {
                    if (Array.isArray(g.questions)) rQList = rQList.concat(g.questions);
                  });
                }
              });
            }
            if (Array.isArray(rObj.groups)) {
              rObj.groups.forEach(function(g) {
                if (Array.isArray(g.questions)) rQList = rQList.concat(g.questions);
              });
            }
          } catch(e) {}
        }
        var rEasy = 0, rMed = 0, rHard = 0;
        rQList.forEach(function(q) {
          if (!q) return;
          var d = Number(q.difficulty) || 1;
          if (d === 1) rEasy++;
          else if (d === 3) rHard++;
          else rMed++;
        });

        var randomCard = document.createElement("div");
        randomCard.className = "pkg-card";
        randomCard.style.cssText = "background: white; border: none; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.02); height: 260px; text-align: left; box-sizing: border-box; font-family: 'Inter', system-ui, -apple-system, sans-serif;";
        randomCard.innerHTML = `
          <div>
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              <div style="background: #c2272d; width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(194, 39, 45, 0.15);">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0; text-transform: none; line-height: 1.2; font-family: inherit;">Phòng Luyện Đề Ngẫu Nhiên</h3>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span style="font-size: 11px; background: #fff5f6; color: #c2272d; padding: 2px 10px; border-radius: 9999px; font-weight: 500; font-family: inherit;">${category}</span>
                  <span style="font-size: 11px; background: #fef3c7; color: #d97706; padding: 2px 10px; border-radius: 9999px; font-weight: 500; font-family: inherit;">Ngẫu nhiên</span>
                </div>
              </div>
            </div>
            <p style="color: #64748b; font-size: 14px; font-weight: 400; margin: 14px 0 0 0; font-family: inherit;">Ngân hàng đề trộn ngẫu nhiên theo môn học và ma trận đề.</p>
            <div style="margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; font-size: 11.5px; font-weight: 700;">
              <span style="background: #f1f5f9; color: #1e293b; padding: 3px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">Tổng: ${rQList.length} câu</span>
              <span style="background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 6px; border: 1px solid #bbf7d0;">Dễ: ${rEasy}</span>
              <span style="background: #fef3c7; color: #b45309; padding: 3px 8px; border-radius: 6px; border: 1px solid #fde68a;">TB: ${rMed}</span>
              <span style="background: #ffe4e6; color: #c2272d; padding: 3px 8px; border-radius: 6px; border: 1px solid #fecdd3;">Khó: ${rHard}</span>
            </div>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; width: 100%;">
            <button class="btn" style="background: #c2272d; border-color: #c2272d; color: white; font-weight: 600; width: 100%; padding: 10px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid #c2272d; transition: all 0.2s; font-family: inherit;" onclick="window.selectTeacherPracticePackage('random')">
              Quản lý phòng đề &rarr;
            </button>
          </div>
        `;

        grid.appendChild(freeCard);
        grid.appendChild(premiumCard);
        grid.appendChild(randomCard);
        return;
      }

      // 2. Inside a Package View
      document.querySelector(".teacher-shell")?.classList.add("hide-sidebar");
      const packageName = window.activeTeacherPracticePackage === "free" ? "Phòng Luyện Miễn Phí" : (window.activeTeacherPracticePackage === "random" ? "Phòng Luyện Đề Ngẫu Nhiên" : "Phòng Luyện thực chiến " + category + " 2027");
      if (roomTitle) {
        if (window.activeTeacherPracticePackage === "random") {
          roomTitle.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-family: 'Inter', sans-serif;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px;">
                <span style="color: #64748b; font-weight: 500; cursor: pointer; transition: color 0.15s;" onclick="window.goBackToTeacherPackages()" onmouseover="this.style.color='#c2272d'" onmouseout="this.style.color='#64748b'">${info[0]}</span>
                <span style="color: #cbd5e1; font-weight: 400;">/</span>
                <span style="color: #94a3b8; font-weight: 500;">Gói đề:</span>
                <span style="background: linear-gradient(135deg, #fff5f6 0%, #ffe4e6 100%); color: #c2272d; font-weight: 700; padding: 4px 12px; border-radius: 20px; border: 1px solid #fecdd3; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 3px rgba(194,39,45,0.06);">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: #c2272d; display: inline-block;"></span>
                  ${packageName}
                </span>
              </div>
              <div class="search-box-wrapper" style="position: relative; width: 300px; flex-shrink: 0; margin-left: auto;">
                <input type="text" id="teacher-practice-search-input" class="history-search-input" placeholder="Tìm kiếm theo ID, nội dung..." style="background: #eff3f8; color: #1e293b; border: 1px solid transparent; font-weight: 500; padding: 10px 16px 10px 38px; border-radius: 8px; height: 42px; box-sizing: border-box; font-size: 13.5px; width: 100%; transition: all 0.2s ease; outline: none; font-family: inherit;" oninput="window.filterTeacherPracticeInput()" onfocus="this.style.border='1px solid #c2272d'; this.style.background='#ffffff'; this.style.boxShadow='0 0 0 3px rgba(194, 39, 45, 0.1)';" onblur="this.style.border='1px solid transparent'; this.style.background='#eff3f8'; this.style.boxShadow='none';">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="#c2272d" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #c2272d; opacity: 1;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
          `;
        } else {
          roomTitle.innerHTML = `<span style="color: #64748b; cursor: pointer;" onclick="window.goBackToTeacherPackages()">${info[0]}</span> <span style="color: #cbd5e1; margin: 0 8px;">&gt;</span> <span style="color: #1e293b; font-weight: 700;">Gói đề: ${packageName}</span>`;
        }
      }
      if (roomDesc) roomDesc.style.display = "none";

      var headerBox = document.getElementById("teacher-practice-header-box");
      if (headerBox) {
        if (window.activeTeacherPracticePackage === "random") {
          headerBox.style.display = "none";
        } else {
          headerBox.style.display = "block";
          headerBox.style.padding = "0";
          headerBox.innerHTML = `
            <div class="tab-header-box" style="display: flex; justify-content: space-between; align-items: center; background: #fff5f6; padding: 16px 20px; border-radius: 12px; border: 1.5px solid #ffe4e6; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: #c2272d; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(194, 39, 45, 0.15);">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                </div>
                <span style="color: #c2272d; font-size: 14.5px; font-weight: 700; font-family: inherit;">Chào giáo viên, chúc thầy/cô một ngày làm việc hiệu quả và nhiều niềm vui!</span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="search-box-wrapper" style="position: relative; width: 260px;">
                  <input type="text" id="teacher-practice-search-input" class="history-search-input" placeholder="Tìm kiếm đề thi..." style="width:100%; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px 8px 36px; font-size:13.5px; outline:none; font-family:inherit;" oninput="window.filterTeacherPracticeInput()">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="#94a3b8" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <button class="btn" style="background: #c2272d; border: 1px solid #c2272d; color: white; font-weight: 700; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 13.5px; display: flex; align-items: center; gap: 6px; font-family: inherit;" onclick="window.teacherAddPracticeExam()">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Thêm đề
                </button>
              </div>
            </div>
          `;
        }
      }

      if (category === "TSA") {
        if (window.activeTeacherPracticePackage === "free") {
          if (subtabsContainer) subtabsContainer.style.display = "none";
          
          let openStatus = {};
          try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}
          
          var freeExams = [];
          freeExams.push({
            exam_code: "TMA001",
            title: "Đề Số 01",
            is_open: openStatus["TMA001"] === true,
            hasExam: (window.EXAMS_LIST || []).some(e => e.exam_code === "TMA001") || localStorage.getItem("tma_tsa_exam_TMA001") || localStorage.getItem("tma_tsa_teacher_draft_TMA001")
          });

          var practiceIndexList = [];
          try {
            var rawIdx = localStorage.getItem("tma_tsa_exam_index");
            if (rawIdx) practiceIndexList = JSON.parse(rawIdx) || [];
          } catch(e) {}
          
          if (Array.isArray(practiceIndexList)) {
            practiceIndexList.forEach(function(e) {
              var ec = String(e.exam_code || "").toUpperCase();
              if (ec.startsWith("TMA_FREE_")) {
                var hasExam = (window.EXAMS_LIST || []).some(item => item.exam_code === e.exam_code) || localStorage.getItem("tma_tsa_exam_" + e.exam_code) || localStorage.getItem("tma_tsa_teacher_draft_" + e.exam_code);
                freeExams.push({
                  exam_code: e.exam_code,
                  title: e.title,
                  is_open: e.is_open === true || openStatus[e.exam_code] === true,
                  hasExam: !!hasExam
                });
              }
            });
          }

          freeExams.forEach(function(item) {
            var examTitle = item.title;
            var examCode = item.exam_code;
            var latexInfo = (function(code) {
              var cleanCode = normalizeCode(code);
              var raw = localStorage.getItem("tma_tsa_teacher_draft_" + cleanCode) ||
                        localStorage.getItem("tma_tsa_exam_" + cleanCode) ||
                        localStorage.getItem("tma_tsa_teacher_draft_" + code) ||
                        localStorage.getItem("tma_tsa_exam_" + code);
              var examObj = null;
              if (raw) { try { examObj = JSON.parse(raw); } catch(e) {} }
              var filledCount = 0;
              if (examObj) {
                var checkQ = function(q) {
                  if (!q) return false;
                  var txt = String(q.question || q.content || "").trim();
                  return txt.length > 0;
                };
                if (Array.isArray(examObj.questions)) {
                  examObj.questions.forEach(function(q) { if (checkQ(q)) filledCount++; });
                } else if (Array.isArray(examObj.sections)) {
                  examObj.sections.forEach(function(s) {
                    if (Array.isArray(s.questions)) {
                      s.questions.forEach(function(q) { if (checkQ(q)) filledCount++; });
                    }
                    if (Array.isArray(s.groups)) {
                      s.groups.forEach(function(g) {
                        if (Array.isArray(g.questions)) {
                          g.questions.forEach(function(q) { if (checkQ(q)) filledCount++; });
                        }
                      });
                    }
                  });
                }
              }
              return { hasLatex: filledCount > 0, count: filledCount };
            })(examCode);

            var hasExam = item.hasExam || latexInfo.hasLatex;
            const isOpen = hasExam && item.is_open;

            var card = document.createElement("div");
            card.className = "tsa-exam-item-card";
            card.innerHTML = `
              <!-- Header Section -->
              <div style="display: flex; align-items: flex-start; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; width: 100%; box-sizing: border-box;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0;">
                  <h3 style="font-size: 15px; font-weight: 700; color: #1f2937; margin: 0; text-transform: none; line-height: 1.3;">${examTitle}</h3>
                  <span style="font-size: 12.5px; color: #64748b; font-weight: 500;">${category}</span>
                </div>
              </div>

              <!-- Body Section -->
              <div style="display: flex; flex-direction: column; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; width: 100%; box-sizing: border-box;">
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                  <span style="color: #64748b; font-size: 13.5px; font-weight: 500;">Mã đề:</span>
                  <span style="color: #1f2937; font-size: 13px; font-weight: 700;">${examCode}</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                  <span style="color: #64748b; font-size: 13.5px; font-weight: 500;">Trạng thái:</span>
                  <span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; ${latexInfo.hasLatex ? 'background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;' : 'background:#fff1f2;color:#e11d48;border:1px solid #ffe4e6;'}">
                    ${latexInfo.hasLatex ? `✓ ĐÃ NHẬP LATEX (${latexInfo.count} CÂU)` : 'CHƯA NHẬP LATEX'}
                  </span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                  <span style="color: #64748b; font-size: 13.5px; font-weight: 500;">Hình thức:</span>
                  <span style="color: #1f2937; font-size: 13px; font-weight: 600;">Thi trực tuyến</span>
                </div>
              </div>

              <!-- Footer Section -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; width: 100%; box-sizing: border-box; flex-wrap: wrap; gap: 8px;">
                <span class="${isOpen ? 'badge-green' : ''}" style="${!isOpen ? 'color:#94a3b8;font-size:12.5px;font-weight:600;' : 'font-size:12.5px;'}">
                  ${isOpen ? 'Đang mở đề' : 'Đang đóng đề'}
                </span>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-sm btn-primary" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #c2272d; border: 1px solid #c2272d; color: #fff; border-radius: 6px;" onclick="window.startEditingExam('${examTitle}', '${examCode}')">Chỉnh sửa</button>
                  ${latexInfo.hasLatex ? `
                    ${isOpen ? `
                      <button class="btn btn-sm btn-danger" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #ef4444; border: 1px solid #ef4444; color: #fff; border-radius: 6px;" onclick="window.toggleExamOpen('${examCode}', false)">Đóng</button>
                    ` : `
                      <button class="btn btn-sm" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #16a34a; border: 1px solid #16a34a; color: #fff; border-radius: 6px;" onclick="window.toggleExamOpen('${examCode}', true)">Mở</button>
                    `}
                  ` : ''}
                  <button class="btn btn-sm btn-danger" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #94a3b8; border: 1px solid #94a3b8; color: #fff; border-radius: 6px;" onclick="window.deleteExamPermanently('${examCode}', '${examTitle}')">Xóa</button>
                </div>
              </div>
            `;
            grid.appendChild(card);
          });
          return;
        }

        if (window.activeTeacherPracticePackage === "random") {
          window.currentRandomPracticeSubtab = window.currentRandomPracticeSubtab || "math";

          if (subtabsContainer) {
            subtabsContainer.style.display = "flex";
            subtabsContainer.innerHTML = `
              <div style="display: flex; background: #e2e8f0; padding: 4px; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); gap: 4px; overflow-x: auto; max-width: 100%;">
                <button type="button" class="random-subtab-btn ${window.currentRandomPracticeSubtab === 'math' ? 'active' : ''}" data-subtab="math" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${window.currentRandomPracticeSubtab === 'math' ? '#ffffff' : 'transparent'}; color: ${window.currentRandomPracticeSubtab === 'math' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Toán học</button>
                <button type="button" class="random-subtab-btn ${window.currentRandomPracticeSubtab === 'reading' ? 'active' : ''}" data-subtab="reading" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${window.currentRandomPracticeSubtab === 'reading' ? '#ffffff' : 'transparent'}; color: ${window.currentRandomPracticeSubtab === 'reading' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Đọc hiểu</button>
                <button type="button" class="random-subtab-btn ${window.currentRandomPracticeSubtab === 'science' ? 'active' : ''}" data-subtab="science" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${window.currentRandomPracticeSubtab === 'science' ? '#ffffff' : 'transparent'}; color: ${window.currentRandomPracticeSubtab === 'science' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Khoa học</button>
              </div>
            `;
            
            subtabsContainer.querySelectorAll(".random-subtab-btn").forEach((btn) => {
              btn.addEventListener("click", () => {
                window.currentRandomPracticeSubtab = btn.getAttribute("data-subtab");
                renderPracticeRoom();
              });
            });
          }

          grid.innerHTML = "";
          grid.style.display = "flex";
          grid.style.flexDirection = "column";
          grid.style.gap = "20px";

          var targetCode = "TMA_RANDOM_001";
          var raw = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
          var examObj = null;
          if (raw) {
            try { examObj = JSON.parse(raw); } catch(e) {}
          }

          var stagedMath = [];
          var stagedReading = [];
          var stagedScience = [];
          try { stagedMath = JSON.parse(localStorage.getItem("tma_tsa_staged_math") || "[]"); } catch(e) {}
          try { stagedReading = JSON.parse(localStorage.getItem("tma_tsa_staged_reading") || "[]"); } catch(e) {}
          try { stagedScience = JSON.parse(localStorage.getItem("tma_tsa_staged_science") || "[]"); } catch(e) {}

          var currentSectionStagedCount = 0;
          if (window.currentRandomPracticeSubtab === "math") currentSectionStagedCount = stagedMath.length;
          else if (window.currentRandomPracticeSubtab === "reading") currentSectionStagedCount = stagedReading.length;
          else if (window.currentRandomPracticeSubtab === "science") currentSectionStagedCount = stagedScience.length;

          var officialCount = 0;
          if (window.currentRandomPracticeSubtab === "math") {
            var mathSec = examObj && examObj.sections ? examObj.sections.find(s => s.section_id === "math") : null;
            officialCount = mathSec && mathSec.questions ? mathSec.questions.length : 0;
          } else {
            var secObj = examObj && examObj.sections ? examObj.sections.find(s => s.section_id === window.currentRandomPracticeSubtab) : null;
            officialCount = secObj && secObj.groups ? secObj.groups.length : 0;
          }

          window.currentQbViewMode = window.currentQbViewMode || "official";
          var isStagedMode = window.currentQbViewMode === "staged";

          var deleteBtnHtml = "";
          if (!isStagedMode) {
            if (officialCount > 0) {
              deleteBtnHtml = `
                <button type="button" class="btn" style="border: 1.5px solid #ff3b30; color: #ff3b30; background: #fff0f0; font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; transition: all 0.2s;" onclick="window.clearAllQbOfficialQuestions('${window.currentRandomPracticeSubtab}')">
                  🗑️ Xóa toàn bộ ngân hàng
                </button>
              `;
            }
          } else {
            if (currentSectionStagedCount > 0) {
              deleteBtnHtml = `
                <button type="button" class="btn" style="border: 1.5px solid #ff9500; color: #ff9500; background: #fff9f0; font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; transition: all 0.2s;" onclick="window.clearAllQbStagedQuestions('${window.currentRandomPracticeSubtab}')">
                  🗑️ Xóa sạch hàng chờ duyệt
                </button>
              `;
            }
          }

          var tabOfficialActive = !isStagedMode ? "background: #c2272d; color: white; box-shadow: 0 4px 12px rgba(194,39,45,0.2);" : "background: #f1f5f9; color: #475569;";
          var tabStagedActive = isStagedMode ? "background: #10b981; color: white; box-shadow: 0 4px 12px rgba(16,185,129,0.2);" : "background: #f1f5f9; color: #475569;";

          var viewTabsHtml = `
            <div style="display: flex; gap: 8px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px; font-family: 'Inter', sans-serif;">
              <button type="button" class="btn" onclick="window.switchQbViewMode('official')" style="${tabOfficialActive} border: none; font-weight: 700; padding: 8px 18px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s;">
                📂 Ngân hàng chính thức (${officialCount})
              </button>
              <button type="button" class="btn" onclick="window.switchQbViewMode('staged')" style="${tabStagedActive} border: none; font-weight: 700; padding: 8px 18px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s;">
                ⚡ Câu hỏi mới nhập AI (Chờ duyệt) (${currentSectionStagedCount})
              </button>
            </div>
          `;

          var tableCard = document.createElement("div");
          tableCard.style.cssText = "background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 20px; width: 100%; box-sizing: border-box; font-family: 'Inter', sans-serif;";
          
          var tableHeaderHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; font-family: 'Inter', sans-serif;">
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1e293b;">Ngân hàng câu hỏi Luyện đề ngẫu nhiên</h3>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                ${deleteBtnHtml}
                <button class="btn" style="background: linear-gradient(135deg, #c2272d 0%, #9b1c22 100%); color: white; font-size: 13.5px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(194,39,45,0.25); font-family: inherit; transition: all 0.2s;" onclick="window.openQuestionBankModal()">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Nạp Ngân hàng câu hỏi (AI)
                </button>
              </div>
            </div>
            ${viewTabsHtml}
          `;

          if (window.currentRandomPracticeSubtab === "math") {
            var qList = [];
            if (isStagedMode) {
              qList = stagedMath;
            } else {
              if (examObj && Array.isArray(examObj.sections)) {
                var mathSec = examObj.sections.find(s => s.section_id === "math");
                if (mathSec && Array.isArray(mathSec.questions)) {
                  qList = mathSec.questions;
                }
              }
            }

            if (qList.length === 0) {
              var emptyMsg = isStagedMode 
                ? "Danh sách câu hỏi Toán chờ duyệt đang trống!"
                : "Chưa có câu hỏi Toán học nào!";
              var emptyDesc = isStagedMode
                ? "Dữ liệu nạp từ file/AI sẽ hiển thị ở đây trước khi được duyệt lưu."
                : "Nhấn nút \"Nạp Ngân hàng câu hỏi (AI)\" ở trên để bắt đầu nạp câu hỏi Toán học.";
              tableCard.innerHTML = tableHeaderHtml + `
                <div style="text-align: center; padding: 50px 20px; background: #fafafa; border-radius: 8px; border: 1.5px dashed #e2e8f0; color: #64748b; font-size: 14px; margin-top: 10px;">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94a3b8" stroke-width="1.8" style="margin-bottom: 8px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <div style="font-weight: 600; color: #334155; font-size: 15px;">${emptyMsg}</div>
                  <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${emptyDesc}</div>
                </div>
              `;
            } else {
              var rowsHtml = "";
              qList.forEach(function(q, idx) {
                var diff = Number(q.difficulty) || 1;
                var diffBadge = (diff === 3) 
                  ? '<span style="background: #ffe4e6; color: #c2272d; padding: 3px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 700;">Mức 3 (Khó)</span>'
                  : ((diff === 2)
                    ? '<span style="background: #fef3c7; color: #d97706; padding: 3px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 700;">Mức 2 (TB)</span>'
                    : '<span style="background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 700;">Mức 1 (Dễ)</span>');
                
                var topicText = q.topic || "Khảo sát hàm số";
                var topicBadge = `<span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-size: 11.5px; font-weight: 600; padding: 2px 8px; border-radius: 12px; white-space: nowrap;">${topicText}</span>`;

                var rawTxt = String(q.question || q.content || "").replace(/<[^>]*>?/gm, '');
                var previewText = rawTxt.length > 70 ? (rawTxt.substring(0, 70) + "...") : rawTxt;

                var ansText = "A";
                if (q.correct_answer !== undefined && q.correct_answer !== null) {
                  if (typeof q.correct_answer === "object") {
                    if (Array.isArray(q.correct_answer)) {
                      ansText = q.correct_answer.join(", ");
                    } else {
                      ansText = Object.keys(q.correct_answer).map(function(k) {
                        var val = q.correct_answer[k];
                        if (val === true) return k + ":Đ";
                        if (val === false) return k + ":S";
                        return k + ":" + val;
                      }).join(", ");
                    }
                  } else {
                    ansText = String(q.correct_answer);
                  }
                }

                var qPrefix = isStagedMode ? "STG-m" : "TMA-m";
                var editLabel = isStagedMode ? "✏️ Duyệt & Sửa" : "✏️ Chỉnh sửa";

                rowsHtml += `
                  <tr style="border-bottom: 1px solid #f8fafc; transition: background 0.15s;">
                    <td style="padding: 12px 10px;"><span style="background: #fff5f6; color: #c2272d; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; border: 1px solid #ffe4e6; white-space: nowrap;">${qPrefix}${String(idx + 1).padStart(3, '0')}</span></td>
                    <td style="padding: 12px 10px;">${diffBadge}</td>
                    <td style="padding: 12px 10px;">${topicBadge}</td>
                    <td style="padding: 12px 10px; color: #1e293b; font-weight: 500;">${previewText}</td>
                    <td style="padding: 12px 10px; text-align: center;"><span style="background: #f1f5f9; color: #334155; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">${ansText}</span></td>
                    <td style="padding: 12px 10px; text-align: right; white-space: nowrap;">
                      <button type="button" class="btn btn-sm" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; cursor: pointer; margin-right: 4px;" onclick="window.editQbQuestion(${idx}, ${isStagedMode})">${editLabel}</button>
                      <button type="button" class="btn btn-sm" style="background: #fff5f6; color: #c2272d; border: 1px solid #ffe4e6; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; cursor: pointer;" onclick="window.deleteQbQuestion(${idx}, ${isStagedMode})">Xóa</button>
                    </td>
                  </tr>
                `;
              });

              tableCard.innerHTML = tableHeaderHtml + `
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
                    <thead>
                      <tr style="border-bottom: 2px solid #f1f5f9; color: #64748b; font-weight: 600; font-size: 12.5px;">
                        <th style="padding: 10px; width: 120px;">ID CÂU HỎI</th>
                        <th style="padding: 10px; width: 150px;">ĐỘ KHÓ</th>
                        <th style="padding: 10px; width: 200px;">CHỦ ĐỀ</th>
                        <th style="padding: 10px;">NỘI DUNG CÂU HỎI</th>
                        <th style="padding: 10px; text-align: center; width: 100px;">ĐÁP ÁN</th>
                        <th style="padding: 10px; text-align: right; width: 180px;">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rowsHtml}
                    </tbody>
                  </table>
                </div>
              `;
            }
          } else {
            var groupsList = [];
            var sectionId = window.currentRandomPracticeSubtab;
            if (isStagedMode) {
              groupsList = sectionId === "reading" ? stagedReading : stagedScience;
            } else {
              if (examObj && Array.isArray(examObj.sections)) {
                var sec = examObj.sections.find(s => s.section_id === sectionId);
                if (sec && Array.isArray(sec.groups)) {
                  groupsList = sec.groups;
                }
              }
            }

            var sectionLabel = sectionId === "reading" ? "Đọc hiểu" : "Khoa học";

            if (groupsList.length === 0) {
              var emptyMsg = isStagedMode 
                ? "Danh sách ngữ liệu " + sectionLabel + " chờ duyệt đang trống!"
                : "Chưa có ngữ liệu " + sectionLabel + " nào!";
              var emptyDesc = isStagedMode
                ? "Dữ liệu nạp từ file/AI sẽ hiển thị ở đây trước khi được duyệt lưu."
                : "Nhấn nút \"Nạp Ngân hàng câu hỏi (AI)\" ở trên để bắt đầu nạp ngữ liệu.";
              tableCard.innerHTML = tableHeaderHtml + `
                <div style="text-align: center; padding: 50px 20px; background: #fafafa; border-radius: 8px; border: 1.5px dashed #e2e8f0; color: #64748b; font-size: 14px; margin-top: 10px;">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94a3b8" stroke-width="1.8" style="margin-bottom: 8px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <div style="font-weight: 600; color: #334155; font-size: 15px;">${emptyMsg}</div>
                  <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${emptyDesc}</div>
                </div>
              `;
            } else {
              var rowsHtml = "";
              groupsList.forEach(function(g, idx) {
                var qCount = (g.questions || []).length;
                var rawTxt = String(g.passage || "").replace(/<[^>]*>?/gm, '');
                var previewText = rawTxt.length > 70 ? (rawTxt.substring(0, 70) + "...") : rawTxt;
                var titleText = g.title || "Chưa có tiêu đề";

                var prefix = sectionId === "reading" ? (isStagedMode ? "STG-r" : "TMA-r") : (isStagedMode ? "STG-s" : "TMA-s");
                var idBg = sectionId === "reading" ? "#eff6ff" : "#f0fdf4";
                var idText = sectionId === "reading" ? "#1e40af" : "#166534";
                var idBorder = sectionId === "reading" ? "#bfdbfe" : "#bbf7d0";
                var editLabel = isStagedMode ? "✏️ Duyệt & Sửa" : "✏️ Chỉnh sửa";

                rowsHtml += `
                  <tr style="border-bottom: 1px solid #f8fafc; transition: background 0.15s;">
                    <td style="padding: 12px 10px;"><span style="background: ${idBg}; color: ${idText}; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; border: 1px solid ${idBorder}; white-space: nowrap;">${prefix}${String(idx + 1).padStart(3, '0')}</span></td>
                    <td style="padding: 12px 10px; color: #1e293b; font-weight: 700;">${titleText}</td>
                    <td style="padding: 12px 10px; text-align: center;"><span style="background: #f1f5f9; color: #334155; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">${qCount} câu hỏi</span></td>
                    <td style="padding: 12px 10px; color: #475569; font-weight: 500;">${previewText}</td>
                    <td style="padding: 12px 10px; text-align: right; white-space: nowrap;">
                      <button type="button" class="btn btn-sm" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; cursor: pointer; margin-right: 4px;" onclick="window.editQbGroup('${g.group_id}', '${sectionId}', 0, ${isStagedMode})">${editLabel}</button>
                      <button type="button" class="btn btn-sm" style="background: #fff5f6; color: #c2272d; border: 1px solid #ffe4e6; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; cursor: pointer;" onclick="window.deleteQbGroup('${g.group_id}', '${sectionId}', ${isStagedMode})">Xóa</button>
                    </td>
                  </tr>
                `;
              });

              tableCard.innerHTML = tableHeaderHtml + `
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
                    <thead>
                      <tr style="border-bottom: 2px solid #f1f5f9; color: #64748b; font-weight: 600; font-size: 12.5px;">
                        <th style="padding: 10px; width: 120px;">MÃ NGỮ LIỆU</th>
                        <th style="padding: 10px; width: 220px;">TIÊU ĐỀ NGỮ LIỆU</th>
                        <th style="padding: 10px; text-align: center; width: 120px;">SỐ CÂU HỎI</th>
                        <th style="padding: 10px;">NỘI DUNG TÓM TẮT</th>
                        <th style="padding: 10px; text-align: right; width: 180px;">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rowsHtml}
                    </tbody>
                  </table>
                </div>
              `;
            }
          }

          grid.appendChild(tableCard);
          return;
        }

        // TSA Premium
        if (subtabsContainer) {
          subtabsContainer.style.display = "flex";
          subtabsContainer.innerHTML = `
            <div style="display: flex; background: #e2e8f0; padding: 4px; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); gap: 4px; overflow-x: auto; max-width: 100%;">
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

        var examsToRender = [];
        practiceIndexList.forEach(function(e) {
          var ec = String(e.exam_code || "").toUpperCase();
          
          // Exclude TMA001 from Premium tong-hop list
          if (ec === "TMA001" && currentTsaPracticeSubtab === "tong-hop") return;

          var isFullExam = ec.startsWith("TMA") || ec.startsWith("TSA_PRACTICE_FULL_");
          var matchesCategory = false;
          if (isFullExam) {
            matchesCategory = (currentTsaPracticeSubtab === "tong-hop");
          } else {
            var cat = "tong-hop";
            if (ec.includes("_MATH_")) cat = "math";
            else if (ec.includes("_READING_")) cat = "reading";
            else if (ec.includes("_SCIENCE_")) cat = "science";
            matchesCategory = (cat === currentTsaPracticeSubtab);
          }

          if (matchesCategory) {
            examsToRender.push({
              exam_code: e.exam_code,
              title: e.title,
              is_open: e.is_open,
              hasExam: true
            });
          }
        });

        // Add default slots for TSA premium subtabs
        if (currentTsaPracticeSubtab === "tong-hop") {
          // TMA002 to TMA010
          for (let i = 2; i <= 10; i++) {
            var numStr3 = String(i).padStart(3, "0");
            var numStr2 = String(i).padStart(2, "0");
            var defaultCode = "TMA" + numStr3;
            var defaultTitle = `Đề tổng hợp số ${numStr2}`;
            
            var alreadyIn = examsToRender.some(e => normalizeCode(e.exam_code) === normalizeCode(defaultCode));
            if (!alreadyIn) {
              examsToRender.push({
                exam_code: defaultCode,
                title: defaultTitle,
                is_open: false,
                hasExam: false
              });
            }
          }
        } else {
          // math, reading, science: TSA_PRACTICE_MATH_01 to 09, etc.
          var subPrefix = currentTsaPracticeSubtab.toUpperCase();
          for (let i = 1; i <= 9; i++) {
            var numStr2 = String(i).padStart(2, "0");
            var defaultCode = `TSA_PRACTICE_${subPrefix}_${numStr2}`;
            var defaultTitle = "";
            if (currentTsaPracticeSubtab === "math") defaultTitle = `Đề TSA số ${numStr2} - Tư duy Toán học`;
            else if (currentTsaPracticeSubtab === "reading") defaultTitle = `Đề TSA số ${numStr2} - Đọc hiểu`;
            else if (currentTsaPracticeSubtab === "science") defaultTitle = `Đề TSA số ${numStr2} - Khoa học`;

            var alreadyIn = examsToRender.some(e => normalizeCode(e.exam_code) === normalizeCode(defaultCode));
            if (!alreadyIn) {
              examsToRender.push({
                exam_code: defaultCode,
                title: defaultTitle,
                is_open: false,
                hasExam: false
              });
            }
          }
        }

        // Filter out deleted exams
        var deletedExamsList = [];
        try {
          deletedExamsList = JSON.parse(localStorage.getItem("tma_tsa_deleted_exams") || "[]");
        } catch(e) {}

        examsToRender = examsToRender.filter(function(item) {
          var cleanCode = normalizeCode(item.exam_code);
          return !deletedExamsList.some(d => normalizeCode(d) === cleanCode);
        });

        // Sort and render
        examsToRender.sort(function(a, b) {
          if (a.hasExam !== b.hasExam) {
            return b.hasExam ? -1 : 1;
          }
          return a.exam_code.localeCompare(b.exam_code);
        });

        examsToRender.forEach(function(item) {
          var examTitle = item.title;
          var examCode = item.exam_code;
          var latexInfo = (function(code) {
            var cleanCode = normalizeCode(code);
            var raw = localStorage.getItem("tma_tsa_teacher_draft_" + cleanCode) ||
                      localStorage.getItem("tma_tsa_exam_" + cleanCode) ||
                      localStorage.getItem("tma_tsa_teacher_draft_" + code) ||
                      localStorage.getItem("tma_tsa_exam_" + code);
            var examObj = null;
            if (raw) { try { examObj = JSON.parse(raw); } catch(e) {} }
            var filledCount = 0;
            if (examObj) {
              var checkQ = function(q) {
                if (!q) return false;
                var txt = String(q.question || q.content || "").trim();
                return txt.length > 0;
              };
              if (Array.isArray(examObj.questions)) {
                examObj.questions.forEach(function(q) { if (checkQ(q)) filledCount++; });
              } else if (Array.isArray(examObj.sections)) {
                examObj.sections.forEach(function(s) {
                  if (Array.isArray(s.questions)) {
                    s.questions.forEach(function(q) { if (checkQ(q)) filledCount++; });
                  }
                  if (Array.isArray(s.groups)) {
                    s.groups.forEach(function(g) {
                      if (Array.isArray(g.questions)) {
                        g.questions.forEach(function(q) { if (checkQ(q)) filledCount++; });
                      }
                    });
                  }
                });
              }
            }
            return { hasLatex: filledCount > 0, count: filledCount };
          })(examCode);

          var hasExam = item.hasExam || latexInfo.hasLatex;
          const isOpen = hasExam && (item.is_open === true || openStatus[examCode] === true);

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
                <span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; ${latexInfo.hasLatex ? 'background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;' : 'background:#fff1f2;color:#e11d48;border:1px solid #ffe4e6;'}">
                  ${latexInfo.hasLatex ? `✓ ĐÃ NHẬP LATEX (${latexInfo.count} CÂU)` : 'CHƯA NHẬP LATEX'}
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
            </div>
            <footer class="exam-card-footer" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
              <button class="btn btn-sm btn-primary" style="font-weight: 800; padding: 6px 12px; font-size: 12px;" onclick="window.startEditingExam('${examTitle}', '${examCode}')">Chỉnh sửa</button>
              ${latexInfo.hasLatex ? `
                ${isOpen ? `
                  <button class="btn btn-sm btn-danger" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #ef4444; border-color: #ef4444; color: #fff;" onclick="window.toggleExamOpen('${examCode}', false)">
                    Đóng đề
                  </button>
                ` : `
                  <button class="btn btn-sm" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #16a34a; border-color: #16a34a; color: #fff;" onclick="window.toggleExamOpen('${examCode}', true)">
                    Mở đề
                  </button>
                `}
              ` : ''}
              <button class="btn btn-sm btn-danger" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #94a3b8; border-color: #94a3b8; color: #fff;" onclick="window.deleteExamPermanently('${examCode}', '${examTitle}')">Xóa đề</button>
            </footer>
          `;
          grid.appendChild(card);
        });
        return;
      }

      // Other Categories (non-TSA)
      if (subtabsContainer) subtabsContainer.style.display = "none";
      var displayCategory = category === "THPT" ? "THPTQG" : category;

      if (window.activeTeacherPracticePackage === "free") {
        // Only show i = 1
        var numStr = "01";
        var examTitle = `Đề ${displayCategory} số ${numStr}`;
        var examCode = `${category}01`;
        var card = document.createElement("div");
        card.className = "tsa-exam-item-card";
        card.innerHTML = `
          <!-- Header Section -->
          <div style="display: flex; align-items: flex-start; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; width: 100%; box-sizing: border-box;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0;">
              <h3 style="font-size: 15px; font-weight: 700; color: #1f2937; margin: 0; text-transform: none; line-height: 1.3;">${examTitle}</h3>
              <span style="font-size: 12.5px; color: #64748b; font-weight: 500;">${category}</span>
            </div>
          </div>

          <!-- Body Section -->
          <div style="display: flex; flex-direction: column; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; width: 100%; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <span style="color: #64748b; font-size: 13.5px; font-weight: 500;">Mã đề:</span>
              <span style="color: #1f2937; font-size: 13px; font-weight: 700;">${examCode}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <span style="color: #64748b; font-size: 13.5px; font-weight: 500;">Hình thức:</span>
              <span style="color: #1f2937; font-size: 13px; font-weight: 600;">Thi trực tuyến</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <span style="color: #64748b; font-size: 13.5px; font-weight: 500;">Thời gian đăng ký:</span>
              <span style="color: #1f2937; font-size: 13px; font-weight: 600;">Hằng ngày</span>
            </div>
          </div>

          <!-- Footer Section -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; width: 100%; box-sizing: border-box;">
            <span style="color: #c2272d; font-size: 12.5px; font-weight: 600;">Miễn phí</span>
            <button class="btn btn-sm btn-primary" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #c2272d; border-color: #c2272d; color: #fff; border-radius: 6px;" onclick="startEditingExam('${examTitle}', '${examCode}')">Chỉnh sửa</button>
          </div>
        `;
        grid.appendChild(card);
      } else {
        // Show Premium (i = 2 to 10)
        for (let i = 2; i <= 10; i++) {
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
                <span class="info-label">Mã đề:</span>
                <span class="info-value font-bold">${examCode}</span>
              </div>
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
            </div>
            <footer class="exam-card-footer">
              <button class="btn btn-sm btn-primary" style="font-weight: 800;" onclick="startEditingExam('${examTitle}', '${examCode}')">Chỉnh sửa</button>
            </footer>
          `;
          grid.appendChild(card);
        }
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
              <button class="btn btn-sm btn-outline" style="font-weight: 800; padding: 6px 12px; font-size: 12px;" onclick="openMockOperations('${examCode}', '${examTitleStr}')">
                Vận hành kỳ thi
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
            <button class="btn btn-sm btn-outline" style="font-weight: 800;" onclick="openMockOperations('${examItem.code}', '${examItem.title}')">Vận hành kỳ thi</button>
          </footer>
        `;
        grid.appendChild(card);
      });
    }
    window.renderExamsList = renderExamsList;

    window.switchSystemSubtab = function(subtabId) {
      // Toggle sub-panels visibility
      document.querySelectorAll(".system-subtab-panel").forEach(function(panel) {
        panel.style.display = panel.id === "subtab-" + subtabId ? "block" : "none";
      });

      // Toggle active styling of horizontal tabs
      document.querySelectorAll(".system-admin-tab-btn").forEach(function(btn) {
        var isTarget = btn.getAttribute("data-subtab") === subtabId;
        btn.classList.toggle("active", isTarget);
        if (isTarget) {
          btn.style.background = "#ffffff";
          btn.style.color = "#135c97";
          btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
        } else {
          btn.style.background = "transparent";
          btn.style.color = "#64748b";
          btn.style.boxShadow = "none";
        }
      });

      // Trigger data fetch/render on switch
      if (subtabId === "manage-courses") {
        if (typeof renderManageCourses === "function") renderManageCourses();
      } else if (subtabId === "activation-codes") {
        if (typeof renderActivationCodes === "function") renderActivationCodes();
      } else if (subtabId === "security-logs") {
        if (typeof renderSecurityLogs === "function") renderSecurityLogs();
      }
    };

    window.switchStudentSubtab = function(subtabId) {
      // Toggle sub-panels visibility
      document.querySelectorAll(".student-subtab-panel").forEach(function(panel) {
        panel.style.display = panel.id === "subtab-" + subtabId ? "block" : "none";
      });

      // Toggle active styling of horizontal tabs
      document.querySelectorAll(".student-admin-tab-btn").forEach(function(btn) {
        var isTarget = btn.getAttribute("data-subtab") === subtabId;
        btn.classList.toggle("active", isTarget);
        if (isTarget) {
          btn.style.background = "#ffffff";
          btn.style.color = "#135c97";
          btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
        } else {
          btn.style.background = "transparent";
          btn.style.color = "#64748b";
          btn.style.boxShadow = "none";
        }
      });

      // Trigger data fetch/render on switch
      if (subtabId === "manage-students") {
        // Handled in loadInitialData or standard fetch
      } else if (subtabId === "approve-courses") {
        if (typeof renderManageCourses === "function") renderManageCourses();
      } else if (subtabId === "manage-documents") {
        if (typeof renderManageDocuments === "function") renderManageDocuments();
      }
    };

    function switchSystemTab(tabId) {
      var originalTabId = tabId;

      // Map old subtab targets to the unified settings panel
      var systemSubtabs = ["manage-courses", "activation-codes", "security-logs", "manage-links"];
      var activeSubtab = null;
      if (systemSubtabs.indexOf(tabId) !== -1) {
        activeSubtab = tabId;
        tabId = "system-settings";
      }

      // Map old student subtab targets to the unified student panel
      var studentSubtabs = ["manage-students", "approve-courses", "manage-documents"];
      var activeStudentSubtab = null;
      if (studentSubtabs.indexOf(tabId) !== -1) {
        activeStudentSubtab = tabId;
        tabId = "student-management";
      }

      // Show correct dashboard panel
      document.querySelectorAll("#dashboard-container .tab-panel").forEach(function(panel) {
        panel.classList.toggle("active", panel.id === "tab-" + tabId);
      });

      // Update sidebar nav active states
      document.querySelectorAll("#sidebar-normal-nav .nav-button").forEach(function(btn) {
        var target = btn.getAttribute("data-tab-target");
        btn.classList.toggle("active", target === originalTabId);
      });
      document.querySelectorAll(".submenu-item").forEach(function(item) {
        item.classList.remove("active");
      });
      document.querySelectorAll(".menu-group").forEach(function(g) {
        g.classList.remove("has-active");
      });

      if (tabId === "overview") {
        if (typeof renderOverview === "function") renderOverview();
      } else if (tabId === "practice") {
        renderPracticeRoom();
      } else if (tabId === "exams") {
        if (typeof backToExamsLobby === "function") backToExamsLobby();
      } else if (tabId === "student-management") {
        if (activeStudentSubtab) {
          switchStudentSubtab(activeStudentSubtab);
        } else {
          switchStudentSubtab("manage-students");
        }
      } else if (tabId === "system-settings") {
        if (activeSubtab) {
          switchSystemSubtab(activeSubtab);
        } else {
          switchSystemSubtab("manage-courses");
        }
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
      function clone(value) {
        if (value === undefined || value === null) return value;
        return JSON.parse(JSON.stringify(value));
      }
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
        var isRandomPracticeExam = (exam && exam.exam_code === "TMA_RANDOM_001");
        if (!isRandomPracticeExam) {
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

        var isRandomPractice = (exam.exam_code === "TMA_RANDOM_001");

        // Helper to fix image URLs in HTML strings
        function fixImageUrlsInHtml(html) {
          if (!html) return html;
          var isLocalFile = (window.location.protocol === "file:");
          return html.replace(/<img\s+([^>]*\s+)?src=(["'])([^"'\s]+)\2/gi, function(match, prefix, quote, src) {
            var newSrc = src;
            if (src.indexOf("http://") !== 0 && src.indexOf("https://") !== 0 && src.indexOf("data:") !== 0) {
              if (isLocalFile) {
                if (src.indexOf("assets/") === 0) {
                  newSrc = src;
                } else {
                  newSrc = "assets/" + src;
                }
              } else {
                if (src.indexOf("assets/") === 0) {
                  newSrc = "https://assets.tmastudy.io.vn/" + src;
                } else {
                  newSrc = "https://assets.tmastudy.io.vn/assets/" + src;
                }
              }
            } else if (isLocalFile && src.indexOf("https://assets.tmastudy.io.vn/") === 0) {
              newSrc = src.replace("https://assets.tmastudy.io.vn/", "");
            }
            return '<img ' + (prefix || '') + 'src=' + quote + newSrc + quote;
          });
        }

        // Enforce Reading Section Schema (exactly 2 groups, 10 questions each)
        var readingSec = getSection("reading");
        if (readingSec) {
          if (!Array.isArray(readingSec.groups)) readingSec.groups = [];
          
          // Ensure stimulus/passage synchronization and structure for all reading groups
          readingSec.groups.forEach(function(g) {
            if (!g.stimulus) {
              g.stimulus = { type: "text", content: "", image_url: "", image_width: 100 };
            }
            if (g.passage && !g.stimulus.content) {
              g.stimulus.content = g.passage;
            }
            if (g.stimulus.content && !g.passage) {
              g.passage = g.stimulus.content;
            }
            // Fix image URLs
            if (g.stimulus.content) g.stimulus.content = fixImageUrlsInHtml(g.stimulus.content);
            if (g.passage) g.passage = fixImageUrlsInHtml(g.passage);
            if (g.stimulus.image_url) {
              var src = g.stimulus.image_url;
              if (src.indexOf("http://") !== 0 && src.indexOf("https://") !== 0 && src.indexOf("data:") !== 0) {
                if (src.indexOf("assets/") === 0) {
                  g.stimulus.image_url = "https://assets.tmastudy.io.vn/" + src;
                } else {
                  g.stimulus.image_url = "https://assets.tmastudy.io.vn/assets/" + src;
                }
              }
            }
          });
          
          if (!isRandomPractice) {
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
            // Strip legacy demo placeholder text if still present (Only for regular mock exams!)
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
            // Strip legacy demo placeholder text if still present (Only for regular mock exams!)
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
          } else {
            if (!activeGroupIds["reading"] && readingSec.groups.length > 0) {
              activeGroupIds["reading"] = readingSec.groups[0].group_id;
            }
          }
        }

        // Enforce Science Section Schema (exactly 8 groups, 5 questions each)
        var scienceSec = getSection("science");
        if (scienceSec) {
          if (!Array.isArray(scienceSec.groups)) scienceSec.groups = [];
          
          if (!isRandomPractice) {
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
              // Strip legacy demo placeholder text if still present (Only for regular mock exams!)
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
          } else {
            if (!activeGroupIds["science"] && scienceSec.groups.length > 0) {
              activeGroupIds["science"] = scienceSec.groups[0].group_id;
            }
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
        if (container) container.style.display = "none";
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
          setup: "Khởi tạo đề thi",
          math: "Soạn phần Tư duy Toán học",
          reading: "Soạn phần Đọc hiểu",
          science: "Soạn phần Khoa học",
          export: "Lưu và xuất đề"
        };
        var pageTitleEl = $("#page-title") || document.getElementById("page-title");
        if (pageTitleEl) {
          pageTitleEl.textContent = titles[tab] || "Bộ soạn đề TSA";
        }

        // Hide/show topbar title/subtitle, autosave, and summary grid on math, reading, science tabs
        var isSubjectTab = (tab === "math" || tab === "reading" || tab === "science");
        var titleWrapper = document.getElementById("topbar-title-wrapper");
        var editorControls = document.getElementById("topbar-editor-controls");
        var autosaveStatus = document.getElementById("autosave-status");
        var summaryGrid = document.getElementById("summary-grid");
        var topbar = document.querySelector("#editor-container .topbar");

        var setupControls = document.getElementById("topbar-setup-controls");
        var mathControls = document.getElementById("topbar-math-controls");

        if (window.isEditingSingleQbQuestion) {
          if (setupControls) setupControls.style.display = "none";
          if (mathControls) mathControls.style.display = "flex";
          if (topbar) {
            topbar.style.display = "flex";
            topbar.style.marginBottom = "12px";
            topbar.style.paddingBottom = "0px";
          }
        } else {
          if (setupControls) {
            setupControls.style.display = (tab === "setup") ? "flex" : "none";
          }
          if (mathControls) {
            mathControls.style.display = (tab === "math") ? "flex" : "none";
          }
        }

        if (isSubjectTab) {
          if (titleWrapper) titleWrapper.style.display = "none";
          if (editorControls) editorControls.style.display = "none";
          if (autosaveStatus) autosaveStatus.style.display = "none";
          if (summaryGrid) summaryGrid.style.display = "none";
          if (topbar && !window.isEditingSingleQbQuestion) {
            topbar.style.display = (tab === "math") ? "flex" : "none";
            topbar.style.marginBottom = (tab === "math") ? "12px" : "0px";
            topbar.style.paddingBottom = "0px";
          }
          updateTopbarQNo();
        } else {
          if (titleWrapper) titleWrapper.style.display = (tab === "setup") ? "none" : "block";
          if (editorControls) editorControls.style.display = "none";
          if (autosaveStatus) autosaveStatus.style.display = (tab === "setup") ? "none" : "block";
          if (summaryGrid) summaryGrid.style.display = (tab === "setup") ? "none" : "grid";
          if (topbar && !window.isEditingSingleQbQuestion) {
            topbar.style.display = (tab === "setup") ? "flex" : "block";
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

        // Auto collapse sidebar on subject tabs (math, reading, science) ONLY in 40-question exam mode, NOT in single-qb-mode!
        var shell = document.querySelector(".teacher-shell");
        if (shell) {
          if (!document.body.classList.contains("single-qb-mode") && (tab === "math" || tab === "reading" || tab === "science")) {
            shell.classList.add("sidebar-collapsed");
          } else {
            shell.classList.remove("sidebar-collapsed");
          }
        }
      }

      function toggleSidebar() {
        var shell = document.querySelector(".teacher-shell");
        if (shell) {
          shell.classList.toggle("sidebar-collapsed");
        }
      }
      window.toggleSidebar = toggleSidebar;

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
          if (!activeMathQuestionNo || activeMathQuestionNo < 1) activeMathQuestionNo = 1;
          if (!editingQuestion["math"] || !editingQuestion["math"].question || editingQuestion["math"].index !== activeMathQuestionNo - 1) {
            var mathSec = getSection("math");
            var mathQs = mathSec ? (mathSec.questions || []) : [];
            var mathTarget = mathQs[activeMathQuestionNo - 1] || defaultQuestion("math");
            var q = clone(mathTarget) || defaultQuestion("math");
            if (q) q.question_no = activeMathQuestionNo; // always align displayed number with slot
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

              // Question Type tabs (Only for non-math sections, as math has Vách 1 sidebar)
              (sectionId === "math" ? "" :
                '<div class="q-type-tabs-nav" style="width: 100%; margin-bottom: 8px;">' +
                  typeTabsHtml(sectionId, q.question_type) +
                '</div>'
              ) +
              // Inputs
              '<div class="field full"><label>Nội dung câu hỏi</label><textarea class="textarea" id="' + sectionId + '-q-text" placeholder="Nhập nội dung câu hỏi">' + esc(q.question || "") + '</textarea></div>' +
              '<div class="field full" style="display: ' + (sectionId === "reading" ? 'none' : 'grid') + '; grid-template-columns: 360px 180px 1fr; gap: 10px; align-items: end; margin-bottom: 0;">' +
                '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Đường dẫn ảnh nếu có</label><input class="input" id="' + sectionId + '-q-image" value="' + attr(q.image_url || "") + '" placeholder="https://assets.tmastudy.io.vn/assets/questions/' + attr(exam.exam_code) + '/cau-01.webp"></div>' +
                '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Kích thước ảnh: <span id="' + sectionId + '-q-image-width-val">' + (q.image_width || 100) + '</span>%</label>' +
                  '<input type="range" class="slider" id="' + sectionId + '-q-image-width" min="10" max="100" value="' + (q.image_width || 100) + '" style="width: 100%; display: block; height: 28px; margin: 0; padding: 0; cursor: pointer;">' +
                '</div>' +
              '</div>' +
              '<div class="field full" id="' + sectionId + '-type-fields" style="width: 100%;"></div>' +
              '<div class="field full">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">' +
                  '<label style="margin-bottom:0;">Giải thích lời giải</label>' +
                  '<button type="button" class="btn btn-secondary btn-sm" id="' + sectionId + '-ai-explain-btn" style="height:26px; padding:0 8px; font-size:11px; border-radius:4px; font-weight:600; background:#c2272d; color:#fff; border:none; cursor:pointer;" onclick="window.generateAiExplanation(\'' + sectionId + '\')">🤖 AI Làm lời giải</button>' +
                '</div>' +
                '<textarea class="textarea" id="' + sectionId + '-q-explanation">' + esc(q.explanation || q.solution_details || q.solution_detail || q.solution || "") + '</textarea>' +
              '</div>' +
            '</div>' +

            // Preview View Wrapper (for reading/science split view if needed)
            (sectionId === "math" ? "" :
            ('<div id="' + sectionId + '-preview-view" style="display: none; width: 100%;">' +
              '<div style="display: grid; grid-template-columns: minmax(280px, 1fr) minmax(320px, 1fr); gap: 0; width: 100%; min-height: 480px; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: #fff;">' +
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
              '</div>' +
            '</div>')
          );
        renderTypeFields(sectionId, q);
        
        var slider = $("#" + sectionId + "-q-image-width");
        var indicator = $("#" + sectionId + "-q-image-width-val");
        if (slider && indicator) {
          slider.addEventListener("input", function () {
            indicator.textContent = this.value;
          });
        }

        var inputSelectors = "#" + sectionId + "-question-form input, #" + sectionId + "-question-form textarea, #" + sectionId + "-question-form select";
        if (sectionId === "math") {
          inputSelectors += ", #math-pane-sidebar select, #vach1-question-type-tabs button";
        }
      function updateFillBlankFieldsRealtime(sectionId) {
        var qTextEl = $("#" + sectionId + "-q-text");
        var qTypeEl = $("#" + sectionId + "-q-type") || document.getElementById(sectionId + "-q-type");
        var currentType = qTypeEl ? qTypeEl.value : "";
        if (!qTextEl || currentType !== "fill_blank") return;

        var text = qTextEl.value || "";
        var isMulti = /\[(o\d+|blank)\]/.test(text);

        var correctField = document.querySelector("#" + sectionId + "-type-fields #fill-correct");
        var acceptedField = document.querySelector("#" + sectionId + "-type-fields #fill-accepted");
        
        if (correctField) {
          var labelEl = correctField.closest(".field")?.querySelector("label");
          if (isMulti) {
            if (labelEl) labelEl.textContent = "Đáp án đúng từng ô (Dạng: o1=đáp_án_1 | o2=đáp_án_2)";
            correctField.placeholder = "Ví dụ: o1=đáp_án_1 | o2=đáp_án_2";
            if (acceptedField) {
              var accFieldBlock = acceptedField.closest(".field");
              if (accFieldBlock) accFieldBlock.style.display = "none";
            }
          } else {
            if (labelEl) labelEl.textContent = "Đáp án chính xác";
            correctField.placeholder = "Đáp án viết thường hoặc hoa đều chấp nhận";
            if (acceptedField) {
              var accFieldBlock = acceptedField.closest(".field");
              if (accFieldBlock) accFieldBlock.style.display = "block";
            }
          }
        }
      }

        $all(inputSelectors).forEach(function (input) {
          input.addEventListener("input", function () {
            updatePreview(sectionId);
            if (input.id === sectionId + "-q-text") {
              updateFillBlankFieldsRealtime(sectionId);
            }
          });
          input.addEventListener("change", function () {
            updatePreview(sectionId);
            if (input.id === sectionId + "-q-text") {
              updateFillBlankFieldsRealtime(sectionId);
            }
          });
        });

        var saveBtn = document.querySelector('button[data-save-question="' + sectionId + '"]');
        if (saveBtn) {
          if (sectionId === "reading") {
            saveBtn.textContent = "Lưu câu hỏi";
          } else {
            saveBtn.textContent = (editingQuestion[sectionId]?.index === -1) ? "Thêm vào ngữ liệu" : "Lưu câu hỏi";
          }
        }

        if (window.isEditingSingleQbQuestion && typeof window.injectSingleQuestionControls === "function") {
          window.injectSingleQuestionControls(sectionId);
        }

        updatePreview(sectionId);
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
          var isMulti = /\[(o\d+|blank)\]/.test(q.question || "");
          if (isMulti) {
            q.correct_answer = q.correct_answer && typeof q.correct_answer === "object" && !Array.isArray(q.correct_answer) ? q.correct_answer : {};
          } else {
            q.correct_answer = typeof q.correct_answer === "string" ? q.correct_answer : "";
          }
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
          '<label for="' + sectionId + '-options-are-images" style="font-weight: 750; cursor: pointer; color: #c2272d; font-size: 13.5px;">Đáp án bằng hình ảnh (4 lựa chọn là ảnh)</label>' +
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
        var isMulti = /\[(o\d+|blank)\]/.test(q.question || "");
        var corrVal = "";
        if (q.correct_answer && typeof q.correct_answer === "object") {
          corrVal = Object.keys(q.correct_answer).map(function (k) { return k + "=" + q.correct_answer[k]; }).join(" | ");
        } else {
          corrVal = q.correct_answer || "";
        }
        var placeholder = isMulti ? "Ví dụ: o1=đáp_án_1 | o2=đáp_án_2" : "Đáp án viết thường hoặc hoa đều chấp nhận";
        var label = isMulti ? "Đáp án đúng từng ô (Dạng: o1=đáp_án_1 | o2=đáp_án_2)" : "Đáp án chính xác";
        return '<div class="form-grid">' +
          '<div class="field"><label>' + label + '</label><input class="input" id="fill-correct" value="' + attr(corrVal) + '" placeholder="' + placeholder + '"></div>' +
          (!isMulti ? '<div class="field"><label>Các đáp án đồng nghĩa khác (Ngăn cách bởi dấu |)</label><input class="input" id="fill-accepted" value="' + attr(accepts) + '" placeholder="ví dụ: 0.5 | 1/2"></div>' : '') +
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
        var expVal = ($("#" + sectionId + "-q-explanation")?.value || "").trim();
        var base = {
          question_no: Number($("#" + sectionId + "-q-no")?.value) || nextQuestionNo(sectionId),
          question_type: $("#" + sectionId + "-q-type")?.value || "single_choice",
          question: $("#" + sectionId + "-q-text")?.value || "",
          image_url: $("#" + sectionId + "-q-image")?.value || "",
          image_width: Number($("#" + sectionId + "-q-image-width")?.value) || 100,
          explanation: expVal,
          solution_details: expVal,
          solution: expVal,
          points: 1
        };
        
        if (sectionId === "math") {
          var diffSel = document.getElementById("math-q-difficulty-select");
          if (diffSel) {
            base.difficulty = Number(diffSel.value) || 1;
          }
          var topicSel = document.getElementById("math-single-qb-topic-select");
          if (topicSel) {
            base.topic = topicSel.value;
          } else if (editingQuestion["math"] && editingQuestion["math"].question) {
            base.topic = editingQuestion["math"].question.topic || "Khảo sát hàm số";
          }
        }
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
          var corrStr = ($("#fill-correct")?.value || "").trim();
          var isMulti = /\[(o\d+|blank)\]/.test(base.question || "");
          if (isMulti) {
            var correct_answer = {};
            corrStr.split("|").forEach(function (pair) {
              var parts = pair.split("=");
              if (parts.length === 2) {
                correct_answer[parts[0].trim()] = parts[1].trim();
              }
            });
            base.correct_answer = correct_answer;
            base.accepted_answers = [];
          } else {
            base.correct_answer = corrStr;
            var accs = ($("#fill-accepted")?.value || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean);
            base.accepted_answers = accs;
          }
          base.items = [];
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
              if (!foundItem) {
                var matchIndex = -1;
                var numMatch = matchText.match(/^(?:i|item)?(\d+)$/i);
                if (numMatch) {
                  matchIndex = parseInt(numMatch[1], 10) - 1;
                }
                if (matchIndex >= 0 && matchIndex < items.length) {
                  foundItem = items[matchIndex];
                }
              }
              correct_answer[blankId] = foundItem ? foundItem.id : matchText;
            }
          });
          base.correct_answer = correct_answer;
        }
        return base;
      }

      function saveQuestion(sectionId) {
        var base = collectBaseQuestion(sectionId, true);
        if (typeof window.cleanTmaQuestionData === "function") {
          window.cleanTmaQuestionData(base);
        }
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
        var grid = $("#math-wizard-grid-tabs");
        if (!grid) return;
        grid.innerHTML = "";
        
        ensureSchema();
        var mathSec = getSection("math");
        var questions = mathSec.questions || [];
        
        var isRandom = (exam && exam.exam_code === "TMA_RANDOM_001");
        var maxQs = isRandom ? questions.length : 40;
        
        var editedCount = 0;
        for (var i = 1; i <= maxQs; i++) {
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
          
          var styleStr = "display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; min-width: 22px; flex-shrink: 0; border-radius: 50%; font-size: 10.5px; cursor: pointer; transition: all 0.15s ease; padding: 0; box-sizing: border-box;";
          if (isActive) {
            if (isFilled) {
              styleStr += " background: #c2272d; color: #ffffff; border: 2px solid #881337; font-weight: 800; transform: scale(1.15); box-shadow: 0 2px 4px rgba(194,39,45,0.35); z-index: 2;";
            } else {
              styleStr += " background: #ffffff; color: #c2272d; border: 2px solid #c2272d; font-weight: 800; transform: scale(1.15); box-shadow: 0 2px 4px rgba(194,39,45,0.25); z-index: 2;";
            }
          } else {
            if (isFilled) {
              styleStr += " background: #c2272d; color: #ffffff; border: none; font-weight: 700; opacity: 0.9;";
            } else {
              styleStr += " background: #f8fafc; color: #64748b; border: 1px solid #cbd5e1; font-weight: 600;";
            }
          }
          
          var btnHtml = '<button type="button" style="' + styleStr + '" onclick="selectMathWizardQuestion(' + i + ')">' + i + '</button>';
          grid.innerHTML += btnHtml;
        }
        
        var progressEl = $("#math-wizard-progress");
        if (progressEl) {
          progressEl.textContent = "Tiến độ: " + editedCount + "/" + maxQs + " câu";
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
      window.selectMathWizardQuestion = selectMathWizardQuestion;
      window.editQuestion = editQuestion;

      function selectMathWizardQuestion(qNo) {
        var isRandom = (exam && exam.exam_code === "TMA_RANDOM_001");
        var mathSecLimit = getSection("math");
        var maxQs = isRandom ? (mathSecLimit ? mathSecLimit.questions.length : 40) : 40;
        if (qNo < 1 || qNo > maxQs) return;
        
        // Auto-save current draft before switching
        if (editingQuestion["math"] && editingQuestion["math"].question) {
          var currentVal = collectBaseQuestion("math", false);
          currentVal.question_no = activeMathQuestionNo; // always keep question_no correct
          ensureSchema();
          var mathSec2 = getSection("math");
          if (mathSec2 && Array.isArray(mathSec2.questions)) {
            mathSec2.questions[activeMathQuestionNo - 1] = currentVal;
          }
          saveDraft();
        }
        
        activeMathQuestionNo = qNo;
        ensureSchema();
        var mathSec = getSection("math");
        
        // Load by array slot safely
        var rawQ = (mathSec && mathSec.questions) ? mathSec.questions[activeMathQuestionNo - 1] : null;
        if (!rawQ) {
          rawQ = defaultQuestion("math");
          rawQ.question_no = activeMathQuestionNo;
          if (mathSec && Array.isArray(mathSec.questions)) {
            mathSec.questions[activeMathQuestionNo - 1] = rawQ;
          }
        }
        
        var targetQ = clone(rawQ) || defaultQuestion("math");
        targetQ.question_no = activeMathQuestionNo; // always correct the displayed number
        
        editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: targetQ };
        renderQuestionForm("math");
        renderMathWizardNav();
        setEditorRoleView("math", "teacher");
        
        var form = $("#math-question-form");
        if (form && typeof form.scrollIntoView === "function") form.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      window.selectMathWizardQuestion = selectMathWizardQuestion;

      function navigateMathWizard(dir) {
        var targetQNo = activeMathQuestionNo + dir;
        var isRandom = (exam && exam.exam_code === "TMA_RANDOM_001");
        var mathSecLimit = getSection("math");
        var maxQs = isRandom ? (mathSecLimit ? mathSecLimit.questions.length : 40) : 40;
        if (targetQNo >= 1 && targetQNo <= maxQs) {
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
        
        if (window.isEditingSingleQbQuestion) {
          // Dual save: sync both keys to prevent state mismatch and loss
          localStorage.setItem("tma_tsa_exam_" + exam.exam_code, JSON.stringify(exam));
          localStorage.setItem("tma_tsa_teacher_draft_" + exam.exam_code, JSON.stringify(exam));
          
          editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: clone(base) };
          
          // Trigger storage event to synchronize other tabs (like student view) immediately
          window.dispatchEvent(new Event("storage"));
          window.alert("Lưu thay đổi câu hỏi thành công!");
          return;
        }

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

      function isMockExamClearContext() {
        return normalizeCode(exam && exam.exam_code) === "TSA_EXAM_01";
      }

      function updateMockExamClearButtonsVisibility() {
        var isAllowed = isMockExamClearContext();
        ["math", "reading", "science"].forEach(function (sectionId) {
          var button = document.getElementById("clear-" + sectionId + "-questions-button");
          if (!button) return;
          button.hidden = !isAllowed;
          button.disabled = !isAllowed;
          button.style.display = isAllowed ? "inline-flex" : "none";
        });
      }

      async function clearAllSectionQuestions(sectionId) {
        if (!isMockExamClearContext()) {
          updateMockExamClearButtonsVisibility();
          await showCustomAlert("Nút Xóa toàn bộ chỉ được phép dùng cho đề TSA_EXAM_01 trong mục Thi thử.");
          return;
        }

        ensureSchema();
        var labels = { math: "Toán", reading: "Đọc hiểu", science: "Khoa học" };
        var label = labels[sectionId] || "phần thi";
        var targetSection = getSection(sectionId);
        if (!targetSection) return;

        function hasEnteredQuestionContent(question) {
          if (!question || typeof question !== "object") return false;
          if (String(question.question || question.content || "").trim()) return true;
          if (String(question.image_url || question.explanation || "").trim()) return true;
          if ((question.options || []).some(function (option) {
            return String((option && (option.text || option.image_url)) || "").trim();
          })) return true;
          if ((question.statements || []).some(function (statement) {
            return String((statement && statement.text) || "").trim();
          })) return true;
          if ((question.body || []).some(function (part) {
            return part && (part.type === "blank" || String(part.content || "").trim());
          })) return true;
          return (question.items || []).some(function (item) {
            return String((item && item.text) || "").trim();
          });
        }

        function createBlankQuestion(questionNo) {
          return {
            question_no: questionNo,
            question_type: "single_choice",
            question: "",
            image_url: "",
            options: [
              { key: "A", text: "" },
              { key: "B", text: "" },
              { key: "C", text: "" },
              { key: "D", text: "" }
            ],
            correct_answer: "",
            explanation: "",
            points: 1
          };
        }

        var questionCount = 0;
        if (sectionId === "math") {
          questionCount = (targetSection.questions || []).filter(hasEnteredQuestionContent).length;
        } else {
          (targetSection.groups || []).forEach(function (group) {
            questionCount += (group.questions || []).filter(hasEnteredQuestionContent).length;
          });
        }

        if (!questionCount) {
          await showCustomAlert("Phần " + label + " hiện chưa có câu hỏi để xóa.");
          return;
        }

        var keepStimulusNotice = sectionId === "math"
          ? ""
          : " Các ngữ liệu và đoạn văn vẫn được giữ nguyên.";
        var confirmed = await showCustomConfirm(
          "Xóa toàn bộ " + questionCount + " câu hỏi của phần " + label + "?" +
          keepStimulusNotice + " Hành động này không thể hoàn tác.",
          "Xóa toàn bộ câu hỏi"
        );
        if (!confirmed) return;

        try {
          localStorage.setItem("tma_tsa_before_clear_" + normalizeCode(exam.exam_code), JSON.stringify(exam));
        } catch (backupError) {
          console.warn("Không thể tạo bản sao trước khi xóa câu hỏi:", backupError);
        }

        if (sectionId === "math") {
          targetSection.questions = [];
          activeMathQuestionNo = 1;
        } else {
          targetSection.groups = [];
          activeGroupIds[sectionId] = "";
        }

        // Recreate the fixed TSA slots, then make every slot genuinely empty.
        // This keeps the 40-20-40 exam layout without retaining hidden answers.
        ensureSchema();
        targetSection = getSection(sectionId);
        if (sectionId === "math") {
          targetSection.questions = (targetSection.questions || []).map(function (question, index) {
            return createBlankQuestion(Number(question.question_no) || index + 1);
          });
        } else {
          (targetSection.groups || []).forEach(function (group) {
            group.questions = (group.questions || []).map(function (question, index) {
              return createBlankQuestion(Number(question.question_no) || index + 1);
            });
          });
        }

        editingQuestion[sectionId] = null;
        saveDraft();
        renderAll();
        await showCustomAlert("Đã xóa toàn bộ " + questionCount + " câu hỏi của phần " + label + "." + keepStimulusNotice);
      }
      window.clearAllSectionQuestions = clearAllSectionQuestions;

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
        updateMockExamClearButtonsVisibility();
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
              if (!activeMathQuestionNo || activeMathQuestionNo < 1) activeMathQuestionNo = 1;
              if (!editingQuestion["math"] || editingQuestion["math"].index !== activeMathQuestionNo - 1) {
                var mathQs = getSection("math").questions;
                var mathTarget = mathQs[activeMathQuestionNo - 1];
                editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: clone(mathTarget || defaultQuestion("math")) };
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

        if (sectionId === "reading" || sectionId === "science") {
          var sec = getSection(sectionId);
          var groups = sec ? (sec.groups || []) : [];
          var gId = activeGroupIds[sectionId];
          if (groups.length > 0 && (!gId || !groups.some(function(g) { return g.group_id === gId; }))) {
            gId = groups[0].group_id;
            activeGroupIds[sectionId] = gId;
          }
          var group = groups.find(function(g) { return g.group_id === gId; });
          var gIdx = groups.findIndex(function(g) { return g.group_id === gId; });
          if (gIdx === -1) gIdx = 0;
          var numberLabel = String(gIdx + 1);

          var startNo = 1;
          for (var i = 0; i < gIdx; i++) {
            startNo += (groups[i].questions || []).length;
          }
          var qCount = group ? (group.questions || []).length : 0;
          var rangeLabel = "Câu " + startNo + " - " + (startNo + Math.max(0, qCount - 1));
          
          var html = "";
          var displayLabel = sectionId === "reading" ? "Ngữ liệu " : "Dữ liệu ";
          html += '<tr><td colspan="4" style="background: #f8fafc; font-weight: 700; color: var(--brand); padding: 8px 12px; border-bottom: 1.5px solid var(--line);">' + displayLabel + numberLabel + ' (' + rangeLabel + ')</td></tr>';
          var gList = group ? (group.questions || []) : [];
          if (!gList.length) {
            html += '<tr><td colspan="4" class="empty">Chưa có câu hỏi nào cho ' + displayLabel + numberLabel + '.</td></tr>';
          } else {
            html += gList.map(function (q, index) {
              var label = (QUESTION_TYPES.find(function (t) { return t[0] === q.question_type; }) || ["", "Khác"])[1];
              var isActive = editingQuestion[sectionId]?.index === index;
              return '<tr class="' + (isActive ? 'table-row-active' : '') + '">' +
                '<td class="table-main" style="text-align:center;">' + q.question_no + '</td>' +
                '<td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(q.question || "Nội dung trống") + '</td>' +
                '<td><span class="status type">' + label + '</span></td>' +
                '<td><div class="actions">' +
                '<button class="btn btn-small btn-outline" onclick="window.editGroupQuestion(\'' + sectionId + '\', \'' + gId + '\', ' + index + ')">Sửa</button>' +
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



      function editGroupQuestion(sectionId, groupId, index) {
        ensureSchema();
        activeGroupIds[sectionId] = groupId;
        editQuestion(sectionId, index);
      }
      window.editGroupQuestion = editGroupQuestion;
      window.editReadingQuestion = editGroupQuestion; // legacy support

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
          var groups = readingSec.groups || [];
          var gId = activeGroupIds["reading"];
          if (groups.length > 0 && (!gId || !groups.some(function(g) { return g.group_id === gId; }))) {
            gId = groups[0].group_id;
            activeGroupIds["reading"] = gId;
          }
          var group = groups.find(function(g) { return g.group_id === gId; });
          if (!group) return;
          
          var gIdx = groups.findIndex(function(g) { return g.group_id === gId; });
          if (gIdx === -1) gIdx = 0;
          var numberLabel = String(gIdx + 1);

          var startQ = 1;
          for (var i = 0; i < gIdx; i++) {
            startQ += (groups[i].questions || []).length;
          }
          var qCount = (group.questions || []).length;
          var rangeLabel = "Câu " + startQ + " - " + (startQ + Math.max(0, qCount - 1));
          
          form.innerHTML = 
            '<div class="passage-group-card" style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; background: #fff;">' +
              '<h3 style="font-size: 14px; font-weight: 700; color: #c2272d; margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">' +
                '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#c2272d;"></span> Ngữ liệu ' + numberLabel + ' (' + rangeLabel + ')' +
              '</h3>' +
              '<div class="form-grid" style="gap: 18px 20px;">' +
                '<div class="field full"><label style="color:#c2272d; font-weight:750;">Tiêu đề ngữ liệu ' + numberLabel + '</label><input class="input" id="reading-' + gId + '-title" value="' + attr(group.title || "") + '" placeholder="Ví dụ: Ngữ liệu Đọc hiểu số 0' + numberLabel + '"></div>' +
                '<div class="field full" style="display:flex; flex-direction:column; gap:6px;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                  '<label style="margin-bottom:0; color:#c2272d; font-weight:750;">Nội dung văn bản / dữ liệu ' + numberLabel + '</label>' +
                  '<button type="button" class="btn btn-secondary btn-sm" style="height:26px; padding:0 8px; font-size:11px; border-radius:4px; font-weight:600;" onclick="insertCloudImageIntoGroupText(\'reading\', \'reading-' + gId + '-text\')">🖼️ Chèn ảnh từ Cloud</button>' +
                '</div>' +
                '<textarea class="textarea" id="reading-' + gId + '-text" style="min-height:240px;" placeholder="Nhập nội dung đoạn văn / ngữ liệu ' + numberLabel + ' vào đây...">' + esc(group.stimulus?.content || "") + '</textarea>' +
              '</div>' +
                '<div class="btn-row" style="margin-top: 8px;">' +
                  '<button class="btn btn-primary btn-small" type="button" onclick="saveReadingGroupDirect(\'' + gId + '\')" style="background-color: #c2272d; border-color: #c2272d; font-weight: 700; color: #fff; border-radius: 8px; padding: 6px 12px;">Lưu ngữ liệu ' + numberLabel + '</button>' +
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
          var groups = scienceSec.groups || [];
          var gId = activeGroupIds["science"];
          if (groups.length > 0 && (!gId || !groups.some(function(g) { return g.group_id === gId; }))) {
            gId = groups[0].group_id;
            activeGroupIds["science"] = gId;
          }
          var group = groups.find(function(g) { return g.group_id === gId; });
          if (!group) return;
          
          var gIdx = groups.findIndex(function(g) { return g.group_id === gId; });
          if (gIdx === -1) gIdx = 0;
          var numberLabel = String(gIdx + 1);

          var startQ = 1;
          for (var i = 0; i < gIdx; i++) {
            startQ += (groups[i].questions || []).length;
          }
          var qCount = (group.questions || []).length;
          var rangeLabel = "Câu " + startQ + " - " + (startQ + Math.max(0, qCount - 1));
          
          var groupImgWidth = group.stimulus?.image_width || 100;
          
          form.innerHTML = 
            '<div class="passage-group-card" style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; background: #fff;">' +
              '<h3 style="font-size: 14px; font-weight: 700; color: #c2272d; margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">' +
                '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#c2272d;"></span> Ngữ liệu ' + numberLabel + ' (' + rangeLabel + ')' +
              '</h3>' +
              '<div class="form-grid" style="gap: 18px 20px;">' +
                '<div class="field full"><label style="color:#c2272d; font-weight:750;">Tiêu đề ngữ liệu ' + numberLabel + '</label><input class="input" id="science-' + gId + '-title" value="' + attr(group.title || "") + '" placeholder="Ví dụ: Ngữ liệu Khoa học số 0' + numberLabel + '"></div>' +
                '<div class="field full" style="display:flex; flex-direction:column; gap:6px;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                  '<label style="margin-bottom:0; color:#c2272d; font-weight:750;">Nội dung văn bản / dữ liệu ' + numberLabel + '</label>' +
                  '<button type="button" class="btn btn-secondary btn-sm" style="height:26px; padding:0 8px; font-size:11px; border-radius:4px; font-weight:600;" onclick="insertCloudImageIntoGroupText(\'science\', \'science-' + gId + '-text\')">🖼️ Chèn ảnh từ Cloud</button>' +
                '</div>' +
                '<textarea class="textarea" id="science-' + gId + '-text" style="min-height:240px;" placeholder="Nhập nội dung dữ liệu khoa học ' + numberLabel + ' vào đây...">' + esc(group.stimulus?.content || "") + '</textarea>' +
              '</div>' +
                '<div class="field full" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 0;">' +
                  '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label style="color:#c2272d; font-weight:750;">Kích thước ảnh ngữ liệu ' + numberLabel + ': <span id="science-' + gId + '-image-width-val" style="font-weight:700; color:#c2272d;">' + groupImgWidth + '</span>%</label>' +
                    '<input type="range" class="slider" id="science-' + gId + '-image-width" min="10" max="100" value="' + groupImgWidth + '" style="width: 100%; display: block; height: 28px; margin: 0; padding: 0; cursor: pointer;">' +
                  '</div>' +
                  '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label style="color:#c2272d; font-weight:750;">Đường dẫn ảnh ngữ liệu ' + numberLabel + ' nếu có</label><input class="input" id="science-' + gId + '-image" value="' + attr(group.stimulus?.image_url || "") + '" placeholder="https://assets.tmastudy.io.vn/assets/questions/' + attr(exam.exam_code) + '/ngu-lieu-01.webp"></div>' +
                '</div>' +
                '<div class="btn-row" style="margin-top: 8px;">' +
                  '<button class="btn btn-primary btn-small" type="button" onclick="saveScienceGroupDirect(\'' + gId + '\')" style="background-color: #c2272d; border-color: #c2272d; font-weight: 700; color: #fff; border-radius: 8px; padding: 6px 12px;">Lưu ngữ liệu ' + numberLabel + '</button>' +
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
        var readingSec = getSection("reading");
        var groups = readingSec.groups || [];
        var gIdx = groups.findIndex(function(g) { return g.group_id === gId; });
        var numLabel = gIdx !== -1 ? (gIdx + 1) : 1;
        window.alert("Đã lưu nội dung ngữ liệu " + numLabel + " thành công!");
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
        ensureSchema();
        var readingSec = getSection("reading");
        var groups = readingSec.groups || [];
        var activeId = activeGroupIds["reading"];
        if (groups.length > 0 && (!activeId || !groups.some(function(g) { return g.group_id === activeId; }))) {
          activeId = groups[0].group_id;
          activeGroupIds["reading"] = activeId;
        }

        var container = document.getElementById("reading-tabs-container");
        if (container) {
          container.innerHTML = groups.map(function(g, idx) {
            var label = g.title || ("Ngữ liệu " + (idx + 1));
            var labelShow = label.length > 20 ? label.substring(0, 20) + "..." : label;
            var activeClass = g.group_id === activeId ? "active" : "";
            return '<button class="reading-tab-btn ' + activeClass + '" id="reading-tab-btn-' + g.group_id + '" type="button" onclick="switchReadingGroupTab(\'' + g.group_id + '\')" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700; font-family: inherit;">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open" style="margin-right:2px;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
              esc(labelShow) +
            '</button>';
          }).join("");
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
        ensureSchema();
        var sec = getSection(sectionId);
        var groups = sec.groups || [];
        var gId = activeGroupIds[sectionId];
        if (groups.length > 0 && (!gId || !groups.some(function(g) { return g.group_id === gId; }))) {
          gId = groups[0].group_id;
        }
        var gIdx = groups.findIndex(function(g) { return g.group_id === gId; });
        if (gIdx === -1) gIdx = 0;

        var startNo = 1;
        for (var i = 0; i < gIdx; i++) {
          startNo += (groups[i].questions || []).length;
        }

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
        ensureSchema();
        var scienceSec = getSection("science");
        var groups = scienceSec.groups || [];
        var activeId = activeGroupIds["science"];
        if (groups.length > 0 && (!activeId || !groups.some(function(g) { return g.group_id === activeId; }))) {
          activeId = groups[0].group_id;
          activeGroupIds["science"] = activeId;
        }

        var container = document.getElementById("science-tabs-container");
        if (container) {
          container.innerHTML = groups.map(function(g, idx) {
            var label = g.title || ("Ngữ liệu " + (idx + 1));
            var labelShow = label.length > 20 ? label.substring(0, 20) + "..." : label;
            var activeClass = g.group_id === activeId ? "active" : "";
            return '<button class="science-tab-btn ' + activeClass + '" id="science-tab-btn-' + g.group_id + '" type="button" onclick="switchScienceGroupTab(\'' + g.group_id + '\')" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700; font-family: inherit;">' +
              esc(labelShow) +
            '</button>';
          }).join("");
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
        var groups = scienceSec.groups || [];
        var gIdx = groups.findIndex(function(g) { return g.group_id === gId; });
        var numLabel = gIdx !== -1 ? (gIdx + 1) : 1;
        window.alert("Đã lưu nội dung ngữ liệu " + numLabel + " thành công!");
      }
      window.saveScienceGroupDirect = saveScienceGroupDirect;

      function renderSubjectWizardNav(sectionId) {
        var grid = $("#" + sectionId + "-wizard-grid");
        if (!grid) return;
        grid.innerHTML = "";
        
        ensureSchema();
        var sec = getSection(sectionId);
        var groups = sec.groups || [];
        var gId = activeGroupIds[sectionId];
        if (groups.length > 0 && (!gId || !groups.some(function(g) { return g.group_id === gId; }))) {
          gId = groups[0].group_id;
          activeGroupIds[sectionId] = gId;
        }
        var group = groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        
        var questions = group.questions || [];
        var numQuestions = Math.max(sectionId === "reading" ? 10 : 5, questions.length);
        
        var gIdx = groups.findIndex(function(g) { return g.group_id === gId; });
        if (gIdx === -1) gIdx = 0;
        
        var startNo = 1;
        for (var i = 0; i < gIdx; i++) {
          startNo += (groups[i].questions || []).length;
        }
        
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
        var groups = sec.groups || [];
        var gId = activeGroupIds[sectionId];
        if (groups.length > 0 && (!gId || !groups.some(function(g) { return g.group_id === gId; }))) {
          gId = groups[0].group_id;
          activeGroupIds[sectionId] = gId;
        }
        var group = groups.find(function(g) { return g.group_id === gId; });
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
        var livePane = document.getElementById(sectionId + "-pane-preview");
        var bodyEl = livePane ? livePane.querySelector("#" + sectionId + "-preview-body") : $("#" + sectionId + "-preview-body");
        var ansEl = livePane ? livePane.querySelector("#" + sectionId + "-preview-answer") : $("#" + sectionId + "-preview-answer");
        var stimEl = $("#" + sectionId + "-preview-stimulus");

        if (!bodyEl) return;
        bodyEl.innerHTML = "";
        if (ansEl) ansEl.innerHTML = "";
        if (stimEl) stimEl.innerHTML = "";

        var qNo = getActiveQuestionNo(sectionId);
        var qnoCircle = (livePane ? livePane.querySelector("#" + sectionId + "-preview-qno-circle") : null) || document.getElementById(sectionId + "-preview-qno-circle");
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
          window.renderQuestion(q, null, function () {}, { bodyEl: bodyEl, answerEl: ansEl, showSolution: true });
        } else {
          bodyEl.textContent = q.question;
        }
        if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
          window.MathJax.typesetPromise([bodyEl, ansEl]).catch(function() {});
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
            if (exam.exam_code.includes("_FULL_") || exam.exam_code.startsWith("TSA_EXAM_") || exam.exam_code.startsWith("TMA")) return "tong-hop";
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

        if (window.TMAR2) {
          try {
            await window.TMAR2.putJson('data/exams/index.json', indexList);
          } catch (err) {
            console.warn("Failed to sync index.json to R2:", err);
          }
        }

        if (window.TMAMockAdmin && /(_EXAM_|_MOCK$)/i.test(examCode)) {
          try {
            await window.TMAMockAdmin.upsertExam({
              examCode: examCode,
              title: examMeta && examMeta.title ? examMeta.title : examCode,
              category: String(examCode).split("_")[0],
              isOpen: open === true
            });
          } catch (err) {
            console.warn("Failed to sync mock exam state to D1:", err);
          }
        }

        if (examCode.startsWith("TSA_PRACTICE_") || examCode.startsWith("TSA_PRACTICE_FULL_")) {
          renderPracticeRoom();
        } else {
          renderExamsList();
        }
        if (typeof refreshSetupTabStatus === "function") {
          refreshSetupTabStatus();
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
            console.warn("Lỗi fetch từ R2:", e);
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

        // 4. Save answers to Database and publish the file to Cloudflare R2.
        if (!supabaseClient || !window.TMAR2) {
          window.alert("Đã sao lưu nháp offline dưới mã đề " + newExamCode + ".\nLưu ý: Chưa sẵn sàng kết nối Database hoặc Cloudflare R2 để đồng bộ tự động.");
          renderExamsList();
          renderPracticeRoom();
          return;
        }

        var btn = $("#upload-r2-button");
        var originalText = btn ? btn.textContent : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Đang lưu lên Cloud...";
        }

        try {
          // Keep small answer rows in Database; publish the larger exam JSON on R2.
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

          var publicClonedExam = window.TMAExamSecurity.createPublicExamCopy(clonedExam);
          await window.TMAR2.putJson('data/exams/' + newExamCode + '.json', publicClonedExam);

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

          await window.TMAR2.putJson('data/exams/index.json', indexList);

          // Đồng bộ lại local index
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          window.alert("✓ Đã chuyển Đề thi thử TSA thành công sang Phòng luyện dưới dạng:\n\"" + newExamTitle + "\" (" + newExamCode + ")");
          
          // Re-render UI
          renderExamsList();
          renderPracticeRoom();
          if (typeof refreshSetupTabStatus === "function") {
            refreshSetupTabStatus();
          }
        } catch (err) {
          console.error(err);
          window.alert("Lỗi khi tải dữ liệu lên Cloud:\n" + (err.message || err));
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
          }
        }
      }
      window.archiveMockToPractice = archiveMockToPractice;

      async function saveToR2Cloud() {
        if (!window.TMAR2) {
          window.alert("Cloudflare R2 chưa sẵn sàng.");
          return;
        }

        var btn = $("#upload-r2-button");
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Đang lưu lên Cloud...";

        try {
          // Keep small answer rows in Database; publish the larger exam JSON on R2.
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
                      tolerance: q.tolerance,
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
                          tolerance: q.tolerance,
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

          var isManagedMock = /(_EXAM_|_MOCK$)/i.test(newExamCode);
          if (answersToInsert.length > 0 && window.TMAMockAdmin) {
            var currentIndex = getIndexListWithCurrent();
            var currentMeta = currentIndex.find(function(item) { return item.exam_code === newExamCode; });
            await window.TMAMockAdmin.upsertExam({
              examCode: newExamCode,
              title: examCopy.title,
              category: ((String(newExamCode).match(/^(TSA|HSA|VACT|QDA|THPT)/i) || [])[1] || "TSA").toUpperCase(),
              isOpen: Boolean(currentMeta && currentMeta.is_open)
            });
            await window.TMAMockAdmin.saveAnswerKeys(newExamCode, answersToInsert.map(function(row) {
              var correctAnswer = row.correct_answer;
              var acceptedAnswers = row.accepted_answers;
              try { correctAnswer = JSON.parse(correctAnswer); } catch (error) {}
              try { acceptedAnswers = acceptedAnswers ? JSON.parse(acceptedAnswers) : null; } catch (error) {}
              return {
                subject: row.subject,
                questionNo: row.question_no,
                questionType: row.question_type,
                correctAnswer: correctAnswer,
                acceptedAnswers: acceptedAnswers,
                tolerance: row.tolerance,
                points: row.points
              };
            }));
          }
          if (answersToInsert.length > 0 && !isManagedMock && supabaseClient) {
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

          examCopy = window.TMAExamSecurity.createPublicExamCopy(examCopy);

          // 1. Publish exam JSON to R2.
          var examFileName = examCopy.exam_code + ".json";
          await window.TMAR2.putJson('data/exams/' + examFileName, examCopy);

          // 2. Publish the R2 index.
          var indexList = getIndexListWithCurrent();
          await window.TMAR2.putJson('data/exams/index.json', indexList);

          // Lưu index vào localStorage của giáo viên luôn để đồng bộ giao diện quản trị
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          window.alert("✓ Đã tải đề thi lên Cloudflare R2 thành công!\nĐề thi hiện đã sẵn sàng phục vụ học sinh.");
        } catch (error) {
          console.error(error);
          window.alert("Lỗi khi tải đề lên R2:\n" + (error.message || error));
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
        
        // Reset editing states to prevent collisions from previous sessions
        editingQuestion = { math: null, reading: null, science: null };
        activeMathQuestionNo = 1;
        
        if (!window.isEditingSingleQbQuestion) {
          window.isEditingSingleQbQuestion = false;
          if (typeof window.toggleSingleQuestionEditMode === "function") {
            window.toggleSingleQuestionEditMode(false);
          }
        }
        
        // Track the current editing subject based on active subtab in lobby
        if (startTab) {
          window.currentEditingSubject = startTab;
        } else {
          window.currentEditingSubject = typeof currentTsaPracticeSubtab !== 'undefined' ? currentTsaPracticeSubtab : "tong-hop";
        }
        
        // Dynamically adjust sidebar buttons and AI dropdown
        adjustSidebarButtons(window.currentEditingSubject);
        adjustAiImportDropdown(window.currentEditingSubject);

        var existing = loadDraft(cleanCode);
        if (!existing) {
          try {
            var rawExam = localStorage.getItem("tma_tsa_exam_" + cleanCode);
            if (rawExam) {
              existing = JSON.parse(rawExam);
            }
          } catch(e) {}
        }
        
        if (existing && typeof existing === "object") {
          exam = existing;
          ensureSchema();
        } else {
          exam = createEmptyExam(cleanCode, title, 45, "published");
        }

        // Enter Editing Mode
        var shell = document.querySelector(".teacher-shell");
        if (shell) {
          if (window.isEditingSingleQbQuestion) {
            shell.classList.add("hide-sidebar");
          } else {
            shell.classList.remove("hide-sidebar");
          }
        }
        
        var dash = document.getElementById("dashboard-container");
        if (dash) dash.style.display = "none";
        
        var normNav = document.getElementById("sidebar-normal-nav");
        if (normNav) normNav.style.display = "none";

        var editCont = document.getElementById("editor-container");
        if (editCont) editCont.style.display = "block";
        
        var editNav = document.getElementById("sidebar-editor-nav");
        if (editNav) editNav.style.display = window.isEditingSingleQbQuestion ? "none" : "flex";

        var subTitle = document.getElementById("editor-subtitle");
        if (subTitle) subTitle.textContent = `Đang chỉnh sửa: ${title} (${cleanCode})`;

        syncMetadataToForm();
        saveDraft();

        // Set initial value for direct browser API key input if present
        try {
          var localKey = localStorage.getItem("tma_gemini_api_key") || "";
          var keyInput = document.getElementById("browser-api-key");
          if (keyInput) keyInput.value = localKey;
        } catch (e) {}

        var defaultStartTab = "setup";
        if (window.currentEditingSubject === "math") defaultStartTab = "math";
        else if (window.currentEditingSubject === "reading") defaultStartTab = "reading";
        else if (window.currentEditingSubject === "science") defaultStartTab = "science";

        switchEditorTab(startTab || defaultStartTab);
        if (typeof refreshSetupTabStatus === "function") {
          refreshSetupTabStatus();
        }
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

          // Prefer the last locally published copy over the editable draft.
          // This gives teachers a recovery path after an accidental draft edit.
          try {
            var publishedLocalRaw = localStorage.getItem("tma_tsa_exam_" + cleanCode);
            if (publishedLocalRaw) {
              var publishedLocalExam = JSON.parse(publishedLocalRaw);
              if (publishedLocalExam && Array.isArray(publishedLocalExam.sections)) {
                fetchedData = publishedLocalExam;
                fetched = true;
                console.log("Recovered exam from the locally published copy:", cleanCode);
              }
            }
          } catch (localRecoveryError) {
            console.warn("Không thể đọc bản đề đã xuất bản trong máy:", localRecoveryError);
          }
          
          // 0a. If running via file:// protocol, prioritize pre-embedded fallback data
          if (!fetched && window.location.protocol === "file:" && window.TSA001_FALLBACK_DATA && (cleanCode === "TSA001" || cleanCode === "TSA_EXAM_01")) {
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

          // 1. Load the published exam from Cloudflare R2.
          if (!fetched) {
            var r2ExamsUrl = window.TMA_STORAGE_CONFIG.examsBaseUrl;
            var possibleUrls = [
              r2ExamsUrl + cleanCode + ".json",
              r2ExamsUrl + cleanCode.toLowerCase() + ".json"
            ];
            
            // Cross-check fallback codes
            if (cleanCode === "TSA001") {
              possibleUrls.push(r2ExamsUrl + "TSA_EXAM_01.json");
            } else if (cleanCode === "TSA_EXAM_01") {
              possibleUrls.push(r2ExamsUrl + "TSA001.json");
            }
            
            for (var url of possibleUrls) {
              try {
                var response = await fetch(url, { cache: "default" });
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
          
          // 2. Last resort offline fallback for TSA001 / TSA_EXAM_01.
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
        window.isEditingSingleQbQuestion = false;
        window.isEditingStagedQuestion = false;
        if (typeof window.toggleSingleQuestionEditMode === "function") {
          window.toggleSingleQuestionEditMode(false);
        }
        document.getElementById("editor-container").style.display = "none";
        document.getElementById("sidebar-editor-nav").style.display = "none";

        document.getElementById("dashboard-container").style.display = "block";
        document.getElementById("sidebar-normal-nav").style.display = "block";

        if (typeof switchSystemTab === "function") {
          switchSystemTab("practice");
        }

        // Refresh views
        renderPracticeRoom();
        renderExamsList();
      }
      window.exitEditingMode = exitEditingMode;

      // Expose to window object so clicking edit buttons work
      function refreshSetupTabStatus() {
        if (!exam || !exam.code) return;
        var cleanCode = normalizeCode(exam.code);
        
        var indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(indexList)) indexList = [];

        let openStatus = {};
        try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}

        var inList = indexList.find(e => normalizeCode(e.exam_code) === normalizeCode(cleanCode));
        var hasExam = !!inList;
        var isOpen = inList && (inList.is_open === true || openStatus[cleanCode] === true);

        var statusBadge = document.getElementById("setup-exam-status-badge");
        if (statusBadge) {
          statusBadge.className = hasExam ? "badge-green" : "badge-red";
          statusBadge.textContent = hasExam ? "ĐÃ CÓ ĐỀ" : "CHƯA CÓ ĐỀ";
        }

        var roomBadge = document.getElementById("setup-exam-room-badge");
        if (roomBadge) {
          roomBadge.className = isOpen ? "badge-green" : "badge-red";
          roomBadge.textContent = isOpen ? "Đang mở đề" : "Đang đóng đề";
          roomBadge.style.background = isOpen ? "" : "#94a3b8";
          roomBadge.style.color = isOpen ? "" : "#ffffff";
        }

        var toggleBtn = document.getElementById("setup-toggle-open-btn");
        if (toggleBtn) {
          toggleBtn.style.background = isOpen ? "#ef4444" : "#16a34a";
          toggleBtn.innerHTML = isOpen ? "🔒 Đóng đề thi" : "🔓 Mở đề thi";
          toggleBtn.disabled = !hasExam;
          toggleBtn.style.opacity = hasExam ? "1" : "0.6";
          toggleBtn.style.cursor = hasExam ? "pointer" : "not-allowed";
        }

        var practiceBtn = document.getElementById("setup-practice-btn");
        if (practiceBtn) {
          practiceBtn.disabled = !hasExam;
          practiceBtn.style.opacity = hasExam ? "1" : "0.6";
          practiceBtn.style.cursor = hasExam ? "pointer" : "not-allowed";
        }
      }

      function setupTabToggleOpen() {
        if (!exam || !exam.code) return;
        var cleanCode = normalizeCode(exam.code);
        
        var indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(indexList)) indexList = [];

        let openStatus = {};
        try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}

        var inList = indexList.find(e => normalizeCode(e.exam_code) === normalizeCode(cleanCode));
        var isOpen = inList && (inList.is_open === true || openStatus[cleanCode] === true);
        
        toggleExamOpen(exam.code, !isOpen);
      }

      function setupTabArchiveToPractice() {
        archiveMockToPractice();
      }

      function setupTabDeleteExam() {
        if (!exam || !exam.code) return;
        deleteExamPermanently(exam.code, exam.title);
      }

      window.refreshSetupTabStatus = refreshSetupTabStatus;
      window.setupTabToggleOpen = setupTabToggleOpen;
      window.setupTabArchiveToPractice = setupTabArchiveToPractice;
      window.setupTabDeleteExam = setupTabDeleteExam;

      window.startEditingExam = startEditingExam;
      window.exitEditingMode = exitEditingMode;
      window.createEmptyExam = createEmptyExam;

      async function deleteExamPermanently(examCode, examTitle) {
        var cleanCode = normalizeCode(examCode);
        if (!window.confirm(`⚠️ XÁC NHẬN XÓA ĐỀ THI\n\nBạn có chắc chắn muốn xóa đề thi:\n"${examTitle}" (${cleanCode}) không?\n\nHành động này không thể khôi phục!`)) {
          return;
        }

        var indexList = [];
        try {
          var rawIdx = localStorage.getItem("tma_tsa_exam_index");
          if (rawIdx) indexList = JSON.parse(rawIdx) || [];
        } catch(e) {}
        
        indexList = indexList.filter(e => normalizeCode(e.exam_code) !== cleanCode);
        localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));
        localStorage.removeItem("tma_tsa_exam_" + cleanCode);
        localStorage.removeItem("tma_tsa_teacher_draft_" + cleanCode);
        localStorage.removeItem("tma_tsa_draft_" + cleanCode);

        var deletedExams = [];
        try {
          deletedExams = JSON.parse(localStorage.getItem("tma_tsa_deleted_exams") || "[]");
        } catch(e) {}
        if (!deletedExams.includes(cleanCode)) {
          deletedExams.push(cleanCode);
          localStorage.setItem("tma_tsa_deleted_exams", JSON.stringify(deletedExams));
        }

        renderPracticeRoom();
        renderExamsList();

        if (cleanCode === normalizeCode(exam ? exam.code : "")) {
          exitEditingMode();
        } else if (typeof refreshSetupTabStatus === "function") {
          refreshSetupTabStatus();
        }

        if (window.TMAR2) {
          try {
            await window.TMAR2.remove('data/exams/' + cleanCode + '.json');
            await window.TMAR2.putJson('data/exams/index.json', indexList);
          } catch(err) {
            console.warn("Background R2 deletion warning:", err);
          }
        }

        if (window.supabaseClient) {
          try {
            await supabaseClient.from('exam_answers').delete().eq('exam_code', cleanCode);
            await supabaseClient.from('exam_results').delete().eq('exam_code', cleanCode);
          } catch(err) {
            console.warn("Background database deletion warning:", err);
          }
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
          saveMetaBtn.addEventListener("click", async function () {
            var originalText = saveMetaBtn.textContent;
            saveMetaBtn.disabled = true;
            saveMetaBtn.textContent = "⌛ Đang lưu...";
            
            try {
              syncMetadataFromForm(true);
              saveDraft();
              renderAll();
              
              await syncMetadataToCloud();
              window.alert("✓ Đã lưu thông tin cấu hình đề thi lên Cloud thành công!");
            } catch(e) {
              console.error(e);
              window.alert("Lỗi khi lưu thông tin: " + (e.message || e));
            } finally {
              saveMetaBtn.disabled = false;
              saveMetaBtn.textContent = originalText;
            }
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
                    window.alert("✓ Đã nhập đề thi từ file JSON thành công! Hãy kiểm tra lại các câu hỏi và nhấn 'Lưu lên Cloudflare R2' để lưu đề.");
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
                      window.alert(`✓ Nhập phần ${label} thành công! Hãy kiểm tra và nhấn 'Lưu lên Cloudflare R2' để đồng bộ.`);
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

      window.cleanTmaQuestionData = function(question) {
        if (!question || typeof question !== "object") return;
        if (question.hasOwnProperty("question_no")) {
          question.question_no = Number(question.question_no);
        }
        // Parse string correct_answer to object for true_false and drag_drop
        if (question.question_type === "true_false" && typeof question.correct_answer === "string") {
          var tfAns = {};
          question.correct_answer.split("|").forEach(function(pair) {
            var parts = pair.split("=");
            if (parts.length === 2) {
              var stId = parts[0].trim().toLowerCase();
              var val = parts[1].trim().toLowerCase();
              tfAns[stId] = (val === "t" || val === "true" || val === "đúng" || val === "dung");
            }
          });
          question.correct_answer = tfAns;
        }
        if (question.question_type === "drag_drop" && typeof question.correct_answer === "string") {
          var ddAns = {};
          var rawAns = question.correct_answer.trim();
          var separator = rawAns.includes("|") ? "|" : (rawAns.includes(";") ? ";" : ",");
          var pairs = rawAns.split(separator);
          pairs.forEach(function(pair, idx) {
            pair = pair.trim();
            if (!pair) return;
            var eqSign = pair.includes("=") ? "=" : (pair.includes(":") ? ":" : null);
            if (eqSign) {
              var parts = pair.split(eqSign);
              if (parts.length === 2) {
                ddAns[parts[0].trim()] = parts[1].trim();
              }
            } else {
              ddAns["o" + (idx + 1)] = pair;
            }
          });
          question.correct_answer = ddAns;
        }
        if (question.question_type === "fill_blank" && typeof question.correct_answer === "string") {
          var fbAns = {};
          var rawAns = question.correct_answer.trim();
          var isMulti = /\[(o\d+|blank)\]/.test(question.question || question.prompt || "");
          if (isMulti || rawAns.includes("=") || rawAns.includes(":")) {
            var separator = rawAns.includes("|") ? "|" : (rawAns.includes(";") ? ";" : ",");
            var pairs = rawAns.split(separator);
            pairs.forEach(function(pair, idx) {
              pair = pair.trim();
              if (!pair) return;
              var eqSign = pair.includes("=") ? "=" : (pair.includes(":") ? ":" : null);
              if (eqSign) {
                var parts = pair.split(eqSign);
                if (parts.length === 2) {
                  fbAns[parts[0].trim()] = parts[1].trim();
                }
              } else {
                fbAns["o" + (idx + 1)] = pair;
              }
            });
            question.correct_answer = fbAns;
          }
        }
        if (typeof question.question === "string") {
          question.question = question.question.replace(/\\n/g, "\n");
          question.question = question.question.replace(/\\vec{/g, "\\overrightarrow{");
          question.question = question.question.replace(/^[ \t]*\d+[\)\.]\s*/gm, "- ");
        }
        if (typeof question.prompt === "string") {
          question.prompt = question.prompt.replace(/\\n/g, "\n");
          question.prompt = question.prompt.replace(/\\vec{/g, "\\overrightarrow{");
          question.prompt = question.prompt.replace(/^[ \t]*\d+[\)\.]\s*/gm, "- ");
        }
        if (Array.isArray(question.options)) {
          question.options.forEach(function (opt) {
            if (opt.text && typeof opt.text === "string") {
              opt.text = opt.text.replace(/\\n/g, "\n").trim();
              if (/^\d+\/\d+$/.test(opt.text)) {
                opt.text = opt.text.replace(/^(\d+)\/(\d+)$/, "\\(\\dfrac{$1}{$2}\\)");
              }
              opt.text = opt.text.replace(/\\vec{/g, "\\overrightarrow{");
              if ((opt.text.includes("\\") || opt.text.includes("^") || opt.text.includes("_") || opt.text.includes("{") || opt.text.includes("}")) && !opt.text.includes("\\(")) {
                opt.text = "\\(" + opt.text + "\\)";
              }
            }
          });
        }
        if (Array.isArray(question.items)) {
          question.items.forEach(function (item) {
            if (item.text && typeof item.text === "string") {
              item.text = item.text.replace(/\\n/g, "\n").trim();
              if (/^\d+\/\d+$/.test(item.text)) {
                item.text = item.text.replace(/^(\d+)\/(\d+)$/, "\\(\\dfrac{$1}{$2}\\)");
              }
              item.text = item.text.replace(/\\vec{/g, "\\overrightarrow{");
              if ((item.text.includes("\\") || item.text.includes("^") || item.text.includes("_") || item.text.includes("{") || item.text.includes("}")) && !item.text.includes("\\(")) {
                item.text = "\\(" + item.text + "\\)";
              }
            }
          });
        }
        if (Array.isArray(question.body)) {
          question.body.forEach(function (part) {
            if (part.content && typeof part.content === "string") {
              part.content = part.content.replace(/\\n/g, "\n");
              part.content = part.content.replace(/\\vec{/g, "\\overrightarrow{");
              part.content = part.content.replace(/^[ \t]*\d+[\)\.]\s*/gm, "- ");
            }
          });
        }
        if (Array.isArray(question.statements)) {
          question.statements.forEach(function (st) {
            if (st.text && typeof st.text === "string") {
              st.text = st.text.replace(/\\n/g, "\n").trim();
              st.text = st.text.replace(/\\vec{/g, "\\overrightarrow{");
              if ((st.text.includes("\\") || st.text.includes("^") || st.text.includes("_") || st.text.includes("{") || st.text.includes("}")) && !st.text.includes("\\(")) {
                st.text = "\\(" + st.text + "\\)";
              }
            }
          });
        }
      };

        function sanitizeAiImportedQuestions(importedExam) {
          if (!importedExam || !Array.isArray(importedExam.sections)) return importedExam;

          function cleanQuestion(question) {
            if (!question || typeof question !== "object") return;
            if (typeof window.cleanTmaQuestionData === "function") {
              window.cleanTmaQuestionData(question);
            }
            // Bảo toàn lời giải chi tiết
            if (!question.explanation) {
              question.explanation = question.solution_details || question.solution_detail || question.solution || question.answer_explanation || "";
            }
            delete question.solution;
            delete question.solution_detail;
            delete question.solution_details;
            delete question.answer_explanation;
            delete question.reasoning;
          }

          importedExam.sections.forEach(function (section) {
            (section.questions || []).forEach(cleanQuestion);
            (section.groups || []).forEach(function (group) {
              (group.questions || []).forEach(cleanQuestion);
            });
          });
          return importedExam;
        }

        var aiRunBtn = $("#ai-run-button");
        if (aiRunBtn) {
          aiRunBtn.addEventListener("click", async function () {
            var examTextInput = $("#ai-exam-text");
            var importSectionSelect = $("#ai-import-section");
            if (!examTextInput) return;

            var rawText = examTextInput.value.trim();
            var selectedSection = importSectionSelect ? importSectionSelect.value : "math";

            if (!rawText) {
              window.alert("Vui lòng dán nội dung đề thi vào ô văn bản!");
              examTextInput.focus();
              return;
            }

            var originalHtml = aiRunBtn.innerHTML;
            aiRunBtn.disabled = true;
            aiRunBtn.innerHTML = "<span>AI đang tách và nhập câu hỏi...</span>";

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
  "correct_answer": "", // Chỉ chép phím đáp án khi nguồn ghi rõ
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
  "correct_answer": [], // Chỉ chép các đáp án khi nguồn ghi rõ
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
  "correct_answer": "a=T | b=F", // Chỉ ghi Đúng (T) hoặc Sai (F) của các ý dạng chuỗi: "a=T | b=F" hoặc "a=Đúng | b=Sai"
  "points": 1
}

4. Câu hỏi kéo thả (drag_drop):
Chỉ dùng dạng này khi đề bài cung cấp sẵn danh sách/hộp các từ lựa chọn để học sinh kéo thả vào ô trống. BẮT BUỘC phải phân tách phần văn bản/bảng biểu thành mảng "body" gồm các phần tử "text" và các phần tử "blank" (id là "o1", "o2"...). Các từ khóa hoặc số đáp án để kéo thả phải được đưa vào mảng "items" với id là "i1", "i2"... và "correct_answer" dạng "o1=i1 | o2=i2". Bạn BẮT BUỘC phải loại bỏ hoàn toàn bảng hoặc danh sách từ lựa chọn kéo thả khỏi trường "question".
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
  "items": [
    { "id": "i1", "text": "đáp án đúng 1" },
    { "id": "i2", "text": "đáp án đúng 2" }
  ],
  "correct_answer": "o1=i1 | o2=i2",
  "points": 1
}

5. Câu hỏi điền khuyết / điền chữ tự do (fill_blank):
Dùng dạng này khi đề bài yêu cầu điền từ/cụm từ hoặc số tự do vào ô trống trong câu (học sinh tự gõ chữ, KHÔNG có thẻ từ để kéo thả). Trường "question" sẽ chứa chuỗi câu hỏi có các ô trống ký hiệu là [o1], [o2]... và trường "correct_answer" sẽ là dạng chuỗi ghép: "o1=đáp_án_1 | o2=đáp_án_2" hoặc dạng chuỗi đáp án đơn "đáp_án" nếu chỉ có 1 ô trống.
{
  "question_no": 5,
  "question_type": "fill_blank",
  "question": "Khi kể lại câu chuyện, Thanh tự nhận thấy hành động mình đã làm rất [o1] và trả phu xe [o2] xu.",
  "image_url": "",
  "correct_answer": "o1=nhỏ nhen | o2=bốn",
  "points": 1
}

5. Điền số (numeric_answer):
{
  "question_no": 5,
  "question_type": "numeric_answer",
  "question": "Nội dung câu hỏi...",
  "image_url": "",
  "correct_answer": null, // Chỉ chép giá trị khi nguồn ghi rõ
  "tolerance": 0,
  "points": 1
}

YÊU CẦU QUAN TRỌNG:
- CHỈ NHẬP CÂU HỎI: Chỉ chép và chuẩn hóa ngữ liệu, nội dung câu hỏi, phương án lựa chọn và đáp án chấm đã có sẵn trong văn bản nguồn.
- TUYỆT ĐỐI KHÔNG GIẢI BÀI, không tạo lời giải và không trả về các trường "explanation", "solution", "solution_detail" hoặc "solution_details".
- Chỉ điền "correct_answer" khi văn bản nguồn ghi rõ đáp án. Nếu nguồn không có đáp án, để trống đúng kiểu dữ liệu; không tự suy luận hoặc giải để tìm đáp án.
- Trả về cấu trúc JSON hợp lệ hoàn toàn dựa theo cấu trúc trên.
- Sử dụng chuẩn toán học LaTeX với ký hiệu \\( ... \\) cho công thức nội dòng (inline) và \\[ ... \\] cho công thức khối (display math). Ví dụ: \\(f(x) = x^2\\). Hãy chắc chắn escape đúng các ký tự chéo ngược \\ thành \\\\ trong chuỗi JSON.
- ĐỂ CÔNG THỨC TOÁN HIỂN THỊ TO RÕ ĐẸP MẮT: BẮT BUỘC sử dụng lệnh \\dfrac thay vì \\frac cho tất cả các phân số. Đối với các ký hiệu tổng hoặc tích, sử dụng thêm \\limits (ví dụ: \\sum\\limits_{k=1}^{n} hoặc \\prod\\limits_{i=1}^{2026}) để giới hạn hiển thị ngay ngắn phía trên và phía dưới ký hiệu và có kích thước to rõ như sách giáo khoa.
- BẮT BUỘC GIỮ NGUYÊN các đoạn mã vẽ hình vector <svg>...</svg> hoặc bảng dữ liệu <table>...</table> có sẵn trong văn bản đề thi thô. Hãy lồng trực tiếp các đoạn mã này vào nội dung câu hỏi "question" hoặc phần ngữ liệu của nhóm mà không được tự ý xóa bỏ hay lược dịch thành chữ. Tuy nhiên, nếu bảng (table) hoặc danh sách đó chỉ dùng để liệt kê các phương án lựa chọn kéo thả của câu hỏi drag_drop, bạn BẮT BUỘC phải lược bỏ nó ra khỏi trường "question".
- TUYỆT ĐỐI KHÔNG loại bỏ các ký hiệu đánh dấu số đoạn văn dạng [0], [1], [2], [3]... ở đầu các đoạn văn trong ngữ liệu nền (stimulus/passage). Bạn BẮT BUỘC phải giữ nguyên chúng và bôi đậm chúng bằng thẻ <strong>[0]</strong>, <strong>[1]</strong>, <strong>[2]</strong>...
- Giữa các đoạn văn trong ngữ liệu nền (passage), bạn BẮT BUỘC phải xuống dòng bằng hai ký tự xuống dòng liên tiếp (\n\n) để tạo một dòng trống phân tách rõ ràng các đoạn. để học sinh dễ dàng đối chiếu khi làm bài.
- Giữa các đoạn văn trong ngữ liệu (stimulus/passage), bạn BẮT BUỘC phải xuống dòng bằng hai ký tự xuống dòng liên tiếp (\n\n) để tạo một dòng trống phân tách rõ ràng các đoạn, tuyệt đối không viết liền tù tì thành một khối duy nhất.
- Nếu câu hỏi có liên quan đến hình ảnh tải lên từ máy tính, hãy để trống trường "image_url": "". Giáo viên sẽ tự tải ảnh lên sau.
- HÃY GHÉP CÁC DÒNG của cùng một câu văn lại với nhau. Nếu trong văn bản gốc bị xuống dòng giữa chừng do hết dòng trang giấy, hãy nối chúng lại thành một câu dài liên mạch. Chỉ xuống dòng khi bắt đầu đoạn văn mới hoặc danh sách gạch đầu dòng.
- Giữ nguyên các chữ cái đứng cạnh dấu chấm (ví dụ: "điểm M." hoặc "A(1; 2; -4).") trên cùng một dòng, tuyệt đối không tự ý xuống dòng sau dấu chấm của câu văn hoặc ký hiệu thông thường.
- KHÔNG ngắt câu bừa bãi tại các số thứ tự. Ví dụ: "khác 1. Xét tính đúng sai..." là câu liền mạch, không được ngắt dòng tại "1.".
`;

              // Xây dựng Response Schema động để tối ưu hóa token và ép cấu trúc JSON chuẩn
              var activeSchema;
              var mathSchema = {
                type: "OBJECT",
                properties: {
                  exam_code: { type: "STRING" },
                  title: { type: "STRING" },
                  duration_minutes: { type: "INTEGER" },
                  status: { type: "STRING" },
                  sections: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        section_id: { type: "STRING", enum: ["math"] },
                        section_label: { type: "STRING" },
                        layout: { type: "STRING", enum: ["single"] },
                        questions: {
                          type: "ARRAY",
                          items: {
                            type: "OBJECT",
                            properties: {
                              question_no: { type: "INTEGER" },

                              question_type: { type: "STRING", enum: ["single_choice", "multiple_choice", "true_false", "numeric_answer", "drag_drop", "fill_blank"] },

                              question: { type: "STRING" },

                              image_url: { type: "STRING" },

                              options: {

                                type: "ARRAY",

                                items: {

                                  type: "OBJECT",

                                  properties: {

                                    key: { type: "STRING" },

                                    text: { type: "STRING" }

                                  },

                                  required: ["key", "text"]

                                }

                              },

                              statements: {

                                type: "ARRAY",

                                items: {

                                  type: "OBJECT",

                                  properties: {

                                    id: { type: "STRING" },

                                    text: { type: "STRING" }

                                  },

                                  required: ["id", "text"]

                                }

                              },

                              body: {

                                type: "ARRAY",

                                items: {

                                  type: "OBJECT",

                                  properties: {

                                    type: { type: "STRING", enum: ["text", "blank"] },

                                    content: { type: "STRING" },

                                    id: { type: "STRING" }

                                  },

                                  required: ["type"]

                                }

                              },

                              items: {

                                type: "ARRAY",

                                items: {

                                  type: "OBJECT",

                                  properties: {

                                    id: { type: "STRING" },

                                    text: { type: "STRING" }

                                  },

                                  required: ["id", "text"]

                                }

                              },

                              correct_answer: { type: "STRING" },

                              points: { type: "NUMBER" }
                            },
                            required: ["question_no", "question_type", "question"]
                          }
                        }
                      },
                      required: ["section_id", "section_label", "layout", "questions"]
                    }
                  }
                },
                required: ["sections"]
              };
              var splitSchema = {
                type: "OBJECT",
                properties: {
                  exam_code: { type: "STRING" },
                  title: { type: "STRING" },
                  duration_minutes: { type: "INTEGER" },
                  status: { type: "STRING" },
                  sections: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        section_id: { type: "STRING", enum: [selectedSection] },
                        section_label: { type: "STRING" },
                        layout: { type: "STRING", enum: ["split"] },
                        groups: {
                          type: "ARRAY",
                          items: {
                            type: "OBJECT",
                            properties: {
                              group_id: { type: "STRING" },
                              title: { type: "STRING" },
                              stimulus: {
                                type: "OBJECT",
                                properties: {
                                  type: { type: "STRING", enum: ["text", "html"] },
                                  content: { type: "STRING" }
                                },
                                required: ["type", "content"]
                              },
                              questions: {
                                type: "ARRAY",
                                items: {
                                  type: "OBJECT",
                                  properties: {
                                    question_no: { type: "INTEGER" },

                                    question_type: { type: "STRING", enum: ["single_choice", "multiple_choice", "true_false", "numeric_answer", "drag_drop", "fill_blank"] },

                                    question: { type: "STRING" },

                                    image_url: { type: "STRING" },

                                    options: {

                                      type: "ARRAY",

                                      items: {

                                        type: "OBJECT",

                                        properties: {

                                          key: { type: "STRING" },

                                          text: { type: "STRING" }

                                        },

                                        required: ["key", "text"]

                                      }

                                    },

                                    statements: {

                                      type: "ARRAY",

                                      items: {

                                        type: "OBJECT",

                                        properties: {

                                          id: { type: "STRING" },

                                          text: { type: "STRING" }

                                        },

                                        required: ["id", "text"]

                                      }

                                    },

                                    body: {

                                      type: "ARRAY",

                                      items: {

                                        type: "OBJECT",

                                        properties: {

                                          type: { type: "STRING", enum: ["text", "blank"] },

                                          content: { type: "STRING" },

                                          id: { type: "STRING" }

                                        },

                                        required: ["type"]

                                      }

                                    },

                                    items: {

                                      type: "ARRAY",

                                      items: {

                                        type: "OBJECT",

                                        properties: {

                                          id: { type: "STRING" },

                                          text: { type: "STRING" }

                                        },

                                        required: ["id", "text"]

                                      }

                                    },

                                    correct_answer: { type: "STRING" },

                                    points: { type: "NUMBER" }
                                  },
                                  required: ["question_no", "question_type", "question"]
                                }
                              }
                            },
                            required: ["group_id", "title", "stimulus", "questions"]
                          }
                        }
                      },
                      required: ["section_id", "section_label", "layout", "groups"]
                    }
                  }
                },
                required: ["sections"]
              };
              var autoSchema = {
                type: "OBJECT",
                properties: {
                  exam_code: { type: "STRING" },
                  title: { type: "STRING" },
                  duration_minutes: { type: "INTEGER" },
                  status: { type: "STRING" },
                  sections: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        section_id: { type: "STRING", enum: ["math", "reading", "science"] },
                        section_label: { type: "STRING" },
                        layout: { type: "STRING", enum: ["single", "split"] },
                        questions: {
                          type: "ARRAY",
                          items: {
                            type: "OBJECT",
                            properties: {
                              question_no: { type: "INTEGER" },

                              question_type: { type: "STRING", enum: ["single_choice", "multiple_choice", "true_false", "numeric_answer", "drag_drop", "fill_blank"] },

                              question: { type: "STRING" },

                              image_url: { type: "STRING" },

                              options: {

                                type: "ARRAY",

                                items: {

                                  type: "OBJECT",

                                  properties: {

                                    key: { type: "STRING" },

                                    text: { type: "STRING" }

                                  },

                                  required: ["key", "text"]

                                }

                              },

                              statements: {

                                type: "ARRAY",

                                items: {

                                  type: "OBJECT",

                                  properties: {

                                    id: { type: "STRING" },

                                    text: { type: "STRING" }

                                  },

                                  required: ["id", "text"]

                                }

                              },

                              body: {

                                type: "ARRAY",

                                items: {

                                  type: "OBJECT",

                                  properties: {

                                    type: { type: "STRING", enum: ["text", "blank"] },

                                    content: { type: "STRING" },

                                    id: { type: "STRING" }

                                  },

                                  required: ["type"]

                                }

                              },

                              items: {

                                type: "ARRAY",

                                items: {

                                  type: "OBJECT",

                                  properties: {

                                    id: { type: "STRING" },

                                    text: { type: "STRING" }

                                  },

                                  required: ["id", "text"]

                                }

                              },

                              correct_answer: { type: "STRING" },

                              points: { type: "NUMBER" }
                            },
                            required: ["question_no", "question_type", "question"]
                          }
                        },
                        groups: {
                          type: "ARRAY",
                          items: {
                            type: "OBJECT",
                            properties: {
                              group_id: { type: "STRING" },
                              title: { type: "STRING" },
                              stimulus: {
                                type: "OBJECT",
                                properties: {
                                  type: { type: "STRING", enum: ["text", "html"] },
                                  content: { type: "STRING" }
                                },
                                required: ["type", "content"]
                              },
                              questions: {
                                type: "ARRAY",
                                items: {
                                  type: "OBJECT",
                                  properties: {
                                    question_no: { type: "INTEGER" },

                                    question_type: { type: "STRING", enum: ["single_choice", "multiple_choice", "true_false", "numeric_answer", "drag_drop", "fill_blank"] },

                                    question: { type: "STRING" },

                                    image_url: { type: "STRING" },

                                    options: {

                                      type: "ARRAY",

                                      items: {

                                        type: "OBJECT",

                                        properties: {

                                          key: { type: "STRING" },

                                          text: { type: "STRING" }

                                        },

                                        required: ["key", "text"]

                                      }

                                    },

                                    statements: {

                                      type: "ARRAY",

                                      items: {

                                        type: "OBJECT",

                                        properties: {

                                          id: { type: "STRING" },

                                          text: { type: "STRING" }

                                        },

                                        required: ["id", "text"]

                                      }

                                    },

                                    body: {

                                      type: "ARRAY",

                                      items: {

                                        type: "OBJECT",

                                        properties: {

                                          type: { type: "STRING", enum: ["text", "blank"] },

                                          content: { type: "STRING" },

                                          id: { type: "STRING" }

                                        },

                                        required: ["type"]

                                      }

                                    },

                                    items: {

                                      type: "ARRAY",

                                      items: {

                                        type: "OBJECT",

                                        properties: {

                                          id: { type: "STRING" },

                                          text: { type: "STRING" }

                                        },

                                        required: ["id", "text"]

                                      }

                                    },

                                    correct_answer: { type: "STRING" },

                                    points: { type: "NUMBER" }
                                  },
                                  required: ["question_no", "question_type", "question"]
                                }
                              }
                            },
                            required: ["group_id", "title", "stimulus", "questions"]
                          }
                        }
                      },
                      required: ["section_id", "section_label", "layout"]
                    }
                  }
                },
                required: ["sections"]
              };
              if (selectedSection === "math") {
                activeSchema = mathSchema;
              } else if (selectedSection === "reading" || selectedSection === "science") {
                activeSchema = splitSchema;
              } else {
                activeSchema = autoSchema;
              }

              function extractExpectedQuestionNumbers(text) {
                var seen = {};
                var numbers = [];
                var match;
                var questionPattern = /(?:^|\r?\n)\s*Câu\s+(\d+)\b/gi;

                while ((match = questionPattern.exec(text)) !== null) {
                  var questionNo = parseInt(match[1], 10);
                  if (!seen[questionNo]) {
                    seen[questionNo] = true;
                    numbers.push(questionNo);
                  }
                }

                return numbers.sort(function (a, b) { return a - b; });
              }

              function collectImportedQuestions(importedExam) {
                var questions = [];
                ((importedExam && importedExam.sections) || []).forEach(function (section) {
                  (section.questions || []).forEach(function (question) {
                    questions.push(question);
                  });
                  (section.groups || []).forEach(function (group) {
                    (group.questions || []).forEach(function (question) {
                      questions.push(question);
                    });
                  });
                });
                return questions;
              }

              function isImportedQuestionComplete(question) {
                if (!question || !String(question.question || "").trim()) return false;

                if (question.question_type === "single_choice" || question.question_type === "multiple_choice") {
                  var validOptions = (question.options || []).filter(function (option) {
                    return option && String(option.text || "").trim();
                  });
                  return validOptions.length >= 2;
                }

                if (question.question_type === "true_false") {
                  var validStatements = (question.statements || []).filter(function (statement) {
                    return statement && String(statement.text || "").trim();
                  });
                  return validStatements.length >= 2;
                }

                return true;
              }

              function validateImportedQuestions(importedExam, expectedNumbers) {
                if (!importedExam || !Array.isArray(importedExam.sections)) {
                  return { valid: false, missing: expectedNumbers.slice(), duplicates: [] };
                }

                var counts = {};
                var complete = {};
                collectImportedQuestions(importedExam).forEach(function (question) {
                  var questionNo = Number(question && question.question_no);
                  if (!Number.isInteger(questionNo) || questionNo <= 0) return;
                  counts[questionNo] = (counts[questionNo] || 0) + 1;
                  if (isImportedQuestionComplete(question)) complete[questionNo] = true;
                });

                var missing = expectedNumbers.filter(function (questionNo) {
                  return !complete[questionNo];
                });
                var duplicates = Object.keys(counts).filter(function (questionNo) {
                  return counts[questionNo] > 1;
                }).map(Number).sort(function (a, b) { return a - b; });

                return {
                  valid: importedExam.sections.length > 0 &&
                    (expectedNumbers.length === 0 ? collectImportedQuestions(importedExam).length > 0 : missing.length === 0) &&
                    duplicates.length === 0,
                  missing: missing,
                  duplicates: duplicates
                };
              }

              var expectedQuestionNumbers = extractExpectedQuestionNumbers(rawText);
              var expectedQuestionInstruction = expectedQuestionNumbers.length
                ? "\n\nKIỂM SOÁT TÍNH TOÀN VẸN BẮT BUỘC:\n" +
                  "- Văn bản nguồn có đúng " + expectedQuestionNumbers.length + " câu, mang số: " + expectedQuestionNumbers.join(", ") + ".\n" +
                  "- Phải trả về đầy đủ từng câu trong danh sách trên trong MỘT phản hồi JSON duy nhất.\n" +
                  "- Không được bỏ câu, gộp câu, đổi số câu hoặc tạo câu chỉ có số nhưng thiếu nội dung/phương án.\n" +
                  "- Trước khi kết thúc phản hồi, tự đối chiếu lại đủ " + expectedQuestionNumbers.length + " số câu."
                : "\n\nPhải trả về toàn bộ câu hỏi trong văn bản nguồn trong MỘT phản hồi JSON duy nhất; không được bỏ hoặc tạo câu trống.";
              var payload = {
                contents: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: systemInstruction + expectedQuestionInstruction +
                          "\n\nNỘI DUNG CẦN TÁCH VÀ NHẬP CÂU HỎI:\n" + rawText
                      }
                    ]
                  }
                ],
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: activeSchema,
                  maxOutputTokens: 65536
                }
              };
              var imported = null;

              var runButton = document.getElementById("ai-run-button");
              var originalBtnHtml = runButton.innerHTML;
              runButton.disabled = true;

              try {
                var maxAttempts = 3;
                var lastError = null;

                for (var attempt = 1; attempt <= maxAttempts; attempt++) {
                  if (attempt > 1) {
                    var waitMs = attempt === 2 ? 1500 : 3000;
                    runButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="margin-right: 8px;"></span> AI trả thiếu câu, đang thử lại lần ${attempt}/${maxAttempts}...`;
                    await new Promise(function (resolve) { setTimeout(resolve, waitMs); });
                  }

                  runButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="margin-right: 8px;"></span> Đang nhập toàn bộ ${expectedQuestionNumbers.length || ""} câu hỏi...`;

                  try {
                    var response = await callGemini(payload, { timeoutMs: 180000 });
                    if (!response.ok) {
                      var errBody = await response.text();
                      var errMsg = "Lỗi kết nối API Gemini.";
                      try {
                        var errObj = JSON.parse(errBody);
                        if (errObj && errObj.error) {
                          errMsg = errObj.error.message || errMsg;
                        }
                      } catch (e) {}
                      var responseError = new Error(errMsg);
                      responseError.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
                      throw responseError;
                    }

                    var resData = await response.json();
                    var candidate = resData && resData.candidates && resData.candidates[0];
                    var responsePart = candidate && candidate.content && (candidate.content.parts || []).find(function (part) {
                      return part && typeof part.text === "string";
                    });
                    if (!candidate || !responsePart) {
                      throw new Error("AI không trả về nội dung đề thi.");
                    }
                    if (candidate.finishReason === "MAX_TOKENS") {
                      throw new Error("Phản hồi AI bị cắt do vượt giới hạn đầu ra.");
                    }

                    var jsonText = responsePart.text;
                    window.TMA_AI_DEBUG_LOGS = window.TMA_AI_DEBUG_LOGS || [];
                    window.TMA_AI_DEBUG_LOGS.push({
                      attempt: attempt,
                      finish_reason: candidate.finishReason || "",
                      raw_response: jsonText
                    });
                    console.log("AI full exam response, attempt " + attempt + ":", jsonText);

                    var attemptImported = safeParseGeminiJson(jsonText);
                    sanitizeAiImportedQuestions(attemptImported);
                    var integrity = validateImportedQuestions(attemptImported, expectedQuestionNumbers);
                    if (!integrity.valid) {
                      var integrityMessage = "AI trả về đề chưa đầy đủ.";
                      if (integrity.missing.length) {
                        integrityMessage += " Thiếu hoặc trống câu: " + integrity.missing.join(", ") + ".";
                      }
                      if (integrity.duplicates.length) {
                        integrityMessage += " Trùng số câu: " + integrity.duplicates.join(", ") + ".";
                      }
                      throw new Error(integrityMessage);
                    }

                    imported = attemptImported;
                    break;
                  } catch (attemptError) {
                    lastError = attemptError;
                    if (attemptError && attemptError.retryable === false) throw attemptError;
                    if (attempt === maxAttempts) throw attemptError;
                  }
                }

                if (!imported) {
                  throw lastError || new Error("AI chưa trả về đề thi đầy đủ.");
                }
              } finally {
                runButton.disabled = false;
                runButton.innerHTML = originalBtnHtml;
              }

              if (!imported || !imported.sections) {
                throw new Error("Không thể trích xuất cấu trúc đề thi hợp lệ từ AI!");
              }

              if (window.confirm("✓ AI đã tách câu hỏi thành công! Bạn có chắc chắn muốn nạp toàn bộ câu hỏi này vào phần cấu trúc đề hiện tại không?")) {
                if (!exam.sections) exam.sections = [];
                
                imported.sections.forEach(function (newSec) {
                  var existSecIdx = exam.sections.findIndex(function (s) { return s.section_id === newSec.section_id; });
                  if (existSecIdx !== -1) {
                    var existSec = exam.sections[existSecIdx];
                    if (newSec.section_id === "math") {
                      existSec.questions = existSec.questions || [];
                      (newSec.questions || []).forEach(function (newQ) {
                        var existQIdx = existSec.questions.findIndex(function (q) { return Number(q.question_no) === Number(newQ.question_no); });
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
                            var existQIdx = existG.questions.findIndex(function (q) { return Number(q.question_no) === Number(newQ.question_no); });
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
                window.alert("✓ Đã nạp thành công toàn bộ câu hỏi từ AI! Bạn có thể chuyển qua các tab Toán, Đọc hiểu, Khoa học để kiểm tra và sau đó bấm 'Lưu lên Cloudflare R2' để hoàn tất.");
              }
            } catch (err) {
              console.error(err);
              window.alert("Có lỗi xảy ra khi gọi AI tách câu hỏi:\n" + err.message);
            } finally {
              aiRunBtn.disabled = false;
              aiRunBtn.innerHTML = originalHtml;
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
        var uploadCloudBtn = $("#upload-r2-button");
        if (uploadCloudBtn) {
          uploadCloudBtn.addEventListener("click", function () {
            saveToR2Cloud().catch(function (error) {
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
      window.currentActiveCourseLessons = [];
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
          lessonsList.forEach(function(l) {
            if (!l.parent_id) {
              l.parent_id = getLocalParentId(l.id);
            }
          });
          window.currentActiveCourseLessons = lessonsList;
        } else {
          // Offline mock lessons
          var allMockLessons = JSON.parse(localStorage.getItem("tmaTsaMockLessons") || "[]");
          lessonsList = allMockLessons.filter(function(l) { return l.course_id === activeCourseId; });
          lessonsList.forEach(function(l) {
            if (!l.parent_id) {
              l.parent_id = getLocalParentId(l.id);
            }
          });
          window.currentActiveCourseLessons = lessonsList;
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
          <div style="padding: 40px 20px; text-align: center; background: #ffffff; border-radius: 8px; border: 1px dashed #cbd5e1; color: var(--muted); font-size: 13.5px;">
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
        // Separate parents and children into 3 levels
        var rootLessons = [];
        var level2Map = {};
        var level3Map = {};

        chapterLessons.forEach(function(l) {
          if (!l.parent_id) {
            rootLessons.push(l);
          } else {
            var parent = chapterLessons.find(function(p) { return p.id === l.parent_id; });
            if (parent && parent.parent_id) {
              if (!level3Map[l.parent_id]) {
                level3Map[l.parent_id] = [];
              }
              level3Map[l.parent_id].push(l);
            } else {
              if (!level2Map[l.parent_id]) {
                level2Map[l.parent_id] = [];
              }
              level2Map[l.parent_id].push(l);
            }
          }
        });

        // Sort levels
        rootLessons.sort(compareLessonSortKeys);
        Object.keys(level2Map).forEach(function(k) { level2Map[k].sort(compareLessonSortKeys); });
        Object.keys(level3Map).forEach(function(k) { level3Map[k].sort(compareLessonSortKeys); });

        // Helper function to build a single row
        function buildSingleLessonRow(lesson, isChild) {
          var type = lesson.type === "header" ? "header" : getLessonType(lesson.title);
          var lessonRow = document.createElement("div");
          var previewTag = lesson.preview_allowed ? ` <span style="font-size: 9px; background: #e2fbe8; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 800; text-transform: uppercase; margin-left: 6px; display: inline-block; vertical-align: middle;">Free</span>` : "";

          if (type === "header") {
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 8px; margin-bottom: 4px; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #64748b; font-size: 15px; display: inline-flex; align-items: center; justify-content: center;">📁</span>
                <span style="font-weight: 800; color: #0f5a9e; font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.5px;">\${esc(lesson.title)}</span>
              </div>
            `;
          } else if (type === "phan") {
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; position: relative; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #94a3b8; font-weight: 700; font-size: 13px;">↳</span>
                <span style="color: #64748b; font-size: 13px; display: inline-flex; align-items: center; justify-content: center;">\${SVG_PLAY}</span>
                <span style="font-weight: 600; color: #334155; font-size: 13px;">\${esc(lesson.title)}</span>
                \${previewTag}
              </div>
            `;
          } else if (type === "document") {
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #cbd5e1; font-weight: 700; font-size: 12px; margin-right: 4px;">↳</span>
                <span style="color: #16a34a; display: inline-flex; align-items: center; justify-content: center;">\${SVG_DOC}</span>
                <span style="font-weight: 600; color: #334155; font-size: 13px;">\${esc(lesson.title)}</span>
                \${previewTag}
              </div>
            `;
          } else if (type === "test") {
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #cbd5e1; font-weight: 700; font-size: 12px; margin-right: 4px;">↳</span>
                <span style="color: #b45309; display: inline-flex; align-items: center; justify-content: center;">\${SVG_TEST}</span>
                <span style="font-weight: 600; color: #334155; font-size: 13px;">\${esc(lesson.title)}</span>
                \${previewTag}
              </div>
            `;
          } else {
            lessonRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; transition: all 0.15s;";
            lessonRow.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="color: #cbd5e1; font-weight: 700; font-size: 12px; margin-right: 4px;">↳</span>
                <span style="color: #64748b; font-size: 15px; display: inline-flex; align-items: center; justify-content: center;">\${SVG_PLAY}</span>
                <span style="font-weight: 700; color: #1e293b; font-size: 13.5px;">\${esc(lesson.title)}</span>
                \${previewTag}
              </div>
            `;
          }

          var rightControls = document.createElement("div");
          rightControls.style.cssText = "display: flex; align-items: center; gap: 16px; flex-shrink: 0; margin-left: 12px;";

          var mediaBadges = document.createElement("div");
          mediaBadges.style.cssText = "font-size: 11px; color: #64748b; display: flex; gap: 8px; align-items: center;";
          
          var hasVideo = !!lesson.video_drive_id;
          var hasDoc = !!lesson.doc_link;
          
          // Determine if this lesson can have sub-children (Level 1 or Level 2 can, Level 3 cannot)
          var canHaveChildren = false;
          if (!lesson.parent_id) {
            canHaveChildren = true;
          } else {
            var grandParent = (window.currentActiveCourseLessons || []).find(function(p) { return p.id === lesson.parent_id; });
            if (grandParent && !grandParent.parent_id) {
              canHaveChildren = true;
            }
          }

          if (canHaveChildren) {
            var btnAddSub = document.createElement("button");
            btnAddSub.type = "button";
            btnAddSub.className = "btn btn-outline btn-xs";
            btnAddSub.style.cssText = "font-size: 10px; font-weight: 700; color: #16a34a; border-color: #86efac; background: #f0fdf4; padding: 2px 6px; cursor: pointer;";
            btnAddSub.textContent = "+ Thêm con";
            btnAddSub.onclick = function() {
              showAddSubLessonForLesson(lesson.chapter_name, lesson.title);
            };
            rightControls.appendChild(btnAddSub);
          }
          
          if (type !== "header" && type !== "document" && type !== "test") {
            var btnVideo = document.createElement("button");
            btnVideo.type = "button";
            btnVideo.className = hasVideo ? "badge-green" : "badge-red";
            btnVideo.style.cssText = "border:none; cursor:pointer; font-weight:bold; padding:2px 8px; border-radius:4px; font-size:10.5px;";
            btnVideo.textContent = hasVideo ? "Video bài giảng" : "+ Link Video";
            btnVideo.onclick = function() { openLessonMediaEditor(lesson.id, 'video'); };
            mediaBadges.appendChild(btnVideo);
          }
          
          if (type !== "header" && type !== "test" && type !== "phan") {
            var btnDoc = document.createElement("button");
            btnDoc.type = "button";
            btnDoc.className = hasDoc ? "badge-green" : "badge-red";
            btnDoc.style.cssText = "border:none; cursor:pointer; font-weight:bold; padding:2px 8px; border-radius:4px; font-size:10.5px;";
            btnDoc.textContent = hasDoc ? "Tài liệu PDF" : "+ Link PDF";
            btnDoc.onclick = function() { openLessonMediaEditor(lesson.id, 'doc'); };
            mediaBadges.appendChild(btnDoc);
          }

          rightControls.appendChild(mediaBadges);

          var btnEdit = document.createElement("button");
          btnEdit.type = "button";
          btnEdit.className = "btn btn-outline btn-xs";
          btnEdit.style.cssText = "font-size: 11px; font-weight: 600; color: #0f5a9e; border-color: #cbd5e1; padding: 2px 8px; cursor: pointer;";
          btnEdit.textContent = "Sửa";
          btnEdit.onclick = function() { showEditLessonModal(lesson.id); };
          rightControls.appendChild(btnEdit);

          var btnDel = document.createElement("button");
          btnDel.type = "button";
          btnDel.className = "btn btn-outline btn-xs";
          btnDel.style.cssText = "font-size: 11px; font-weight: 600; color: #ff3b30; border-color: #cbd5e1; padding: 2px 8px; cursor: pointer;";
          btnDel.textContent = "Xóa";
          btnDel.onclick = function() { deleteLmsLesson(lesson.id); };
          rightControls.appendChild(btnDel);

          lessonRow.appendChild(rightControls);
          return lessonRow;
        }

        // Render 3 levels
        rootLessons.forEach(function(parentLesson) {
          var parentRow = buildSingleLessonRow(parentLesson, false);
          lessonsWrapper.appendChild(parentRow);

          var l2Children = level2Map[parentLesson.id];
          if (l2Children && l2Children.length > 0) {
            var l2Container = document.createElement("div");
            l2Container.style.cssText = "position: relative; margin-left: 28px; padding-left: 12px; border-left: 2px solid #cbd5e1; display: flex; flex-direction: column; gap: 4px; margin-top: 4px; margin-bottom: 8px;";
            
            l2Children.forEach(function(l2Lesson) {
              var l2Row = buildSingleLessonRow(l2Lesson, true);
              l2Container.appendChild(l2Row);

              var l3Children = level3Map[l2Lesson.id];
              if (l3Children && l3Children.length > 0) {
                var l3Container = document.createElement("div");
                l3Container.style.cssText = "position: relative; margin-left: 28px; padding-left: 12px; border-left: 2px solid #cbd5e1; display: flex; flex-direction: column; gap: 4px; margin-top: 4px; margin-bottom: 8px;";
                
                l3Children.forEach(function(l3Lesson) {
                  var l3Row = buildSingleLessonRow(l3Lesson, true);
                  l3Container.appendChild(l3Row);
                });

                l2Container.appendChild(l3Container);
              }
            });

            lessonsWrapper.appendChild(l2Container);
          }
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

    
    function saveLocalParentId(lessonId, parentId) {
      if (!lessonId) return;
      var mapping = {};
      try {
        mapping = JSON.parse(localStorage.getItem("tma_lesson_parent_mapping") || "{}");
      } catch(e) {}
      if (parentId) {
        mapping[lessonId] = parentId;
      } else {
        delete mapping[lessonId];
      }
      localStorage.setItem("tma_lesson_parent_mapping", JSON.stringify(mapping));
    }

    function getLocalParentId(lessonId) {
      if (!lessonId) return null;
      var mapping = {};
      try {
        mapping = JSON.parse(localStorage.getItem("tma_lesson_parent_mapping") || "{}");
      } catch(e) {}
      return mapping[lessonId] || null;
    }

        function adjustSidebarButtons(subject) {
      try {
        var list = document.querySelector(".editor-step-list");
        if (!list) return;

        var children = Array.from(list.children || []);
        
        var allowedTabs = ["setup", "ai-import", "export"];
        if (subject === "math") {
          allowedTabs.push("math");
        } else if (subject === "reading") {
          allowedTabs.push("reading");
        } else if (subject === "science") {
          allowedTabs.push("science");
        } else {
          allowedTabs.push("math", "reading", "science");
        }

        var visibleButtons = [];
        children.forEach(function(el) {
          if (el.tagName === "BUTTON" && el.hasAttribute("data-editor-tab-target")) {
            var target = el.getAttribute("data-editor-tab-target");
            if (allowedTabs.includes(target)) {
              el.style.display = "";
              visibleButtons.push(el);
            } else {
              el.style.display = "none";
            }
          } else if (el.classList && el.classList.contains("step-connector")) {
            el.style.display = "none";
          }
        });

        for (var i = 0; i < visibleButtons.length - 1; i++) {
          var btn = visibleButtons[i];
          var nextEl = btn.nextElementSibling;
          while (nextEl && nextEl.classList && nextEl.classList.contains("step-connector")) {
            nextEl.style.display = "";
            nextEl = nextEl.nextElementSibling;
          }
        }
      } catch (err) {
        console.warn("adjustSidebarButtons warning:", err);
      }
    }
    window.adjustSidebarButtons = adjustSidebarButtons;

    function adjustAiImportDropdown(subject) {
      try {
        var select = document.getElementById("ai-import-section");
        if (!select) return;

        var rawOriginal = select.getAttribute("data-original-options");
        if (!rawOriginal) {
          var opts = Array.from(select.options || []).map(function(opt) {
            return { value: opt.value, text: opt.textContent };
          });
          rawOriginal = JSON.stringify(opts);
          select.setAttribute("data-original-options", rawOriginal);
        }

        var originalOpts = [];
        try {
          originalOpts = JSON.parse(rawOriginal || "[]");
        } catch(e) {}
        if (!Array.isArray(originalOpts)) originalOpts = [];

        select.innerHTML = "";

        var allowedValues = [];
        if (subject === "math") {
          allowedValues = ["math"];
        } else if (subject === "reading") {
          allowedValues = ["reading"];
        } else if (subject === "science") {
          allowedValues = ["science"];
        } else {
          allowedValues = ["math", "reading", "science", "auto"];
        }

        originalOpts.forEach(function(opt) {
          if (allowedValues.includes(opt.value)) {
            var el = document.createElement("option");
            el.value = opt.value;
            el.textContent = opt.text;
            select.appendChild(el);
          }
        });
        
        if (allowedValues.length === 1) {
          select.value = allowedValues[0];
        } else if (!allowedValues.includes(select.value)) {
          select.value = "auto";
        }
      } catch (err) {
        console.warn("adjustAiImportDropdown warning:", err);
      }
    }
    window.adjustAiImportDropdown = adjustAiImportDropdown;

    async function syncMetadataToCloud() {
      if (!window.TMAR2) return;

      try {
        var indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(indexList)) indexList = [];

        var idx = indexList.findIndex(function (e) { return e.exam_code === exam.exam_code; });
        var existingMeta = idx !== -1 ? indexList[idx] : null;
        var isOpen = existingMeta ? (existingMeta.is_open === true) : false;

        var meta = {
          exam_code: exam.exam_code,
          title: exam.title,
          status: exam.status,
          duration_minutes: exam.duration_minutes || exam.duration_minutes || 45,
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

        if (idx === -1) {
          indexList.push(meta);
        } else {
          indexList[idx] = meta;
        }

        await window.TMAR2.putJson('data/exams/index.json', indexList);

        localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

        // Publish the public exam copy to R2.
        var publicExam = window.TMAExamSecurity.createPublicExamCopy(exam);
        await window.TMAR2.putJson('data/exams/' + exam.exam_code + '.json', publicExam);

        console.log("Successfully synchronized exam metadata to Cloudflare R2.");
      } catch (error) {
        console.error("Failed to sync exam metadata to Cloud:", error);
      }
    }
    window.syncMetadataToCloud = syncMetadataToCloud;





    function populateParentLessonsDropdown(chapterName, currentLessonId) {
      var select = document.getElementById("lms-lesson-modal-parent-id");
      if (!select) return;

      select.innerHTML = '<option value="">-- Không có (Đây là bài học chính) --</option>';
      
      // Filter out current lesson, items of other chapters, or Level 3 items to avoid self/deep loop
      var potentialParents = (window.currentActiveCourseLessons || []).filter(function(l) {
        if (l.id === currentLessonId) return false;
        if (l.chapter_name !== chapterName) return false;
        
        // Exclude Level 3 items
        if (l.parent_id) {
          var parentOfParent = (window.currentActiveCourseLessons || []).find(function(p) { return p.id === l.parent_id; });
          if (parentOfParent && parentOfParent.parent_id) {
            return false;
          }
        }
        return true;
      });

      potentialParents.forEach(function(p) {
        var opt = document.createElement("option");
        opt.value = p.id;
        if (p.parent_id) {
          opt.textContent = "   ↳ " + p.title;
        } else {
          opt.textContent = p.title;
        }
        select.appendChild(opt);
      });
    }
    window.populateParentLessonsDropdown = populateParentLessonsDropdown;

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
      populateParentLessonsDropdown(chName, "");
    }
    window.showAddLessonForChapter = showAddLessonForChapter;

    function showAddSubLessonForLesson(chName, parentTitle) {
      showAddLessonModal();
      document.getElementById("lms-lesson-modal-chapter").value = chName;
      populateParentLessonsDropdown(chName, "");
      
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
      
      var parentLesson = (window.currentActiveCourseLessons || []).find(function(l) {
        return l.title === parentTitle && l.chapter_name === chName;
      });
      if (parentLesson) {
        document.getElementById("lms-lesson-modal-parent-id").value = parentLesson.id;
      }
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
      
      var chapterVal = document.getElementById("lms-lesson-modal-chapter").value || "Chương 1";
      populateParentLessonsDropdown(chapterVal, "");
      document.getElementById("lms-lesson-modal-parent-id").value = "";
      
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

      populateParentLessonsDropdown(lesson.chapter_name || "Chương 1", lesson.id);
      document.getElementById("lms-lesson-modal-parent-id").value = lesson.parent_id || "";
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
      var parentId = document.getElementById("lms-lesson-modal-parent-id").value || null;
      
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
          var payload = {
            chapter_name: chapter,
            title: name,
            type: type,
            video_drive_id: driveId,
            doc_link: docLink,
            order_index: order,
            preview_allowed: preview,
            parent_id: parentId
          };

          if (id) {
            // Update
            var { error } = await supabaseClient
              .from("lessons")
              .update(payload)
              .eq("id", id);
            
            if (error) {
              if (error.message && (error.message.includes("parent_id") || error.code === "PGRST204" || error.message.includes("schema cache"))) {
                console.warn("Supabase table 'lessons' is missing parent_id column. Falling back to local storage mapping.");
                delete payload.parent_id;
                var { error: retryError } = await supabaseClient
                  .from("lessons")
                  .update(payload)
                  .eq("id", id);
                if (retryError) throw retryError;
                saveLocalParentId(id, parentId);
              } else {
                throw error;
              }
            } else {
              saveLocalParentId(id, parentId);
            }
          } else {
            // Insert
            payload.course_id = activeCourseId;
            var { data: insertedData, error } = await supabaseClient
              .from("lessons")
              .insert(payload)
              .select();
            
            if (error) {
              if (error.message && (error.message.includes("parent_id") || error.code === "PGRST204" || error.message.includes("schema cache"))) {
                console.warn("Supabase table 'lessons' is missing parent_id column. Falling back to local storage mapping.");
                delete payload.parent_id;
                var { data: retryData, error: retryError } = await supabaseClient
                  .from("lessons")
                  .insert(payload)
                  .select();
                if (retryError) throw retryError;
                
                var newId = (retryData && retryData[0]) ? retryData[0].id : null;
                if (newId) {
                  saveLocalParentId(newId, parentId);
                }
              } else {
                throw error;
              }
            } else {
              var newId = (insertedData && insertedData[0]) ? insertedData[0].id : null;
              if (newId) {
                saveLocalParentId(newId, parentId);
              }
            }
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
            preview_allowed: preview,
            parent_id: parentId
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
        tr.style.borderBottom = "1px solid #f1f5f9";

        var courseTitle = codeObj.courses ? (codeObj.courses.title || "Khóa học") : "Khóa học (Mock)";
        var statusBadge = codeObj.active 
          ? `<span style="color: #16a34a; background: #f0fdf4; padding: 4px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 700;">Đang chạy</span>`
          : `<span style="color: #c2272d; background: #fff5f6; padding: 4px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 700;">Tạm khóa</span>`;

        tr.innerHTML = `
          <td style="padding: 16px 20px; font-weight: 700; color: #c2272d; font-size: 13.5px;">${codeObj.code}</td>
          <td style="padding: 16px 20px; font-size: 13px; color: #334155;">${courseTitle}</td>
          <td style="padding: 16px 20px; font-size: 13px; font-weight: 600; color: #334155;">${codeObj.used_count || 0} / ${codeObj.max_uses || 1}</td>
          <td style="padding: 16px 20px; font-size: 13px;">${statusBadge}</td>
          <td style="padding: 16px 20px; text-align: right; display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
            <button class="btn" type="button" onclick="toggleActivationCodeActive('${codeObj.id}', ${codeObj.active})" style="color: #c2272d; border: none; background: #fff5f6; font-weight: 700; border-radius: 6px; padding: 5px 12px; cursor: pointer; font-size: 11.5px; transition: opacity 0.15s;">${codeObj.active ? 'Khóa' : 'Mở'}</button>
            <button class="btn" type="button" onclick="deleteActivationCode('${codeObj.id}')" style="color: #ff3b30; border: none; background: #fff0f0; font-weight: 700; border-radius: 6px; padding: 5px 12px; cursor: pointer; font-size: 11.5px; transition: opacity 0.15s;">Xóa</button>
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
          tr.style.borderBottom = "1px solid #f1f5f9";
          
          var timeStr = new Date(log.viewed_at).toLocaleString('vi-VN');
          var uaShort = log.user_agent ? (log.user_agent.includes("Chrome") ? "Chrome/Web" : log.user_agent.includes("Safari") ? "Safari/iOS" : "Mobile/Device") : "Unknown";

          tr.innerHTML = `
            <td style="padding: 16px 20px; font-weight: 700; font-size: 13px; color: #1e293b;">${log.user_email}</td>
            <td style="padding: 16px 20px; font-size: 13px; font-weight: 600; color: #334155;">${log.lesson_title || "Bài học"}</td>
            <td style="padding: 16px 20px; font-size: 13px; color: #64748b;">${log.course_title || "Khóa học"}</td>
            <td style="padding: 16px 20px; font-size: 13px; font-family: monospace; color: #c2272d; font-weight: 600;">${log.ip_address}</td>
            <td style="padding: 16px 20px; font-size: 13px; color: #334155;">${timeStr}</td>
            <td style="padding: 16px 20px; font-size: 12.5px; color: #64748b; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.user_agent}">${uaShort}</td>
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
        warningsTbody.innerHTML = "<tr><td colspan='5' style='padding: 24px; text-align: center; color: #16a34a; background: #f0fdf4; font-weight: 700; font-family: \"Inter\", sans-serif; font-size: 13.5px; border-radius: 0 0 12px 12px;'>Hệ thống an toàn. Chưa phát hiện tài khoản nào nghi ngờ chia sẻ thiết bị trong 24h qua.</td></tr>";
      } else {
        warningsTbody.innerHTML = "";
        warningAccounts.forEach(function(email) {
          var info = ipGroups[email];
          var tr = document.createElement("tr");
          tr.style.cssText = "border-bottom: 1px solid #ffe4e6; background: #fff5f6;";

          var lastTimeStr = new Date(info.lastTime).toLocaleString('vi-VN');

          tr.innerHTML = `
            <td style="padding: 16px 20px; font-weight: 800; font-size: 13px; color: #c2272d;">${email}</td>
            <td style="padding: 16px 20px; font-size: 13px; font-weight: 800; color: #c2272d;">${info.ips.size} Địa chỉ IP khác nhau</td>
            <td style="padding: 16px 20px; font-size: 13px; font-weight: 600; color: #334155;">${info.lastLesson}</td>
            <td style="padding: 16px 20px; font-size: 13px; color: #334155;">${lastTimeStr}</td>
            <td style="padding: 16px 20px; text-align: right;">
              <button class="btn" type="button" onclick="kickAnomalyStudent('${email}')" style="background: #c2272d; color: white; border: none; font-weight: 700; border-radius: 6px; padding: 6px 14px; cursor: pointer; font-size: 11.5px; transition: opacity 0.15s;">Khóa tài khoản</button>
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
    async function teacherLogout() {
      try {
        if (window.supabaseClient && window.supabaseClient.auth) {
          await window.supabaseClient.auth.signOut();
        }
      } catch (error) {
        console.warn("Không thể đóng phiên Supabase:", error);
      } finally {
        localStorage.removeItem("teacherInfo");
        window.location.href = "login.html#teacher";
      }
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
        if (draft && typeof draft === "object") exam = draft;
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

        renderPracticeRoom();
        renderExamsList();
        renderStudents();
        if (typeof renderOverview === "function") renderOverview();

        // Sync teacher caches from Cloudflare R2.
        if (window.TMA_STORAGE_CONFIG) {
          var r2ExamsUrl = window.TMA_STORAGE_CONFIG.examsBaseUrl;
          fetch(`${r2ExamsUrl}index.json`, { cache: "default" })
            .then(res => {
              if (res.ok) return res.json();
            })
            .then(data => {
              if (data && Array.isArray(data)) {
                let localList = [];
                try {
                  localList = JSON.parse(localStorage.getItem('tma_tsa_exam_index') || '[]');
                } catch(e) {}
                if (!Array.isArray(localList)) localList = [];

                const map = new Map();
                data.forEach(item => {
                  if (item && item.exam_code) map.set(item.exam_code, item);
                });
                localList.forEach(item => {
                  if (item && item.exam_code) {
                    if (!map.has(item.exam_code)) {
                      map.set(item.exam_code, item);
                    }
                  }
                });
                const merged = Array.from(map.values());
                localStorage.setItem('tma_tsa_exam_index', JSON.stringify(merged));
                renderPracticeRoom();
                renderExamsList();
              }
            })
            .catch(err => console.warn("Cannot sync index from R2 on start:", err));

          fetch(`${r2ExamsUrl}drive_links.json`, { cache: "default" })
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
            .catch(err => console.warn("Cannot sync documents index from R2 on start:", err));
        }
      }

      function insertCloudImageIntoGroupText(sectionId, elementId) {
        var textarea = document.getElementById(elementId);
        if (!textarea) return;

        var url = prompt("Nhập link ảnh từ Cloudflare R2 muốn chèn:");
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

      
      function compressImage(file) {
        return new Promise(function(resolve) {
          if (!file || !file.type || file.type.indexOf('image') === -1) {
            resolve(file);
            return;
          }
          var reader = new FileReader();
          reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
              var canvas = document.createElement('canvas');
              var max_width = 1000;
              var width = img.width;
              var height = img.height;
              
              if (width > max_width) {
                height = Math.round((height * max_width) / width);
                width = max_width;
              }
              
              canvas.width = width;
              canvas.height = height;
              
              var ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob(function(blob) {
                if (blob) {
                  var compressedFile = new File([blob], file.name ? file.name.replace(/\.[^/.]+$/, ".jpg") : "image.jpg", {
                    type: "image/jpeg",
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              }, "image/jpeg", 0.75);
            };
            img.onerror = function() { resolve(file); };
            img.src = e.target.result;
          };
          reader.onerror = function() { resolve(file); };
          reader.readAsDataURL(file);
        });
      }


      function compressImage(file) {
        return new Promise(function(resolve) {
          if (!file || !file.type || file.type.indexOf('image') === -1) {
            resolve(file);
            return;
          }
          var reader = new FileReader();
          reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
              var canvas = document.createElement('canvas');
              var max_width = 1000;
              var width = img.width;
              var height = img.height;
              
              if (width > max_width) {
                height = Math.round((height * max_width) / width);
                width = max_width;
              }
              
              canvas.width = width;
              canvas.height = height;
              
              var ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob(function(blob) {
                if (blob) {
                  var compressedFile = new File([blob], file.name ? file.name.replace(/\.[^/.]+$/, ".jpg") : "image.jpg", {
                    type: "image/jpeg",
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              }, "image/jpeg", 0.75);
            };
            img.onerror = function() { resolve(file); };
            img.src = e.target.result;
          };
          reader.onerror = function() { resolve(file); };
          reader.readAsDataURL(file);
        });
      }

      async function uploadToR2(file, pathFolder, fileName) {
        var objectKey = (pathFolder || "passages/temp") + "/" + (fileName || file.name || "image.jpg");
        var result = await window.TMAR2.upload(objectKey, file, file.type || "image/jpeg");
        return result.url;
      }


function triggerChoiceImageUpload(btn) {
        var fileInput = btn.nextElementSibling;
        if (fileInput) fileInput.click();
      }
      window.triggerChoiceImageUpload = triggerChoiceImageUpload;

      async function handleChoiceImageUpload(input, key, sectionId) {
        var rawFile = input.files[0];
        if (!rawFile) return;
        
        var uploadBtn = input.previousElementSibling;
        var originalText = uploadBtn.textContent;
        uploadBtn.disabled = true;
        uploadBtn.textContent = "Tải...";
        
        try {
          var file = await compressImage(rawFile);
          var examCode = window.exam?.exam_code || "temp";
          var questionId = getQuestionDraft(sectionId)?.id || "qtemp";
          var imageUrl = await uploadToR2(file, "questions/" + examCode, questionId + "_" + key + "_" + Date.now() + ".jpg");
          
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
          
          alert("✓ Đã tải và chèn ảnh thành công!");
        } catch (err) {
          console.error("Choice image upload error:", err);
          alert("Lỗi tải ảnh lên: " + err.message);
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.textContent = originalText;
          input.value = "";
        }
      }

      function triggerPassageImageUpload(btn) {
        var fileInp = btn.nextElementSibling;
        if (fileInp) fileInp.click();
      }
      window.triggerPassageImageUpload = triggerPassageImageUpload;

      async function handlePassageImageUpload(input, sectionId, elementId) {
        var rawFile = input.files[0];
        if (!rawFile) return;

        var uploadBtn = input.previousElementSibling;
        var originalText = uploadBtn.textContent;
        uploadBtn.disabled = true;
        uploadBtn.textContent = "Tải...";

        try {
          var file = await compressImage(rawFile);
          var examCode = window.exam?.exam_code || "temp";
          var publicUrl = await uploadToR2(file, "passages/" + examCode, Date.now() + ".jpg");

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
        var grid = document.getElementById("lms-asset-grid");
        if (!grid) return;
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; font-size: 13px; padding: 20px;">Đang tải danh sách ảnh...</div>';

        if (!window.TMAR2) {
          grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #ef4444; font-size: 13px; padding: 20px;">Lỗi: Cloudflare R2 chưa sẵn sàng!</div>';
          return;
        }

        try {
          var result = await window.TMAR2.list('assets/course_covers/');
          var files = (result.objects || []).map(function(item) {
            var name = item.key.split('/').pop();
            return { name: name, url: item.url };
          }).filter(function(item) {
            return item.name && item.name !== '.empty' && item.name !== 'placeholder.txt';
          });

          if (files.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; font-size: 13px; padding: 40px 20px;">Thư viện trống. Hãy tải lên ảnh nền đầu tiên!</div>';
            return;
          }

          var html = "";
          files.forEach(function(file) {
            var publicUrl = file.url;

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
        if (!window.TMAR2) {
          alert("Cloudflare R2 chưa sẵn sàng!");
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
          var uploadResult = await window.TMAR2.upload(uploadPath, file, file.type);

          await loadLmsAssets();

          var publicUrl = uploadResult.url;
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

        if (!window.TMAR2) return;

        try {
          var path = 'assets/course_covers/' + filename;
          await window.TMAR2.remove(path);

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

      var currentChartRange = "1M";

      var chartData = {
        "1D": {
          labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
          values: [12, 5, 18, 45, 80, 55, 30]
        },
        "1W": {
          labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
          values: [120, 150, 180, 140, 220, 310, 280]
        },
        "1M": {
          labels: ["01", "05", "10", "15", "20", "25", "30"],
          values: [320, 410, 380, 520, 680, 710, 890]
        },
        "1Y": {
          labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
          values: [1200, 1800, 2400, 2100, 3200, 4500, 4800, 5100, 6200, 7800, 8900, 9800]
        }
      };

      window.updateOverviewChartRange = function(range) {
        currentChartRange = range;
        var container = document.getElementById("tab-overview");
        if (!container) return;
        var buttons = container.querySelectorAll(".chart-range-btn");
        buttons.forEach(function(btn) {
          var isTarget = btn.getAttribute("onclick").indexOf("'" + range + "'") !== -1;
          btn.classList.toggle("active", isTarget);
          if (isTarget) {
            btn.style.background = "#ffffff";
            btn.style.color = "#c2272d";
            btn.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
          } else {
            btn.style.background = "transparent";
            btn.style.color = "#64748b";
            btn.style.boxShadow = "none";
          }
        });
        drawOverviewChart();
      };

      function drawOverviewChart() {
        var container = document.getElementById("overview-chart-container");
        if (!container) return;
        var range = currentChartRange;
        var data = chartData[range];
        var width = container.clientWidth || 600;
        var height = 320;
        var paddingLeft = 50;
        var paddingRight = 20;
        var paddingTop = 30;
        var paddingBottom = 40;

        var graphWidth = width - paddingLeft - paddingRight;
        var graphHeight = height - paddingTop - paddingBottom;

        var maxVal = Math.max.apply(null, data.values) * 1.15;
        var pointsCount = data.values.length;

        var svgContent = '<svg width="100%" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none" style="overflow: visible;">';
        
        svgContent += '<defs>';
        svgContent += '<linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">';
        svgContent += '<stop offset="0%" stop-color="#c2272d" stop-opacity="0.25"/>';
        svgContent += '<stop offset="100%" stop-color="#c2272d" stop-opacity="0.0"/>';
        svgContent += '</linearGradient>';
        svgContent += '<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">';
        svgContent += '<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#c2272d" flood-opacity="0.3"/>';
        svgContent += '</filter>';
        svgContent += '</defs>';

        var gridLines = 5;
        for (var i = 0; i <= gridLines; i++) {
          var y = paddingTop + (graphHeight * (1 - i / gridLines));
          var val = Math.round(maxVal * (i / gridLines));
          svgContent += '<line x1="' + paddingLeft + '" y1="' + y + '" x2="' + (width - paddingRight) + '" y2="' + y + '" stroke="#f1f5f9" stroke-width="1.2"/>';
          svgContent += '<text x="' + (paddingLeft - 12) + '" y="' + (y + 4) + '" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="end" font-family="inherit">' + val + '</text>';
        }

        var coords = [];
        for (var i = 0; i < pointsCount; i++) {
          var cx = paddingLeft + (graphWidth * (i / (pointsCount - 1)));
          var cy = paddingTop + (graphHeight * (1 - data.values[i] / maxVal));
          coords.push({x: cx, y: cy, label: data.labels[i], val: data.values[i]});
        }

        var linePath = "";
        for (var i = 0; i < coords.length; i++) {
          if (i === 0) {
            linePath += "M " + coords[i].x + " " + coords[i].y;
          } else {
            var prev = coords[i-1];
            var curr = coords[i];
            var cpX1 = prev.x + (curr.x - prev.x) / 3;
            var cpY1 = prev.y;
            var cpX2 = prev.x + 2 * (curr.x - prev.x) / 3;
            var cpY2 = curr.y;
            linePath += " C " + cpX1 + " " + cpY1 + ", " + cpX2 + " " + cpY2 + ", " + curr.x + " " + curr.y;
          }
        }

        var areaPath = linePath + " L " + coords[coords.length - 1].x + " " + (paddingTop + graphHeight) + " L " + coords[0].x + " " + (paddingTop + graphHeight) + " Z";

        svgContent += '<path d="' + areaPath + '" fill="url(#chartGrad)"/>';
        svgContent += '<path d="' + linePath + '" fill="none" stroke="#c2272d" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)"/>';

        for (var i = 0; i < coords.length; i++) {
          var x = coords[i].x;
          var y = paddingTop + graphHeight;
          svgContent += '<text x="' + x + '" y="' + (y + 20) + '" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle" font-family="inherit">' + coords[i].label + '</text>';
        }

        for (var i = 0; i < coords.length; i++) {
          svgContent += '<circle cx="' + coords[i].x + '" cy="' + coords[i].y + '" r="4.5" fill="#ffffff" stroke="#c2272d" stroke-width="2.5" style="cursor: pointer;" class="chart-point" data-index="' + i + '"/>';
        }

        svgContent += '</svg>';
        svgContent += '<div id="chart-tooltip" style="position: absolute; display: none; background: #1e293b; color: #ffffff; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.15); pointer-events: none; white-space: nowrap; z-index: 100; font-family: inherit;"></div>';

        container.innerHTML = svgContent;

        var points = container.querySelectorAll(".chart-point");
        var tooltip = container.querySelector("#chart-tooltip");
        points.forEach(function(pt) {
          pt.addEventListener("mouseover", function(e) {
            var idx = parseInt(pt.getAttribute("data-index"));
            var ptData = coords[idx];
            tooltip.innerHTML = '<div style="color: #94a3b8; font-size: 11px; font-weight: 500; margin-bottom: 2px;">' + (range === '1D' ? 'Giờ: ' : range === '1W' ? 'Thứ: ' : range === '1M' ? 'Ngày: ' : 'Tháng: ') + ptData.label + '</div><div>Hoạt động: ' + ptData.val + '</div>';
            tooltip.style.display = "block";
            var containerRect = container.getBoundingClientRect();
            var xPos = ptData.x - (tooltip.clientWidth / 2);
            var yPos = ptData.y - tooltip.clientHeight - 10;
            tooltip.style.left = xPos + "px";
            tooltip.style.top = yPos + "px";
            pt.setAttribute("r", "6.5");
          });

          pt.addEventListener("mouseout", function() {
            tooltip.style.display = "none";
            pt.setAttribute("r", "4.5");
          });
        });
      }

      window.renderOverview = function() {
        var users = [];
        try {
          var raw = localStorage.getItem("tmaTsaUsers");
          if (raw) users = JSON.parse(raw);
        } catch(e) {}
        var studentCountEl = document.getElementById("overview-student-count");
        if (studentCountEl) {
          studentCountEl.innerText = users.length + " Học sinh";
        }

        var links = {};
        try {
          var raw = localStorage.getItem("tmaTsaDriveLinks");
          if (raw) links = JSON.parse(raw);
        } catch(e) {}
        var docCount = 0;
        for (var k in links) {
          if (Array.isArray(links[k])) docCount += links[k].length;
        }
        var docCountEl = document.getElementById("overview-doc-count");
        if (docCountEl) {
          docCountEl.innerText = docCount + " File";
        }

        var activityContainer = document.getElementById("overview-activities-list");
        if (activityContainer) {
          var activities = [
            { name: "Nguyễn Văn Hùng", text: "đã luyện tập Đề TSA số 01 đạt 8.5 điểm", time: "2 phút trước" },
            { name: "Trần Thị Lan", text: "đã tải về tài liệu ôn tập Đọc hiểu", time: "15 phút trước" },
            { name: "Lê Minh Tuấn", text: "đã đăng ký thành công khóa học Premium", time: "1 giờ trước" },
            { name: "Giáo viên", text: "đã cập nhật ngân hàng câu hỏi môn Toán", time: "2 giờ trước" },
            { name: "Hoàng Văn Nam", text: "đã mở tài khoản học sinh mới", time: "3 giờ trước" }
          ];

          var html = "";
          activities.forEach(function(act) {
            html += '<div style="display: flex; align-items: flex-start; gap: 12px; border-bottom: 1px solid #f8fafc; padding-bottom: 12px;">';
            html += '<div style="background: #fff5f6; width: 8px; height: 8px; border-radius: 999px; margin-top: 6px; flex-shrink: 0; background-color: #c2272d;"></div>';
            html += '<div style="display: flex; flex-direction: column; gap: 3px; flex-grow: 1;">';
            html += '<div style="font-size: 13.5px; color: #1e293b; font-weight: 500;"><strong style="font-weight: 700;">' + act.name + '</strong> ' + act.text + '</div>';
            html += '<div style="font-size: 12px; color: #94a3b8; font-weight: 500;">' + act.time + '</div>';
            html += '</div>';
            html += '</div>';
          });
          activityContainer.innerHTML = html;
        }

        setTimeout(function() {
          drawOverviewChart();
        }, 50);
      };

      window.openQuestionBankModal = function() {
        var modal = document.getElementById("modal-question-bank-manager");
        if (modal) modal.style.display = "flex";
      };

      window.closeQuestionBankModal = function() {
        var modal = document.getElementById("modal-question-bank-manager");
        if (modal) modal.style.display = "none";
      };

      window.onQbSubjectChange = function() {
        var sub = document.getElementById("qb-subject")?.value;
        var diffWrapper = document.getElementById("qb-difficulty-wrapper");
        if (diffWrapper) {
          diffWrapper.style.display = (sub === "math") ? "block" : "none";
        }
      };

      window.autoClassifyQbDifficulty = function() {
        var txt = document.getElementById("qb-question-text")?.value || "";
        var diffSelect = document.getElementById("qb-difficulty");
        var reasonBox = document.getElementById("qb-reason-box");
        var reasonText = document.getElementById("qb-reason-text");

        if (!txt.trim()) {
          alert("Vui lòng nhập nội dung câu hỏi trước khi bấm AI Phân loại độ khó.");
          return;
        }

        var level = 1;
        var reason = "";

        if (txt.includes("\\int") || txt.includes("\\lim") || txt.includes("phương trình mặt phẳng") || txt.includes("biện luận") || txt.length > 250) {
          level = 3;
          reason = "Câu hỏi chứa biến đổi toán học nâng cao / bài toán vận dụng cao (cần từ 4 bước giải trở lên).";
        } else if (txt.includes("\\frac") || txt.includes("\\sqrt") || txt.includes("hàm số") || txt.length > 120) {
          level = 2;
          reason = "Câu hỏi biến đổi trung bình (yêu cầu vận dụng thấp 2-4 bước tính toán).";
        } else {
          level = 1;
          reason = "Câu hỏi nhận biết/thông hiểu cơ bản (áp dụng công thức trực tiếp).";
        }

        if (diffSelect) diffSelect.value = String(level);
        if (reasonBox && reasonText) {
          reasonText.textContent = reason;
          reasonBox.style.display = "block";
        }
      };

      window.saveQuestionToBank = function(e) {
        if (e && e.preventDefault) e.preventDefault();
        
        var subject = document.getElementById("qb-subject")?.value || "math";
        var difficulty = Number(document.getElementById("qb-difficulty")?.value || 1);
        var qText = document.getElementById("qb-question-text")?.value || "";
        var optA = document.getElementById("qb-opt-A")?.value || "";
        var optB = document.getElementById("qb-opt-B")?.value || "";
        var optC = document.getElementById("qb-opt-C")?.value || "";
        var optD = document.getElementById("qb-opt-D")?.value || "";
        var correct = document.getElementById("qb-correct")?.value || "A";
        var exp = document.getElementById("qb-explanation")?.value || "";

        if (!qText.trim()) {
          alert("Vui lòng nhập nội dung câu hỏi.");
          return;
        }

        var qObj = {
          question_no: 1,
          question_type: "single_choice",
          question: qText,
          difficulty: difficulty,
          options: [
            { key: "A", text: optA },
            { key: "B", text: optB },
            { key: "C", text: optC },
            { key: "D", text: optD }
          ],
          correct_answer: correct,
          explanation: exp,
          points: 1
        };

        var targetCode = "TMA_RANDOM_001";
        var raw = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
        var examObj = null;
        if (raw) {
          try { examObj = JSON.parse(raw); } catch(err) {}
        }

        if (!examObj) {
          examObj = {
            exam_code: targetCode,
            title: "Đề ngẫu nhiên số 01",
            duration_minutes: 150,
            status: "published",
            sections: [
              { section_id: "math", section_label: "Tư duy Toán học", layout: "single", questions: [] },
              { section_id: "reading", section_label: "Tư duy Đọc hiểu", layout: "passage", groups: [] },
              { section_id: "science", section_label: "Tư duy Khoa học", layout: "passage", groups: [] }
            ]
          };
        }

        if (!Array.isArray(examObj.sections)) {
          examObj.sections = [
            { section_id: "math", section_label: "Tư duy Toán học", layout: "single", questions: [] }
          ];
        }

        var mathSec = examObj.sections.find(s => s.section_id === "math");
        if (!mathSec) {
          mathSec = { section_id: "math", section_label: "Tư duy Toán học", layout: "single", questions: [] };
          examObj.sections.push(mathSec);
        }
        if (!Array.isArray(mathSec.questions)) mathSec.questions = [];
        
        qObj.question_no = mathSec.questions.length + 1;
        mathSec.questions.push(qObj);

        try {
          localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
          localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
        } catch(err) {}

        alert("✓ Đã thêm câu hỏi mới thành công vào Ngân hàng câu hỏi (Mức độ " + difficulty + ")!");
        
        document.getElementById("qb-question-text").value = "";
        document.getElementById("qb-opt-A").value = "";
        document.getElementById("qb-opt-B").value = "";
        document.getElementById("qb-opt-C").value = "";
        document.getElementById("qb-opt-D").value = "";
        document.getElementById("qb-explanation").value = "";
        if (document.getElementById("qb-reason-box")) document.getElementById("qb-reason-box").style.display = "none";
        
        window.closeQuestionBankModal();
        renderPracticeRoom();
      };

      window.deleteQbQuestion = function(index, isStaged) {
        var msg = isStaged ? "Bạn có chắc chắn muốn xóa câu hỏi chờ duyệt này?" : "Bạn có chắc chắn muốn xóa câu hỏi này khỏi Ngân hàng câu hỏi?";
        if (!confirm(msg)) return;
        
        if (isStaged) {
          var stagedMath = [];
          try { stagedMath = JSON.parse(localStorage.getItem("tma_tsa_staged_math") || "[]"); } catch(e) {}
          stagedMath.splice(index, 1);
          localStorage.setItem("tma_tsa_staged_math", JSON.stringify(stagedMath));
        } else {
          var targetCode = "TMA_RANDOM_001";
          var raw = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
          if (raw) {
            try {
              var examObj = JSON.parse(raw);
              if (examObj && Array.isArray(examObj.sections)) {
                var mathSec = examObj.sections.find(function(s) { return s.section_id === "math"; });
                if (mathSec && Array.isArray(mathSec.questions)) {
                  mathSec.questions.splice(index, 1);
                  localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
                  localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
                }
              }
            } catch(e) {}
          }
        }
        renderPracticeRoom();
      };

      window.clearAllQbOfficialQuestions = function(sectionId) {
        var label = sectionId === "math" ? "Toán" : (sectionId === "reading" ? "Đọc hiểu" : "Khoa học");
        if (!confirm("⚠️ Bạn có chắc chắn muốn XÓA TOÀN BỘ ngân hàng chính thức của môn " + label + "?\nHành động này không thể hoàn tác!")) return;
        
        var targetCode = "TMA_RANDOM_001";
        var raw = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
        if (raw) {
          try {
            var examObj = JSON.parse(raw);
            if (examObj && Array.isArray(examObj.sections)) {
              var sec = examObj.sections.find(function(s) { return s.section_id === sectionId; });
              if (sec) {
                if (sectionId === "math") {
                  sec.questions = [];
                } else {
                  sec.groups = [];
                }
                localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
                localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
              }
            }
          } catch(e) {}
        }
        renderPracticeRoom();
      };

      window.clearAllQbStagedQuestions = function(sectionId) {
        var label = sectionId === "math" ? "Toán" : (sectionId === "reading" ? "Đọc hiểu" : "Khoa học");
        if (!confirm("⚠️ Bạn có chắc chắn muốn XÓA SẠCH danh sách câu hỏi chờ duyệt của môn " + label + "?")) return;
        localStorage.removeItem("tma_tsa_staged_" + sectionId);
        if (sectionId === "math") localStorage.removeItem("tma_tsa_staged_math");
        renderPracticeRoom();
      };

      window.switchQbViewMode = function(mode) {
        window.currentQbViewMode = mode;
        renderPracticeRoom();
      };

      window.editQbGroup = function(groupId, sectionId, targetQIdx, isStaged) {
        var startQIdx = (targetQIdx !== undefined && targetQIdx >= 0) ? targetQIdx : 0;
        window.isEditingSingleQbQuestion = false;
        window.isEditingStagedQuestion = !!isStaged;
        window.stagedGroupId = groupId;
        window.currentEditingSubject = sectionId;
        window.startEditingExam("Ngân hàng câu hỏi Luyện đề ngẫu nhiên", "TMA_RANDOM_001", sectionId);
        
        activeGroupIds[sectionId] = groupId;
        if (typeof switchEditorTab === "function") {
          switchEditorTab(sectionId);
        }
        
        var group = null;
        if (isStaged) {
          var stagedGroups = [];
          try { stagedGroups = JSON.parse(localStorage.getItem("tma_tsa_staged_" + sectionId) || "[]"); } catch(e) {}
          group = stagedGroups.find(function(g) { return g.group_id === groupId; });
          
          if (group) {
            var sec = getSection(sectionId);
            if (sec) {
              var exists = sec.groups.some(function(g) { return g.group_id === groupId; });
              if (!exists) {
                sec.groups.push(clone(group));
              }
            }
          }
        } else {
          var sec = getSection(sectionId);
          group = sec ? sec.groups.find(function(g) { return g.group_id === groupId; }) : null;
        }
        
        if (group) {
          var targetQ = group.questions && group.questions[startQIdx] ? clone(group.questions[startQIdx]) : defaultQuestion(sectionId);
          editingQuestion[sectionId] = { index: startQIdx, question: targetQ };
        }
        
        window.toggleSingleQuestionEditMode(false);
        renderAll();
      };

      window.deleteQbGroup = function(groupId, sectionId, isStaged) {
        var msg = isStaged ? "Bạn có chắc chắn muốn xóa ngữ liệu chờ duyệt này?" : "Bạn có chắc chắn muốn xóa ngữ liệu này và toàn bộ câu hỏi liên quan?";
        if (!confirm(msg)) return;
        
        if (isStaged) {
          var stagedGroups = [];
          try { stagedGroups = JSON.parse(localStorage.getItem("tma_tsa_staged_" + sectionId) || "[]"); } catch(e) {}
          var idx = stagedGroups.findIndex(function(g) { return g.group_id === groupId; });
          if (idx !== -1) {
            stagedGroups.splice(idx, 1);
            localStorage.setItem("tma_tsa_staged_" + sectionId, JSON.stringify(stagedGroups));
          }
        } else {
          var targetCode = "TMA_RANDOM_001";
          var raw = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
          if (raw) {
            try {
              var examObj = JSON.parse(raw);
              if (examObj && Array.isArray(examObj.sections)) {
                var sec = examObj.sections.find(function(s) { return s.section_id === sectionId; });
                if (sec && Array.isArray(sec.groups)) {
                  var idx = sec.groups.findIndex(function(g) { return g.group_id === groupId; });
                  if (idx !== -1) {
                    sec.groups.splice(idx, 1);
                    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
                    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
                  }
                }
              }
            } catch(e) {}
          }
        }
        renderPracticeRoom();
      };

      window.saveStagedQuestionToBank = function() {
        var base = collectBaseQuestion("math", false);
        var targetCode = "TMA_RANDOM_001";
        var examObj = null;
        var stored = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
        if (stored) {
          try { examObj = JSON.parse(stored); } catch(e) {}
        }
        if (!examObj) {
          examObj = {
            exam_code: targetCode,
            title: "Ngân hàng câu hỏi Luyện đề ngẫu nhiên",
            duration_minutes: 150,
            status: "published",
            sections: [
              { section_id: "math", section_label: "Tư duy Toán học", questions: [] },
              { section_id: "reading", section_label: "Tư duy Đọc hiểu", groups: [] },
              { section_id: "science", section_label: "Tư duy Khoa học", groups: [] }
            ]
          };
        }
        
        var mathSec = examObj.sections.find(function(s) { return s.section_id === "math"; });
        if (!mathSec) {
          mathSec = { section_id: "math", section_label: "Tư duy Toán học", questions: [] };
          examObj.sections.push(mathSec);
        }
        if (!Array.isArray(mathSec.questions)) mathSec.questions = [];
        
        base.question_no = mathSec.questions.length + 1;
        mathSec.questions.push(base);
        
        localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
        localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
        
        var stagedMath = [];
        try { stagedMath = JSON.parse(localStorage.getItem("tma_tsa_staged_math") || "[]"); } catch(e) {}
        stagedMath.splice(window.stagedQuestionIndex, 1);
        localStorage.setItem("tma_tsa_staged_math", JSON.stringify(stagedMath));
        
        alert("✓ Đã lưu câu hỏi thành công vào Ngân hàng chính thức!");
        window.isEditingSingleQbQuestion = false;
        window.isEditingStagedQuestion = false;
        exitEditingMode();
      };

      window.saveStagedGroupToBank = function(sectionId) {
        if (editingQuestion[sectionId]) {
          var base = collectBaseQuestion(sectionId, false);
          var sec = getSection(sectionId);
          var group = sec ? sec.groups.find(function(g) { return g.group_id === activeGroupIds[sectionId]; }) : null;
          if (group && Array.isArray(group.questions)) {
            group.questions[editingQuestion[sectionId].index] = base;
          }
        }
        
        var targetCode = "TMA_RANDOM_001";
        var raw = localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
        var examObj = null;
        if (raw) {
          try { examObj = JSON.parse(raw); } catch(e) {}
        }
        if (!examObj) return;
        
        var secObj = examObj.sections.find(function(s) { return s.section_id === sectionId; });
        if (secObj) {
          if (!Array.isArray(secObj.groups)) secObj.groups = [];
          
          var memorySec = getSection(sectionId);
          var memoryGroup = memorySec ? memorySec.groups.find(function(g) { return g.group_id === activeGroupIds[sectionId]; }) : null;
          if (memoryGroup) {
            var existIdx = secObj.groups.findIndex(function(g) { return g.group_id === memoryGroup.group_id; });
            if (existIdx !== -1) {
              secObj.groups[existIdx] = memoryGroup;
            } else {
              secObj.groups.push(memoryGroup);
            }
          }
        }
        
        localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
        localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
        
        var stagedGroups = [];
        try { stagedGroups = JSON.parse(localStorage.getItem("tma_tsa_staged_" + sectionId) || "[]"); } catch(e) {}
        var stgIdx = stagedGroups.findIndex(function(g) { return g.group_id === activeGroupIds[sectionId]; });
        if (stgIdx !== -1) {
          stagedGroups.splice(stgIdx, 1);
          localStorage.setItem("tma_tsa_staged_" + sectionId, JSON.stringify(stagedGroups));
        }
        
        alert("✓ Đã lưu ngữ liệu thành công vào Ngân hàng chính thức!");
        window.isEditingSingleQbQuestion = false;
        window.isEditingStagedQuestion = false;
        exitEditingMode();
      };

      window.deleteQbGroupQuestion = function(groupId, sectionId, qIdx) {
        if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngữ liệu?")) return;
        var targetCode = "TMA_RANDOM_001";
        var raw = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
        if (raw) {
          try {
            var examObj = JSON.parse(raw);
            if (examObj && Array.isArray(examObj.sections)) {
              var sec = examObj.sections.find(function(s) { return s.section_id === sectionId; });
              if (sec && Array.isArray(sec.groups)) {
                var group = sec.groups.find(function(g) { return g.group_id === groupId; });
                if (group && Array.isArray(group.questions)) {
                  group.questions.splice(qIdx, 1);
                  localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
                  localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
                }
              }
            }
          } catch(e) {}
        }
        renderPracticeRoom();
      };

      window.generateAiExplanation = function(sectionId) {
        var baseQ = collectBaseQuestion(sectionId, false);
        var qText = baseQ.question || "";
        if (!qText.trim()) {
          alert("Vui lòng nhập nội dung câu hỏi trước khi nhờ AI viết lời giải.");
          return;
        }

        var passageText = "";
        if (sectionId === "reading" || sectionId === "science") {
          var group = getActiveGroup(sectionId);
          if (group) {
            passageText = group.passage || (group.stimulus ? group.stimulus.content : "") || "";
          }
        }

        var optionsText = "";
        var correctValText = "";
        var qType = baseQ.question_type || "single_choice";

        if (qType === "single_choice" || qType === "multiple_choice" || qType === "single_choice_2") {
          if (Array.isArray(baseQ.options)) {
            baseQ.options.forEach(function(opt) {
              if (opt.text && opt.text.trim()) {
                optionsText += opt.key + ". " + opt.text.trim() + "\n";
              }
            });
          }
          if (Array.isArray(baseQ.correct_answer)) {
            correctValText = baseQ.correct_answer.join(", ");
          } else if (baseQ.correct_answer) {
            correctValText = String(baseQ.correct_answer);
          }
        } else if (qType === "true_false") {
          optionsText = "CÁC PHÁT BIỂU ĐÚNG/SAI VÀ MỆNH ĐỀ:\n";
          if (Array.isArray(baseQ.statements)) {
            baseQ.statements.forEach(function(stmt) {
              if (stmt.text && stmt.text.trim()) {
                optionsText += "- Mệnh đề " + stmt.id.toUpperCase() + ": " + stmt.text.trim() + "\n";
              }
            });
          }
          if (baseQ.correct_answer && typeof baseQ.correct_answer === "object") {
            var correctPairs = [];
            Object.keys(baseQ.correct_answer).forEach(function(id) {
              correctPairs.push("Mệnh đề " + id.toUpperCase() + ": " + (baseQ.correct_answer[id] ? "Đúng" : "Sai"));
            });
            correctValText = correctPairs.join(", ");
          }
        } else if (qType === "fill_blank") {
          if (baseQ.correct_answer) {
            correctValText = String(baseQ.correct_answer);
          }
        } else if (qType === "numeric_answer") {
          if (baseQ.correct_answer !== undefined && baseQ.correct_answer !== null) {
            correctValText = String(baseQ.correct_answer);
          }
        } else if (qType === "drag_drop") {
          var dragItemsStr = "";
          if (Array.isArray(baseQ.items)) {
            dragItemsStr = baseQ.items.map(function(item) { return item.text; }).join(" | ");
          }
          var dragBodyStr = "";
          if (Array.isArray(baseQ.body)) {
            dragBodyStr = baseQ.body.map(function(part) {
              if (part.type === "text") return part.content;
              return "[" + part.id + "]";
            }).join("");
          }
          optionsText = "Đoạn văn điền khuyết: " + dragBodyStr + "\nCác nhãn kéo thả có sẵn: " + dragItemsStr + "\n";

          if (baseQ.correct_answer && typeof baseQ.correct_answer === "object") {
            var correctPairs = [];
            Object.keys(baseQ.correct_answer).forEach(function(blankId) {
              var valId = baseQ.correct_answer[blankId];
              var matchedItem = (baseQ.items || []).find(function(it) { return it.id === valId; });
              var itemText = matchedItem ? matchedItem.text : valId;
              correctPairs.push(blankId + "=" + itemText);
            });
            correctValText = correctPairs.join(" | ");
          }
        }

        var btn = document.getElementById(sectionId + "-ai-explain-btn");
        var origText = btn ? btn.textContent : "🤖 AI Làm lời giải";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "⏳ Đang giải...";
        }

        var promptText = "Bạn là chuyên gia thẩm định và viết lời giải chi tiết cho kỳ thi đánh giá tư duy TSA Bách Khoa Việt Nam.\n" +
          "Nhiệm vụ của bạn là viết một phần LỜI GIẢI CHI TIẾT cực kỳ chất lượng, chuẩn mực sư phạm và mạch lạc cho câu hỏi dưới đây.\n\n" +
          "Yêu cầu chung:\n" +
          "- Trả về duy nhất lời giải chi tiết, không kèm theo bất kỳ lời chào hỏi, dẫn dắt hay kết luận dư thừa.\n" +
          "- Trình bày lời giải khoa học, chia thành các bước rõ ràng. Mỗi bước lớn nên xuống dòng bằng cách sử dụng ký tự xuống dòng kép (hai lần Enter / '\\n\\n') để giao diện hiển thị thông thoáng, không viết gộp nguyên một đoạn văn dài.\n" +
          "- TUYỆT ĐỐI KHÔNG sử dụng các ký hiệu markdown như dấu sao đôi `**` hay dấu sao đơn `*` để bôi đậm hoặc làm danh sách. Thay vào đó, hãy viết chữ thường 'Bước 1: ...', 'Bước 2: ...' hoặc dùng thẻ HTML <strong>Bước 1: ...</strong> để bôi đậm.\n" +
          "- Sử dụng ký hiệu \\( ... \\) cho công thức toán nội dòng (inline) và \\[ ... \\] cho công thức khối (display math). Bắt buộc dùng lệnh \\dfrac thay cho \\frac cho tất cả phân số, và dùng \\limits cho tổng, tích, giới hạn có cận (ví dụ: \\sum\\limits_{k=1}^n).\n\n" +
          "Yêu cầu riêng theo dạng câu hỏi:\n";

        if (qType === "true_false") {
          promptText += "- Đây là câu hỏi Đúng/Sai có nhiều phát biểu. Bạn phải lần lượt lập luận chi tiết và chỉ ra tính Đúng/Sai cho từng mệnh đề a, b, c, d (hoặc các mệnh đề có trong đề bài).\n" +
            "- Ở cuối lời giải, bạn BẮT BUỘC phải chốt lại đáp án cụ thể cho từng mệnh đề rõ ràng theo định dạng:\n" +
            "  <strong>Kết luận:</strong>\n" +
            "  - Mệnh đề a: Đúng (hoặc Sai)\n" +
            "  - Mệnh đề b: Đúng (hoặc Sai)\n" +
            "  - Mệnh đề c: Đúng (hoặc Sai)\n" +
            "  - Mệnh đề d: Đúng (hoặc Sai)\n\n";
        } else if (qType === "drag_drop") {
          promptText += "- Đây là câu hỏi Kéo thả / Điền khuyết vào các vị trí ô trống [o1], [o2], [o3]... từ các nhãn kéo thích hợp.\n" +
            "- Bạn phải lập luận logic rõ ràng để tìm ra nhãn/từ/số thích hợp điền vào từng ô trống [o1], [o2]...\n" +
            "- Ở cuối lời giải, bạn BẮT BUỘC phải chốt lại đáp án cụ thể cho từng ô trống theo định dạng:\n" +
            "  <strong>Kết luận:</strong>\n" +
            "  - Ô [o1] điền: [Nhãn/Đáp án đúng]\n" +
            "  - Ô [o2] điền: [Nhãn/Đáp án đúng]\n" +
            "  - Ô [o3] điền: [Nhãn/Đáp án đúng]\n\n";
        } else if (qType === "numeric_answer" || qType === "fill_blank") {
          promptText += "- Đây là câu hỏi Điền số / Điền đáp án ngắn. Bạn phải giải chi tiết ra đáp số cuối cùng.\n" +
            "- Ở cuối lời giải, bạn BẮT BUỘC phải chốt đáp án rõ ràng dạng: <strong>Đáp án đúng:</strong> [giá trị].\n\n";
        } else {
          promptText += "- Đây là câu hỏi Trắc nghiệm chọn phương án. Bạn phải lập luận để chỉ rõ tại sao chọn phương án đúng và tại sao loại trừ các phương án khác.\n" +
            "- Ở cuối lời giải, bạn BẮT BUỘC phải chốt đáp án rõ ràng dạng: <strong>Đáp án đúng:</strong> [Chữ cái đáp án đúng, ví dụ: A].\n\n";
        }

        if (passageText) {
          promptText += "NGỮ LIỆU ĐỀ BÀI:\n" + passageText + "\n\n";
        }
        promptText += "CÂU HỎI:\n" + qText + "\n\n";
        if (optionsText) {
          promptText += "CHI TIẾT PHƯƠNG ÁN / CÂU HỎI:\n" + optionsText + "\n\n";
        }
        if (correctValText) {
          promptText += "ĐÁP ÁN ĐÃ THIẾT LẬP (Phải giải và chốt đúng đáp án này): " + correctValText + "\n\n";
        }

        var payload = {
          contents: [{
            parts: [{
              text: promptText
            }]
          }],
          generationConfig: {
            temperature: 0.15
          }
        };
        callGemini(payload)
        .then(function(res) {
          return handleGeminiResponseError(res);
        })
        .then(function(data) {
          var answerText = data.candidates[0].content.parts[0].text;
          answerText = answerText.replace(/^```[a-zA-Z]*\n?/gm, "").replace(/```$/gm, "").trim();
          var expArea = document.getElementById(sectionId + "-q-explanation");
          if (expArea) {
            expArea.value = answerText;
            expArea.dispatchEvent(new Event("input"));
          }
        })
        .catch(function(err) {
          console.error(err);
          alert("Không thể tạo lời giải bằng AI: " + (err.message || "Lỗi không xác định"));
        })
        .finally(function() {
          if (btn) {
            btn.disabled = false;
            btn.textContent = origText;
          }
        });
      };

      window.isEditingSingleQbQuestion = false;

      function toggleSingleQuestionEditMode(isSingleMode) {
        var layout = document.querySelector(".math-2col-layout") || document.querySelector(".math-split-layout");
        var rightCol = document.querySelector(".math-wizard-wrapper");
        var sidebarEditor = document.getElementById("sidebar-editor-nav");
        var shell = document.querySelector(".teacher-shell");
        var defaultDiff = document.getElementById("math-default-diff-row");
        var editorContainer = document.getElementById("editor-container");
        
        window.isEditingSingleQbQuestion = !!isSingleMode;
        if (isSingleMode) {
          document.body.classList.add("single-qb-mode");
        } else {
          document.body.classList.remove("single-qb-mode");
        }

        if (isSingleMode) {
          if (editorContainer) editorContainer.style.display = "block";
          if (rightCol) rightCol.style.display = "none";
          if (sidebarEditor) sidebarEditor.style.display = "none";
          if (shell) shell.classList.add("hide-sidebar");
          if (defaultDiff) defaultDiff.style.display = "none";
          
          var topbarMeta = document.getElementById("topbar-single-qb-metadata");
          if (topbarMeta) topbarMeta.style.display = "flex";

          if (typeof switchEditorTab === "function" && typeof activeEditorTab !== "undefined" && activeEditorTab !== "math") {
            switchEditorTab("math");
          }
          
          if (layout) {
            layout.style.display = "grid";
            layout.style.gridTemplateColumns = "1.1fr 1fr";
            layout.style.width = "100%";
          }
          
          window.injectSingleQuestionControls(typeof activeEditorTab !== "undefined" ? activeEditorTab : "math");
          if (typeof renderQuestionForm === "function") {
            renderQuestionForm(typeof activeEditorTab !== "undefined" ? activeEditorTab : "math");
          }
        } else {
          if (rightCol) rightCol.style.display = "flex";
          if (sidebarEditor) sidebarEditor.style.display = "flex";
          if (shell) shell.classList.remove("hide-sidebar");
          if (defaultDiff) defaultDiff.style.display = "flex";
          
          var topbarMeta = document.getElementById("topbar-single-qb-metadata");
          if (topbarMeta) topbarMeta.style.display = "none";
          
          if (layout) {
            layout.style.display = "grid";
            layout.style.gridTemplateColumns = "1.1fr 1fr";
            layout.style.width = "100%";
          }
          
          var metaCard = document.getElementById("math-single-qb-metadata-card");
          if (metaCard) metaCard.remove();
          var bottomControls = document.getElementById("math-single-qb-controls");
          if (bottomControls) bottomControls.remove();
          var qbTopbar = document.getElementById("math-single-qb-topbar");
          if (qbTopbar) qbTopbar.remove();
        }
      }
      window.toggleSingleQuestionEditMode = toggleSingleQuestionEditMode;

      window.setMathQuestionType = function(type) {
        try {
          var btns = document.querySelectorAll("#topbar-question-type-tabs .math-type-btn, #vach1-question-type-tabs .math-type-btn");
          btns.forEach(function(b) {
            var isTarget = b.getAttribute("data-type") === type;
            if (isTarget) {
              b.classList.add("active");
              b.style.background = "#c2272d";
              b.style.color = "#ffffff";
              b.style.border = "none";
              b.style.boxShadow = "0 1px 2px rgba(194,39,45,0.25)";
              b.style.fontWeight = "700";
              b.style.height = "24px";
              b.style.fontSize = "11.5px";
              b.style.padding = "0 10px";
              b.style.borderRadius = "4px";
            } else {
              b.classList.remove("active");
              b.style.background = "transparent";
              b.style.color = "#475569";
              b.style.border = "none";
              b.style.boxShadow = "none";
              b.style.fontWeight = "600";
              b.style.height = "24px";
              b.style.fontSize = "11.5px";
              b.style.padding = "0 10px";
              b.style.borderRadius = "4px";
            }
          });

          if (typeof window.switchQuestionType === "function") {
            window.switchQuestionType("math", type);
          }
          if (window.isEditingSingleQbQuestion && typeof window.injectSingleQuestionControls === "function") {
            window.injectSingleQuestionControls("math");
          }
          if (typeof updatePreview === "function") {
            updatePreview("math");
          }
        } catch(err) {
          console.error("setMathQuestionType error:", err);
        }
      };

      window.injectSingleQuestionControls = function(sectionId) {
        var oldCard = document.getElementById("math-single-qb-metadata-card");
        if (oldCard) oldCard.remove();

        var q = editingQuestion[sectionId] ? editingQuestion[sectionId].question : null;
        var currTopic = q ? (q.topic || "Khảo sát hàm số") : "Khảo sát hàm số";
        var currDiff = q ? (Number(q.difficulty || 1)) : 1;

        if (sectionId === "math") {
          var v1Topic = document.getElementById("math-single-qb-topic-select");
          if (v1Topic) {
            var optsArr = v1Topic.options ? Array.from(v1Topic.options) : [];
            var exists = optsArr.some(function(opt) { return opt.value === currTopic; });
            if (!exists) {
              var newOpt = document.createElement("option");
              newOpt.value = currTopic;
              newOpt.textContent = currTopic;
              v1Topic.appendChild(newOpt);
            }
            v1Topic.value = currTopic;
          }
          var v1Diff = document.getElementById("math-q-difficulty-select");
          if (v1Diff) v1Diff.value = String(currDiff);

          var activeType = q ? q.question_type : "single_choice";
          var btns = document.querySelectorAll("#topbar-question-type-tabs .math-type-btn");
          btns.forEach(function(b) {
            var isTarget = b.getAttribute("data-type") === activeType;
            if (isTarget) {
              b.classList.add("active");
              b.style.background = "#c2272d";
              b.style.color = "#ffffff";
              b.style.fontWeight = "700";
            } else {
              b.classList.remove("active");
              b.style.background = "transparent";
              b.style.color = "#475569";
              b.style.fontWeight = "600";
            }
          });
          
          if (window.isEditingSingleQbQuestion) {
            // Render the clean horizontal question type tabs next to the topbar Back button
            var tabsContainer = document.getElementById("math-single-qb-type-tabs-container");
            if (tabsContainer) {
              tabsContainer.innerHTML = typeTabsHtml("math", q ? q.question_type : "single_choice");
            }

            // Create metadata card with topic, difficulty selects AND "AI Phân loại" button (Borderless)
            var form = document.getElementById("math-question-form");
            if (form && !document.getElementById("math-single-qb-metadata-card")) {
              var topHeaderCard = document.createElement("div");
              topHeaderCard.id = "math-single-qb-metadata-card";
              topHeaderCard.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 16px; background: transparent; border: none; border-radius: 0; padding: 0; margin-top: 4px; margin-bottom: 16px; width: 100%; box-sizing: border-box; font-family: inherit;";

              topHeaderCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap;">Chủ đề:</span>
                    <select id="math-single-qb-topic-select" style="border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 0 10px; font-weight: 600; font-size: 13px; outline: none; cursor: pointer; color: #0f172a; background: #ffffff; min-width: 230px; height: 36px; font-family: inherit;">
                      <option value="Khảo sát hàm số">Khảo sát hàm số</option>
                      <option value="Mũ và Lôgarit">Mũ và Lôgarit</option>
                      <option value="Nguyên hàm &amp; Tích phân">Nguyên hàm &amp; Tích phân</option>
                      <option value="Số phức">Số phức</option>
                      <option value="Tổ hợp &amp; Xác suất">Tổ hợp &amp; Xác suất</option>
                      <option value="Hình học không gian">Hình học không gian</option>
                      <option value="Hình học giải tích Oxyz">Hình học giải tích Oxyz</option>
                      <option value="Lượng giác">Lượng giác</option>
                      <option value="Dãy số &amp; Cấp số">Dãy số &amp; Cấp số</option>
                      <option value="Vectơ &amp; Hệ tọa độ">Vectơ &amp; Hệ tọa độ</option>
                      <option value="Phương trình &amp; Hệ phương trình">Phương trình &amp; Hệ phương trình</option>
                    </select>
                  </div>

                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap;">Độ khó:</span>
                    <select id="math-q-difficulty-select" style="border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 0 10px; font-weight: 600; font-size: 13px; outline: none; cursor: pointer; color: #0f172a; background: #ffffff; height: 36px; font-family: inherit;" onchange="window.updateCurrentMathDifficulty(this.value)">
                      <option value="1">Mức 1 (Dễ)</option>
                      <option value="2">Mức 2 (Trung bình)</option>
                      <option value="3">Mức 3 (Khó)</option>
                    </select>
                  </div>
                </div>

                <button type="button" class="btn" onclick="window.autoClassifyMathQuestionForm()" style="background: #c2272d; color: #ffffff; font-weight: 700; font-size: 13px; padding: 0 18px; height: 36px; border-radius: 6px; border: none; cursor: pointer; transition: background 0.15s; white-space: nowrap; font-family: inherit;" onmouseover="this.style.background='#a81d22';" onmouseout="this.style.background='#c2272d';" title="AI Phân loại tự động chủ đề và độ khó">
                  AI Phân loại
                </button>
              `;

              form.insertBefore(topHeaderCard, form.firstChild);

              // Update values inside newly injected selects
              var topicSelect = document.getElementById("math-single-qb-topic-select");
              if (topicSelect) {
                var exists = Array.from(topicSelect.options).some(function(opt) { return opt.value === currTopic; });
                if (!exists) {
                  var newOpt = document.createElement("option");
                  newOpt.value = currTopic;
                  newOpt.textContent = currTopic;
                  topicSelect.appendChild(newOpt);
                }
                topicSelect.value = currTopic;
              }
              var diffSelect = document.getElementById("math-q-difficulty-select");
              if (diffSelect) diffSelect.value = String(currDiff);
            }

            // Render bottom controls
            if (!document.getElementById("math-single-qb-controls")) {
              var bottomControls = document.createElement("div");
              bottomControls.id = "math-single-qb-controls";
              bottomControls.style.cssText = "display: flex; justify-content: flex-end; align-items: center; gap: 16px; margin-top: 24px; padding-top: 20px; border-top: 1.5px solid #e2e8f0; width: 100%; font-family: inherit;";
              
              var saveBtnHtml = window.isEditingStagedQuestion
                ? `<button type="button" class="btn" onclick="window.saveStagedQuestionToBank()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; font-weight: 700; padding: 11px 32px; border-radius: 10px; font-size: 13.5px; cursor: pointer; transition: all 0.15s; box-shadow: 0 4px 12px rgba(16,185,129,0.25); font-family: inherit;">Lưu vào ngân hàng câu hỏi</button>`
                : `<button type="button" class="btn" onclick="saveMathWizardQuestion(false)" style="background: linear-gradient(135deg, #c2272d 0%, #9b1c22 100%); color: white; border: none; font-weight: 700; padding: 11px 32px; border-radius: 10px; font-size: 13.5px; cursor: pointer; transition: all 0.15s; box-shadow: 0 4px 12px rgba(194,39,45,0.25); font-family: inherit;">Lưu Thay Đổi</button>`;

              bottomControls.innerHTML = `
                <div style="display: flex; gap: 12px; margin-right: auto; align-items: center; flex-wrap: wrap;">
                  <button type="button" class="btn" onclick="window.openTeacherAiPromptModal()" style="background: #ffffff; color: #4f46e5; border: 1.5px solid #c7d2fe; font-weight: 700; font-size: 13.5px; padding: 11px 18px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(79,70,229,0.1); transition: all 0.2s;" onmouseover="this.style.background='#f5f3ff';" onmouseout="this.style.background='#ffffff';">⚙️ Cấu hình Prompt AI</button>
                  <button type="button" class="btn" onclick="window.autoOptimizeMathQuestion()" style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; font-weight: 700; font-size: 13.5px; padding: 11px 20px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25); transition: all 0.2s;">✨ Tối ưu bằng AI</button>
                </div>
                ${saveBtnHtml}
              `;
              var mathForm = document.getElementById("math-question-form");
              if (mathForm) mathForm.appendChild(bottomControls);
            }
          }
        } else {
          // Reading & Science
          if (window.isEditingSingleQbQuestion) {
            var tabsContainer = document.getElementById("math-single-qb-type-tabs-container");
            if (tabsContainer) {
              var sectionLabel = sectionId === "reading" ? "Đọc hiểu" : "Khoa học";
              tabsContainer.innerHTML = `<span style="font-size: 14.5px; font-weight: 700; color: #475569; font-family: inherit;">Ngữ liệu ${sectionLabel}</span>`;
            }
          }
        }

        if (window.isEditingStagedQuestion && (sectionId === "reading" || sectionId === "science")) {
          var btnRow = document.getElementById(sectionId + "-editor-save-btn-row");
          if (btnRow && !document.getElementById(sectionId + "-save-staged-qb-btn")) {
            var stagedBtn = document.createElement("button");
            stagedBtn.id = sectionId + "-save-staged-qb-btn";
            stagedBtn.type = "button";
            stagedBtn.className = "btn";
            stagedBtn.style.cssText = "background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: 700; padding: 10px 24px; border-radius: 8px; font-size: 13.5px; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.25); font-family: inherit; margin-left: 8px;";
            stagedBtn.textContent = "Lưu vào ngân hàng câu hỏi";
            stagedBtn.onclick = function() {
              window.saveStagedGroupToBank(sectionId);
            };
            btnRow.appendChild(stagedBtn);
          }
        } else if (!window.isEditingStagedQuestion) {
          var oldStagedBtn = document.getElementById(sectionId + "-save-staged-qb-btn");
          if (oldStagedBtn) oldStagedBtn.remove();
        }
      };

      function repairTruncatedJson(str) {
        if (!str) return "";
        var clean = str.trim();
        var firstBrace = clean.indexOf("{");
        if (firstBrace === -1) return clean;
        
        var jsonPart = clean.slice(firstBrace);
        var inString = false;
        var escape = false;
        var stack = [];
        var repaired = "";
        
        for (var i = 0; i < jsonPart.length; i++) {
          var char = jsonPart[i];
          repaired += char;
          
          if (escape) {
            escape = false;
            continue;
          }
          if (char === "\\") {
            escape = true;
            continue;
          }
          if (char === '"') {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === "{") {
              stack.push("}");
            } else if (char === "[") {
              stack.push("]");
            } else if (char === "}" || char === "]") {
              if (stack.length > 0 && stack[stack.length - 1] === char) {
                stack.pop();
              }
            }
          }
        }
        
        if (inString) {
          repaired += '"';
        }
        
        while (stack.length > 0) {
          var closing = stack.pop();
          repaired = repaired.trim().replace(/,$/, "") + closing;
        }
        
        return repaired;
      }

      function safeParseGeminiJson(rawText) {
        if (!rawText || typeof rawText !== "string") return {};
        var clean = rawText.trim();
        clean = clean.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/gi, "").trim();

        // Vá JSON nếu bị cắt cụt/thiếu ngoặc
        var repairedJson = repairTruncatedJson(clean);

        try {
          return JSON.parse(repairedJson);
        } catch (e1) {
          console.warn("Direct JSON.parse failed, running automated LaTeX backslash repair:", e1.message);
        }

        var repaired = repairedJson.replace(/\\([a-zA-Z]+)/g, function(match, word) {
          if ((match === "\\n" || match === "\\r" || match === "\\t" || match === "\\b" || match === "\\f") &&
              !/^(frac|dfrac|tfrac|text|tan|theta|times|tau|begin|bar|beta|binom|bbox|cdot|sqrt|left|right|limits|sum|int|log|lim|sin|cos|cot|vec|alpha|gamma|delta|omega|phi|pi|sigma|le|ge|neq)/i.test(word)) {
            return match;
          }
          return "\\\\" + word;
        }).replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");

        try {
          return JSON.parse(repaired);
        } catch (e2) {
          console.warn("Second repair attempt failed, trying aggressive backslash escaping:", e2.message);
          try {
            var aggressive = repairedJson.replace(/\\/g, "\\\\").replace(/\\\\\\\\/g, "\\\\");
            return JSON.parse(aggressive);
          } catch (e3) {
            var match = repairedJson.match(/\{[\s\S]*\}/);
            if (match) {
              var extracted = match[0].replace(/\\/g, "\\\\").replace(/\\\\\\\\/g, "\\\\");
              try {
                return JSON.parse(extracted);
              } catch(e4) {}
            }
            throw new Error("Không thể xử lý định dạng công thức từ AI. Chi tiết: " + e1.message);
          }
        }
      }
      window.safeParseGeminiJson = safeParseGeminiJson;


      async function callGemini(payload, options) {
        if (!window.TMA_AI || typeof window.TMA_AI.generate !== "function") {
          throw new Error("Dịch vụ AI chưa được tải. Hãy tải lại trang.");
        }
        return window.TMA_AI.generate(payload, options);
      }
      window.callGemini = callGemini;

      async function refreshTeacherAiBackendStatus() {
        var container = document.getElementById("teacher-ai-backend-status");
        var dot = document.getElementById("teacher-ai-status-dot");
        var text = document.getElementById("teacher-ai-status-text");
        if (!container || !dot || !text || !window.TMA_AI) return;
        try {
          var status = await window.TMA_AI.health();
          if (!status.configured) throw new Error("Backend chưa có GEMINI_API_KEY");
          dot.style.background = "#16825d";
          text.textContent = "AI sẵn sàng";
          container.style.borderColor = "#9acdbb";
          container.style.background = "#edf9f4";
          container.style.color = "#167257";
          container.title = "AI đang chạy qua backend với " + (status.model || "Gemini");
        } catch (error) {
          dot.style.background = "#b42318";
          text.textContent = "Kiểm tra backend AI";
          container.style.borderColor = "#efb2ad";
          container.style.background = "#fff3f2";
          container.style.color = "#b42318";
          container.title = error.message || "Backend AI chưa sẵn sàng";
        }
      }
      window.setTimeout(refreshTeacherAiBackendStatus, 500);


      function handleGeminiResponseError(response) {
        if (!response.ok) {
          return response.text().then(function(errText) {
            var errMsg = "Lỗi kết nối API Gemini.";
            try {
              var errObj = JSON.parse(errText);
              if (errObj && errObj.error) {
                var status = errObj.error.status || "";
                var rawMsg = errObj.error.message || "";
                if (status === "RESOURCE_EXHAUSTED") {
                  errMsg = "Giới hạn API (RESOURCE_EXHAUSTED): " + rawMsg;
                } else {
                  errMsg = rawMsg || errObj.error.message || errMsg;
                }
              }
            } catch(e) {}
            throw new Error(errMsg);
          });
        }
        return response.json();
      }
      window.handleGeminiResponseError = handleGeminiResponseError;

      window.openTeacherAiPromptModal = function() {
        window.location.href = "ai-studio.html";
      };
      window.setTeacherAiStyle = window.openTeacherAiPromptModal;

      window.saveTeacherAiPromptSetting = function() {
        var val = document.getElementById("teacher-ai-prompt-input")?.value || "";
        localStorage.setItem("tma_teacher_ai_style", val.trim());
        if (document.getElementById("teacher-ai-prompt-modal")) {
          document.getElementById("teacher-ai-prompt-modal").remove();
        }
        alert("✓ Đã lưu Prompt AI thành công! Tất cả các thao tác AI từ bây giờ sẽ lập tức áp dụng câu lệnh mới của bạn.");
      };

      window.autoOptimizeMathQuestion = function() {
        var qTextEl = document.getElementById("math-q-text");
        var explanationEl = document.getElementById("math-q-explanation");
        var diffSelect = document.getElementById("math-q-difficulty-select");
        var topicSelect = document.getElementById("math-single-qb-topic-select");
        
        var qText = qTextEl ? qTextEl.value : "";
        if (!qText.trim()) {
          alert("Vui lòng nhập nội dung câu hỏi Toán học vào ô nội dung trước khi yêu cầu AI tối ưu.");
          return;
        }
        
        var aiBtn = document.querySelector("#math-single-qb-controls button[onclick*='autoOptimizeMathQuestion']");
        var origHtml = aiBtn ? aiBtn.innerHTML : "";
        if (aiBtn) {
          aiBtn.disabled = true;
          aiBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>AI đang phân tích & giải đề...</span>
          `;
        }

        var qType = getQuestionDraft("math")?.question_type || "single_choice";
        
        var systemInstruction = "Bạn là chuyên gia thẩm định và tối ưu câu hỏi kỳ thi đánh giá tư duy TSA Bách Khoa Việt Nam. " +
          "Nhiệm vụ của bạn là đọc câu hỏi toán thô được gửi lên, tối ưu lại câu từ cho chuyên nghiệp và chuẩn mực sư phạm (nếu cần thiết, nếu không hãy giữ nguyên ý), " +
          "sau đó giải bài toán này từng bước một cách chặt chẽ, dễ hiểu. " +
          "Bạn cũng phải xác định chủ đề chuẩn SGK Toán phổ thông phù hợp nhất cho câu hỏi và xác định mức độ khó thích hợp (1: Dễ, 2: Trung bình, 3: Khó).\n\n" +
          "LƯU Ý ĐẶC BIỆT CHO CÁC DẠNG CÂU HỎI:\n" +
          "- Đây là câu hỏi thuộc loại '" + qType + "'.\n" +
          "- Nếu câu hỏi là dạng kéo thả (drag_drop), trong văn bản thô thường có một bảng (table) hoặc danh sách liệt kê các từ khóa/số dùng để lựa chọn kéo thả. Bạn BẮT BUỘC phải phát hiện và LOẠI BỎ hoàn toàn bảng hoặc danh sách các phương án đó khỏi trường \"optimized_question\". Chỉ giữ lại văn cảnh/mô tả câu hỏi, vì giao diện ứng dụng sẽ hiển thị các thẻ kéo này động ở dưới.\n\n" +
          "Đầu ra BẮT BUỘC là một đối tượng JSON chuẩn có cấu trúc sau, không chứa ký tự markdown hay văn bản ngoài JSON:\n" +
          "{\n" +
          "  \"optimized_question\": \"Nội dung câu hỏi đã tối ưu (giữ nguyên LaTeX nếu có)\",\n" +
          "  \"explanation\": \"Lời giải chi tiết từng bước, sử dụng LaTeX chuẩn (dùng \\\\dfrac cho phân số, \\\\limits cho giới hạn). Đối với các câu hỏi có nhiều ý nhỏ như Đúng/Sai hoặc các ô kéo thả, ở cuối lời giải bạn BẮT BUỘC phải chốt rõ kết luận đáp án của từng mệnh đề hoặc ô trống.\",\n" +
          "  \"difficulty\": 1 | 2 | 3,\n" +
          "  \"topic\": \"Khảo sát hàm số\" | \"Mũ và Lôgarit\" | \"Nguyên hàm & Tích phân\" | \"Số phức\" | \"Tổ hợp & Xác suất\" | \"Hình học không gian\" | \"Hình học giải tích Oxyz\" | \"Lượng giác\" | \"Dãy số & Cấp số\" | \"Vectơ & Hệ tọa độ\" | \"Phương trình & Hệ phương trình\"\n" +
          "}\n\n" +
          "LƯU Ý CỰC KỲ QUAN TRỌNG VỀ ĐỊNH DẠNG & LATEX:\n" +
          "- TUYỆT ĐỐI KHÔNG sử dụng ký tự dấu sao ** hay * để bôi đậm hay làm danh sách (vd: KHÔNG viết **Bước 1:** hay * Ý 1). Hãy dùng thẻ <strong>...</strong> cho các tiêu đề bước hoặc viết chữ thường 'Bước 1: ...'. Trình bày các bước rõ ràng và xuống dòng kép '\\n\\n' để tránh văn bản bị dính liền.\n" +
          "- Sử dụng ký hiệu \\\\( ... \\\\) cho công thức toán nội dòng (inline) và \\\\[ ... \\\\] cho công thức khối (display math).\n" +
          "- BẮT BUỘC escape ký tự gạch chéo ngược thành song song hai gạch chéo ngược (\\\\\\\\( ... \\\\\\\\) và \\\\\\\\[ ... \\\\\\\\]) trong chuỗi JSON để tránh lỗi cú pháp parse JSON.";

        var customStyle = localStorage.getItem("tma_teacher_ai_style");
        if (customStyle && customStyle.trim()) {
          systemInstruction += "\n\nPHONG CÁCH GIẢI BÀI VÀ TRÌNH BÀY CỦA GIÁO VIÊN (PHẢI TUÂN THỦ 100%):\n" + customStyle.trim();
        }

        window.setTeacherAiStyle = function() {
          var current = localStorage.getItem("tma_teacher_ai_style") || "";
          var val = prompt("Nhập phong cách / chỉ dẫn giải bài bạn muốn AI tuân theo (Ví dụ: 'Chia làm 3 bước: Giả thiết, Công thức, Thay số. Không dùng ký tự dấu sao **'):", current);
          if (val !== null) {
            localStorage.setItem("tma_teacher_ai_style", val.trim());
            alert("Đã lưu phong cách giải bài thành công! Tất cả câu hỏi AI tạo hoặc tối ưu sau này sẽ tự động tuân thủ phong cách này.");
          }
        };
          
        var requestPayload = {
          contents: [{
            parts: [{
              text: "Hãy tối ưu và lập lời giải chi tiết cho câu hỏi toán học sau:\n\n" + qText
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.15
          },
          systemInstruction: {
            parts: [{
              text: systemInstruction
            }]
          }
        };
        
        callGemini(requestPayload)
        .then(function(res) {
          return handleGeminiResponseError(res);
        })
        .then(function(data) {
          var textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          var result = safeParseGeminiJson(textResponse);
          
          if (qTextEl && result.optimized_question) {
            qTextEl.value = result.optimized_question;
          }
          if (explanationEl && result.explanation) {
            explanationEl.value = result.explanation;
          }
          if (diffSelect && result.difficulty) {
            diffSelect.value = String(result.difficulty);
            window.updateCurrentMathDifficulty(result.difficulty);
          }
          if (topicSelect && result.topic) {
            var exists = Array.from(topicSelect.options).some(function(opt) { return opt.value === result.topic; });
            if (!exists) {
              var newOpt = document.createElement("option");
              newOpt.value = result.topic;
              newOpt.textContent = result.topic;
              topicSelect.appendChild(newOpt);
            }
            topicSelect.value = result.topic;
          }
          
          if (typeof updatePreview === "function") {
            updatePreview("math");
          }
          
          alert("✓ AI đã tối ưu câu hỏi và viết lời giải chi tiết thành công!");
        })
        .catch(function(err) {
          console.error(err);
          alert("Có lỗi xảy ra khi gọi AI: " + err.message);
        })
        .finally(function() {
          if (aiBtn) {
            aiBtn.disabled = false;
            aiBtn.innerHTML = origHtml;
          }
        });
      };

      window.editQbQuestion = function(index, isStaged) {
        window.isEditingSingleQbQuestion = true;
        window.isEditingStagedQuestion = !!isStaged;
        window.stagedQuestionIndex = index;
        window.currentEditingSubject = "math";
        
        var targetQNo = (index !== undefined && index >= 0) ? (index + 1) : 1;
        window.startEditingExam("Ngân hàng câu hỏi Luyện đề ngẫu nhiên", "TMA_RANDOM_001", "math");
        
        if (isStaged) {
          var stagedMath = [];
          try { stagedMath = JSON.parse(localStorage.getItem("tma_tsa_staged_math") || "[]"); } catch(e) {}
          var q = stagedMath[index];
          if (q) {
            editingQuestion["math"] = { index: index, question: clone(q) };
            renderQuestionForm("math");
            updatePreview("math");
          }
        } else {
          if (typeof window.selectMathWizardQuestion === "function") {
            window.selectMathWizardQuestion(targetQNo);
          }
        }
        window.toggleSingleQuestionEditMode(true);
      };

      var activePreviewIndex = -1;
      
      window.previewQbQuestion = function(index) {
        activePreviewIndex = index;
        var targetCode = "TMA_RANDOM_001";
        var raw = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
        if (!raw) return;
        
        try {
          var examObj = JSON.parse(raw);
          var mathSec = examObj.sections.find(function(s) { return s.section_id === "math"; });
          if (!mathSec || !Array.isArray(mathSec.questions) || !mathSec.questions[index]) {
            alert("Không tìm thấy câu hỏi để xem trước!");
            return;
          }
          
          var q = mathSec.questions[index];
          
          // Render tags
          var diffEl = document.getElementById("preview-q-diff-badge");
          var topicEl = document.getElementById("preview-q-topic-badge");
          var typeEl = document.getElementById("preview-q-type-badge");
          
          var diff = Number(q.difficulty) || 1;
          if (diff === 3) {
            diffEl.innerHTML = "Mức 3 (Khó)";
            diffEl.style.cssText = "background: #ffe4e6; color: #c2272d; border: 1px solid #fecdd3; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px;";
          } else if (diff === 2) {
            diffEl.innerHTML = "Mức 2 (Trung bình)";
            diffEl.style.cssText = "background: #fef3c7; color: #d97706; border: 1px solid #fde68a; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px;";
          } else {
            diffEl.innerHTML = "Mức 1 (Dễ)";
            diffEl.style.cssText = "background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px;";
          }
          
          topicEl.textContent = "Chủ đề: " + (q.topic || "Toán đại cương");
          
          var qTypeLabel = "Trắc nghiệm đơn";
          if (q.question_type === "multiple_choice") qTypeLabel = "Trắc nghiệm nhiều đáp án";
          else if (q.question_type === "true_false") qTypeLabel = "Đúng/Sai";
          else if (q.question_type === "numeric_answer") qTypeLabel = "Điền số";
          else if (q.question_type === "drag_drop") qTypeLabel = "Kéo thả";
          typeEl.textContent = qTypeLabel;
          
          // Question text
          var qTextEl = document.getElementById("preview-q-text");
          qTextEl.innerHTML = q.question || "";
          
          // Options
          var optionsContainer = document.getElementById("preview-q-options-container");
          optionsContainer.innerHTML = "";
          
          if (q.question_type === "single_choice" || q.question_type === "multiple_choice" || !q.question_type) {
            var options = [];
            if (Array.isArray(q.options)) {
              options = q.options;
            } else if (q.options && typeof q.options === "object") {
              options = Object.keys(q.options).map(function(k) { return { key: k, text: q.options[k] }; });
            }
            
            options.forEach(function(opt) {
              var optRow = document.createElement("div");
              optRow.style.cssText = "display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; color: #334155; font-weight: 500; background: #ffffff; cursor: pointer; transition: all 0.15s;";
              
              var keyCircle = `<span style="width: 22px; height: 22px; border-radius: 50%; background: #f1f5f9; color: #475569; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11.5px; border: 1px solid #cbd5e1; flex-shrink: 0;">${opt.key}</span>`;
              
              var isCorrect = false;
              if (q.question_type === "multiple_choice") {
                isCorrect = Array.isArray(q.correct_answer) && q.correct_answer.indexOf(opt.key) !== -1;
              } else {
                isCorrect = q.correct_answer === opt.key;
              }
              
              optRow.setAttribute("data-correct", isCorrect ? "true" : "false");
              optRow.setAttribute("data-key", opt.key);
              optRow.innerHTML = keyCircle + `<div style="line-height: 1.6; flex-grow: 1;">${opt.text}</div>`;
              optionsContainer.appendChild(optRow);
            });
          } else if (q.question_type === "true_false") {
            var statements = q.statements || [];
            statements.forEach(function(stmt) {
              var stmtRow = document.createElement("div");
              stmtRow.style.cssText = "display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; background: #ffffff;";
              
              var correctVal = (q.correct_answer && q.correct_answer[stmt.id] !== undefined) ? q.correct_answer[stmt.id] : true;
              
              stmtRow.innerHTML = `
                <div style="font-weight: 600; color: #1e293b; line-height: 1.5;">[Mệnh đề ${stmt.id.toUpperCase()}] ${stmt.text}</div>
                <div style="display: flex; gap: 14px; margin-top: 4px;" data-stmt-id="${stmt.id}" data-correct-val="${correctVal}">
                  <span style="font-size: 12.5px; font-weight: 700; background: #f1f5f9; border: 1.5px solid #cbd5e1; padding: 4px 16px; border-radius: 6px; color: #475569; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">Đúng</span>
                  <span style="font-size: 12.5px; font-weight: 700; background: #f1f5f9; border: 1.5px solid #cbd5e1; padding: 4px 16px; border-radius: 6px; color: #475569; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">Sai</span>
                </div>
              `;
              optionsContainer.appendChild(stmtRow);
            });
          } else if (q.question_type === "numeric_answer") {
            var inputWrapper = document.createElement("div");
            inputWrapper.style.cssText = "padding: 10px 0;";
            inputWrapper.innerHTML = `
              <label style="font-size: 13px; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Đáp số của bạn:</label>
              <input class="input" type="text" placeholder="Nhập số..." disabled style="width: 200px; padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; background: #f8fafc; cursor: not-allowed; font-family: inherit;">
            `;
            optionsContainer.appendChild(inputWrapper);
          } else if (q.question_type === "drag_drop") {
            var dragBox = document.createElement("div");
            dragBox.style.cssText = "padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; background: #fafafa; font-size: 13.5px; line-height: 1.7; color: #334155;";
            var bodyText = "";
            if (Array.isArray(q.body)) {
              q.body.forEach(function(part) {
                if (part.type === "text") bodyText += part.content;
                else bodyText += `<span style="display: inline-block; width: 60px; height: 22px; border-bottom: 2px dashed #64748b; margin: 0 4px; vertical-align: middle; text-align: center; font-weight: 700; color: #1d4ed8;">[${part.id}]</span>`;
              });
            }
            dragBox.innerHTML = `
              <div style="font-weight: 600; margin-bottom: 8px; color: #475569;">Đoạn văn điền khuyết:</div>
              <div>${bodyText}</div>
            `;
            optionsContainer.appendChild(dragBox);
          }
          
          // Setup correct answer display value
          var correctValEl = document.getElementById("preview-q-correct-answer-value");
          var formattedAnswer = "A";
          if (q.correct_answer !== undefined && q.correct_answer !== null) {
            if (typeof q.correct_answer === "object") {
              if (Array.isArray(q.correct_answer)) {
                formattedAnswer = q.correct_answer.join(", ");
              } else {
                formattedAnswer = Object.keys(q.correct_answer).map(function(k) {
                  var v = q.correct_answer[k];
                  if (v === true) return k.toUpperCase() + ": Đúng";
                  if (v === false) return k.toUpperCase() + ": Sai";
                  return k.toUpperCase() + ": " + v;
                }).join("; ");
              }
            } else {
              formattedAnswer = String(q.correct_answer);
            }
          }
          correctValEl.textContent = formattedAnswer;
          
          // Setup explanation content
          var explEl = document.getElementById("preview-q-explanation-content");
          explEl.innerHTML = q.explanation || "Không có giải thích chi tiết.";
          
          // Reset explanation box state (hidden initially)
          var explanationBox = document.getElementById("preview-q-explanation-box");
          var toggleBtn = document.getElementById("preview-toggle-explanation-btn");
          var toggleText = document.getElementById("preview-toggle-text");
          explanationBox.style.display = "none";
          toggleBtn.style.background = "#fff5f6";
          toggleBtn.style.color = "#c2272d";
          toggleBtn.style.borderColor = "#fecdd3";
          if (toggleText) toggleText.textContent = "Hiện Đáp Án & Lời Giải Chi Tiết";
          
          // Show Preview Modal
          document.getElementById("modal-qb-preview").style.display = "flex";
          
          // Render MathJax to draw equations
          setTimeout(function() {
            if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
              window.MathJax.typesetPromise([qTextEl, optionsContainer, explEl]).catch(function(err){ console.error(err); });
            }
          }, 80);
          
        } catch(e) {
          console.error(e);
          alert("Lỗi xem trước: " + e.message);
        }
      };
      
      window.closeQbPreviewModal = function() {
        document.getElementById("modal-qb-preview").style.display = "none";
      };
      
      window.togglePreviewExplanation = function() {
        var box = document.getElementById("preview-q-explanation-box");
        var toggleBtn = document.getElementById("preview-toggle-explanation-btn");
        var toggleText = document.getElementById("preview-toggle-text");
        var isHidden = box.style.display === "none";
        
        if (isHidden) {
          box.style.display = "flex";
          toggleBtn.style.background = "#f0fdf4";
          toggleBtn.style.color = "#15803d";
          toggleBtn.style.borderColor = "#bbf7d0";
          if (toggleText) toggleText.textContent = "Ẩn Đáp Án & Lời Giải Chi Tiết";
          
          // Highlight correct choices in options container
          var qOptions = document.querySelectorAll("#preview-q-options-container > div");
          qOptions.forEach(function(optRow) {
            var isCorr = optRow.getAttribute("data-correct") === "true";
            var k = optRow.getAttribute("data-key");
            if (isCorr) {
              optRow.style.borderColor = "#22c55e";
              optRow.style.background = "#f0fdf4";
              var badge = optRow.querySelector("span");
              if (badge) {
                badge.style.background = "#22c55e";
                badge.style.color = "white";
                badge.style.borderColor = "#22c55e";
              }
            }
            
            // Highlight statement choices
            var stmtContainer = optRow.querySelector("div[data-stmt-id]");
            if (stmtContainer) {
              var corrVal = stmtContainer.getAttribute("data-correct-val") === "true";
              var choices = stmtContainer.querySelectorAll("span");
              if (choices.length === 2) {
                if (corrVal) {
                  choices[0].style.borderColor = "#22c55e";
                  choices[0].style.background = "#22c55e";
                  choices[0].style.color = "white";
                } else {
                  choices[1].style.borderColor = "#ef4444";
                  choices[1].style.background = "#ef4444";
                  choices[1].style.color = "white";
                }
              }
            }
          });
        } else {
          box.style.display = "none";
          toggleBtn.style.background = "#fff5f6";
          toggleBtn.style.color = "#c2272d";
          toggleBtn.style.borderColor = "#fecdd3";
          if (toggleText) toggleText.textContent = "Hiện Đáp Án & Lời Giải Chi Tiết";
          
          // Reset option displays
          var qOptions = document.querySelectorAll("#preview-q-options-container > div");
          qOptions.forEach(function(optRow) {
            optRow.style.borderColor = "#e2e8f0";
            optRow.style.background = "#ffffff";
            var badge = optRow.querySelector("span");
            if (badge) {
              badge.style.background = "#f1f5f9";
              badge.style.color = "#475569";
              badge.style.borderColor = "#cbd5e1";
            }
            
            // Reset statement choices
            var stmtContainer = optRow.querySelector("div[data-stmt-id]");
            if (stmtContainer) {
              var choices = stmtContainer.querySelectorAll("span");
              choices.forEach(function(c) {
                c.style.borderColor = "#cbd5e1";
                c.style.background = "#f1f5f9";
                c.style.color = "#475569";
              });
            }
          });
        }
      };

      window.previewRandomExamAsStudent = function() {
        if (typeof window.generateRandomTSAExam === "function") {
          window.generateRandomTSAExam("TMA_RANDOM_001");
        }
        if (typeof window.startExamDirectly === "function") {
          window.startExamDirectly("Phòng Luyện Đề Ngẫu Nhiên", "waiting.html?exam=TMA_RANDOM_001");
        } else if (typeof window.startDirectExamRandom === "function") {
          window.startDirectExamRandom("TMA_RANDOM_001");
        } else {
          window.open("waiting.html?exam=TMA_RANDOM_001", "_blank");
        }
      };

      window.updateCurrentMathDifficulty = function(val) {
        var q = getQuestionDraft("math");
        if (q) q.difficulty = Number(val);
      };

      window.autoClassifyMathQuestionForm = function() {
        var txt = document.getElementById("math-q-text")?.value || "";
        var selectEl = document.getElementById("math-q-difficulty-select");
        var topicEl = document.getElementById("math-single-qb-topic-select");
        
        if (!txt.trim()) {
          alert("Vui lòng nhập nội dung câu hỏi trước khi phân loại.");
          return;
        }

        var aiBtn = document.querySelector("button[onclick*='autoClassifyMathQuestionForm']");
        var origHtml = aiBtn ? aiBtn.innerHTML : "";
        if (aiBtn) {
          aiBtn.disabled = true;
          aiBtn.innerHTML = `⏳ AI Phân tích...`;
        }

        var systemInstruction = "Bạn là chuyên gia khảo thí kì thi đánh giá tư duy TSA Bách Khoa Việt Nam. " +
          "Nhiệm vụ của bạn là phân tích câu hỏi toán học được gửi lên để xác định chủ đề chuẩn SGK Toán phổ thông phù hợp nhất và mức độ khó của nó.\n" +
          "Chủ đề BẮT BUỘC phải là một trong các giá trị sau:\n" +
          "\"Khảo sát hàm số\", \"Mũ và Lôgarit\", \"Nguyên hàm & Tích phân\", \"Số phức\", \"Tổ hợp & Xác suất\", \"Hình học không gian\", \"Hình học giải tích Oxyz\", \"Lượng giác\", \"Dãy số & Cấp số\", \"Vectơ & Hệ tọa độ\", \"Phương trình & Hệ phương trình\".\n" +
          "Độ khó BẮT BUỘC là 1 (Dễ), 2 (Trung bình) hoặc 3 (Khó).\n" +
          "QUY TẮC BẮT BUỘC KHI VIẾT LỜI GIẢI (\"explanation\") - TRÌNH BÀY NHƯ BÀI THI THẬT:\n" +
          "1. TUYỆT ĐỐI KHÔNG DÙNG KÝ TỰ RÁC:\n" +
          "   - TUYỆT ĐỐI KHÔNG dùng dấu sao (*) hoặc (**) trong bất kỳ câu chữ hay công thức nào.\n" +
          "   - TUYỆT ĐỐI KHÔNG chèn icon/emoji (như 🎯, 📘, 💡, 🤖...).\n" +
          "2. BẮT BUỘC XUỐNG DÒNG RÕ RÀNG CHO TỪNG Ý VÀ TỪNG BƯỚC:\n" +
          "   - Mặc định chia lời giải thành các bước đánh số rõ ràng: 1. ..., 2. ..., 3. ...\n" +
          "   - Trước MỖI số thứ tự bước (2., 3., 4....) BẮT BUỘC phải xuống dòng bằng \\n\\n.\n" +
          "   - Các ý gạch đầu dòng chi tiết bên trong từng bước BẮT BUỘC xuống dòng riêng bằng \\n.\n" +
          "3. CHUẨN NĂNG LỰC TOÁN VÀ LATEX TSA:\n" +
          "   - Dùng \\( ... \\) cho các biến số, công thức ngắn, đơn vị (ví dụ: \\(P = 32{,}6\\text{ kW}\\)).\n" +
          "   - KHÔNG chèn \\displaystyle vào trong \\( ... \\).\n" +
          "   - Dùng \\dfrac cho phân số và \\cdot cho dấu nhân.\n" +
          "   - Số thập phân dùng dấu phẩy theo chuẩn Việt Nam (32,6 thay vì 32.6).\n" +
          "Đầu ra duy nhất là một đối tượng JSON có định dạng:\n" +
          "{\n" +
          "  \"topic\": \"chủ đề\",\n" +
          "  \"difficulty\": 1 | 2 | 3\n" +
          "}";

        var requestPayload = {
          contents: [{
            parts: [{
              text: "Hãy phân tích câu hỏi toán sau và trả về JSON chủ đề, độ khó:\n\n" + txt
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          },
          systemInstruction: {
            parts: [{
              text: systemInstruction
            }]
          }
        };

        callGemini(requestPayload)
        .then(function(res) {
          return handleGeminiResponseError(res);
        })
        .then(function(data) {
          var textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          var result = safeParseGeminiJson(textResponse);
          
          if (selectEl && result.difficulty) {
            selectEl.value = String(result.difficulty);
            window.updateCurrentMathDifficulty(result.difficulty);
          }
          if (topicEl && result.topic) {
            var exists = Array.from(topicEl.options).some(function(opt) { return opt.value === result.topic; });
            if (!exists) {
              var newOpt = document.createElement("option");
              newOpt.value = result.topic;
              newOpt.textContent = result.topic;
              topicEl.appendChild(newOpt);
            }
            topicEl.value = result.topic;
          }
          
          alert("✓ AI đã phân tích chủ đề và độ khó thành công!");
        })
        .catch(function(err) {
          console.error(err);
          var level = 1;
          var topic = "Khảo sát hàm số";
          if (txt.includes("\\int") || txt.includes("\\lim") || txt.includes("phương trình mặt phẳng") || txt.includes("biện luận")) {
            level = 3;
            topic = txt.includes("phương trình mặt phẳng") ? "Hình học giải tích Oxyz" : "Nguyên hàm & Tích phân";
          } else if (txt.includes("xác suất") || txt.includes("tổ hợp") || txt.includes("chọn")) {
            level = 2;
            topic = "Tổ hợp & Xác suất";
          }
          if (selectEl) { selectEl.value = String(level); window.updateCurrentMathDifficulty(level); }
          if (topicEl) topicEl.value = topic;
          alert("AI chưa phản hồi. Hệ thống đã phân loại tạm bằng quy tắc; vui lòng kiểm tra lại chủ đề và độ khó.");
        })
        .finally(function() {
          if (aiBtn) {
            aiBtn.disabled = false;
            aiBtn.innerHTML = origHtml;
          }
        });
      };

      window.switchQbMode = function(mode) {
        var btnAi = document.getElementById("qb-tab-ai");
        var btnManual = document.getElementById("qb-tab-manual");
        var boxAi = document.getElementById("qb-mode-ai-box");
        var formManual = document.getElementById("question-bank-form");

        if (mode === "ai") {
          if (btnAi) { btnAi.style.background = "#c2272d"; btnAi.style.color = "white"; btnAi.style.border = "none"; }
          if (btnManual) { btnManual.style.background = "white"; btnManual.style.color = "#475569"; btnManual.style.border = "1.5px solid #cbd5e1"; }
          if (boxAi) boxAi.style.display = "flex";
          if (formManual) formManual.style.display = "none";
        } else {
          if (btnManual) { btnManual.style.background = "#c2272d"; btnManual.style.color = "white"; btnManual.style.border = "none"; }
          if (btnAi) { btnAi.style.background = "white"; btnAi.style.color = "#475569"; btnAi.style.border = "1.5px solid #cbd5e1"; }
          if (formManual) formManual.style.display = "flex";
          if (boxAi) boxAi.style.display = "none";
        }
      };

      window.onQbSubjectChange = function() {
        var subj = document.getElementById("qb-subject")?.value || "math";
        var passageWrap = document.getElementById("qb-passage-wrapper");
        var diffWrap = document.getElementById("qb-difficulty-wrapper");

        if (subj === "reading" || subj === "science") {
          if (passageWrap) passageWrap.style.display = "flex";
          if (diffWrap) diffWrap.style.display = "none";
        } else {
          if (passageWrap) passageWrap.style.display = "none";
          if (diffWrap) diffWrap.style.display = "block";
        }
      };

      window.processAiSmartExtract = function() {
        var rawText = document.getElementById("qb-ai-raw-text")?.value || "";
        var statusEl = document.getElementById("qb-ai-status");

        if (!rawText.trim()) {
          alert("Vui lòng dán nội dung bài đọc hoặc câu hỏi trước khi chạy AI.");
          return;
        }

        var cleanInput = rawText.trim();
        var isDirectJson = false;
        var directParsed = null;
        if (cleanInput.startsWith("{") && cleanInput.endsWith("}")) {
          try {
            directParsed = JSON.parse(cleanInput);
            isDirectJson = true;
          } catch(e) {
            try {
              directParsed = safeParseGeminiJson(cleanInput);
              if (directParsed && (directParsed.section_id || directParsed.exam_code)) {
                isDirectJson = true;
              }
            } catch(err) {}
          }
        }

        if (isDirectJson && directParsed) {
          try {
            var targetCode = "TMA_RANDOM_001";
            var examObj = null;
            var stored = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
            if (stored) {
              try { examObj = JSON.parse(stored); } catch(e) {}
            }
            if (!examObj || !Array.isArray(examObj.sections)) {
              examObj = {
                exam_code: targetCode,
                title: "Ngân hàng câu hỏi Luyện đề ngẫu nhiên",
                duration_minutes: 150,
                status: "published",
                sections: [
                  { section_id: "math", section_label: "Tư duy Toán học", questions: [] },
                  { section_id: "reading", section_label: "Tư duy Đọc hiểu", groups: [] },
                  { section_id: "science", section_label: "Tư duy Khoa học", groups: [] }
                ]
              };
            }

            var sectionId = directParsed.section_id || "math";
            if (sectionId === "math") {
              var list = directParsed.questions || [];
              if (directParsed.data && Array.isArray(directParsed.data.questions)) {
                list = directParsed.data.questions;
              }
              var stagedMath = [];
              try { stagedMath = JSON.parse(localStorage.getItem("tma_tsa_staged_math") || "[]"); } catch(e) {}
              var addedCount = 0;
              list.forEach(function(newQ) {
                stagedMath.push(newQ);
                addedCount++;
              });
              localStorage.setItem("tma_tsa_staged_math", JSON.stringify(stagedMath));

              if (statusEl) {
                statusEl.style.display = "block";
                statusEl.style.color = "#166534";
                statusEl.textContent = "✅ Đã nạp thành công vào hàng chờ duyệt " + addedCount + " câu hỏi Toán học!";
              }
            } else if (sectionId === "reading" || sectionId === "science") {
              var stagedGroups = [];
              try { stagedGroups = JSON.parse(localStorage.getItem("tma_tsa_staged_" + sectionId) || "[]"); } catch(e) {}

              var addedGroups = 0;
              var sourceGroups = [];
              if (Array.isArray(directParsed.groups)) {
                sourceGroups = directParsed.groups;
              } else if (directParsed.data && directParsed.data.group) {
                sourceGroups = [directParsed.data.group];
              } else if (directParsed.group) {
                sourceGroups = [directParsed.group];
              }

              sourceGroups.forEach(function(g) {
                var newGroup = {
                  group_id: g.group_id || ("g_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)),
                  title: g.title || "Tiêu đề bài đọc",
                  passage: g.passage || (g.stimulus ? g.stimulus.content : "") || "",
                  questions: g.questions || []
                };
                if (g.stimulus) {
                  newGroup.stimulus = Object.assign({}, g.stimulus);
                } else {
                  newGroup.stimulus = {
                    type: "text",
                    content: newGroup.passage,
                    image_url: g.image_url || g.passage_image_url || "",
                    image_width: g.image_width || 100
                  };
                }
                if (g.passage_image_url) {
                  newGroup.passage_image_url = g.passage_image_url;
                } else if (newGroup.stimulus.image_url) {
                  newGroup.passage_image_url = newGroup.stimulus.image_url;
                }
                stagedGroups.push(newGroup);
                addedGroups++;
              });
              localStorage.setItem("tma_tsa_staged_" + sectionId, JSON.stringify(stagedGroups));

              if (statusEl) {
                statusEl.style.display = "block";
                statusEl.style.color = "#166534";
                statusEl.textContent = "✅ Đã nạp thành công vào hàng chờ duyệt " + addedGroups + " ngữ liệu!";
              }
            } else {
              throw new Error("Không xác định được môn thi (section_id).");
            }

            document.getElementById("qb-ai-raw-text").value = "";
            window.currentQbViewMode = "staged"; // Automatically switch to Staged tab!
            setTimeout(function() {
              if (typeof renderPracticeRoom === "function") renderPracticeRoom();
            }, 800);

            return;
          } catch(err) {
            if (statusEl) {
              statusEl.style.display = "block";
              statusEl.style.color = "#ef4444";
              statusEl.textContent = "❌ Lỗi đọc JSON: " + err.message;
            }
            return;
          }
        }

        if (statusEl) {
          statusEl.style.display = "block";
          statusEl.style.color = "#2563eb";
          statusEl.textContent = "⏳ AI đang phân tích, giải đề và phân loại độ khó...";
        }

        var systemInstruction = `Bạn là một trợ lý AI EdTech chuyên khảo thí và xây dựng câu hỏi cho kỳ thi đánh giá tư duy TSA Bách Khoa.\nNhiệm vụ của bạn là phân tích và chuyển đổi văn bản thô (có thể là câu hỏi Toán học độc lập hoặc một ngữ liệu Đọc hiểu / Khoa học kèm các câu hỏi đi kèm) thành định dạng JSON có cấu trúc chuẩn xác 100%.\n- KHÔNG tự động chèn \\displaystyle vào bên trong \\( ... \\).\n- Với các phép tính phân số: sử dụng \\dfrac thay vì \\frac; dấu nhân dùng \\cdot hoặc \\times; đơn vị dùng \\text{...} (ví dụ: \\text{J/s}, \\text{K/s}).\n- Các ký tự Hy Lạp: \\Delta, \\alpha, \\beta, \\pi.\n- LƯU Ý ĐỐI VỚI DẠNG KÉO THẢ (drag_drop): Nếu đề bài gốc có một bảng hoặc danh sách liệt kê các từ khóa/số dùng để kéo thả, bạn BẮT BUỘC phải loại bỏ hoàn toàn bảng hoặc danh sách đó khỏi trường "question" (chỉ định nghĩa chúng ở mảng "items") để tránh trùng lặp hiển thị.
- ĐỐI VỚI CÂU HỎI ĐIỀN CHỮ TỰ DO (fill_blank): Dùng dạng này khi đề bài yêu cầu điền từ/cụm từ hoặc số tự do vào ô trống trong đoạn văn hoặc câu hỏi (học sinh tự gõ từ bàn phím, không có thẻ từ kéo thả). Trường "question" chứa văn bản có ký hiệu ô trống [o1], [o2]... và trường "correct_answer" có dạng chuỗi "o1=đáp_án_1 | o2=đáp_án_2" hoặc đáp án đơn. KHÔNG tạo mảng "items" hay "body" cho loại này.
- ĐỐI VỚI CÂU HỎI KÉO THẢ (drag_drop): Chỉ dùng dạng này khi đề bài có hộp/danh sách từ lựa chọn để kéo thả vào ô trống. Bắt buộc tạo mảng "items" chứa các từ lựa chọn kéo thả.
- TUYỆT ĐỐI KHÔNG loại bỏ các ký hiệu đánh dấu số đoạn văn dạng [0], [1], [2], [3]... ở đầu các đoạn văn trong ngữ liệu nền (passage). Bạn BẮT BUỘC phải giữ nguyên chúng và bôi đậm chúng bằng thẻ <strong>[0]</strong>, <strong>[1]</strong>, <strong>[2]</strong>...\n- Viết Lời giải chi tiết ("explanation") chia thành các bước rõ ràng. TUYỆT ĐỐI KHÔNG dùng dấu sao ** hay * để bôi đậm hay làm danh sách (hãy dùng thẻ HTML <strong>...</strong> hoặc viết chữ thường 'Bước 1: ...'). Trình bày các bước rõ ràng và xuống dòng bằng hai ký tự xuống dòng kép '\\n\\n' để tránh dính liền văn bản. Đối với các câu hỏi có nhiều ý nhỏ như Đúng/Sai (true_false) hoặc các ô kéo thả (drag_drop), ở cuối lời giải bạn BẮT BUỘC phải chốt rõ kết luận đáp án của từng mệnh đề hoặc ô trống rõ ràng.

Cấu trúc JSON đầu ra yêu cầu duy nhất:
{
  "section_id": "math" | "reading" | "science",
  "data": {
    "questions": [
      {
        "question_no": 1,
        "question_type": "single_choice" | "multiple_choice" | "true_false" | "numeric_answer" | "drag_drop",
        "question": "Nội dung câu hỏi Toán...",
        "options": [
          { "key": "A", "text": "Phương án A" },
          { "key": "B", "text": "Phương án B" },
          { "key": "C", "text": "Phương án C" },
          { "key": "D", "text": "Phương án D" }
        ],
        "correct_answer": "A" | ["A", "B"] | { "a": true, "b": false } | 12.5,
        "difficulty": 1 | 2 | 3,
        "topic": "Chủ đề Toán học...",
        "explanation": "Lời giải từng bước chi tiết..."
      }
    ],
    "group": {
      "title": "Tiêu đề bài đọc",
      "passage": "Văn bản ngữ liệu nền...",
      "questions": [
        {
          "question_no": 1,
          "question_type": "single_choice",
          "question": "Câu hỏi số 1...",
          "options": [
            { "key": "A", "text": "..." }
          ],
          "correct_answer": "A",
          "explanation": "Lời giải chi tiết..."
        }
      ]
    }
  }
}`;

        var smartExtractSchema = {
          type: "OBJECT",
          properties: {
            section_id: { type: "STRING", enum: ["math", "reading", "science"] },
            data: {
              type: "OBJECT",
              properties: {
                questions: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      question_no: { type: "INTEGER" },
                      question_type: { type: "STRING", enum: ["single_choice", "multiple_choice", "true_false", "numeric_answer", "drag_drop", "fill_blank"] },
                      question: { type: "STRING" },
                      options: {
                        type: "ARRAY",
                        items: {
                          type: "OBJECT",
                          properties: {
                            key: { type: "STRING" },
                            text: { type: "STRING" }
                          },
                          required: ["key", "text"]
                        }
                      },
                      correct_answer: { type: "STRING" },
                      difficulty: { type: "INTEGER" },
                      topic: { type: "STRING" },
                      explanation: { type: "STRING" }
                    },
                    required: ["question_no", "question_type", "question", "difficulty", "topic", "explanation"]
                  }
                },
                group: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    passage: { type: "STRING" },
                    questions: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          question_no: { type: "INTEGER" },
                          question_type: { type: "STRING", enum: ["single_choice", "multiple_choice", "true_false", "numeric_answer", "drag_drop", "fill_blank"] },
                          question: { type: "STRING" },
                          options: {
                            type: "ARRAY",
                            items: {
                              type: "OBJECT",
                              properties: {
                                key: { type: "STRING" },
                                text: { type: "STRING" }
                              },
                              required: ["key", "text"]
                            }
                          },
                          correct_answer: { type: "STRING" },
                          explanation: { type: "STRING" }
                        },
                        required: ["question_no", "question_type", "question", "explanation"]
                      }
                    }
                  },
                  required: ["title", "passage", "questions"]
                }
              }
            }
          },
          required: ["section_id", "data"]
        };

        var promptText = systemInstruction + "\n\nNỘI DUNG VĂN BẢN CẦN PHÂN TÍCH:\n" + rawText;
        var payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: promptText }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: smartExtractSchema
          }
        };

        callGemini(payload)
        .then(function(response) {
          return handleGeminiResponseError(response);
        })
        .then(function(resData) {
          var jsonText = resData.candidates[0].content.parts[0].text;
          var result = safeParseGeminiJson(jsonText);
          
          if (result.section_id === "math") {
            var stagedMath = [];
            try { stagedMath = JSON.parse(localStorage.getItem("tma_tsa_staged_math") || "[]"); } catch(e) {}
            var addedCount = 0;
            if (result.data && Array.isArray(result.data.questions)) {
              result.data.questions.forEach(function(newQ) {
                stagedMath.push(newQ);
                addedCount++;
              });
            }
            localStorage.setItem("tma_tsa_staged_math", JSON.stringify(stagedMath));
            
            if (statusEl) {
              statusEl.style.color = "#166534";
              statusEl.textContent = "✅ Đã nạp thành công vào hàng chờ duyệt " + addedCount + " câu hỏi Toán học!";
            }
          } else if (result.section_id === "reading" || result.section_id === "science") {
            var secId = result.section_id;
            var stagedGroups = [];
            try { stagedGroups = JSON.parse(localStorage.getItem("tma_tsa_staged_" + secId) || "[]"); } catch(e) {}

            if (result.data && result.data.group) {
              var newGroup = result.data.group;
              newGroup.group_id = "g_" + Date.now();
              stagedGroups.push(newGroup);
              localStorage.setItem("tma_tsa_staged_" + secId, JSON.stringify(stagedGroups));
              
              if (statusEl) {
                statusEl.style.color = "#166534";
                statusEl.textContent = "✅ Đã nạp thành công vào hàng chờ duyệt Ngữ liệu nền kèm câu hỏi!";
              }
            } else {
              throw new Error("Dữ liệu ngữ liệu từ AI không đúng cấu trúc.");
            }
          } else {
            throw new Error("Không xác định được môn thi (section_id).");
          }

          document.getElementById("qb-ai-raw-text").value = "";
          window.currentQbViewMode = "staged"; // Automatically switch to Staged tab!
          setTimeout(function() {
            if (typeof renderPracticeRoom === "function") renderPracticeRoom();
          }, 800);

        })
        .catch(function(error) {
          console.error(error);
          if (statusEl) {
            statusEl.style.color = "#ef4444";
            statusEl.textContent = "❌ Lỗi: " + error.message;
          }
        });
      };

      window.changeTmaGeminiApiKey = function() {
        window.location.href = "ai-studio.html";
      };

      // One-time cleanup for TMA_RANDOM_001 junk data
      (function() {
        try {
          var targetCode = "TMA_RANDOM_001";
          var raw = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
          if (raw) {
            var examObj = JSON.parse(raw);
            if (examObj && Array.isArray(examObj.sections)) {
              var mathSec = examObj.sections.find(function(s) { return s.section_id === "math"; });
              if (mathSec && Array.isArray(mathSec.questions)) {
                var initialLength = mathSec.questions.length;
                var uniqueTexts = new Set();
                mathSec.questions = mathSec.questions.filter(function(q) {
                  if (!q) return false;
                  var text = String(q.question || q.content || "").trim().toLowerCase();
                  if (text.includes("uttewrt") || text.includes("wertwert") || text.includes("werlert") || text.includes("tma007")) {
                    return false;
                  }
                  if (uniqueTexts.has(text)) {
                    return false;
                  }
                  uniqueTexts.add(text);
                  return true;
                });
                
                // Re-index question_no
                mathSec.questions.forEach(function(q, i) {
                  q.question_no = i + 1;
                });

                if (mathSec.questions.length !== initialLength) {
                  localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
                  localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
                }
              }
            }
          }
        } catch(e) {}
      })();

      // Paste & Drag-Drop direct upload handlers for all textareas in the editor
      function uploadAndInsertImage(textarea, rawFile) {
        // Insert loading placeholder
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var text = textarea.value;
        var placeholder = "[IMG: Tải ảnh...]";
        textarea.value = text.substring(0, start) + placeholder + text.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        textarea.dispatchEvent(new Event('input')); // Update draft/preview

        compressImage(rawFile).then(function(file) {
          var examCode = (window.exam && window.exam.exam_code) || 
                         new URLSearchParams(window.location.search).get("exam") || 
                         window.currentExamCode || 
                         "temp";
          examCode = String(examCode).trim().replace(/_TEACHER_DRAFT/g, "");

          return uploadToR2(file, "passages/" + examCode, Date.now() + ".jpg")
            .then(function(publicUrl) {
              // Replace placeholder with final tag
              var updatedText = textarea.value;
              var finalTag = "[IMG: " + publicUrl + "]";
              textarea.value = updatedText.replace(placeholder, finalTag);
              textarea.dispatchEvent(new Event('input')); // Trigger update
            });
        }).catch(function(err) {
          console.error("Paste image upload error:", err);
          var updatedText = textarea.value;
          textarea.value = updatedText.replace(placeholder, "[Lỗi tải ảnh]");
          textarea.dispatchEvent(new Event('input'));
          alert("Lỗi tải ảnh lên: " + (err.message || err));
        });
      }

      document.addEventListener('paste', function(e) {
        var target = e.target;
        if (target && target.tagName === 'TEXTAREA') {
          var items = (e.clipboardData || e.originalEvent.clipboardData).items;
          for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') === 0) {
              var file = items[i].getAsFile();
              if (file) {
                e.preventDefault();
                uploadAndInsertImage(target, file);
              }
            }
          }
        }
      }, true);

      document.addEventListener('dragover', function(e) {
        var target = e.target;
        if (target && target.tagName === 'TEXTAREA') {
          var hasFiles = false;
          if (e.dataTransfer && e.dataTransfer.types) {
            for (var i = 0; i < e.dataTransfer.types.length; i++) {
              if (e.dataTransfer.types[i] === 'Files') {
                hasFiles = true;
                break;
              }
            }
          }
          if (hasFiles) {
            e.preventDefault();
          }
        }
      }, true);

      document.addEventListener('drop', function(e) {
        var target = e.target;
        if (target && target.tagName === 'TEXTAREA') {
          var files = e.dataTransfer.files;
          if (files && files.length > 0) {
            var file = files[0];
            if (file.type.indexOf('image') === 0) {
              e.preventDefault();
              uploadAndInsertImage(target, file);
            }
          }
        }
      }, true);

    })();
