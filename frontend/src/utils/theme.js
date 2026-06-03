// Initialize theme variables
export function initializeTheme() {
  document.documentElement.classList.add("no-transition");

  const theme = localStorage.getItem("theme");
  let isDark;

  if (theme === "dark") {
    isDark = true;
  } else if (theme === "light") {
    isDark = false;
  } else {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if (isDark) {
    document.documentElement.style.setProperty("--color-mkhe-bg", "#1a0f0a");
    document.documentElement.style.setProperty("--color-mkhe-text", "#d9c5b2");
    document.documentElement.style.setProperty("--color-mkhe-input", "#2a1c14");
    document.documentElement.style.setProperty(
      "--color-mkhe-border",
      "#4a3525",
    );
  }

  requestAnimationFrame(() => {
    document.documentElement.classList.remove("no-transition");
  });
}

// Apply theme changes with CSS variables
export function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.style.setProperty("--color-mkhe-bg", "#1a0f0a");
    document.documentElement.style.setProperty("--color-mkhe-text", "#d9c5b2");
    document.documentElement.style.setProperty("--color-mkhe-input", "#2a1c14");
    document.documentElement.style.setProperty(
      "--color-mkhe-border",
      "#4a3525",
    );
  } else {
    document.documentElement.style.setProperty("--color-mkhe-bg", "#f5f0ea");
    document.documentElement.style.setProperty("--color-mkhe-text", "#2d1e12");
    document.documentElement.style.setProperty("--color-mkhe-input", "#e4d5c7");
    document.documentElement.style.setProperty(
      "--color-mkhe-border",
      "#c8b6a6",
    );
  }
}
