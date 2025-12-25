
let selectedCity = null;
let currentPage = "news";
let pollOptions = [];
let newsFilter = { topics: [], sortBy: "newest", dateRange: "all" };
let discussionsFilter = { topics: [], sortBy: "newest", dateRange: "all" };

function createFiltersBar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (container.querySelector(`#filtersBar-${containerId}`)) return;

  const filtersBar = document.createElement("div");
  filtersBar.id = `filtersBar-${containerId}`;
  filtersBar.style.cssText = `
    display:flex;gap:12px;align-items:center;margin-bottom:16px;
    padding:8px 10px;background:#f8fafc;border-radius:8px;
    border:1px solid #e2e8f0;font-size:13px;
  `;

  filtersBar.innerHTML = `
  <p style="font-size:15px;">Фильтровать по: </p>
    <!-- Темы -->
    <div style="position:relative;">
      <div id="topicsFilterToggle-${containerId}" style="
        border:1px solid #d1d5db;border-radius:6px;padding:6px 10px;
        cursor:pointer;background:white;min-width:120px;
        display:flex;justify-content:space-between;align-items:center;">
        <span id="topicsFilterLabel-${containerId}" style="color:#6b7280;">Теме</span>
        <span style="font-size:11px;color:#9ca3af;">▼</span>
      </div>
      <div id="topicsFilterMenu-${containerId}" style="
        position:absolute;z-index:20;top:100%;left:0;right:0;
        background:white;border:1px solid #d1d5db;border-radius:6px;
        margin-top:4px;padding:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);
        display:none;max-height:180px;overflow:auto;">
        <label style="display:block;margin-bottom:4px;"><input type="checkbox" name="topicFilter" value="благоустройство"> Благоустройство</label>
        <label style="display:block;margin-bottom:4px;"><input type="checkbox" name="topicFilter" value="мероприятия"> Мероприятия</label>
        <label style="display:block;margin-bottom:4px;"><input type="checkbox" name="topicFilter" value="проблемы"> Проблемы</label>
        <label style="display:block;margin-bottom:4px;"><input type="checkbox" name="topicFilter" value="происшествия"> Происшествия</label>
        <label style="display:block;margin-bottom:4px;"><input type="checkbox" name="topicFilter" value="другое"> Другое</label>
      </div>
    </div>

    <!-- Активность -->
    <select id="activityFilter-${containerId}" style="
      border:1px solid #d1d5db;border-radius:6px;padding:6px 10px;
      background:white;font-size:13px;">
      <option value="newest">Свежее</option>
      <option value="likes">По лайкам</option>
      <option value="comments">По комментариям</option>
    </select>

    <!-- Дата -->
    <div style="position:relative;">
      <div id="dateFilterToggle-${containerId}" style="
        border:1px solid #d1d5db;border-radius:6px;padding:6px 10px;
        cursor:pointer;background:white;min-width:90px;
        display:flex;justify-content:space-between;align-items:center;">
        <span id="dateFilterLabel-${containerId}" style="color:#6b7280;">Дате</span>
        <span style="font-size:11px;color:#9ca3af;">▼</span>
      </div>
      <div id="dateFilterMenu-${containerId}" style="
        position:absolute;z-index:20;top:100%;left:0;right:0;
        background:white;border:1px solid #d1d5db;border-radius:6px;
        margin-top:4px;padding:8px;display:none;">
        <label style="display:block;margin-bottom:4px;"><input type="radio" name="dateRange-${containerId}" value="day"> За день</label>
        <label style="display:block;margin-bottom:4px;"><input type="radio" name="dateRange-${containerId}" value="week"> За неделю</label>
        <label style="display:block;margin-bottom:4px;"><input type="radio" name="dateRange-${containerId}" value="month"> За месяц</label>
      </div>
    </div>

    <button id="resetFiltersBtn-${containerId}" style="
      padding:6px 10px;background:#f3f4f6;border:1px solid #d1d5db;
      border-radius:6px;font-size:12px;color:#6b7280;cursor:pointer;">
      Сбросить
    </button>
  `;

  container.prepend(filtersBar);
  initFiltersBar(containerId);
}

function initFiltersBar(containerId) {
  const isNews = containerId === "newsList";

  const topicsToggle = document.getElementById(`topicsFilterToggle-${containerId}`);
  const topicsMenu = document.getElementById(`topicsFilterMenu-${containerId}`);
  const topicsLabel = document.getElementById(`topicsFilterLabel-${containerId}`);
  const activitySelect = document.getElementById(`activityFilter-${containerId}`);
  const dateToggle = document.getElementById(`dateFilterToggle-${containerId}`);
  const dateMenu = document.getElementById(`dateFilterMenu-${containerId}`);
  const dateLabel = document.getElementById(`dateFilterLabel-${containerId}`);
  const resetBtn = document.getElementById(`resetFiltersBtn-${containerId}`);

  const getState = () => (isNews ? newsFilter : discussionsFilter);
  const setState = (upd) => {
    if (isNews) newsFilter = { ...newsFilter, ...upd };
    else discussionsFilter = { ...discussionsFilter, ...upd };
    if (isNews) renderNews(); else renderDiscussions();
  };

  if (topicsToggle && topicsMenu && topicsLabel) {
    topicsToggle.onclick = (e) => {
      e.stopPropagation();
      topicsMenu.style.display = topicsMenu.style.display === "block" ? "none" : "block";
      if (dateMenu) dateMenu.style.display = "none";
    };
    topicsMenu.querySelectorAll('input[name="topicFilter"]').forEach((cb) => {
      cb.onchange = () => {
        const checked = Array.from(
          topicsMenu.querySelectorAll('input[name="topicFilter"]:checked')
        ).map((i) => i.value);
        if (checked.length === 0) {
          topicsLabel.textContent = "Все темы";
          topicsLabel.style.color = "#6b7280";
        } else {
          topicsLabel.textContent = checked.length === 1 ? checked[0] : `Тем: ${checked.length}`;
          topicsLabel.style.color = "#000";
        }
        setState({ topics: checked });
      };
    });
  }

  if (activitySelect) {
    activitySelect.onchange = () => {
      setState({ sortBy: activitySelect.value });
    };
  }

  if (dateToggle && dateMenu && dateLabel) {
    dateToggle.onclick = (e) => {
      e.stopPropagation();
      dateMenu.style.display = dateMenu.style.display === "block" ? "none" : "block";
      if (topicsMenu) topicsMenu.style.display = "none";
    };
    dateMenu.querySelectorAll(`input[name="dateRange-${containerId}"]`).forEach((radio) => {
      radio.onchange = () => {
        const m = { day: "За день", week: "За неделю", month: "За месяц" };
        dateLabel.textContent = m[radio.value] || "Все даты";
        dateMenu.style.display = "none";
        setState({ dateRange: radio.value });
      };
    });
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      const state = { topics: [], sortBy: "newest", dateRange: "all" };
      if (isNews) newsFilter = state; else discussionsFilter = state;
      topicsLabel.textContent = "Все темы";
      topicsLabel.style.color = "#6b7280";
      activitySelect.value = "newest";
      dateLabel.textContent = "Все даты";
      topicsMenu.querySelectorAll('input[name="topicFilter"]').forEach((cb) => (cb.checked = false));
      if (isNews) renderNews(); else renderDiscussions();
    };
  }

  document.addEventListener("click", (e) => {
    const bar = document.getElementById(`filtersBar-${containerId}`);
    if (!bar) return;
    if (!bar.contains(e.target)) {
      if (topicsMenu) topicsMenu.style.display = "none";
      if (dateMenu) dateMenu.style.display = "none";
    }
  });
}

// ============================================
// НОВОСТИ
// ============================================

async function renderNews() {
  const city =
    selectedCity !== null && selectedCity !== ""
      ? selectedCity
      : currentUser.city;
  console.log("renderNews");
  if (!currentUser) return;

  const container = document.getElementById("newsList");
  if (!container) return;

  // создаём панель фильтров один раз
  if (!container.querySelector("#filtersBar-newsList")) {
    createFiltersBar("newsList");
  }

  // отдельный контейнер для самих новостей
  let list = container.querySelector(".news-items");
  if (!list) {
    list = document.createElement("div");
    list.className = "news-items";
    container.appendChild(list);
  }
  list.innerHTML =
    '<div style="text-align: center; padding: 40px; color: #999;">⏳ Загрузка...</div>';

  try {
    let newsData = await getNews(city);

    // Фильтр по темам
    if (newsFilter.topics.length > 0) {
      newsData = newsData.filter((n) =>
        newsFilter.topics.includes(n.topic)
      );
    }

    // Фильтр по дате
    if (newsFilter.dateRange !== "all") {
      const now = new Date();
      let cutoff;
      if (newsFilter.dateRange === "day") {
        cutoff = new Date(now - 24 * 60 * 60 * 1000);
      } else if (newsFilter.dateRange === "week") {
        cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000);
      } else if (newsFilter.dateRange === "month") {
        cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000);
      }
      newsData = newsData.filter((n) => new Date(n.timestamp) >= cutoff);
    }

    // Сортировка по активности
    if (newsFilter.sortBy === "likes") {
      newsData.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (newsFilter.sortBy === "comments") {
      newsData.sort(
        (a, b) => (b.comments_count || 0) - (a.comments_count || 0)
      );
    } else {
      newsData.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    }

    list.innerHTML = "";

    if (newsData.length === 0) {
      list.innerHTML =
        '<div style="text-align: center; color: #999; padding: 40px;">📰 Нет новостей</div>';
    } else {
      for (const news of newsData) {
        if (!news.author && news.author_id) {
          news.author = await getUserProfile(news.author_id);
        }
        const commentCount = await getCommentCount("news", news.id);
        list.appendChild(createNewsElement(news, commentCount));
      }
    }
  } catch (error) {
    console.error("Error:", error);
    list.innerHTML =
      '<div style="text-align: center; color: red; padding: 40px;">Ошибка загрузки новостей</div>';
  }

  initAdminNewsForm();
}


