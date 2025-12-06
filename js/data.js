

function makeSafeFileName(str) {
  return str.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadPhoto(file, bucket = "posts", onProgress = null) {
  try {
    if (!file) {
      console.warn("⚠️ Файл не выбран");
      return null;
    }

    console.log("📤 Начинаю загрузку файла:", file.name);

    // Проверка размера (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error("❌ Файл слишком большой (макс 10MB)");
      return null;
    }

    // Проверка типа
    if (!file.type.startsWith("image/")) {
      console.error("❌ Это не изображение");
      return null;
    }

    // Генерируем безопасное имя
    const safeName = makeSafeFileName(file.name);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}_${random}_${safeName}`;
    console.log("📝 Имя файла:", filename);

    if (onProgress) onProgress(true);

    // Загружаем в Storage
    console.log("🔄 Загружаю в Storage bucket:", bucket);
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Ошибка загрузки Storage:", error);
      if (onProgress) onProgress(false);
      return null;
    }

    console.log("✅ Файл загружен в Storage");

    // Получаем публичную ссылку
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    const imageUrl = publicUrlData.publicUrl;
    console.log("✅ Публичная ссылка:", imageUrl);

    if (onProgress) onProgress(false);
    return imageUrl;
  } catch (error) {
    console.error("❌ Ошибка загрузки фото:", error);
    if (onProgress) onProgress(false);
    return null;
  }
}

// ============================================
// НОВОСТИ
// ============================================

async function getNews(city = null) {
  try {
    let query = supabase
      .from("news")
      .select(
        `*,
author:author_id(id, first_name, last_name, avatar, avatar_url, city)`
      )
      .order("timestamp", { ascending: false });
    if (city && city !== "all" && city !== "myCity") {
      query = query.eq("city", city);
    } else if (city === "myCity" && currentUser) {
      query = query.eq("city", currentUser.city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

async function addNews(content, imageUrl = null, city, topic = null) {
  try {
    if (!content || !content.trim()) return null;
    console.log("📝 Добавляю новость с imageUrl:", imageUrl);

    const { data, error } = await supabase
      .from("news")
      .insert([
        {
          author_id: currentUser.id,
          city: city || currentUser.city,
          content: content.trim(),
          image_url: imageUrl || null,
          timestamp: new Date().toISOString(),
          likes: 0,
          topic: topic || null,
        },
      ])
      .select();

    if (error) throw error;
    console.log("✅ Новость добавлена");
    return data?.[0] || null;
  } catch (error) {
    console.error("Error adding news:", error);
    return null;
  }
}

async function deleteNews(newsId) {
  const { error } = await supabase.from("news").delete().eq("id", newsId);
  if (error) alert("Ошибка удаления: " + error.message);
}

// ============================================
// ОБСУЖДЕНИЯ
// ============================================

async function getDiscussions(city = null) {
  try {
    let query = supabase
      .from("discussions")
      .select(
        `*,
author:author_id(id, first_name, last_name, avatar, avatar_url, city)`
      )
      .order("timestamp", { ascending: false });
    if (city && city !== "all" && city !== "myCity") {
      query = query.eq("city", city);
    } else if (city === "myCity" && currentUser) {
      query = query.eq("city", currentUser.city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return [];
  }
}

async function addDiscussion(title, content, city, imageUrl = null, topic = null) {
  try {
    if (!title || !title.trim()) return null;
    if (!content || !content.trim()) return null;
    console.log("📝 Добавляю обсуждение с imageUrl:", imageUrl);

    const { data, error } = await supabase
      .from("discussions")
      .insert([
        {
          author_id: currentUser.id,
          city: city || currentUser.city,
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl || null,
          timestamp: new Date().toISOString(),
          likes: 0,
          topic: topic || null,
        },
      ])
      .select();

    if (error) throw error;
    console.log("✅ Обсуждение добавлено");
    return data?.[0] || null;
  } catch (error) {
    console.error("Error adding discussion:", error);
    return null;
  }
}

async function deleteDiscussion(discussionId) {
  const { error } = await supabase
    .from("discussions")
    .delete()
    .eq("id", discussionId);
  if (error) alert("Ошибка удаления: " + error.message);
}

async function deletePoll(pollId) {
  const { error } = await supabase.from("polls").delete().eq("id", pollId);
  if (error) alert("Ошибка удаления: " + error.message);
}

// ============================================
// ГАЛЕРЕЯ
// ============================================

async function getGallery(userId) {
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
}

async function addPhotoToGallery(imageUrl) {
  try {
    if (!imageUrl) return null;
    console.log("📷 Добавляю фото в галерею:", imageUrl);

    const { data, error } = await supabase
      .from("gallery")
      .insert([
        {
          user_id: currentUser.id,
          image_url: imageUrl,
          uploaded_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    console.log("✅ Фото добавлено в галерею");
    return data?.[0] || null;
  } catch (error) {
    console.error("Error adding photo to gallery:", error);
    return null;
  }
}

async function deletePhotoFromGallery(photoId) {
  try {
    const { error } = await supabase.from("gallery").delete().eq("id", photoId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Ошибка удаления фото:", error);
    return false;
  }
}

// ============================================
// ЛИЧНЫЕ ПОСТЫ
// ============================================

async function getPersonalPosts(userId) {
  try {
    const { data, error } = await supabase
      .from("personal_posts")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching personal posts:", error);
    return [];
  }
}

async function createPersonalPost(content, imageUrl = null) {
  try {
    if (!content || !content.trim()) return null;
    console.log("📝 Создаю личный пост с imageUrl:", imageUrl);

    const { data, error } = await supabase
      .from("personal_posts")
      .insert([
        {
          user_id: currentUser.id,
          content: content.trim(),
          image_url: imageUrl || null,
          timestamp: new Date().toISOString(),
          likes: 0,
        },
      ])
      .select();

    if (error) throw error;
    console.log("✅ Пост создан");
    return data?.[0] || null;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}

// ============================================
// ДРУЗЬЯ
// ============================================

async function getFriendRequests(userId) {
  try {
    const { data, error } = await supabase
      .from("friends")
      .select(
        `user:user_id(id, first_name, last_name, avatar, avatar_url, city, bio),id`
      )
      .eq("friend_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((item) => ({ ...item.user, request_id: item.id })) || [];
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return [];
  }
}

async function acceptFriendRequest(requestId) {
  try {
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", requestId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error accepting request:", error);
    return false;
  }
}

async function rejectFriendRequest(requestId) {
  try {
    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("id", requestId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error rejecting request:", error);
    return false;
  }
}

async function getFriends(userId) {
  try {
    const { data, error } = await supabase
      .from("friends")
      .select(
        `friend:friend_id(id, first_name, last_name, avatar, avatar_url, city, bio, interests)`
      )
      .eq("user_id", userId)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((item) => item.friend).filter((f) => f) || [];
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
}

async function addFriend(friendId) {
  try {
    const { error } = await supabase.from("friends").insert([
      {
        user_id: currentUser.id,
        friend_id: friendId,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding friend:", error);
    return false;
  }
}

async function removeFriend(friendId) {
  try {
    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("friend_id", friendId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing friend:", error);
    return false;
  }
}

// ============================================
// ПРЕДЛОЖЕНИЯ
// ============================================

async function createSuggestion(type, city, data) {
  try {
    const suggestion = {
      author_id: currentUser.id,
      city,
      type,
      status: "pending",
      timestamp: new Date().toISOString(),
      topic: data.topic ?? null,
    };

    if (type === "news") {
      suggestion.content = data.content;
      suggestion.image_url = data.imageUrl ?? null;
    } else if (type === "discussion") {
      suggestion.title = data.title;
      suggestion.content = data.content;
      suggestion.image_url = data.imageUrl ?? null;
    } else if (type === "poll") {
      suggestion.poll_question = data.question;
      suggestion.poll_options = JSON.stringify(data.options || []);
      suggestion.image_url = data.imageUrl ?? null;
    }

    const { data: result, error } = await supabase
      .from("suggestions")
      .insert([suggestion])
      .select();

    if (error) throw error;
    return result?.[0] ?? null;
  } catch (error) {
    console.error("Error creating suggestion:", error);
    return null;
  }
}

async function getPendingSuggestions(adminCity) {
  try {
    const { data, error } = await supabase
      .from("suggestions")
      .select(
        `*,
author:author_id(id, first_name, last_name, avatar, avatar_url, city)`
      )
      .eq("city", adminCity)
      .eq("status", "pending")
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

// Добавь в data.js — исправленная публикация любых предложений:
async function approveSuggestion(suggestionId) {
  try {
    // Получаем заявку
    const { data: suggestion, error: fetchError } = await supabase
      .from("suggestions")
      .select("*")
      .eq("id", suggestionId)
      .single();
    if (fetchError) throw fetchError;
    if (!suggestion) throw new Error("Suggestion not found");

    let insertResult, insertError;

    if (suggestion.type === "news") {
      // Формируем только существующие поля news!
      const insertData = {
        author_id: suggestion.author_id || null,
        city: suggestion.city || null,
        content: suggestion.content || null,
        suggested_by: suggestion.author_id || null,
        timestamp: new Date().toISOString(),
        topic: suggestion.topic ?? null,
        // image_url тоже, если есть в news — добавьте, если нет, не трогайте!
      };
      if (suggestion.image_url) insertData.image_url = suggestion.image_url;
      ({ data: insertResult, error: insertError } = await supabase
        .from("news")
        .insert([insertData]));
    } else if (suggestion.type === "discussion") {
      const insertData = {
        author_id: suggestion.author_id || null,
        city: suggestion.city || null,
        content: suggestion.content || null,
        title: suggestion.title || null,
        suggested_by: suggestion.author_id || null,
        timestamp: new Date().toISOString(),
        topic: suggestion.topic ?? null,
      };
      if (suggestion.image_url) insertData.image_url = suggestion.image_url;
      ({ data: insertResult, error: insertError } = await supabase
        .from("discussions")
        .insert([insertData]));
    } else if (suggestion.type === "poll") {
      // polls строго по твоей структуре!
      let pollOptions = [];
      try {
        pollOptions = suggestion.poll_options
          ? JSON.parse(suggestion.poll_options)
          : [];
      } catch {
        pollOptions = [];
      }
      const pollData = {
        author_id: suggestion.author_id || null,
        city: suggestion.city || null,
        question: suggestion.poll_question || null,
        options: pollOptions,
        total_votes: 0,
        suggested_by: suggestion.author_id || null,
        timestamp: new Date().toISOString(),
        topic: suggestion.topic ?? null,
      };
      ({ data: insertResult, error: insertError } = await supabase
        .from("polls")
        .insert([pollData]));
    } else {
      throw new Error("Unknown suggestion type");
    }

    if (insertError) throw insertError;

    // Отмечаем заявку как "approved"
    const { error: updateError } = await supabase
      .from("suggestions")
      .update({ status: "approved" })
      .eq("id", suggestionId);
    if (updateError) throw updateError;

    return true;
  } catch (error) {
    alert("Ошибка одобрения: " + (error.message || error));
    console.error("Error approving suggestion:", error);
    return false;
  }
}

async function rejectSuggestion(suggestionId) {
  try {
    const { error } = await supabase
      .from("suggestions")
      .update({ status: "rejected" })
      .eq("id", suggestionId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error rejecting suggestion:", error);
    return false;
  }
}

// ============================================
// КОММЕНТАРИИ
// ============================================

async function getComments(contentType, contentId) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `*,
author:author_id(id, first_name, last_name, avatar, avatar_url, city)`
      )
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("timestamp", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

async function getCommentCount(contentType, contentId) {
  try {
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("content_type", contentType)
      .eq("content_id", contentId);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error fetching comment count:", error);
    return 0;
  }
}

async function addComment(contentType, contentId, commentText) {
  try {
    if (!commentText || !commentText.trim()) return null;
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          content_type: contentType,
          content_id: contentId,
          author_id: currentUser.id,
          content: commentText.trim(),
          timestamp: new Date().toISOString(),
          likes: 0,
        },
      ])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error("Error adding comment:", error);
    return null;
  }
}

// ============================================
// ПОИСК И ПРОФИЛЬ
// ============================================

async function searchUsers(
  searchTerm = "",
  city = null,
  allCities = false,
  interests = []
) {
  try {
    let query = supabase
      .from("users")
      .select(
        "id, first_name, last_name, avatar, avatar_url, city, bio, interests"
      )
      .neq("id", currentUser.id);

    const trimmed = (searchTerm || "").trim();
    const searchWords = trimmed.split(/\s+/).filter(Boolean);

    if (searchWords.length === 1) {
      let cond = `first_name.ilike.%${searchWords[0]}%,last_name.ilike.%${searchWords[0]}%`;
      if (!allCities && city && city.trim()) {
        query = query.or(cond).eq("city", city);
      } else {
        query = query.or(cond);
      }
    } else if (searchWords.length >= 2) {
      let [a, b] = searchWords;
      let bigCond = `and(first_name.ilike.%${a}%,last_name.ilike.%${b}%)`;
      let bigCondRev = `and(first_name.ilike.%${b}%,last_name.ilike.%${a}%)`;
      let anyCondA = `first_name.ilike.%${a}%,last_name.ilike.%${a}%`;
      let anyCondB = `first_name.ilike.%${b}%,last_name.ilike.%${b}%`;
      let cond = `${bigCond},${bigCondRev},${anyCondA},${anyCondB}`;
      if (!allCities && city && city.trim()) {
        query = query.or(cond).eq("city", city);
      } else {
        query = query.or(cond);
      }
    } else if (!allCities && city && city.trim()) {
      query = query.eq("city", city);
    }

    // ФИЛЬТР ПО ИНТЕРЕСАМ (AND по всем выбранным)
    if (interests && interests.length > 0) {
      try {
        query = query.overlaps("interests", interests);
      } catch (e) {
        console.error("Interests filter error, skipping:", e);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

async function updateUserProfile(userId, updates) {
  try {
    console.log("📝 Обновляю профиль:", updates);
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select();
    if (error) throw error;
    console.log("✅ Профиль обновлён");
    return data?.[0] || null;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

// ============================================
// СООБЩЕНИЯ
// ============================================

async function getMessages(userId, friendId) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${userId})`
      )
      .order("timestamp", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

async function sendMessage(recipientId, messageText) {
  try {
    if (!messageText || !messageText.trim()) return null;
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: currentUser.id,
          recipient_id: recipientId,
          content: messageText.trim(),
          timestamp: new Date().toISOString(),
          is_read: false,
        },
      ])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

