let currentUser = null;
let appUiInitialized = false;

function switchPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    if (page.id === pageId) {
      page.classList.add("active");
      page.classList.remove("hidden");
    } else {
      page.classList.remove("active");
      page.classList.add("hidden");
    }

    const peopleSearchSection = document.getElementById("peopleSearchSection");
  if (peopleSearchSection) {
    peopleSearchSection.style.display =
      pageId === "peoplePage" ? "block" : "none";
  }
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  // Навешиваем обработчики ТОЛЬКО один раз!
  if (!appUiInitialized) {
    appUiInitialized = true;
    setupEventHandlers();
  }
  // Запуск приложения после авторизации
  await checkAuth();
});

function setupEventHandlers() {
  // Навигация
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", async () => {
      const page = item.getAttribute("data-page");
      currentPage = page;
      setPageTitle(page);
      document
        .querySelectorAll(".nav-item")
        .forEach((ni) => ni.classList.remove("active"));
      item.classList.add("active");

      switch (page) {
        case "news":
          switchPage("newsPage");
          await renderNews();
          break;
        case "discussions":
          switchPage("discussionsPage");
          await renderDiscussions();
          break;
        case "people":
          switchPage("peoplePage");
          await renderPeoplePage();
          break;
        case "friends":
          switchPage("friendsPage");
          await renderFriendsPage();
          break;
        case "messages":
          switchPage("messagesPage");
          await renderMessagesPage();
          break;
        case "suggest":
          switchPage("suggestPage");
          await renderSuggestPage();
          break;
        case "profile":
          switchPage("profilePage");
          await renderProfilePage();
          break;
        case "admin":
          switchPage("adminPage");
          await renderAdminPanel();
          break;
      }
    });
  });

  // Селектор города
  const citySelector = document.getElementById("citySelectorDropdown");
  if (citySelector) {
    citySelector.addEventListener("change", (e) => {
      const value = e.target.value;

      if (value === "myCity") {
        selectedCity = null;
      } else if (value === "allCities") {
        selectedCity = "all";
      } else {
        selectedCity = value;
      }

      if (currentPage === "news") renderNews();
      if (currentPage === "discussions") renderDiscussions();
    });
  }

  const cityInput = document.getElementById("citySelectorInput");
  if (cityInput) {
    cityInput.addEventListener("change", async () => {
      let value = cityInput.value.trim();

      if (!value || value.toLowerCase() === "мой город") {
        selectedCity = null; // использовать currentUser.city
      } else if (value.toLowerCase() === "все города") {
        selectedCity = ""; // твоя логика "все города" (если нужна)
      } else {
        selectedCity = value; // конкретный выбранный/введённый город
      }

      await renderNews();
      await renderDiscussions();
    });
  }
  initSidebarCityControls();
  // Модалки (пример)
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) modal.style.display = "none";
    });
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  });

  // Меню пользователя
  document.getElementById("headerLogoutBtn").addEventListener("click", logout);
  document
    .getElementById("headerUserTrigger")
    .addEventListener("click", toggleUserMenu);
}

async function checkAuth() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const profile = await getUserProfile(session.user.id);
      if (profile) {
        currentUser = {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          city: profile.city,
          avatar: profile.avatar || "👤",
          bio: profile.bio,
          is_admin: profile.is_admin,
          admin_city: profile.admin_city,
          interests: profile.interests || [],
        };
        showMainApp();
      }
    }
  } catch (error) {
    console.error("Auth check error:", error);
  }
}

function showMainApp() {
  selectedCity = null;

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");

  document.getElementById("headerUserName").textContent =
    `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById("headerUserAvatar").textContent = currentUser.avatar;
  document.getElementById("headerUserCity").textContent = currentUser.city;

  if (currentUser.is_admin) {
    document.getElementById("adminNavItem").classList.remove("hidden");
    document.getElementById("suggestNavItem").classList.add("hidden");
  } else {
    document.getElementById("adminNavItem").classList.add("hidden");
    document.getElementById("suggestNavItem").classList.remove("hidden");
  }

  // стартовая страница
  currentPage = "news";
  switchPage("newsPage");
  setPageTitle("news");

  populateSidebarCitiesDatalist();
  renderNews();
  renderDiscussions();
}


function toggleUserMenu() {
  const menu = document.getElementById("headerDropdownMenu");
  menu.classList.toggle("hidden");
}

async function logout() {
  try {
    await supabase.auth.signOut();
    currentUser = null;
    document.getElementById("mainApp").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    alert("Вы вышли из аккаунта");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

function setPageTitle(page) {
  const titleMap = {
    news: "Новости",
    discussions: "Обсуждения",
    polls: "Опросы",
    profile: "Профиль",
    friends: "Друзья",
    messages: "Сообщения",
    people: "Люди",
    admin: "Админ-панель",
    suggest: "Предложения",
  };
  document.getElementById("pageTitle").textContent = titleMap[page] || "";
}