function createNewsElement(news, commentCount) {
  console.log(currentUser);
  const div = document.createElement("div");
  div.style.cssText = `
    position: relative;
    background: white;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;

  const author = news.author || {};
  const avatar = author.avatar_url || "👤";

  const topicHtml = news.topic
    ? `
      <div style="margin-bottom: 8px;">
        <span style="
          display:inline-block;
          padding:3px 10px;
          border-radius:999px;
          background:#e0f7fb;
          color:#036672;
          font-size:11px;
          font-weight:600;
        ">
          ${news.topic}
        </span>
      </div>
    `
    : "";

  div.innerHTML = `
    <div class="user-profile-cont">
      <div
        class="user-profile"
        data-user-id="${news.author_id}"
        style="${author.avatar_url
      ? `background-image: url('${author.avatar_url}');
               background-size: cover;
               background-position: center;
               width: 40px;
               height: 40px;
               border-radius: 50%;`
      : "font-size: 40px; width: 40px; height: 40px; border-radius: 50%; display:flex;align-items:center;justify-content:center;background:#e6e9ef;"
    }"
      >
        ${!author.avatar_url ? avatar : ""}
      </div>

      <div style="flex: 1;">
        <div
          style="font-weight: 600; cursor: pointer; color: #0066cc;"
          class="user-profile"
          data-user-id="${news.author_id}"
        >
          ${author.first_name} ${author.last_name}
        </div>
        <div style="font-size: 12px; color: #999;">
          ${author.city} • ${formatDateTime(news.timestamp)}
        </div>
      </div>
    </div>

    ${topicHtml}

    <div style="margin-bottom: 15px; line-height: 1.6; color: #333; word-wrap: break-word;">
      ${news.content}
    </div>

    ${news.image_url
      ? `<img src="${news.image_url}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; cursor: pointer;" onclick="window.open('${news.image_url}', '_blank')">`
      : ""
    }

    <div style="display: flex; gap: 15px; padding-top: 12px; border-top: 1px solid #eee;">
      <button class="like-btn" data-news-id="${news.id}" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #666;">
        ❤️ ${news.likes}
      </button>
      <button class="comment-btn" data-news-id="${news.id}" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #666;">
        💬 ${commentCount}
      </button>
    </div>

    <div id="comments-${news.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;"></div>
  `;

  if (currentUser && currentUser.is_admin) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-post-btn";
    delBtn.title = "Удалить новость";
    delBtn.innerHTML = "&times;";
    delBtn.onclick = async () => {
      if (confirm("Удалить новость навсегда?")) {
        await deleteNews(news.id);
        renderNews();
      }
    };
    delBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      background: transparent;
      color: #b0b0b0;
      border: none;
      font-size: 28px;
      line-height: 24px;
      cursor: pointer;
      padding: 0 6px;
      border-radius: 50%;
      transition: background 0.2s,color 0.2s;
    `;
    delBtn.onmouseenter = () => {
      delBtn.style.background = "#ffeaea";
      delBtn.style.color = "#e63946";
    };
    delBtn.onmouseleave = () => {
      delBtn.style.background = "transparent";
      delBtn.style.color = "#b0b0b0";
    };
    div.appendChild(delBtn);
  }

  div.querySelectorAll(".user-profile").forEach((el) => {
    el.addEventListener("click", () => showUserProfile(news.author_id));
  });

  div.querySelector(".like-btn").addEventListener("click", async () => {
    await likeContent("news", news.id);
    renderNews();
  });

  div.querySelector(".comment-btn").addEventListener("click", async () => {
    const commentsDiv = div.querySelector(`#comments-${news.id}`);
    commentsDiv.style.display =
      commentsDiv.style.display === "none" ? "block" : "none";
    if (commentsDiv.style.display === "block") {
      await loadComments("news", news.id, commentsDiv);
    }
  });

  return div;
}


