import React, { useEffect, useRef } from "react";

const Fireflies = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let fireflies = [];

    const numFireflies = 110;

    // =======================================
    // QUẢN LÝ TƯƠNG TÁC CHUỘT (MOUSE)
    // =======================================
    const mouse = {
      x: 0,
      y: 0,
      radius: 120, // Bán kính vùng từ trường né chuột
      active: false,
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    const resizeCanvas = () => {
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // =======================================
    // LỚP "ĐOM ĐÓM" (FIREFLY CLASS)
    // =======================================
    class Firefly {
      // Nhận vai trò từ lúc sinh ra (Vệ sĩ hoặc Lãng khách)
      constructor(isSeeker) {
        this.isSeeker = isSeeker;
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 1.5;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = Math.random();
        this.fadeSpeed = Math.random() * 0.02 + 0.01;

        this.isPerched = false;
        this.perchTime = 0;
      }

      update() {
        const btn = document.getElementById("explore-btn");
        let btnRect = null;
        let canvasRect = canvas.getBoundingClientRect();

        if (btn) {
          const rect = btn.getBoundingClientRect();
          btnRect = {
            left: rect.left - canvasRect.left,
            right: rect.right - canvasRect.left,
            top: rect.top - canvasRect.top,
            bottom: rect.bottom - canvasRect.top,
            width: rect.width,
            height: rect.height,
            centerX: (rect.left + rect.right) / 2 - canvasRect.left,
            centerY: (rect.top + rect.bottom) / 2 - canvasRect.top,
          };
        }

        // --- 1. LOGIC ĐANG ĐẬU TRÊN NÚT ---
        if (this.isPerched) {
          this.perchTime--;

          this.opacity += this.fadeSpeed;
          if (this.opacity >= 1 || this.opacity <= 0.1) this.fadeSpeed *= -1;

          if (this.perchTime <= 0 || !btn) {
            this.isPerched = false;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
          } else if (btn && btn.matches(":hover")) {
            this.isPerched = false;
            this.vx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 2);
            this.vy = -Math.random() * 4;
          } else if (mouse.active) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
              this.isPerched = false;
            }
          }
          return;
        }

        // --- 2. LOGIC NÉ CHUỘT ---
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            const pushStrength = 1.2;

            this.vx += Math.cos(angle) * force * pushStrength;
            this.vy += Math.sin(angle) * force * pushStrength;
          }
        }

        // --- 3. LOGIC HÚT VỀ CÁI NÚT (CHỈ DÀNH CHO 15 CON "VỆ SĨ") ---
        if (this.isSeeker && btnRect && !mouse.active) {
          const dx = btnRect.centerX - this.x;
          const dy = btnRect.centerY - this.y;
          const distanceToBtn = Math.sqrt(dx * dx + dy * dy);

          if (distanceToBtn > 100) {
            this.vx += (dx / distanceToBtn) * 0.04;
            this.vy += (dy / distanceToBtn) * 0.04;
          }
        }

        // --- 4. QUỸ ĐẠO BAY TỰ NHIÊN & GIỚI HẠN TỐC ĐỘ ---
        this.angle += (Math.random() - 0.5) * 0.3;
        this.x += this.vx + Math.cos(this.angle) * 0.3;
        this.y += this.vy + Math.sin(this.angle) * 0.3;

        this.vx *= 0.95;
        this.vy *= 0.95;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.4) {
          this.vx += (Math.random() - 0.5) * 0.2;
          this.vy += (Math.random() - 0.5) * 0.2;
        }

        this.opacity += this.fadeSpeed;
        if (this.opacity >= 1 || this.opacity <= 0.1) this.fadeSpeed *= -1;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // --- 5. LOGIC TÌM NÚT ĐỂ HẠ CÁNH ---
        // Vệ sĩ có tỷ lệ đậu là 0.02 (rất hay đậu), Lãng khách là 0.0005 (gần như không bao giờ đậu)
        const perchChance = this.isSeeker ? 0.02 : 0.0005;

        if (btnRect && !btn.matches(":hover") && Math.random() < perchChance) {
          if (
            this.x > btnRect.left - 60 &&
            this.x < btnRect.right + 60 &&
            this.y > btnRect.top - 60 &&
            this.y < btnRect.bottom + 60
          ) {
            let distanceToMouse = 999;
            if (mouse.active) {
              const mDx = this.x - mouse.x;
              const mDy = this.y - mouse.y;
              distanceToMouse = Math.sqrt(mDx * mDx + mDy * mDy);
            }

            if (distanceToMouse > mouse.radius) {
              this.isPerched = true;
              this.perchTime = Math.random() * 300 + 200;

              this.x = btnRect.left + Math.random() * btnRect.width;
              this.y = btnRect.top + Math.random() * (btnRect.height / 2);
            }
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 230, 138, ${this.opacity})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#D4A373";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // KHỞI TẠO ĐÀN ĐOM ĐÓM: 15 Vệ sĩ, 85 Lãng khách
    for (let i = 0; i < numFireflies; i++) {
      // i < 15 sẽ trả về true (Vệ sĩ), từ 15 trở đi trả về false (Lãng khách)
      fireflies.push(new Firefly(i < 25));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fireflies.forEach((firefly) => {
        firefly.update();
        firefly.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
    />
  );
};

export default Fireflies;
