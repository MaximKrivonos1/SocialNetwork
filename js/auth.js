document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    // 1. Вход через Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (authError) throw authError;

    // 2. Запрос профиля пользователя
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError) throw userError;

    currentUser = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      city: userData.city,
      avatar: userData.avatar,
      bio: userData.bio,
      interests: userData.interests,
      is_admin: userData.is_admin,
      admin_city: userData.admin_city,
    };

    showMainApp();
  } catch (error) {
    console.error("Login error:", error);
    showError("loginError", "Неверный email или пароль");
  }
});

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName = document.getElementById("registerLastName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const city = document.getElementById("registerCity").value.trim();
    const citiesListOptions = Array.from(
      document.getElementById("citiesList").options
    ).map((opt) => opt.value.toLowerCase());

    if (city.length < 2) {
      showCityError("Название города слишком короткое.");
      return;
    }

    if (!citiesListOptions.includes(city.toLowerCase())) {
      if (!confirm("Такого города ещё нет. Добавить как новый?")) {
        showCityError("Проверьте название города.");
        return;
      }
    }

    try {
      // 1. Регистрация через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            city: city,
          },
        },
      });

      if (authError) throw authError;

      // 2. Добавление в дополнительную таблицу users
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          city: city,
          avatar: "👤",
          bio: "",
          interests: [],
          is_admin: false,
        },
      ]);

      if (insertError) throw insertError;

      currentUser = {
        id: authData.user.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
        city: city,
        avatar: "👤",
        is_admin: false,
      };

      showMainApp();
    } catch (error) {
      console.error("Registration error:", error);
      showError("registerError", error.message || "Ошибка регистрации");
    }
  });

document.getElementById("showRegister").addEventListener("click", async () => {
  document.getElementById("loginForm").parentElement.classList.add("hidden");
  document.getElementById("registerBox").classList.remove("hidden");
  // Новый код загрузки всех городов:
  const cities = await fetchCitiesList();
  const citiesList = document.getElementById("citiesList");
  citiesList.innerHTML = cities
    .map((city) => `<option value="${city}">`)
    .join("");
});

document.getElementById("showLogin").addEventListener("click", () => {
  document.getElementById("registerBox").classList.add("hidden");
  document.getElementById("loginForm").parentElement.classList.remove("hidden");
});

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  setTimeout(() => errorEl.classList.add("hidden"), 3000);
}

async function fetchCitiesList() {
  const { data, error } = await supabase
    .from("users")
    .select("city")
    .neq("city", "")
    .order("city");
  if (error) return [];
  return [
    ...new Set((data || []).map((row) => row.city.trim()).filter(Boolean)),
  ].sort();
}

// Быстрый вывод ошибок для поля города:
function showCityError(message) {
  showError("registerCityError", message);
}