function initAdminNewsForm() {
  const btn = document.getElementById("showAddNewsBtn");
  const form = document.getElementById("addNewsForm");
  const submitBtn = document.getElementById("submitNewsBtn");
  const cancelBtn = document.getElementById("cancelNewsBtn");

  if (!btn || !form) return;

  if (currentUser && currentUser.is_admin) {
    btn.style.display = "inline-block";
  } else {
    btn.style.display = "none";
    return;
  }

  btn.onclick = () => {
    form.style.display = "block";
    btn.style.display = "none";
  };

  cancelBtn.onclick = () => {
    form.style.display = "none";
    btn.style.display = "inline-block";
    document.getElementById("newsContentInput").value = "";
    const photoInput = document.getElementById("newsPhotoInput");
    if (photoInput) photoInput.value = "";
    const topicInput = document.getElementById("newsTopicInput");
    if (topicInput) topicInput.value = "";
  };

  submitBtn.onclick = async () => {
    const content = document.getElementById("newsContentInput").value.trim();
    if (!content) {
      alert("Введите текст новости");
      return;
    }

    const topicInput = document.getElementById("newsTopicInput");
    const topic =
      topicInput && topicInput.value.trim()
        ? topicInput.value.trim()
        : null;

    submitBtn.disabled = true;
    submitBtn.textContent = "⏳...";

    try {
      let imageUrl = null;
      const photoInput = document.getElementById("newsPhotoInput");
      const photoFile =
        photoInput && photoInput.files && photoInput.files[0]
          ? photoInput.files[0]
          : null;
      if (photoFile) {
        imageUrl = await uploadPhoto(photoFile, "posts");
      }

      await addNews(content, imageUrl, currentUser.city, topic);

      document.getElementById("newsContentInput").value = "";
      if (photoInput) photoInput.value = "";
      if (topicInput) topicInput.value = "";

      form.style.display = "none";
      btn.style.display = "inline-block";
      renderNews();
      alert("✅ Новость опубликована!");
    } catch (error) {
      alert("❌ Ошибка: " + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "✅ Опубликовать";
    }
  };
}



// ============================================
// ОБСУЖДЕНИЯ
// ============================================

async function renderDiscussions() {
  const city =
    selectedCity !== null && selectedCity !== ""
      ? selectedCity
      : currentUser.city;
  console.log("renderDiscussions");
  if (!currentUser) return;

  const container = document.getElementById("discussionsList");
  if (!container) return;

  // создаём панель фильтров один раз
  if (!container.querySelector("#filtersBar-discussionsList")) {
    createFiltersBar("discussionsList");
  }

  // отдельный контейнер для обсуждений/опросов
  let list = container.querySelector(".discussions-items");
  if (!list) {
    list = document.createElement("div");
    list.className = "discussions-items";
    container.appendChild(list);
  }
  list.innerHTML =
    '<div style="text-align: center; padding: 40px; color: #999;">⏳ Загрузка...</div>';

  try {
    const discussions = await getDiscussions(city);

    // все опросы выбранного города
    const { data: polls, error: pollsError } = await supabase
      .from("polls")
      .select("*")
      .eq("city", city);

    if (pollsError) throw pollsError;

    const pollEnriched = await Promise.all(
      (polls || []).map(async (p) => {
        p.poll_author = p.suggested_by
          ? await getUserProfile(p.suggested_by)
          : {};
        p._userVote = currentUser
          ? await userPollVoteIndex(p.id, currentUser.id)
          : null;
        p._voteData = await getPollVotes(p.id);
        return p;
      })
    );

    let combined = [
      ...discussions.map((d) => ({ ...d, type: "discussion" })),
      ...pollEnriched.map((p) => ({ ...p, type: "poll" })),
    ];

    // фильтр по темам
    if (discussionsFilter.topics.length > 0) {
      combined = combined.filter((item) =>
        discussionsFilter.topics.includes(item.topic)
      );
    }

    // фильтр по дате
    if (discussionsFilter.dateRange !== "all") {
      const now = new Date();
      let cutoffDate;
      if (discussionsFilter.dateRange === "day") {
        cutoffDate = new Date(now - 24 * 60 * 60 * 1000);
      } else if (discussionsFilter.dateRange === "week") {
        cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      } else if (discussionsFilter.dateRange === "month") {
        cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      }
      combined = combined.filter(
        (item) => new Date(item.timestamp) >= cutoffDate
      );
    }

    // сортировка по активности
    if (discussionsFilter.sortBy === "likes") {
      combined.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (discussionsFilter.sortBy === "comments") {
      combined.sort(
        (a, b) => (b.comments_count || 0) - (a.comments_count || 0)
      );
    } else {
      combined.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    }

    if (combined.length === 0) {
      list.innerHTML =
        '<div style="text-align: center; color: #999; padding: 40px;">💬 Нет обсуждений</div>';
      return;
    }

    // подсчёт комментариев
    const commentCounts = await Promise.all(
      combined.map(async (item) => {
        if (item.type === "discussion") {
          return await getCommentCount("discussion", item.id);
        } else if (item.type === "poll") {
          return await getCommentCount("poll", item.id);
        }
        return 0;
      })
    );

    list.innerHTML = "";

    for (let idx = 0; idx < combined.length; idx++) {
      const item = combined[idx];
      const commentCount = commentCounts[idx];
      if (item.type === "discussion") {
        list.appendChild(createDiscussionElement(item, commentCount));
      } else if (item.type === "poll") {
        list.appendChild(createPollElementSync(item, commentCount));
      }
    }
  } catch (error) {
    console.error("Error:", error);
    list.innerHTML =
      '<div style="color:red;padding:40px;">Ошибка загрузки</div>';
  }

  initAdminDiscussionForm();
}


// Голоса в poll_votes
async function getPollVotes(pollId) {
  const { data: votes, error } = await supabase
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId);

  if (error || !votes) return { result: {}, totalCount: 0 };
  const result = {};
  for (const v of votes) {
    result[v.option_id] = (result[v.option_id] || 0) + 1;
  }
  return { result, totalCount: votes.length };
}

async function userPollVoteIndex(pollId, userId) {
  const { data, error } = await supabase
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return data.option_id;
}

async function votePollDb(pollId, optionIdx) {
  const { data, error } = await supabase
    .from("poll_votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("user_id", currentUser.id)
    .single();
  if (data) {
    alert("Вы уже голосовали!");
    return;
  }

  const { error: insertError } = await supabase.from("poll_votes").insert([
    {
      poll_id: pollId,
      user_id: currentUser.id,
      option_id: optionIdx,
      timestamp: new Date().toISOString(),
    },
  ]);
  if (insertError) alert("Ошибка отправки голоса: " + insertError.message);
}

function createPollElementSync(poll, commentCount = 0) {
  const div = document.createElement("div");
  div.className = "poll-block personal-post";
  div.style.cssText = `
    position: relative;
    background: white;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;

  const userVote = poll._userVote;
  const voteData = poll._voteData;

  const author = poll.poll_author || {};
  const avatar = author.avatarurl || author.avatar_url || author.avatar || "👤";

  const authorHtml = `
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">
      <div class="user-profile" data-user-id="${author.id || ""}"
        style="${avatar !== "👤"
      ? `background-image:url('${avatar}');background-size:cover;background-position:center;width:40px;height:40px;border-radius:50%;`
      : "font-size: 36px; width: 40px; height: 40px; border-radius: 50%; display:flex;align-items:center;justify-content:center;background:#e6e9ef;"
    }"
      >${avatar === "👤" ? avatar : ""}</div>
      <div style="flex:1;">
        <div style="font-weight:600;cursor:pointer;color:#0066cc;" class="user-profile" data-user-id="${author.id || ""}">
          ${author.first_name || "-"} ${author.last_name || ""}  
        </div>
        <div style="font-size:12px;color:#999;">${author.city || ""} • ${formatDateTime(poll.timestamp)}</div>
      </div>
    </div>
  `;

  // ✅ НОВОЕ: блок с темой
  const topicHtml = poll.topic
    ? `
      <div style="margin-bottom: 12px;">
        <span style="
          display:inline-block;
          padding:4px 12px;
          border-radius:999px;
          background:#e0f7fb;
          color:#036672;
          font-size:12px;
          font-weight:600;
        ">
          ${poll.topic}
        </span>
      </div>
    `
    : "";

  let optionsHtml = "";
  (poll.options || []).forEach((opt, idx) => {
    const votes =
      voteData.result && voteData.result[idx] ? voteData.result[idx] : 0;
    const percent =
      voteData.totalCount > 0
        ? Math.round((votes / voteData.totalCount) * 100)
        : 0;
    if (userVote !== null && userVote !== undefined) {
      optionsHtml += `
        <div class="poll-option-row">
          <span style="flex:1;">${opt.text}</span>
          <div class="poll-bar-outer">
            <div class="poll-bar-fill${userVote === idx ? " poll-bar-fill-voted" : ""}" style="width:${percent}%;">
              <span class="poll-bar-percent">${percent}% (${votes})</span>
              ${userVote === idx ? `<span class="poll-checkmark">&#10003;</span>` : ""}
            </div>
          </div>
        </div>
      `;
    } else {
      optionsHtml += `
        <div class="poll-option-row">
          <button class="poll-option-btn" data-idx="${idx}">${opt.text}</button>
        </div>
      `;
    }
  });

  div.innerHTML = `
    ${authorHtml}
    ${topicHtml}
    <div class="poll-question">${poll.question}</div>
    <div class="poll-options-list" style="margin-bottom:10px;">${optionsHtml}</div>
    <div style="margin-top:8px; color: #888; font-size:13px;">Голосов: ${voteData.totalCount || 0} &nbsp; | &nbsp; 
      <button class="show-comments-btn" style="background:none;border:none;color:#2196f3;cursor:pointer;">
        💬 Комментариев: ${commentCount}
      </button>
    </div>
    <div class="poll-comments-block" style="display:none;margin-top:14px;margin-bottom:4px;"></div>
  `;

  if (currentUser && currentUser.is_admin) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-post-btn";
    delBtn.title = "Удалить опрос";
    delBtn.innerHTML = "&times;";
    delBtn.onclick = async () => {
      if (confirm("Удалить опрос навсегда?")) {
        await deletePoll(poll.id);
        renderDiscussions();
      }
    };
    delBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      background: transparent;
      color: #b0b0b0;
      border: none;
      font-size: 28px;
      line-height: 24px;
      cursor: pointer;
      padding: 0 6px;
      border-radius: 50%;
      transition: background 0.2s,color 0.2s;
    `;
    delBtn.onmouseenter = () => {
      delBtn.style.background = "#ffeaea";
      delBtn.style.color = "#e63946";
    };
    delBtn.onmouseleave = () => {
      delBtn.style.background = "transparent";
      delBtn.style.color = "#b0b0b0";
    };
    div.appendChild(delBtn);
  }

  if (userVote === null || userVote === undefined) {
    div.querySelectorAll(".poll-option-btn").forEach((btn) => {
      btn.onclick = async function () {
        btn.disabled = true;
        await votePollDb(poll.id, parseInt(btn.dataset.idx, 10));
        renderDiscussions();
      };
    });
  }

  const commentsBlock = div.querySelector(".poll-comments-block");
  const btnShowComments = div.querySelector(".show-comments-btn");
  btnShowComments.onclick = async () => {
    if (commentsBlock.style.display === "none") {
      await loadComments("poll", poll.id, commentsBlock);
      commentsBlock.style.display = "block";
    } else {
      commentsBlock.style.display = "none";
    }
  };

  div.querySelectorAll(".user-profile").forEach((el) => {
    el.addEventListener("click", () => {
      if (author.id) showUserProfile(author.id);
    });
  });

  return div;
}


function createDiscussionElement(discussion, commentCount) {
  const div = document.createElement("div");
  div.style.cssText =
    "background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position:relative;";

  const author = discussion.author || {};
  const avatar = author.avatar_url || author.avatar || "👤";

  const topicHtml = discussion.topic
    ? `
      <div style="margin-bottom: 8px;">
        <span style="
          display:inline-block;
          padding:3px 10px;
          border-radius:999px;
          background:#e0f7fb;
          color:#036672;
          font-size:11px;
          font-weight:600;
        ">
          ${discussion.topic}
        </span>
      </div>
    `
    : "";

  div.innerHTML = `
    <div style="display: flex; gap: 12px; margin-bottom: 15px;">
      <div
        class="user-profile"
        data-user-id="${discussion.author_id}"
        style="${author.avatar_url
      ? `background-image: url('${author.avatar_url}');
               background-size: cover;
               background-position: center;
               width: 40px;
               height: 40px;
               border-radius: 50%;`
      : "font-size: 40px; width: 40px; height: 40px; border-radius: 50%; display:flex;align-items:center;justify-content:center;background:#e6e9ef;"
    }"
      >
        ${!author.avatar_url ? avatar : ""}
      </div>
      <div style="flex: 1;">
        <div
          style="font-weight: 600; cursor: pointer; color: #0066cc;"
          class="user-profile"
          data-user-id="${discussion.author_id}"
        >
          ${author.first_name} ${author.last_name}
        </div>
        <div style="font-size: 12px; color: #999;">
          ${author.city} • ${formatDateTime(discussion.timestamp)}
        </div>
      </div>
    </div>

    ${topicHtml}

    <div style="font-weight: 600; font-size: 16px; margin-bottom: 10px; color: black;">
      ${discussion.title}
    </div>

    <div style="margin-bottom: 15px; line-height: 1.6; color: #333; word-wrap: break-word;">
      ${discussion.content}
    </div>

    ${discussion.imageurl
      ? `<img src="${discussion.imageurl}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; cursor: pointer;" onclick="window.open('${discussion.imageurl}', '_blank')">`
      : ""
    }

    <div style="display: flex; gap: 15px; padding-top: 12px; border-top: 1px solid #eee;">
      <button class="like-btn" data-discussion-id="${discussion.id}" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #666;">
        ❤️ ${discussion.likes}
      </button>
      <button class="comment-btn" data-discussion-id="${discussion.id}" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #666;">
        💬 ${commentCount}
      </button>
    </div>

    <div id="comments-${discussion.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;"></div>
  `;
  if (currentUser && currentUser.is_admin) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-post-btn";
    delBtn.title = "Удалить обсуждение";
    delBtn.innerHTML = "&times;";
    delBtn.onclick = async () => {
      if (confirm("Удалить обсуждение навсегда?")) {
        await deleteDiscussion(discussion.id);
        renderDiscussions();
      }
    };
    delBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      background: transparent;
      color: #b0b0b0;
      border: none;
      font-size: 28px;
      line-height: 24px;
      cursor: pointer;
      padding: 0 6px;
      border-radius: 50%;
      transition: background 0.2s,color 0.2s;
    `;
    delBtn.onmouseenter = () => {
      delBtn.style.background = "#ffeaea";
      delBtn.style.color = "#e63946";
    };
    delBtn.onmouseleave = () => {
      delBtn.style.background = "transparent";
      delBtn.style.color = "#b0b0b0";
    };
    div.appendChild(delBtn);
  }

  div.querySelectorAll(".user-profile").forEach((el) => {
    el.addEventListener("click", () => showUserProfile(discussion.author_id));
  });

  div.querySelector(".like-btn").addEventListener("click", async () => {
    await likeContent("discussion", discussion.id);
    renderDiscussions();
  });

  div.querySelector(".comment-btn").addEventListener("click", async () => {
    const commentsDiv = div.querySelector(`#comments-${discussion.id}`);
    commentsDiv.style.display =
      commentsDiv.style.display === "none" ? "block" : "none";
    if (commentsDiv.style.display === "block") {
      await loadComments("discussion", discussion.id, commentsDiv);
    }
  });

  return div;
}

