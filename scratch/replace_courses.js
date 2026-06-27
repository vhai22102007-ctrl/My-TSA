const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'select-page.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find start marker
const startMarker = '// ─── DYNAMIC COURSE REGISTRATION ENGINE ────────────────────────────';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Could not find start marker in js/select-page.js!");
  process.exit(1);
}

// Find end marker
const endMarker = 'function getRegisteredCourseIds()';
const endIndex = content.indexOf(endMarker);
if (endIndex === -1) {
  console.error("Could not find end marker in js/select-page.js!");
  process.exit(1);
}

// The replacement content
const replacement = `// DYNAMIC COURSE REGISTRATION & SUPABASE SYNC ENGINE
      const MOCK_COURSES_DEFAULTS = [
        {
          id: "thpt-math-luyen-de",
          label: "Luyện Đề THPT",
          title: "Khoá Luyện Đề THPT Môn Toán",
          subheading: "Luyện đề thi thử tốt nghiệp THPT Quốc gia bám sát cấu trúc đề minh họa mới nhất.",
          desc: "Học sinh được làm đề bấm giờ, xem lời giải chi tiết bằng video và tải bản viết tay.",
          author: "Trần Hoàng Anh",
          tags: ["Toán học", "THPTQG"],
          badge: "Chưa mua",
          category: "THPT",
          lessons: [
            { title: "Chữa Đề Tăng Tốc Số 3", type: "video", video_drive_id: "17l2lP-G4mH0l9X2X1l1X1l1X1l1X1l1", preview_allowed: true },
            { title: "File Đề Tăng Tốc Số 3", type: "pdf", doc_link: "https://example.com/de-thi.pdf", preview_allowed: true },
            { title: "Bản Viết Tay Để Tăng Tốc Số 3", type: "write", doc_link: "https://example.com/bvt.pdf", preview_allowed: true },
            { title: "Chữa Đề Tăng Tốc Số 4", type: "video", video_drive_id: "17l2lP-G4mH0l9X2X1l1X1l1X1l1X1l2" },
            { title: "Đề Tăng Tốc Số 4", type: "pdf", doc_link: "https://example.com/de-thi-4.pdf" },
            { title: "BVT: Đề Tăng Tốc Số 4", type: "write", doc_link: "https://example.com/bvt-4.pdf" },
            { title: "Chữa Đề Tăng Tốc Số 5", type: "video", video_drive_id: "17l2lP-G4mH0l9X2X1l1X1l1X1l1X1l3" },
            { title: "File Đề Tăng Tốc Số 5", type: "pdf", doc_link: "https://example.com/de-thi-5.pdf" },
            { title: "BVT Đề Tăng Tốc Số 5", type: "write", doc_link: "https://example.com/bvt-5.pdf" }
          ],
          progress: 33
        },
        {
          id: "01",
          label: "TSA Core",
          title: "Nền tảng Toán TSA",
          subheading: "Gỡ mạch tư duy Toán, dựng lại cách đọc đề và xử lý dữ kiện nhiều bước.",
          desc: "Học chắc các dạng nền tảng, rèn phản xạ phân tích trước khi vào đề tổng hợp.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Toán tư duy", "TSA"],
          badge: "Toán",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Tư duy giải Toán và phản xạ đọc đề", status: "completed" },
            { title: "Bài 2: Các dạng toán định lượng trọng tâm", status: "completed" },
            { title: "Bài 3: Phân tích số liệu và giải thích biểu đồ", status: "pending" },
            { title: "Bài 4: Đề thi khảo sát năng lực số 1", status: "pending" }
          ],
          progress: 50
        },
        {
          id: "02",
          label: "Physics",
          title: "Nền tảng Vật lý THPT",
          subheading: "Hiểu công thức theo bản chất, không học vẹt và không phụ thuộc mẹo nhớ.",
          desc: "Tập trung hiện tượng, đồ thị, phương pháp lập luận và các dạng bài trọng tâm.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Vật lý 10-12", "THPT"],
          badge: "Vật lý",
          category: "THPT",
          lessons: [
            { title: "Bài 1: Dao động điều hòa và hiện tượng thực tế", status: "completed" },
            { title: "Bài 2: Các phương pháp lập luận Vật lý", status: "pending" },
            { title: "Bài 3: Đọc đồ thị dao động và bài toán du lịch", status: "pending" }
          ],
          progress: 33
        },
        {
          id: "03",
          label: "Practice",
          title: "Tổng ôn TSA",
          subheading: "Ôn theo cụm năng lực, vừa hệ thống kiến thức vừa luyện nhịp làm bài.",
          desc: "Mỗi buổi đều có phần chữa lỗi tư duy để học sinh biết mình đang kẹt ở đâu.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Tổng ôn", "Luyện đề"],
          badge: "TSA",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Tổng ôn chuyên đề Định lượng", status: "completed" },
            { title: "Bài 2: Tổng ôn chuyên đề Định tính", status: "completed" },
            { title: "Bài 3: Tổng ôn chuyên đề Khoa học", status: "completed" },
            { title: "Bài 4: Đề thi tổng hợp TSA đợt 1", status: "pending" }
          ],
          progress: 75
        },
        {
          id: "04",
          label: "Sprint 1",
          title: "Về đích TSA đợt 1",
          subheading: "Chạy lại nền tảng nhanh, khóa lỗ hổng và làm quen format đề thi.",
          desc: "Phù hợp khi cần khởi động lại lộ trình trước giai đoạn tăng tốc.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Về đích", "Đợt 1"],
          badge: "TSA",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Khởi động lộ trình và kiểm tra lỗ hổng", status: "completed" },
            { title: "Bài 2: Luyện đề thi thử TSA đợt 1", status: "pending" }
          ],
          progress: 50
        },
        {
          id: "05",
          label: "Sprint 2",
          title: "Về đích TSA đợt 2",
          subheading: "Luyện đề có chiến thuật, ưu tiên tốc độ đọc hiểu và độ chắc khi chọn đáp án.",
          desc: "Tập trung các dạng dễ mất điểm và cách kiểm soát thời gian trong phòng thi.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Về đích", "Đợt 2"],
          badge: "TSA",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Chiến thuật kiểm soát thời gian", status: "pending" },
            { title: "Bài 2: Các dạng bài dễ mất điểm trong TSA", status: "pending" }
          ],
          progress: 0
        },
        {
          id: "06",
          label: "Sprint 3",
          title: "Về đích TSA đợt 3",
          subheading: "Tăng cường đề tổng hợp, sửa lỗi cá nhân và chốt chiến thuật trước ngày thi.",
          desc: "Đi sâu vào các câu phân loại để học sinh biết cách giữ điểm và kéo điểm.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Về đích", "Đợt 3"],
          badge: "TSA",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Phân tích câu hỏi phân loại điểm 9-10", status: "pending" },
            { title: "Bài 2: Đề tổng hợp cuối cùng trước kì thi", status: "pending" }
          ],
          progress: 0
        },
        {
          id: "07",
          label: "HSA Core",
          title: "Nền tảng HSA toàn diện",
          subheading: "Hệ thống kiến thức Đánh giá năng lực HSA ĐHQGHN.",
          desc: "Tập trung các câu hỏi trắc nghiệm đa lựa chọn, điền số và đọc hiểu tư duy định tính/định lượng.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["ĐGNL", "HSA", "Toàn diện"],
          badge: "HSA",
          category: "HSA",
          lessons: [
            { title: "Bài 1: Cấu trúc đề thi HSA và phương pháp ôn luyện", status: "completed" },
            { title: "Bài 2: Tư duy định lượng trong đề HSA", status: "pending" },
            { title: "Bài 3: Đọc hiểu và giải quyết vấn đề định tính", status: "pending" }
          ],
          progress: 33
        },
        {
          id: "08",
          label: "HSA Practice",
          title: "Luyện đề thi thử HSA",
          subheading: "Luyện các bộ đề thi thử HSA sát với đề thi thực tế nhất.",
          desc: "Rèn luyện tốc độ làm 150 câu hỏi trong 195 phút dưới áp lực thời gian thực tế.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Luyện đề", "HSA", "Thi thử"],
          badge: "HSA",
          category: "HSA",
          lessons: [
            { title: "Đề thi thử HSA số 1 - Tổng hợp", status: "pending" },
            { title: "Đề thi thử HSA số 2 - Tổng hợp", status: "pending" }
          ],
          progress: 0
        },
        {
          id: "vact-online",
          title: "Thi thử Bài thi Đánh giá năng lực VACT",
          category: "VACT",
          typeBadge: "Thi trực tuyến",
          isOnline: true,
          regTime: "Hằng ngày",
          fee: "Miễn phí",
          examTime: "Hằng ngày",
          status: "online",
          actionUrl: "waiting.html",
          actionText: "Vào thi ngay",
          uploaded: false
        },
        {
          id: "qda-online",
          title: "Thi thử Bài thi Đánh giá năng lực QDA",
          category: "QDA",
          typeBadge: "Thi trực tuyến",
          isOnline: true,
          regTime: "Hằng ngày",
          fee: "Miễn phí",
          examTime: "Hằng ngày",
          status: "online",
          actionUrl: "waiting.html",
          actionText: "Vào thi ngay",
          uploaded: false
        },
        {
          id: "thpt-online",
          title: "Thi thử tốt nghiệp THPTQG",
          category: "THPT",
          typeBadge: "Thi trực tuyến",
          isOnline: true,
          regTime: "Hằng ngày",
          fee: "Miễn phí",
          examTime: "Hằng ngày",
          status: "online",
          actionUrl: "waiting.html",
          actionText: "Vào thi ngay",
          uploaded: false
        }
      ];

      let COURSES_DATA = [];
      let enrolledCourseIds = [];

      async function seedSupabaseDatabase() {
        try {
          console.log("Seeding Supabase Database...");
          
          for (const course of MOCK_COURSES_DEFAULTS) {
            if (course.isOnline) continue;

            const { data: insertedCourse, error: cErr } = await supabaseClient
              .from('courses')
              .insert({
                title: course.title,
                description: course.subheading + " " + course.desc,
                cover_image: course.category === "THPT" ? "assets/thpt.png" : "assets/anhnen.png",
                teacher: course.author,
                price: 0,
                active: true,
                category: course.category
              })
              .select('id')
              .single();

            if (cErr) {
              console.error("Error inserting course:", cErr.message);
              continue;
            }

            const courseId = insertedCourse.id;

            const lessonsToInsert = course.lessons.map((l, index) => ({
              course_id: courseId,
              title: l.title,
              short_description: l.title,
              type: l.title.toLowerCase().includes("file") ? "pdf" : (l.title.toLowerCase().includes("viết tay") || l.title.toLowerCase().includes("bvt") ? "write" : "video"),
              video_drive_id: l.video_drive_id || "17l2lP-G4mH0l9X2X1l1X1l1X1l1X1l1",
              doc_link: l.doc_link || "https://example.com/mock-document.pdf",
              order_index: index,
              preview_allowed: l.preview_allowed || false
            }));

            const { error: lErr } = await supabaseClient
              .from('lessons')
              .insert(lessonsToInsert);

            if (lErr) {
              console.error("Error inserting lessons:", lErr.message);
            }

            if (course.id === "thpt-math-luyen-de") {
              await supabaseClient.from('activation_codes').insert({
                code: "123",
                course_id: courseId,
                max_uses: 9999,
                used_count: 0,
                active: true
              });
            }
          }
          console.log("Seeding Supabase completed successfully!");
        } catch (seedErr) {
          console.error("Failed to seed database:", seedErr);
        }
      }

      async function loadCoursesAndEnrollments() {
        if (!supabaseClient) {
          console.log("No supabaseClient. Running local mockup mode.");
          COURSES_DATA = [...MOCK_COURSES_DEFAULTS];
          return;
        }

        const studentCode = studentInfo?.code || studentInfo?.phone || studentInfo?.email || "test";

        try {
          const { data: dbCourses, error: courseError } = await supabaseClient
            .from('courses')
            .select('*');

          if (courseError) throw courseError;

          if (!dbCourses || dbCourses.length === 0) {
            await seedSupabaseDatabase();
            const { data: reFetchedCourses } = await supabaseClient.from('courses').select('*');
            COURSES_DATA = reFetchedCourses || [];
          } else {
            COURSES_DATA = [];
            for (const c of dbCourses) {
              const { data: dbLessons } = await supabaseClient
                .from('lessons')
                .select('*')
                .eq('course_id', c.id)
                .order('order_index', { ascending: true });

              COURSES_DATA.push({
                id: c.id,
                title: c.title,
                subheading: c.description || "",
                desc: c.description || "",
                author: c.teacher || "Trần Hoàng Anh",
                category: c.category || "TSA",
                lessons: dbLessons || [],
                progress: 33
              });
            }
          }

          MOCK_COURSES_DEFAULTS.forEach(m => {
            if (m.isOnline) COURSES_DATA.push(m);
          });

          const { data: dbEnrollments, error: enrollError } = await supabaseClient
            .from('enrollments')
            .select('course_id')
            .eq('user_email', studentCode);

          if (enrollError) throw enrollError;
          enrolledCourseIds = (dbEnrollments || []).map(e => e.course_id);

          const key = \`tmaTsaRegisteredCourses_\${studentInfo.username}\`;
          localStorage.setItem(key, JSON.stringify(enrolledCourseIds));

        } catch (err) {
          console.warn("Supabase fetch error. Falling back to local mode:", err.message || err);
          COURSES_DATA = [...MOCK_COURSES_DEFAULTS];
        }
      }

      `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("File js/select-page.js updated successfully!");
