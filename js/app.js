(function () {
  const data = window.WEDDING;
  const when = new Date(data.dateTime);
  const zone = "Asia/Ho_Chi_Minh";

  const read = (options, type) =>
    new Intl.DateTimeFormat("en-US", { timeZone: zone, ...options })
      .formatToParts(when)
      .find((item) => item.type === type).value;

  const day = Number(read({ day: "2-digit" }, "day"));
  const year = Number(read({ year: "numeric" }, "year"));
  const hour = String(read({ hour: "2-digit", hourCycle: "h23" }, "hour")).padStart(2, "0");
  const minute = String(read({ minute: "2-digit" }, "minute")).padStart(2, "0");
  const monthIndex = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: zone, month: "2-digit" })
      .formatToParts(when)
      .find((item) => item.type === "month").value
  );
  const monthEn = when.toLocaleString("en-US", { timeZone: zone, month: "long" });
  const weekdayEn = when.toLocaleString("en-US", { timeZone: zone, weekday: "long" });
  const couple = data.groom.nickname + " & " + data.bride.nickname;

  const text = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  const picture = (id, src, alt) => {
    const node = document.getElementById(id);
    if (!node || !src) return;
    node.src = src;
    if (alt) node.alt = alt;
  };

  document.title = "Thiệp mời cưới | " + couple;
  text("coverMonogram", data.groom.nickname.charAt(0) + " " + data.bride.nickname.charAt(0));
  text("coverNames", couple);
  text("coverDate", String(day).padStart(2, "0") + "." + String(monthIndex).padStart(2, "0") + "." + year);
  text("heroNames", couple);
  text("saveNames", couple);
  text("stdMonth", monthEn);
  text("stdDay", String(day));
  text("stdWeekday", weekdayEn);
  text("stdYear", String(year));
  text("brideName", data.bride.fullName);
  text("groomName", data.groom.fullName);
  text("brideFather", data.bride.father);
  text("brideMother", data.bride.mother);
  text("brideAddress", data.bride.address);
  text("groomFather", data.groom.father);
  text("groomMother", data.groom.mother);
  text("groomAddress", data.groom.address);

  const guest = new URLSearchParams(location.search).get("ten");
  text("guestName", guest && guest.trim() ? guest.trim() : data.defaultGuest);

  text(
    "whenLine",
    "Thời gian tổ chức, vào hồi " + hour + "h" + minute + " ngày " + day + " tháng " + monthIndex + " năm " + year
  );
  text("venueTitle", data.venueTitle);
  text("venueName", data.venueName);
  text("venueAddress", data.venueAddress);
  text("footerNames", couple);

  picture("heroPhoto", data.hero, couple);
  picture("bridePhoto", data.bride.photo, "Cô dâu " + data.bride.fullName);
  picture("groomPhoto", data.groom.photo, "Chú rể " + data.groom.fullName);
  picture("familyPhoto", data.familyPhoto, "");

  const mapQuery = encodeURIComponent(data.venueAddress);
  const map = document.getElementById("mapFrame");
  map.src = "https://maps.google.com/maps?q=" + mapQuery + "&z=16&output=embed";
  const mapLink = document.getElementById("mapLink");
  mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + mapQuery;

  const timeline = document.getElementById("timeline");
  data.timeline.forEach((item) => {
    const li = document.createElement("li");
    const time = document.createElement("time");
    time.textContent = item.time;
    time.dateTime = item.time;
    li.append(time, document.createTextNode(item.text));
    timeline.append(li);
  });

  renderCalendar(year, monthIndex, day);
  tick();
  setInterval(tick, 1000);
  setupAlbum(data.album);
  setupGifts();
  setupRsvp();
  setupMusic();

  document.getElementById("openBtn").addEventListener("click", (event) => {
    const cover = document.getElementById("cover");
    const button = event.currentTarget;
    if (cover.classList.contains("is-open") || button.disabled) return;
    button.disabled = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) burstHeart(button);
    window.setTimeout(() => cover.classList.add("is-open"), reduceMotion ? 0 : 380);
  });

  function renderCalendar(calendarYear, calendarMonth, weddingDay) {
    const names = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const first = new Date(calendarYear, calendarMonth - 1, 1).getDay();
    const count = new Date(calendarYear, calendarMonth, 0).getDate();
    let cells = "";
    for (let i = 0; i < first; i += 1) cells += "<td></td>";
    for (let date = 1; date <= count; date += 1) {
      const mark = date === weddingDay ? "<span class='mark'>" + date + "</span>" : String(date);
      cells += "<td>" + mark + "</td>";
    }
    const head = monthEn.toUpperCase() + " " + calendarYear;
    document.getElementById("calendar").innerHTML =
      "<div class='calendar'><p class='calendar-head'>" +
      head +
      "</p><table><thead><tr>" +
      names.map((name) => "<th>" + name + "</th>").join("") +
      "</tr></thead><tbody>" +
      chunk(cells) +
      "</tbody></table></div>";
  }

  function chunk(cells) {
    const items = cells.match(/<td>.*?<\/td>/g) || [];
    while (items.length % 7 !== 0) items.push("<td></td>");
    let rows = "";
    for (let i = 0; i < items.length; i += 7) rows += "<tr>" + items.slice(i, i + 7).join("") + "</tr>";
    return rows;
  }

  function tick() {
    const distance = when.getTime() - Date.now();
    const note = document.getElementById("countdownNote");
    if (distance <= 0) {
      ["cdDays", "cdHours", "cdMinutes", "cdSeconds"].forEach((id) => text(id, "0"));
      note.hidden = false;
      return;
    }
    note.hidden = true;
    const total = Math.floor(distance / 1000);
    text("cdDays", String(Math.floor(total / 86400)));
    text("cdHours", String(Math.floor((total % 86400) / 3600)));
    text("cdMinutes", String(Math.floor((total % 3600) / 60)));
    text("cdSeconds", String(total % 60));
  }

  function setupAlbum(photos) {
    const main = document.getElementById("albumMain");
    const thumbs = document.getElementById("thumbs");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    let index = 0;

    const show = (next) => {
      index = (next + photos.length) % photos.length;
      main.src = photos[index];
      thumbs.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === index);
      });
    };

    photos.forEach((src, photoIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Ảnh " + (photoIndex + 1);
      img.loading = "lazy";
      img.decoding = "async";
      button.append(img);
      button.addEventListener("click", () => show(photoIndex));
      thumbs.append(button);
    });

    document.getElementById("albumPrev").addEventListener("click", () => show(index - 1));
    document.getElementById("albumNext").addEventListener("click", () => show(index + 1));
    main.addEventListener("click", () => {
      lightboxImg.src = photos[index];
      lightbox.hidden = false;
    });
    document.getElementById("lightboxClose").addEventListener("click", () => {
      lightbox.hidden = true;
    });
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.hidden = true;
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") lightbox.hidden = true;
      if (lightbox.hidden) return;
      if (event.key === "ArrowRight") show(index + 1);
      if (event.key === "ArrowLeft") show(index - 1);
      lightboxImg.src = photos[index];
    });
    if (photos.length) show(0);
  }

  function setupGifts() {
    fillGift("bride", data.bride);
    fillGift("groom", data.groom);
  }

  function fillGift(prefix, person) {
    text(prefix + "Bank", person.bank.bank);
    text(prefix + "Stk", person.bank.number);
    text(prefix + "Owner", person.bank.owner);
    if (person.bank.qr) {
      const qr = document.getElementById(prefix + "Qr");
      qr.src = person.bank.qr;
      qr.hidden = false;
    }
    const copyButton = document.getElementById(prefix === "bride" ? "copyBride" : "copyGroom");
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(person.bank.number);
      } catch (error) {
        const area = document.createElement("textarea");
        area.value = person.bank.number;
        document.body.append(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      copyButton.textContent = "Đã sao chép";
      setTimeout(() => {
        copyButton.textContent = "Sao chép số tài khoản";
      }, 1600);
    });
  }

  function setupRsvp() {
    const key = "thiepcuoi-wishes";
    const wishes = document.getElementById("wishes");
    const note = document.getElementById("formNote");
    const saved = JSON.parse(localStorage.getItem(key) || "[]");

    const paint = (items) => {
      wishes.replaceChildren();
      items.slice().reverse().forEach((item) => {
        const card = document.createElement("article");
        card.className = "wish";
        const name = document.createElement("strong");
        name.textContent = item.name;
        const status = document.createElement("em");
        status.textContent = item.attend;
        const message = document.createElement("p");
        message.textContent = item.message || "";
        card.append(name, status, message);
        wishes.append(card);
      });
    };

    paint(saved);
    document.getElementById("rsvpForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const entry = {
        name: String(form.get("name")).trim(),
        attend: String(form.get("attend")),
        message: String(form.get("message") || "").trim(),
      };
      saved.push(entry);
      localStorage.setItem(key, JSON.stringify(saved));
      paint(saved);
      event.currentTarget.reset();
      note.textContent = "Cảm ơn " + entry.name + ". Lời nhắn của bạn đã được ghi lại trên máy này.";
    });
  }

  function burstHeart(origin) {
    const rect = origin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const layer = document.createElement("div");
    layer.className = "bloom";
    layer.setAttribute("aria-hidden", "true");

    const glow = document.createElement("div");
    glow.className = "bloom-glow";
    glow.style.left = x + "px";
    glow.style.top = y + "px";
    layer.append(glow);

    const heart = document.createElement("div");
    heart.className = "bloom-heart";
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    heart.innerHTML =
      '<svg viewBox="0 0 64 58" aria-hidden="true"><defs><linearGradient id="heartFill" x1="20%" y1="0%" x2="85%" y2="100%"><stop offset="0%" stop-color="#ffc2d0"/><stop offset="46%" stop-color="#f0728c"/><stop offset="100%" stop-color="#d94b6a"/></linearGradient></defs><path fill="url(#heartFill)" d="M32 54C14 40 4 30 4 18 4 10 10 4 18 4c5 0 9 2.4 14 8 5-5.6 9-8 14-8 8 0 14 6 14 14 0 12-10 22-28 36z"/><ellipse cx="23" cy="16" rx="8" ry="4.5" fill="#fff" opacity="0.42" transform="rotate(-30 23 16)"/></svg>';
    layer.append(heart);

    const colors = [
      ["#fff7f8", "#f6c3cf"],
      ["#fff", "#f3b7c6"],
      ["#fff5f2", "#f0c2b4"],
      ["#fff", "#e9a9bb"],
      ["#fff8f6", "#f8d0da"],
      ["#fff", "#f7c6be"],
    ];
    const reachX = Math.max(x, window.innerWidth - x);
    const reachY = Math.max(y, window.innerHeight - y);
    const petals = document.createDocumentFragment();
    for (let i = 0; i < 58; i += 1) addPetal(petals, x, y, colors, i, reachX, reachY);
    layer.append(petals);

    document.body.append(layer);
    window.setTimeout(() => layer.remove(), 9200);
  }

  function addPetal(layer, x, y, colors, index, reachX, reachY) {
    const petal = document.createElement("span");
    petal.className = "bloom-petal";
    const tone = colors[index % colors.length];
    petal.innerHTML =
      '<svg viewBox="0 0 20 34" aria-hidden="true"><defs><linearGradient id="petal' +
      index +
      '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' +
      tone[0] +
      '"/><stop offset="100%" stop-color="' +
      tone[1] +
      '"/></linearGradient></defs><path fill="url(#petal' +
      index +
      ')" d="M10 1.2C13.4 8 18 15 18 22.2 18 28.4 14.4 33 10 33S2 28.4 2 22.2C2 15 6.6 8 10 1.2z"/></svg>';
    const angle = Math.random() * Math.PI * 2;
    const spread = 0.28 + Math.random() * 0.78;
    const dx = Math.cos(angle) * reachX * spread;
    const dy = Math.sin(angle) * reachY * spread;
    const landX = Math.min(window.innerWidth - 12, Math.max(12, x + dx));
    const landY = Math.min(window.innerHeight * 0.94, Math.max(12, y + dy));
    petal.style.left = x + "px";
    petal.style.top = y + "px";
    petal.style.setProperty("--dx", landX - x + "px");
    petal.style.setProperty("--dy", landY - y + "px");
    petal.style.setProperty("--drift", Math.random() * 36 - 18 + "px");
    petal.style.setProperty("--fall", 22 + Math.random() * 24 + "vh");
    petal.style.setProperty("--tilt", Math.random() * 360 + "deg");
    petal.style.setProperty("--spin", Math.random() * 120 - 60 + "deg");
    petal.style.setProperty("--scale", 0.72 + Math.random() * 0.38);
    petal.style.setProperty("--dur", 7.4 + Math.random() * 1.6 + "s");
    petal.style.setProperty("--delay", 0.08 + Math.random() * 0.16 + "s");
    layer.append(petal);
  }

  function setupMusic() {
    if (!data.music) return;
    const audio = document.getElementById("music");
    const button = document.getElementById("musicBtn");
    audio.src = data.music;
    button.hidden = false;
    button.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
          button.textContent = "Tắt nhạc";
          button.setAttribute("aria-pressed", "true");
        } catch (error) {
          button.textContent = "Không phát được";
        }
      } else {
        audio.pause();
        button.textContent = "Nhạc";
        button.setAttribute("aria-pressed", "false");
      }
    });
  }
})();