function initAdminDiscussionForm() {
  const btn = document.getElementById("showAddDiscussionBtn");
  const form = document.getElementById("addDiscussionForm");
  const submitBtn = document.getElementById("submitDiscussionBtn");
  const cancelBtn = document.getElementById("cancelDiscussionBtn");

  if (!btn || !form) return;

  if (currentUser && currentUser.is_admin) {
    btn.style.display = "inline-block";
  } else {
    btn.style.display = "none";
    return;
  }

  btn.onclick = () => {
    form.style.display = "block";
    btn.style.display = "none";
  };

  cancelBtn.onclick = () => {
    form.style.display = "none";
    btn.style.display = "inline-block";
    document.getElementById("discussionTitleInput").value = "";
    document.getElementById("discussionContentInput").value = "";
    const photoInput = document.getElementById("discussionPhotoInput");
    if (photoInput) photoInput.value = "";
    const topicInput = document.getElementById("discussionTopicInput");
    if (topicInput) topicInput.value = "";
  };

  submitBtn.onclick = async () => {
    const title = document.getElementById("discussionTitleInput").value.trim();
    const content = document
      .getElementById("discussionContentInput")
      .value.trim();

    if (!title || !content) {
      alert("Введите заголовок и текст обсуждения");
      return;
    }

    const topicInput = document.getElementById("discussionTopicInput");
    const topic =
      topicInput && topicInput.value.trim()
        ? topicInput.value.trim()
        : null;

    submitBtn.disabled = true;
    submitBtn.textContent = "⏳...";

    try {
      let imageUrl = null;
      const photoInput = document.getElementById("discussionPhotoInput");
      const photoFile =
        photoInput && photoInput.files && photoInput.files[0]
          ? photoInput.files[0]
          : null;
      if (photoFile) {
        imageUrl = await uploadPhoto(photoFile, "posts");
      }

      await addDiscussion(title, content, currentUser.city, imageUrl, topic);

      document.getElementById("discussionTitleInput").value = "";
      document.getElementById("discussionContentInput").value = "";
      if (photoInput) photoInput.value = "";
      if (topicInput) topicInput.value = "";

      form.style.display = "none";
      btn.style.display = "inline-block";
      renderDiscussions();
      alert("✅ Обсуждение создано!");
    } catch (error) {
      alert("❌ Ошибка: " + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "✅ Создать";
    }
  };
}

// ============================================
// ПРЕДЛОЖЕНИЯ (ИСПРАВЛЕНО!)
// ============================================

async function renderSuggestPage() {
  const page = document.getElementById("suggestPage");
  if (!page) return;

  // Удаляем дублирующиеся блоки
  const duplicates = page.querySelectorAll("[data-suggest-block]");
  for (let i = 1; i < duplicates.length; i++) {
    duplicates[i].remove();
  }

  const typeRadios = page.querySelectorAll('input[name="suggestionType"]');
  typeRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const formStandard = page.querySelector("#suggestionFormStandard");
      const pollForm = page.querySelector("#pollCreationForm");
      const pollCheckbox = page.querySelector("#suggestPollCheckbox");

      if (e.target.value === "discussion") {
        if (formStandard) formStandard.style.display = "block";
        if (pollCheckbox)
          pollCheckbox.parentElement.parentElement.style.display = "block";
      } else {
        if (pollCheckbox) {
          pollCheckbox.parentElement.parentElement.style.display = "none";
          pollCheckbox.checked = false;
        }
        if (pollForm) pollForm.style.display = "none";
        if (formStandard) formStandard.style.display = "block";
      }
    });
  });

  const pollCheckbox = page.querySelector("#suggestPollCheckbox");
  if (pollCheckbox) {
    pollCheckbox.addEventListener("change", (e) => {
      const formStandard = page.querySelector("#suggestionFormStandard");
      const pollForm = page.querySelector("#pollCreationForm");

      if (e.target.checked) {
        if (formStandard) formStandard.style.display = "none";
        if (pollForm) pollForm.style.display = "block";
        pollOptions = [];
        addPollOption();
        addPollOption();
      } else {
        if (formStandard) formStandard.style.display = "block";
        if (pollForm) pollForm.style.display = "none";
        pollOptions = [];
      }
    });
  }

  const addPollBtn = page.querySelector("#addPollOptionBtn");
  if (addPollBtn) {
    addPollBtn.onclick = addPollOption;
  }

  document.getElementById("submitSuggestionBtn").onclick = async () =>
    await submitSuggestion();
  document.getElementById("submitPollSuggestionBtn").onclick = async () =>
    await submitPollSuggestion();

  const suggestPhotoInput = document.getElementById("suggestionPhotoUpload");
  let suggestionPhotoUrl = null;
  if (suggestPhotoInput) {
    suggestPhotoInput.onchange = async function () {
      const file = suggestPhotoInput.files[0];
      if (file) {
        suggestionPhotoUrl = await uploadPhoto(file, "posts");
        document.getElementById("suggestionPhotoName").textContent = file.name;
      }
    };
  }
  // Затем при отправке:
  // ...
  // data.imageUrl = suggestionPhotoUrl
  // После публикации формы: suggestionPhotoUrl = null;
}