async function getConversations(userId) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, recipient_id")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    const conversationIds = new Set();
    data.forEach((msg) => {
      const otherId =
        msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      conversationIds.add(otherId);
    });
    return Array.from(conversationIds);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

// ============================================
// ЛАЙКИ
// ============================================

async function likeContent(contentType, contentId) {
  // Сопоставление правильных имен таблиц
  const tableMap = {
    news: "news",
    discussion: "discussions",
    poll: "polls",
    personal_post: "personal_posts",
  };
  const tableName = tableMap[contentType] || contentType;

  try {
    // Проверка: лайкал ли уже этот пользователь этот объект
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .single();

    if (existingLike) {
      // Если лайк уже был — удаляем его
      await supabase.from("likes").delete().eq("id", existingLike.id);

      // Обновляем счетчик в основной таблице, если возможно
      const { data: content } = await supabase
        .from(tableName)
        .select("likes")
        .eq("id", contentId)
        .single();
      if (content && typeof content.likes === "number") {
        await supabase
          .from(tableName)
          .update({ likes: Math.max(0, content.likes - 1) })
          .eq("id", contentId);
      }
    } else {
      // Если его не было — добавляем лайк
      await supabase.from("likes").insert([
        {
          user_id: currentUser.id,
          content_type: contentType,
          content_id: contentId,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Обновляем счетчик лайков (если поле есть)
      const { data: content } = await supabase
        .from(tableName)
        .select("likes")
        .eq("id", contentId)
        .single();
      if (content && typeof content.likes === "number") {
        await supabase
          .from(tableName)
          .update({ likes: (content.likes || 0) + 1 })
          .eq("id", contentId);
      }
    }
    return true;
  } catch (error) {
    console.error("Error liking content:", error);
    return false;
  }
}

async function deletePersonalPost(postId) {
  await supabase.from("personal_posts").delete().eq("id", postId);
  // удалятся также лайки/комментарии, если настроены каскадные связи foreign key!
}
