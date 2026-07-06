// Pre-embedded fallback data for TSA001 to work offline / file:// protocol
window.TSA001_FALLBACK_DATA = {
  "exam_code": "TSA_EXAM_01",
  "title": "Đề thi thử TSA",
  "duration_minutes": 150,
  "status": "published",
  "sections": [
    {
      "section_id": "math",
      "section_label": "Tư duy Toán học",
      "layout": "single",
      "questions": [
        {
          "question_no": 1,
          "question_type": "single_choice",
          "question": "Bạn Thảo bắt đầu đếm theo một cấp số cộng tăng dần \\(1, 3, 5, 7, \\dots\\) và cùng lúc (với cùng tốc độ) bạn Hưng bắt đầu đếm theo một cấp số cộng giảm dần \\(2025, 2023, 2021, \\dots\\) Tại một thời điểm, cả hai bạn sẽ cùng đếm đến một số \\(n_0\\). Giá trị của \\(n_0\\) bằng?\n",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "507"
            },
            {
              "key": "B",
              "text": "506"
            },
            {
              "key": "C",
              "text": "1015"
            },
            {
              "key": "D",
              "text": "1013"
            }
          ],
          "options_are_images": false,
          "correct_answer": "C"
        },
        {
          "question_no": 2,
          "question_type": "multiple_choice",
          "question": "Cho hàm số \\(y=f(x)\\) thoả mãn \\(f^{\\prime}(x)=\\dfrac{1}{\\cos^{2}(x)}\\). Khi đó, những hàm số nào sau đây có thể là \\(f(x)\\)?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "\\(y=\\tan(x)+2\\pi\\)"
            },
            {
              "key": "B",
              "text": "\\(y=\\pi-\\tan(x)\\)"
            },
            {
              "key": "C",
              "text": "\\(y=\\sqrt{f^{\\prime}(x)-1}\\)"
            },
            {
              "key": "D",
              "text": "\\(y=\\tan^{2}(x)\\)"
            }
          ],
          "options_are_images": false,
          "correct_answer": [
            "A",
            "C"
          ]
        },
        {
          "question_no": 3,
          "question_type": "single_choice",
          "question": "Một khối trụ có đường sinh \\(l=4\\) (m) và đường kính đáy \\(d=6\\) (m). Thể tích của khối trụ đó bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "\\(36\\pi\\) (m³)."
            },
            {
              "key": "B",
              "text": "\\(144\\pi\\) (m³)."
            },
            {
              "key": "C",
              "text": "\\(45\\pi\\) (m³)."
            },
            {
              "key": "D",
              "text": "\\(180\\pi\\) (m³)."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A"
        },
        {
          "question_no": 4,
          "question_type": "true_false",
          "question": "Cho hàm số \\(f(x)=x^{2026}+\\sin\\left(x-\\dfrac{\\pi}{2}\\right)\\). Xét tính đúng/sai của các mệnh đề sau:",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "statements": [
            {
              "id": "a",
              "text": "Hàm số \\(f(x)\\) là hàm số chẵn."
            },
            {
              "id": "b",
              "text": "Đồ thị hàm số \\(y=f(x)\\) cắt trục hoành tại các điểm có hoành độ \\(x_{1}, x_{2}, x_{3},...\\) Tổng \\(\\sum\\limits_{k=1}^{n}(x_{k})=1.\\)"
            }
          ],
          "correct_answer": {
            "a": true,
            "b": false
          }
        },
        {
          "question_no": 5,
          "question_type": "numeric_answer",
          "question": "Cho dãy số \\((u_{n})\\) có tổng của k số hạng đầu \\((S_{k})\\) đđược xác định bởi công thức \\(S_{k}=u_{1}+u_{2}+...+u_{k}=k(k-1)(k+2)\\). Giá trị của \\(u_{15}\\) bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "correct_answer": 658,
          "tolerance": 0
        },
        {
          "question_no": 6,
          "question_type": "true_false",
          "question": "Trong toán học, để biểu diễn tích của một dãy nhiều hạng tử, ta sử dụng chữ cái Hy Lạp “Pi \\(\\Pi\\)”. Chẳng hạn: \\(\\prod\\limits_{k=1}^{99}(k^{2})=1^{2}\\times2^{2}\\times...\\times98^{2}\\times99^{2}.\\) Xét tính đúng/sai của các mệnh đề sau:",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "statements": [
            {
              "id": "a",
              "text": "Tích \\(\\prod\\limits_{i=1}^{2026}(i)=\\prod\\limits_{i=0}^{2026}(i)=2026!.\\)"
            },
            {
              "id": "b",
              "text": "Hàm số \\(f(x)=\\prod\\limits_{n=0}^{99}(x-n)\\) cắt trục tung tại 100 điểm phân biệt."
            },
            {
              "id": "c",
              "text": "Tồn tại 49 giá trị nguyên của x để \\(\\prod\\limits_{k=1}^{49}(x-k)<0.\\)"
            }
          ],
          "correct_answer": {
            "a": true,
            "b": false,
            "c": false
          }
        },
        {
          "question_no": 7,
          "question_type": "drag_drop",
          "question": "Cho \\(\\Delta AK_{0}K_{1}\\) có độ dài \\(AK_{0}=K_{0}K_{1}=1\\). Ta thiết lập \\(\\Delta AK_{1}K_{2}\\) vuông góc tại \\(K_{1}\\) sao cho \\(K_{1}K_{2}=1,\\) rồi thiết lập \\(\\Delta AK_{2}K_{3}\\) vuông góc tại \\(K_{2}\\) sao cho \\(K_{2}K_{3}=1.\\) Cứ làm vậy, ta thiết lập \\(\\Delta AK_{n}K_{n+1}\\) vuông góc tại \\(K_{n}\\) sao cho \\(K_{n}K_{n+1}=1\\) (như hình vẽ bên).",
          "image_url": "https://assets.tmastudy.io.vn/assets/TSA_PRACTICE_FULL_01/6e2760ea-6210-4c52-a989-a622128331b7.png",
          "image_width": 48,
          "explanation": "",
          "points": 1,
          "items": [
            {
              "id": "item1",
              "text": "2"
            },
            {
              "id": "item2",
              "text": "10"
            },
            {
              "id": "item3",
              "text": "1"
            },
            {
              "id": "item4",
              "text": "255"
            }
          ],
          "body": [
            {
              "type": "text",
              "content": "a) Độ dài cạnh \\(AK_{3}\\) bằng "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " \nb) Độ dài cạnh \\(AK_{99}\\) bằng "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " \nc) Độ dài cạnh \\(K_{101}K_{102}\\) bằng "
            },
            {
              "type": "blank",
              "id": "o3"
            },
            {
              "type": "text",
              "content": " \nd) Độ dài cạnh huyền của \\(\\Delta AK_{65023}K_{65024}\\) bằng "
            },
            {
              "type": "blank",
              "id": "o4"
            }
          ],
          "correct_answer": {
            "o1": "val_2",
            "o2": "val_10",
            "o3": "val_1",
            "o4": "val_255"
          }
        },
        {
          "question_no": 8,
          "question_type": "drag_drop",
          "question": "Trong không gian Oxyz, cho điểm \\(K(2501;1020;0)\\).",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "items": [
            {
              "id": "item1",
              "text": "2701"
            },
            {
              "id": "item2",
              "text": "90"
            }
          ],
          "body": [
            {
              "type": "text",
              "content": "a) Khoảng cách từ K đến gốc toạ độ O bằng "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " \nb) Góc giữa hai vector \\(\\vec{OK}\\) và \\(\\vec{k}=(0;0;1)\\) bằng "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " độ."
            }
          ],
          "correct_answer": {
            "o1": "val_2701",
            "o2": "val_90"
          }
        },
        {
          "question_no": 9,
          "question_type": "single_choice",
          "question": "Tồn tại bao nhiêu số nguyên m để \\((mx+1)\\sqrt{\\log(x)+1}=0\\) có hai nghiệm phân biệt?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "1."
            },
            {
              "key": "B",
              "text": "9."
            },
            {
              "key": "C",
              "text": "10."
            },
            {
              "key": "D",
              "text": "Vô số."
            }
          ],
          "options_are_images": false,
          "correct_answer": "B"
        },
        {
          "question_no": 10,
          "question_type": "single_choice",
          "question": "Một khối lập phương, có độ dài các cạnh bằng a, bị lấy mất đi nhiều khối vuông đơn vị nhỏ có kích thước bằng nhau (như hình vẽ bên). Khi đó, cần gắn lại bao nhiêu khối vuông đơn vị để sửa khối lập phương đã cho về như ban đầu?",
          "image_url": "https://assets.tmastudy.io.vn/assets/TSA_PRACTICE_FULL_01/1.png",
          "image_width": 48,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "15."
            },
            {
              "key": "B",
              "text": "54."
            },
            {
              "key": "C",
              "text": "14."
            },
            {
              "key": "D",
              "text": "79."
            }
          ],
          "options_are_images": false,
          "correct_answer": "D"
        },
        {
          "question_no": 11,
          "question_type": "single_choice",
          "question": "Cho hàm số \\(y=\\begin{cases}ax+5 & \\text{khi } x \\neq \\pi\\\\ 1 & \\text{khi } x=\\pi\\end{cases}\\) liên tục trên \\(\\mathbb{R}\\). Giá trị của a bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "-4."
            },
            {
              "key": "B",
              "text": "4."
            },
            {
              "key": "C",
              "text": "5."
            },
            {
              "key": "D",
              "text": "-5."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A"
        },
        {
          "question_no": 12,
          "question_type": "single_choice",
          "question": "Cho hàm số \\(y=f(x)\\) có đồ thị (C) như hình vẽ bên. Tồn tại bao nhiêu tiếp tuyến của (C) song song với trục hoành?",
          "image_url": "https://assets.tmastudy.io.vn/assets/TSA_PRACTICE_FULL_01/Screenshot 2026-07-04 174126.png",
          "image_width": 48,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "0."
            },
            {
              "key": "B",
              "text": "1."
            },
            {
              "key": "C",
              "text": "2."
            },
            {
              "key": "D",
              "text": "3."
            }
          ],
          "options_are_images": false,
          "correct_answer": "C"
        },
        {
          "question_no": 13,
          "question_type": "numeric_answer",
          "question": "Bạn Tú viết lên trên bảng một số n có ba chữ số, rồi viết thêm số 1 vào đằng trước nó để thu đđược một số m thoả mãn \\(m=3n\\). Giá trị của m bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "correct_answer": 1500,
          "tolerance": 0
        },
        {
          "question_no": 14,
          "question_type": "drag_drop",
          "question": "Xét khai triển \\(\\left(x+\\dfrac{1}{3}\\right)^{10}\\).",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "items": [
            {
              "id": "item1",
              "text": "\\(\\dfrac{40}{9}\\)"
            },
            {
              "id": "item2",
              "text": "\\(\\dfrac{10}{3}\\)"
            },
            {
              "id": "item3",
              "text": "\\(\\dfrac{1}{59049}\\)"
            }
          ],
          "body": [
            {
              "type": "text",
              "content": "a) Hệ số của \\(x^{7}\\) là "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " \nb) Hệ số của \\(x^{9}\\) là "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " \nc) Hệ số của số hạng không chứa x là "
            },
            {
              "type": "blank",
              "id": "o3"
            }
          ],
          "correct_answer": {
            "o1": "val_40_9",
            "o2": "val_10_3",
            "o3": "val_1_59049"
          }
        },
        {
          "question_no": 15,
          "question_type": "numeric_answer",
          "question": "Cho hàm số \\(f(x)\\) thoả mãn \\(f(4)=10\\). Giá trị của \\(\\lim\\limits_{x_{0}\\rightarrow4}\\left(\\dfrac{160}{x_{0}-4}\\int\\limits_{4}^{x_{0}}f(x)dx\\right)\\) bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "correct_answer": 1600,
          "tolerance": 0
        },
        {
          "question_no": 16,
          "question_type": "single_choice",
          "question": "Trong không gian Oxyz, cho hai đường thẳng \\(d: \\dfrac{x+1}{2}=\\dfrac{y-2}{1}=\\dfrac{z+3}{-2}\\) và \\(\\Delta: \\begin{cases}x=3-4t\\\\ y=-3-2t\\\\ z=2+4t\\end{cases}\\). Vị trí tương đối giữa d và \\(\\Delta\\) là?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "\\(\\Delta \\equiv d\\)."
            },
            {
              "key": "B",
              "text": "\\(\\Delta\\) và d chéo nhau."
            },
            {
              "key": "C",
              "text": "\\(\\Delta \\parallel d\\)."
            },
            {
              "key": "D",
              "text": "\\(\\Delta\\) và d cắt nhau."
            }
          ],
          "correct_answer": "C",
          "explanation": "",
          "points": 1
        },
        {
          "question_no": 17,
          "question_type": "true_false",
          "question": "Cho hàm số \\(y=f(x)\\) liên tục và đồng biến trên khoảng [a; b]. Xét tính đúng/sai của các mệnh đề sau:",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "statements": [
            {
              "id": "a",
              "text": "\\(f\\left(\\dfrac{9}{8}\\right)-f\\left(\\dfrac{2}{5}\\right)>0.\\)"
            },
            {
              "id": "b",
              "text": "Với \\(x_{1}, x_{2} \\in [a; b]\\) thoả mãn \\(x_{2}>x_{1}\\) thì \\(\\dfrac{f(x_{2})-f(x_{1})}{x_{2}-x_{1}}<0.\\)"
            },
            {
              "id": "c",
              "text": "Nếu \\(f(a)<0\\) và \\(f(b)>0\\) thì \\(\\exists x_{0} \\in [a; b]\\) sao cho \\(f(x_{0})=0\\)."
            }
          ],
          "correct_answer": {
            "a": true,
            "b": false,
            "c": true
          }
        },
        {
          "question_no": 18,
          "question_type": "single_choice",
          "question": "Có bao nhiêu cách để chia đều 10 viên kẹo khác nhau cho 5 bạn?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "252."
            },
            {
              "key": "B",
              "text": "126."
            },
            {
              "key": "C",
              "text": "113400."
            },
            {
              "key": "D",
              "text": "30240."
            }
          ],
          "options_are_images": false,
          "correct_answer": "C"
        },
        {
          "question_no": 19,
          "question_type": "numeric_answer",
          "question": "Cho hai số thực \\(a, b\\) thoả mãn \\(a < b\\). Đặt \\(M = \\int_a^b (x^2 - 6x + 5)\\text{d}x\\). Khi \\(M\\) đạt giá trị nhỏ nhất thì \\(b - a\\) bằng?\n",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "correct_answer": 4,
          "tolerance": 0
        },
        {
          "question_no": 20,
          "question_type": "numeric_answer",
          "question": "Một quả bóng (đặc) đđược đặt vừa vặn vào trong chiếc hộp hình lập phương có cạnh bằng 20 (dm) như hình vẽ bên. Người ta đổ đầy nước vào phần trống còn lại của chiếc hộp sao cho mực nước cách đỉnh hộp 5 (dm). \nThể tích nước cần dùng là bao nhiêu lít? (kết quả đđược làm tròn đến hàng đơn vị)",
          "image_url": "https://assets.tmastudy.io.vn/assets/TSA_PRACTICE_FULL_01/Screenshot 2026-07-04 174451.png",
          "image_width": 36,
          "explanation": "",
          "points": 1,
          "correct_answer": 2466,
          "tolerance": 0
        },
        {
          "question_no": 21,
          "question_type": "single_choice",
          "question": "Cho hình chóp S.ABC có đáy ABC là tam giác đều cạnh a. Biết hình chiếu vuông góc của S lên mặt phẳng đáy là điểm H nằm trên cạnh AB sao cho \\(HA=2HB\\) và \\(SC=a\\sqrt{3}\\). Thể tích khối chóp S.ABC bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "\\(\\dfrac{a^{3}\\sqrt{15}}{24}\\)"
            },
            {
              "key": "B",
              "text": "\\(\\dfrac{a^{3}\\sqrt{3}}{12}\\)"
            },
            {
              "key": "C",
              "text": "\\(\\dfrac{a^{3}\\sqrt{21}}{48}\\)"
            },
            {
              "key": "D",
              "text": "\\(\\dfrac{a^{3}\\sqrt{15}}{18}\\)"
            }
          ],
          "options_are_images": false,
          "correct_answer": "D"
        },
        {
          "question_no": 22,
          "question_type": "numeric_answer",
          "question": "Số nghiệm \\(x \\in [0; 2022\\pi]\\) của phương trình \\(2\\cos(x)-\\cos(2x)=11\\) là?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "correct_answer": 3034,
          "tolerance": 0
        },
        {
          "question_no": 23,
          "question_type": "numeric_answer",
          "question": "Có bao nhiêu cặp số nguyên dương (x; y) thoả mãn \\(2y2^{x}=\\log_{2}\\left(1+\\dfrac{2x}{y}\\right)+2y+3x\\)?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "correct_answer": 1,
          "tolerance": 0
        },
        {
          "question_no": 24,
          "question_type": "single_choice",
          "question": "Cho hai số thực a, b thoả mãn \\(1+\\log_{4}(a)=2+\\log_{3}(b)=\\log_{12}(a+b)\\). Giá trị của biểu thức \\(\\dfrac{1}{a}+\\dfrac{1}{b}\\) bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "36."
            },
            {
              "key": "B",
              "text": "72."
            },
            {
              "key": "C",
              "text": "18."
            },
            {
              "key": "D",
              "text": "9."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A"
        },
        {
          "question_no": 25,
          "question_type": "drag_drop",
          "question": "Trong hệ trục toạ độ Oxy, cho hai hàm số \\(f(x)=x^{3}-2x(x+1)\\) và \\(g(x)=x^{2}(x^{2}-3)-2\\) và tham số nguyên m.",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "items": [
            {
              "id": "item1",
              "text": "5"
            },
            {
              "id": "item2",
              "text": "2"
            },
            {
              "id": "item3",
              "text": "12"
            }
          ],
          "body": [
            {
              "type": "text",
              "content": "a) Tồn tại "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " giá trị của m để phương trình \\(f(x)=m\\) có 3 nghiệm thực phân biệt. \nb) Tồn tại "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " giá trị của m để phương trình \\(g(x)=m\\) có 4 nghiệm thực phân biệt. \nc) Với mọi \\(m \\in [-4; -2)\\), đồ thị hàm số \\(y=m\\) có "
            },
            {
              "type": "blank",
              "id": "o3"
            },
            {
              "type": "text",
              "content": " giao điểm với hai đồ thị hàm số \\(y=f(x)\\) và \\(y=g(x)\\)."
            }
          ],
          "correct_answer": {
            "o1": "val_5",
            "o2": "val_2",
            "o3": "val_12"
          }
        },
        {
          "question_no": 26,
          "question_type": "single_choice",
          "question": "Số 2,4096096096096... có thể đđược viết dưới dạng phân số tối giản \\(\\dfrac{a}{b}\\). Hiệu \\(a-b\\) bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "365."
            },
            {
              "key": "B",
              "text": "2347."
            },
            {
              "key": "C",
              "text": "881."
            },
            {
              "key": "D",
              "text": "381."
            }
          ],
          "options_are_images": false,
          "correct_answer": "B"
        },
        {
          "question_no": 27,
          "question_type": "single_choice",
          "question": "Cho hàm số \\(f(x)=\\log_{2}\\left(\\dfrac{4^{x}+8}{m}\\right)\\), với m là tham số thực. Tổng các giá trị của m để đồ thị hàm số \\(y=f(x)\\) cắt đường thẳng \\(y=x\\) tại hai điểm phân biệt có hoành độ \\(x_{1}, x_{2}\\) thoả mãn \\(2x_{1}+x_{2}=5\\) bằng?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "0."
            },
            {
              "key": "B",
              "text": "\\(2\\sqrt{6}\\)."
            },
            {
              "key": "C",
              "text": "2."
            },
            {
              "key": "D",
              "text": "\\(\\sqrt{6}\\)."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A"
        },
        {
          "question_no": 28,
          "question_type": "single_choice",
          "question": "Vào một buổi chiều rảnh rỗi, bạn Linh viết lên bảng một chữ số 1, hai chữ số 2, ba chữ số 3, bốn chữ cố 4,... và cứ như vậy đến hết 99 lần số 99. Khi đó, chữ số thứ 2026 mà bạn Linh đã viết lên bảng là?",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "6."
            },
            {
              "key": "B",
              "text": "4."
            },
            {
              "key": "C",
              "text": "7."
            },
            {
              "key": "D",
              "text": "5."
            }
          ],
          "options_are_images": false,
          "correct_answer": "B"
        },
        {
          "question_no": 29,
          "question_type": "true_false",
          "question": "Cho hai số nguyên a, b. Xét tính đúng/sai của các mệnh đề sau:",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "\\(a^{2}+b^{2}=(a+b)^{2}-2ab.\\)"
            },
            {
              "id": "b",
              "text": "\\(a^{5}+b^{5}=(a+b)^{5}-5a^{4}b+10a^{3}b^{2}-10a^{2}b^{3}+5ab^{4}.\\)"
            },
            {
              "id": "c",
              "text": "Nếu \\(a=b+3\\) thì \\((a^{3}+b^{3}) \\vdots 9\\)."
            }
          ],
          "correct_answer": {
            "a": true,
            "b": false,
            "c": true
          },
          "explanation": "",
          "points": 1
        },
        {
          "question_no": 30,
          "question_type": "multiple_choice",
          "question": "Trong một bộ bài 52 lá bài gồm 13 lá mỗi chất (Bích, Tép, Rô, Cơ), trong đó các lá thuộc chất Bích và Tép có màu đen và các lá thuộc chất Rô và Cơ có màu đỏ. Lấy ngẫu nhiên một lá bài, Đặt A là biến cố “Lấy đđược lá Bích\", B là biến cố “Lấy đđược lá có màu đen\" và C là biến cố “Lấy đđược lá có màu đỏ”. Những mệnh đề nào sau đây đúng?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "\\(P(B)P(C)>P(BC)\\)."
            },
            {
              "key": "B",
              "text": "\\(P(AC)>0\\)."
            },
            {
              "key": "C",
              "text": "\\(P(A)P(B)>P(AB).\\)"
            },
            {
              "key": "D",
              "text": "\\(P(AB)=P(A)\\)."
            }
          ],
          "correct_answer": [
            "A",
            "C",
            "D"
          ],
          "explanation": "",
          "points": 1
        },
        {
          "question_no": 31,
          "question_type": "single_choice",
          "question": "Cho hàm số \\(f(x)\\) có tính chất \\(f(kx)=\\dfrac{k}{2}f(x)\\), \\(\\forall x, k \\in \\mathbb{R}\\). Biết \\(3f(4)+\\dfrac{2}{3}f(6)=8\\), giá trị của \\(f(2)\\) bằng?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "1."
            },
            {
              "key": "B",
              "text": "2."
            },
            {
              "key": "C",
              "text": "3."
            },
            {
              "key": "D",
              "text": "-3."
            }
          ],
          "correct_answer": "B",
          "explanation": "",
          "points": 1
        },
        {
          "question_no": 32,
          "question_type": "numeric_answer",
          "question": "Số \\(7^{2026}\\) có dạng abcd..., với a, b, c, d là bốn chữ số đầu tiên. Tổng \\(a+b+c+d\\) bằng?",
          "image_url": "",
          "correct_answer": 16,
          "tolerance": 0,
          "explanation": "",
          "points": 1
        },
        {
          "question_no": 33,
          "question_type": "single_choice",
          "question": "Cho 2006 đồng xu đđược đánh số thứ tự từ 1 đến 2006 xếp thành hàng, tất cả đều đang nằm ngửa. Lần thứ nhất, lật tất cả các đồng xu có số thứ tự là bội của 1. Lần thứ hai, lật tất cả các đồng xu có số thứ tự là bội của 2. Lần thứ ba, lật tất cả các đồng xu có số thứ tự là bội của 3. Cứ như vậy, đến lần thứ 2006, lật tất cả các đồng xu có số thứ tự là bội của 2006. Sau 2006 lần lật, có bao nhiêu đồng xu nằm xấp?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "44."
            },
            {
              "key": "B",
              "text": "42."
            },
            {
              "key": "C",
              "text": "48."
            },
            {
              "key": "D",
              "text": "46."
            }
          ],
          "correct_answer": "A",
          "explanation": "",
          "points": 1
        },
        {
          "question_no": 34,
          "question_type": "true_false",
          "question": "Tích phân suy rộng là một dạng tích phân có một (hoặc cả hai) cận tiến đến vô cùng, chẳng hạn: \\(\\int\\limits_{1}^{+\\infty}\\left(\\dfrac{1}{2}\\right)^{x}dx\\). Để tính toán, ta coi cận vô cùng là một ẩn số rồi đi xác định giới hạn của tích phân khi ẩn đó tiến đến vô cùng, cụ thể: \\(\\int\\limits_{a}^{+\\infty}f(x)dx=\\lim\\limits_{b \\to +\\infty}\\int\\limits_{a}^{b}f(x)dx\\). Ví dụ: \\(\\int\\limits_{0}^{+\\infty}\\left(\\dfrac{1}{2}\\right)^{x}dx=\\lim\\limits_{b \\to +\\infty}\\int\\limits_{0}^{b}\\left(\\dfrac{1}{2}\\right)^{x}dx=\\lim\\limits_{b \\to +\\infty}\\left.\\dfrac{\\left(\\dfrac{1}{2}\\right)^{x}}{\\ln\\left(\\dfrac{1}{2}\\right)}\\right|_{0}^{b}=\\lim\\limits_{b \\to +\\infty}\\left[\\dfrac{\\left(\\dfrac{1}{2}\\right)^{b}}{\\ln\\left(\\dfrac{1}{2}\\right)}-\\dfrac{1}{\\ln\\left(\\dfrac{1}{2}\\right)}\\right]=\\dfrac{1}{\\ln(2)}\\). Xét tính đúng/sai của các mệnh đề sau:",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "statements": [
            {
              "id": "a",
              "text": "\\(\\int\\limits_{0}^{+\\infty}e^{-x}dx=1.\\)"
            },
            {
              "id": "b",
              "text": "\\(\\int\\limits_{-\\infty}^{0}2^{\\varphi}d\\varphi=\\int\\limits_{0}^{+\\infty}\\dfrac{1}{2^{x}}dx.\\)"
            },
            {
              "id": "c",
              "text": "“Kèn của Grabiel” là một vật thể đđược tạo thành khi xoay phần diện tích giới hạn bởi đường cong \\(y=\\dfrac{1}{x}\\), đường thẳng \\(x=1\\) và \\(y=0\\) quanh trục hoành. Thể tích của chiếc kèn đó bé hơn 4, nhưng lớn hơn 3."
            }
          ],
          "correct_answer": {
            "a": false,
            "b": true,
            "c": true
          }
        },
        {
          "question_no": 35,
          "question_type": "true_false",
          "question": "Cho dãy số \\((u_{n})_{n \\ge 1}\\) thoả mãn \\(\\begin{cases}u_{1}=3\\\\ u_{n+1}=4\\left(u_{n}+\\dfrac{1}{2}\\right)\\end{cases} (n \\in \\mathbb{N}^{*})\\). Xét tính đúng/sai của các mệnh đề sau:",
          "image_url": "",
          "image_width": 100,
          "explanation": "",
          "points": 1,
          "statements": [
            {
              "id": "a",
              "text": "Dãy số \\((u_{n})\\) là cấp số cộng."
            },
            {
              "id": "b",
              "text": "Biết rằng công thức tổng quát của \\((u_{n})\\) có dạng \\(u_{n}=a4^{n-1}-b (a, b \\in \\mathbb{Q})\\). Khi đó, \\(a+b=\\dfrac{13}{3}\\)."
            },
            {
              "id": "c",
              "text": "Số dư khi chia \\(u_{16}\\) cho 7 bằng 3."
            }
          ],
          "correct_answer": {
            "a": false,
            "b": true,
            "c": true
          }
        },
        {
          "question_no": 36,
          "question_type": "numeric_answer",
          "question": "Cho hàm số \\(f(x)=35\\pi+\\sin(7\\pi\\sin(5x))\\). Số nghiệm của phương trình \\(f(x)=35\\pi\\) trên đoạn \\([0; 2\\pi]\\) là?",
          "image_url": "",
          "correct_answer": 141,
          "tolerance": 0,
          "explanation": "",
          "points": 1
        },
        {
          "question_no": 37,
          "question_type": "single_choice",
          "question": "Cho hình vuông ABCD có độ dài các cạnh bằng 1, hai cặp đỉnh AB và CD lần lượt nằm trên hai đường tròn đáy của một hình trụ (H). Biết mặt phẳng (ABCD) tạo với đáy trụ một góc \\(45^{\\circ}\\), thể tích của (H) bằng?",
          "image_url": "https://assets.tmastudy.io.vn/assets/TSA_PRACTICE_FULL_01/2.png",
          "image_width": 25,
          "explanation": "",
          "points": 1,
          "options": [
            {
              "key": "A",
              "text": "\\(\\dfrac{\\pi\\sqrt{3}}{16}\\)"
            },
            {
              "key": "B",
              "text": "\\(\\dfrac{2\\pi\\sqrt{3}}{16}\\)"
            },
            {
              "key": "C",
              "text": "\\(\\dfrac{\\pi\\sqrt{2}}{16}\\)"
            },
            {
              "key": "D",
              "text": "\\(\\dfrac{3\\pi\\sqrt{3}}{16}\\)"
            }
          ],
          "options_are_images": false,
          "correct_answer": "D"
        },
        {
          "question_no": 38,
          "question_type": "numeric_answer",
          "question": "Cho 16 điểm đđược đặt cách đều nhau trên một lưới \\(4 \\times 4\\) như hình vẽ sau: Chọn ngẫu nhiên 4 điểm, xác suất để 4 điểm đó lập thành một hình chữ nhật là p. Giá trị của 455p bằng?",
          "image_url": "https://assets.tmastudy.io.vn/assets/TSA_PRACTICE_FULL_01/3.png",
          "image_width": 21,
          "explanation": "",
          "points": 1,
          "correct_answer": 11,
          "tolerance": 0
        },
        {
          "question_no": 39,
          "question_type": "true_false",
          "question": "Cho năm số nguyên a, b, c, d, e khác 0 thoả mãn \\(a+b+c+d\\) chẵn. Xét đa thức \\(P(x)=ax^{4}+bx^{3}+cx^{2}+dx+e\\). Nếu số nguyên k là nghiệm của phương trình \\(P(x)=0\\) thì tồn tại đa thức \\(Q(x)\\) với các hệ số nguyên sao cho \\(P(x)=(x-k)Q(x)\\). Biết rằng \\(P(1)\\) là một số chẵn, xét tính đúng/sai của các mệnh đề sau:",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "e là một số lẻ."
            },
            {
              "id": "b",
              "text": "Nếu \\(Q(0)\\) là một số lẻ thì k là một số chẵn."
            },
            {
              "id": "c",
              "text": "Nếu \\(Q(0)\\) là một số lẻ thì \\(Q(1)\\) là một số chẵn."
            },
            {
              "id": "d",
              "text": "Nếu \\(Q(0)\\) là một số chẵn thì k có thể lẻ hoặc chẵn."
            }
          ],
          "correct_answer": {
            "a": false,
            "b": true,
            "c": true,
            "d": true
          },
          "explanation": "",
          "points": 1
        },
        {
          "question_no": 40,
          "question_type": "numeric_answer",
          "question": "Đặt \\(\\alpha=\\sqrt[401]{4}-1\\) và \\(\\beta_{n}=C_{n}^{1}+C_{n}^{2}\\alpha+C_{n}^{3}\\alpha^{2}+...+C_{n}^{n}\\alpha^{n-1}\\). Hiệu \\(\\beta_{2006}-\\beta_{2005}\\) bằng?",
          "image_url": "",
          "correct_answer": 1024,
          "tolerance": 0,
          "explanation": "",
          "points": 1
        }
      ]
    },
    {
      "section_id": "reading",
      "section_label": "Đọc hiểu",
      "layout": "passage",
      "groups": [
        {
          "group_id": "g1",
          "title": "Kiến trúc truyền thống",
          "stimulus": {
            "type": "text",
            "content": "[1] Trên con đường phát triển kiến trúc còn lắm gian nan, đây đó đã bắt đầu xuất hiện một số khuynh hướng sáng tác có tính thử nghiệm. Trong đó khuynh hướng tìm về với quá khứ đã đđược nhiều người nhắc đến và sử dụng, xem như là một giải pháp giàu tính khả thi.\n\n[2] Dường như trong suy nghĩ của chúng ta, kiến trúc truyền thống vẫn chỉ đđược xem như là một chứng nhân của lịch sử, là cuốn biên niên sử đđược viết bằng vật liệu xây dựng của dân tộc. Nếu nghiên cứu sâu hơn một chút chúng ta sẽ thấy lịch sử và hiện tại như là một dòng chảy không ngừng. Lịch sử đã trở thành khuôn phép nội tại, là bối cảnh, là chỗ dựa cho mọi người vững chân trong hiện tại. Trong một chừng mực nào đó, truyền thống là lịch sử nhưng lại quy định phương thức tư duy, phương thức hành vi và trình độ nhận thức của chúng ta. Do đó mà nó có ý nghĩa quy định cho hôm nay và cho cả tương lai. Người phương Đông có câu “Lấy sử làm gương\", kỳ thực kiến trúc truyền thống không những là “gương\" mà còn là một nhân tố quan trọng để cấu thành nên kiến trúc hiện đại. Kiến trúc truyền thống đối với chúng ta không thể là vấn đề có cũng đđược mà không cũng đđược. Nó quy định phương thức, dạng thức của tiến trình hiện đại hóa.\n\n[3] Trong kiến trúc chắc hẳn rồi sẽ xuất hiện nhiều phong cách sáng tác khác nhau vì mỗi kiến trúc sư đều có quyền lựa chọn cho mình một phong cách riêng mà mình ưa thích. Nhưng kiến trúc không phải là cái gì khác, bản chất của nó là nhân hóa. Nó đđược cấu thành bởi phương thức và trình độ nhận thức của con người trong tiến trình phát triển. Nó chọn lọc, lưu giữ những giá trị trường tồn và bất biến qua thời gian đđược nhiều người thừa nhận. Kiến trúc truyền thống Việt Nam đạt đđược trong lịch sử là mật mã di truyền xã hội của con người Việt Nam đã tích lũy và lắng đọng qua hàng ngàn năm phát triển, để rồi đđược gửi gắm tất cả vào hình hài của từng công trình, từng cụm công trình kiến trúc cụ thể.\n\n[4] Bản thân mỗi công trình kiến trúc đều mang trong mình nhiều tầng nghĩa. Trước hết nó đđược xây dựng nhằm đáp ứng những nhu cầu hết sức cụ thể của con người trong cuộc sống như để ăn ở, sinh hoạt... Sau đó nó đđược phủ lên mình một biểu tượng, một hình hài mà chủ thể sáng tạo ra nó muốn gửi gắm vào đấy những tâm tư, tình cảm của họ. Và cuối cùng, cao hơn tất cả, nó đđược khoác lên mình những hình ảnh, những biểu tượng để tượng trưng cho tư tưởng, lối sống, quan niệm thẩm mĩ... của cả một cộng đồng, cả một dân tộc. Chính tầng nghĩa sau cùng này sẽ đđượcđược tích lũy và lắng đọng lâu dài trong lịch sử. Tầng sâu của biểu tượng văn hóa này sẽ chuyển hóa thành tầng ý thức và rồi trở thành thiên tính trong mỗi con người hiện thực chúng ta. Truyền thống đã không ngừng khắc dấu ấn của tổ tiên trên mỗi chúng ta, và kiến trúc chỉ là một trong những đối tượng mà truyền thống đã gửi gắm lại dấu ấn của mình. Vậy nên việc phủ nhận truyền thống trong quá trình sáng tác kiến trúc dường như là một việc làm không thể.\n\n[5] Không thể tách rời hiện đại với truyền thống thành hai đoạn khác nhau, nhưng cũng không có nghĩa là chúng ta không thể vượt qua truyền thống – điều mà Kenzo Tange, kiến trúc sư lỗi lạc người Nhật Bản đã làm đđược cho nền kiến trúc hiện đại của đất nước “Mặt Trời mọc\" bằng nguyên lý phản truyền thống nổi tiếng của ông. Tuy nhiên, điều kiện tiên quyết để vượt qua, vượt lên kiến trúc truyền thống là chúng ta phải nắm chắc đđược nó, hiểu biết tường tận về nó. Chỉ trên cơ sở kế thừa ưu điểm, khắc phục nhđược điểm của kiến trúc truyền thống, chúng ta mới có cơ hội vượt qua nó.\n\n[6] Như một dòng chảy bất tận có đỉnh thịnh và điểm suy, trong quá trình phát triển, các dòng kiến trúc đều có thời kỳ hưng thịnh và suy vong. Song nhìn chung, dòng kiến trúc phát triển sau thường cao hơn dòng kiến trúc phát triển trước, như làn sóng sau xô làn sóng trước, càng về sau càng cao hơn trước nhiều. (Tất nhiên quy luật phát triển ấy không phải là con đường hoàn toàn bằng phẳng, đã có lúc kiến trúc phát triển quanh co và bao hàm cả nhân tố thụt lùi.) Hiểu rõ quá trình phát triển này của lịch sử, chúng ta hoàn toàn không cần thiết đem truyền thống và hiện đại đối lập nhau.\n\n[7] Lịch sử cũng cho chúng ta những ví dụ vĩ đại về sự suy vong rồi lại đđược phát triển trên cơ sở mới. Như kiến trúc cổ Hy Lạp đã tàn lụi ở thời Trung cổ, đến thế kỷ XV phong trào nghệ thuật Phục hưng đã hồi sinh nó và đưa nó lên một tầm cao mới. Kiến trúc truyền thống Việt Nam cũng không là ngoại lệ, vẫn đang chờ đợi một cơ hội phục hưng thực sự và nếu như nó lại đđược bay bổng lên một lần nữa (sau phong trào kiến trúc Đông Dương đặc sắc đầu thế kỷ XX) thì sẽ huy hoàng biết chừng nào! Thế kỷ XXI là thế kỷ của văn hóa. Kiến trúc truyền thống Việt Nam đang đứng trước vận hội lớn của mình và tất cả chúng ta đều kỳ vọng vào điều đó.\n\n(Theo Lê Hữu Trúc, Báo Điện tử Văn nghệ Quân đội, đăng ngày 08/3/2024)"
          },
          "questions": [
            {
              "question_no": 1,
              "question_type": "single_choice",
              "question": "Theo đoạn [1], xu thế khám phá và tái hiện quá khứ trong kiến trúc đđược coi là một giải pháp giàu tính thực tiễn. Đúng hay sai?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Đúng"
                },
                {
                  "key": "B",
                  "text": "Sai"
                }
              ],
              "correct_answer": "A",
              "explanation": "Trong đoạn [1], tác giả nhắc đến 'khuynh hướng tìm về với quá khứ... xem như là một giải pháp giàu tính khả thi'. Khả thi đồng nghĩa với có tính thực tiễn cao.",
              "points": 1
            },
            {
              "question_no": 2,
              "question_type": "multiple_choice",
              "question": "Theo đoạn [2], những điều nào sau đây là đúng về kiến trúc truyền thống? Chọn HAI đáp án đúng.",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Kiến trúc truyền thống vốn đđược nhìn nhận như một loại di sản xây dựng bằng vật liệu dân tộc."
                },
                {
                  "key": "B",
                  "text": "Kiến trúc truyền thống đđược xem như là một chứng nhân lịch sử cần lưu giữ mãi mãi cho đời sau."
                },
                {
                  "key": "C",
                  "text": "Kiến trúc truyền thống góp phần thúc đẩy quá trình phát triển nhận thức của con người."
                },
                {
                  "key": "D",
                  "text": "Kiến trúc truyền thống góp một phần quan trọng trong việc cấu thành kiến trúc hiện đại."
                }
              ],
              "correct_answer": [
                "A",
                "D"
              ],
              "explanation": "Đoạn [2] có nêu kiến trúc truyền thống 'đđược xem như là một chứng nhân của lịch sử, là cuốn biên niên sử đđược viết bằng vật liệu xây dựng' (Đáp án A) và 'là một nhân tố quan trọng để cấu thành nên kiến trúc hiện đại' (Đáp án D).",
              "points": 1
            },
            {
              "question_no": 3,
              "question_type": "drag_drop",
              "question": "Tìm cụm từ không quá BỐN tiếng trong bài để trả lời cho câu hỏi sau: Hình ảnh nào thể hiện sự liên kết giữa lịch sử và hiện đại thông qua kiến trúc truyền thống?",
              "image_url": "",
              "body": [
                {
                  "type": "blank",
                  "id": "o1"
                }
              ],
              "items": [],
              "correct_answer": {
                "o1": "dòng chảy"
              },
              "explanation": "Đoạn [2] viết: 'lịch sử và hiện tại như là một dòng chảy không ngừng'.",
              "points": 1
            },
            {
              "question_no": 4,
              "question_type": "true_false",
              "question": "Theo đoạn [3], các nhận định sau đúng hay sai?",
              "image_url": "",
              "statements": [
                {
                  "id": "a",
                  "text": "Kiến trúc đđược cấu thành bởi phương thức và trình độ nhận thức của con người."
                },
                {
                  "id": "b",
                  "text": "Tất cả các công trình là sản phẩm lựa chọn cá nhân của kiến trúc sư."
                },
                {
                  "id": "c",
                  "text": "Mật mã di truyền xã hội đđược thể hiện trong các công trình kiến trúc hiện đại."
                },
                {
                  "id": "d",
                  "text": "Mỗi kiến trúc sư có quyền tự do chọn lựa phong cách sáng tạo phản ánh cá nhân."
                }
              ],
              "correct_answer": {
                "a": true,
                "b": false,
                "c": false,
                "d": true
              },
              "explanation": "Phát biểu A đúng theo câu 'Nó đđược cấu thành bởi phương thức và trình độ nhận thức của con người'. Phát biểu B sai vì kiến trúc còn mang bản chất nhân hóa, lưu giữ giá trị chung chứ không chỉ là lựa chọn cá nhân. Phát biểu C sai vì đoạn 3 nhắc tới kiến trúc truyền thống là mật mã di truyền, không phải kiến trúc hiện đại. Phát biểu D đúng theo câu 'mỗi kiến trúc sư đều có quyền lựa chọn cho mình một phong cách riêng'.",
              "points": 1
            },
            {
              "question_no": 5,
              "question_type": "drag_drop",
              "question": "Kéo các cụm từ trong các ô dưới đây thả vào vị trí phù hợp để mô tả chính xác mục đích các tầng nghĩa trong các công trình kiến trúc:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "- Tầng nghĩa tượng trưng: "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": "\n- Tầng nghĩa biểu tượng: "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": "\n- Tầng nghĩa cơ bản: "
                },
                {
                  "type": "blank",
                  "id": "o3"
                }
              ],
              "items": [
                {
                  "id": "i1",
                  "text": "Truyền tải tâm trạng, tình cảm của người sáng tác"
                },
                {
                  "id": "i2",
                  "text": "Mô tả tư tưởng, phong cách sống của một cộng đồng"
                },
                {
                  "id": "i3",
                  "text": "Biến đổi tầng ý thức và bản tính của con người hiện đại"
                },
                {
                  "id": "i4",
                  "text": "Đáp ứng các nhu cầu cụ thể trong đời sống con người"
                }
              ],
              "correct_answer": {
                "o1": "i2",
                "o2": "i1",
                "o3": "i4"
              },
              "explanation": "Dựa vào đoạn [4]: Tầng cơ bản là đáp ứng nhu cầu cụ thể (i4). Tầng biểu tượng là hình hài gửi gắm tâm tư, tình cảm người sáng tác (i1). Tầng cao nhất (tượng trưng) là biểu tượng cho tư tưởng, lối sống của cộng đồng (i2).",
              "points": 1
            },
            {
              "question_no": 6,
              "question_type": "drag_drop",
              "question": "Điền một từ không quá HAI tiếng trong đoạn [4] vào mỗi chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Các tầng nghĩa trong mỗi công trình kiến trúc đều lưu lại những "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " quan trọng của lịch sử dân tộc. Vì thế, sự công nhận tính "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": " trong sáng tác kiến trúc đã trở nên ngày một hiển nhiên hơn."
                }
              ],
              "items": [],
              "correct_answer": {
                "o1": "dấu ấn",
                "o2": "truyền thống"
              },
              "explanation": "Đoạn [4] có viết: 'Truyền thống đã không ngừng khắc dấu ấn của tổ tiên... kiến trúc chỉ là một trong những đối tượng mà truyền thống đã gửi gắm lại dấu ấn của mình. Vậy nên việc phủ nhận truyền thống trong quá trình sáng tác... dường như là việc làm không thể'.",
              "points": 1
            },
            {
              "question_no": 7,
              "question_type": "true_false",
              "question": "Theo đoạn [5], các nhận định sau đúng hay sai?",
              "image_url": "",
              "statements": [
                {
                  "id": "a",
                  "text": "Kiến trúc hiện đại luôn ưu việt hơn kiến trúc truyền thống."
                },
                {
                  "id": "b",
                  "text": "Phản truyền thống là sáng tạo ra các công trình với chất liệu hoàn toàn mới."
                },
                {
                  "id": "c",
                  "text": "Điều kiện tiên quyết để vượt qua truyền thống là hiểu biết và nắm chắc nó."
                },
                {
                  "id": "d",
                  "text": "Việc phản truyền thống đồng nghĩa với việc loại bỏ truyền thống."
                }
              ],
              "correct_answer": {
                "a": false,
                "b": false,
                "c": true,
                "d": false
              },
              "explanation": "Trong đoạn [5], tác giả nhấn mạnh 'điều kiện tiên quyết để vượt qua... là chúng ta phải nắm chắc đđược nó' (C đúng). Các ý A, B, D không đđược đề cập hoặc đi ngđược lại quan điểm của tác giả ('chỉ trên cơ sở kế thừa ưu điểm, khắc phục nhđược điểm...').",
              "points": 1
            },
            {
              "question_no": 8,
              "question_type": "true_false",
              "question": "Theo đoạn [6], các nhận định sau đúng hay sai?",
              "image_url": "",
              "statements": [
                {
                  "id": "a",
                  "text": "Dòng kiến trúc phát triển sau luôn cao hơn dòng kiến trúc phát triển trước."
                },
                {
                  "id": "b",
                  "text": "Các dòng kiến trúc thường trải qua các giai đoạn thịnh vượng và suy tàn."
                },
                {
                  "id": "c",
                  "text": "Tất cả các dòng kiến trúc đều cùng tuân theo một quy luật phát triển."
                }
              ],
              "correct_answer": {
                "a": false,
                "b": true,
                "c": false
              },
              "explanation": "Đoạn [6] nêu dòng phát triển sau 'nhìn chung' (không phải 'luôn') cao hơn trước -> A sai. 'Các dòng kiến trúc đều có thời kỳ hưng thịnh và suy vong' -> B đúng. 'Quy luật phát triển ấy không phải là con đường hoàn toàn bằng phẳng' (có quanh co/thụt lùi) -> C sai.",
              "points": 1
            },
            {
              "question_no": 9,
              "question_type": "drag_drop",
              "question": "Điền một từ không quá HAI tiếng trong hai đoạn cuối vào mỗi chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Hiểu rõ quá trình phát triển lịch sử, chúng ta không cần phải "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " truyền thống và hiện đại. Lịch sử cung cấp những ví dụ về sự "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": " và hồi sinh, như phong trào nghệ thuật Phục hưng đã hồi sinh kiến trúc cổ Hy Lạp. Kiến trúc truyền thống Việt Nam cũng đang chờ đợi cơ hội phục hưng, trong thế kỷ XXI đầy triển vọng cho "
                },
                {
                  "type": "blank",
                  "id": "o3"
                }
              ],
              "items": [],
              "correct_answer": {
                "o1": "đối lập",
                "o2": "suy vong",
                "o3": "văn hóa"
              },
              "explanation": "Đoạn [6] có câu: 'hoàn toàn không cần thiết đem truyền thống và hiện đại đối lập nhau'. Đoạn [7] nhắc đến 'sự suy vong rồi lại đđược phát triển' và 'Thế kỷ XXI là thế kỷ của văn hóa'.",
              "points": 1
            },
            {
              "question_no": 10,
              "question_type": "single_choice",
              "question": "Nội dung chính của bài viết là gì?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Kiến trúc truyền thống chứa đựng những tầng nghĩa mang giá trị trường tồn trong kiến trúc hiện đại."
                },
                {
                  "key": "B",
                  "text": "Hiện đại hóa kiến trúc không đòi hỏi áp dụng những phong cách mới mà đòi hỏi sự hiểu biết sâu sắc về truyền thống."
                },
                {
                  "key": "C",
                  "text": "Quá trình phát triển kiến trúc luôn tạo cơ hội thuận lợi cho phát triển phong cách cá nhân và nhận thức con người."
                },
                {
                  "key": "D",
                  "text": "Hiểu biết sâu sắc về kiến trúc truyền thống là điều kiện cần và quan trọng trong quá trình hiện đại hóa kiến trúc."
                }
              ],
              "correct_answer": "D",
              "explanation": "Xuyên suốt bài viết, tác giả khẳng định kiến trúc truyền thống quy định tiến trình hiện đại hóa, không thể tách rời, và hiểu biết sâu sắc về nó là điều kiện tiên quyết để vượt qua, phục hưng và phát triển kiến trúc.",
              "points": 1
            }
          ]
        },
        {
          "group_id": "g2",
          "title": "Ứng dụng trí tuệ nhân tạo trong y học",
          "stimulus": {
            "type": "text",
            "content": "[1] Năm 2018, các nhà nghiên cứu tại Bệnh viện Đại học Quốc gia Seoul (Hàn Quốc) đã phát triển một thuật toán AI gọi là DLAD (Deep Learning based Automatic Detection) để phân tích hình ảnh chụp X-quang ngực cũng như phát hiện sự phát triển bất thường của tế bào (nguyên nhân gây ra bệnh ung thư). Cùng một hình ảnh phim chụp, kết quả đọc của máy tính sẽ đđược so sánh với kết quả đọc của nhiều bác sĩ khác nhau và thật ngạc nhiên khi những kết luận từ máy tính là vượt trội hơn so với 17/18 các bác sĩ tham gia đọc phim.\n\n[2] Cũng trong năm 2018, thuật toán thứ hai đđược phát triển bởi các nhà nghiên cứu tại Google AI Healthcare. Họ tạo ra một thuật toán gọi là LYNA (Lymph Node Assistant) giúp phân tích các mẫu bệnh phẩm nhuộm màu để xác định khối ung thư vú di căn từ hạch bạch huyết. Kết quả rất thú vị khi thuật toán này có thể xác định các vùng khả nghi mà mắt thường của con người không thể phân biệt đđược trong các mẫu sinh thiết đđược đưa ra. LYNA thử nghiệm trên hai tập dữ liệu và đđược chứng minh là phân loại chính xác mẫu là ung thư hay không phải ung thư chính xác lên đến 99%. Hơn nữa, thời gian đọc của LYNA nhanh gấp đôi thời gian đọc bởi các bác sĩ thực hành.\n\n[3] AI trong chăm sóc sức khỏe là một thuật ngữ bao quát đđược sử dụng để mô tả việc ứng dụng các thuật toán và phần mềm máy tính học đđược nhằm bắt chước nhận thức của con người trong việc phân tích, chẩn đoán, đưa ra các chỉ dẫn trong quá trình thăm khám, chẩn đoán, điều trị và tiên lượng bệnh. Gần đây, AI đã đạt đđược những tiến bộ to lớn trong việc tự động chẩn đoán bệnh, giúp cho việc chẩn đoán rẻ, nhanh và dễ tiếp cận hơn. Các dữ liệu khổng lồ về hình ảnh bình thường, bệnh lý, các chỉ số cơ thể... sẽ đđược các nhà khoa học “dán nhãn\", nạp vào máy tính, sắp xếp, xử lý, v.v., từ đó máy tính có thể nhận diện, phân loại rồi đưa ra các chẩn đoán khi chúng tiếp xúc với một dữ liệu nào đó của bệnh nhân. Nó giống như các bạn sinh viên mất trên dưới 10 năm để học y, đi bệnh viện thực hành để nhận diện các mặt bệnh và ghi nhớ rồi sau này ra trường đi làm gặp lại bệnh nhân tương tự thì bộ nhớ đã có để nhận biết. Tuy vậy, máy tính \"học\" nhanh hơn, “nhớ\" chính xác hơn và số lượng dữ liệu nhớ thì gần như bất tận, nên AI giỏi chẩn đoán không kém gì các chuyên gia hàng đầu và nó có thể đđược sao chép lại trên toàn thế giới một cách nhanh chóng và ít tốn kém.\n\n[4] Với chẩn đoán bệnh, AI rất mạnh trong các mảng như phát hiện ung thư phổi hoặc đột quỵ dựa trên các phim chụp: đánh giá nguy cơ đột tử do các bệnh tim dựa trên điện tâm đồ và hình ảnh cắt lớp, cộng hưởng từ tim; phân loại tổn thương da trên những hình ảnh da đđược cung cấp; đánh giá bệnh võng mạc tiểu đường thông qua hình ảnh soi đáy mắt. Ngoài ra, các dự án tham vọng hơn của AI liên quan đến sự kết hợp của nhiều nguồn dữ liệu (cắt lớp, cộng hưởng từ, giải trình gen, dữ liệu bệnh nhân cụ thể, v.v.) để đánh giá một căn bệnh hoặc tiên đoán sự tiến triển của nó. Nghiên cứu và phát triển các loại thuốc chữa bệnh là một quá trình vô cùng tốn kém và mất rất nhiều thời gian. Tuy nhiên, hiện nay AI đã đđược sử dụng thành công trong cả bốn giai đoạn chính của quá trình nghiên cứu và phát triển thuốc, vì vậy, tương lai chúng ta kỳ vọng việc phát triển thuốc sẽ vô cùng nhanh và rẻ hơn nhiều.\n\n[5] Cho đến nay, AI trong y học đã cho thấy nhiều lợi ích tiềm năng. Cơ quan Quản lý thực phẩm - dđược phẩm Hoa Kỳ (FDA) cũng đã phê duyệt một số thuật toán hỗ trợ trong thăm dò chẩn đoán y khoa. Tuy nhiên, để FDA có thể đánh giá chi tiết các quy trình thuật toán này và cấp phép cho các công nghệ AI khác vào y học sẽ còn là một con đường dài phía trước vì có thể sự giải trình các thuật toán (để thuyết phục FDA cũng như các cơ quan chức năng khác) nhiều khi là bí mật của từng công ty cũng như liên quan đến sự độc quyền. Hơn nữa, những người tạo ra các thuật toán không phải lúc nào cũng là bác sĩ điều trị bệnh nhân, do đó, trong một số trường hợp, các nhà khoa học về AI có thể cần phải tìm hiểu thêm về y học. Ở chiều ngđược lại, các bác sĩ lâm sàng cũng cần tìm hiểu thêm về các thuật toán của AI để các ứng dụng đđược tối ưu hóa. Có thể khẳng định, dù AI phát triển trong y học đến đâu cũng không thể thay thế hoàn toàn bác sĩ trong quá trình thăm khám và chữa trị, chẳng hạn như AI không thể thực hiện ca phẫu thuật não tự động – nơi mà đôi khi các bác sĩ phẫu thuật phải thay đổi cách tiếp cận của họ ngay khi tổn thương đđược bộc lộ và nhìn thấy.\n\n(Theo Trần Quốc Khánh, Tạp chí Khoa học và Công nghệ, đăng ngày 31/8/2021)"
          },
          "questions": [
            {
              "question_no": 11,
              "question_type": "drag_drop",
              "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Từ nghiên cứu thử nghiệm phân tích một hình ảnh chụp X-quang ngực của bệnh nhân tại Hàn Quốc, các nhà nghiên cứu khẳng định rằng máy tính có khả năng đưa ra kết quả "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " kết luận của hầu hết các bác sĩ."
                }
              ],
              "items": [],
              "correct_answer": {
                "o1": "vượt trội hơn"
              },
              "explanation": "Đoạn [1] nêu rõ 'kết luận từ máy tính là vượt trội hơn so với 17/18 các bác sĩ tham gia đọc phim'.",
              "points": 1
            },
            {
              "question_no": 12,
              "question_type": "drag_drop",
              "question": "Kéo thả các cụm từ phù hợp vào mỗi chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Theo đoạn [2], trong khi các vùng "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " bị các bác sĩ bỏ qua khi đọc kết quả sinh thiết thì trí tuệ nhân tạo lại có khả năng "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": " các vùng đó một cách chuẩn xác và nhanh chóng."
                }
              ],
              "items": [
                {
                  "id": "i1",
                  "text": "ung thư vú di căn"
                },
                {
                  "id": "i2",
                  "text": "nhuộm màu"
                },
                {
                  "id": "i3",
                  "text": "có nguy cơ ung thư"
                },
                {
                  "id": "i4",
                  "text": "loại bỏ"
                },
                {
                  "id": "i5",
                  "text": "nhận diện"
                }
              ],
              "correct_answer": {
                "o1": "i3",
                "o2": "i5"
              },
              "explanation": "Dựa trên nội dung đoạn [2]: AI phân loại chính xác mẫu là ung thư hay không (nhận diện các vùng có nguy cơ ung thư mà mắt thường không thấy).",
              "points": 1
            },
            {
              "question_no": 13,
              "question_type": "single_choice",
              "question": "Đâu là mục tiêu chính của đoạn [1] và đoạn [2]?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Chứng minh sự phức tạp và khó khăn khi sử dụng trí tuệ nhân tạo trong xét nghiệm và chẩn đoán bệnh."
                },
                {
                  "key": "B",
                  "text": "Kêu gọi sử dụng trí tuệ nhân tạo nhằm giải quyết các vấn đề tồn đọng trong xét nghiệm và chẩn đoán bệnh."
                },
                {
                  "key": "C",
                  "text": "Đánh giá cao sự chính xác và nhanh nhạy của trí tuệ nhân tạo trong phát hiện các bệnh lâm sàng."
                },
                {
                  "key": "D",
                  "text": "Nêu ra các thử nghiệm chứng minh sự thành công của việc sử dụng trí tuệ nhân tạo trong chẩn đoán bệnh."
                }
              ],
              "correct_answer": "D",
              "explanation": "Cả hai đoạn đầu đều đưa ra các trường hợp thử nghiệm thuật toán AI thực tế (DLAD, LYNA năm 2018) và chứng minh tỉ lệ thành công, chính xác cao của chúng.",
              "points": 1
            },
            {
              "question_no": 14,
              "question_type": "true_false",
              "question": "Theo đoạn [3], các phát biểu sau là đúng hay sai?",
              "image_url": "",
              "statements": [
                {
                  "id": "a",
                  "text": "Ứng dụng AI trong y học là việc máy tính sử dụng thông tin y học từ bộ nhớ và dữ liệu của bệnh nhân để đưa ra kết luận."
                },
                {
                  "id": "b",
                  "text": "Ứng dụng AI trong y học có thể giảm chi phí xét nghiệm và chẩn đoán bệnh."
                },
                {
                  "id": "c",
                  "text": "Việc chẩn đoán sử dụng AI gặp khó khăn do AI còn phụ thuộc nhiều vào bác sĩ và không thể đưa ra quyết định độc lập."
                },
                {
                  "id": "d",
                  "text": "AI trong chăm sóc sức khỏe không ám chỉ việc phỏng đoán nguy cơ mắc bệnh của bệnh nhân trong tương lai."
                }
              ],
              "correct_answer": {
                "a": true,
                "b": true,
                "c": false,
                "d": false
              },
              "explanation": "Đoạn 3 có nêu AI phân loại và đưa ra chẩn đoán dựa trên dữ liệu lưu giữ trong bộ nhớ (A đúng), giúp chẩn đoán rẻ hơn (B đúng). Không đề cập AI gặp khó khăn vì quá phụ thuộc bác sĩ trong việc tự chẩn đoán dữ liệu hình ảnh (C sai). AI có sử dụng để 'tiên lượng bệnh', tức là đoán trước tiến triển (D sai).",
              "points": 1
            },
            {
              "question_no": 15,
              "question_type": "drag_drop",
              "question": "Kéo thả các cụm từ phù hợp vào mỗi chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Theo đoạn [4], mặc dù AI đã có những đóng góp quan trọng trong việc xác định mức độ bệnh và "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " từ các hình ảnh và điện tâm đồ, nhưng các nhà khoa học đang nghiên cứu việc sử dụng AI để "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": " các thông tin y học phức tạp hơn nhằm đánh giá và dự đoán sự phát triển của bệnh."
                }
              ],
              "items": [
                {
                  "id": "i1",
                  "text": "tổng hợp"
                },
                {
                  "id": "i2",
                  "text": "thu thập"
                },
                {
                  "id": "i3",
                  "text": "nguy cơ tử vong"
                },
                {
                  "id": "i4",
                  "text": "khả năng hồi phục"
                },
                {
                  "id": "i5",
                  "text": "phân loại"
                }
              ],
              "correct_answer": {
                "o1": "i3",
                "o2": "i1"
              },
              "explanation": "Trong đoạn 4: 'đánh giá nguy cơ đột tử' (nguy cơ tử vong) và 'sự kết hợp của nhiều nguồn dữ liệu' (tổng hợp).",
              "points": 1
            },
            {
              "question_no": 16,
              "question_type": "drag_drop",
              "question": "Điền một cụm từ không quá BA tiếng trong đoạn [4] vào chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Ngoài ứng dụng trong xét nghiệm chẩn đoán các bệnh lý liên quan đến tim, da và võng mạc, AI còn đđược ứng dụng rộng rãi trong quá trình "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " để giảm thiểu thời gian và chi phí sản xuất."
                }
              ],
              "items": [],
              "correct_answer": {
                "o1": "phát triển thuốc"
              },
              "explanation": "Cuối đoạn [4] viết: 'tương lai chúng ta kỳ vọng việc phát triển thuốc sẽ vô cùng nhanh và rẻ hơn nhiều'.",
              "points": 1
            },
            {
              "question_no": 17,
              "question_type": "drag_drop",
              "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Theo đoạn [5], một trong những vấn đề cản trở quy trình thuyết phục các cơ quan chức năng "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " thuật toán trí tuệ nhân tạo sử dụng trong chẩn đoán y khoa là vấn đề "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": " công nghệ."
                }
              ],
              "items": [],
              "correct_answer": {
                "o1": "cấp phép",
                "o2": "độc quyền"
              },
              "explanation": "Đoạn [5]: 'cấp phép cho các công nghệ AI khác vào y học sẽ còn là một con đường dài... liên quan đến sự độc quyền.'",
              "points": 1
            },
            {
              "question_no": 18,
              "question_type": "true_false",
              "question": "Theo đoạn [5], các phát biểu sau đây là đúng hay sai?",
              "image_url": "",
              "statements": [
                {
                  "id": "a",
                  "text": "Phẫu thuật não đòi hỏi bác sĩ phải có sự nhanh nhạy thay đổi phương pháp chữa trị ngay trên bàn mổ."
                },
                {
                  "id": "b",
                  "text": "Hiểu biết về y khoa là một thách thức lớn của các nhà nghiên cứu khi thiết kế công nghệ AI trong y học."
                },
                {
                  "id": "c",
                  "text": "Việc sử dụng AI trong mọi bước điều trị là hoàn toàn có thể khi bác sĩ hiểu biết về các thuật toán AI."
                }
              ],
              "correct_answer": {
                "a": true,
                "b": true,
                "c": false
              },
              "explanation": "Đoạn 5 nhắc tới phẫu thuật não cần bác sĩ thay đổi cách tiếp cận ngay lập tức (A đúng). Nhà khoa học AI cần tìm hiểu thêm y học vì họ không phải lúc nào cũng là bác sĩ (B đúng). Cuối bài khẳng định 'không thể thay thế hoàn toàn bác sĩ', nên dùng AI trong 'mọi bước điều trị' là không thể (C sai).",
              "points": 1
            },
            {
              "question_no": 19,
              "question_type": "single_choice",
              "question": "Tác giả thể hiện thái độ gì về việc ứng dụng AI trong y khoa trong tương lai?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Thận trọng."
                },
                {
                  "key": "B",
                  "text": "Lạc quan."
                },
                {
                  "key": "C",
                  "text": "Kỳ vọng."
                },
                {
                  "key": "D",
                  "text": "Hoài nghi."
                }
              ],
              "correct_answer": "B",
              "explanation": "Tác giả chỉ ra nhiều thành công, kỳ vọng sự tiến bộ (thuốc rẻ hơn, chẩn đoán nhanh hơn) nhưng vẫn đánh giá rõ ràng những mặt chưa làm đđược (không thể thay thế bác sĩ). Sự tin tưởng kết hợp với nhận định khách quan thể hiện thái độ rất lạc quan, tích cực hướng tới tương lai.",
              "points": 1
            },
            {
              "question_no": 20,
              "question_type": "drag_drop",
              "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
              "image_url": "",
              "image_width": 100,
              "explanation": "Đoạn [1] nêu rõ 'kết luận từ máy tính là vượt trội hơn so với 17/18 các bác sĩ tham gia đọc phim'.",
              "points": 1,
              "items": [],
              "body": [
                {
                  "type": "text",
                  "content": "Từ nghiên cứu thử nghiệm phân tích một hình ảnh chụp X-quang ngực của bệnh nhân tại Hàn Quốc, các nhà nghiên cứu khẳng định rằng máy tính có khả năng đưa ra kết quả "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " kết luận của hầu hết các bác sĩ."
                }
              ],
              "correct_answer": {
                "o1": "vượt trội hơn"
              }
            }
          ]
        }
      ],
      "g1": {
        "group_id": "g1",
        "title": "Kiến trúc truyền thống",
        "stimulus": {
          "type": "text",
          "content": "[1] Trên con đường phát triển kiến trúc còn lắm gian nan, đây đó đã bắt đầu xuất hiện một số khuynh hướng sáng tác có tính thử nghiệm. Trong đó khuynh hướng tìm về với quá khứ đã đđược nhiều người nhắc đến và sử dụng, xem như là một giải pháp giàu tính khả thi.\n\n[2] Dường như trong suy nghĩ của chúng ta, kiến trúc truyền thống vẫn chỉ đđược xem như là một chứng nhân của lịch sử, là cuốn biên niên sử đđược viết bằng vật liệu xây dựng của dân tộc. Nếu nghiên cứu sâu hơn một chút chúng ta sẽ thấy lịch sử và hiện tại như là một dòng chảy không ngừng. Lịch sử đã trở thành khuôn phép nội tại, là bối cảnh, là chỗ dựa cho mọi người vững chân trong hiện tại. Trong một chừng mực nào đó, truyền thống là lịch sử nhưng lại quy định phương thức tư duy, phương thức hành vi và trình độ nhận thức của chúng ta. Do đó mà nó có ý nghĩa quy định cho hôm nay và cho cả tương lai. Người phương Đông có câu “Lấy sử làm gương\", kỳ thực kiến trúc truyền thống không những là “gương\" mà còn là một nhân tố quan trọng để cấu thành nên kiến trúc hiện đại. Kiến trúc truyền thống đối với chúng ta không thể là vấn đề có cũng đđược mà không cũng đđược. Nó quy định phương thức, dạng thức của tiến trình hiện đại hóa.\n\n[3] Trong kiến trúc chắc hẳn rồi sẽ xuất hiện nhiều phong cách sáng tác khác nhau vì mỗi kiến trúc sư đều có quyền lựa chọn cho mình một phong cách riêng mà mình ưa thích. Nhưng kiến trúc không phải là cái gì khác, bản chất của nó là nhân hóa. Nó đđược cấu thành bởi phương thức và trình độ nhận thức của con người trong tiến trình phát triển. Nó chọn lọc, lưu giữ những giá trị trường tồn và bất biến qua thời gian đđược nhiều người thừa nhận. Kiến trúc truyền thống Việt Nam đạt đđược trong lịch sử là mật mã di truyền xã hội của con người Việt Nam đã tích lũy và lắng đọng qua hàng ngàn năm phát triển, để rồi đđược gửi gắm tất cả vào hình hài của từng công trình, từng cụm công trình kiến trúc cụ thể.\n\n[4] Bản thân mỗi công trình kiến trúc đều mang trong mình nhiều tầng nghĩa. Trước hết nó đđược xây dựng nhằm đáp ứng những nhu cầu hết sức cụ thể của con người trong cuộc sống như để ăn ở, sinh hoạt... Sau đó nó đđược phủ lên mình một biểu tượng, một hình hài mà chủ thể sáng tạo ra nó muốn gửi gắm vào đấy những tâm tư, tình cảm của họ. Và cuối cùng, cao hơn tất cả, nó đđược khoác lên mình những hình ảnh, những biểu tượng để tượng trưng cho tư tưởng, lối sống, quan niệm thẩm mĩ... của cả một cộng đồng, cả một dân tộc. Chính tầng nghĩa sau cùng này sẽ đđược tích lũy và lắng đọng lâu dài trong lịch sử. Tầng sâu của biểu tượng văn hóa này sẽ chuyển hóa thành tầng ý thức và rồi trở thành thiên tính trong mỗi con người hiện thực chúng ta. Truyền thống đã không ngừng khắc dấu ấn của tổ tiên trên mỗi chúng ta, và kiến trúc chỉ là một trong những đối tượng mà truyền thống đã gửi gắm lại dấu ấn của mình. Vậy nên việc phủ nhận truyền thống trong quá trình sáng tác kiến trúc dường như là một việc làm không thể.\n\n[5] Không thể tách rời hiện đại với truyền thống thành hai đoạn khác nhau, nhưng cũng không có nghĩa là chúng ta không thể vượt qua truyền thống – điều mà Kenzo Tange, kiến trúc sư lỗi lạc người Nhật Bản đã làm đđược cho nền kiến trúc hiện đại của đất nước “Mặt Trời mọc\" bằng nguyên lý phản truyền thống nổi tiếng của ông. Tuy nhiên, điều kiện tiên quyết để vượt qua, vượt lên kiến trúc truyền thống là chúng ta phải nắm chắc đđược nó, hiểu biết tường tận về nó. Chỉ trên cơ sở kế thừa ưu điểm, khắc phục nhđược điểm của kiến trúc truyền thống, chúng ta mới có cơ hội vượt qua nó.\n\n[6] Như một dòng chảy bất tận có đỉnh thịnh và điểm suy, trong quá trình phát triển, các dòng kiến trúc đều có thời kỳ hưng thịnh và suy vong. Song nhìn chung, dòng kiến trúc phát triển sau thường cao hơn dòng kiến trúc phát triển trước, như làn sóng sau xô làn sóng trước, càng về sau càng cao hơn trước nhiều. (Tất nhiên quy luật phát triển ấy không phải là con đường hoàn toàn bằng phẳng, đã có lúc kiến trúc phát triển quanh co và bao hàm cả nhân tố thụt lùi.) Hiểu rõ quá trình phát triển này của lịch sử, chúng ta hoàn toàn không cần thiết đem truyền thống và hiện đại đối lập nhau.\n\n[7] Lịch sử cũng cho chúng ta những ví dụ vĩ đại về sự suy vong rồi lại đđược phát triển trên cơ sở mới. Như kiến trúc cổ Hy Lạp đã tàn lụi ở thời Trung cổ, đến thế kỷ XV phong trào nghệ thuật Phục hưng đã hồi sinh nó và đưa nó lên một tầm cao mới. Kiến trúc truyền thống Việt Nam cũng không là ngoại lệ, vẫn đang chờ đợi một cơ hội phục hưng thực sự và nếu như nó lại đđược bay bổng lên một lần nữa (sau phong trào kiến trúc Đông Dương đặc sắc đầu thế kỷ XX) thì sẽ huy hoàng biết chừng nào! Thế kỷ XXI là thế kỷ của văn hóa. Kiến trúc truyền thống Việt Nam đang đứng trước vận hội lớn của mình và tất cả chúng ta đều kỳ vọng vào điều đó.\n\n(Theo Lê Hữu Trúc, Báo Điện tử Văn nghệ Quân đội, đăng ngày 08/3/2024)"
        },
        "questions": [
          {
            "question_no": 1,
            "question_type": "single_choice",
            "question": "Theo đoạn [1], xu thế khám phá và tái hiện quá khứ trong kiến trúc đđược coi là một giải pháp giàu tính thực tiễn. Đúng hay sai?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Đúng"
              },
              {
                "key": "B",
                "text": "Sai"
              }
            ],
            "correct_answer": "A",
            "explanation": "Trong đoạn [1], tác giả nhắc đến 'khuynh hướng tìm về với quá khứ... xem như là một giải pháp giàu tính khả thi'. Khả thi đồng nghĩa với có tính thực tiễn cao.",
            "points": 1
          },
          {
            "question_no": 2,
            "question_type": "multiple_choice",
            "question": "Theo đoạn [2], những điều nào sau đây là đúng về kiến trúc truyền thống? Chọn HAI đáp án đúng.",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Kiến trúc truyền thống vốn đđược nhìn nhận như một loại di sản xây dựng bằng vật liệu dân tộc."
              },
              {
                "key": "B",
                "text": "Kiến trúc truyền thống đđược xem như là một chứng nhân lịch sử cần lưu giữ mãi mãi cho đời sau."
              },
              {
                "key": "C",
                "text": "Kiến trúc truyền thống góp phần thúc đẩy quá trình phát triển nhận thức của con người."
              },
              {
                "key": "D",
                "text": "Kiến trúc truyền thống góp một phần quan trọng trong việc cấu thành kiến trúc hiện đại."
              }
            ],
            "correct_answer": [
              "A",
              "D"
            ],
            "explanation": "Đoạn [2] có nêu kiến trúc truyền thống 'đđược xem như là một chứng nhân của lịch sử, là cuốn biên niên sử đđược viết bằng vật liệu xây dựng' (Đáp án A) và 'là một nhân tố quan trọng để cấu thành nên kiến trúc hiện đại' (Đáp án D).",
            "points": 1
          },
          {
            "question_no": 3,
            "question_type": "drag_drop",
            "question": "Tìm cụm từ không quá BỐN tiếng trong bài để trả lời cho câu hỏi sau: Hình ảnh nào thể hiện sự liên kết giữa lịch sử và hiện đại thông qua kiến trúc truyền thống?",
            "image_url": "",
            "body": [
              {
                "type": "blank",
                "id": "o1"
              }
            ],
            "items": [],
            "correct_answer": {
              "o1": "dòng chảy"
            },
            "explanation": "Đoạn [2] viết: 'lịch sử và hiện tại như là một dòng chảy không ngừng'.",
            "points": 1
          },
          {
            "question_no": 4,
            "question_type": "true_false",
            "question": "Theo đoạn [3], các nhận định sau đúng hay sai?",
            "image_url": "",
            "statements": [
              {
                "id": "a",
                "text": "Kiến trúc đđược cấu thành bởi phương thức và trình độ nhận thức của con người."
              },
              {
                "id": "b",
                "text": "Tất cả các công trình là sản phẩm lựa chọn cá nhân của kiến trúc sư."
              },
              {
                "id": "c",
                "text": "Mật mã di truyền xã hội đđược thể hiện trong các công trình kiến trúc hiện đại."
              },
              {
                "id": "d",
                "text": "Mỗi kiến trúc sư có quyền tự do chọn lựa phong cách sáng tạo phản ánh cá nhân."
              }
            ],
            "correct_answer": {
              "a": true,
              "b": false,
              "c": false,
              "d": true
            },
            "explanation": "Phát biểu A đúng theo câu 'Nó đđược cấu thành bởi phương thức và trình độ nhận thức của con người'. Phát biểu B sai vì kiến trúc còn mang bản chất nhân hóa, lưu giữ giá trị chung chứ không chỉ là lựa chọn cá nhân. Phát biểu C sai vì đoạn 3 nhắc tới kiến trúc truyền thống là mật mã di truyền, không phải kiến trúc hiện đại. Phát biểu D đúng theo câu 'mỗi kiến trúc sư đều có quyền lựa chọn cho mình một phong cách riêng'.",
            "points": 1
          },
          {
            "question_no": 5,
            "question_type": "drag_drop",
            "question": "Kéo các cụm từ trong các ô dưới đây thả vào vị trí phù hợp để mô tả chính xác mục đích các tầng nghĩa trong các công trình kiến trúc:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "- Tầng nghĩa tượng trưng: "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": "\n- Tầng nghĩa biểu tượng: "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": "\n- Tầng nghĩa cơ bản: "
              },
              {
                "type": "blank",
                "id": "o3"
              }
            ],
            "items": [
              {
                "id": "i1",
                "text": "Truyền tải tâm trạng, tình cảm của người sáng tác"
              },
              {
                "id": "i2",
                "text": "Mô tả tư tưởng, phong cách sống của một cộng đồng"
              },
              {
                "id": "i3",
                "text": "Biến đổi tầng ý thức và bản tính của con người hiện đại"
              },
              {
                "id": "i4",
                "text": "Đáp ứng các nhu cầu cụ thể trong đời sống con người"
              }
            ],
            "correct_answer": {
              "o1": "i2",
              "o2": "i1",
              "o3": "i4"
            },
            "explanation": "Dựa vào đoạn [4]: Tầng cơ bản là đáp ứng nhu cầu cụ thể (i4). Tầng biểu tượng là hình hài gửi gắm tâm tư, tình cảm người sáng tác (i1). Tầng cao nhất (tượng trưng) là biểu tượng cho tư tưởng, lối sống của cộng đồng (i2).",
            "points": 1
          },
          {
            "question_no": 6,
            "question_type": "drag_drop",
            "question": "Điền một từ không quá HAI tiếng trong đoạn [4] vào mỗi chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Các tầng nghĩa trong mỗi công trình kiến trúc đều lưu lại những "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " quan trọng của lịch sử dân tộc. Vì thế, sự công nhận tính "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": " trong sáng tác kiến trúc đã trở nên ngày một hiển nhiên hơn."
              }
            ],
            "items": [],
            "correct_answer": {
              "o1": "dấu ấn",
              "o2": "truyền thống"
            },
            "explanation": "Đoạn [4] có viết: 'Truyền thống đã không ngừng khắc dấu ấn của tổ tiên... kiến trúc chỉ là một trong những đối tượng mà truyền thống đã gửi gắm lại dấu ấn của mình. Vậy nên việc phủ nhận truyền thống trong quá trình sáng tác... dường như là việc làm không thể'.",
            "points": 1
          },
          {
            "question_no": 7,
            "question_type": "true_false",
            "question": "Theo đoạn [5], các nhận định sau đúng hay sai?",
            "image_url": "",
            "statements": [
              {
                "id": "a",
                "text": "Kiến trúc hiện đại luôn ưu việt hơn kiến trúc truyền thống."
              },
              {
                "id": "b",
                "text": "Phản truyền thống là sáng tạo ra các công trình với chất liệu hoàn toàn mới."
              },
              {
                "id": "c",
                "text": "Điều kiện tiên quyết để vượt qua truyền thống là hiểu biết và nắm chắc nó."
              },
              {
                "id": "d",
                "text": "Việc phản truyền thống đồng nghĩa với việc loại bỏ truyền thống."
              }
            ],
            "correct_answer": {
              "a": false,
              "b": false,
              "c": true,
              "d": false
            },
            "explanation": "Trong đoạn [5], tác giả nhấn mạnh 'điều kiện tiên quyết để vượt qua... là chúng ta phải nắm chắc đđược nó' (C đúng). Các ý A, B, D không đđược đề cập hoặc đi ngđược lại quan điểm của tác giả ('chỉ trên cơ sở kế thừa ưu điểm, khắc phục nhđược điểm...').",
            "points": 1
          },
          {
            "question_no": 8,
            "question_type": "true_false",
            "question": "Theo đoạn [6], các nhận định sau đúng hay sai?",
            "image_url": "",
            "statements": [
              {
                "id": "a",
                "text": "Dòng kiến trúc phát triển sau luôn cao hơn dòng kiến trúc phát triển trước."
              },
              {
                "id": "b",
                "text": "Các dòng kiến trúc thường trải qua các giai đoạn thịnh vượng và suy tàn."
              },
              {
                "id": "c",
                "text": "Tất cả các dòng kiến trúc đều cùng tuân theo một quy luật phát triển."
              }
            ],
            "correct_answer": {
              "a": false,
              "b": true,
              "c": false
            },
            "explanation": "Đoạn [6] nêu dòng phát triển sau 'nhìn chung' (không phải 'luôn') cao hơn trước -> A sai. 'Các dòng kiến trúc đều có thời kỳ hưng thịnh và suy vong' -> B đúng. 'Quy luật phát triển ấy không phải là con đường hoàn toàn bằng phẳng' (có quanh co/thụt lùi) -> C sai.",
            "points": 1
          },
          {
            "question_no": 9,
            "question_type": "drag_drop",
            "question": "Điền một từ không quá HAI tiếng trong hai đoạn cuối vào mỗi chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Hiểu rõ quá trình phát triển lịch sử, chúng ta không cần phải "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " truyền thống và hiện đại. Lịch sử cung cấp những ví dụ về sự "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": " và hồi sinh, như phong trào nghệ thuật Phục hưng đã hồi sinh kiến trúc cổ Hy Lạp. Kiến trúc truyền thống Việt Nam cũng đang chờ đợi cơ hội phục hưng, trong thế kỷ XXI đầy triển vọng cho "
              },
              {
                "type": "blank",
                "id": "o3"
              }
            ],
            "items": [],
            "correct_answer": {
              "o1": "đối lập",
              "o2": "suy vong",
              "o3": "văn hóa"
            },
            "explanation": "Đoạn [6] có câu: 'hoàn toàn không cần thiết đem truyền thống và hiện đại đối lập nhau'. Đoạn [7] nhắc đến 'sự suy vong rồi lại đđược phát triển' và 'Thế kỷ XXI là thế kỷ của văn hóa'.",
            "points": 1
          },
          {
            "question_no": 10,
            "question_type": "single_choice",
            "question": "Nội dung chính của bài viết là gì?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Kiến trúc truyền thống chứa đựng những tầng nghĩa mang giá trị trường tồn trong kiến trúc hiện đại."
              },
              {
                "key": "B",
                "text": "Hiện đại hóa kiến trúc không đòi hỏi áp dụng những phong cách mới mà đòi hỏi sự hiểu biết sâu sắc về truyền thống."
              },
              {
                "key": "C",
                "text": "Quá trình phát triển kiến trúc luôn tạo cơ hội thuận lợi cho phát triển phong cách cá nhân và nhận thức con người."
              },
              {
                "key": "D",
                "text": "Hiểu biết sâu sắc về kiến trúc truyền thống là điều kiện cần và quan trọng trong quá trình hiện đại hóa kiến trúc."
              }
            ],
            "correct_answer": "D",
            "explanation": "Xuyên suốt bài viết, tác giả khẳng định kiến trúc truyền thống quy định tiến trình hiện đại hóa, không thể tách rời, và hiểu biết sâu sắc về nó là điều kiện tiên quyết để vượt qua, phục hưng và phát triển kiến trúc.",
            "points": 1
          }
        ]
      },
      "g2": {
        "group_id": "g2",
        "title": "Ứng dụng trí tuệ nhân tạo trong y học",
        "stimulus": {
          "type": "text",
          "content": "[1] Năm 2018, các nhà nghiên cứu tại Bệnh viện Đại học Quốc gia Seoul (Hàn Quốc) đã phát triển một thuật toán AI gọi là DLAD (Deep Learning based Automatic Detection) để phân tích hình ảnh chụp X-quang ngực cũng như phát hiện sự phát triển bất thường của tế bào (nguyên nhân gây ra bệnh ung thư). Cùng một hình ảnh phim chụp, kết quả đọc của máy tính sẽ đđược so sánh với kết quả đọc của nhiều bác sĩ khác nhau và thật ngạc nhiên khi những kết luận từ máy tính là vượt trội hơn so với 17/18 các bác sĩ tham gia đọc phim.\n\n[2] Cũng trong năm 2018, thuật toán thứ hai đđược phát triển bởi các nhà nghiên cứu tại Google AI Healthcare. Họ tạo ra một thuật toán gọi là LYNA (Lymph Node Assistant) giúp phân tích các mẫu bệnh phẩm nhuộm màu để xác định khối ung thư vú di căn từ hạch bạch huyết. Kết quả rất thú vị khi thuật toán này có thể xác định các vùng khả nghi mà mắt thường của con người không thể phân biệt đđược trong các mẫu sinh thiết đđược đưa ra. LYNA thử nghiệm trên hai tập dữ liệu và đđược chứng minh là phân loại chính xác mẫu là ung thư hay không phải ung thư chính xác lên đến 99%. Hơn nữa, thời gian đọc của LYNA nhanh gấp đôi thời gian đọc bởi các bác sĩ thực hành.\n\n[3] AI trong chăm sóc sức khỏe là một thuật ngữ bao quát đđược sử dụng để mô tả việc ứng dụng các thuật toán và phần mềm máy tính học đđược nhằm bắt chước nhận thức của con người trong việc phân tích, chẩn đoán, đưa ra các chỉ dẫn trong quá trình thăm khám, chẩn đoán, điều trị và tiên lượng bệnh. Gần đây, AI đã đạt đđược những tiến bộ to lớn trong việc tự động chẩn đoán bệnh, giúp cho việc chẩn đoán rẻ, nhanh và dễ tiếp cận hơn. Các dữ liệu khổng lồ về hình ảnh bình thường, bệnh lý, các chỉ số cơ thể... sẽ đđược các nhà khoa học “dán nhãn\", nạp vào máy tính, sắp xếp, xử lý, v.v., từ đó máy tính có thể nhận diện, phân loại rồi đưa ra các chẩn đoán khi chúng tiếp xúc với một dữ liệu nào đó của bệnh nhân. Nó giống như các bạn sinh viên mất trên dưới 10 năm để học y, đi bệnh viện thực hành để nhận diện các mặt bệnh và ghi nhớ rồi sau này ra trường đi làm gặp lại bệnh nhân tương tự thì bộ nhớ đã có để nhận biết. Tuy vậy, máy tính \"học\" nhanh hơn, “nhớ\" chính xác hơn và số lượng dữ liệu nhớ thì gần như bất tận, nên AI giỏi chẩn đoán không kém gì các chuyên gia hàng đầu và nó có thể đđược sao chép lại trên toàn thế giới một cách nhanh chóng và ít tốn kém.\n\n[4] Với chẩn đoán bệnh, AI rất mạnh trong các mảng như phát hiện ung thư phổi hoặc đột quỵ dựa trên các phim chụp: đánh giá nguy cơ đột tử do các bệnh tim dựa trên điện tâm đồ và hình ảnh cắt lớp, cộng hưởng từ tim; phân loại tổn thương da trên những hình ảnh da đđược cung cấp; đánh giá bệnh võng mạc tiểu đường thông qua hình ảnh soi đáy mắt. Ngoài ra, các dự án tham vọng hơn của AI liên quan đến sự kết hợp của nhiều nguồn dữ liệu (cắt lớp, cộng hưởng từ, giải trình gen, dữ liệu bệnh nhân cụ thể, v.v.) để đánh giá một căn bệnh hoặc tiên đoán sự tiến triển của nó. Nghiên cứu và phát triển các loại thuốc chữa bệnh là một quá trình vô cùng tốn kém và mất rất nhiều thời gian. Tuy nhiên, hiện nay AI đã đđược sử dụng thành công trong cả bốn giai đoạn chính của quá trình nghiên cứu và phát triển thuốc, vì vậy, tương lai chúng ta kỳ vọng việc phát triển thuốc sẽ vô cùng nhanh và rẻ hơn nhiều.\n\n[5] Cho đến nay, AI trong y học đã cho thấy nhiều lợi ích tiềm năng. Cơ quan Quản lý thực phẩm - dđược phẩm Hoa Kỳ (FDA) cũng đã phê duyệt một số thuật toán hỗ trợ trong thăm dò chẩn đoán y khoa. Tuy nhiên, để FDA có thể đánh giá chi tiết các quy trình thuật toán này và cấp phép cho các công nghệ AI khác vào y học sẽ còn là một con đường dài phía trước vì có thể sự giải trình các thuật toán (để thuyết phục FDA cũng như các cơ quan chức năng khác) nhiều khi là bí mật của từng công ty cũng như liên quan đến sự độc quyền. Hơn nữa, những người tạo ra các thuật toán không phải lúc nào cũng là bác sĩ điều trị bệnh nhân, do đó, trong một số trường hợp, các nhà khoa học về AI có thể cần phải tìm hiểu thêm về y học. Ở chiều ngđược lại, các bác sĩ lâm sàng cũng cần tìm hiểu thêm về các thuật toán của AI để các ứng dụng đđược tối ưu hóa. Có thể khẳng định, dù AI phát triển trong y học đến đâu cũng không thể thay thế hoàn toàn bác sĩ trong quá trình thăm khám và chữa trị, chẳng hạn như AI không thể thực hiện ca phẫu thuật não tự động – nơi mà đôi khi các bác sĩ phẫu thuật phải thay đổi cách tiếp cận của họ ngay khi tổn thương đđược bộc lộ và nhìn thấy.\n\n(Theo Trần Quốc Khánh, Tạp chí Khoa học và Công nghệ, đăng ngày 31/8/2021)"
        },
        "questions": [
          {
            "question_no": 11,
            "question_type": "drag_drop",
            "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Từ nghiên cứu thử nghiệm phân tích một hình ảnh chụp X-quang ngực của bệnh nhân tại Hàn Quốc, các nhà nghiên cứu khẳng định rằng máy tính có khả năng đưa ra kết quả "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " kết luận của hầu hết các bác sĩ."
              }
            ],
            "items": [],
            "correct_answer": {
              "o1": "vượt trội hơn"
            },
            "explanation": "Đoạn [1] nêu rõ 'kết luận từ máy tính là vượt trội hơn so với 17/18 các bác sĩ tham gia đọc phim'.",
            "points": 1
          },
          {
            "question_no": 12,
            "question_type": "drag_drop",
            "question": "Kéo thả các cụm từ phù hợp vào mỗi chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Theo đoạn [2], trong khi các vùng "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " bị các bác sĩ bỏ qua khi đọc kết quả sinh thiết thì trí tuệ nhân tạo lại có khả năng "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": " các vùng đó một cách chuẩn xác và nhanh chóng."
              }
            ],
            "items": [
              {
                "id": "i1",
                "text": "ung thư vú di căn"
              },
              {
                "id": "i2",
                "text": "nhuộm màu"
              },
              {
                "id": "i3",
                "text": "có nguy cơ ung thư"
              },
              {
                "id": "i4",
                "text": "loại bỏ"
              },
              {
                "id": "i5",
                "text": "nhận diện"
              }
            ],
            "correct_answer": {
              "o1": "i3",
              "o2": "i5"
            },
            "explanation": "Dựa trên nội dung đoạn [2]: AI phân loại chính xác mẫu là ung thư hay không (nhận diện các vùng có nguy cơ ung thư mà mắt thường không thấy).",
            "points": 1
          },
          {
            "question_no": 13,
            "question_type": "single_choice",
            "question": "Đâu là mục tiêu chính của đoạn [1] và đoạn [2]?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Chứng minh sự phức tạp và khó khăn khi sử dụng trí tuệ nhân tạo trong xét nghiệm và chẩn đoán bệnh."
              },
              {
                "key": "B",
                "text": "Kêu gọi sử dụng trí tuệ nhân tạo nhằm giải quyết các vấn đề tồn đọng trong xét nghiệm và chẩn đoán bệnh."
              },
              {
                "key": "C",
                "text": "Đánh giá cao sự chính xác và nhanh nhạy của trí tuệ nhân tạo trong phát hiện các bệnh lâm sàng."
              },
              {
                "key": "D",
                "text": "Nêu ra các thử nghiệm chứng minh sự thành công của việc sử dụng trí tuệ nhân tạo trong chẩn đoán bệnh."
              }
            ],
            "correct_answer": "D",
            "explanation": "Cả hai đoạn đầu đều đưa ra các trường hợp thử nghiệm thuật toán AI thực tế (DLAD, LYNA năm 2018) và chứng minh tỉ lệ thành công, chính xác cao của chúng.",
            "points": 1
          },
          {
            "question_no": 14,
            "question_type": "true_false",
            "question": "Theo đoạn [3], các phát biểu sau là đúng hay sai?",
            "image_url": "",
            "statements": [
              {
                "id": "a",
                "text": "Ứng dụng AI trong y học là việc máy tính sử dụng thông tin y học từ bộ nhớ và dữ liệu của bệnh nhân để đưa ra kết luận."
              },
              {
                "id": "b",
                "text": "Ứng dụng AI trong y học có thể giảm chi phí xét nghiệm và chẩn đoán bệnh."
              },
              {
                "id": "c",
                "text": "Việc chẩn đoán sử dụng AI gặp khó khăn do AI còn phụ thuộc nhiều vào bác sĩ và không thể đưa ra quyết định độc lập."
              },
              {
                "id": "d",
                "text": "AI trong chăm sóc sức khỏe không ám chỉ việc phỏng đoán nguy cơ mắc bệnh của bệnh nhân trong tương lai."
              }
            ],
            "correct_answer": {
              "a": true,
              "b": true,
              "c": false,
              "d": false
            },
            "explanation": "Đoạn 3 có nêu AI phân loại vđđược đưa ra chẩn đoán dựa trên dữ liệu lưu giữ trong bộ nhớ (A đúng), giúp chẩn đoán rẻ hơn (B đúng). Không đề cập AI gặp khó khăn vì quá phụ thuộc bác sĩ trong việc tự chẩn đoán dữ liệu hình ảnh (C sai). AI có sử dụng để 'tiên lượng bệnh', tức là đoán trước tiến triển (D sai).",
            "points": 1
          },
          {
            "question_no": 15,
            "question_type": "drag_drop",
            "question": "Kéo thả các cụm từ phù hợp vào mỗi chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Theo đoạn [4], mặc dù AI đã có những đóng góp quan trọng trong việc xác định mức độ bệnh và "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " từ các hình ảnh và điện tâm đồ, nhưng các nhà khoa học đang nghiên cứu việc sử dụng AI để "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": " các thông tin y học phức tạp hơn nhằm đánh giá và dự đoán sự phát triển của bệnh."
              }
            ],
            "items": [
              {
                "id": "i1",
                "text": "tổng hợp"
              },
              {
                "id": "i2",
                "text": "thu thập"
              },
              {
                "id": "i3",
                "text": "nguy cơ tử vong"
              },
              {
                "id": "i4",
                "text": "khả năng hồi phục"
              },
              {
                "id": "i5",
                "text": "phân loại"
              }
            ],
            "correct_answer": {
              "o1": "i3",
              "o2": "i1"
            },
            "explanation": "Trong đoạn 4: 'đánh giá nguy cơ đột tử' (nguy cơ tử vong) và 'sự kết hợp của nhiều nguồn dữ liệu' (tổng hợp).",
            "points": 1
          },
          {
            "question_no": 16,
            "question_type": "drag_drop",
            "question": "Điền một cụm từ không quá BA tiếng trong đoạn [4] vào chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Ngoài ứng dụng trong xét nghiệm chẩn đoán các bệnh lý liên quan đến tim, da và võng mạc, AI còn đđược ứng dụng rộng rãi trong quá trình "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " để giảm thiểu thời gian và chi phí sản xuất."
              }
            ],
            "items": [],
            "correct_answer": {
              "o1": "phát triển thuốc"
            },
            "explanation": "Cuối đoạn [4] viết: 'tương lai chúng ta kỳ vọng việc phát triển thuốc sẽ vô cùng nhanh và rẻ hơn nhiều'.",
            "points": 1
          },
          {
            "question_no": 17,
            "question_type": "drag_drop",
            "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Theo đoạn [5], một trong những vấn đề cản trở quy trình thuyết phục các cơ quan chức năng "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " thuật toán trí tuệ nhân tạo sử dụng trong chẩn đoán y khoa là vấn đề "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": " công nghệ."
              }
            ],
            "items": [],
            "correct_answer": {
              "o1": "cấp phép",
              "o2": "độc quyền"
            },
            "explanation": "Đoạn [5]: 'cấp phép cho các công nghệ AI khác vào y học sẽ còn là một con đường dài... liên quan đến sự độc quyền.'",
            "points": 1
          },
          {
            "question_no": 18,
            "question_type": "true_false",
            "question": "Theo đoạn [5], các phát biểu sau đây là đúng hay sai?",
            "image_url": "",
            "statements": [
              {
                "id": "a",
                "text": "Phẫu thuật não đòi hỏi bác sĩ phải có sự nhanh nhạy thay đổi phương pháp chữa trị ngay trên bàn mổ."
              },
              {
                "id": "b",
                "text": "Hiểu biết về y khoa là một thách thức lớn của các nhà nghiên cứu khi thiết kế công nghệ AI trong y học."
              },
              {
                "id": "c",
                "text": "Việc sử dụng AI trong mọi bước điều trị là hoàn toàn có thể khi bác sĩ hiểu biết về các thuật toán AI."
              }
            ],
            "correct_answer": {
              "a": true,
              "b": true,
              "c": false
            },
            "explanation": "Đoạn 5 nhắc tới phẫu thuật não cần bác sĩ thay đổi cách tiếp cận ngay lập tức (A đúng). Nhà khoa học AI cần tìm hiểu thêm y học vì họ không phải lúc nào cũng là bác sĩ (B đúng). Cuối bài khẳng định 'không thể thay thế hoàn toàn bác sĩ', nên dùng AI trong 'mọi bước điều trị' là không thể (C sai).",
            "points": 1
          },
          {
            "question_no": 19,
            "question_type": "single_choice",
            "question": "Tác giả thể hiện thái độ gì về việc ứng dụng AI trong y khoa trong tương lai?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Thận trọng."
              },
              {
                "key": "B",
                "text": "Lạc quan."
              },
              {
                "key": "C",
                "text": "Kỳ vọng."
              },
              {
                "key": "D",
                "text": "Hoài nghi."
              }
            ],
            "correct_answer": "B",
            "explanation": "Tác giả chỉ ra nhiều thành công, kỳ vọng sự tiến bộ (thuốc rẻ hơn, chẩn đoán nhanh hơn) nhưng vẫn đánh giá rõ ràng những mặt chưa làm đđược (không thể thay thế bác sĩ). Sự tin tưởng kết hợp với nhận định khách quan thể hiện thái độ rất lạc quan, tích cực hướng tới tương lai.",
            "points": 1
          },
          {
            "question_no": 20,
            "question_type": "drag_drop",
            "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
            "image_url": "",
            "image_width": 100,
            "explanation": "Đoạn [1] nêu rõ 'kết luận từ máy tính là vượt trội hơn so với 17/18 các bác sĩ tham gia đọc phim'.",
            "points": 1,
            "items": [],
            "body": [
              {
                "type": "text",
                "content": "Từ nghiên cứu thử nghiệm phân tích một hình ảnh chụp X-quang ngực của bệnh nhân tại Hàn Quốc, các nhà nghiên cứu khẳng định rằng máy tính có khả năng đưa ra kết quả "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " kết luận của hầu hết các bác sĩ."
              }
            ],
            "correct_answer": {
              "o1": "vượt trội hơn"
            }
          }
        ]
      },
      "g1_questions": [
        {
          "question_no": 1,
          "question_type": "single_choice",
          "question": "Theo đoạn [1], xu thế khám phá và tái hiện quá khứ trong kiến trúc đđược coi là một giải pháp giàu tính thực tiễn. Đúng hay sai?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Đúng"
            },
            {
              "key": "B",
              "text": "Sai"
            }
          ],
          "correct_answer": "A",
          "explanation": "Trong đoạn [1], tác giả nhắc đến 'khuynh hướng tìm về với quá khứ... xem như là một giải pháp giàu tính khả thi'. Khả thi đồng nghĩa với có tính thực tiễn cao.",
          "points": 1
        },
        {
          "question_no": 2,
          "question_type": "multiple_choice",
          "question": "Theo đoạn [2], những điều nào sau đây là đúng về kiến trúc truyền thống? Chọn HAI đáp án đúng.",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Kiến trúc truyền thống vốn đđược nhìn nhận như một loại di sản xây dựng bằng vật liệu dân tộc."
            },
            {
              "key": "B",
              "text": "Kiến trúc truyền thống đđược xem như là một chứng nhân lịch sử cần lưu giữ mãi mãi cho đời sau."
            },
            {
              "key": "C",
              "text": "Kiến trúc truyền thống góp phần thúc đẩy quá trình phát triển nhận thức của con người."
            },
            {
              "key": "D",
              "text": "Kiến trúc truyền thống góp một phần quan trọng trong việc cấu thành kiến trúc hiện đại."
            }
          ],
          "correct_answer": [
            "A",
            "D"
          ],
          "explanation": "Đoạn [2] có nêu kiến trúc truyền thống 'đđược xem như là một chứng nhân của lịch sử, là cuốn biên niên sử đđược viết bằng vật liệu xây dựng' (Đáp án A) và 'là một nhân tố quan trọng để cấu thành nên kiến trúc hiện đại' (Đáp án D).",
          "points": 1
        },
        {
          "question_no": 3,
          "question_type": "drag_drop",
          "question": "Tìm cụm từ không quá BỐN tiếng trong bài để trả lời cho câu hỏi sau: Hình ảnh nào thể hiện sự liên kết giữa lịch sử và hiện đại thông qua kiến trúc truyền thống?",
          "image_url": "",
          "body": [
            {
              "type": "blank",
              "id": "o1"
            }
          ],
          "items": [],
          "correct_answer": {
            "o1": "dòng chảy"
          },
          "explanation": "Đoạn [2] viết: 'lịch sử và hiện tại như là một dòng chảy không ngừng'.",
          "points": 1
        },
        {
          "question_no": 4,
          "question_type": "true_false",
          "question": "Theo đoạn [3], các nhận định sau đúng hay sai?",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "Kiến trúc đđược cấu thành bởi phương thức và trình độ nhận thức của con người."
            },
            {
              "id": "b",
              "text": "Tất cả các công trình là sản phẩm lựa chọn cá nhân của kiến trúc sư."
            },
            {
              "id": "c",
              "text": "Mật mã di truyền xã hội đđược thể hiện trong các công trình kiến trúc hiện đại."
            },
            {
              "id": "d",
              "text": "Mỗi kiến trúc sư có quyền tự do chọn lựa phong cách sáng tạo phản ánh cá nhân."
            }
          ],
          "correct_answer": {
            "a": true,
            "b": false,
            "c": false,
            "d": true
          },
          "explanation": "Phát biểu A đúng theo câu 'Nó đđược cấu thành bởi phương thức và trình độ nhận thức của con người'. Phát biểu B sai vì kiến trúc còn mang bản chất nhân hóa, lưu giữ giá trị chung chứ không chỉ là lựa chọn cá nhân. Phát biểu C sai vì đoạn 3 nhắc tới kiến trúc truyền thống là mật mã di truyền, không phải kiến trúc hiện đại. Phát biểu D đúng theo câu 'mỗi kiến trúc sư đều có quyền lựa chọn cho mình một phong cách riêng'.",
          "points": 1
        },
        {
          "question_no": 5,
          "question_type": "drag_drop",
          "question": "Kéo các cụm từ trong các ô dưới đây thả vào vị trí phù hợp để mô tả chính xác mục đích các tầng nghĩa trong các công trình kiến trúc:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "- Tầng nghĩa tượng trưng: "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": "\n- Tầng nghĩa biểu tượng: "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": "\n- Tầng nghĩa cơ bản: "
            },
            {
              "type": "blank",
              "id": "o3"
            }
          ],
          "items": [
            {
              "id": "i1",
              "text": "Truyền tải tâm trạng, tình cảm của người sáng tác"
            },
            {
              "id": "i2",
              "text": "Mô tả tư tưởng, phong cách sống của một cộng đồng"
            },
            {
              "id": "i3",
              "text": "Biến đổi tầng ý thức và bản tính của con người hiện đại"
            },
            {
              "id": "i4",
              "text": "Đáp ứng các nhu cầu cụ thể trong đời sống con người"
            }
          ],
          "correct_answer": {
            "o1": "i2",
            "o2": "i1",
            "o3": "i4"
          },
          "explanation": "Dựa vào đoạn [4]: Tầng cơ bản là đáp ứng nhu cầu cụ thể (i4). Tầng biểu tượng là hình hài gửi gắm tâm tư, tình cảm người sáng tác (i1). Tầng cao nhất (tượng trưng) là biểu tượng cho tư tưởng, lối sống của cộng đồng (i2).",
          "points": 1
        },
        {
          "question_no": 6,
          "question_type": "drag_drop",
          "question": "Điền một từ không quá HAI tiếng trong đoạn [4] vào mỗi chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Các tầng nghĩa trong mỗi công trình kiến trúc đều lưu lại những "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " quan trọng của lịch sử dân tộc. Vì thế, sự công nhận tính "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " trong sáng tác kiến trúc đã trở nên ngày một hiển nhiên hơn."
            }
          ],
          "items": [],
          "correct_answer": {
            "o1": "dấu ấn",
            "o2": "truyền thống"
          },
          "explanation": "Đoạn [4] có viết: 'Truyền thống đã không ngừng khắc dấu ấn của tổ tiên... kiến trúc chỉ là một trong những đối tượng mà truyền thống đã gửi gắm lại dấu ấn của mình. Vậy nên việc phủ nhận truyền thống trong quá trình sáng tác... dường như là việc làm không thể'.",
          "points": 1
        },
        {
          "question_no": 7,
          "question_type": "true_false",
          "question": "Theo đoạn [5], các nhận định sau đúng hay sai?",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "Kiến trúc hiện đại luôn ưu việt hơn kiến trúc truyền thống."
            },
            {
              "id": "b",
              "text": "Phản truyền thống là sáng tạo ra các công trình với chất liệu hoàn toàn mới."
            },
            {
              "id": "c",
              "text": "Điều kiện tiên quyết để vượt qua truyền thống là hiểu biết và nắm chắc nó."
            },
            {
              "id": "d",
              "text": "Việc phản truyền thống đồng nghĩa với việc loại bỏ truyền thống."
            }
          ],
          "correct_answer": {
            "a": false,
            "b": false,
            "c": true,
            "d": false
          },
          "explanation": "Trong đoạn [5], tác giả nhấn mạnh 'điều kiện tiên quyết để vượt qua... là chúng ta phải nắm chắc đđược nó' (C đúng). Các ý A, B, D không đđược đề cập hoặc đi ngđược lại quan điểm của tác giả ('chỉ trên cơ sở kế thừa ưu điểm, khắc phục nhđược điểm...').",
          "points": 1
        },
        {
          "question_no": 8,
          "question_type": "true_false",
          "question": "Theo đoạn [6], các nhận định sau đúng hay sai?",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "Dòng kiến trúc phát triển sau luôn cao hơn dòng kiến trúc phát triển trước."
            },
            {
              "id": "b",
              "text": "Các dòng kiến trúc thường trải qua các giai đoạn thịnh vượng và suy tàn."
            },
            {
              "id": "c",
              "text": "Tất cả các dòng kiến trúc đều cùng tuân theo một quy luật phát triển."
            }
          ],
          "correct_answer": {
            "a": false,
            "b": true,
            "c": false
          },
          "explanation": "Đoạn [6] nêu dòng phát triển sau 'nhìn chung' (không phải 'luôn') cao hơn trước -> A sai. 'Các dòng kiến trúc đều có thời kỳ hưng thịnh và suy vong' -> B đúng. 'Quy luật phát triển ấy không phải là con đường hoàn toàn bằng phẳng' (có quanh co/thụt lùi) -> C sai.",
          "points": 1
        },
        {
          "question_no": 9,
          "question_type": "drag_drop",
          "question": "Điền một từ không quá HAI tiếng trong hai đoạn cuối vào mỗi chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Hiểu rõ quá trình phát triển lịch sử, chúng ta không cần phải "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " truyền thống và hiện đại. Lịch sử cung cấp những ví dụ về sự "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " và hồi sinh, như phong trào nghệ thuật Phục hưng đã hồi sinh kiến trúc cổ Hy Lạp. Kiến trúc truyền thống Việt Nam cũng đang chờ đợi cơ hội phục hưng, trong thế kỷ XXI đầy triển vọng cho "
            },
            {
              "type": "blank",
              "id": "o3"
            }
          ],
          "items": [],
          "correct_answer": {
            "o1": "đối lập",
            "o2": "suy vong",
            "o3": "văn hóa"
          },
          "explanation": "Đoạn [6] có câu: 'hoàn toàn không cần thiết đem truyền thống và hiện đại đối lập nhau'. Đoạn [7] nhắc đến 'sự suy vong rồi lại đđược phát triển' và 'Thế kỷ XXI là thế kỷ của văn hóa'.",
          "points": 1
        },
        {
          "question_no": 10,
          "question_type": "single_choice",
          "question": "Nội dung chính của bài viết là gì?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Kiến trúc truyền thống chứa đựng những tầng nghĩa mang giá trị trường tồn trong kiến trúc hiện đại."
            },
            {
              "key": "B",
              "text": "Hiện đại hóa kiến trúc không đòi hỏi áp dụng những phong cách mới mà đòi hỏi sự hiểu biết sâu sắc về truyền thống."
            },
            {
              "key": "C",
              "text": "Quá trình phát triển kiến trúc luôn tạo cơ hội thuận lợi cho phát triển phong cách cá nhân và nhận thức con người."
            },
            {
              "key": "D",
              "text": "Hiểu biết sâu sắc về kiến trúc truyền thống là điều kiện cần và quan trọng trong quá trình hiện đại hóa kiến trúc."
            }
          ],
          "correct_answer": "D",
          "explanation": "Xuyên suốt bài viết, tác giả khẳng định kiến trúc truyền thống quy định tiến trình hiện đại hóa, không thể tách rời, và hiểu biết sâu sắc về nó là điều kiện tiên quyết để vượt qua, phục hưng và phát triển kiến trúc.",
          "points": 1
        }
      ],
      "g2_questions": [
        {
          "question_no": 11,
          "question_type": "drag_drop",
          "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Từ nghiên cứu thử nghiệm phân tích một hình ảnh chụp X-quang ngực của bệnh nhân tại Hàn Quốc, các nhà nghiên cứu khẳng định rằng máy tính có khả năng đưa ra kết quả "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " kết luận của hầu hết các bác sĩ."
            }
          ],
          "items": [],
          "correct_answer": {
            "o1": "vượt trội hơn"
          },
          "explanation": "Đoạn [1] nêu rõ 'kết luận từ máy tính là vượt trội hơn so với 17/18 các bác sĩ tham gia đọc phim'.",
          "points": 1
        },
        {
          "question_no": 12,
          "question_type": "drag_drop",
          "question": "Kéo thả các cụm từ phù hợp vào mỗi chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Theo đoạn [2], trong khi các vùng "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " bị các bác sĩ bỏ qua khi đọc kết quả sinh thiết thì trí tuệ nhân tạo lại có khả năng "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " các vùng đó một cách chuẩn xác và nhanh chóng."
            }
          ],
          "items": [
            {
              "id": "i1",
              "text": "ung thư vú di căn"
            },
            {
              "id": "i2",
              "text": "nhuộm màu"
            },
            {
              "id": "i3",
              "text": "có nguy cơ ung thư"
            },
            {
              "id": "i4",
              "text": "loại bỏ"
            },
            {
              "id": "i5",
              "text": "nhận diện"
            }
          ],
          "correct_answer": {
            "o1": "i3",
            "o2": "i5"
          },
          "explanation": "Dựa trên nội dung đoạn [2]: AI phân loại chính xác mẫu là ung thư hay không (nhận diện các vùng có nguy cơ ung thư mà mắt thường không thấy).",
          "points": 1
        },
        {
          "question_no": 13,
          "question_type": "single_choice",
          "question": "Đâu là mục tiêu chính của đoạn [1] và đoạn [2]?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Chứng minh sự phức tạp và khó khăn khi sử dụng trí tuệ nhân tạo trong xét nghiệm và chẩn đoán bệnh."
            },
            {
              "key": "B",
              "text": "Kêu gọi sử dụng trí tuệ nhân tạo nhằm giải quyết các vấn đề tồn đọng trong xét nghiệm và chẩn đoán bệnh."
            },
            {
              "key": "C",
              "text": "Đánh giá cao sự chính xác và nhanh nhạy của trí tuệ nhân tạo trong phát hiện các bệnh lâm sàng."
            },
            {
              "key": "D",
              "text": "Nêu ra các thử nghiệm chứng minh sự thành công của việc sử dụng trí tuệ nhân tạo trong chẩn đoán bệnh."
            }
          ],
          "correct_answer": "D",
          "explanation": "Cả hai đoạn đầu đều đưa ra các trường hợp thử nghiệm thuật toán AI thực tế (DLAD, LYNA năm 2018) và chứng minh tỉ lệ thành công, chính xác cao của chúng.",
          "points": 1
        },
        {
          "question_no": 14,
          "question_type": "true_false",
          "question": "Theo đoạn [3], các phát biểu sau là đúng hay sai?",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "Ứng dụng AI trong y học là việc máy tính sử dụng thông tin y học từ bộ nhớ và dữ liệu của bệnh nhân để đưa ra kết luận."
            },
            {
              "id": "b",
              "text": "Ứng dụng AI trong y học có thể giảm chi phí xét nghiệm và chẩn đoán bệnh."
            },
            {
              "id": "c",
              "text": "Việc chẩn đoán sử dụng AI gặp khó khăn do AI còn phụ thuộc nhiều vào bác sĩ và không thể đưa ra quyết định độc lập."
            },
            {
              "id": "d",
              "text": "AI trong chăm sóc sức khỏe không ám chỉ việc phỏng đoán nguy cơ mắc bệnh của bệnh nhân trong tương lai."
            }
          ],
          "correct_answer": {
            "a": true,
            "b": true,
            "c": false,
            "d": false
          },
          "explanation": "Đoạn 3 có nêu AI phân loại và đưa ra chẩn đoán dựa trên dữ liệu lưu giữ trong bộ nhớ (A đúng), giúp chẩn đoán rẻ hơn (B đúng). Không đề cập AI gặp khó khăn vì quá phụ thuộc bác sĩ trong việc tự chẩn đoán dữ liệu hình ảnh (C sai). AI có sử dụng để 'tiên lượng bệnh', tức là đoán trước tiến triển (D sai).",
          "points": 1
        },
        {
          "question_no": 15,
          "question_type": "drag_drop",
          "question": "Kéo thả các cụm từ phù hợp vào mỗi chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Theo đoạn [4], mặc dù AI đã có những đóng góp quan trọng trong việc xác định mức độ bệnh và "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " từ các hình ảnh và điện tâm đồ, nhưng các nhà khoa học đang nghiên cứu việc sử dụng AI để "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " các thông tin y học phức tạp hơn nhằm đánh giá và dự đoán sự phát triển của bệnh."
            }
          ],
          "items": [
            {
              "id": "i1",
              "text": "tổng hợp"
            },
            {
              "id": "i2",
              "text": "thu thập"
            },
            {
              "id": "i3",
              "text": "nguy cơ tử vong"
            },
            {
              "id": "i4",
              "text": "khả năng hồi phục"
            },
            {
              "id": "i5",
              "text": "phân loại"
            }
          ],
          "correct_answer": {
            "o1": "i3",
            "o2": "i1"
          },
          "explanation": "Trong đoạn 4: 'đánh giá nguy cơ đột tử' (nguy cơ tử vong) và 'sự kết hợp của nhiều nguồn dữ liệu' (tổng hợp).",
          "points": 1
        },
        {
          "question_no": 16,
          "question_type": "drag_drop",
          "question": "Điền một cụm từ không quá BA tiếng trong đoạn [4] vào chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Ngoài ứng dụng trong xét nghiệm chẩn đoán các bệnh lý liên quan đến tim, da và võng mạc, AI còn đđược ứng dụng rộng rãi trong quá trình "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " để giảm thiểu thời gian và chi phí sản xuất."
            }
          ],
          "items": [],
          "correct_answer": {
            "o1": "phát triển thuốc"
          },
          "explanation": "Cuối đoạn [4] viết: 'tương lai chúng ta kỳ vọng việc phát triển thuốc sẽ vô cùng nhanh và rẻ hơn nhiều'.",
          "points": 1
        },
        {
          "question_no": 17,
          "question_type": "drag_drop",
          "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Theo đoạn [5], một trong những vấn đề cản trở quy trình thuyết phục các cơ quan chức năng "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " thuật toán trí tuệ nhân tạo sử dụng trong chẩn đoán y khoa là vấn đề "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " công nghệ."
            }
          ],
          "items": [],
          "correct_answer": {
            "o1": "cấp phép",
            "o2": "độc quyền"
          },
          "explanation": "Đoạn [5]: 'cấp phép cho các công nghệ AI khác vào y học sẽ còn là một con đường dài... liên quan đến sự độc quyền.'",
          "points": 1
        },
        {
          "question_no": 18,
          "question_type": "true_false",
          "question": "Theo đoạn [5], các phát biểu sau đây là đúng hay sai?",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "Phẫu thuật não đòi hỏi bác sĩ phải có sự nhanh nhạy thay đổi phương pháp chữa trị ngay trên bàn mổ."
            },
            {
              "id": "b",
              "text": "Hiểu biết về y khoa là một thách thức lớn của các nhà nghiên cứu khi thiết kế công nghệ AI trong y học."
            },
            {
              "id": "c",
              "text": "Việc sử dụng AI trong mọi bước điều trị là hoàn toàn có thể khi bác sĩ hiểu biết về các thuật toán AI."
            }
          ],
          "correct_answer": {
            "a": true,
            "b": true,
            "c": false
          },
          "explanation": "Đoạn 5 nhắc tới phẫu thuật não cần bác sĩ thay đổi cách tiếp cận ngay lập tức (A đúng). Nhà khoa học AI cần tìm hiểu thêm y học vì họ không phải lúc nào cũng là bác sĩ (B đúng). Cuối bài khẳng định 'không thể thay thế hoàn toàn bác sĩ', nên dùng AI trong 'mọi bước điều trị' là không thể (C sai).",
          "points": 1
        },
        {
          "question_no": 19,
          "question_type": "single_choice",
          "question": "Tác giả thể hiện thái độ gì về việc ứng dụng AI trong y khoa trong tương lai?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Thận trọng."
            },
            {
              "key": "B",
              "text": "Lạc quan."
            },
            {
              "key": "C",
              "text": "Kỳ vọng."
            },
            {
              "key": "D",
              "text": "Hoài nghi."
            }
          ],
          "correct_answer": "B",
          "explanation": "Tác giả chỉ ra nhiều thành công, kỳ vọng sự tiến bộ (thuốc rẻ hơn, chẩn đoán nhanh hơn) nhưng vẫn đánh giá rõ ràng những mặt chưa làm đđược (không thể thay thế bác sĩ). Sự tin tưởng kết hợp với nhận định khách quan thể hiện thái độ rất lạc quan, tích cực hướng tới tương lai.",
          "points": 1
        },
        {
          "question_no": 20,
          "question_type": "drag_drop",
          "question": "Điền một cụm từ không quá BA tiếng trong bài đọc vào chỗ trống:",
          "image_url": "",
          "image_width": 100,
          "explanation": "Đoạn [1] nêu rõ 'kết luận từ máy tính là vượt trội hơn so với 17/18 các bác sĩ tham gia đọc phim'.",
          "points": 1,
          "items": [],
          "body": [
            {
              "type": "text",
              "content": "Từ nghiên cứu thử nghiệm phân tích một hình ảnh chụp X-quang ngực của bệnh nhân tại Hàn Quốc, các nhà nghiên cứu khẳng định rằng máy tính có khả năng đưa ra kết quả "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " kết luận của hầu hết các bác sĩ."
            }
          ],
          "correct_answer": {
            "o1": "vượt trội hơn"
          }
        }
      ]
    },
    {
      "section_id": "science",
      "section_label": "Khoa học",
      "layout": "passage",
      "groups": [
        {
          "group_id": "g1",
          "title": "Ngữ liệu Khoa học số 01",
          "stimulus": {
            "type": "text",
            "content": "Không khí trong một phòng tắm hơi đđược làm nóng và giữ luôn ở nhiệt độ 90 °C làm cho người trong phòng tắm hơi đổ nhiều mồ hôi. Bộ phận làm nóng có tác dụng làm tăng nhiệt độ không khí trong phòng tắm hơi. Nhiệt dung của không khí có hơi nước trong phòng tắm hơi là 47 kJ/K.\nBộ điều khiển nhiệt độ có chức năng đo nhiệt độ và điều khiển đóng, ngắt bộ phận làm nóng để giữ nhiệt độ trong phòng tắm không đổi. Để đo nhiệt độ, có thể sử dụng một trong hai cảm biến nhiệt độ có đường đặc trưng điện áp U theo nhiệt độ t như đồ thị Hình 1.\n\n<img src=\"https://assets.tmastudy.io.vn/assets/7.png\" style=\"max-width: 100%; display: block; margin: 15px auto; border-radius: 8px; width: 80%;\" />\n\nHình 1. Đường đặc trưng điện áp - nhiệt độ của cảm biến A và B\n\nBiểu thức liên hệ áp suất p (N/m²), nhiệt độ tuyệt đối T (K), thể tích V (m³) của n mol khí là: \\( pV = nRT = \\frac{m}{\\mu} RT \\), trong đó:\nm (g) là khối lượng khí;\n\\( \\mu \\) (g/mol) là khối lượng 1 mol khí;\nR là hằng số khí lí tưởng và R = 8,31 J/mol;\n\nNhiệt dung C của vật là nhiệt lượng cần thiết để làm vật tăng nhiệt độ thêm 1 K. Biểu thức: \\( C = \\frac{Q}{\\Delta T} \\), trong đó:\nQ (J) là nhiệt lượng mà vật nhận đđược;\n\\( \\Delta T \\) (K) là độ tăng nhiệt độ\n\nTrong khí tượng học, độ ẩm tương đối f (%) của không khí ở nhiệt độ T đđược tính gần đúng là \\( f = \\frac{p}{p_{bh}} \\), trong đó:\np là áp suất hơi nước ở nhiệt độ T;\n\\( p_{bh} \\) là áp suất hơi nước bão hoà ở nhiệt độ T.",
            "image_url": "https://assets.tmastudy.io.vn/assets/7.png",
            "image_width": 100
          },
          "questions": [
            {
              "question_no": 1,
              "question_type": "single_choice",
              "question": "Các quá trình truyền nhiệt từ bộ phận làm nóng sang người trong phòng tắm hơi bao gồm:\n1. Truyền nhiệt từ bộ phận làm nóng sang không khí.\n2. Truyền nhiệt trong không khí.\n3. Truyền nhiệt từ không khí sang người trong phòng tắm hơi.\nCác hình thức truyền nhiệt chủ yếu tương ứng với các quá trình 1-2-3 là:",
              "image_url": "",
              "image_width": 100,
              "options": [
                {
                  "key": "A",
                  "text": "bức xạ – đối lưu – dẫn nhiệt."
                },
                {
                  "key": "B",
                  "text": "dẫn nhiệt – đối lưu – đối lưu."
                },
                {
                  "key": "C",
                  "text": "dẫn nhiệt – đối lưu – dẫn nhiệt."
                },
                {
                  "key": "D",
                  "text": "bức xạ – đối lưu – đối lưu."
                }
              ],
              "options_are_images": false,
              "correct_answer": "D",
              "explanation": "Quá trình 1: Bộ phận làm nóng rất nóng truyền nhiệt cho không khí xung quanh bằng bức xạ nhiệt. Quá trình 2: Nhiệt truyền trong chất khí chủ yếu bằng đối lưu. Quá trình 3: Dòng không khí nóng tiếp xúc và truyền nhiệt cho cơ thể người bằng đối lưu.",
              "points": 1
            },
            {
              "question_no": 2,
              "question_type": "single_choice",
              "question": "Chọn phương án thích hợp điền vào chỗ trống để phát biểu sau đúng:\nKhi người ở trong môi trường nhiệt độ cao (90 °C) của phòng tắm hơi, da người đổ nhiều mồ hôi là bởi vì ........................ nên người không bị quá nóng.",
              "image_url": "",
              "image_width": 100,
              "options": [
                {
                  "key": "A",
                  "text": "mồ hôi trên da sẽ bay hơi, thu nhiệt và làm giảm nhiệt độ của không khí"
                },
                {
                  "key": "B",
                  "text": "mồ hôi thu nhiệt và bay hơi làm giảm nhiệt độ của da"
                },
                {
                  "key": "C",
                  "text": "mồ hôi tạo thành lớp nước cách nhiệt với không khí nóng"
                },
                {
                  "key": "D",
                  "text": "mồ hôi trên da sẽ bay hơi và cân bằng với nhiệt độ của không khí"
                }
              ],
              "options_are_images": false,
              "correct_answer": "B",
              "explanation": "Sự bay hơi của mồ hôi trên da là quá trình thu nhiệt từ cơ thể (da) sang môi trường, giúp hạ nhiệt độ bề mặt da và ngăn cơ thể bị tăng nhiệt độ quá mức.",
              "points": 1
            },
            {
              "question_no": 3,
              "question_type": "fill_blank",
              "question": "Một phòng tắm hơi có thể tích 34 m³. Không khí trong phòng tắm hơi có độ ẩm tương đối là 3,5%. Khối lượng mol của nước là 18 g/mol. Áp suất hơi nước bão hoà ở nhiệt độ 90 °C là 70 kPa. Khối lượng hơi nước trong phòng tắm hơi là [o1] kg.",
              "image_url": "",
              "image_width": 100,
              "correct_answer": "0,5",
              "accepted_answers": [
                "0,5"
              ],
              "explanation": "Áp suất hơi nước: p = f * p_bh = 0,035 * 70000 = 2450 Pa.\nNhiệt độ tuyệt đối: T = 90 + 273,15 = 363,15 K.\nÁp dụng phương trình trạng thái khí lí tưởng: pV = (m/μ)RT => m = (p * V * μ) / (R * T) = (2450 * 34 * 0,018) / (8,31 * 363,15) ≈ 0,5 kg.",
              "points": 1
            },
            {
              "question_no": 4,
              "question_type": "drag_drop",
              "question": "Kéo ô thích hợp thả vào vị trí tương ứng để hoàn thành nhận định sau:",
              "image_url": "",
              "image_width": 100,
              "body": [
                {
                  "type": "text",
                  "content": "Để duy trì nhiệt độ trong phòng tắm hơi ổn định và chính xác ở mức 90 °C, nên chọn "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " vì ở gần 90°C, điện áp U tăng "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": " theo nhiệt độ."
                }
              ],
              "items": [
                {
                  "id": "item1",
                  "text": "cảm biến A"
                },
                {
                  "id": "item2",
                  "text": "cảm biến B"
                },
                {
                  "id": "item3",
                  "text": "cảm biến A và B"
                },
                {
                  "id": "item4",
                  "text": "nhanh"
                },
                {
                  "id": "item5",
                  "text": "chậm"
                }
              ],
              "correct_answer": {
                "o1": "item2",
                "o2": "item4"
              },
              "explanation": "Dựa vào đồ thị Hình 1, quanh khu vực 90 °C, đường đặc trưng của cảm biến A rất dốc nằm ngang (điện áp U thay đổi chậm theo nhiệt độ), còn cảm biến B có độ dốc đứng lớn (điện áp U tăng nhanh theo nhiệt độ), giúp đo đạc nhạy bén và chính xác hơn.",
              "points": 1
            },
            {
              "question_no": 5,
              "question_type": "fill_blank",
              "question": "Điền số tự nhiên thích hợp vào chỗ trống:\nBộ phận làm nóng dùng điện trở nhiệt có công suất nhiệt (nhiệt lượng chuyển hoá đđược từ điện năng trong 1 giây) là 32,6 kW, làm tăng nhiệt độ của không khí chứa hơi nước và các đồ vật trong phòng tắm hơi thêm 0,27 °C mỗi giây. Nhiệt dung của các vật (không bao gồm không khí và hơi nước) trong phòng tắm hơi xấp xỉ là [o1] kJ/K.",
              "image_url": "",
              "image_width": 100,
              "correct_answer": "74",
              "accepted_answers": [
                "74"
              ],
              "explanation": "Nhiệt lượng cung cấp trong 1 giây: Q = 32,6 kJ.\nTổng nhiệt dung: C_tổng = Q / Δt = 32,6 / 0,27 ≈ 120,74 kJ/K.\nNhiệt dung vật: C_vật = C_tổng - C_không_khí = 120,74 - 47 ≈ 74 kJ/K.",
              "points": 1
            }
          ]
        },
        {
          "group_id": "g2",
          "title": "Ngữ liệu Khoa học số 02",
          "stimulus": {
            "type": "text",
            "content": "Cho bảng nhiệt độ sôi của các chất như sau:\nBảng 1. Nhiệt độ sôi của một số chất\n<table style=\"width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; text-align: left;\"><thead><tr style=\"background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;\"><th style=\"padding: 10px; border: 1px solid #e2e8f0;\">Chất</th><th style=\"padding: 10px; border: 1px solid #e2e8f0;\">Tên gọi</th><th style=\"padding: 10px; border: 1px solid #e2e8f0; text-align: center;\">Phân tử khối</th><th style=\"padding: 10px; border: 1px solid #e2e8f0; text-align: center;\">Nhiệt độ sôi (°C)</th></tr></thead><tbody><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">(CH₃)₃N</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Trimethylamine</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">59</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">3,0</td></tr><tr style=\"background-color: #f8fafc;\"><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃–O–CH₂CH₃</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Ethylmethyl ether</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">60</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">8,0</td></tr><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃–NH–CH₂CH₃</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Ethylmethylamine</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">59</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">37,0</td></tr><tr style=\"background-color: #f8fafc;\"><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃CH₂CH₂–NH₂</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Propylamine</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">59</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">48,0</td></tr><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃CH₂CH₂–OH</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Propan-1-ol</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">60</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">97,0</td></tr><tr style=\"background-color: #f8fafc;\"><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃CH₂–NH₂</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Ethylamine</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">45</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">16,6</td></tr><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃CH₂–OH</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Ethanol</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">46</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">78,3</td></tr><tr style=\"background-color: #f8fafc;\"><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">H–O–H</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Nước</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">18</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">100</td></tr><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">H–S–H</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Hydrogen sulfide</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">34</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">–60,7</td></tr></tbody></table>\n\nĐể một chất có thể sôi, cần phải cung cấp năng lượng để phá vỡ liên kết giữa các phân tử và cung cấp động năng để phân tử chuyển động. Nhiệt độ sôi của chất phụ thuộc vào hai yếu tố chính sau:\n(1) Khối lượng phân tử: Khối lượng phân tử càng lớn thì càng cần nhiều động năng để chuyển động, nên nhiệt độ sôi càng cao.\n(2) Liên kết giữa các phân tử: Số lượng liên kết giữa các phân tử càng nhiều, lực liên kết càng mạnh thì càng cần nhiều năng lượng để phá vỡ liên kết giữa chúng. Khi đó, nhiệt độ sôi của chất đó càng cao.\nMột trong những loại liên kết ảnh hưởng lớn đến nhiệt độ sôi của chất là liên kết hydrogen. Liên kết hydrogen hình thành khi nguyên tử H, đã liên kết với một nguyên tử có độ âm điện lớn (như N, O, F), tương tác với một nguyên tử khác có độ âm điện lớn và còn cặp electron chưa liên kết. Để hình thành liên kết hydrogen, nguyên tử F, O, N liên kết với hydrogen phải có ít nhất một cặp electron chưa liên kết. Liên kết hydrogen thường được kí hiệu bằng dấu ba chấm (...), rải đều từ nguyên tử H đến nguyên tử tạo liên kết hydrogen với nó. Ví dụ, liên kết hydrogen giữa các phân tử ethanol (C₂H₅OH) có thể được biểu diễn như sau:\n\n<svg viewBox=\"0 0 320 80\" width=\"360\" height=\"90\" style=\"display: block; margin: 15px auto; max-width: 100%; font-family: 'Inter', 'Arial', sans-serif;\">\n  <line x1=\"5\" y1=\"25\" x2=\"35\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.8\" stroke-dasharray=\"3,3\" />\n  <text x=\"50\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">O</text>\n  <line x1=\"62\" y1=\"25\" x2=\"78\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"90\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">H</text>\n  <line x1=\"50\" y1=\"36\" x2=\"50\" y2=\"48\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"50\" y=\"65\" font-size=\"14\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">C₂H₅</text>\n  <line x1=\"102\" y1=\"25\" x2=\"132\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.8\" stroke-dasharray=\"3,3\" />\n  <text x=\"147\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">O</text>\n  <line x1=\"159\" y1=\"25\" x2=\"175\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"187\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">H</text>\n  <line x1=\"147\" y1=\"36\" x2=\"147\" y2=\"48\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"147\" y=\"65\" font-size=\"14\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">C₂H₅</text>\n  <line x1=\"199\" y1=\"25\" x2=\"229\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.8\" stroke-dasharray=\"3,3\" />\n  <text x=\"244\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">O</text>\n  <line x1=\"256\" y1=\"25\" x2=\"272\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"284\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">H</text>\n  <line x1=\"244\" y1=\"36\" x2=\"244\" y2=\"48\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"244\" y=\"65\" font-size=\"14\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">C₂H₅</text>\n  <line x1=\"296\" y1=\"25\" x2=\"315\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.8\" stroke-dasharray=\"3,3\" />\n</svg>\n\nLiên kết hydrogen giữa các phân tử ethanol (C₂H₅OH) hình thành khi nguyên tử H trong nhóm hydroxyl (–OH) của một phân tử ethanol tương tác với nguyên tử O trong nhóm hydroxyl của phân tử ethanol khác. Điều này xảy ra do nguyên tử H liên kết với O có độ âm điện lớn, trong khi O có cặp electron chưa liên kết. Khi ethanol được hoà tan trong nước, các phân tử ethanol tạo liên kết hydrogen không chỉ với chính nó mà còn với các phân tử nước.\nMột cách tổng quát, các phân tử có thể liên kết với nhau bằng lực liên kết hydrogen, tuy nhiên lực liên kết hydrogen yếu hơn so với lực liên kết giữa các nguyên tử trong liên kết ion hoặc liên kết cộng hoá trị. Thông thường, nguyên tử có độ âm điện càng lớn thì liên kết của nguyên tử H với nguyên tử đó càng phân cực, vì vậy tạo được liên kết hydrogen mạnh hơn.",
            "image_url": "",
            "image_width": 100
          },
          "questions": [
            {
              "question_no": 6,
              "question_type": "single_choice",
              "question": "Trong bảng trên, số chất không tạo được liên kết hydrogen là:",
              "image_url": "",
              "image_width": 100,
              "options": [
                {
                  "key": "A",
                  "text": "1."
                },
                {
                  "key": "B",
                  "text": "2."
                },
                {
                  "key": "C",
                  "text": "3."
                },
                {
                  "key": "D",
                  "text": "4."
                }
              ],
              "options_are_images": false,
              "correct_answer": "C",
              "explanation": "Các chất không tạo được liên kết hydrogen với chính nó gồm: (CH3)3N (amin bậc 3 không có liên kết N-H), CH3–O–CH2CH3 (ether không có liên kết O-H) và H–S–H (H2S không tạo được liên kết hydro do độ âm điện của S nhỏ). Tổng cộng có 3 chất.",
              "points": 1
            },
            {
              "question_no": 7,
              "question_type": "single_choice",
              "question": "Phân tử propylamine có bao nhiêu nguyên tử H có khả năng tạo liên kết hydrogen?",
              "image_url": "",
              "image_width": 100,
              "options": [
                {
                  "key": "A",
                  "text": "2."
                },
                {
                  "key": "B",
                  "text": "4."
                },
                {
                  "key": "C",
                  "text": "6."
                },
                {
                  "key": "D",
                  "text": "9."
                }
              ],
              "options_are_images": false,
              "correct_answer": "A",
              "explanation": "Propylamine có công thức CH3CH2CH2-NH2. Chỉ có các nguyên tử H liên kết trực tiếp với nguyên tử có độ âm điện lớn (N) trong nhóm -NH2 mới có khả năng tạo liên kết hydrogen. Do đó có 2 nguyên tử H thỏa mãn.",
              "points": 1
            },
            {
              "question_no": 8,
              "question_type": "single_choice",
              "question": "Chất tạo được liên kết hydrogen mạnh nhất là:",
              "image_url": "",
              "image_width": 100,
              "options": [
                {
                  "key": "A",
                  "text": "ethylmethyl ether."
                },
                {
                  "key": "B",
                  "text": "ethylmethylamine."
                },
                {
                  "key": "C",
                  "text": "propylamine."
                },
                {
                  "key": "D",
                  "text": "ethanol."
                }
              ],
              "options_are_images": false,
              "correct_answer": "D",
              "explanation": "Ethanol có liên kết O-H. Do O có độ âm điện lớn hơn N, liên kết O-H phân cực mạnh hơn liên kết N-H trong các amin, dẫn đến liên kết hydrogen tạo bởi nhóm O-H của ethanol mạnh nhất.",
              "points": 1
            },
            {
              "question_no": 9,
              "question_type": "true_false",
              "question": "Cho nguyên tử khối của O = 16 amu; H = 1 amu và C = 12 amu. Xét tính đúng sai của các phát biểu sau:",
              "image_url": "",
              "image_width": 100,
              "statements": [
                {
                  "id": "a",
                  "text": "Các nguyên tử trong phân tử ethanol liên kết với nhau bằng liên kết hydrogen."
                },
                {
                  "id": "b",
                  "text": "CH₃OH có nhiệt độ sôi cao hơn HCH=O."
                },
                {
                  "id": "c",
                  "text": "Thứ tự tăng dần nhiệt độ sôi từ trái sang phải là CH₄, CH₃–CH₃, CH₃OH."
                }
              ],
              "correct_answer": {
                "a": false,
                "b": true,
                "c": true
              },
              "explanation": "a) Sai, các nguyên tử trong một phân tử ethanol liên kết với nhau bằng liên kết cộng hóa trị. Liên kết hydrogen chỉ hình thành giữa các phân tử ethanol với nhau.\nb) Đúng, CH3OH tạo được liên kết hydrogen liên phân tử nên nhiệt độ sôi cao hơn HCHO.\nc) Đúng, CH4 (-161.5 °C) < C2H6 (-89 °C) < CH3OH (64.7 °C).",
              "points": 1
            },
            {
              "question_no": 10,
              "question_type": "fill_blank",
              "question": "Điền số tự nhiên thích hợp vào chỗ trống:\nSố kiểu liên kết hydrogen trong dung dịch ethanol là [o1].",
              "image_url": "",
              "image_width": 100,
              "correct_answer": "4",
              "accepted_answers": [
                "4"
              ],
              "explanation": "Trong dung dịch ethanol gồm ethanol (EtOH) và nước (H2O) có 4 kiểu liên kết hydrogen liên phân tử:\n1. EtOH...EtOH (H của EtOH liên kết với O của EtOH)\n2. EtOH...H2O (H của EtOH liên kết với O của H2O)\n3. H2O...EtOH (H của H2O liên kết với O của EtOH)\n4. H2O...H2O (H của H2O liên kết với O của H2O)",
              "points": 1
            }
          ]
        },
        {
          "group_id": "g3",
          "title": "Ngữ liệu Khoa học số 03",
          "stimulus": {
            "type": "text",
            "content": "Virus SARS-CoV-2 là virus đường hô hấp mới gây bệnh viêm đường hô hấp cấp (Covid-19) ở người, xuất hiện lần đầu tiên vào tháng 12 năm 2019 tại Vũ Hán (Trung Quốc), có khả năng lây lan từ người sang người và nhanh chóng đã trở thành một đại dịch toàn cầu.\nVirus SARS-CoV-2 có dạng hình cầu, đường kính xấp xỉ 125 nanomet, với cấu tạo gồm có lõi nucleic acid chứa ARN sợi đơn, lớp vỏ capsid và lớp vỏ ngoài chứa các thụ thể glycoprotein làm nhiệm vụ kháng nguyên. Ở nhiệt độ cao bên ngoài cơ thể (đặc biệt trên 25 °C), có nắng và môi trường thông thoáng sẽ làm virus SARS-CoV-2 yếu đi và giảm khả năng lây bệnh của chúng. Ngược lại, nếu ở trong điều kiện nhiệt độ thấp, độ ẩm cao, không khí không lưu thông tốt thì virus sẽ phát tán và lây lan rất nhanh.\nDưới đây là biểu đồ tình hình dịch bệnh tại cộng đồng thành phố Hà Nội, cập nhật mới nhất 18 giờ ngày 08/02/2022, thể hiện rõ số ca mắc tăng cao kỉ lục trong thời gian Tết Nguyên Đán:\n\n<img src=\"https://assets.tmastudy.io.vn/assets/8.png\" style=\"max-width: 100%; display: block; margin: 15px auto; border-radius: 8px; width: 80%;\" />\n\n(Số liệu lấy từ Sở y tế Hà Nội - 2022)",
            "image_url": "https://assets.tmastudy.io.vn/assets/8.png",
            "image_width": 100
          },
          "questions": [
            {
              "question_no": 11,
              "question_type": "single_choice",
              "question": "Dựa vào biểu đồ trên, cho biết ngày nào sau đây có số ca mắc mới ở cộng đồng cao nhất thành phố Hà Nội đợt 4?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "14/01/2022."
                },
                {
                  "key": "B",
                  "text": "23/01/2022."
                },
                {
                  "key": "C",
                  "text": "20/01/2022."
                },
                {
                  "key": "D",
                  "text": "08/01/2022."
                }
              ],
              "options_are_images": false,
              "correct_answer": "B",
              "explanation": "Dựa vào biểu đồ, số ca mắc ngoài cộng đồng (cột màu vàng) vào ngày 23/01/2022 đạt mức cao nhất (830 ca) so với các ngày được chọn.",
              "points": 1
            },
            {
              "question_no": 12,
              "question_type": "single_choice",
              "question": "Nguyên nhân nào sau đây có thể làm tăng nguy cơ lây lan dịch bệnh Covid – 19 một cách nhanh chóng?\n(1) Chỉ cần đeo khẩu trang khi tiếp xúc với người đã nhiễm virus SARS-CoV-2.\n(2) Luôn rửa tay sau khi chạm vào các vật nơi công cộng.\n(3) Tổ chức các cuộc gặp mặt đầu xuân.\n(4) Sử dụng chung các đồ dùng nơi công cộng.\n(5) Làm việc trong không gian hẹp, thiếu sự lưu thông khí.",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "(1), (2), (3), (4)."
                },
                {
                  "key": "B",
                  "text": "(1), (3), (4), (5)."
                },
                {
                  "key": "C",
                  "text": "(2), (3), (4), (5)."
                },
                {
                  "key": "D",
                  "text": "(1), (3), (5)."
                }
              ],
              "options_are_images": false,
              "correct_answer": "B",
              "explanation": "Các nguyên nhân làm dịch lây lan nhanh bao gồm: không đeo khẩu trang phòng ngừa rộng rãi (1), tụ tập đông người (3), dùng chung đồ vật (4) và làm việc trong không gian kín (5). (2) là biện pháp phòng ngừa.",
              "points": 1
            },
            {
              "question_no": 13,
              "question_type": "single_choice",
              "question": "Số lượng ca mắc trong cộng đồng tăng cao gây khó khăn cho công tác phòng chống dịch hơn các ca mắc mới trong khu vực đã cách ly vì",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "khó khăn trong việc truy vết, dễ dàng lây lan chéo tạo thành các ổ dịch."
                },
                {
                  "key": "B",
                  "text": "tạo ra các chủng đột biến mới gây nguy hiểm hơn các chủng đột biến cũ."
                },
                {
                  "key": "C",
                  "text": "làm giảm hiệu quả phòng bệnh của vắc xin."
                },
                {
                  "key": "D",
                  "text": "cơ thể không đáp ứng miễn dịch."
                }
              ],
              "options_are_images": false,
              "correct_answer": "A",
              "explanation": "Ca mắc cộng đồng là nguồn lây chưa được khoanh vùng cách ly, khó xác định nguồn lây và lịch trình tiếp xúc, khiến việc truy vết gặp nhiều khó khăn và tăng nguy cơ lây lan âm thầm.",
              "points": 1
            },
            {
              "question_no": 14,
              "question_type": "single_choice",
              "question": "Phát biểu sau đây đúng hay sai?\nThuốc kháng sinh có khả năng điều trị các bệnh về virus.",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Đúng."
                },
                {
                  "key": "B",
                  "text": "Sai."
                }
              ],
              "options_are_images": false,
              "correct_answer": "B",
              "explanation": "Thuốc kháng sinh chỉ tiêu diệt hoặc ức chế vi khuẩn, hoàn toàn không có tác dụng đối với virus.",
              "points": 1
            },
            {
              "question_no": 15,
              "question_type": "fill_blank",
              "question": "Điền từ/cụm từ thích hợp vào chỗ trống sau đây:\nKháng nguyên là những chất khi xâm nhập vào cơ thể người được hệ thống miễn dịch nhận biết và sinh ra các [o1] tương ứng.",
              "image_url": "",
              "correct_answer": "kháng thể",
              "accepted_answers": [
                "kháng thể"
              ],
              "explanation": "Kháng nguyên là chất lạ kích thích cơ thể sinh ra các kháng thể tương ứng để kết hợp đặc hiệu với kháng nguyên đó.",
              "points": 1
            }
          ]
        },
        {
          "group_id": "g4",
          "title": "Ngữ liệu Khoa học số 04",
          "stimulus": {
            "type": "text",
            "content": "Dung dịch là hỗn hợp đồng nhất gặp trong đời sống hàng ngày, ví dụ nước muối, nước đường, giấm ăn là các dung dịch. Trong hóa học, dung dịch được định nghĩa là sự đồng nhất của dung môi và chất tan. Dung môi là chất có thể hòa tan các chất khác để tạo thành dung dịch, dung môi thường gặp là nước, một số dung môi hữu cơ ít phổ biến hơn như ancol etylic, cloroform, n-hexan, .... Chất tan là chất bị hòa tan trong dung môi. Ở một nhiệt độ xác định, dựa vào khả năng có thể hòa tan thêm chất tan hay không, dung dịch phân thành các loại:\n- Dung dịch chưa bão hòa: là dung dịch có thể hòa tan thêm chất tan.\n- Dung dịch bão hòa: là dung dịch không thể hòa tan thêm chất tan.\n- Dung dịch quá bão hòa: là dung dịch chứa lượng chất tan nhiều hơn dung dịch bão hòa.\nDung dịch quá bão hòa thường được tạo ra bằng cách chuẩn nóng dung dịch bão hòa, sau đó thêm chất tan vào hòa tan rồi làm nguội đến nhiệt độ xác định. Loại dung dịch này thường kém bền, chỉ cần có một tinh thể nhỏ chất tan trong dung dịch thì lượng chất tan vượt quá lượng chất tan để tạo dung dịch bão hòa ở nhiệt độ đó sẽ tách ra ở dạng rắn. Quá trình chất tan hóa rắn tách ra từ dung dịch quá bão hòa ở nhiệt độ xác định gọi là quá trình kết tinh. Quá trình kết tinh có ý nghĩa quan trọng trong việc tinh chế (làm sạch), tách các chất, đặc biệt là chất hữu cơ rắn trong lĩnh vực sản xuất thuốc, vật liệu.\nĐể đánh giá khả năng hòa tan của các chất tan trong nước ở một nhiệt độ xác định người ta sử dụng đại lượng đo là độ tan. Độ tan (kí hiệu là S) của một chất là số gam chất đó hòa tan trong 100g nước để tạo thành dung dịch bão hòa ở một nhiệt độ xác định. Độ tan càng nhỏ nghĩa là các chất càng kém tan và ngược lại. Công thức tính độ tan trong nước của một chất ở nhiệt độ xác định như sau: \\( S = \\frac{m_{ct}}{m_{H_2O}} \\cdot 100 \\) (gam/100 gam \\(H_2O\\)). Trong đó, \\(m_{ct}\\) là khối lượng của chất tan được hòa tan trong nước để tạo thành dung dịch bão hòa, có đơn vị là gam, \\(m_{H_2O}\\) là khối lượng của nước, có đơn vị là gam.\nĐộ tan cung cấp thông tin quan trọng về khả năng tan của các chất trong nước và hỗ trợ trong việc nghiên cứu, phát triển và ứng dụng các chất trong sản xuất hay cuộc sống hàng ngày. Ví dụ, độ tan của thuốc quyết định khả năng hấp thu của thuốc vào cơ thể, độ tan của hóa chất quyết định khả năng phân tán của hóa chất trong dung môi. Độ tan của các chất trong nước là một trong những yếu tố quan trọng trong quá trình sản xuất và xử lý nước. Các chất khác nhau có độ tan trong nước khác nhau và đối với một chất, ở những nhiệt độ khác nhau độ tan cũng khác nhau.\nTừ thực nghiệm, các nhà khoa học đã xác định độ tan của các chất ở các nhiệt độ khác nhau, đây là thông tin quan trọng sử dụng trong nghiên cứu và ứng dụng các chất. Hình vẽ dưới đây cho biết sự phụ thuộc của độ tan vào nhiệt độ đối với một số chất.\n\n<img src=\"https://assets.tmastudy.io.vn/assets/9.png\" style=\"max-width: 100%; display: block; margin: 15px auto; border-radius: 8px; width: 80%;\" />\n\nHình 3. Độ tan của một số chất\n\n(Nguồn: https://chem.libretexts.org)\nDựa vào đường cong biểu diễn sự phụ thuộc của độ tan từng chất vào nhiệt độ, có thể đánh giá khả năng hòa tan của các chất khác nhau ở cùng nhiệt độ, cũng như biết cách pha chế các dung dịch ở nhiệt độ xác định hay tách, làm sạch các chất rắn trong hỗn hợp.",
            "image_url": "https://assets.tmastudy.io.vn/assets/9.png",
            "image_width": 100
          },
          "questions": [
            {
              "question_no": 16,
              "question_type": "multiple_choice",
              "question": "Dựa vào Hình 3, trong các chất sau đây, những chất có độ tan giảm khi nhiệt độ tăng là:",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "NH₃."
                },
                {
                  "key": "B",
                  "text": "KClO₃."
                },
                {
                  "key": "C",
                  "text": "NH₄Cl."
                },
                {
                  "key": "D",
                  "text": "HCl."
                }
              ],
              "options_are_images": false,
              "correct_answer": [
                "A",
                "D"
              ],
              "explanation": "Dựa vào đồ thị Hình 3, các đường biểu diễn của NH₃ và HCl đi xuống từ trái sang phải, cho thấy độ tan của chúng trong nước giảm khi nhiệt độ tăng.",
              "points": 1
            },
            {
              "question_no": 17,
              "question_type": "true_false",
              "question": "Xét tính đúng sai cho các phát biểu sau:",
              "image_url": "",
              "statements": [
                {
                  "id": "a",
                  "text": "Độ tan là khối lượng chất tan tối đa có thể hòa tan trong 100 gam nước ở một nhiệt độ xác định."
                },
                {
                  "id": "b",
                  "text": "Ở một nhiệt độ xác định, dung dịch quá bão hòa rất bền và ổn định."
                },
                {
                  "id": "c",
                  "text": "Nước là dung môi phổ biến để hòa tan các chất tan."
                }
              ],
              "correct_answer": {
                "a": true,
                "b": false,
                "c": true
              },
              "explanation": "1) Đúng theo định nghĩa độ tan. 2) Sai, dung dịch quá bão hòa kém bền và dễ bị kết tinh khi có tác động nhỏ. 3) Đúng, nước là dung môi phổ biến nhất trong tự nhiên và đời sống.",
              "points": 1
            },
            {
              "question_no": 18,
              "question_type": "drag_drop",
              "question": "Kéo ô thích hợp thả vào vị trí tương ứng để hoàn thành các câu sau:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Tiến hành thí nghiệm hòa tan 225 gam NaNO₃ rắn, tinh khiết bằng 250 gam nước ở nhiệt độ 30°C sẽ thu được dung dịch NaNO₃ "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": ". Điều này được giải thích là do dựa vào đường cong biểu diễn sự phụ thuộc độ tan của NaNO₃ vào nhiệt độ, 250 gam nước có thể hòa tan tối đa khoảng "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": " gam NaNO₃."
                }
              ],
              "items": [
                {
                  "id": "item1",
                  "text": "225"
                },
                {
                  "id": "item2",
                  "text": "238"
                },
                {
                  "id": "item3",
                  "text": "chưa bão hòa"
                },
                {
                  "id": "item4",
                  "text": "95"
                },
                {
                  "id": "item5",
                  "text": "bão hòa"
                },
                {
                  "id": "item6",
                  "text": "quá bão hòa"
                }
              ],
              "correct_answer": {
                "o1": "item3",
                "o2": "item2"
              },
              "explanation": "Tại 30°C, độ tan của NaNO₃ là 95g/100g nước. Với 250g nước, khối lượng hòa tan tối đa là 95 * 2.5 = 237,5 gam (xấp xỉ 238 gam). Vì 225g < 238g nên thu được dung dịch chưa bão hòa.",
              "points": 1
            },
            {
              "question_no": 19,
              "question_type": "fill_blank",
              "question": "Điền số thích hợp hợp (làm tròn đến chữ số thập phân thứ nhất) vào chỗ trống để hoàn thành nhận xét sau:\nMột mẫu CuSO₄ thực tế nặng 46 gam, trong đó có 80% là CuSO₄ và còn lại là các chất rắn không tan trong nước. Để tách CuSO₄ ra khỏi hỗn hợp, ta tiến hành hòa tan hoàn toàn mẫu chất rắn trên trong 50 ml nước tinh khiết ở nhiệt độ 100°C. Lọc hỗn hợp thu lấy phần dung dịch, sau đó để cho dung dịch nguội dần đến nhiệt độ 20°C thì thấy xuất hiện các tinh thể CuSO₄ ngậm nước CuSO₄.5H₂O. Lọc lấy chất rắn rồi đem sấy ở nhiệt độ 100°C đến khi khối lượng không đổi thì thu được CuSO₄ khan.\nKhối lượng của CuSO₄ khan thu được là [o1] gam.\nCho biết, ở 20°C độ tan của CuSO₄ có giá trị là 32 gam/100 gam H₂O, khối lượng riêng của nước tinh khiết là 1 g/ml. Coi thể tích của nước là không thay đổi và khi sấy ở nhiệt độ 100°C đến khối lượng không đổi, ta chỉ thu được tinh thể CuSO₄ khan.",
              "image_url": "",
              "correct_answer": "20,8",
              "accepted_answers": [
                "20,8",
                "20.8"
              ],
              "explanation": "m(CuSO₄ ban đầu) = 46 * 0.8 = 36.8g. m(H₂O) = 50g. Khối lượng CuSO₄ tan tối đa ở 20°C trong 50g nước: 32 * 50 / 100 = 16g. Khối lượng CuSO₄ kết tinh: 36.8 - 16 = 20.8g. Khi sấy khô thu được 20.8g CuSO₄ khan.",
              "points": 1
            },
            {
              "question_no": 20,
              "question_type": "single_choice",
              "question": "Phèn chua là hóa chất phổ biến được sử dụng làm trong nước và có công thức hóa học dạng KAl(SO₄)₂.12H₂O. Thực tế phèn chua có chứa nhiều chất cặn bẩn và tinh chế phèn chua. Quá trình tinh chế thường được thực hiện bằng cách tạo dung dịch bão hòa ở nhiệt độ 50°C, sau đó đưa về nhiệt độ 20°C để tạo dung dịch phèn chua quá bão hòa, khi đó các tinh thể phèn chua sẽ được tách ra.\nỞ nhiệt độ 50°C, để tạo dung dịch bão hòa phèn chua, tiến hành hòa tan hoàn toàn 42,53 gam mẫu phèn chua (độ tinh khiết 80%) trong V ml nước tinh khiết. V có giá trị gần đúng nào sau đây?\nCho biết, ở 50°C độ tan của KAl(SO₄)₂ trong nước có giá trị là 36,8 gam/100 gam H₂O. Nước tinh khiết có khối lượng riêng là 1 g/ml và chỉ có đường dùng để hòa tan phèn chua. Phân tử khối của KAl(SO₄)₂ và H₂O lần lượt là 258 g/mol và 18 g/mol.",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "34,83 ml."
                },
                {
                  "key": "B",
                  "text": "43,52 ml."
                },
                {
                  "key": "C",
                  "text": "50,33 ml."
                },
                {
                  "key": "D",
                  "text": "62,90 ml."
                }
              ],
              "options_are_images": false,
              "correct_answer": "A",
              "explanation": "m(phèn tinh khiết) = 42,53 * 80% = 34,024 gam.\nm(KAl(SO₄)₂) = 34,024 * 258 / 474 = 18,52 gam.\nm(nước kết tinh) = 34,024 * 216 / 474 = 15,50 gam.\nTại 50°C: m(KAl(SO₄)₂) / (V + m_nước_kết_tinh) = 36.8 / 100 => V + 15,50 = 18,52 / 0,368 = 50,33 gam => V = 34,83 gam (34,83 ml).",
              "points": 1
            }
          ]
        },
        {
          "group_id": "g5",
          "title": "Ngữ liệu Khoa học số 05",
          "stimulus": {
            "type": "text",
            "content": "Các virus thiếu enzyme chuyển hóa và bộ máy sản xuất protein. Chúng là các dạng sống ký sinh nội bào bắt buộc. Mỗi loại virus chỉ có thể lây nhiễm một số lượng nhất định các loại tế bào chủ, được gọi là phổ vật chủ của virus. Tính đặc trưng của phổ vật chủ là kết quả của quá trình tiến hóa hệ thống nhận diện của mỗi loại virus. Virus nhận ra tế bào chủ của nó theo nguyên tắc “chìa và khóa” giữa các protein bề mặt của virus với các phân tử thụ thể đặc hiệu trên bề mặt ngoài của tế bào chủ.\nQuá trình lây nhiễm của virus bắt đầu khi một virus đính kết với tế bào chủ và hệ gene của chúng được truyền vào trong tế bào chủ. Cơ chế truyền hệ gene của virus vào tế bào chủ phụ thuộc vào loại virus và loại tế bào chủ. Khi hệ gene của virus đã ở trong tế bào chủ, các protein mà nó mã hóa có thể trưng dụng tế bào chủ, tái lập trình hoạt động tế bào để tái bản hệ gene virus, đồng thời sản xuất ra các protein của virus. Tế bào chủ cung cấp các nucleotide cho việc tổng hợp các nucleic acid của virus, cũng như các enzyme, các ribosome, các tRNA, các amino acid, ATP và cả thành phần khác cần thiết để tổng hợp các protein của virus. Phần lớn các virus DNA dùng các enzyme DNA polymerase của tế bào chủ để tổng hợp hệ gene mới của chúng trên cơ sở khuôn mẫu là DNA của virus. Ngược lại, để tái bản vật chất di truyền, các virus RNA thường mã hóa các enzyme polymerase sử dụng RNA làm mạch khuôn.\nSau khi các phân tử nucleic acid và các capsomer đã được tạo ra, chúng sẽ đóng gói với nhau một cách tự phát để hình thành nên các virus thế hệ con. Một kiểu chu kỳ sinh sản của virus đơn giản nhất sẽ kết thúc bằng việc hàng trăm hoặc thậm chí hàng nghìn virus thoát khỏi tế bào chủ lây nhiễm, kéo theo sự phá hủy của tế bào chủ.",
            "image_url": "",
            "image_width": 100
          },
          "questions": [
            {
              "question_no": 21,
              "question_type": "single_choice",
              "question": "Virus nhận ra tế bào chủ của nó theo nguyên tắc “chìa và khóa” nghĩa là",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "protein bề mặt của virus có thể kết hợp được với nhiều thụ thể khác nhau của nhiều loại tế bào khác nhau."
                },
                {
                  "key": "B",
                  "text": "protein bề mặt của virus liên kết đặc hiệu với từng loại thụ thể trên bề mặt tế bào chủ."
                },
                {
                  "key": "C",
                  "text": "protein bề mặt của virus mã hóa mọi loại thụ thể tế bào."
                },
                {
                  "key": "D",
                  "text": "protein bề mặt của virus liên kết không đặc hiệu với thụ thể trên bề mặt tế bào chủ."
                }
              ],
              "options_are_images": false,
              "correct_answer": "B",
              "explanation": "Nguyên tắc 'chìa và khóa' chỉ tính liên kết đặc hiệu giữa glycoprotein kháng nguyên bề mặt virus và thụ thể tương ứng trên màng tế bào chủ.",
              "points": 1
            },
            {
              "question_no": 22,
              "question_type": "drag_drop",
              "question": "Sắp xếp các giai đoạn sau đây cho đúng chu trình nhân lên của virus trong tế bào chủ:",
              "image_url": "",
              "body": [
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " → "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": " → "
                },
                {
                  "type": "blank",
                  "id": "o3"
                },
                {
                  "type": "text",
                  "content": " → "
                },
                {
                  "type": "blank",
                  "id": "o4"
                },
                {
                  "type": "text",
                  "content": " → "
                },
                {
                  "type": "blank",
                  "id": "o5"
                }
              ],
              "items": [
                {
                  "id": "item1",
                  "text": "Sinh tổng hợp"
                },
                {
                  "id": "item2",
                  "text": "Xâm nhập"
                },
                {
                  "id": "item3",
                  "text": "Hấp phụ"
                },
                {
                  "id": "item4",
                  "text": "Lắp ráp"
                },
                {
                  "id": "item5",
                  "text": "Giải phóng"
                }
              ],
              "correct_answer": {
                "o1": "item3",
                "o2": "item2",
                "o3": "item1",
                "o4": "item4",
                "o5": "item5"
              },
              "explanation": "Thứ tự 5 giai đoạn: Hấp phụ (item3) -> Xâm nhập (item2) -> Sinh tổng hợp (item1) -> Lắp ráp (item4) -> Giải phóng (item5).",
              "points": 1
            },
            {
              "question_no": 23,
              "question_type": "single_choice",
              "question": "Điều nào sau đây không đúng khi nói về virus?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Chỉ trong tế bào chủ, virus mới hoạt động như một thể sống."
                },
                {
                  "key": "B",
                  "text": "Hệ gene của virus chỉ chứa một trong hai loại nucleic acid: DNA, RNA."
                },
                {
                  "key": "C",
                  "text": "Kích thước virus vô cùng nhỏ, chỉ có thể thấy được dưới kính hiển vi điện tử."
                },
                {
                  "key": "D",
                  "text": "Ở bên ngoài môi trường, virus chỉ sinh trưởng chứ không nhân lên mặc dù có cả phức hợp gồm nucleic acid và protein."
                }
              ],
              "options_are_images": false,
              "correct_answer": "D",
              "explanation": "Virus ngoài môi trường (hạt virus/virion) hoàn toàn không trao đổi chất, không sinh trưởng (không lớn lên) và không nhân lên. Nó hoàn toàn trơ.",
              "points": 1
            },
            {
              "question_no": 24,
              "question_type": "single_choice",
              "question": "Các virus cần tự mã hóa một số enzyme nhất định vì",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "tế bào chủ thiếu các enzyme có thể sao chép hệ gene virus."
                },
                {
                  "key": "B",
                  "text": "những enzyme này không tổng hợp được trong tế bào chủ."
                },
                {
                  "key": "C",
                  "text": "tế bào chủ nhanh chóng phá hủy các virus."
                },
                {
                  "key": "D",
                  "text": "những enzyme này dịch mã mRNA virus thành các protein."
                }
              ],
              "options_are_images": false,
              "correct_answer": "A",
              "explanation": "Ví dụ, virus RNA cần tự mã hóa enzyme RNA polymerase phụ thuộc RNA để nhân bản vật chất di truyền của nó, vì tế bào chủ không có enzyme này.",
              "points": 1
            },
            {
              "question_no": 25,
              "question_type": "true_false",
              "question": "Các phát biểu sau đây đúng hay sai?",
              "image_url": "",
              "statements": [
                {
                  "id": "a",
                  "text": "Virus bám được vào tế bào chủ là nhờ các thụ thể thích hợp có sẵn trên bề mặt tế bào chủ."
                },
                {
                  "id": "b",
                  "text": "Kết quả của quá trình nhân lên là từ một virus ban đầu tạo ra vô số virus mới có độc tính tăng gấp nhiều lần."
                },
                {
                  "id": "c",
                  "text": "Virus sử dụng nguyên liệu của tế bào chủ trong quá trình nhân lên của mình."
                }
              ],
              "correct_answer": {
                "a": true,
                "b": false,
                "c": true
              },
              "explanation": "1) Đúng. 2) Sai (virus con tạo ra có độc tính tương tự virus mẹ). 3) Đúng (sử dụng nucleotide, axit amin, ribosome, tRNA, ATP... của tế bào chủ).",
              "points": 1
            }
          ]
        },
        {
          "group_id": "g6",
          "title": "Ngữ liệu Khoa học số 06",
          "stimulus": {
            "type": "text",
            "content": "Điện trở nhiệt (thermistor) là linh kiện có điện trở thay đổi một cách rõ rệt theo nhiệt độ. Điện trở nhiệt được ứng dụng rộng rãi trong kĩ thuật điện tử, làm cảm biến nhiệt (Hình 1).\nĐể khảo sát sự phụ thuộc của giá trị điện trở của điện trở nhiệt NTC (Negative Temperature Coefficient) vào nhiệt độ, người ta làm thí nghiệm như sau:\nBố trí thí nghiệm như Hình 2.\nĐặt điện trở nhiệt vào giữa bình, đặt nhiệt kế vào trong bình, cạnh điện trở nhiệt.\nĐổ nước mát vào bình cách nhiệt sao cho lượng nước ngập cảm biến của nhiệt kế. Sau khoảng 2 phút, đo nhiệt độ của nước và điện trở của điện trở nhiệt.\nTăng nhiệt độ của nước trong bình bằng cách thêm từ từ nước nóng vào bình. Chờ nhiệt độ của nước trong bình ổn định. Đo nhiệt độ của nước và điện trở của điện trở nhiệt.\nLặp lại thao tác để đo nhiệt độ và điện trở của điện trở nhiệt ở các nhiệt độ khác.\nKết quả thí nghiệm thu được cho như trong Bảng 1.\nNgoài điện trở nhiệt NTC, trong thực tế còn có loại điện trở nhiệt PTC (Positive Temperature Coefficient). Điện trở của điện trở nhiệt PTC tăng khi nhiệt độ tăng.\n(Soạn dịch theo nội dung sách giáo khoa Vật lí 11 - Bộ Kết nối tri thức với cuộc sống, 2023)",
            "image_url": "",
            "image_width": 100
          },
          "questions": [
            {
              "question_no": 26,
              "question_type": "drag_drop",
              "question": "Kéo thả các từ/cụm từ thích hợp vào chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Loại điện trở nhiệt khi nhiệt độ tăng thì điện trở giảm gọi là "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": ", ký hiệu là "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": ".\nLoại điện trở nhiệt khi nhiệt độ tăng thì điện trở tăng gọi là "
                },
                {
                  "type": "blank",
                  "id": "o3"
                },
                {
                  "type": "text",
                  "content": ", ký hiệu là "
                },
                {
                  "type": "blank",
                  "id": "o4"
                },
                {
                  "type": "text",
                  "content": "."
                }
              ],
              "items": [
                {
                  "id": "item1",
                  "text": "NTC"
                },
                {
                  "id": "item2",
                  "text": "PTC"
                },
                {
                  "id": "item3",
                  "text": "nghịch điện trở nhiệt"
                },
                {
                  "id": "item4",
                  "text": "thuận điện trở nhiệt"
                }
              ],
              "correct_answer": {
                "o1": "item3",
                "o2": "item1",
                "o3": "item4",
                "o4": "item2"
              },
              "explanation": "Điện trở nhiệt NTC (Negative) có giá trị điện trở giảm khi nhiệt độ tăng, gọi là nghịch điện trở nhiệt. Điện trở nhiệt PTC (Positive) có giá trị điện trở tăng khi nhiệt độ tăng, gọi là thuận điện trở nhiệt.",
              "points": 1
            },
            {
              "question_no": 27,
              "question_type": "single_choice",
              "question": "Điện trở nhiệt được sử dụng chủ yếu trong lĩnh vực nào sau đây?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Nông nghiệp."
                },
                {
                  "key": "B",
                  "text": "Năng lượng tái tạo."
                },
                {
                  "key": "C",
                  "text": "Điện tử."
                },
                {
                  "key": "D",
                  "text": "Y tế."
                }
              ],
              "options_are_images": false,
              "correct_answer": "C",
              "explanation": "Theo văn bản: 'Điện trở nhiệt được ứng dụng rộng rãi trong kĩ thuật điện tử, làm cảm biến nhiệt'. Do đó lĩnh vực sử dụng chủ yếu là Điện tử.",
              "points": 1
            },
            {
              "question_no": 28,
              "question_type": "single_choice",
              "question": "Trong bảng kết quả thí nghiệm, khi nhiệt độ tăng từ 5°C đến 41°C thì giá trị điện trở của điện trở nhiệt NTC",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "tăng lên 36 Ω."
                },
                {
                  "key": "B",
                  "text": "giảm đi 36 Ω."
                },
                {
                  "key": "C",
                  "text": "tăng lên 99428,7 Ω."
                },
                {
                  "key": "D",
                  "text": "giảm đi 99428,7 Ω."
                }
              ],
              "options_are_images": false,
              "correct_answer": "D",
              "explanation": "Tại 5°C, R = 121951,2 Ω. Tại 41°C, R = 22522,5 Ω. Khi nhiệt độ tăng từ 5°C đến 41°C, điện trở giảm đi: 121951,2 - 22522,5 = 99428,7 Ω.",
              "points": 1
            },
            {
              "question_no": 29,
              "question_type": "single_choice",
              "question": "Trong khoảng nhiệt độ nào dưới đây, giá trị điện trở của điện trở nhiệt biến đổi chậm nhất?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "9°C - 15°C."
                },
                {
                  "key": "B",
                  "text": "26°C - 32°C."
                },
                {
                  "key": "C",
                  "text": "41°C - 49°C."
                },
                {
                  "key": "D",
                  "text": "74°C - 80°C."
                }
              ],
              "options_are_images": false,
              "correct_answer": "D",
              "explanation": "Sự biến đổi của điện trở theo nhiệt độ (độ dốc của đặc tuyến) giảm dần khi nhiệt độ tăng. Ở khoảng 74°C - 80°C, điện trở giảm ít nhất (chỉ giảm khoảng 201 Ω/°C), tức là biến đổi chậm nhất.",
              "points": 1
            },
            {
              "question_no": 30,
              "question_type": "drag_drop",
              "question": "Dựa vào đồ thị đặc trưng của NTC và PTC, xác định đường biểu diễn phù hợp:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Đồ thị biểu diễn sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với hai loại điện trở nhiệt NTC và PTC.\nĐường màu xanh thể hiện sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với điện trở nhiệt "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": ".\nĐường màu đỏ thể hiện sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với điện trở nhiệt "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": "."
                }
              ],
              "items": [
                {
                  "id": "item1",
                  "text": "PTC"
                },
                {
                  "id": "item2",
                  "text": "NTC"
                }
              ],
              "correct_answer": {
                "o1": "item2",
                "o2": "item1"
              },
              "explanation": "Đường màu xanh đi xuống tương ứng với điện trở giảm khi nhiệt độ tăng, đó là đặc trưng của NTC. Đường màu đỏ đi lên tương ứng với điện trở tăng khi nhiệt độ tăng, đó là đặc trưng của PTC.",
              "points": 1
            }
          ]
        },
        {
          "group_id": "g7",
          "title": "Ngữ liệu Khoa học số 07",
          "stimulus": {
            "type": "text",
            "content": "Potassium dichromate có công thức hóa học là K₂Cr₂O₇, thường được sử dụng như một chất oxi hóa trong các phòng thí nghiệm và trong công nghiệp, chất này rất có hại cho sức khỏe. Potassium dichromate là chất rắn có màu da cam của ion dichromate (Cr₂O₇²⁻) và khá phổ biến trong phòng thí nghiệm vì nó không chảy nước, ngược lại với muối sodium dichromate. Muối potassium dichromate có tính oxi hóa mạnh, đặc biệt trong môi trường acid, muối chromi (VI) bị khử thành muối chromi (III). Trong dung dịch của ion Cr₂O₇²⁻ (màu cam) luôn luôn có cả ion CrO₄²⁻ (màu vàng) ở trạng thái cân bằng với nhau:\nCr₂O₇²⁻ + H₂O ⇌ 2CrO₄²⁻ + 2H⁺\nVì có cân bằng trên nên khi thêm dung dịch acid vào muối chromate (màu vàng) sẽ tạo thành dichromate (màu da cam). Ngược lại, khi thêm dung dịch base vào muối dichromate, sẽ tạo thành chromate.\nPhương pháp định lượng dichromate dựa vào tính oxi hóa mạnh của ion Cr₂O₇²⁻ trong môi trường acid:\nCr₂O₇²⁻ + 14H⁺ + 6e → 2Cr³⁺ + 7H₂O\nThế oxi hoá - khử tiêu chuẩn của cặp Cr₂O₇²⁻/Cr³⁺ là 1,36 V, chứng tỏ potassium dichromate cũng là một chất oxi hoá mạnh trong môi trường acid. Vì vậy có thể dùng nó để chuẩn độ nhiều chất khử khác cũng giống như phương pháp permanganate: H₂C₂O₄, Fe²⁺, H₂O₂, ...\nSo với phương pháp permanganate thì phương pháp dichromate có một số ưu điểm sau:\n+ Potassium dichromate dễ dàng tinh chế được ở dạng tinh khiết về mặt hoá học bằng cách kết tinh lại và sau đó sấy ở nhiệt độ 200°C. Do đó có thể pha dung dịch chuẩn K₂Cr₂O₇ từ một lượng cân chính xác được định trước.\n+ Dung dịch potassium dichromate rất bền khi bảo quản trong bình kín, không bị phân huỷ ngay cả khi đun sôi, không dễ dàng bị khử bởi các chất hữu cơ như thường xảy ra đối với potassium permanganate. Do đó, nồng độ dung dịch K₂Cr₂O₇ gần như không bị thay đổi trong thời gian bảo quản.\nTuy nhiên, phương pháp dichromate cũng có nhược điểm so với phương pháp permanganate, đó là K₂Cr₂O₇ là chất oxi hóa yếu hơn so với KMnO₄ nên khả năng áp dụng hạn chế hơn. Ngoài ra, trong quá trình chuẩn độ, ion Cr³⁺ tạo ra có màu xanh, gây khó khăn cho việc nhận biết điểm tương đương.\nChất chỉ thị thường dùng trong chuẩn độ bằng dichromate là diphenylamine (khoảng thế chuyển màu là 0,73 - 0,79V). Sau khi đạt đến điểm tương đương, chỉ cần dư một giọt potassium dichromate đã làm dung dịch trong bình phản ứng chuyển thành màu xanh xanh. Tuy nhiên trong thực tế, ví dụ khi chuẩn Fe²⁺ bằng potassium dichromate, nồng độ Fe³⁺ tăng dần sẽ làm tăng thế oxi hoá của hệ phản ứng. Do đó, diphenylamine có thể xuất hiện màu xanh khi còn chưa đến điểm tương đương. Để tránh được sai số đó người ta thêm H₃PO₄ vào hỗn hợp chuẩn độ. Acid này có tác dụng tạo phức bền với ion Fe³⁺ ở dạng [Fe(PO₄)₂]³⁻.\nMột thí nghiệm xác định nồng độ dung dịch FeSO₄ bằng K₂Cr₂O₇ được thực hiện như sau:\nBước 1: Lấy bình nón cỡ 100 ml, cho vào bình chính xác 5 ml dung dịch FeSO₄; 1 ml H₃PO₄ 1 M; 5 ml HCl 0,5 M và 2 giọt chất chỉ thị diphenylamine.\nBước 2: Nạp dung dịch K₂Cr₂O₇ 0,05 N vào burette.\nBước 3: Thêm từ từ dung dịch K₂Cr₂O₇ từ burette vào bình nón, dung dịch xuất hiện màu xanh xanh lá mạ (của ion Cr³⁺ sinh ra), chuẩn độ cho đến khi dung dịch chuyển từ màu xanh lá mạ sang màu xanh tím, ghi lại thể tích dung dịch K₂Cr₂O₇ đã thêm vào.\nBước 4: Lặp lại thí nghiệm thêm hai lần, lấy giá trị trung bình để tính toán.",
            "image_url": "",
            "image_width": 100
          },
          "questions": [
            {
              "question_no": 31,
              "question_type": "single_choice",
              "question": "Phát biểu sau đúng hay sai?\nTrong chuẩn độ ion Fe²⁺ bằng K₂Cr₂O₇, ngoài môi trường acid là HCl người ta còn phải cho thêm H₃PO₄.",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Đúng."
                },
                {
                  "key": "B",
                  "text": "Sai."
                }
              ],
              "options_are_images": false,
              "correct_answer": "A",
              "explanation": "Đúng. Việc thêm H₃PO₄ có tác dụng tạo phức bền màu với Fe³⁺, giúp hạ thế oxi hóa của hệ Fe³⁺/Fe²⁺ xuống, tránh làm diphenylamine chuyển màu xanh trước khi đạt điểm tương đương.",
              "points": 1
            },
            {
              "question_no": 32,
              "question_type": "true_false",
              "question": "Các phát biểu sau đúng hay sai?",
              "image_url": "",
              "statements": [
                {
                  "id": "a",
                  "text": "Có thể pha dung dịch chuẩn K₂Cr₂O₇ bằng cách cân chính xác."
                },
                {
                  "id": "b",
                  "text": "Phương pháp chuẩn độ bằng dichromate không cần chất chỉ thị."
                },
                {
                  "id": "c",
                  "text": "Trong môi trường thích hợp, các muối chromate (màu da cam) và dichromate (màu vàng) chuyển hóa lẫn nhau theo cân bằng: Cr₂O₇²⁻ + H₂O ⇌ 2CrO₄²⁻ + 2H⁺."
                }
              ],
              "correct_answer": {
                "a": true,
                "b": false,
                "c": false
              },
              "explanation": "1) Đúng, K₂Cr₂O₇ dễ tinh chế và rất bền nên dùng làm chất chuẩn gốc. 2) Sai, cần diphenylamine làm chất chỉ thị màu. 3) Sai, chromate màu vàng, dichromate màu cam (phát biểu bị đảo ngược màu sắc).",
              "points": 1
            },
            {
              "question_no": 33,
              "question_type": "fill_blank",
              "question": "Điền số thích hợp vào chỗ trống (số cần điền là số nguyên):\nThể tích dung dịch K₂Cr₂O₇ 0,05M vừa đủ phản ứng với dung dịch chứa 0,06 mol FeSO₄ trong môi trường H₂SO₄ dư là [o1] mL.",
              "image_url": "",
              "correct_answer": "200",
              "accepted_answers": [
                "200"
              ],
              "explanation": "Phản ứng chuẩn độ: Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O.\nSố mol Fe²⁺ = 0,06 mol => n(Cr₂O₇²⁻) = 0,06 / 6 = 0,01 mol.\nThể tích dung dịch K₂Cr₂O₇ 0,05 M cần dùng: V = 0,01 / 0,05 = 0,2 lít = 200 ml.",
              "points": 1
            },
            {
              "question_no": 34,
              "question_type": "single_choice",
              "question": "Trong thí nghiệm trên, trước khi chuẩn độ, trong bình chuẩn độ chứa bao nhiêu dung dịch khác nhau?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "2."
                },
                {
                  "key": "B",
                  "text": "3."
                },
                {
                  "key": "C",
                  "text": "4."
                },
                {
                  "key": "D",
                  "text": "5."
                }
              ],
              "options_are_images": false,
              "correct_answer": "C",
              "explanation": "Trước khi chuẩn độ, bình nón chứa: dung dịch FeSO₄, dung dịch H₃PO₄, dung dịch HCl và dung dịch chỉ thị diphenylamine (tổng cộng 4 dung dịch).",
              "points": 1
            },
            {
              "question_no": 35,
              "question_type": "drag_drop",
              "question": "Kéo thả các từ thích hợp vào chỗ trống:",
              "image_url": "",
              "body": [
                {
                  "type": "text",
                  "content": "Trong thí nghiệm chuẩn độ dung dịch "
                },
                {
                  "type": "blank",
                  "id": "o1"
                },
                {
                  "type": "text",
                  "content": " bằng "
                },
                {
                  "type": "blank",
                  "id": "o2"
                },
                {
                  "type": "text",
                  "content": ", khi thêm từ từ dung dịch K₂Cr₂O₇ từ burette vào bình, chuẩn độ đến khi dung dịch xuất hiện "
                },
                {
                  "type": "blank",
                  "id": "o3"
                },
                {
                  "type": "text",
                  "content": " thì dừng chuẩn độ."
                }
              ],
              "items": [
                {
                  "id": "item1",
                  "text": "FeSO₄"
                },
                {
                  "id": "item2",
                  "text": "K₂Cr₂O₇"
                },
                {
                  "id": "item3",
                  "text": "màu xanh lá mạ"
                },
                {
                  "id": "item4",
                  "text": "màu vàng"
                },
                {
                  "id": "item5",
                  "text": "màu xanh tím"
                },
                {
                  "id": "item6",
                  "text": "H₃PO₄"
                }
              ],
              "correct_answer": {
                "o1": "item1",
                "o2": "item2",
                "o3": "item5"
              },
              "explanation": "Chúng ta chuẩn độ dung dịch FeSO₄ (chất khử) bằng K₂Cr₂O₇ (chất oxi hóa). Điểm tương đương đạt được khi toàn bộ Fe²⁺ đã phản ứng, một giọt dư K₂Cr₂O₇ sẽ làm chỉ thị diphenylamine chuyển sang màu xanh tím.",
              "points": 1
            }
          ]
        },
        {
          "group_id": "g8",
          "title": "Ngữ liệu Khoa học số 08",
          "stimulus": {
            "type": "text",
            "content": "Sét là hiện tượng phóng điện trong khí quyển có thể nhìn thấy được, thường xảy ra giữa các đám mây mang điện tích trái dấu. Hai lý thuyết sau đây đã cố gắng giải thích cơ chế tích điện và tạo ra sét của các đám mây dông.\nLý thuyết hấp dẫn\nNhư thể hiện trong Giai đoạn I của Hình 1, một đám mây bắt đầu ngưng tụ chứa hầu hết là các hạt mưa, tuyết hoặc tinh thể băng, ban đầu chúng đều trung hoà (không mang điện). Khi các hạt lớn hơn (giọt nước hoặc tinh thể băng) ở vùng phía trên của đám mây bị rơi xuống do tác dụng của trọng lực, chúng đi qua và cọ xát với các hạt nhỏ hơn (xem Giai đoạn II). Ma sát giữa các hạt khi cọ xát tạo ra lực tĩnh điện, các hạt lớn hơn trở nên tích điện âm và rơi xuống đáy của đám mây, các hạt nhỏ hơn trở nên tích điện dương và di chuyển lên đỉnh của đám mây (xem Giai đoạn III). Sự phân tách điện tích dương và điện tích âm trong đám mây dông là nguyên nhân của sự hình thành sét.\nLý thuyết đối lưu\nTheo lý thuyết này, sự hoàn lưu gió trong các đám mây dông được cho là nguyên nhân gây ra sự phân tách điện tích. Gần mặt đất, một số hạt bụi mang điện tích dương. Các luồng gió mạnh thẳng lên (dòng không khí chuyển động đi lên theo phương thẳng đứng) mang các điện tích dương đến bề mặt của đám mây dông ở phía trên (xem Hình 2). Ban đầu, toàn bộ đám mây mang điện tích dương (Giai đoạn I). Các hạt tích điện âm trong không khí bị hút về phía đám mây tích điện dương và tạo thành một lớp điện tích âm xung quanh rìa của đám mây (Giai đoạn III). Khi gặp các luồng gió mạnh, các hạt nước rơi xuống tạo thành mưa và kéo theo lớp điện tích âm ở rìa đám mây đi xuống phía dưới (Giai đoạn IV). Như vậy, vòng tuần hoàn đối lưu đã mang các hạt điện tích dương từ khí quyển lên đỉnh của đám mây và đẩy các hạt tích điện âm ở rìa đám mây xuống dưới đáy, quá trình này được tiếp diễn suốt phần còn lại trong vòng đời của đám mây.",
            "image_url": "",
            "image_width": 100
          },
          "questions": [
            {
              "question_no": 36,
              "question_type": "fill_blank",
              "question": "Theo lý thuyết hấp dẫn, sự phân tách điện tích trong đám mây xảy ra qua [o1] giai đoạn.",
              "image_url": "",
              "correct_answer": "3",
              "accepted_answers": [
                "3"
              ],
              "explanation": "Theo lý thuyết hấp dẫn và Hình 1, quá trình tích điện xảy ra qua 3 giai đoạn: Giai đoạn I (hạt trung hòa), Giai đoạn II (cọ xát khi rơi), Giai đoạn III (phân tách điện tích âm/dương).",
              "points": 1
            },
            {
              "question_no": 37,
              "question_type": "single_choice",
              "question": "Theo lý thuyết hấp dẫn, nồng độ điện tích âm ở chân đám mây sẽ lớn nhất khi",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "những hạt mưa lớn bên trong đám mây."
                },
                {
                  "key": "B",
                  "text": "những hạt mưa nhỏ bên trong đám mây."
                },
                {
                  "key": "C",
                  "text": "không có mưa rơi vào trong đám mây."
                },
                {
                  "key": "D",
                  "text": "sau khi bị sét đánh."
                }
              ],
              "options_are_images": false,
              "correct_answer": "A",
              "explanation": "Theo lý thuyết hấp dẫn, các hạt mưa lớn hơn khi rơi xuống đáy đám mây mang theo điện tích âm. Do đó, nồng độ điện tích âm ở chân đám mây lớn nhất khi có nhiều hạt mưa lớn rơi xuống.",
              "points": 1
            },
            {
              "question_no": 38,
              "question_type": "single_choice",
              "question": "Một máy bay nghiên cứu thực hiện bay qua tâm của một đám mây dông ở giai đoạn hoàn chỉnh tại độ cao không đổi và phát hiện ra rằng, hầu hết các hạt trong vùng đó đều tích điện âm. Cả hai lý thuyết đều đồng ý rằng",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "không có hoàn lưu gió để mang các hạt tích điện dương lên khỏi mặt đất."
                },
                {
                  "key": "B",
                  "text": "hầu hết các hạt tích điện dương lơ lửng phía trên vùng được khảo sát."
                },
                {
                  "key": "C",
                  "text": "hoàn lưu gió chỉ xảy ra ở các mức trên của khu vực được khảo sát."
                },
                {
                  "key": "D",
                  "text": "toàn bộ đám mây mang điện tích âm."
                }
              ],
              "options_are_images": false,
              "correct_answer": "B",
              "explanation": "Cả hai lý thuyết đều phân bố điện tích dương ở phần trên (đỉnh đám mây) và điện tích âm ở phần dưới (đáy đám mây). Khi máy bay bay qua phần tâm của đám mây và thấy tích điện âm, cả hai lý thuyết đều thống nhất rằng các điện tích dương nằm ở phía trên vùng này.",
              "points": 1
            },
            {
              "question_no": 39,
              "question_type": "single_choice",
              "question": "Nếu một đám mây được tạo thành hoàn toàn từ tinh thể băng, theo lý thuyết hấp dẫn, nhận định nào sau đây là đúng?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Chỉ những tinh thể băng mang điện tích dương mới rơi xuống và tạo ra sự phân tách điện tích."
                },
                {
                  "key": "B",
                  "text": "Các tinh thể băng tích điện dương sẽ hút các tinh thể băng tích điện âm từ khí quyển."
                },
                {
                  "key": "C",
                  "text": "Các tinh thể băng lớn hơn sẽ rơi nhanh hơn các tinh thể băng nhỏ hơn và trở nên tích điện âm."
                },
                {
                  "key": "D",
                  "text": "Dòng khí đi xuống làm cho các tinh thể băng rơi xuống và do đó mang điện tích âm."
                }
              ],
              "options_are_images": false,
              "correct_answer": "C",
              "explanation": "Theo lý thuyết hấp dẫn, các hạt lớn hơn (rơi nhanh hơn do trọng lực) khi cọ xát với các hạt nhỏ hơn sẽ tích điện âm và đi xuống dưới. Ở đây các tinh thể băng lớn hơn rơi nhanh hơn tinh thể băng nhỏ và tích điện âm.",
              "points": 1
            },
            {
              "question_no": 40,
              "question_type": "single_choice",
              "question": "Sét thường xảy ra khi dòng điện chạy từ vùng mang điện tích âm đến vùng mang điện tích dương. Dựa trên lý thuyết đối lưu, đường đi nào của tia sét không thể xảy ra?",
              "image_url": "",
              "options": [
                {
                  "key": "A",
                  "text": "Trong đám mây từ chân tới đỉnh."
                },
                {
                  "key": "B",
                  "text": "Từ chân đám mây này đến đỉnh đám mây khác."
                },
                {
                  "key": "C",
                  "text": "Từ chân mây xuống mặt đất."
                },
                {
                  "key": "D",
                  "text": "Từ chân mây đến vùng tích điện dương của khí quyển."
                }
              ],
              "options_are_images": false,
              "correct_answer": "D",
              "explanation": "Lý thuyết đối lưu chỉ ra điện tích dương tập trung ở đỉnh đám mây và gần mặt đất. Không có vùng tích điện dương lơ lửng của khí quyển ở vị trí tương ứng để tia sét phóng từ chân mây (âm) tới đó.",
              "points": 1
            }
          ]
        }
      ],
      "g1": {
        "group_id": "g1",
        "title": "Ngữ liệu Khoa học số 01",
        "stimulus": {
          "type": "text",
          "content": "Không khí trong một phòng tắm hơi đđược làm nóng và giữ luôn ở nhiệt độ 90 °C làm cho người trong phòng tắm hơi đổ nhiều mồ hôi. Bộ phận làm nóng có tác dụng làm tăng nhiệt độ không khí trong phòng tắm hơi. Nhiệt dung của không khí có hơi nước trong phòng tắm hơi là 47 kJ/K.\nBộ điều khiển nhiệt độ có chức năng đo nhiệt độ và điều khiển đóng, ngắt bộ phận làm nóng để giữ nhiệt độ trong phòng tắm không đổi. Để đo nhiệt độ, có thể sử dụng một trong hai cảm biến nhiệt độ có đường đặc trưng điện áp U theo nhiệt độ t như đồ thị Hình 1.\n\n<img src=\"https://assets.tmastudy.io.vn/assets/7.png\" style=\"max-width: 100%; display: block; margin: 15px auto; border-radius: 8px; width: 80%;\" />\n\nHình 1. Đường đặc trưng điện áp - nhiệt độ của cảm biến A và B\n\nBiểu thức liên hệ áp suất p (N/m²), nhiệt độ tuyệt đối T (K), thể tích V (m³) của n mol khí là: \\( pV = nRT = \\frac{m}{\\mu} RT \\), trong đó:\nm (g) là khối lượng khí;\n\\( \\mu \\) (g/mol) là khối lượng 1 mol khí;\nR là hằng số khí lí tưởng và R = 8,31 J/mol;\n\nNhiệt dung C của vật là nhiệt lượng cần thiết để làm vật tăng nhiệt độ thêm 1 K. Biểu thức: \\( C = \\frac{Q}{\\Delta T} \\), trong đó:\nQ (J) là nhiệt lượng mà vật nhận đđược;\n\\( \\Delta T \\) (K) là độ tăng nhiệt độ\n\nTrong khí tượng học, độ ẩm tương đối f (%) của không khí ở nhiệt độ T đđược tính gần đúng là \\( f = \\frac{p}{p_{bh}} \\), trong đó:\np là áp suất hơi nước ở nhiệt độ T;\n\\( p_{bh} \\) là áp suất hơi nước bão hoà ở nhiệt độ T.",
          "image_url": "https://assets.tmastudy.io.vn/assets/7.png",
          "image_width": 100
        },
        "questions": [
          {
            "question_no": 1,
            "question_type": "single_choice",
            "question": "Các quá trình truyền nhiệt từ bộ phận làm nóng sang người trong phòng tắm hơi bao gồm:\n1. Truyền nhiệt từ bộ phận làm nóng sang không khí.\n2. Truyền nhiệt trong không khí.\n3. Truyền nhiệt từ không khí sang người trong phòng tắm hơi.\nCác hình thức truyền nhiệt chủ yếu tương ứng với các quá trình 1-2-3 là:",
            "image_url": "",
            "image_width": 100,
            "options": [
              {
                "key": "A",
                "text": "bức xạ – đối lưu – dẫn nhiệt."
              },
              {
                "key": "B",
                "text": "dẫn nhiệt – đối lưu – đối lưu."
              },
              {
                "key": "C",
                "text": "dẫn nhiệt – đối lưu – dẫn nhiệt."
              },
              {
                "key": "D",
                "text": "bức xạ – đối lưu – đối lưu."
              }
            ],
            "options_are_images": false,
            "correct_answer": "D",
            "explanation": "Quá trình 1: Bộ phận làm nóng rất nóng truyền nhiệt cho không khí xung quanh bằng bức xạ nhiệt. Quá trình 2: Nhiệt truyền trong chất khí chủ yếu bằng đối lưu. Quá trình 3: Dòng không khí nóng tiếp xúc và truyền nhiệt cho cơ thể người bằng đối lưu.",
            "points": 1
          },
          {
            "question_no": 2,
            "question_type": "single_choice",
            "question": "Chọn phương án thích hợp điền vào chỗ trống để phát biểu sau đúng:\nKhi người ở trong môi trường nhiệt độ cao (90 °C) của phòng tắm hơi, da người đổ nhiều mồ hôi là bởi vì ........................ nên người không bị quá nóng.",
            "image_url": "",
            "image_width": 100,
            "options": [
              {
                "key": "A",
                "text": "mồ hôi trên da sẽ bay hơi, thu nhiệt và làm giảm nhiệt độ của không khí"
              },
              {
                "key": "B",
                "text": "mồ hôi thu nhiệt và bay hơi làm giảm nhiệt độ của da"
              },
              {
                "key": "C",
                "text": "mồ hôi tạo thành lớp nước cách nhiệt với không khí nóng"
              },
              {
                "key": "D",
                "text": "mồ hôi trên da sẽ bay hơi và cân bằng với nhiệt độ của không khí"
              }
            ],
            "options_are_images": false,
            "correct_answer": "B",
            "explanation": "Sự bay hơi của mồ hôi trên da là quá trình thu nhiệt từ cơ thể (da) sang môi trường, giúp hạ nhiệt độ bề mặt da và ngăn cơ thể bị tăng nhiệt độ quá mức.",
            "points": 1
          },
          {
            "question_no": 3,
            "question_type": "fill_blank",
            "question": "Một phòng tắm hơi có thể tích 34 m³. Không khí trong phòng tắm hơi có độ ẩm tương đối là 3,5%. Khối lượng mol của nước là 18 g/mol. Áp suất hơi nước bão hoà ở nhiệt độ 90 °C là 70 kPa. Khối lượng hơi nước trong phòng tắm hơi là [o1] kg.",
            "image_url": "",
            "image_width": 100,
            "correct_answer": "0,5",
            "accepted_answers": [
              "0,5"
            ],
            "explanation": "Áp suất hơi nước: p = f * p_bh = 0,035 * 70000 = 2450 Pa.\nNhiệt độ tuyệt đối: T = 90 + 273,15 = 363,15 K.\nÁp dụng phương trình trạng thái khí lí tưởng: pV = (m/μ)RT => m = (p * V * μ) / (R * T) = (2450 * 34 * 0,018) / (8,31 * 363,15) ≈ 0,5 kg.",
            "points": 1
          },
          {
            "question_no": 4,
            "question_type": "drag_drop",
            "question": "Kéo ô thích hợp thả vào vị trí tương ứng để hoàn thành nhận định sau:",
            "image_url": "",
            "image_width": 100,
            "body": [
              {
                "type": "text",
                "content": "Để duy trì nhiệt độ trong phòng tắm hơi ổn định và chính xác ở mức 90 °C, nên chọn "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " vì ở gần 90°C, điện áp U tăng "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": " theo nhiệt độ."
              }
            ],
            "items": [
              {
                "id": "item1",
                "text": "cảm biến A"
              },
              {
                "id": "item2",
                "text": "cảm biến B"
              },
              {
                "id": "item3",
                "text": "cảm biến A và B"
              },
              {
                "id": "item4",
                "text": "nhanh"
              },
              {
                "id": "item5",
                "text": "chậm"
              }
            ],
            "correct_answer": {
              "o1": "item2",
              "o2": "item4"
            },
            "explanation": "Dựa vào đồ thị Hình 1, quanh khu vực 90 °C, đường đặc trưng của cảm biến A rất dốc nằm ngang (điện áp U thay đổi chậm theo nhiệt độ), còn cảm biến B có độ dốc đứng lớn (điện áp U tăng nhanh theo nhiệt độ), giúp đo đạc nhạy bén và chính xác hơn.",
            "points": 1
          },
          {
            "question_no": 5,
            "question_type": "fill_blank",
            "question": "Điền số tự nhiên thích hợp vào chỗ trống:\nBộ phận làm nóng dùng điện trở nhiệt có công suất nhiệt (nhiệt lượng chuyển hoá đđược từ điện năng trong 1 giây) là 32,6 kW, làm tăng nhiệt độ của không khí chứa hơi nước và các đồ vật trong phòng tắm hơi thêm 0,27 °C mỗi giây. Nhiệt dung của các vật (không bao gồm không khí và hơi nước) trong phòng tắm hơi xấp xỉ là [o1] kJ/K.",
            "image_url": "",
            "image_width": 100,
            "correct_answer": "74",
            "accepted_answers": [
              "74"
            ],
            "explanation": "Nhiệt lượng cung cấp trong 1 giây: Q = 32,6 kJ.\nTổng nhiệt dung: C_tổng = Q / Δt = 32,6 / 0,27 ≈ 120,74 kJ/K.\nNhiệt dung vật: C_vật = C_tổng - C_không_khí = 120,74 - 47 ≈ 74 kJ/K.",
            "points": 1
          }
        ]
      },
      "g1_questions": [
        {
          "question_no": 1,
          "question_type": "single_choice",
          "question": "Các quá trình truyền nhiệt từ bộ phận làm nóng sang người trong phòng tắm hơi bao gồm:\n1. Truyền nhiệt từ bộ phận làm nóng sang không khí.\n2. Truyền nhiệt trong không khí.\n3. Truyền nhiệt từ không khí sang người trong phòng tắm hơi.\nCác hình thức truyền nhiệt chủ yếu tương ứng với các quá trình 1-2-3 là:",
          "image_url": "",
          "image_width": 100,
          "options": [
            {
              "key": "A",
              "text": "bức xạ – đối lưu – dẫn nhiệt."
            },
            {
              "key": "B",
              "text": "dẫn nhiệt – đối lưu – đối lưu."
            },
            {
              "key": "C",
              "text": "dẫn nhiệt – đối lưu – dẫn nhiệt."
            },
            {
              "key": "D",
              "text": "bức xạ – đối lưu – đối lưu."
            }
          ],
          "options_are_images": false,
          "correct_answer": "D",
          "explanation": "Quá trình 1: Bộ phận làm nóng rất nóng truyền nhiệt cho không khí xung quanh bằng bức xạ nhiệt. Quá trình 2: Nhiệt truyền trong chất khí chủ yếu bằng đối lưu. Quá trình 3: Dòng không khí nóng tiếp xúc và truyền nhiệt cho cơ thể người bằng đối lưu.",
          "points": 1
        },
        {
          "question_no": 2,
          "question_type": "single_choice",
          "question": "Chọn phương án thích hợp điền vào chỗ trống để phát biểu sau đúng:\nKhi người ở trong môi trường nhiệt độ cao (90 °C) của phòng tắm hơi, da người đổ nhiều mồ hôi là bởi vì ........................ nên người không bị quá nóng.",
          "image_url": "",
          "image_width": 100,
          "options": [
            {
              "key": "A",
              "text": "mồ hôi trên da sẽ bay hơi, thu nhiệt và làm giảm nhiệt độ của không khí"
            },
            {
              "key": "B",
              "text": "mồ hôi thu nhiệt và bay hơi làm giảm nhiệt độ của da"
            },
            {
              "key": "C",
              "text": "mồ hôi tạo thành lớp nước cách nhiệt với không khí nóng"
            },
            {
              "key": "D",
              "text": "mồ hôi trên da sẽ bay hơi và cân bằng với nhiệt độ của không khí"
            }
          ],
          "options_are_images": false,
          "correct_answer": "B",
          "explanation": "Sự bay hơi của mồ hôi trên da là quá trình thu nhiệt từ cơ thể (da) sang môi trường, giúp hạ nhiệt độ bề mặt da và ngăn cơ thể bị tăng nhiệt độ quá mức.",
          "points": 1
        },
        {
          "question_no": 3,
          "question_type": "fill_blank",
          "question": "Một phòng tắm hơi có thể tích 34 m³. Không khí trong phòng tắm hơi có độ ẩm tương đối là 3,5%. Khối lượng mol của nước là 18 g/mol. Áp suất hơi nước bão hoà ở nhiệt độ 90 °C là 70 kPa. Khối lượng hơi nước trong phòng tắm hơi là [o1] kg.",
          "image_url": "",
          "image_width": 100,
          "correct_answer": "0,5",
          "accepted_answers": [
            "0,5"
          ],
          "explanation": "Áp suất hơi nước: p = f * p_bh = 0,035 * 70000 = 2450 Pa.\nNhiệt độ tuyệt đối: T = 90 + 273,15 = 363,15 K.\nÁp dụng phương trình trạng thái khí lí tưởng: pV = (m/μ)RT => m = (p * V * μ) / (R * T) = (2450 * 34 * 0,018) / (8,31 * 363,15) ≈ 0,5 kg.",
          "points": 1
        },
        {
          "question_no": 4,
          "question_type": "drag_drop",
          "question": "Kéo ô thích hợp thả vào vị trí tương ứng để hoàn thành nhận định sau:",
          "image_url": "",
          "image_width": 100,
          "body": [
            {
              "type": "text",
              "content": "Để duy trì nhiệt độ trong phòng tắm hơi ổn định và chính xác ở mức 90 °C, nên chọn "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " vì ở gần 90°C, điện áp U tăng "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " theo nhiệt độ."
            }
          ],
          "items": [
            {
              "id": "item1",
              "text": "cảm biến A"
            },
            {
              "id": "item2",
              "text": "cảm biến B"
            },
            {
              "id": "item3",
              "text": "cảm biến A và B"
            },
            {
              "id": "item4",
              "text": "nhanh"
            },
            {
              "id": "item5",
              "text": "chậm"
            }
          ],
          "correct_answer": {
            "o1": "item2",
            "o2": "item4"
          },
          "explanation": "Dựa vào đồ thị Hình 1, quanh khu vực 90 °C, đường đặc trưng của cảm biến A rất dốc nằm ngang (điện áp U thay đổi chậm theo nhiệt độ), còn cảm biến B có độ dốc đứng lớn (điện áp U tăng nhanh theo nhiệt độ), giúp đo đạc nhạy bén và chính xác hơn.",
          "points": 1
        },
        {
          "question_no": 5,
          "question_type": "fill_blank",
          "question": "Điền số tự nhiên thích hợp vào chỗ trống:\nBộ phận làm nóng dùng điện trở nhiệt có công suất nhiệt (nhiệt lượng chuyển hoá đđược từ điện năng trong 1 giây) là 32,6 kW, làm tăng nhiệt độ của không khí chứa hơi nước và các đồ vật trong phòng tắm hơi thêm 0,27 °C mỗi giây. Nhiệt dung của các vật (không bao gồm không khí và hơi nước) trong phòng tắm hơi xấp xỉ là [o1] kJ/K.",
          "image_url": "",
          "image_width": 100,
          "correct_answer": "74",
          "accepted_answers": [
            "74"
          ],
          "explanation": "Nhiệt lượng cung cấp trong 1 giây: Q = 32,6 kJ.\nTổng nhiệt dung: C_tổng = Q / Δt = 32,6 / 0,27 ≈ 120,74 kJ/K.\nNhiệt dung vật: C_vật = C_tổng - C_không_khí = 120,74 - 47 ≈ 74 kJ/K.",
          "points": 1
        }
      ],
      "g2": {
        "group_id": "g2",
        "title": "Ngữ liệu Khoa học số 02",
        "stimulus": {
          "type": "text",
          "content": "Cho bảng nhiệt độ sôi của các chất như sau:\nBảng 1. Nhiệt độ sôi của một số chất\n<table style=\"width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; text-align: left;\"><thead><tr style=\"background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;\"><th style=\"padding: 10px; border: 1px solid #e2e8f0;\">Chất</th><th style=\"padding: 10px; border: 1px solid #e2e8f0;\">Tên gọi</th><th style=\"padding: 10px; border: 1px solid #e2e8f0; text-align: center;\">Phân tử khối</th><th style=\"padding: 10px; border: 1px solid #e2e8f0; text-align: center;\">Nhiệt độ sôi (°C)</th></tr></thead><tbody><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">(CH₃)₃N</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Trimethylamine</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">59</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">3,0</td></tr><tr style=\"background-color: #f8fafc;\"><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃–O–CH₂CH₃</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Ethylmethyl ether</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">60</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">8,0</td></tr><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃–NH–CH₂CH₃</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Ethylmethylamine</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">59</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">37,0</td></tr><tr style=\"background-color: #f8fafc;\"><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃CH₂CH₂–NH₂</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Propylamine</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">59</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">48,0</td></tr><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃CH₂CH₂–OH</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Propan-1-ol</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">60</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">97,0</td></tr><tr style=\"background-color: #f8fafc;\"><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃CH₂–NH₂</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Ethylamine</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">45</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">16,6</td></tr><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">CH₃CH₂–OH</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Ethanol</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">46</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">78,3</td></tr><tr style=\"background-color: #f8fafc;\"><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">H–O–H</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Nước</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">18</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">100</td></tr><tr><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">H–S–H</td><td style=\"padding: 8px; border: 1px solid #e2e8f0;\">Hydrogen sulfide</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">34</td><td style=\"padding: 8px; border: 1px solid #e2e8f0; text-align: center;\">–60,7</td></tr></tbody></table>\n\nĐể một chất có thể sôi, cần phải cung cấp năng lượng để phá vỡ liên kết giữa các phân tử và cung cấp động năng để phân tử chuyển động. Nhiệt độ sôi của chất phụ thuộc vào hai yếu tố chính sau:\n(1) Khối lượng phân tử: Khối lượng phân tử càng lớn thì càng cần nhiều động năng để chuyển động, nên nhiệt độ sôi càng cao.\n(2) Liên kết giữa các phân tử: Số lượng liên kết giữa các phân tử càng nhiều, lực liên kết càng mạnh thì càng cần nhiều năng lượng để phá vỡ liên kết giữa chúng. Khi đó, nhiệt độ sôi của chất đó càng cao.\nMột trong những loại liên kết ảnh hưởng lớn đến nhiệt độ sôi của chất là liên kết hydrogen. Liên kết hydrogen hình thành khi nguyên tử H, đã liên kết với một nguyên tử có độ âm điện lớn (như N, O, F), tương tác với một nguyên tử khác có độ âm điện lớn và còn cặp electron chưa liên kết. Để hình thành liên kết hydrogen, nguyên tử F, O, N liên kết với hydrogen phải có ít nhất một cặp electron chưa liên kết. Liên kết hydrogen thường được kí hiệu bằng dấu ba chấm (...), rải đều từ nguyên tử H đến nguyên tử tạo liên kết hydrogen với nó. Ví dụ, liên kết hydrogen giữa các phân tử ethanol (C₂H₅OH) có thể được biểu diễn như sau:\n\n<svg viewBox=\"0 0 320 80\" width=\"360\" height=\"90\" style=\"display: block; margin: 15px auto; max-width: 100%; font-family: 'Inter', 'Arial', sans-serif;\">\n  <line x1=\"5\" y1=\"25\" x2=\"35\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.8\" stroke-dasharray=\"3,3\" />\n  <text x=\"50\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">O</text>\n  <line x1=\"62\" y1=\"25\" x2=\"78\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"90\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">H</text>\n  <line x1=\"50\" y1=\"36\" x2=\"50\" y2=\"48\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"50\" y=\"65\" font-size=\"14\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">C₂H₅</text>\n  <line x1=\"102\" y1=\"25\" x2=\"132\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.8\" stroke-dasharray=\"3,3\" />\n  <text x=\"147\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">O</text>\n  <line x1=\"159\" y1=\"25\" x2=\"175\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"187\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">H</text>\n  <line x1=\"147\" y1=\"36\" x2=\"147\" y2=\"48\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"147\" y=\"65\" font-size=\"14\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">C₂H₅</text>\n  <line x1=\"199\" y1=\"25\" x2=\"229\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.8\" stroke-dasharray=\"3,3\" />\n  <text x=\"244\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">O</text>\n  <line x1=\"256\" y1=\"25\" x2=\"272\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"284\" y=\"30\" font-size=\"16\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">H</text>\n  <line x1=\"244\" y1=\"36\" x2=\"244\" y2=\"48\" stroke=\"#1e293b\" stroke-width=\"1.5\" />\n  <text x=\"244\" y=\"65\" font-size=\"14\" font-weight=\"600\" text-anchor=\"middle\" fill=\"#1e293b\">C₂H₅</text>\n  <line x1=\"296\" y1=\"25\" x2=\"315\" y2=\"25\" stroke=\"#1e293b\" stroke-width=\"1.8\" stroke-dasharray=\"3,3\" />\n</svg>\n\nLiên kết hydrogen giữa các phân tử ethanol (C₂H₅OH) hình thành khi nguyên tử H trong nhóm hydroxyl (–OH) của một phân tử ethanol tương tác với nguyên tử O trong nhóm hydroxyl của phân tử ethanol khác. Điều này xảy ra do nguyên tử H liên kết với O có độ âm điện lớn, trong khi O có cặp electron chưa liên kết. Khi ethanol được hoà tan trong nước, các phân tử ethanol tạo liên kết hydrogen không chỉ với chính nó mà còn với các phân tử nước.\nMột cách tổng quát, các phân tử có thể liên kết với nhau bằng lực liên kết hydrogen, tuy nhiên lực liên kết hydrogen yếu hơn so với lực liên kết giữa các nguyên tử trong liên kết ion hoặc liên kết cộng hoá trị. Thông thường, nguyên tử có độ âm điện càng lớn thì liên kết của nguyên tử H với nguyên tử đó càng phân cực, vì vậy tạo được liên kết hydrogen mạnh hơn.",
          "image_url": "",
          "image_width": 100
        },
        "questions": [
          {
            "question_no": 6,
            "question_type": "single_choice",
            "question": "Trong bảng trên, số chất không tạo được liên kết hydrogen là:",
            "image_url": "",
            "image_width": 100,
            "options": [
              {
                "key": "A",
                "text": "1."
              },
              {
                "key": "B",
                "text": "2."
              },
              {
                "key": "C",
                "text": "3."
              },
              {
                "key": "D",
                "text": "4."
              }
            ],
            "options_are_images": false,
            "correct_answer": "C",
            "explanation": "Các chất không tạo được liên kết hydrogen với chính nó gồm: (CH3)3N (amin bậc 3 không có liên kết N-H), CH3–O–CH2CH3 (ether không có liên kết O-H) và H–S–H (H2S không tạo được liên kết hydro do độ âm điện của S nhỏ). Tổng cộng có 3 chất.",
            "points": 1
          },
          {
            "question_no": 7,
            "question_type": "single_choice",
            "question": "Phân tử propylamine có bao nhiêu nguyên tử H có khả năng tạo liên kết hydrogen?",
            "image_url": "",
            "image_width": 100,
            "options": [
              {
                "key": "A",
                "text": "2."
              },
              {
                "key": "B",
                "text": "4."
              },
              {
                "key": "C",
                "text": "6."
              },
              {
                "key": "D",
                "text": "9."
              }
            ],
            "options_are_images": false,
            "correct_answer": "A",
            "explanation": "Propylamine có công thức CH3CH2CH2-NH2. Chỉ có các nguyên tử H liên kết trực tiếp với nguyên tử có độ âm điện lớn (N) trong nhóm -NH2 mới có khả năng tạo liên kết hydrogen. Do đó có 2 nguyên tử H thỏa mãn.",
            "points": 1
          },
          {
            "question_no": 8,
            "question_type": "single_choice",
            "question": "Chất tạo được liên kết hydrogen mạnh nhất là:",
            "image_url": "",
            "image_width": 100,
            "options": [
              {
                "key": "A",
                "text": "ethylmethyl ether."
              },
              {
                "key": "B",
                "text": "ethylmethylamine."
              },
              {
                "key": "C",
                "text": "propylamine."
              },
              {
                "key": "D",
                "text": "ethanol."
              }
            ],
            "options_are_images": false,
            "correct_answer": "D",
            "explanation": "Ethanol có liên kết O-H. Do O có độ âm điện lớn hơn N, liên kết O-H phân cực mạnh hơn liên kết N-H trong các amin, dẫn đến liên kết hydrogen tạo bởi nhóm O-H của ethanol mạnh nhất.",
            "points": 1
          },
          {
            "question_no": 9,
            "question_type": "true_false",
            "question": "Cho nguyên tử khối của O = 16 amu; H = 1 amu và C = 12 amu. Xét tính đúng sai của các phát biểu sau:",
            "image_url": "",
            "image_width": 100,
            "statements": [
              {
                "id": "a",
                "text": "Các nguyên tử trong phân tử ethanol liên kết với nhau bằng liên kết hydrogen."
              },
              {
                "id": "b",
                "text": "CH₃OH có nhiệt độ sôi cao hơn HCH=O."
              },
              {
                "id": "c",
                "text": "Thứ tự tăng dần nhiệt độ sôi từ trái sang phải là CH₄, CH₃–CH₃, CH₃OH."
              }
            ],
            "correct_answer": {
              "a": false,
              "b": true,
              "c": true
            },
            "explanation": "a) Sai, các nguyên tử trong một phân tử ethanol liên kết với nhau bằng liên kết cộng hóa trị. Liên kết hydrogen chỉ hình thành giữa các phân tử ethanol với nhau.\nb) Đúng, CH3OH tạo được liên kết hydrogen liên phân tử nên nhiệt độ sôi cao hơn HCHO.\nc) Đúng, CH4 (-161.5 °C) < C2H6 (-89 °C) < CH3OH (64.7 °C).",
            "points": 1
          },
          {
            "question_no": 10,
            "question_type": "fill_blank",
            "question": "Điền số tự nhiên thích hợp vào chỗ trống:\nSố kiểu liên kết hydrogen trong dung dịch ethanol là [o1].",
            "image_url": "",
            "image_width": 100,
            "correct_answer": "4",
            "accepted_answers": [
              "4"
            ],
            "explanation": "Trong dung dịch ethanol gồm ethanol (EtOH) và nước (H2O) có 4 kiểu liên kết hydrogen liên phân tử:\n1. EtOH...EtOH (H của EtOH liên kết với O của EtOH)\n2. EtOH...H2O (H của EtOH liên kết với O của H2O)\n3. H2O...EtOH (H của H2O liên kết với O của EtOH)\n4. H2O...H2O (H của H2O liên kết với O của H2O)",
            "points": 1
          }
        ]
      },
      "g2_questions": [
        {
          "question_no": 6,
          "question_type": "single_choice",
          "question": "Trong bảng trên, số chất không tạo được liên kết hydrogen là:",
          "image_url": "",
          "image_width": 100,
          "options": [
            {
              "key": "A",
              "text": "1."
            },
            {
              "key": "B",
              "text": "2."
            },
            {
              "key": "C",
              "text": "3."
            },
            {
              "key": "D",
              "text": "4."
            }
          ],
          "options_are_images": false,
          "correct_answer": "C",
          "explanation": "Các chất không tạo được liên kết hydrogen với chính nó gồm: (CH3)3N (amin bậc 3 không có liên kết N-H), CH3–O–CH2CH3 (ether không có liên kết O-H) và H–S–H (H2S không tạo được liên kết hydro do độ âm điện của S nhỏ). Tổng cộng có 3 chất.",
          "points": 1
        },
        {
          "question_no": 7,
          "question_type": "single_choice",
          "question": "Phân tử propylamine có bao nhiêu nguyên tử H có khả năng tạo liên kết hydrogen?",
          "image_url": "",
          "image_width": 100,
          "options": [
            {
              "key": "A",
              "text": "2."
            },
            {
              "key": "B",
              "text": "4."
            },
            {
              "key": "C",
              "text": "6."
            },
            {
              "key": "D",
              "text": "9."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A",
          "explanation": "Propylamine có công thức CH3CH2CH2-NH2. Chỉ có các nguyên tử H liên kết trực tiếp với nguyên tử có độ âm điện lớn (N) trong nhóm -NH2 mới có khả năng tạo liên kết hydrogen. Do đó có 2 nguyên tử H thỏa mãn.",
          "points": 1
        },
        {
          "question_no": 8,
          "question_type": "single_choice",
          "question": "Chất tạo được liên kết hydrogen mạnh nhất là:",
          "image_url": "",
          "image_width": 100,
          "options": [
            {
              "key": "A",
              "text": "ethylmethyl ether."
            },
            {
              "key": "B",
              "text": "ethylmethylamine."
            },
            {
              "key": "C",
              "text": "propylamine."
            },
            {
              "key": "D",
              "text": "ethanol."
            }
          ],
          "options_are_images": false,
          "correct_answer": "D",
          "explanation": "Ethanol có liên kết O-H. Do O có độ âm điện lớn hơn N, liên kết O-H phân cực mạnh hơn liên kết N-H trong các amin, dẫn đến liên kết hydrogen tạo bởi nhóm O-H của ethanol mạnh nhất.",
          "points": 1
        },
        {
          "question_no": 9,
          "question_type": "true_false",
          "question": "Cho nguyên tử khối của O = 16 amu; H = 1 amu và C = 12 amu. Xét tính đúng sai của các phát biểu sau:",
          "image_url": "",
          "image_width": 100,
          "statements": [
            {
              "id": "a",
              "text": "Các nguyên tử trong phân tử ethanol liên kết với nhau bằng liên kết hydrogen."
            },
            {
              "id": "b",
              "text": "CH₃OH có nhiệt độ sôi cao hơn HCH=O."
            },
            {
              "id": "c",
              "text": "Thứ tự tăng dần nhiệt độ sôi từ trái sang phải là CH₄, CH₃–CH₃, CH₃OH."
            }
          ],
          "correct_answer": {
            "a": false,
            "b": true,
            "c": true
          },
          "explanation": "a) Sai, các nguyên tử trong một phân tử ethanol liên kết với nhau bằng liên kết cộng hóa trị. Liên kết hydrogen chỉ hình thành giữa các phân tử ethanol với nhau.\nb) Đúng, CH3OH tạo được liên kết hydrogen liên phân tử nên nhiệt độ sôi cao hơn HCHO.\nc) Đúng, CH4 (-161.5 °C) < C2H6 (-89 °C) < CH3OH (64.7 °C).",
          "points": 1
        },
        {
          "question_no": 10,
          "question_type": "fill_blank",
          "question": "Điền số tự nhiên thích hợp vào chỗ trống:\nSố kiểu liên kết hydrogen trong dung dịch ethanol là [o1].",
          "image_url": "",
          "image_width": 100,
          "correct_answer": "4",
          "accepted_answers": [
            "4"
          ],
          "explanation": "Trong dung dịch ethanol gồm ethanol (EtOH) và nước (H2O) có 4 kiểu liên kết hydrogen liên phân tử:\n1. EtOH...EtOH (H của EtOH liên kết với O của EtOH)\n2. EtOH...H2O (H của EtOH liên kết với O của H2O)\n3. H2O...EtOH (H của H2O liên kết với O của EtOH)\n4. H2O...H2O (H của H2O liên kết với O của H2O)",
          "points": 1
        }
      ],
      "g3": {
        "group_id": "g3",
        "title": "Ngữ liệu Khoa học số 03",
        "stimulus": {
          "type": "text",
          "content": "Virus SARS-CoV-2 là virus đường hô hấp mới gây bệnh viêm đường hô hấp cấp (Covid-19) ở người, xuất hiện lần đầu tiên vào tháng 12 năm 2019 tại Vũ Hán (Trung Quốc), có khả năng lây lan từ người sang người và nhanh chóng đã trở thành một đại dịch toàn cầu.\nVirus SARS-CoV-2 có dạng hình cầu, đường kính xấp xỉ 125 nanomet, với cấu tạo gồm có lõi nucleic acid chứa ARN sợi đơn, lớp vỏ capsid và lớp vỏ ngoài chứa các thụ thể glycoprotein làm nhiệm vụ kháng nguyên. Ở nhiệt độ cao bên ngoài cơ thể (đặc biệt trên 25 °C), có nắng và môi trường thông thoáng sẽ làm virus SARS-CoV-2 yếu đi và giảm khả năng lây bệnh của chúng. Ngược lại, nếu ở trong điều kiện nhiệt độ thấp, độ ẩm cao, không khí không lưu thông tốt thì virus sẽ phát tán và lây lan rất nhanh.\nDưới đây là biểu đồ tình hình dịch bệnh tại cộng đồng thành phố Hà Nội, cập nhật mới nhất 18 giờ ngày 08/02/2022, thể hiện rõ số ca mắc tăng cao kỉ lục trong thời gian Tết Nguyên Đán:\n\n<img src=\"https://assets.tmastudy.io.vn/assets/8.png\" style=\"max-width: 100%; display: block; margin: 15px auto; border-radius: 8px; width: 80%;\" />\n\n(Số liệu lấy từ Sở y tế Hà Nội - 2022)",
          "image_url": "https://assets.tmastudy.io.vn/assets/8.png",
          "image_width": 100
        },
        "questions": [
          {
            "question_no": 11,
            "question_type": "single_choice",
            "question": "Dựa vào biểu đồ trên, cho biết ngày nào sau đây có số ca mắc mới ở cộng đồng cao nhất thành phố Hà Nội đợt 4?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "14/01/2022."
              },
              {
                "key": "B",
                "text": "23/01/2022."
              },
              {
                "key": "C",
                "text": "20/01/2022."
              },
              {
                "key": "D",
                "text": "08/01/2022."
              }
            ],
            "options_are_images": false,
            "correct_answer": "B",
            "explanation": "Dựa vào biểu đồ, số ca mắc ngoài cộng đồng (cột màu vàng) vào ngày 23/01/2022 đạt mức cao nhất (830 ca) so với các ngày được chọn.",
            "points": 1
          },
          {
            "question_no": 12,
            "question_type": "single_choice",
            "question": "Nguyên nhân nào sau đây có thể làm tăng nguy cơ lây lan dịch bệnh Covid – 19 một cách nhanh chóng?\n(1) Chỉ cần đeo khẩu trang khi tiếp xúc với người đã nhiễm virus SARS-CoV-2.\n(2) Luôn rửa tay sau khi chạm vào các vật nơi công cộng.\n(3) Tổ chức các cuộc gặp mặt đầu xuân.\n(4) Sử dụng chung các đồ dùng nơi công cộng.\n(5) Làm việc trong không gian hẹp, thiếu sự lưu thông khí.",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "(1), (2), (3), (4)."
              },
              {
                "key": "B",
                "text": "(1), (3), (4), (5)."
              },
              {
                "key": "C",
                "text": "(2), (3), (4), (5)."
              },
              {
                "key": "D",
                "text": "(1), (3), (5)."
              }
            ],
            "options_are_images": false,
            "correct_answer": "B",
            "explanation": "Các nguyên nhân làm dịch lây lan nhanh bao gồm: không đeo khẩu trang phòng ngừa rộng rãi (1), tụ tập đông người (3), dùng chung đồ vật (4) và làm việc trong không gian kín (5). (2) là biện pháp phòng ngừa.",
            "points": 1
          },
          {
            "question_no": 13,
            "question_type": "single_choice",
            "question": "Số lượng ca mắc trong cộng đồng tăng cao gây khó khăn cho công tác phòng chống dịch hơn các ca mắc mới trong khu vực đã cách ly vì",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "khó khăn trong việc truy vết, dễ dàng lây lan chéo tạo thành các ổ dịch."
              },
              {
                "key": "B",
                "text": "tạo ra các chủng đột biến mới gây nguy hiểm hơn các chủng đột biến cũ."
              },
              {
                "key": "C",
                "text": "làm giảm hiệu quả phòng bệnh của vắc xin."
              },
              {
                "key": "D",
                "text": "cơ thể không đáp ứng miễn dịch."
              }
            ],
            "options_are_images": false,
            "correct_answer": "A",
            "explanation": "Ca mắc cộng đồng là nguồn lây chưa được khoanh vùng cách ly, khó xác định nguồn lây và lịch trình tiếp xúc, khiến việc truy vết gặp nhiều khó khăn và tăng nguy cơ lây lan âm thầm.",
            "points": 1
          },
          {
            "question_no": 14,
            "question_type": "single_choice",
            "question": "Phát biểu sau đây đúng hay sai?\nThuốc kháng sinh có khả năng điều trị các bệnh về virus.",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Đúng."
              },
              {
                "key": "B",
                "text": "Sai."
              }
            ],
            "options_are_images": false,
            "correct_answer": "B",
            "explanation": "Thuốc kháng sinh chỉ tiêu diệt hoặc ức chế vi khuẩn, hoàn toàn không có tác dụng đối với virus.",
            "points": 1
          },
          {
            "question_no": 15,
            "question_type": "fill_blank",
            "question": "Điền từ/cụm từ thích hợp vào chỗ trống sau đây:\nKháng nguyên là những chất khi xâm nhập vào cơ thể người được hệ thống miễn dịch nhận biết và sinh ra các [o1] tương ứng.",
            "image_url": "",
            "correct_answer": "kháng thể",
            "accepted_answers": [
              "kháng thể"
            ],
            "explanation": "Kháng nguyên là chất lạ kích thích cơ thể sinh ra các kháng thể tương ứng để kết hợp đặc hiệu với kháng nguyên đó.",
            "points": 1
          }
        ]
      },
      "g3_questions": [
        {
          "question_no": 11,
          "question_type": "single_choice",
          "question": "Dựa vào biểu đồ trên, cho biết ngày nào sau đây có số ca mắc mới ở cộng đồng cao nhất thành phố Hà Nội đợt 4?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "14/01/2022."
            },
            {
              "key": "B",
              "text": "23/01/2022."
            },
            {
              "key": "C",
              "text": "20/01/2022."
            },
            {
              "key": "D",
              "text": "08/01/2022."
            }
          ],
          "options_are_images": false,
          "correct_answer": "B",
          "explanation": "Dựa vào biểu đồ, số ca mắc ngoài cộng đồng (cột màu vàng) vào ngày 23/01/2022 đạt mức cao nhất (830 ca) so với các ngày được chọn.",
          "points": 1
        },
        {
          "question_no": 12,
          "question_type": "single_choice",
          "question": "Nguyên nhân nào sau đây có thể làm tăng nguy cơ lây lan dịch bệnh Covid – 19 một cách nhanh chóng?\n(1) Chỉ cần đeo khẩu trang khi tiếp xúc với người đã nhiễm virus SARS-CoV-2.\n(2) Luôn rửa tay sau khi chạm vào các vật nơi công cộng.\n(3) Tổ chức các cuộc gặp mặt đầu xuân.\n(4) Sử dụng chung các đồ dùng nơi công cộng.\n(5) Làm việc trong không gian hẹp, thiếu sự lưu thông khí.",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "(1), (2), (3), (4)."
            },
            {
              "key": "B",
              "text": "(1), (3), (4), (5)."
            },
            {
              "key": "C",
              "text": "(2), (3), (4), (5)."
            },
            {
              "key": "D",
              "text": "(1), (3), (5)."
            }
          ],
          "options_are_images": false,
          "correct_answer": "B",
          "explanation": "Các nguyên nhân làm dịch lây lan nhanh bao gồm: không đeo khẩu trang phòng ngừa rộng rãi (1), tụ tập đông người (3), dùng chung đồ vật (4) và làm việc trong không gian kín (5). (2) là biện pháp phòng ngừa.",
          "points": 1
        },
        {
          "question_no": 13,
          "question_type": "single_choice",
          "question": "Số lượng ca mắc trong cộng đồng tăng cao gây khó khăn cho công tác phòng chống dịch hơn các ca mắc mới trong khu vực đã cách ly vì",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "khó khăn trong việc truy vết, dễ dàng lây lan chéo tạo thành các ổ dịch."
            },
            {
              "key": "B",
              "text": "tạo ra các chủng đột biến mới gây nguy hiểm hơn các chủng đột biến cũ."
            },
            {
              "key": "C",
              "text": "làm giảm hiệu quả phòng bệnh của vắc xin."
            },
            {
              "key": "D",
              "text": "cơ thể không đáp ứng miễn dịch."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A",
          "explanation": "Ca mắc cộng đồng là nguồn lây chưa được khoanh vùng cách ly, khó xác định nguồn lây và lịch trình tiếp xúc, khiến việc truy vết gặp nhiều khó khăn và tăng nguy cơ lây lan âm thầm.",
          "points": 1
        },
        {
          "question_no": 14,
          "question_type": "single_choice",
          "question": "Phát biểu sau đây đúng hay sai?\nThuốc kháng sinh có khả năng điều trị các bệnh về virus.",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Đúng."
            },
            {
              "key": "B",
              "text": "Sai."
            }
          ],
          "options_are_images": false,
          "correct_answer": "B",
          "explanation": "Thuốc kháng sinh chỉ tiêu diệt hoặc ức chế vi khuẩn, hoàn toàn không có tác dụng đối với virus.",
          "points": 1
        },
        {
          "question_no": 15,
          "question_type": "fill_blank",
          "question": "Điền từ/cụm từ thích hợp vào chỗ trống sau đây:\nKháng nguyên là những chất khi xâm nhập vào cơ thể người được hệ thống miễn dịch nhận biết và sinh ra các [o1] tương ứng.",
          "image_url": "",
          "correct_answer": "kháng thể",
          "accepted_answers": [
            "kháng thể"
          ],
          "explanation": "Kháng nguyên là chất lạ kích thích cơ thể sinh ra các kháng thể tương ứng để kết hợp đặc hiệu với kháng nguyên đó.",
          "points": 1
        }
      ],
      "g4": {
        "group_id": "g4",
        "title": "Ngữ liệu Khoa học số 04",
        "stimulus": {
          "type": "text",
          "content": "Dung dịch là hỗn hợp đồng nhất gặp trong đời sống hàng ngày, ví dụ nước muối, nước đường, giấm ăn là các dung dịch. Trong hóa học, dung dịch được định nghĩa là sự đồng nhất của dung môi và chất tan. Dung môi là chất có thể hòa tan các chất khác để tạo thành dung dịch, dung môi thường gặp là nước, một số dung môi hữu cơ ít phổ biến hơn như ancol etylic, cloroform, n-hexan, .... Chất tan là chất bị hòa tan trong dung môi. Ở một nhiệt độ xác định, dựa vào khả năng có thể hòa tan thêm chất tan hay không, dung dịch phân thành các loại:\n- Dung dịch chưa bão hòa: là dung dịch có thể hòa tan thêm chất tan.\n- Dung dịch bão hòa: là dung dịch không thể hòa tan thêm chất tan.\n- Dung dịch quá bão hòa: là dung dịch chứa lượng chất tan nhiều hơn dung dịch bão hòa.\nDung dịch quá bão hòa thường được tạo ra bằng cách chuẩn nóng dung dịch bão hòa, sau đó thêm chất tan vào hòa tan rồi làm nguội đến nhiệt độ xác định. Loại dung dịch này thường kém bền, chỉ cần có một tinh thể nhỏ chất tan trong dung dịch thì lượng chất tan vượt quá lượng chất tan để tạo dung dịch bão hòa ở nhiệt độ đó sẽ tách ra ở dạng rắn. Quá trình chất tan hóa rắn tách ra từ dung dịch quá bão hòa ở nhiệt độ xác định gọi là quá trình kết tinh. Quá trình kết tinh có ý nghĩa quan trọng trong việc tinh chế (làm sạch), tách các chất, đặc biệt là chất hữu cơ rắn trong lĩnh vực sản xuất thuốc, vật liệu.\nĐể đánh giá khả năng hòa tan của các chất tan trong nước ở một nhiệt độ xác định người ta sử dụng đại lượng đo là độ tan. Độ tan (kí hiệu là S) của một chất là số gam chất đó hòa tan trong 100g nước để tạo thành dung dịch bão hòa ở một nhiệt độ xác định. Độ tan càng nhỏ nghĩa là các chất càng kém tan và ngược lại. Công thức tính độ tan trong nước của một chất ở nhiệt độ xác định như sau: \\( S = \\frac{m_{ct}}{m_{H_2O}} \\cdot 100 \\) (gam/100 gam \\(H_2O\\)). Trong đó, \\(m_{ct}\\) là khối lượng của chất tan được hòa tan trong nước để tạo thành dung dịch bão hòa, có đơn vị là gam, \\(m_{H_2O}\\) là khối lượng của nước, có đơn vị là gam.\nĐộ tan cung cấp thông tin quan trọng về khả năng tan của các chất trong nước và hỗ trợ trong việc nghiên cứu, phát triển và ứng dụng các chất trong sản xuất hay cuộc sống hàng ngày. Ví dụ, độ tan của thuốc quyết định khả năng hấp thu của thuốc vào cơ thể, độ tan của hóa chất quyết định khả năng phân tán của hóa chất trong dung môi. Độ tan của các chất trong nước là một trong những yếu tố quan trọng trong quá trình sản xuất và xử lý nước. Các chất khác nhau có độ tan trong nước khác nhau và đối với một chất, ở những nhiệt độ khác nhau độ tan cũng khác nhau.\nTừ thực nghiệm, các nhà khoa học đã xác định độ tan của các chất ở các nhiệt độ khác nhau, đây là thông tin quan trọng sử dụng trong nghiên cứu và ứng dụng các chất. Hình vẽ dưới đây cho biết sự phụ thuộc của độ tan vào nhiệt độ đối với một số chất.\n\n<img src=\"https://assets.tmastudy.io.vn/assets/9.png\" style=\"max-width: 100%; display: block; margin: 15px auto; border-radius: 8px; width: 80%;\" />\n\nHình 3. Độ tan của một số chất\n\n(Nguồn: https://chem.libretexts.org)\nDựa vào đường cong biểu diễn sự phụ thuộc của độ tan từng chất vào nhiệt độ, có thể đánh giá khả năng hòa tan của các chất khác nhau ở cùng nhiệt độ, cũng như biết cách pha chế các dung dịch ở nhiệt độ xác định hay tách, làm sạch các chất rắn trong hỗn hợp.",
          "image_url": "https://assets.tmastudy.io.vn/assets/9.png",
          "image_width": 100
        },
        "questions": [
          {
            "question_no": 16,
            "question_type": "multiple_choice",
            "question": "Dựa vào Hình 3, trong các chất sau đây, những chất có độ tan giảm khi nhiệt độ tăng là:",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "NH₃."
              },
              {
                "key": "B",
                "text": "KClO₃."
              },
              {
                "key": "C",
                "text": "NH₄Cl."
              },
              {
                "key": "D",
                "text": "HCl."
              }
            ],
            "options_are_images": false,
            "correct_answer": [
              "A",
              "D"
            ],
            "explanation": "Dựa vào đồ thị Hình 3, các đường biểu diễn của NH₃ và HCl đi xuống từ trái sang phải, cho thấy độ tan của chúng trong nước giảm khi nhiệt độ tăng.",
            "points": 1
          },
          {
            "question_no": 17,
            "question_type": "true_false",
            "question": "Xét tính đúng sai cho các phát biểu sau:",
            "image_url": "",
            "statements": [
              {
                "id": "a",
                "text": "Độ tan là khối lượng chất tan tối đa có thể hòa tan trong 100 gam nước ở một nhiệt độ xác định."
              },
              {
                "id": "b",
                "text": "Ở một nhiệt độ xác định, dung dịch quá bão hòa rất bền và ổn định."
              },
              {
                "id": "c",
                "text": "Nước là dung môi phổ biến để hòa tan các chất tan."
              }
            ],
            "correct_answer": {
              "a": true,
              "b": false,
              "c": true
            },
            "explanation": "1) Đúng theo định nghĩa độ tan. 2) Sai, dung dịch quá bão hòa kém bền và dễ bị kết tinh khi có tác động nhỏ. 3) Đúng, nước là dung môi phổ biến nhất trong tự nhiên và đời sống.",
            "points": 1
          },
          {
            "question_no": 18,
            "question_type": "drag_drop",
            "question": "Kéo ô thích hợp thả vào vị trí tương ứng để hoàn thành các câu sau:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Tiến hành thí nghiệm hòa tan 225 gam NaNO₃ rắn, tinh khiết bằng 250 gam nước ở nhiệt độ 30°C sẽ thu được dung dịch NaNO₃ "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": ". Điều này được giải thích là do dựa vào đường cong biểu diễn sự phụ thuộc độ tan của NaNO₃ vào nhiệt độ, 250 gam nước có thể hòa tan tối đa khoảng "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": " gam NaNO₃."
              }
            ],
            "items": [
              {
                "id": "item1",
                "text": "225"
              },
              {
                "id": "item2",
                "text": "238"
              },
              {
                "id": "item3",
                "text": "chưa bão hòa"
              },
              {
                "id": "item4",
                "text": "95"
              },
              {
                "id": "item5",
                "text": "bão hòa"
              },
              {
                "id": "item6",
                "text": "quá bão hòa"
              }
            ],
            "correct_answer": {
              "o1": "item3",
              "o2": "item2"
            },
            "explanation": "Tại 30°C, độ tan của NaNO₃ là 95g/100g nước. Với 250g nước, khối lượng hòa tan tối đa là 95 * 2.5 = 237,5 gam (xấp xỉ 238 gam). Vì 225g < 238g nên thu được dung dịch chưa bão hòa.",
            "points": 1
          },
          {
            "question_no": 19,
            "question_type": "fill_blank",
            "question": "Điền số thích hợp hợp (làm tròn đến chữ số thập phân thứ nhất) vào chỗ trống để hoàn thành nhận xét sau:\nMột mẫu CuSO₄ thực tế nặng 46 gam, trong đó có 80% là CuSO₄ và còn lại là các chất rắn không tan trong nước. Để tách CuSO₄ ra khỏi hỗn hợp, ta tiến hành hòa tan hoàn toàn mẫu chất rắn trên trong 50 ml nước tinh khiết ở nhiệt độ 100°C. Lọc hỗn hợp thu lấy phần dung dịch, sau đó để cho dung dịch nguội dần đến nhiệt độ 20°C thì thấy xuất hiện các tinh thể CuSO₄ ngậm nước CuSO₄.5H₂O. Lọc lấy chất rắn rồi đem sấy ở nhiệt độ 100°C đến khi khối lượng không đổi thì thu được CuSO₄ khan.\nKhối lượng của CuSO₄ khan thu được là [o1] gam.\nCho biết, ở 20°C độ tan của CuSO₄ có giá trị là 32 gam/100 gam H₂O, khối lượng riêng của nước tinh khiết là 1 g/ml. Coi thể tích của nước là không thay đổi và khi sấy ở nhiệt độ 100°C đến khối lượng không đổi, ta chỉ thu được tinh thể CuSO₄ khan.",
            "image_url": "",
            "correct_answer": "20,8",
            "accepted_answers": [
              "20,8",
              "20.8"
            ],
            "explanation": "m(CuSO₄ ban đầu) = 46 * 0.8 = 36.8g. m(H₂O) = 50g. Khối lượng CuSO₄ tan tối đa ở 20°C trong 50g nước: 32 * 50 / 100 = 16g. Khối lượng CuSO₄ kết tinh: 36.8 - 16 = 20.8g. Khi sấy khô thu được 20.8g CuSO₄ khan.",
            "points": 1
          },
          {
            "question_no": 20,
            "question_type": "single_choice",
            "question": "Phèn chua là hóa chất phổ biến được sử dụng làm trong nước và có công thức hóa học dạng KAl(SO₄)₂.12H₂O. Thực tế phèn chua có chứa nhiều chất cặn bẩn và tinh chế phèn chua. Quá trình tinh chế thường được thực hiện bằng cách tạo dung dịch bão hòa ở nhiệt độ 50°C, sau đó đưa về nhiệt độ 20°C để tạo dung dịch phèn chua quá bão hòa, khi đó các tinh thể phèn chua sẽ được tách ra.\nỞ nhiệt độ 50°C, để tạo dung dịch bão hòa phèn chua, tiến hành hòa tan hoàn toàn 42,53 gam mẫu phèn chua (độ tinh khiết 80%) trong V ml nước tinh khiết. V có giá trị gần đúng nào sau đây?\nCho biết, ở 50°C độ tan của KAl(SO₄)₂ trong nước có giá trị là 36,8 gam/100 gam H₂O. Nước tinh khiết có khối lượng riêng là 1 g/ml và chỉ có đường dùng để hòa tan phèn chua. Phân tử khối của KAl(SO₄)₂ và H₂O lần lượt là 258 g/mol và 18 g/mol.",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "34,83 ml."
              },
              {
                "key": "B",
                "text": "43,52 ml."
              },
              {
                "key": "C",
                "text": "50,33 ml."
              },
              {
                "key": "D",
                "text": "62,90 ml."
              }
            ],
            "options_are_images": false,
            "correct_answer": "A",
            "explanation": "m(phèn tinh khiết) = 42,53 * 80% = 34,024 gam.\nm(KAl(SO₄)₂) = 34,024 * 258 / 474 = 18,52 gam.\nm(nước kết tinh) = 34,024 * 216 / 474 = 15,50 gam.\nTại 50°C: m(KAl(SO₄)₂) / (V + m_nước_kết_tinh) = 36.8 / 100 => V + 15,50 = 18,52 / 0,368 = 50,33 gam => V = 34,83 gam (34,83 ml).",
            "points": 1
          }
        ]
      },
      "g4_questions": [
        {
          "question_no": 16,
          "question_type": "multiple_choice",
          "question": "Dựa vào Hình 3, trong các chất sau đây, những chất có độ tan giảm khi nhiệt độ tăng là:",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "NH₃."
            },
            {
              "key": "B",
              "text": "KClO₃."
            },
            {
              "key": "C",
              "text": "NH₄Cl."
            },
            {
              "key": "D",
              "text": "HCl."
            }
          ],
          "options_are_images": false,
          "correct_answer": [
            "A",
            "D"
          ],
          "explanation": "Dựa vào đồ thị Hình 3, các đường biểu diễn của NH₃ và HCl đi xuống từ trái sang phải, cho thấy độ tan của chúng trong nước giảm khi nhiệt độ tăng.",
          "points": 1
        },
        {
          "question_no": 17,
          "question_type": "true_false",
          "question": "Xét tính đúng sai cho các phát biểu sau:",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "Độ tan là khối lượng chất tan tối đa có thể hòa tan trong 100 gam nước ở một nhiệt độ xác định."
            },
            {
              "id": "b",
              "text": "Ở một nhiệt độ xác định, dung dịch quá bão hòa rất bền và ổn định."
            },
            {
              "id": "c",
              "text": "Nước là dung môi phổ biến để hòa tan các chất tan."
            }
          ],
          "correct_answer": {
            "a": true,
            "b": false,
            "c": true
          },
          "explanation": "1) Đúng theo định nghĩa độ tan. 2) Sai, dung dịch quá bão hòa kém bền và dễ bị kết tinh khi có tác động nhỏ. 3) Đúng, nước là dung môi phổ biến nhất trong tự nhiên và đời sống.",
          "points": 1
        },
        {
          "question_no": 18,
          "question_type": "drag_drop",
          "question": "Kéo ô thích hợp thả vào vị trí tương ứng để hoàn thành các câu sau:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Tiến hành thí nghiệm hòa tan 225 gam NaNO₃ rắn, tinh khiết bằng 250 gam nước ở nhiệt độ 30°C sẽ thu được dung dịch NaNO₃ "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": ". Điều này được giải thích là do dựa vào đường cong biểu diễn sự phụ thuộc độ tan của NaNO₃ vào nhiệt độ, 250 gam nước có thể hòa tan tối đa khoảng "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " gam NaNO₃."
            }
          ],
          "items": [
            {
              "id": "item1",
              "text": "225"
            },
            {
              "id": "item2",
              "text": "238"
            },
            {
              "id": "item3",
              "text": "chưa bão hòa"
            },
            {
              "id": "item4",
              "text": "95"
            },
            {
              "id": "item5",
              "text": "bão hòa"
            },
            {
              "id": "item6",
              "text": "quá bão hòa"
            }
          ],
          "correct_answer": {
            "o1": "item3",
            "o2": "item2"
          },
          "explanation": "Tại 30°C, độ tan của NaNO₃ là 95g/100g nước. Với 250g nước, khối lượng hòa tan tối đa là 95 * 2.5 = 237,5 gam (xấp xỉ 238 gam). Vì 225g < 238g nên thu được dung dịch chưa bão hòa.",
          "points": 1
        },
        {
          "question_no": 19,
          "question_type": "fill_blank",
          "question": "Điền số thích hợp hợp (làm tròn đến chữ số thập phân thứ nhất) vào chỗ trống để hoàn thành nhận xét sau:\nMột mẫu CuSO₄ thực tế nặng 46 gam, trong đó có 80% là CuSO₄ và còn lại là các chất rắn không tan trong nước. Để tách CuSO₄ ra khỏi hỗn hợp, ta tiến hành hòa tan hoàn toàn mẫu chất rắn trên trong 50 ml nước tinh khiết ở nhiệt độ 100°C. Lọc hỗn hợp thu lấy phần dung dịch, sau đó để cho dung dịch nguội dần đến nhiệt độ 20°C thì thấy xuất hiện các tinh thể CuSO₄ ngậm nước CuSO₄.5H₂O. Lọc lấy chất rắn rồi đem sấy ở nhiệt độ 100°C đến khi khối lượng không đổi thì thu được CuSO₄ khan.\nKhối lượng của CuSO₄ khan thu được là [o1] gam.\nCho biết, ở 20°C độ tan của CuSO₄ có giá trị là 32 gam/100 gam H₂O, khối lượng riêng của nước tinh khiết là 1 g/ml. Coi thể tích của nước là không thay đổi và khi sấy ở nhiệt độ 100°C đến khối lượng không đổi, ta chỉ thu được tinh thể CuSO₄ khan.",
          "image_url": "",
          "correct_answer": "20,8",
          "accepted_answers": [
            "20,8",
            "20.8"
          ],
          "explanation": "m(CuSO₄ ban đầu) = 46 * 0.8 = 36.8g. m(H₂O) = 50g. Khối lượng CuSO₄ tan tối đa ở 20°C trong 50g nước: 32 * 50 / 100 = 16g. Khối lượng CuSO₄ kết tinh: 36.8 - 16 = 20.8g. Khi sấy khô thu được 20.8g CuSO₄ khan.",
          "points": 1
        },
        {
          "question_no": 20,
          "question_type": "single_choice",
          "question": "Phèn chua là hóa chất phổ biến được sử dụng làm trong nước và có công thức hóa học dạng KAl(SO₄)₂.12H₂O. Thực tế phèn chua có chứa nhiều chất cặn bẩn và tinh chế phèn chua. Quá trình tinh chế thường được thực hiện bằng cách tạo dung dịch bão hòa ở nhiệt độ 50°C, sau đó đưa về nhiệt độ 20°C để tạo dung dịch phèn chua quá bão hòa, khi đó các tinh thể phèn chua sẽ được tách ra.\nỞ nhiệt độ 50°C, để tạo dung dịch bão hòa phèn chua, tiến hành hòa tan hoàn toàn 42,53 gam mẫu phèn chua (độ tinh khiết 80%) trong V ml nước tinh khiết. V có giá trị gần đúng nào sau đây?\nCho biết, ở 50°C độ tan của KAl(SO₄)₂ trong nước có giá trị là 36,8 gam/100 gam H₂O. Nước tinh khiết có khối lượng riêng là 1 g/ml và chỉ có đường dùng để hòa tan phèn chua. Phân tử khối của KAl(SO₄)₂ và H₂O lần lượt là 258 g/mol và 18 g/mol.",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "34,83 ml."
            },
            {
              "key": "B",
              "text": "43,52 ml."
            },
            {
              "key": "C",
              "text": "50,33 ml."
            },
            {
              "key": "D",
              "text": "62,90 ml."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A",
          "explanation": "m(phèn tinh khiết) = 42,53 * 80% = 34,024 gam.\nm(KAl(SO₄)₂) = 34,024 * 258 / 474 = 18,52 gam.\nm(nước kết tinh) = 34,024 * 216 / 474 = 15,50 gam.\nTại 50°C: m(KAl(SO₄)₂) / (V + m_nước_kết_tinh) = 36.8 / 100 => V + 15,50 = 18,52 / 0,368 = 50,33 gam => V = 34,83 gam (34,83 ml).",
          "points": 1
        }
      ],
      "g5": {
        "group_id": "g5",
        "title": "Ngữ liệu Khoa học số 05",
        "stimulus": {
          "type": "text",
          "content": "Các virus thiếu enzyme chuyển hóa và bộ máy sản xuất protein. Chúng là các dạng sống ký sinh nội bào bắt buộc. Mỗi loại virus chỉ có thể lây nhiễm một số lượng nhất định các loại tế bào chủ, được gọi là phổ vật chủ của virus. Tính đặc trưng của phổ vật chủ là kết quả của quá trình tiến hóa hệ thống nhận diện của mỗi loại virus. Virus nhận ra tế bào chủ của nó theo nguyên tắc “chìa và khóa” giữa các protein bề mặt của virus với các phân tử thụ thể đặc hiệu trên bề mặt ngoài của tế bào chủ.\nQuá trình lây nhiễm của virus bắt đầu khi một virus đính kết với tế bào chủ và hệ gene của chúng được truyền vào trong tế bào chủ. Cơ chế truyền hệ gene của virus vào tế bào chủ phụ thuộc vào loại virus và loại tế bào chủ. Khi hệ gene của virus đã ở trong tế bào chủ, các protein mà nó mã hóa có thể trưng dụng tế bào chủ, tái lập trình hoạt động tế bào để tái bản hệ gene virus, đồng thời sản xuất ra các protein của virus. Tế bào chủ cung cấp các nucleotide cho việc tổng hợp các nucleic acid của virus, cũng như các enzyme, các ribosome, các tRNA, các amino acid, ATP và cả thành phần khác cần thiết để tổng hợp các protein của virus. Phần lớn các virus DNA dùng các enzyme DNA polymerase của tế bào chủ để tổng hợp hệ gene mới của chúng trên cơ sở khuôn mẫu là DNA của virus. Ngược lại, để tái bản vật chất di truyền, các virus RNA thường mã hóa các enzyme polymerase sử dụng RNA làm mạch khuôn.\nSau khi các phân tử nucleic acid và các capsomer đã được tạo ra, chúng sẽ đóng gói với nhau một cách tự phát để hình thành nên các virus thế hệ con. Một kiểu chu kỳ sinh sản của virus đơn giản nhất sẽ kết thúc bằng việc hàng trăm hoặc thậm chí hàng nghìn virus thoát khỏi tế bào chủ lây nhiễm, kéo theo sự phá hủy của tế bào chủ.",
          "image_url": "",
          "image_width": 100
        },
        "questions": [
          {
            "question_no": 21,
            "question_type": "single_choice",
            "question": "Virus nhận ra tế bào chủ của nó theo nguyên tắc “chìa và khóa” nghĩa là",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "protein bề mặt của virus có thể kết hợp được với nhiều thụ thể khác nhau của nhiều loại tế bào khác nhau."
              },
              {
                "key": "B",
                "text": "protein bề mặt của virus liên kết đặc hiệu với từng loại thụ thể trên bề mặt tế bào chủ."
              },
              {
                "key": "C",
                "text": "protein bề mặt của virus mã hóa mọi loại thụ thể tế bào."
              },
              {
                "key": "D",
                "text": "protein bề mặt của virus liên kết không đặc hiệu với thụ thể trên bề mặt tế bào chủ."
              }
            ],
            "options_are_images": false,
            "correct_answer": "B",
            "explanation": "Nguyên tắc 'chìa và khóa' chỉ tính liên kết đặc hiệu giữa glycoprotein kháng nguyên bề mặt virus và thụ thể tương ứng trên màng tế bào chủ.",
            "points": 1
          },
          {
            "question_no": 22,
            "question_type": "drag_drop",
            "question": "Sắp xếp các giai đoạn sau đây cho đúng chu trình nhân lên của virus trong tế bào chủ:",
            "image_url": "",
            "body": [
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " → "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": " → "
              },
              {
                "type": "blank",
                "id": "o3"
              },
              {
                "type": "text",
                "content": " → "
              },
              {
                "type": "blank",
                "id": "o4"
              },
              {
                "type": "text",
                "content": " → "
              },
              {
                "type": "blank",
                "id": "o5"
              }
            ],
            "items": [
              {
                "id": "item1",
                "text": "Sinh tổng hợp"
              },
              {
                "id": "item2",
                "text": "Xâm nhập"
              },
              {
                "id": "item3",
                "text": "Hấp phụ"
              },
              {
                "id": "item4",
                "text": "Lắp ráp"
              },
              {
                "id": "item5",
                "text": "Giải phóng"
              }
            ],
            "correct_answer": {
              "o1": "item3",
              "o2": "item2",
              "o3": "item1",
              "o4": "item4",
              "o5": "item5"
            },
            "explanation": "Thứ tự 5 giai đoạn: Hấp phụ (item3) -> Xâm nhập (item2) -> Sinh tổng hợp (item1) -> Lắp ráp (item4) -> Giải phóng (item5).",
            "points": 1
          },
          {
            "question_no": 23,
            "question_type": "single_choice",
            "question": "Điều nào sau đây không đúng khi nói về virus?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Chỉ trong tế bào chủ, virus mới hoạt động như một thể sống."
              },
              {
                "key": "B",
                "text": "Hệ gene của virus chỉ chứa một trong hai loại nucleic acid: DNA, RNA."
              },
              {
                "key": "C",
                "text": "Kích thước virus vô cùng nhỏ, chỉ có thể thấy được dưới kính hiển vi điện tử."
              },
              {
                "key": "D",
                "text": "Ở bên ngoài môi trường, virus chỉ sinh trưởng chứ không nhân lên mặc dù có cả phức hợp gồm nucleic acid và protein."
              }
            ],
            "options_are_images": false,
            "correct_answer": "D",
            "explanation": "Virus ngoài môi trường (hạt virus/virion) hoàn toàn không trao đổi chất, không sinh trưởng (không lớn lên) và không nhân lên. Nó hoàn toàn trơ.",
            "points": 1
          },
          {
            "question_no": 24,
            "question_type": "single_choice",
            "question": "Các virus cần tự mã hóa một số enzyme nhất định vì",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "tế bào chủ thiếu các enzyme có thể sao chép hệ gene virus."
              },
              {
                "key": "B",
                "text": "những enzyme này không tổng hợp được trong tế bào chủ."
              },
              {
                "key": "C",
                "text": "tế bào chủ nhanh chóng phá hủy các virus."
              },
              {
                "key": "D",
                "text": "những enzyme này dịch mã mRNA virus thành các protein."
              }
            ],
            "options_are_images": false,
            "correct_answer": "A",
            "explanation": "Ví dụ, virus RNA cần tự mã hóa enzyme RNA polymerase phụ thuộc RNA để nhân bản vật chất di truyền của nó, vì tế bào chủ không có enzyme này.",
            "points": 1
          },
          {
            "question_no": 25,
            "question_type": "true_false",
            "question": "Các phát biểu sau đây đúng hay sai?",
            "image_url": "",
            "statements": [
              {
                "id": "a",
                "text": "Virus bám được vào tế bào chủ là nhờ các thụ thể thích hợp có sẵn trên bề mặt tế bào chủ."
              },
              {
                "id": "b",
                "text": "Kết quả của quá trình nhân lên là từ một virus ban đầu tạo ra vô số virus mới có độc tính tăng gấp nhiều lần."
              },
              {
                "id": "c",
                "text": "Virus sử dụng nguyên liệu của tế bào chủ trong quá trình nhân lên của mình."
              }
            ],
            "correct_answer": {
              "a": true,
              "b": false,
              "c": true
            },
            "explanation": "1) Đúng. 2) Sai (virus con tạo ra có độc tính tương tự virus mẹ). 3) Đúng (sử dụng nucleotide, axit amin, ribosome, tRNA, ATP... của tế bào chủ).",
            "points": 1
          }
        ]
      },
      "g5_questions": [
        {
          "question_no": 21,
          "question_type": "single_choice",
          "question": "Virus nhận ra tế bào chủ của nó theo nguyên tắc “chìa và khóa” nghĩa là",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "protein bề mặt của virus có thể kết hợp được với nhiều thụ thể khác nhau của nhiều loại tế bào khác nhau."
            },
            {
              "key": "B",
              "text": "protein bề mặt của virus liên kết đặc hiệu với từng loại thụ thể trên bề mặt tế bào chủ."
            },
            {
              "key": "C",
              "text": "protein bề mặt của virus mã hóa mọi loại thụ thể tế bào."
            },
            {
              "key": "D",
              "text": "protein bề mặt của virus liên kết không đặc hiệu với thụ thể trên bề mặt tế bào chủ."
            }
          ],
          "options_are_images": false,
          "correct_answer": "B",
          "explanation": "Nguyên tắc 'chìa và khóa' chỉ tính liên kết đặc hiệu giữa glycoprotein kháng nguyên bề mặt virus và thụ thể tương ứng trên màng tế bào chủ.",
          "points": 1
        },
        {
          "question_no": 22,
          "question_type": "drag_drop",
          "question": "Sắp xếp các giai đoạn sau đây cho đúng chu trình nhân lên của virus trong tế bào chủ:",
          "image_url": "",
          "body": [
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " → "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": " → "
            },
            {
              "type": "blank",
              "id": "o3"
            },
            {
              "type": "text",
              "content": " → "
            },
            {
              "type": "blank",
              "id": "o4"
            },
            {
              "type": "text",
              "content": " → "
            },
            {
              "type": "blank",
              "id": "o5"
            }
          ],
          "items": [
            {
              "id": "item1",
              "text": "Sinh tổng hợp"
            },
            {
              "id": "item2",
              "text": "Xâm nhập"
            },
            {
              "id": "item3",
              "text": "Hấp phụ"
            },
            {
              "id": "item4",
              "text": "Lắp ráp"
            },
            {
              "id": "item5",
              "text": "Giải phóng"
            }
          ],
          "correct_answer": {
            "o1": "item3",
            "o2": "item2",
            "o3": "item1",
            "o4": "item4",
            "o5": "item5"
          },
          "explanation": "Thứ tự 5 giai đoạn: Hấp phụ (item3) -> Xâm nhập (item2) -> Sinh tổng hợp (item1) -> Lắp ráp (item4) -> Giải phóng (item5).",
          "points": 1
        },
        {
          "question_no": 23,
          "question_type": "single_choice",
          "question": "Điều nào sau đây không đúng khi nói về virus?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Chỉ trong tế bào chủ, virus mới hoạt động như một thể sống."
            },
            {
              "key": "B",
              "text": "Hệ gene của virus chỉ chứa một trong hai loại nucleic acid: DNA, RNA."
            },
            {
              "key": "C",
              "text": "Kích thước virus vô cùng nhỏ, chỉ có thể thấy được dưới kính hiển vi điện tử."
            },
            {
              "key": "D",
              "text": "Ở bên ngoài môi trường, virus chỉ sinh trưởng chứ không nhân lên mặc dù có cả phức hợp gồm nucleic acid và protein."
            }
          ],
          "options_are_images": false,
          "correct_answer": "D",
          "explanation": "Virus ngoài môi trường (hạt virus/virion) hoàn toàn không trao đổi chất, không sinh trưởng (không lớn lên) và không nhân lên. Nó hoàn toàn trơ.",
          "points": 1
        },
        {
          "question_no": 24,
          "question_type": "single_choice",
          "question": "Các virus cần tự mã hóa một số enzyme nhất định vì",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "tế bào chủ thiếu các enzyme có thể sao chép hệ gene virus."
            },
            {
              "key": "B",
              "text": "những enzyme này không tổng hợp được trong tế bào chủ."
            },
            {
              "key": "C",
              "text": "tế bào chủ nhanh chóng phá hủy các virus."
            },
            {
              "key": "D",
              "text": "những enzyme này dịch mã mRNA virus thành các protein."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A",
          "explanation": "Ví dụ, virus RNA cần tự mã hóa enzyme RNA polymerase phụ thuộc RNA để nhân bản vật chất di truyền của nó, vì tế bào chủ không có enzyme này.",
          "points": 1
        },
        {
          "question_no": 25,
          "question_type": "true_false",
          "question": "Các phát biểu sau đây đúng hay sai?",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "Virus bám được vào tế bào chủ là nhờ các thụ thể thích hợp có sẵn trên bề mặt tế bào chủ."
            },
            {
              "id": "b",
              "text": "Kết quả của quá trình nhân lên là từ một virus ban đầu tạo ra vô số virus mới có độc tính tăng gấp nhiều lần."
            },
            {
              "id": "c",
              "text": "Virus sử dụng nguyên liệu của tế bào chủ trong quá trình nhân lên của mình."
            }
          ],
          "correct_answer": {
            "a": true,
            "b": false,
            "c": true
          },
          "explanation": "1) Đúng. 2) Sai (virus con tạo ra có độc tính tương tự virus mẹ). 3) Đúng (sử dụng nucleotide, axit amin, ribosome, tRNA, ATP... của tế bào chủ).",
          "points": 1
        }
      ],
      "g6": {
        "group_id": "g6",
        "title": "Ngữ liệu Khoa học số 06",
        "stimulus": {
          "type": "text",
          "content": "Điện trở nhiệt (thermistor) là linh kiện có điện trở thay đổi một cách rõ rệt theo nhiệt độ. Điện trở nhiệt được ứng dụng rộng rãi trong kĩ thuật điện tử, làm cảm biến nhiệt (Hình 1).\nĐể khảo sát sự phụ thuộc của giá trị điện trở của điện trở nhiệt NTC (Negative Temperature Coefficient) vào nhiệt độ, người ta làm thí nghiệm như sau:\nBố trí thí nghiệm như Hình 2.\nĐặt điện trở nhiệt vào giữa bình, đặt nhiệt kế vào trong bình, cạnh điện trở nhiệt.\nĐổ nước mát vào bình cách nhiệt sao cho lượng nước ngập cảm biến của nhiệt kế. Sau khoảng 2 phút, đo nhiệt độ của nước và điện trở của điện trở nhiệt.\nTăng nhiệt độ của nước trong bình bằng cách thêm từ từ nước nóng vào bình. Chờ nhiệt độ của nước trong bình ổn định. Đo nhiệt độ của nước và điện trở của điện trở nhiệt.\nLặp lại thao tác để đo nhiệt độ và điện trở của điện trở nhiệt ở các nhiệt độ khác.\nKết quả thí nghiệm thu được cho như trong Bảng 1.\nNgoài điện trở nhiệt NTC, trong thực tế còn có loại điện trở nhiệt PTC (Positive Temperature Coefficient). Điện trở của điện trở nhiệt PTC tăng khi nhiệt độ tăng.\n(Soạn dịch theo nội dung sách giáo khoa Vật lí 11 - Bộ Kết nối tri thức với cuộc sống, 2023)",
          "image_url": "",
          "image_width": 100
        },
        "questions": [
          {
            "question_no": 26,
            "question_type": "drag_drop",
            "question": "Kéo thả các từ/cụm từ thích hợp vào chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Loại điện trở nhiệt khi nhiệt độ tăng thì điện trở giảm gọi là "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": ", ký hiệu là "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": ".\nLoại điện trở nhiệt khi nhiệt độ tăng thì điện trở tăng gọi là "
              },
              {
                "type": "blank",
                "id": "o3"
              },
              {
                "type": "text",
                "content": ", ký hiệu là "
              },
              {
                "type": "blank",
                "id": "o4"
              },
              {
                "type": "text",
                "content": "."
              }
            ],
            "items": [
              {
                "id": "item1",
                "text": "NTC"
              },
              {
                "id": "item2",
                "text": "PTC"
              },
              {
                "id": "item3",
                "text": "nghịch điện trở nhiệt"
              },
              {
                "id": "item4",
                "text": "thuận điện trở nhiệt"
              }
            ],
            "correct_answer": {
              "o1": "item3",
              "o2": "item1",
              "o3": "item4",
              "o4": "item2"
            },
            "explanation": "Điện trở nhiệt NTC (Negative) có giá trị điện trở giảm khi nhiệt độ tăng, gọi là nghịch điện trở nhiệt. Điện trở nhiệt PTC (Positive) có giá trị điện trở tăng khi nhiệt độ tăng, gọi là thuận điện trở nhiệt.",
            "points": 1
          },
          {
            "question_no": 27,
            "question_type": "single_choice",
            "question": "Điện trở nhiệt được sử dụng chủ yếu trong lĩnh vực nào sau đây?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Nông nghiệp."
              },
              {
                "key": "B",
                "text": "Năng lượng tái tạo."
              },
              {
                "key": "C",
                "text": "Điện tử."
              },
              {
                "key": "D",
                "text": "Y tế."
              }
            ],
            "options_are_images": false,
            "correct_answer": "C",
            "explanation": "Theo văn bản: 'Điện trở nhiệt được ứng dụng rộng rãi trong kĩ thuật điện tử, làm cảm biến nhiệt'. Do đó lĩnh vực sử dụng chủ yếu là Điện tử.",
            "points": 1
          },
          {
            "question_no": 28,
            "question_type": "single_choice",
            "question": "Trong bảng kết quả thí nghiệm, khi nhiệt độ tăng từ 5°C đến 41°C thì giá trị điện trở của điện trở nhiệt NTC",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "tăng lên 36 Ω."
              },
              {
                "key": "B",
                "text": "giảm đi 36 Ω."
              },
              {
                "key": "C",
                "text": "tăng lên 99428,7 Ω."
              },
              {
                "key": "D",
                "text": "giảm đi 99428,7 Ω."
              }
            ],
            "options_are_images": false,
            "correct_answer": "D",
            "explanation": "Tại 5°C, R = 121951,2 Ω. Tại 41°C, R = 22522,5 Ω. Khi nhiệt độ tăng từ 5°C đến 41°C, điện trở giảm đi: 121951,2 - 22522,5 = 99428,7 Ω.",
            "points": 1
          },
          {
            "question_no": 29,
            "question_type": "single_choice",
            "question": "Trong khoảng nhiệt độ nào dưới đây, giá trị điện trở của điện trở nhiệt biến đổi chậm nhất?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "9°C - 15°C."
              },
              {
                "key": "B",
                "text": "26°C - 32°C."
              },
              {
                "key": "C",
                "text": "41°C - 49°C."
              },
              {
                "key": "D",
                "text": "74°C - 80°C."
              }
            ],
            "options_are_images": false,
            "correct_answer": "D",
            "explanation": "Sự biến đổi của điện trở theo nhiệt độ (độ dốc của đặc tuyến) giảm dần khi nhiệt độ tăng. Ở khoảng 74°C - 80°C, điện trở giảm ít nhất (chỉ giảm khoảng 201 Ω/°C), tức là biến đổi chậm nhất.",
            "points": 1
          },
          {
            "question_no": 30,
            "question_type": "drag_drop",
            "question": "Dựa vào đồ thị đặc trưng của NTC và PTC, xác định đường biểu diễn phù hợp:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Đồ thị biểu diễn sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với hai loại điện trở nhiệt NTC và PTC.\nĐường màu xanh thể hiện sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với điện trở nhiệt "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": ".\nĐường màu đỏ thể hiện sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với điện trở nhiệt "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": "."
              }
            ],
            "items": [
              {
                "id": "item1",
                "text": "PTC"
              },
              {
                "id": "item2",
                "text": "NTC"
              }
            ],
            "correct_answer": {
              "o1": "item2",
              "o2": "item1"
            },
            "explanation": "Đường màu xanh đi xuống tương ứng với điện trở giảm khi nhiệt độ tăng, đó là đặc trưng của NTC. Đường màu đỏ đi lên tương ứng với điện trở tăng khi nhiệt độ tăng, đó là đặc trưng của PTC.",
            "points": 1
          }
        ]
      },
      "g6_questions": [
        {
          "question_no": 26,
          "question_type": "drag_drop",
          "question": "Kéo thả các từ/cụm từ thích hợp vào chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Loại điện trở nhiệt khi nhiệt độ tăng thì điện trở giảm gọi là "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": ", ký hiệu là "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": ".\nLoại điện trở nhiệt khi nhiệt độ tăng thì điện trở tăng gọi là "
            },
            {
              "type": "blank",
              "id": "o3"
            },
            {
              "type": "text",
              "content": ", ký hiệu là "
            },
            {
              "type": "blank",
              "id": "o4"
            },
            {
              "type": "text",
              "content": "."
            }
          ],
          "items": [
            {
              "id": "item1",
              "text": "NTC"
            },
            {
              "id": "item2",
              "text": "PTC"
            },
            {
              "id": "item3",
              "text": "nghịch điện trở nhiệt"
            },
            {
              "id": "item4",
              "text": "thuận điện trở nhiệt"
            }
          ],
          "correct_answer": {
            "o1": "item3",
            "o2": "item1",
            "o3": "item4",
            "o4": "item2"
          },
          "explanation": "Điện trở nhiệt NTC (Negative) có giá trị điện trở giảm khi nhiệt độ tăng, gọi là nghịch điện trở nhiệt. Điện trở nhiệt PTC (Positive) có giá trị điện trở tăng khi nhiệt độ tăng, gọi là thuận điện trở nhiệt.",
          "points": 1
        },
        {
          "question_no": 27,
          "question_type": "single_choice",
          "question": "Điện trở nhiệt được sử dụng chủ yếu trong lĩnh vực nào sau đây?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Nông nghiệp."
            },
            {
              "key": "B",
              "text": "Năng lượng tái tạo."
            },
            {
              "key": "C",
              "text": "Điện tử."
            },
            {
              "key": "D",
              "text": "Y tế."
            }
          ],
          "options_are_images": false,
          "correct_answer": "C",
          "explanation": "Theo văn bản: 'Điện trở nhiệt được ứng dụng rộng rãi trong kĩ thuật điện tử, làm cảm biến nhiệt'. Do đó lĩnh vực sử dụng chủ yếu là Điện tử.",
          "points": 1
        },
        {
          "question_no": 28,
          "question_type": "single_choice",
          "question": "Trong bảng kết quả thí nghiệm, khi nhiệt độ tăng từ 5°C đến 41°C thì giá trị điện trở của điện trở nhiệt NTC",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "tăng lên 36 Ω."
            },
            {
              "key": "B",
              "text": "giảm đi 36 Ω."
            },
            {
              "key": "C",
              "text": "tăng lên 99428,7 Ω."
            },
            {
              "key": "D",
              "text": "giảm đi 99428,7 Ω."
            }
          ],
          "options_are_images": false,
          "correct_answer": "D",
          "explanation": "Tại 5°C, R = 121951,2 Ω. Tại 41°C, R = 22522,5 Ω. Khi nhiệt độ tăng từ 5°C đến 41°C, điện trở giảm đi: 121951,2 - 22522,5 = 99428,7 Ω.",
          "points": 1
        },
        {
          "question_no": 29,
          "question_type": "single_choice",
          "question": "Trong khoảng nhiệt độ nào dưới đây, giá trị điện trở của điện trở nhiệt biến đổi chậm nhất?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "9°C - 15°C."
            },
            {
              "key": "B",
              "text": "26°C - 32°C."
            },
            {
              "key": "C",
              "text": "41°C - 49°C."
            },
            {
              "key": "D",
              "text": "74°C - 80°C."
            }
          ],
          "options_are_images": false,
          "correct_answer": "D",
          "explanation": "Sự biến đổi của điện trở theo nhiệt độ (độ dốc của đặc tuyến) giảm dần khi nhiệt độ tăng. Ở khoảng 74°C - 80°C, điện trở giảm ít nhất (chỉ giảm khoảng 201 Ω/°C), tức là biến đổi chậm nhất.",
          "points": 1
        },
        {
          "question_no": 30,
          "question_type": "drag_drop",
          "question": "Dựa vào đồ thị đặc trưng của NTC và PTC, xác định đường biểu diễn phù hợp:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Đồ thị biểu diễn sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với hai loại điện trở nhiệt NTC và PTC.\nĐường màu xanh thể hiện sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với điện trở nhiệt "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": ".\nĐường màu đỏ thể hiện sự phụ thuộc của giá trị điện trở theo nhiệt độ đối với điện trở nhiệt "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": "."
            }
          ],
          "items": [
            {
              "id": "item1",
              "text": "PTC"
            },
            {
              "id": "item2",
              "text": "NTC"
            }
          ],
          "correct_answer": {
            "o1": "item2",
            "o2": "item1"
          },
          "explanation": "Đường màu xanh đi xuống tương ứng với điện trở giảm khi nhiệt độ tăng, đó là đặc trưng của NTC. Đường màu đỏ đi lên tương ứng với điện trở tăng khi nhiệt độ tăng, đó là đặc trưng của PTC.",
          "points": 1
        }
      ],
      "g7": {
        "group_id": "g7",
        "title": "Ngữ liệu Khoa học số 07",
        "stimulus": {
          "type": "text",
          "content": "Potassium dichromate có công thức hóa học là K₂Cr₂O₇, thường được sử dụng như một chất oxi hóa trong các phòng thí nghiệm và trong công nghiệp, chất này rất có hại cho sức khỏe. Potassium dichromate là chất rắn có màu da cam của ion dichromate (Cr₂O₇²⁻) và khá phổ biến trong phòng thí nghiệm vì nó không chảy nước, ngược lại với muối sodium dichromate. Muối potassium dichromate có tính oxi hóa mạnh, đặc biệt trong môi trường acid, muối chromi (VI) bị khử thành muối chromi (III). Trong dung dịch của ion Cr₂O₇²⁻ (màu cam) luôn luôn có cả ion CrO₄²⁻ (màu vàng) ở trạng thái cân bằng với nhau:\nCr₂O₇²⁻ + H₂O ⇌ 2CrO₄²⁻ + 2H⁺\nVì có cân bằng trên nên khi thêm dung dịch acid vào muối chromate (màu vàng) sẽ tạo thành dichromate (màu da cam). Ngược lại, khi thêm dung dịch base vào muối dichromate, sẽ tạo thành chromate.\nPhương pháp định lượng dichromate dựa vào tính oxi hóa mạnh của ion Cr₂O₇²⁻ trong môi trường acid:\nCr₂O₇²⁻ + 14H⁺ + 6e → 2Cr³⁺ + 7H₂O\nThế oxi hoá - khử tiêu chuẩn của cặp Cr₂O₇²⁻/Cr³⁺ là 1,36 V, chứng tỏ potassium dichromate cũng là một chất oxi hoá mạnh trong môi trường acid. Vì vậy có thể dùng nó để chuẩn độ nhiều chất khử khác cũng giống như phương pháp permanganate: H₂C₂O₄, Fe²⁺, H₂O₂, ...\nSo với phương pháp permanganate thì phương pháp dichromate có một số ưu điểm sau:\n+ Potassium dichromate dễ dàng tinh chế được ở dạng tinh khiết về mặt hoá học bằng cách kết tinh lại và sau đó sấy ở nhiệt độ 200°C. Do đó có thể pha dung dịch chuẩn K₂Cr₂O₇ từ một lượng cân chính xác được định trước.\n+ Dung dịch potassium dichromate rất bền khi bảo quản trong bình kín, không bị phân huỷ ngay cả khi đun sôi, không dễ dàng bị khử bởi các chất hữu cơ như thường xảy ra đối với potassium permanganate. Do đó, nồng độ dung dịch K₂Cr₂O₇ gần như không bị thay đổi trong thời gian bảo quản.\nTuy nhiên, phương pháp dichromate cũng có nhược điểm so với phương pháp permanganate, đó là K₂Cr₂O₇ là chất oxi hóa yếu hơn so với KMnO₄ nên khả năng áp dụng hạn chế hơn. Ngoài ra, trong quá trình chuẩn độ, ion Cr³⁺ tạo ra có màu xanh, gây khó khăn cho việc nhận biết điểm tương đương.\nChất chỉ thị thường dùng trong chuẩn độ bằng dichromate là diphenylamine (khoảng thế chuyển màu là 0,73 - 0,79V). Sau khi đạt đến điểm tương đương, chỉ cần dư một giọt potassium dichromate đã làm dung dịch trong bình phản ứng chuyển thành màu xanh xanh. Tuy nhiên trong thực tế, ví dụ khi chuẩn Fe²⁺ bằng potassium dichromate, nồng độ Fe³⁺ tăng dần sẽ làm tăng thế oxi hoá của hệ phản ứng. Do đó, diphenylamine có thể xuất hiện màu xanh khi còn chưa đến điểm tương đương. Để tránh được sai số đó người ta thêm H₃PO₄ vào hỗn hợp chuẩn độ. Acid này có tác dụng tạo phức bền với ion Fe³⁺ ở dạng [Fe(PO₄)₂]³⁻.\nMột thí nghiệm xác định nồng độ dung dịch FeSO₄ bằng K₂Cr₂O₇ được thực hiện như sau:\nBước 1: Lấy bình nón cỡ 100 ml, cho vào bình chính xác 5 ml dung dịch FeSO₄; 1 ml H₃PO₄ 1 M; 5 ml HCl 0,5 M và 2 giọt chất chỉ thị diphenylamine.\nBước 2: Nạp dung dịch K₂Cr₂O₇ 0,05 N vào burette.\nBước 3: Thêm từ từ dung dịch K₂Cr₂O₇ từ burette vào bình nón, dung dịch xuất hiện màu xanh xanh lá mạ (của ion Cr³⁺ sinh ra), chuẩn độ cho đến khi dung dịch chuyển từ màu xanh lá mạ sang màu xanh tím, ghi lại thể tích dung dịch K₂Cr₂O₇ đã thêm vào.\nBước 4: Lặp lại thí nghiệm thêm hai lần, lấy giá trị trung bình để tính toán.",
          "image_url": "",
          "image_width": 100
        },
        "questions": [
          {
            "question_no": 31,
            "question_type": "single_choice",
            "question": "Phát biểu sau đúng hay sai?\nTrong chuẩn độ ion Fe²⁺ bằng K₂Cr₂O₇, ngoài môi trường acid là HCl người ta còn phải cho thêm H₃PO₄.",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Đúng."
              },
              {
                "key": "B",
                "text": "Sai."
              }
            ],
            "options_are_images": false,
            "correct_answer": "A",
            "explanation": "Đúng. Việc thêm H₃PO₄ có tác dụng tạo phức bền màu với Fe³⁺, giúp hạ thế oxi hóa của hệ Fe³⁺/Fe²⁺ xuống, tránh làm diphenylamine chuyển màu xanh trước khi đạt điểm tương đương.",
            "points": 1
          },
          {
            "question_no": 32,
            "question_type": "true_false",
            "question": "Các phát biểu sau đúng hay sai?",
            "image_url": "",
            "statements": [
              {
                "id": "a",
                "text": "Có thể pha dung dịch chuẩn K₂Cr₂O₇ bằng cách cân chính xác."
              },
              {
                "id": "b",
                "text": "Phương pháp chuẩn độ bằng dichromate không cần chất chỉ thị."
              },
              {
                "id": "c",
                "text": "Trong môi trường thích hợp, các muối chromate (màu da cam) và dichromate (màu vàng) chuyển hóa lẫn nhau theo cân bằng: Cr₂O₇²⁻ + H₂O ⇌ 2CrO₄²⁻ + 2H⁺."
              }
            ],
            "correct_answer": {
              "a": true,
              "b": false,
              "c": false
            },
            "explanation": "1) Đúng, K₂Cr₂O₇ dễ tinh chế và rất bền nên dùng làm chất chuẩn gốc. 2) Sai, cần diphenylamine làm chất chỉ thị màu. 3) Sai, chromate màu vàng, dichromate màu cam (phát biểu bị đảo ngược màu sắc).",
            "points": 1
          },
          {
            "question_no": 33,
            "question_type": "fill_blank",
            "question": "Điền số thích hợp vào chỗ trống (số cần điền là số nguyên):\nThể tích dung dịch K₂Cr₂O₇ 0,05M vừa đủ phản ứng với dung dịch chứa 0,06 mol FeSO₄ trong môi trường H₂SO₄ dư là [o1] mL.",
            "image_url": "",
            "correct_answer": "200",
            "accepted_answers": [
              "200"
            ],
            "explanation": "Phản ứng chuẩn độ: Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O.\nSố mol Fe²⁺ = 0,06 mol => n(Cr₂O₇²⁻) = 0,06 / 6 = 0,01 mol.\nThể tích dung dịch K₂Cr₂O₇ 0,05 M cần dùng: V = 0,01 / 0,05 = 0,2 lít = 200 ml.",
            "points": 1
          },
          {
            "question_no": 34,
            "question_type": "single_choice",
            "question": "Trong thí nghiệm trên, trước khi chuẩn độ, trong bình chuẩn độ chứa bao nhiêu dung dịch khác nhau?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "2."
              },
              {
                "key": "B",
                "text": "3."
              },
              {
                "key": "C",
                "text": "4."
              },
              {
                "key": "D",
                "text": "5."
              }
            ],
            "options_are_images": false,
            "correct_answer": "C",
            "explanation": "Trước khi chuẩn độ, bình nón chứa: dung dịch FeSO₄, dung dịch H₃PO₄, dung dịch HCl và dung dịch chỉ thị diphenylamine (tổng cộng 4 dung dịch).",
            "points": 1
          },
          {
            "question_no": 35,
            "question_type": "drag_drop",
            "question": "Kéo thả các từ thích hợp vào chỗ trống:",
            "image_url": "",
            "body": [
              {
                "type": "text",
                "content": "Trong thí nghiệm chuẩn độ dung dịch "
              },
              {
                "type": "blank",
                "id": "o1"
              },
              {
                "type": "text",
                "content": " bằng "
              },
              {
                "type": "blank",
                "id": "o2"
              },
              {
                "type": "text",
                "content": ", khi thêm từ từ dung dịch K₂Cr₂O₇ từ burette vào bình, chuẩn độ đến khi dung dịch xuất hiện "
              },
              {
                "type": "blank",
                "id": "o3"
              },
              {
                "type": "text",
                "content": " thì dừng chuẩn độ."
              }
            ],
            "items": [
              {
                "id": "item1",
                "text": "FeSO₄"
              },
              {
                "id": "item2",
                "text": "K₂Cr₂O₇"
              },
              {
                "id": "item3",
                "text": "màu xanh lá mạ"
              },
              {
                "id": "item4",
                "text": "màu vàng"
              },
              {
                "id": "item5",
                "text": "màu xanh tím"
              },
              {
                "id": "item6",
                "text": "H₃PO₄"
              }
            ],
            "correct_answer": {
              "o1": "item1",
              "o2": "item2",
              "o3": "item5"
            },
            "explanation": "Chúng ta chuẩn độ dung dịch FeSO₄ (chất khử) bằng K₂Cr₂O₇ (chất oxi hóa). Điểm tương đương đạt được khi toàn bộ Fe²⁺ đã phản ứng, một giọt dư K₂Cr₂O₇ sẽ làm chỉ thị diphenylamine chuyển sang màu xanh tím.",
            "points": 1
          }
        ]
      },
      "g7_questions": [
        {
          "question_no": 31,
          "question_type": "single_choice",
          "question": "Phát biểu sau đúng hay sai?\nTrong chuẩn độ ion Fe²⁺ bằng K₂Cr₂O₇, ngoài môi trường acid là HCl người ta còn phải cho thêm H₃PO₄.",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Đúng."
            },
            {
              "key": "B",
              "text": "Sai."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A",
          "explanation": "Đúng. Việc thêm H₃PO₄ có tác dụng tạo phức bền màu với Fe³⁺, giúp hạ thế oxi hóa của hệ Fe³⁺/Fe²⁺ xuống, tránh làm diphenylamine chuyển màu xanh trước khi đạt điểm tương đương.",
          "points": 1
        },
        {
          "question_no": 32,
          "question_type": "true_false",
          "question": "Các phát biểu sau đúng hay sai?",
          "image_url": "",
          "statements": [
            {
              "id": "a",
              "text": "Có thể pha dung dịch chuẩn K₂Cr₂O₇ bằng cách cân chính xác."
            },
            {
              "id": "b",
              "text": "Phương pháp chuẩn độ bằng dichromate không cần chất chỉ thị."
            },
            {
              "id": "c",
              "text": "Trong môi trường thích hợp, các muối chromate (màu da cam) và dichromate (màu vàng) chuyển hóa lẫn nhau theo cân bằng: Cr₂O₇²⁻ + H₂O ⇌ 2CrO₄²⁻ + 2H⁺."
            }
          ],
          "correct_answer": {
            "a": true,
            "b": false,
            "c": false
          },
          "explanation": "1) Đúng, K₂Cr₂O₇ dễ tinh chế và rất bền nên dùng làm chất chuẩn gốc. 2) Sai, cần diphenylamine làm chất chỉ thị màu. 3) Sai, chromate màu vàng, dichromate màu cam (phát biểu bị đảo ngược màu sắc).",
          "points": 1
        },
        {
          "question_no": 33,
          "question_type": "fill_blank",
          "question": "Điền số thích hợp vào chỗ trống (số cần điền là số nguyên):\nThể tích dung dịch K₂Cr₂O₇ 0,05M vừa đủ phản ứng với dung dịch chứa 0,06 mol FeSO₄ trong môi trường H₂SO₄ dư là [o1] mL.",
          "image_url": "",
          "correct_answer": "200",
          "accepted_answers": [
            "200"
          ],
          "explanation": "Phản ứng chuẩn độ: Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O.\nSố mol Fe²⁺ = 0,06 mol => n(Cr₂O₇²⁻) = 0,06 / 6 = 0,01 mol.\nThể tích dung dịch K₂Cr₂O₇ 0,05 M cần dùng: V = 0,01 / 0,05 = 0,2 lít = 200 ml.",
          "points": 1
        },
        {
          "question_no": 34,
          "question_type": "single_choice",
          "question": "Trong thí nghiệm trên, trước khi chuẩn độ, trong bình chuẩn độ chứa bao nhiêu dung dịch khác nhau?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "2."
            },
            {
              "key": "B",
              "text": "3."
            },
            {
              "key": "C",
              "text": "4."
            },
            {
              "key": "D",
              "text": "5."
            }
          ],
          "options_are_images": false,
          "correct_answer": "C",
          "explanation": "Trước khi chuẩn độ, bình nón chứa: dung dịch FeSO₄, dung dịch H₃PO₄, dung dịch HCl và dung dịch chỉ thị diphenylamine (tổng cộng 4 dung dịch).",
          "points": 1
        },
        {
          "question_no": 35,
          "question_type": "drag_drop",
          "question": "Kéo thả các từ thích hợp vào chỗ trống:",
          "image_url": "",
          "body": [
            {
              "type": "text",
              "content": "Trong thí nghiệm chuẩn độ dung dịch "
            },
            {
              "type": "blank",
              "id": "o1"
            },
            {
              "type": "text",
              "content": " bằng "
            },
            {
              "type": "blank",
              "id": "o2"
            },
            {
              "type": "text",
              "content": ", khi thêm từ từ dung dịch K₂Cr₂O₇ từ burette vào bình, chuẩn độ đến khi dung dịch xuất hiện "
            },
            {
              "type": "blank",
              "id": "o3"
            },
            {
              "type": "text",
              "content": " thì dừng chuẩn độ."
            }
          ],
          "items": [
            {
              "id": "item1",
              "text": "FeSO₄"
            },
            {
              "id": "item2",
              "text": "K₂Cr₂O₇"
            },
            {
              "id": "item3",
              "text": "màu xanh lá mạ"
            },
            {
              "id": "item4",
              "text": "màu vàng"
            },
            {
              "id": "item5",
              "text": "màu xanh tím"
            },
            {
              "id": "item6",
              "text": "H₃PO₄"
            }
          ],
          "correct_answer": {
            "o1": "item1",
            "o2": "item2",
            "o3": "item5"
          },
          "explanation": "Chúng ta chuẩn độ dung dịch FeSO₄ (chất khử) bằng K₂Cr₂O₇ (chất oxi hóa). Điểm tương đương đạt được khi toàn bộ Fe²⁺ đã phản ứng, một giọt dư K₂Cr₂O₇ sẽ làm chỉ thị diphenylamine chuyển sang màu xanh tím.",
          "points": 1
        }
      ],
      "g8": {
        "group_id": "g8",
        "title": "Ngữ liệu Khoa học số 08",
        "stimulus": {
          "type": "text",
          "content": "Sét là hiện tượng phóng điện trong khí quyển có thể nhìn thấy được, thường xảy ra giữa các đám mây mang điện tích trái dấu. Hai lý thuyết sau đây đã cố gắng giải thích cơ chế tích điện và tạo ra sét của các đám mây dông.\nLý thuyết hấp dẫn\nNhư thể hiện trong Giai đoạn I của Hình 1, một đám mây bắt đầu ngưng tụ chứa hầu hết là các hạt mưa, tuyết hoặc tinh thể băng, ban đầu chúng đều trung hoà (không mang điện). Khi các hạt lớn hơn (giọt nước hoặc tinh thể băng) ở vùng phía trên của đám mây bị rơi xuống do tác dụng của trọng lực, chúng đi qua và cọ xát với các hạt nhỏ hơn (xem Giai đoạn II). Ma sát giữa các hạt khi cọ xát tạo ra lực tĩnh điện, các hạt lớn hơn trở nên tích điện âm và rơi xuống đáy của đám mây, các hạt nhỏ hơn trở nên tích điện dương và di chuyển lên đỉnh của đám mây (xem Giai đoạn III). Sự phân tách điện tích dương và điện tích âm trong đám mây dông là nguyên nhân của sự hình thành sét.\nLý thuyết đối lưu\nTheo lý thuyết này, sự hoàn lưu gió trong các đám mây dông được cho là nguyên nhân gây ra sự phân tách điện tích. Gần mặt đất, một số hạt bụi mang điện tích dương. Các luồng gió mạnh thẳng lên (dòng không khí chuyển động đi lên theo phương thẳng đứng) mang các điện tích dương đến bề mặt của đám mây dông ở phía trên (xem Hình 2). Ban đầu, toàn bộ đám mây mang điện tích dương (Giai đoạn I). Các hạt tích điện âm trong không khí bị hút về phía đám mây tích điện dương và tạo thành một lớp điện tích âm xung quanh rìa của đám mây (Giai đoạn III). Khi gặp các luồng gió mạnh, các hạt nước rơi xuống tạo thành mưa và kéo theo lớp điện tích âm ở rìa đám mây đi xuống phía dưới (Giai đoạn IV). Như vậy, vòng tuần hoàn đối lưu đã mang các hạt điện tích dương từ khí quyển lên đỉnh của đám mây và đẩy các hạt tích điện âm ở rìa đám mây xuống dưới đáy, quá trình này được tiếp diễn suốt phần còn lại trong vòng đời của đám mây.",
          "image_url": "",
          "image_width": 100
        },
        "questions": [
          {
            "question_no": 36,
            "question_type": "fill_blank",
            "question": "Theo lý thuyết hấp dẫn, sự phân tách điện tích trong đám mây xảy ra qua [o1] giai đoạn.",
            "image_url": "",
            "correct_answer": "3",
            "accepted_answers": [
              "3"
            ],
            "explanation": "Theo lý thuyết hấp dẫn và Hình 1, quá trình tích điện xảy ra qua 3 giai đoạn: Giai đoạn I (hạt trung hòa), Giai đoạn II (cọ xát khi rơi), Giai đoạn III (phân tách điện tích âm/dương).",
            "points": 1
          },
          {
            "question_no": 37,
            "question_type": "single_choice",
            "question": "Theo lý thuyết hấp dẫn, nồng độ điện tích âm ở chân đám mây sẽ lớn nhất khi",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "những hạt mưa lớn bên trong đám mây."
              },
              {
                "key": "B",
                "text": "những hạt mưa nhỏ bên trong đám mây."
              },
              {
                "key": "C",
                "text": "không có mưa rơi vào trong đám mây."
              },
              {
                "key": "D",
                "text": "sau khi bị sét đánh."
              }
            ],
            "options_are_images": false,
            "correct_answer": "A",
            "explanation": "Theo lý thuyết hấp dẫn, các hạt mưa lớn hơn khi rơi xuống đáy đám mây mang theo điện tích âm. Do đó, nồng độ điện tích âm ở chân đám mây lớn nhất khi có nhiều hạt mưa lớn rơi xuống.",
            "points": 1
          },
          {
            "question_no": 38,
            "question_type": "single_choice",
            "question": "Một máy bay nghiên cứu thực hiện bay qua tâm của một đám mây dông ở giai đoạn hoàn chỉnh tại độ cao không đổi và phát hiện ra rằng, hầu hết các hạt trong vùng đó đều tích điện âm. Cả hai lý thuyết đều đồng ý rằng",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "không có hoàn lưu gió để mang các hạt tích điện dương lên khỏi mặt đất."
              },
              {
                "key": "B",
                "text": "hầu hết các hạt tích điện dương lơ lửng phía trên vùng được khảo sát."
              },
              {
                "key": "C",
                "text": "hoàn lưu gió chỉ xảy ra ở các mức trên của khu vực được khảo sát."
              },
              {
                "key": "D",
                "text": "toàn bộ đám mây mang điện tích âm."
              }
            ],
            "options_are_images": false,
            "correct_answer": "B",
            "explanation": "Cả hai lý thuyết đều phân bố điện tích dương ở phần trên (đỉnh đám mây) và điện tích âm ở phần dưới (đáy đám mây). Khi máy bay bay qua phần tâm của đám mây và thấy tích điện âm, cả hai lý thuyết đều thống nhất rằng các điện tích dương nằm ở phía trên vùng này.",
            "points": 1
          },
          {
            "question_no": 39,
            "question_type": "single_choice",
            "question": "Nếu một đám mây được tạo thành hoàn toàn từ tinh thể băng, theo lý thuyết hấp dẫn, nhận định nào sau đây là đúng?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Chỉ những tinh thể băng mang điện tích dương mới rơi xuống và tạo ra sự phân tách điện tích."
              },
              {
                "key": "B",
                "text": "Các tinh thể băng tích điện dương sẽ hút các tinh thể băng tích điện âm từ khí quyển."
              },
              {
                "key": "C",
                "text": "Các tinh thể băng lớn hơn sẽ rơi nhanh hơn các tinh thể băng nhỏ hơn và trở nên tích điện âm."
              },
              {
                "key": "D",
                "text": "Dòng khí đi xuống làm cho các tinh thể băng rơi xuống và do đó mang điện tích âm."
              }
            ],
            "options_are_images": false,
            "correct_answer": "C",
            "explanation": "Theo lý thuyết hấp dẫn, các hạt lớn hơn (rơi nhanh hơn do trọng lực) khi cọ xát với các hạt nhỏ hơn sẽ tích điện âm và đi xuống dưới. Ở đây các tinh thể băng lớn hơn rơi nhanh hơn tinh thể băng nhỏ và tích điện âm.",
            "points": 1
          },
          {
            "question_no": 40,
            "question_type": "single_choice",
            "question": "Sét thường xảy ra khi dòng điện chạy từ vùng mang điện tích âm đến vùng mang điện tích dương. Dựa trên lý thuyết đối lưu, đường đi nào của tia sét không thể xảy ra?",
            "image_url": "",
            "options": [
              {
                "key": "A",
                "text": "Trong đám mây từ chân tới đỉnh."
              },
              {
                "key": "B",
                "text": "Từ chân đám mây này đến đỉnh đám mây khác."
              },
              {
                "key": "C",
                "text": "Từ chân mây xuống mặt đất."
              },
              {
                "key": "D",
                "text": "Từ chân mây đến vùng tích điện dương của khí quyển."
              }
            ],
            "options_are_images": false,
            "correct_answer": "D",
            "explanation": "Lý thuyết đối lưu chỉ ra điện tích dương tập trung ở đỉnh đám mây và gần mặt đất. Không có vùng tích điện dương lơ lửng của khí quyển ở vị trí tương ứng để tia sét phóng từ chân mây (âm) tới đó.",
            "points": 1
          }
        ]
      },
      "g8_questions": [
        {
          "question_no": 36,
          "question_type": "fill_blank",
          "question": "Theo lý thuyết hấp dẫn, sự phân tách điện tích trong đám mây xảy ra qua [o1] giai đoạn.",
          "image_url": "",
          "correct_answer": "3",
          "accepted_answers": [
            "3"
          ],
          "explanation": "Theo lý thuyết hấp dẫn và Hình 1, quá trình tích điện xảy ra qua 3 giai đoạn: Giai đoạn I (hạt trung hòa), Giai đoạn II (cọ xát khi rơi), Giai đoạn III (phân tách điện tích âm/dương).",
          "points": 1
        },
        {
          "question_no": 37,
          "question_type": "single_choice",
          "question": "Theo lý thuyết hấp dẫn, nồng độ điện tích âm ở chân đám mây sẽ lớn nhất khi",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "những hạt mưa lớn bên trong đám mây."
            },
            {
              "key": "B",
              "text": "những hạt mưa nhỏ bên trong đám mây."
            },
            {
              "key": "C",
              "text": "không có mưa rơi vào trong đám mây."
            },
            {
              "key": "D",
              "text": "sau khi bị sét đánh."
            }
          ],
          "options_are_images": false,
          "correct_answer": "A",
          "explanation": "Theo lý thuyết hấp dẫn, các hạt mưa lớn hơn khi rơi xuống đáy đám mây mang theo điện tích âm. Do đó, nồng độ điện tích âm ở chân đám mây lớn nhất khi có nhiều hạt mưa lớn rơi xuống.",
          "points": 1
        },
        {
          "question_no": 38,
          "question_type": "single_choice",
          "question": "Một máy bay nghiên cứu thực hiện bay qua tâm của một đám mây dông ở giai đoạn hoàn chỉnh tại độ cao không đổi và phát hiện ra rằng, hầu hết các hạt trong vùng đó đều tích điện âm. Cả hai lý thuyết đều đồng ý rằng",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "không có hoàn lưu gió để mang các hạt tích điện dương lên khỏi mặt đất."
            },
            {
              "key": "B",
              "text": "hầu hết các hạt tích điện dương lơ lửng phía trên vùng được khảo sát."
            },
            {
              "key": "C",
              "text": "hoàn lưu gió chỉ xảy ra ở các mức trên của khu vực được khảo sát."
            },
            {
              "key": "D",
              "text": "toàn bộ đám mây mang điện tích âm."
            }
          ],
          "options_are_images": false,
          "correct_answer": "B",
          "explanation": "Cả hai lý thuyết đều phân bố điện tích dương ở phần trên (đỉnh đám mây) và điện tích âm ở phần dưới (đáy đám mây). Khi máy bay bay qua phần tâm của đám mây và thấy tích điện âm, cả hai lý thuyết đều thống nhất rằng các điện tích dương nằm ở phía trên vùng này.",
          "points": 1
        },
        {
          "question_no": 39,
          "question_type": "single_choice",
          "question": "Nếu một đám mây được tạo thành hoàn toàn từ tinh thể băng, theo lý thuyết hấp dẫn, nhận định nào sau đây là đúng?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Chỉ những tinh thể băng mang điện tích dương mới rơi xuống và tạo ra sự phân tách điện tích."
            },
            {
              "key": "B",
              "text": "Các tinh thể băng tích điện dương sẽ hút các tinh thể băng tích điện âm từ khí quyển."
            },
            {
              "key": "C",
              "text": "Các tinh thể băng lớn hơn sẽ rơi nhanh hơn các tinh thể băng nhỏ hơn và trở nên tích điện âm."
            },
            {
              "key": "D",
              "text": "Dòng khí đi xuống làm cho các tinh thể băng rơi xuống và do đó mang điện tích âm."
            }
          ],
          "options_are_images": false,
          "correct_answer": "C",
          "explanation": "Theo lý thuyết hấp dẫn, các hạt lớn hơn (rơi nhanh hơn do trọng lực) khi cọ xát với các hạt nhỏ hơn sẽ tích điện âm và đi xuống dưới. Ở đây các tinh thể băng lớn hơn rơi nhanh hơn tinh thể băng nhỏ và tích điện âm.",
          "points": 1
        },
        {
          "question_no": 40,
          "question_type": "single_choice",
          "question": "Sét thường xảy ra khi dòng điện chạy từ vùng mang điện tích âm đến vùng mang điện tích dương. Dựa trên lý thuyết đối lưu, đường đi nào của tia sét không thể xảy ra?",
          "image_url": "",
          "options": [
            {
              "key": "A",
              "text": "Trong đám mây từ chân tới đỉnh."
            },
            {
              "key": "B",
              "text": "Từ chân đám mây này đến đỉnh đám mây khác."
            },
            {
              "key": "C",
              "text": "Từ chân mây xuống mặt đất."
            },
            {
              "key": "D",
              "text": "Từ chân mây đến vùng tích điện dương của khí quyển."
            }
          ],
          "options_are_images": false,
          "correct_answer": "D",
          "explanation": "Lý thuyết đối lưu chỉ ra điện tích dương tập trung ở đỉnh đám mây và gần mặt đất. Không có vùng tích điện dương lơ lửng của khí quyển ở vị trí tương ứng để tia sét phóng từ chân mây (âm) tới đó.",
          "points": 1
        }
      ]
    }
  ]
};