function addPollOption() {
  const container = document.getElementById("pollOptionsList");
  if (!container) return;

  const optionId = pollOptions.length;
  pollOptions.push("");

  const div = document.createElement("div");
  div.style.cssText = `display: flex; gap: 8px; margin-bottom: 8px;`;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Вариант ${optionId + 1}`;
  input.style.cssText = `flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;`;

  input.addEventListener("change", (e) => {
    pollOptions[optionId] = e.target.value.trim();
  });

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "✕";
  removeBtn.type = "button";
  removeBtn.style.cssText = `padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;`;

  removeBtn.onclick = () => {
    pollOptions.splice(optionId, 1);
    div.remove();
  };

  div.appendChild(input);
  if (pollOptions.length > 2) {
    div.appendChild(removeBtn);
  }

  container.appendChild(div);
}

async function submitSuggestion() {
  const type = document.querySelector(
    'input[name="suggestionType"]:checked'
  ).value;
  const btn = document.getElementById("submitSuggestionBtn");
  const topicInput = document.getElementById("suggestionTopicInput");
  const topic =
    topicInput && topicInput.value.trim()
      ? topicInput.value.trim()
      : null;

  if (type === "news") {
    const content = document
      .getElementById("suggestionContent")
      .value.trim();
    if (!content) {
      alert("Введите текст");
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳...";

    try {
      let imageUrl = null;
      const photoFile =
        document.getElementById("suggestionPhotoUpload").files[0] || null;
      if (photoFile) {
        imageUrl = await uploadPhoto(photoFile, "posts");
      }

      await createSuggestion("news", currentUser.city, {
        content,
        imageUrl,
        topic,
      });

      document.getElementById("suggestionContent").value = "";
      document.getElementById("suggestionPhotoUpload").value = "";
      if (topicInput) topicInput.value = "";
      alert("✅ Предложение отправлено!");
      renderSuggestPage();
    } catch (error) {
      alert(error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Отправить";
    }
  } else if (type === "discussion") {
    const title = document
      .getElementById("suggestionTitle")
      .value.trim();
    const content = document
      .getElementById("suggestionContent")
      .value.trim();
    if (!title || !content) {
      alert("Заполните заголовок и текст");
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳...";

    try {
      let imageUrl = null;
      const photoFile =
        document.getElementById("suggestionPhotoUpload").files[0] || null;
      if (photoFile) {
        imageUrl = await uploadPhoto(photoFile, "posts");
      }

      await createSuggestion("discussion", currentUser.city, {
        title,
        content,
        imageUrl,
        topic,
      });

      document.getElementById("suggestionTitle").value = "";
      document.getElementById("suggestionContent").value = "";
      document.getElementById("suggestionPhotoUpload").value = "";
      if (topicInput) topicInput.value = "";
      alert("✅ Предложение отправлено!");
      renderSuggestPage();
    } catch (error) {
      alert(error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Отправить";
    }
  }
}


async function submitPollSuggestion() {
  const question = document
    .getElementById("pollQuestionInput")
    .value.trim();
  const options = pollOptions
    .filter((o) => o.trim())
    .map((o, i) => ({ id: i, text: o.trim(), votes: 0 }));

  if (!question) {
    alert("Введите вопрос опроса");
    return;
  }
  if (options.length < 2) {
    alert("Минимум 2 варианта ответа");
    return;
  }

  const btn = document.getElementById("submitPollSuggestionBtn");
  const topicInput = document.getElementById("pollTopicInput");
  const topic =
    topicInput && topicInput.value.trim()
      ? topicInput.value.trim()
      : null;

  btn.disabled = true;
  btn.textContent = "⏳...";

  try {
    let imageUrl = null;
    const photoFile =
      document.getElementById("suggestionPhotoUpload").files[0] || null;
    if (photoFile) {
      imageUrl = await uploadPhoto(photoFile, "posts");
    }

    await createSuggestion("poll", currentUser.city, {
      question,
      options,
      imageUrl,
      topic,
    });

    document.getElementById("pollQuestionInput").value = "";
    pollOptions = [];
    document.getElementById("pollOptionsList").innerHTML = "";
    document.getElementById("suggestionPhotoUpload").value = "";
    if (topicInput) topicInput.value = "";

    alert("✅ Опрос отправлен на модерацию!");
    renderSuggestPage();
  } catch (error) {
    alert(error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Отправить опрос";
  }
}


// ============================================
// ДРУЗЬЯ (ИСПРАВЛЕНО!)
// ============================================

async function renderFriendsPage() {
  console.log("renderFriendsPage");
  const container = document.getElementById("friendsList");
  container.innerHTML =
    '<div style="text-align: center; padding: 40px; color: #999;">⏳ Загрузка...</div>';

  try {
    const requests = await getFriendRequests(currentUser.id);
    const friends = await getFriends(currentUser.id);
    console.log("requests:", requests, "friends:", friends);
    let html = "";

    if (requests.length > 0) {
      html += `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                    <h3 style="margin: 0 0 15px 0; color: #856404;">👋 Заявки в друзья (${requests.length})</h3>
                    <div id="requests-list"></div>
                </div>
            `;
    }

    html +=
      '<h3 style="margin: 20px 0 15px 0;">👥 Мои друзья (' +
      friends.length +
      ')</h3><div id="friends-list"></div>';

    container.innerHTML = html;

    // Заявки
    if (requests.length > 0) {
      const requestsList = document.getElementById("requests-list");
      requests.forEach((request) => {
        const div = document.createElement("div");
        div.style.cssText = `background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px;`;

        const avatar = request.avatar_url || request.avatar || "👤";

        div.innerHTML = `
                    <div style="font-size: 32px; flex-shrink: 0; ${request.avatar_url ? `background-image: url('${request.avatar_url}'); width: 32px; height: 32px; border-radius: 50%; background-size: cover; background-position: center;` : ""}">${!request.avatar_url ? avatar : ""}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${request.first_name} ${request.last_name}</div>
                        <div style="font-size: 12px; color: #999;">${request.city}</div>
                    </div>
                    <button class="accept-btn" data-request-id="${request.request_id}" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">✅</button>
                    <button class="reject-btn" data-request-id="${request.request_id}" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">❌</button>
                `;

        div.querySelector(".accept-btn").onclick = async () => {
          if (await acceptFriendRequest(request.request_id)) {
            renderFriendsPage();
          }
        };

        div.querySelector(".reject-btn").onclick = async () => {
          if (await rejectFriendRequest(request.request_id)) {
            renderFriendsPage();
          }
        };

        requestsList.appendChild(div);
      });
    }

    // Друзья
    const friendsList = document.getElementById("friends-list");

    if (friends.length === 0) {
      friendsList.innerHTML =
        '<div style="text-align: center; color: #999; padding: 20px;">🤝 У вас нет друзей</div>';
    } else {
      friends.forEach((friend) => {
        const div = document.createElement("div");
        div.style.cssText = `background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; gap: 15px;`;

        const avatar = friend.avatar_url || friend.avatar || "👤";

        div.innerHTML = `
                    <div style="font-size: 48px; flex-shrink: 0; ${friend.avatar_url ? `background-image: url('${friend.avatar_url}'); width: 48px; height: 48px; border-radius: 50%; background-size: cover; background-position: center; cursor: pointer;` : "cursor: pointer;"}" class="open-profile" data-user-id="${friend.id}">${!friend.avatar_url ? avatar : ""}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 16px; cursor: pointer; color: #0066cc; margin-bottom: 3px;" class="open-profile" data-user-id="${friend.id}">
                            ${friend.first_name} ${friend.last_name}
                        </div>
                        <div style="font-size: 13px; color: #999; margin-bottom: 8px;">${friend.city}</div>
                        <div style="font-size: 14px; color: #555; margin-bottom: 12px;">
                            ${friend.bio || "Нет описания"}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="write-msg-btn" data-user-id="${friend.id}" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">💬</button>
                            <button class="remove-friend-btn" data-user-id="${friend.id}" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">❌</button>
                        </div>
                    </div>
                `;

        div.querySelectorAll(".open-profile").forEach((el) => {
          el.addEventListener("click", () => showUserProfile(friend.id));
        });

        div.querySelector(".write-msg-btn").onclick = () => {
          switchPage("messagesPage");
          renderMessagesWithFriend(friend.id);
        };

        div.querySelector(".remove-friend-btn").onclick = async () => {
          await removeFriend(friend.id);
          renderFriendsPage();
        };

        friendsList.appendChild(div);
      });
    }
  } catch (error) {
    console.error("Error:", error);
    container.innerHTML =
      '<div style="color: red;">Ошибка загрузки друзей</div>';
  }
}

// ============================================
// ЛЮДИ
// ============================================

async function openFullUserProfile(userId) {
  currentPage = "profile";
  setPageTitle("profile");
  switchPage("profilePage");
  await renderProfilePage(userId);
}

async function renderPeoplePage() {
  const container = document.getElementById("peopleSearchResults");
  container.innerHTML = "";

  document.getElementById("searchPeopleBtn").onclick = renderPeopleResults;

  const cityFilter = document.querySelector('input[name="cityFilter"]');
  if (cityFilter) {
    cityFilter.addEventListener("change", () => {
      const val = document.querySelector(
        'input[name="cityFilter"]:checked'
      ).value;
      document.getElementById("otherCityInput").style.display =
        val === "otherCity" ? "block" : "none";
    });
  }

  // инициализация выпадающего списка интересов
  const toggle = document.getElementById("interestsDropdownToggle");
  const menu = document.getElementById("interestsDropdownMenu");
  const label = document.getElementById("interestsDropdownLabel");

  if (toggle && menu && label) {
    toggle.onclick = (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    };

    // обновление подписи при изменении чекбоксов
    menu.querySelectorAll('input[name="interestFilter"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        const selected = Array.from(
          menu.querySelectorAll('input[name="interestFilter"]:checked')
        ).map((x) => x.value);

        if (selected.length === 0) {
          label.textContent = "Выберите интересы";
          label.style.color = "#999";
        } else {
          label.textContent = selected.join(", ");
          label.style.color = "#333";
        }
      });
    });

    // клик вне дропдауна — закрыть
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.style.display = "none";
      }
    });
  }
}

async function renderPeopleResults() {
  const searchTerm = document.getElementById("peopleSearchInput").value.trim();
  const filter = document.querySelector(
    'input[name="cityFilter"]:checked'
  ).value;

  let city = "";
  let allCities = false;

  if (filter === "myCity") {
    city = currentUser.city;
  } else if (filter === "otherCity") {
    city = document.getElementById("otherCityName").value.trim();
  } else if (filter === "allCities") {
    allCities = true;
  }

  // собираем выбранные интересы
  const interestCheckboxes = document.querySelectorAll(
    'input[name="interestFilter"]:checked'
  );
  const selectedInterests = Array.from(interestCheckboxes).map(
    (cb) => cb.value
  );

  const container = document.getElementById("peopleSearchResults");
  container.innerHTML =
    '<div style="text-align: center; padding: 40px; color: #999;">⏳ Загрузка...</div>';
  try {
    const users = await searchUsers(
      searchTerm,
      city,
      allCities,
      selectedInterests
    );
    container.innerHTML = "";

    if (users.length === 0) {
      container.innerHTML =
        '<div style="text-align: center; color: #999; padding: 40px;">👥 Никого не найдено</div>';
      return;
    }

    users.forEach((user) => {
      const div = document.createElement("div");
      div.style.cssText =
        "background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; gap: 15px;";
      const avatar = user.avatar_url || user.avatar || "👤";
      div.innerHTML = `
        <div style="font-size: 48px; flex-shrink: 0; ${user.avatar_url
          ? `background-image: url('${user.avatar_url}'); width: 48px; height: 48px; border-radius: 50%; background-size: cover; background-position: center; cursor: pointer;`
          : "cursor: pointer;"
        }" class="open-profile" data-user-id="${user.id}">
          ${!user.avatar_url ? avatar : ""}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 16px; cursor: pointer; color: #0066cc; margin-bottom: 3px;" class="open-profile" data-user-id="${user.id}">
            ${user.first_name} ${user.last_name}
          </div>
          <div style="font-size: 13px; color: #999; margin-bottom: 8px;">${user.city}</div>
          <div style="font-size: 14px; color: #555; margin-bottom: 8px;">
            ${user.bio || "Нет описания"}
          </div>
          <div style="font-size: 12px; color: #777; margin-bottom: 12px;">
            ${user.interests || ""}
          </div>
          <button class="add-friend-btn" data-user-id="${user.id}" style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">➕</button>
        </div>
      `;
      div.querySelectorAll(".open-profile").forEach((el) => {
        el.addEventListener("click", () => showUserProfile(user.id));
      });
      const addBtn = div.querySelector(".add-friend-btn");
      addBtn.addEventListener("click", async () => {
        await addFriend(user.id);
        addBtn.textContent = "✅";
        addBtn.disabled = true;
        addBtn.style.background = "#999";
      });
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============================================
// СООБЩЕНИЯ
// ============================================

async function renderMessagesWithFriend(friendId) {
  const container = document.getElementById("messagesList");
  const friend = await getUserProfile(friendId);

  container.innerHTML = `
        <button onclick="renderMessagesPage()" style="margin-bottom: 15px; padding: 10px 20px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            ← Назад
        </button>
    `;

  const header = document.createElement("div");
  header.style.cssText = `background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;

  const avatar = friend.avatar_url || friend.avatar || "👤";

  header.innerHTML = `
        <div style="font-size: 48px; ${friend.avatar_url ? `background-image: url('${friend.avatar_url}'); width: 48px; height: 48px; border-radius: 50%; background-size: cover; background-position: center;` : ""}">${!friend.avatar_url ? avatar : ""}</div>
        <div>
            <h2 style="margin: 0; font-size: 20px; color: #333;">${friend.first_name} ${friend.last_name}</h2>
            <div style="color: #999; font-size: 13px;">🟢 Онлайн</div>
        </div>
    `;

  container.appendChild(header);

  const messages = await getMessages(currentUser.id, friendId);
  const messagesDiv = document.createElement("div");
  messagesDiv.style.cssText = `background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 15px; max-height: 450px; overflow-y: auto;`;

  if (messages.length === 0) {
    messagesDiv.innerHTML =
      '<div style="text-align: center; color: #999; padding: 40px;">Нет сообщений</div>';
  } else {
    messages.forEach((msg) => {
      const msgDiv = document.createElement("div");
      const isOwn = msg.sender_id === currentUser.id;

      msgDiv.style.cssText = `display: flex; margin-bottom: 12px; ${isOwn ? "justify-content: flex-end;" : ""}`;

      msgDiv.innerHTML = `
                <div style="
                    max-width: 70%;
                    padding: 12px 15px;
                    border-radius: 12px;
                    ${isOwn ? "background: #1fb8cd; color: white;" : "background: white; color: #333;"}
                    word-wrap: break-word;
                    line-height: 1.5;
                    font-size: 14px;
                ">
                    ${msg.content}
                </div>
            `;

      messagesDiv.appendChild(msgDiv);
    });
  }

  container.appendChild(messagesDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  const formDiv = document.createElement("div");
  formDiv.style.cssText = `display: flex; gap: 10px; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;

  const input = document.createElement("textarea");
  input.placeholder = "Напишите сообщение...";
  input.style.cssText = `flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: Arial; resize: none; max-height: 100px;`;
  input.rows = "1";

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "📤";
  sendBtn.style.cssText = `padding: 12px 20px; background: #1fb8cd; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; flex-shrink: 0;`;

  sendBtn.onclick = async () => {
    if (input.value.trim()) {
      sendBtn.disabled = true;
      await sendMessage(friendId, input.value.trim());
      input.value = "";
      sendBtn.disabled = false;
      renderMessagesWithFriend(friendId);
    }
  };

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  formDiv.appendChild(input);
  formDiv.appendChild(sendBtn);
  container.appendChild(formDiv);
}

