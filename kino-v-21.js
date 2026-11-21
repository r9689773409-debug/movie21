(function () {
    'use strict';

    var title = 'Кино в 21:00';
    // Месяцы в Date.UTC отсчитываются с нуля.
    var firstDay = Date.UTC(2026, 10, 21) / 86400000;
    var films = [
        { id: 771, title: 'Один дома', year: 1990 },
        { id: 105, title: 'Назад в будущее', year: 1985 },
        { id: 329, title: 'Парк юрского периода', year: 1993 },
        { id: 607, title: 'Люди в чёрном', year: 1997 },
        { id: 8844, title: 'Джуманджи', year: 1995 },
        { id: 603, title: 'Матрица', year: 1999 },
        { id: 280, title: 'Терминатор 2: Судный день', year: 1991 },
        { id: 562, title: 'Крепкий орешек', year: 1988 },
        { id: 9802, title: 'Скала', year: 1996 },
        { id: 5503, title: 'Беглец', year: 1993 },
        { id: 620, title: 'Охотники за привидениями', year: 1984 },
        { id: 854, title: 'Маска', year: 1994 },
        { id: 137, title: 'День сурка', year: 1993 },
        { id: 13, title: 'Форрест Гамп', year: 1994 },
        { id: 37165, title: 'Шоу Трумана', year: 1998 }
    ];

    function filmAt(now) {
        // UTC нужен только для нумерации местных дат, включая дни перевода часов.
        var day = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000;
        var slot = day - firstDay - (now.getHours() < 21 ? 1 : 0);
        return films[((slot % films.length) + films.length) % films.length];
    }

    function openBroadcast() {
        var screen = $('<section class="kino21-screen">' +
            '<p class="kino21-slot">21:00 · Вечерний сеанс</p>' +
            '<h2 class="kino21-film"></h2>' +
            '<p>Смена фильма в 21:00 по времени устройства</p>' +
            '<div class="kino21-play selector" role="button">Открыть фильм</div></section>');
        var heading = screen.find('.kino21-film');
        var button = screen.find('.kino21-play');
        var timer;
        var closed = false;

        function refresh() {
            var film = filmAt(new Date());
            var label = film.title + ' (' + film.year + ')';
            if (heading.text() !== label) heading.text(label);
        }

        function close() {
            closed = true;
            clearInterval(timer);
            Lampa.Modal.close();
        }

        button.on('hover:enter click', function () {
            if (closed) return;
            var film = filmAt(new Date());
            close();
            Lampa.Activity.push({
                url: '',
                component: 'full',
                source: 'tmdb',
                method: 'movie',
                id: film.id,
                title: film.title,
                page: 1,
                card: { id: film.id, title: film.title, source: 'tmdb', media_type: 'movie' }
            });
        });

        refresh();
        Lampa.Modal.open({
            title: title,
            html: screen,
            size: 'medium',
            align: 'center',
            select: button[0],
            onBack: close
        });
        timer = setInterval(function () {
            if (document.documentElement.contains(screen[0])) refresh();
            else clearInterval(timer);
        }, 1000);
    }

    function init() {
        if (window.kino21Installed) return;
        window.kino21Installed = true;

        $('<style>').text(
            '.kino21-screen{padding:1.55em;border:.38em solid #55413d;border-radius:1.2em;' +
            'color:#ffebc5;background:repeating-linear-gradient(0deg,#241a27 0,#241a27 2px,#2d202e 3px,#2d202e 4px);' +
            'box-shadow:inset 0 0 1.8em #100c14}' +
            '.kino21-slot{margin:0 0 .85em;color:#ffbe7b;font-family:monospace;text-transform:uppercase;letter-spacing:.07em}' +
            '.kino21-film{margin:0;font:700 2em/1.12 Georgia,serif;overflow-wrap:break-word}' +
            '.kino21-play{display:inline-block;margin-top:.4em;padding:.65em 1em;color:#241a27;' +
            'background:#ffbe7b;border-radius:.3em;font-weight:700;cursor:pointer}' +
            '.kino21-play.focus,.kino21-play:hover{background:#fff0d4;outline:.15em solid #ffbe7b;outline-offset:.18em}'
        ).appendTo('head');

        var icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="m8 3 4 4 4-4M7 11h7v5H7zm10 1h1m-1 4h1"/></svg>';

        if (Lampa.Menu && typeof Lampa.Menu.addButton === 'function') {
            Lampa.Menu.addButton(icon, title, openBroadcast);
        } else {
            var item = $('<li class="menu__item selector"><div class="menu__ico">' +
                icon + '</div><div class="menu__text"></div></li>');
            item.find('.menu__text').text(title);
            item.on('hover:enter', openBroadcast);
            $('.menu .menu__list').eq(0).append(item);
        }
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') init();
    });
})();
