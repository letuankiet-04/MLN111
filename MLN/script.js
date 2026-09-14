(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    // ============ Particles Canvas ============
    class Particles {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: null, y: null, radius: 140 };
            this.resize();
            this.init();
            this.bind();
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        init() {
            const count = Math.min(90, Math.floor(window.innerWidth / 18));
            this.particles = [];
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    r: Math.random() * 2 + 1,
                    hue: 240 + Math.random() * 60,
                });
            }
        }

        bind() {
            window.addEventListener('resize', () => {
                this.resize();
                this.init();
            });
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            window.addEventListener('mouseout', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }

        animate() {
            const { ctx, canvas, particles, mouse } = this;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                if (mouse.x !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        p.x += (dx / dist) * force * 2;
                        p.y += (dy / dist) * force * 2;
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, 0.7)`;
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        const alpha = (1 - dist / 130) * 0.25;
                        const midHue = (a.hue + b.hue) / 2;
                        ctx.strokeStyle = `hsla(${midHue}, 70%, 70%, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ============ Scroll Reveal ============
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    // ============ Counter Animation ============
    function animateCounter(el) {
        const target = +el.dataset.target;
        const duration = 1800;
        const start = performance.now();
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        function step(now) {
            const p = Math.min(1, (now - start) / duration);
            el.textContent = Math.floor(easeOutQuart(p) * target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
        }
        requestAnimationFrame(step);
    }

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    // ============ Navbar ============
    const navbar = $('#navbar');
    const sections = ['hero', 'principles', 'categories', 'ai-discussion', 'references']
        .map((id) => document.getElementById(id))
        .filter(Boolean);
    const navLinks = $$('.nav-link');

    function updateNavbar() {
        if (navbar && sections.length > 0) {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        }

        const scrollY = window.scrollY + 120;
        let currentId = sections[0]?.id;
        for (const sec of sections) {
            if (sec && sec.offsetTop <= scrollY) currentId = sec.id;
        }
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });

        const btt = $('#back-to-top');
        if (btt) btt.classList.toggle('visible', window.scrollY > 500);
    }

    // ============ Mobile Menu ============
    const hamburger = $('#hamburger');
    const navMenu = $('.nav-menu');

    function toggleMenu() {
        if (!hamburger || !navMenu) return;
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    function closeMenu() {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    }

    // ============ Tabs ============
    function initTabs() {
        const btns = $$('.tab-btn');
        const panes = $$('.tab-pane');
        if (!btns.length) return;

        btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                btns.forEach((b) => b.classList.remove('active'));
                panes.forEach((p) => p.classList.remove('active'));
                btn.classList.add('active');
                const target = document.getElementById(tab);
                if (target) {
                    target.classList.add('active');
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ============ Smooth Scroll Offset ============
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const targetId = link.getAttribute('href').slice(1);
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });

    // ============ Back to Top ============
    const backToTopBtn = $('#back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============ Init ============
    function init() {
        const pc = $('#particles-canvas');
        if (pc) new Particles(pc);

        $$('.reveal').forEach((el) => revealObserver.observe(el));

        $$('.stat-number').forEach((el) => counterObserver.observe(el));

        window.addEventListener('scroll', updateNavbar, { passive: true });
        updateNavbar();

        if (hamburger) {
            hamburger.addEventListener('click', toggleMenu);
        }

        initTabs();

        initQuiz();
    }

    // ============ Quiz Data & Engine ============
    const quizData = [
        {
            category: "Nguyên lý 1: Mối liên hệ phổ biến",
            question: "Theo phép biện chứng duy vật, nguyên lý về mối liên hệ phổ biến khẳng định điều gì và bao gồm những tính chất cơ bản nào?",
            options: [
                "Các sự vật tồn tại hoàn toàn cô lập, tách rời; bao gồm tính cục bộ, tính trừu tượng và tính ngẫu nhiên.",
                "Thế giới khách quan là một thể thống nhất, mọi sự vật hiện tượng đều liên hệ hữu cơ, tác động qua lại; bao gồm 3 tính chất: Tính phổ biến, Tính đa dạng, Tính điều kiện.",
                "Mối liên hệ chỉ diễn ra trong tư duy chủ quan của con người; bao gồm tính bất biến, tính tuyệt đối và tính vĩnh cửu.",
                "Mọi sự vật chỉ liên hệ với nhau khi cùng tồn tại trong một không gian và thời gian xác định; bao gồm tính chủ quan, tính quy luật và tính đơn nhất."
            ],
            answer: 1,
            explanation: `
                <p><strong>Đáp án chính xác: B</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li><strong>Bản chất:</strong> Thế giới khách quan là một thể thống nhất, không có sự vật nào tồn tại cô lập, tách rời khỏi các sự vật khác.</li>
                    <li><strong>3 tính chất cốt lõi:</strong>
                        <br>• <em>Tính phổ biến:</em> Mọi sự vật trong tự nhiên, xã hội và tư duy đều liên kết với nhau.
                        <br>• <em>Tính đa dạng:</em> Có vô số dạng liên hệ (bên trong - bên ngoài, trực tiếp - gián tiếp, chủ yếu - thứ yếu...).
                        <br>• <em>Tính điều kiện:</em> Mối liên hệ biểu hiện cụ thể tùy thuộc vào các điều kiện không gian, thời gian xác định.
                    </li>
                </ul>
            `
        },
        {
            category: "Nguyên lý 2: Sự phát triển",
            question: "Nguyên lý về sự phát triển trong phép biện chứng duy vật quan niệm như thế nào về sự vận động của thế giới?",
            options: [
                "Thế giới vận động tuần hoàn khép kín, lặp lại nguyên xi cái cũ mà không xuất hiện cái mới.",
                "Thế giới là tập hợp của các sự vật bất biến, không có sự thay đổi về chất.",
                "Thế giới không bất biến mà là quá trình phát triển không ngừng từ thấp đến cao, từ đơn giản đến phức tạp; mang 3 tính chất cốt lõi: Tính vĩnh cửu, Tính quy luật, Tính lên trên (tiến bộ).",
                "Sự phát triển chỉ là sự gia tăng đơn thuần về mặt số lượng và kích thước bề ngoài."
            ],
            answer: 2,
            explanation: `
                <p><strong>Đáp án chính xác: C</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li><strong>Bản chất:</strong> Thế giới không phải tập hợp các vật cố định mà là một chuỗi vận động và phát triển không ngừng, cái mới ra đời thay thế cái cũ với chất lượng cao hơn.</li>
                    <li><strong>3 tính chất cơ bản:</strong>
                        <br>• <em>Tính vĩnh cửu:</em> Phát triển diễn ra liên tục, không có điểm dừng.
                        <br>• <em>Tính quy luật:</em> Tuân theo các quy luật khách quan độc lập với ý thức.
                        <br>• <em>Tính lên trên (tiến bộ):</em> Vận động theo hướng đi lên, kế thừa và đổi mới.
                    </li>
                </ul>
            `
        },
        {
            category: "Cặp phạm trù 01: Cái riêng & Cái chung",
            question: "Mối quan hệ biện chứng giữa 'Cái riêng', 'Cái chung' và 'Cái đơn nhất' được phát biểu chính xác như thế nào?",
            options: [
                "Cái riêng tồn tại độc lập bên ngoài cái chung; cái chung không cần biểu hiện qua cái riêng.",
                "Cái riêng là cái toàn bộ, phong phú hơn cái chung (chứa cái chung + cái đơn nhất); cái chung là cái bộ phận nhưng sâu sắc hơn cái riêng; cái chung và cái đơn nhất có thể chuyển hóa lẫn nhau.",
                "Cái chung phong phú hơn cái riêng; cái đơn nhất không bao giờ có thể chuyển hóa thành cái chung.",
                "Cái riêng chỉ chứa đựng những nét độc nhất, hoàn toàn không có điểm tương đồng với các cái riêng khác."
            ],
            answer: 1,
            explanation: `
                <p><strong>Đáp án chính xác: B</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li>Cái chung chỉ tồn tại <em>trong cái riêng</em>, thông qua cái riêng để biểu hiện.</li>
                    <li>Cái riêng là cái <em>toàn bộ, phong phú hơn</em> cái chung vì: <strong>Cái riêng = Cái chung + Cái đơn nhất</strong>.</li>
                    <li>Cái chung là cái <em>bộ phận nhưng sâu sắc, bản chất hơn</em> cái riêng vì nó phản ánh quy luật phổ biến lặp lại.</li>
                    <li>Cái chung và cái đơn nhất có thể <em>chuyển hóa qua lại</em> trong các điều kiện thích hợp.</li>
                </ul>
            `
        },
        {
            category: "Ý nghĩa: Cái riêng & Cái chung",
            question: "Ý nghĩa phương pháp luận cốt lõi được rút ra từ cặp phạm trù 'Cái riêng – Cái chung – Cái đơn nhất' là gì?",
            options: [
                "Muốn nhận thức cái chung phải áp đặt các công thức chung có sẵn lên từng sự vật riêng lẻ.",
                "Muốn nhận thức cái chung phải xuất phát từ cái riêng; trong thực tiễn phải vận dụng cái chung làm kim chỉ nam để giải quyết cái riêng; đồng thời tạo điều kiện để cái đơn nhất có lợi biến thành cái chung.",
                "Chỉ cần nắm bắt cái đơn nhất là có thể hiểu được toàn bộ quy luật vận động của cái chung.",
                "Tuyệt đối hóa cái riêng, phủ nhận vai trò định hướng của các nguyên lý chung."
            ],
            answer: 1,
            explanation: `
                <p><strong>Đáp án chính xác: B</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li>Phải <strong>xuất phát từ cái riêng</strong> để nhận thức cái chung, tránh chủ quan áp đặt.</li>
                    <li>Trong thực tiễn giải quyết cái riêng cụ thể, phải <strong>vận dụng nguyên lý chung</strong> làm kim chỉ nam.</li>
                    <li>Chủ động tạo điều kiện để <em>cái đơn nhất có lợi → phát triển thành cái chung</em>; và <em>cái chung lỗi thời → thoái hóa thành cái đơn nhất</em> rồi tiêu vong.</li>
                </ul>
            `
        },
        {
            category: "Cặp phạm trù 02: Nguyên nhân & Kết quả",
            question: "Khi nghiên cứu về mối quan hệ giữa 'Nguyên nhân' và 'Kết quả', khẳng định nào sau đây là ĐÚNG ĐẮN về mặt biện chứng?",
            options: [
                "Nguyên nhân luôn đi trước kết quả; kết quả sau khi xuất hiện sẽ tác động trở lại nguyên nhân; trong chuỗi vô tận, một sự vật ở quan hệ này là nguyên nhân thì ở quan hệ khác lại là kết quả.",
                "Kết quả luôn xuất hiện trước nguyên nhân và đóng vai trò sinh ra nguyên nhân.",
                "Kết quả sau khi ra đời chỉ thụ động tiếp nhận tác động chứ không bao giờ ảnh hưởng ngược lại nguyên nhân sinh ra nó.",
                "Một kết quả bao giờ cũng chỉ do duy nhất một nguyên nhân đơn lẻ sinh ra."
            ],
            answer: 0,
            explanation: `
                <p><strong>Đáp án chính xác: A</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li>Nguyên nhân sinh ra kết quả, đi trước kết quả về logic và thời gian.</li>
                    <li><strong>Tác động trở lại:</strong> Kết quả sau khi xuất hiện <em>không thụ động</em> mà ảnh hưởng ngược lại nguyên nhân.</li>
                    <li><strong>Tính chuyển hóa:</strong> Trong chuỗi quan hệ vô tận của vũ trụ, một sự vật ở quan hệ này là nguyên nhân thì ở quan hệ khác lại là kết quả.</li>
                    <li>Ý nghĩa: Tìm nguyên nhân trong chính thế giới hiện thực, phân loại nguyên nhân để giải quyết đúng bản chất.</li>
                </ul>
            `
        },
        {
            category: "Cặp phạm trù 03: Tất nhiên & Ngẫu nhiên",
            question: "Quan điểm biện chứng duy vật về 'Tất nhiên – Ngẫu nhiên' và bài học thực tiễn được rút ra là gì?",
            options: [
                "Tất nhiên bắt nguồn từ bên ngoài; ngẫu nhiên bắt nguồn từ bản chất bên trong; trong thực tiễn chỉ cần dựa vào ngẫu nhiên và may rủi.",
                "Tất nhiên vạch đường đi cho mình thông qua vô số ngẫu nhiên; ngẫu nhiên bổ sung và biểu hiện cho tất nhiên; thực tiễn phải dựa vào cái tất nhiên nhưng phải dự phòng và linh hoạt trước cái ngẫu nhiên.",
                "Tất nhiên và ngẫu nhiên hoàn toàn đối lập, triệt tiêu lẫn nhau và không bao giờ chuyển hóa cho nhau.",
                "Vì cái ngẫu nhiên dễ thay đổi nên ta có thể hoàn toàn bỏ qua, chỉ cần tập trung vào cái tất nhiên."
            ],
            answer: 1,
            explanation: `
                <p><strong>Đáp án chính xác: B</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li><strong>Tất nhiên:</strong> Xuất phát từ nguyên nhân bên trong, bản chất; chi phối xu hướng phát triển chính.</li>
                    <li><strong>Ngẫu nhiên:</strong> Xuất phát từ nguyên nhân bên ngoài; biểu hiện và bổ sung cho cái tất nhiên.</li>
                    <li><strong>Phương pháp luận:</strong> Trong thực tiễn phải <em>dựa vào cái tất nhiên</em>, nhưng phải luôn <em>dự phòng, tận dụng hoặc khắc phục cái ngẫu nhiên</em> (nguyên tắc linh hoạt).</li>
                </ul>
            `
        },
        {
            category: "Cặp phạm trù 04: Nội dung & Hình thức",
            question: "Trong mối quan hệ giữa 'Nội dung' và 'Hình thức', nhận định nào sau đây thể hiện đúng tính biện chứng và bài học chống chủ nghĩa hình thức?",
            options: [
                "Hình thức giữ vai trò quyết định nội dung; nội dung luôn thụ động biến đổi theo hình thức.",
                "Nội dung quyết định hình thức; hình thức có tính độc lập tương đối (hình thức phù hợp thì thúc đẩy, hình thức lỗi thời thì kìm hãm nội dung); thực tiễn phải xuất phát từ nội dung, tránh 'chủ nghĩa hình thức'.",
                "Nội dung và hình thức luôn đồng nhất tuyệt đối, không có sự mâu thuẫn hay tác động qua lại.",
                "Hình thức lạc hậu vẫn luôn hỗ trợ nội dung mới phát triển nhanh hơn."
            ],
            answer: 1,
            explanation: `
                <p><strong>Đáp án chính xác: B</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li><strong>Nội dung quyết định hình thức:</strong> Nội dung biến đổi trước, hình thức biến đổi theo sau để phù hợp.</li>
                    <li><strong>Tính độc lập tương đối:</strong> Hình thức phù hợp sẽ <em>thúc đẩy</em>; hình thức lạc hậu sẽ <em>kìm hãm</em> nội dung phát triển.</li>
                    <li><strong>Bài học thực tiễn:</strong> Phải xuất phát từ nội dung, kiên quyết chống <em>chủ nghĩa hình thức</em> (bệnh phô trương, rỗng tuếch); chủ động đổi mới hình thức khi nội dung đã thay đổi.</li>
                </ul>
            `
        },
        {
            category: "Cặp phạm trù 05: Bản chất & Hiện tượng",
            question: "Vì sao trong nhận thức ta không được dừng lại ở 'Hiện tượng' mà phải dùng tư duy trừu tượng để đi sâu vạch ra 'Bản chất'?",
            options: [
                "Vì hiện tượng là cái bất biến, cố định; còn bản chất là cái biến đổi liên tục.",
                "Vì hiện tượng là biểu hiện bên ngoài, đa dạng, dễ biến đổi và có thể phản ánh sai lệch hoặc xuyên tạc bản chất (hiện tượng giả tạo); trong khi bản chất là mối liên hệ ổn định, tất nhiên bên trong quy định sự phát triển.",
                "Vì bản chất có thể trực tiếp quan sát bằng mắt thường mà không cần tư duy khoa học.",
                "Vì bản chất không có vai trò gì trong việc định ra chủ trương và đường lối hành động."
            ],
            answer: 1,
            explanation: `
                <p><strong>Đáp án chính xác: B</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li><strong>Bản chất:</strong> Mối liên hệ tất nhiên, ổn định bên trong; nhận thức bằng <em>tư duy trừu tượng</em>.</li>
                    <li><strong>Hiện tượng:</strong> Biểu hiện bên ngoài, nhận thức bằng <em>giác quan</em>; có thể phản ánh đúng hoặc <strong>xuyên tạc bản chất (hiện tượng giả tạo)</strong>.</li>
                    <li><strong>Phương pháp luận:</strong> Không đánh giá sự vật chỉ qua vẻ bề ngoài; phải đi sâu khám phá bản chất và quy luật để đề ra chủ trương hành động đúng đắn.</li>
                </ul>
            `
        },
        {
            category: "Cặp phạm trù 06: Khả năng & Hiện thực",
            question: "Để biến một 'Khả năng' tích cực thành 'Hiện thực' trong đời sống thực tiễn, phép biện chứng duy vật đòi hỏi điều kiện gì?",
            options: [
                "Chỉ cần ảo tưởng hoặc mong muốn chủ quan của con người là khả năng tự khắc biến thành hiện thực.",
                "Khả năng tự động trở thành hiện thực theo thời gian mà không cần bất kỳ sự tác động hay điều kiện nào.",
                "Trong thực tiễn phải dựa vào hiện thực, tính toán đầy đủ các khả năng (thực thi và triệt tiêu), đồng thời phát huy vai trò tích cực của 'nhân tố chủ quan' tạo điều kiện cần và đủ để hiện thực hóa khả năng.",
                "Khả năng là cái không bao giờ có thể chuyển hóa thành hiện thực."
            ],
            answer: 2,
            explanation: `
                <p><strong>Đáp án chính xác: C</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li><strong>Khả năng:</strong> Tiền đề của sự vật mới chưa xuất hiện nhưng sẽ xuất hiện khi có đủ điều kiện.</li>
                    <li><strong>Hiện thực:</strong> Cái đang tồn tại thực sự khách quan.</li>
                    <li><strong>Mối quan hệ:</strong> Khả năng chuyển hóa thành hiện thực khi hội tụ đủ điều kiện khách quan.</li>
                    <li><strong>Phương pháp luận:</strong> Luôn dựa vào hiện thực (tránh ảo tưởng); lường trước mọi khả năng; phát huy mạnh mẽ <strong>nhân tố chủ quan</strong> để biến khả năng có lợi thành hiện thực.</li>
                </ul>
            `
        },
        {
            category: "Tổng kết: Phương pháp luận",
            question: "Giá trị cốt lõi của phép biện chứng duy vật thông qua 2 nguyên lý và 6 cặp phạm trù là cung cấp cho con người điều gì?",
            options: [
                "Những giáo điều cứng nhắc, cố định để áp đặt nguyên xi vào mọi hoàn cảnh lịch sử mà không cần sáng tạo.",
                "Cơ sở thế giới quan duy vật và phương pháp luận khoa học (quan điểm toàn diện, quan điểm phát triển, quan điểm lịch sử - cụ thể) để nhận thức đúng đắn và cải tạo thế giới hiện thực.",
                "Công cụ để biện minh cho các quan điểm duy tâm, thần bí và số phận ngẫu nhiên.",
                "Hệ thống các quy tắc mang tính hình thức, thuần túy trừu tượng, tách rời thực tiễn đời sống xã hội."
            ],
            answer: 1,
            explanation: `
                <p><strong>Đáp án chính xác: B</strong></p>
                <p><strong>Đề cương ôn tập:</strong></p>
                <ul>
                    <li>Phép biện chứng duy vật là <strong>phương pháp luận khoa học</strong> giúp con người nhận thức và cải tạo thế giới.</li>
                    <li>Trang bị các quan điểm chỉ đạo tư duy:
                        <br>• <em>Quan điểm toàn diện:</em> Từ nguyên lý mối liên hệ phổ biến.
                        <br>• <em>Quan điểm phát triển:</em> Từ nguyên lý về sự phát triển.
                        <br>• <em>Quan điểm lịch sử - cụ thể:</em> Từ hệ thống 6 cặp phạm trù.
                    </li>
                    <li>Giúp khắc phục tư duy siêu hình, phiến diện, giáo điều hoặc định kiến sai lầm trong học tập và công việc.</li>
                </ul>
            `
        }
    ];

    function initQuiz() {
        const quizWrapper = $('.quiz-wrapper');
        if (!quizWrapper) return;

        let currentIndex = 0;
        const userAnswers = {};
        let score = 0;

        const badgeCategory = $('#quiz-badge-category');
        const counterEl = $('#quiz-counter');
        const currentScoreEl = $('#quiz-current-score');
        const progressFill = $('#quiz-progress-fill');
        const navPillsContainer = $('#quiz-nav-pills');
        const questionTextEl = $('#quiz-question-text');
        const optionsListEl = $('#quiz-options-list');
        const explanationBox = $('#quiz-explanation-box');
        const explanationBody = $('#quiz-explanation-body');
        const prevBtn = $('#quiz-prev-btn');
        const nextBtn = $('#quiz-next-btn');
        const resetBtn = $('#quiz-reset-btn');
        const quizCard = $('#quiz-card');
        const quizControls = $('#quiz-controls');
        const resultCard = $('#quiz-result-card');
        const finalScoreEl = $('#final-score');
        const finalMessageEl = $('#final-message');
        const restartBtn = $('#quiz-restart-btn');

        const letters = ['A', 'B', 'C', 'D'];

        function renderNavPills() {
            if (!navPillsContainer) return;
            navPillsContainer.innerHTML = '';
            quizData.forEach((q, idx) => {
                const pill = document.createElement('button');
                pill.className = 'quiz-nav-pill';
                pill.textContent = idx + 1;
                pill.setAttribute('title', `Câu ${idx + 1}: ${q.category}`);

                if (idx === currentIndex) {
                    pill.classList.add('active');
                }

                if (userAnswers[idx] !== undefined) {
                    pill.classList.add('answered');
                    if (userAnswers[idx] === q.answer) {
                        pill.classList.add('correct');
                    } else {
                        pill.classList.add('incorrect');
                    }
                }

                pill.addEventListener('click', () => {
                    currentIndex = idx;
                    renderQuestion();
                });

                navPillsContainer.appendChild(pill);
            });
        }

        function calculateScore() {
            let correctCount = 0;
            Object.keys(userAnswers).forEach((qIdx) => {
                if (userAnswers[qIdx] === quizData[qIdx].answer) {
                    correctCount++;
                }
            });
            score = correctCount;
            if (currentScoreEl) currentScoreEl.textContent = score;
        }

        function renderQuestion() {
            const curQ = quizData[currentIndex];
            if (!curQ) return;

            if (badgeCategory) badgeCategory.textContent = curQ.category;
            if (counterEl) counterEl.textContent = `Câu ${currentIndex + 1} / ${quizData.length}`;
            if (progressFill) progressFill.style.width = `${((currentIndex + 1) / quizData.length) * 100}%`;

            if (questionTextEl) questionTextEl.textContent = curQ.question;
            if (optionsListEl) optionsListEl.innerHTML = '';

            const isAnswered = userAnswers[currentIndex] !== undefined;

            curQ.options.forEach((optText, optIdx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';

                const letterSpan = document.createElement('span');
                letterSpan.className = 'quiz-option-letter';
                letterSpan.textContent = letters[optIdx];

                const textSpan = document.createElement('span');
                textSpan.className = 'quiz-option-desc';
                textSpan.textContent = optText;

                btn.appendChild(letterSpan);
                btn.appendChild(textSpan);

                if (isAnswered) {
                    btn.classList.add('disabled');
                    if (optIdx === curQ.answer) {
                        btn.classList.add('correct');
                    }
                    if (userAnswers[currentIndex] === optIdx && optIdx !== curQ.answer) {
                        btn.classList.add('incorrect');
                    }
                } else {
                    btn.addEventListener('click', () => handleSelectOption(optIdx));
                }

                if (optionsListEl) optionsListEl.appendChild(btn);
            });

            if (isAnswered && explanationBox && explanationBody) {
                explanationBody.innerHTML = curQ.explanation;
                explanationBox.style.display = 'block';
            } else if (explanationBox) {
                explanationBox.style.display = 'none';
            }

            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) {
                if (currentIndex === quizData.length - 1) {
                    nextBtn.innerHTML = '<span>Xem kết quả</span> <i class="fas fa-check-circle"></i>';
                } else {
                    nextBtn.innerHTML = '<span>Câu tiếp theo</span> <i class="fas fa-arrow-right"></i>';
                }
            }

            renderNavPills();
        }

        function handleSelectOption(selectedIdx) {
            if (userAnswers[currentIndex] !== undefined) return;
            userAnswers[currentIndex] = selectedIdx;
            calculateScore();
            renderQuestion();
        }

        function showResults() {
            if (quizCard) quizCard.style.display = 'none';
            if (quizControls) quizControls.style.display = 'none';
            if (resultCard) resultCard.style.display = 'block';

            if (finalScoreEl) finalScoreEl.textContent = score;

            let msg = '';
            if (score === 10) {
                msg = '🎉 Xuất sắc! Bạn đã nắm vững 100% kiến thức về 2 nguyên lý và 6 cặp phạm trù của phép biện chứng duy vật. Bạn đã sẵn sàng đạt điểm tuyệt đối!';
            } else if (score >= 8) {
                msg = '👏 Rất tốt! Bạn nắm rất vững kiến thức trọng tâm. Hãy đọc lại đề cương các câu chưa đúng để hoàn thiện tối đa nhé.';
            } else if (score >= 5) {
                msg = '👍 Khá tốt! Bạn đã hiểu được các khái niệm cơ bản. Hãy dành thêm chút thời gian xem lại các cặp phạm trù chuyên sâu để nâng cao điểm số.';
            } else {
                msg = '📖 Cần cố gắng thêm! Hãy xem lại phần lý thuyết các nguyên lý và phạm trù bên trên rồi thử sức lại lần nữa nhé!';
            }
            if (finalMessageEl) finalMessageEl.textContent = msg;
        }

        function resetQuiz() {
            for (const k in userAnswers) delete userAnswers[k];
            currentIndex = 0;
            score = 0;
            if (currentScoreEl) currentScoreEl.textContent = '0';
            if (quizCard) quizCard.style.display = 'block';
            if (quizControls) quizControls.style.display = 'flex';
            if (resultCard) resultCard.style.display = 'none';
            renderQuestion();
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    renderQuestion();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < quizData.length - 1) {
                    currentIndex++;
                    renderQuestion();
                } else {
                    showResults();
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                resetQuiz();
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', resetQuiz);
        }

        renderQuestion();
    }

    window.quizData = quizData;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