async function renderMessagesPage() {
  const container = document.getElementById("messagesList");
  container.innerHTML =
    '<div style="text-align: center; padding: 40px; color: #999;">⏳ Загрузка...</div>';

  try {
    const conversations = await getConversations(currentUser.id);
    container.innerHTML = "";

    if (conversations.length === 0) {
      container.innerHTML =
        '<div style="text-align: center; color: #999; padding: 40px;">✉️ Нет диалогов</div>';
      return;
    }

    for (const userId of conversations) {
      const friend = await getUserProfile(userId);
      const div = document.createElement("div");
      div.style.cssText = `background: white; border-radius: 10px; padding: 15px; margin-bottom: 12px; cursor: pointer; display: flex; gap: 12px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;

      const avatar = friend.avatar_url || friend.avatar || "👤";

      div.innerHTML = `
                <div style="font-size: 40px; flex-shrink: 0; ${friend.avatar_url ? `background-image: url('${friend.avatar_url}'); width: 40px; height: 40px; border-radius: 50%; background-size: cover; background-position: center;` : ""}">${!friend.avatar_url ? avatar : ""}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${friend.first_name} ${friend.last_name}</div>
                    <div style="font-size: 12px; color: #999;">${friend.city}</div>
                </div>
            `;

      div.addEventListener("click", () => renderMessagesWithFriend(userId));
      container.appendChild(div);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============================================
// ПРОФИЛЬ (С ЗАГРУЗКОЙ ФОТО)
// ============================================
async function openFullUserProfile(userId) {
  currentPage = "profile";
  setPageTitle("profile");
  switchPage("profilePage");          // ВАЖНО: это спрячёт peoplePage
  await renderProfilePage(userId);    // рисуем нужного пользователя
}

async function renderProfilePage(userId = null) {
  const idToLoad = userId || currentUser.id;
  const isOwn = idToLoad === currentUser.id;

  const peopleSearchSection = document.getElementById("peopleSearchSection");
  if (peopleSearchSection) {
    peopleSearchSection.style.display = "none";
  }

  const profile = await getUserProfile(idToLoad);
  if (!profile) return;

  // Аватар в шапке профиля
  const profileAvatar = document.getElementById("profileAvatar");
  if (profileAvatar) {
    if (profile.avatar_url) {
      profileAvatar.style.backgroundImage = `url('${profile.avatar_url}')`;
      profileAvatar.style.width = "150px";
      profileAvatar.style.height = "150px";
      profileAvatar.style.backgroundSize = "cover";
      profileAvatar.style.backgroundPosition = "center";
      profileAvatar.innerHTML = "";
      profileAvatar.textContent = "";
    } else {
      profileAvatar.style.backgroundImage = "";
      profileAvatar.textContent = profile.avatar || "👤";
    }
  }

  document.getElementById("profileName").textContent =
    `${profile.first_name} ${profile.last_name}, ${profile.city || ""}`;
  document.getElementById("profileBio").textContent =
    profile.bio || "Нет описания";

  // Интересы
  const profileInterests = document.getElementById("profileInterests");
  profileInterests.innerHTML = "";
  if (profile.interests && profile.interests.length > 0) {
    profile.interests.forEach((interest) => {
      const tag = document.createElement("span");
      tag.style.cssText =
        "display:inline-block;padding:6px 12px;background:#1fb8cd;color:white;border-radius:20px;margin-right:6px;margin-bottom:6px;font-size:13px;";
      tag.textContent = interest;
      profileInterests.appendChild(tag);
    });
  }
  // Скрыть/показать загрузку аватара
  const avatarUploadInput = document.getElementById("avatarUpload");
const avatarUploadBtn = document.getElementById("avatarUploadBtn");

if (!isOwn) {
  if (avatarUploadInput) avatarUploadInput.style.display = "none";
  if (avatarUploadBtn)  avatarUploadBtn.style.display = "none";
} else {
  if (avatarUploadInput) avatarUploadInput.style.display = "none"; // скрытый input
  if (avatarUploadBtn && avatarUploadInput) {
    avatarUploadBtn.style.display = "inline-block";
    avatarUploadBtn.onclick = () => avatarUploadInput.click();
  }
}
if (isOwn && avatarUploadInput) {
  avatarUploadInput.onchange = async () => {
    const file = avatarUploadInput.files[0];
    if (!file) return;

    try {
      const newUrl = await uploadPhoto(file, "avatars");
      if (!newUrl) {
        alert("Ошибка загрузки аватара");
        return;
      }

      await updateUserProfile(currentUser.id, { avatar_url: newUrl });
      currentUser.avatar_url = newUrl;

      await renderProfilePage(currentUser.id);
      alert("✅ Аватар обновлён!");
    } catch (e) {
      alert("❌ Ошибка: " + (e.message || e));
    } finally {
      avatarUploadInput.value = "";
    }
  };
}
  // Скрыть/показать кнопку загрузки в галерею
  const galleryUploadInput = document.getElementById("galleryPhotoUpload");
  const galleryUploadBtn = document.querySelector(
    "#gallerySection button[onclick*='galleryPhotoUpload']"
  );

  if (!isOwn) {
    if (galleryUploadBtn) galleryUploadBtn.style.display = "none";
  } else {
    if (galleryUploadBtn) galleryUploadBtn.style.display = "inline-block";
  }
  // Кнопка редактирования только для своего профиля
  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) {
    if (!isOwn) {
      editBtn.style.display = "none";
    } else {
      editBtn.style.display = "inline-block";
      editBtn.onclick = () => {
        document.getElementById("editName").value = profile.first_name;
        document.getElementById("editBio").value = profile.bio || "";
        document.getElementById("editInterests").value =
          (profile.interests || []).join(", ");

        document.getElementById("editProfileForm").onsubmit = async (e) => {
          e.preventDefault();

          let avatarUrl = profile.avatar_url;
          const avatarFile = document.getElementById("avatarUpload").files[0];
          if (avatarFile) {
            avatarUrl = await uploadPhoto(avatarFile, "avatars");
          }

          await updateUserProfile(currentUser.id, {
            first_name: document.getElementById("editName").value,
            bio: document.getElementById("editBio").value,
            interests: document
              .getElementById("editInterests")
              .value.split(",")
              .map((i) => i.trim())
              .filter((i) => i),
            avatar_url: avatarUrl,
          });

          currentUser.firstName = document.getElementById("editName").value;
          document.getElementById("closeEditProfileModal").click();
          renderProfilePage(currentUser.id);
          alert("✅ Профиль обновлён!");
        };

        document.getElementById("editProfileModal").style.display = "flex";
      };
    }
  }

  // Клик по аватару — только если есть картинка
  if (profileAvatar && profile.avatar_url) {
    profileAvatar.style.cursor = "pointer";
    profileAvatar.onclick = () => openImageModal(profile.avatar_url);
  } else if (profileAvatar) {
    profileAvatar.style.cursor = "default";
    profileAvatar.onclick = null;
  }

  // Аватар в шапке приложения — всегда текущего пользователя
  const headerUserAvatar = document.getElementById("headerUserAvatar");
  if (headerUserAvatar && currentUser) {
    if (currentUser.avatar_url || profile.avatar_url) {
      const url = currentUser.avatar_url || profile.avatar_url;
      headerUserAvatar.innerHTML = `
        <img src="${url}?${Date.now()}"
             style="width:35px;height:35px;border-radius:50%;object-fit:cover;vertical-align:middle;" alt="avatar">
      `;
    } else {
      headerUserAvatar.innerHTML = "👤";
    }
  }

  // --- Секции профиля всегда видны ---
  const gallerySection = document.getElementById("gallerySection");
  const personalPostsWrapper =
    document.getElementById("personalPostsList")?.parentElement;
  const approvedSection = document.getElementById(
    "approvedSuggestionsSection"
  );

  if (gallerySection) gallerySection.parentElement.style.display = "block";
  if (personalPostsWrapper) personalPostsWrapper.style.display = "block";
  if (approvedSection) approvedSection.style.display = "block";

  const postsTitle = document.getElementById("personalPostsTitle");
  if (postsTitle) {
    postsTitle.textContent = isOwn ? "Мои посты" : "Посты пользователя";
  }

  // --- Загрузка фото в галерею: только свой профиль ---
  const galleryInput = document.getElementById("galleryPhotoUpload");
  if (galleryInput) {
    if (!isOwn) {
      galleryInput.onchange = null;
    } else {
      galleryInput.onchange = async function () {
        const file = galleryInput.files[0];
        if (!file) return;
        try {
          const imageUrl = await uploadPhoto(file, "gallery");
          if (!imageUrl) {
            alert("Ошибка: изображение не загружено в Storage");
            return;
          }
          const saved = await addPhotoToGallery(imageUrl);
          if (!saved) {
            alert("Ошибка при добавлении фото в галерею!");
            return;
          }
          galleryInput.value = "";
          await renderGalleryForUser(currentUser.id);
          alert("✅ Фото добавлено в галерею!");
        } catch (e) {
          alert("❌ Ошибка при загрузке: " + (e.message || e));
        }
      };
    }
  }

  // --- Создание личных постов и скрытие формы на чужом профиле ---
  const createSection = document.getElementById("createPersonalPostSection");
  const createBtn = document.getElementById("createPersonalPostBtn");
  const postTextarea = document.getElementById("personalPostContent");
  const postPhotoInput = document.getElementById("personalPostPhotoInput");
  const fileNameSpan = document.getElementById("personalPostPhotoName");

  if (!isOwn) {
    // Чужой профиль: форму создания постов не показываем вообще
    if (createSection) createSection.style.display = "none";
  } else {
    // Свой профиль: форма создания поста видна и работает
    if (createSection) createSection.style.display = "block";

    if (createBtn) {
      createBtn.disabled = false;
      createBtn.style.opacity = "";
      createBtn.style.cursor = "pointer";

      createBtn.onclick = async () => {
        const content = (postTextarea?.value || "").trim();
        const photoFile =
          postPhotoInput && postPhotoInput.files && postPhotoInput.files[0]
            ? postPhotoInput.files[0]
            : null;

        if (!content && !photoFile) {
          alert("Введите текст или выберите фото");
          return;
        }

        let imageUrl = null;
        createBtn.disabled = true;
        createBtn.textContent = "⏳...";

        try {
          if (photoFile) {
            imageUrl = await uploadPhoto(photoFile, "posts");
          }

          await createPersonalPost(content, imageUrl);

          if (postTextarea) postTextarea.value = "";
          if (postPhotoInput) postPhotoInput.value = "";
          if (fileNameSpan) fileNameSpan.textContent = "Файл не выбран";

          await renderPersonalPostsForUser(currentUser.id);
          alert("✅ Пост опубликован!");
        } catch (e) {
          alert("❌ Ошибка загрузки поста: " + (e.message || e));
        } finally {
          createBtn.disabled = false;
          createBtn.textContent = "Опубликовать";
        }
      };
    }

    if (postPhotoInput && fileNameSpan) {
      postPhotoInput.onchange = function () {
        fileNameSpan.textContent = postPhotoInput.files.length
          ? postPhotoInput.files[0].name
          : "Файл не выбран";
      };
    }
  }

  // --- Всегда рендерим галерею и посты выбранного пользователя ---
  await renderGalleryForUser(idToLoad);
  await renderPersonalPostsForUser(idToLoad, isOwn);
}

async function renderCommentsSection(postId, container) {
  await loadComments("personal_post", postId, container);
}

async function renderGalleryForUser(userId) {
  const GALLERY_PREVIEW_LIMIT = 4;
  const galleryGrid = document.getElementById("galleryGrid");
  if (!galleryGrid) return;

  const gallery = await getGallery(userId);
  galleryGrid.innerHTML = "";
  if (!gallery.length) {
    galleryGrid.innerHTML =
      "<div style='color:#888; font-size:14px;'>Нет ни одной фотографии</div>";
    return;
  }

  const photosToShow =
    gallery.length > GALLERY_PREVIEW_LIMIT
      ? gallery.slice(0, GALLERY_PREVIEW_LIMIT)
      : gallery;

  for (const photo of photosToShow) {
    if (!photo.image_url) continue;

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "gallery-photo-wrapper";

    const img = document.createElement("img");
    img.src = photo.image_url;
    img.alt = "Фото в галерее";
    img.className = "gallery-photo-img";
    img.onclick = () => openImageModal(photo.image_url);

    const delBtn = document.createElement("span");
    delBtn.className = "gallery-delete-btn";
    delBtn.title = "Удалить фото";
    delBtn.textContent = "✕";
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      if (confirm("Удалить это фото из галереи?")) {
        const ok = await deletePhotoFromGallery(photo.id);
        if (ok) renderGalleryForUser(userId);
      }
    };

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(delBtn);
    galleryGrid.appendChild(imgWrapper);
  }

  if (gallery.length > GALLERY_PREVIEW_LIMIT) {
    const btn = document.createElement("button");
    btn.textContent = `Показать все (${gallery.length})`;
    btn.className = "create-btn";
    btn.style.margin = "12px 0";
    btn.onclick = async () => {
      // показать все
      const allGrid = document.getElementById("galleryGrid");
      if (!allGrid) return;
      allGrid.innerHTML = "";
      for (const photo of gallery) {
        if (!photo.image_url) continue;
        const wrap = document.createElement("div");
        wrap.className = "gallery-photo-wrapper";
        const img = document.createElement("img");
        img.src = photo.image_url;
        img.alt = "Фото в галерее";
        img.className = "gallery-photo-img";
        img.onclick = () => openImageModal(photo.image_url);
        const delBtn = document.createElement("span");
        delBtn.className = "gallery-delete-btn";
        delBtn.title = "Удалить фото";
        delBtn.textContent = "✕";
        delBtn.onclick = async (e) => {
          e.stopPropagation();
          if (confirm("Удалить это фото из галереи?")) {
            const ok = await deletePhotoFromGallery(photo.id);
            if (ok) renderGalleryForUser(userId);
          }
        };
        wrap.appendChild(img);
        wrap.appendChild(delBtn);
        allGrid.appendChild(wrap);
      }
    };
    galleryGrid.appendChild(btn);
  }
}

async function renderPersonalPostsForUser(userId, isOwn = false) {
  const posts = await getPersonalPosts(userId);
  console.log("renderPersonalPostsForUser", { userId, isOwn, posts });
  const postsContainer = document.getElementById("personalPostsList");
  if (!postsContainer) return;

  postsContainer.innerHTML = "";
  const postHtmlBlocks = [];

  for (const post of posts) {
    const { data: likeRows } = await supabase
      .from("likes")
      .select("user_id")
      .eq("content_type", "personal_post")
      .eq("content_id", post.id);
    const likesCount = likeRows ? likeRows.length : 0;
    const liked =
      likeRows && likeRows.some((row) => row.user_id === currentUser.id);

    const { data: commentRows } = await supabase
      .from("comments")
      .select("id")
      .eq("content_type", "personal_post")
      .eq("content_id", post.id);
    const commentsCount = commentRows ? commentRows.length : 0;

    postHtmlBlocks.push(`
      <div class="personal-post" data-post-id="${post.id}">
        <div class="post-footer">
          ${isOwn && post.user_id === currentUser.id
        ? `<button class="delete-btn" data-post-id="${post.id}" title="Удалить пост">🗑️</button>`
        : ""
      }
        </div>
        <div class="post-text">${post.content ? post.content.replace(/</g, "&lt;") : ""
      }</div>
        ${post.image_url
        ? `<img class='post-img' src='${post.image_url}' onclick="openImageModal('${post.image_url}')">`
        : ""
      }
        <div class="post-meta">
          <span>${new Date(post.created_at).toLocaleString()}</span>
        </div>
        <div class="post-footer">
          <button class="like-btn${liked ? " liked" : ""}" data-post-id="${post.id
      }">❤️ <span class="like-count">${likesCount}</span></button>
          <button class="comment-btn" data-post-id="${post.id
      }">💬 <span class="comment-count">${commentsCount}</span></button>
        </div>
        <div class="post-comments" id="commentsForPost${post.id
      }" style="display:none;"></div>
      </div>
    `);
  }

  postsContainer.innerHTML = postHtmlBlocks.join("");

  posts.forEach((post) => {
    const likeBtn = document.querySelector(
      `.like-btn[data-post-id='${post.id}']`
    );
    if (likeBtn) {
      likeBtn.onclick = async (e) => {
        e.stopPropagation();
        await likeContent("personal_post", post.id);
        await renderPersonalPostsForUser(userId, isOwn);
      };
    }

    const commentBtn = document.querySelector(
      `.comment-btn[data-post-id='${post.id}']`
    );
    if (commentBtn) {
      commentBtn.onclick = async (e) => {
        e.stopPropagation();
        const box = document.getElementById(`commentsForPost${post.id}`);
        if (box.style.display === "none") {
          box.style.display = "block";
          await renderCommentsSection(post.id, box);
        } else {
          box.style.display = "none";
        }
      };
    }
  });

  // Удалять посты можно только на своём профиле
  if (isOwn) {
    Array.from(document.getElementsByClassName("delete-btn")).forEach(
      (btn) => {
        btn.onclick = async function () {
          const postId = btn.dataset.postId;
          if (confirm("Удалить этот пост?")) {
            await deletePersonalPost(postId);
            await renderPersonalPostsForUser(userId, isOwn);
          }
        };
      }
    );
  }
}


function openImageModal(url) {
  const modal = document.getElementById("imageModal");
  const img = document.getElementById("imageModalImg");
  if (!modal || !img) return;
  modal.style.display = "block";
  img.src = url;
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  if (modal) modal.style.display = "none";
}

// ============================================
// АДМИН-ПАНЕЛЬ (ИСПРАВЛЕНО!)
// ============================================

async function renderAdminPanel() {
  const container = document.getElementById("adminContent");
  container.innerHTML =
    '<div style="text-align: center; padding: 40px; color: #999;">⏳ Загрузка...</div>';

  try {
    const suggestions = await getPendingSuggestions(
      currentUser.admin_city || currentUser.city
    );
    container.innerHTML = "";

    if (suggestions.length === 0) {
      container.innerHTML =
        '<div style="text-align: center; color: #999; padding: 40px;">✅ Нет предложений</div>';
      return;
    }

    suggestions.forEach((suggestion) => {
      const div = document.createElement("div");
      div.style.cssText = `background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #f39c12; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;

      let typeText =
        suggestion.type === "news"
          ? "📰"
          : suggestion.type === "discussion"
            ? "💬"
            : "📊";

      let html = `
                <div style="margin-bottom: 12px; font-weight: 600; font-size: 14px;">
                    ${typeText} От: ${suggestion.author.first_name} ${suggestion.author.last_name}
                </div>
                ${suggestion.title ? `<div style="margin-bottom: 12px; font-weight: 600; font-size: 15px;">${suggestion.title}</div>` : ""}
                <div style="margin-bottom: 15px; padding: 12px; background: #f9f9f9; border-radius: 6px; line-height: 1.6;">
                    ${suggestion.content || suggestion.poll_question || "---"}
                </div>
            `;

      if (suggestion.image_url) {
        html += `<img src="${suggestion.image_url}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 6px; margin-bottom: 15px; cursor: pointer;" onclick="window.open('${suggestion.image_url}', '_blank')">`;
      }

      html += `
                <div style="display: flex; gap: 8px;">
                    <button class="approve" data-id="${suggestion.id}" style="flex: 1; padding: 10px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">✅ Одобрить</button>
                    <button class="reject" data-id="${suggestion.id}" style="flex: 1; padding: 10px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">❌ Отклонить</button>
                </div>
            `;

      div.innerHTML = html;

      div.querySelector(".approve").onclick = async () => {
        if (await approveSuggestion(suggestion.id)) {
          renderAdminPanel();
          renderNews();
          renderDiscussions();
        }
      };

      div.querySelector(".reject").onclick = async () => {
        if (await rejectSuggestion(suggestion.id)) {
          renderAdminPanel();
        }
      };

      container.appendChild(div);
    });
  } catch (error) {
    console.error("Error:", error);
    container.innerHTML =
      '<div style="color: red;">Ошибка загрузки предложений</div>';
  }
}

// ============================================
// СЛУЖЕБНЫЕ ФУНКЦИИ
// ============================================

async function loadComments(type, id, container) {
  const comments = await getComments(type, id);
  container.innerHTML = "";

  const commentsList = document.createElement("div");
  commentsList.style.marginBottom = "15px";

  if (comments.length === 0) {
    commentsList.innerHTML =
      '<div style="color: #999; font-size: 13px;">Комментариев нет</div>';
  } else {
    comments.forEach((comment) => {
      const author = comment.author || {};
      const div = document.createElement("div");
      div.style.cssText =
        "margin-bottom: 12px; padding: 12px; background: #f5f5f5; border-radius: 6px; border-left: 3px solid #1fb8cd;";

      const timeStr = comment.timestamp
        ? new Date(comment.timestamp).toLocaleString()
        : "";

      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <div style="font-weight: 600; font-size: 13px;">
            ${author.first_name} ${author.last_name}
          </div>
          <div style="font-size: 11px; color: #999; margin-left: 8px;">
            ${timeStr}
          </div>
        </div>
        <div style="font-size: 13px; color: #555; line-height: 1.4;">
          ${comment.content}
        </div>
      `;
      commentsList.appendChild(div);
    });
  }

  container.appendChild(commentsList);

  const formDiv = document.createElement("div");
  formDiv.style.cssText =
    "display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid #eee;";

  const input = document.createElement("textarea");
  input.placeholder = "Комментарий...";
  input.style.cssText =
    "flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; font-family: Arial; resize: none;";
  input.rows = "1";

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "→";
  sendBtn.style.cssText =
    "padding: 8px 12px; background: #1fb8cd; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; flex-shrink: 0;";

  sendBtn.onclick = async () => {
    if (input.value.trim()) {
      await addComment(type, id, input.value.trim());
      loadComments(type, id, container);
    }
  };

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  formDiv.appendChild(input);
  formDiv.appendChild(sendBtn);
  container.appendChild(formDiv);
}


function switchPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}


function formatDateTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;

  const pad = (n) => (n < 10 ? "0" + n : "" + n);

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}
//ВЫБОР ГОРОДА

// Заполняем datalist городов в сайдбаре
async function populateSidebarCitiesDatalist() {
  const { data, error } = await supabase
    .from("users")
    .select("city")
    .neq("city", "")
    .order("city");

  if (error) {
    console.error("Ошибка загрузки городов:", error);
    return;
  }

  let cities = [
    ...new Set((data || []).map((row) => row.city.trim()).filter(Boolean)),
  ].sort();

  // Не добавляем город пользователя (будет опция "Мой город")
  const myCity = currentUser && currentUser.city ? currentUser.city.trim() : "";
  cities = cities.filter((city) => city.toLowerCase() !== myCity.toLowerCase());

  const datalist = document.getElementById("sidebarCitiesList");
  if (!datalist) return;
  datalist.innerHTML = cities
    .map((city) => `<option value="${city}">`)
    .join("");
}

// ОБРАБОТЧИКИ САЙДБАРА ГОРОДОВ
function initSidebarCityControls() {
  const cityInput = document.getElementById("citySelectorInput");
  const myCityBtn = document.getElementById("sidebarMyCityBtn");
  const allCitiesBtn = document.getElementById("sidebarAllCitiesBtn");

  if (cityInput) {
    cityInput.addEventListener("change", async function () {
      let value = this.value.trim();

      if (!value || value.toLowerCase() === "мой город") {
        selectedCity = null; // используем текущий город пользователя
        cityInput.value = "Мой город";
      } else if (value.toLowerCase() === "все города") {
        selectedCity = ""; // твоя логика "все города"
        cityInput.value = "Все города";
      } else {
        selectedCity = value; // конкретный город из списка/ввода
      }

      await renderNews();
      await renderDiscussions();
    });
  }

  if (myCityBtn && cityInput) {
    myCityBtn.addEventListener("click", async function () {
      selectedCity = null;
      cityInput.value = "Мой город";
      await renderNews();
      await renderDiscussions();
    });
  }

  if (allCitiesBtn && cityInput) {
    allCitiesBtn.addEventListener("click", async function () {
      selectedCity = "";
      cityInput.value = "Все города";
      await renderNews();
      await renderDiscussions();
    });
  }
}

async function showUserProfile(userId) {
  const user = await getUserProfile(userId);
  if (!user) return;

  const modal = document.getElementById("discussionModal");
  const body = document.getElementById("discussionDetail");
  if (!modal || !body) return;

  const interests = Array.isArray(user.interests) ? user.interests : [];

  body.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; gap:16px; align-items:center;">
        <div
          id="userPopupAvatar"
          style="
            width:64px;
            height:64px;
            border-radius:50%;
            background:#e5e7eb;
            background-size:cover;
            background-position:center;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:28px;
            color:#6b7280;
            flex-shrink:0;
          "
        >
          ${user.avatar_url ? "" : (user.avatar || "👤")}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600; font-size:18px; color:#111827; margin-bottom:2px;">
            ${user.first_name || ""} ${user.last_name || ""}
          </div>
          <div style="font-size:13px; color:#6b7280; margin-bottom:6px;">
            ${user.city || ""}
          </div>
          <div style="font-size:13px; color:#4b5563; line-height:1.5;">
            ${user.bio || ""}
          </div>
        </div>
      </div>

      ${interests.length
      ? `
        <div>
          <div style="font-weight:600; font-size:13px; color:#111827; margin-bottom:6px;">
            Интересы
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${interests
        .map(
          (i) => `
              <span style="
                display:inline-block;
                padding:4px 10px;
                border-radius:999px;
                background:#e0f7fb;
                color:#036672;
                font-size:12px;
              ">
                ${i}
              </span>
            `
        )
        .join("")}
          </div>
        </div>
      `
      : ""
    }

      <div style="display:flex; justify-content:flex-start; margin-top:4px;">
        <button
          id="openFullProfileBtn"
          style="
            padding:8px 18px;
            border:none;
            border-radius:999px;
            background:#1fb8cd;
            color:#ffffff;
            font-size:14px;
            font-weight:600;
            cursor:pointer;
            box-shadow:0 1px 3px rgba(0,0,0,0.12);
            transition:background 0.15s ease, transform 0.1s ease;
          "
          onmouseover="this.style.background='#17a4b7'; this.style.transform='translateY(-1px)';"
          onmouseout="this.style.background='#1fb8cd'; this.style.transform='translateY(0)';"
        >
          Открыть профиль
        </button>
      </div>
    </div>
  `;

  // Аватар
  if (user.avatar_url) {
    const av = document.getElementById("userPopupAvatar");
    if (av) {
      av.style.backgroundImage = `url('${user.avatar_url}')`;
      av.textContent = "";
    }
  }

  modal.style.display = "flex";

  const btn = document.getElementById("openFullProfileBtn");
  if (btn) {
    btn.onclick = async () => {
      modal.style.display = "none";
      await openFullUserProfile(userId);
    };
  }
}


