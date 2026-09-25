export type UiLanguage = "en" | "ru";

export const UI_LANGUAGE_LABELS: Record<UiLanguage, string> = {
  ru: "Русский",
  en: "English",
};

type Message = string | readonly string[];

const EN = {
  "count.node": ["{n} node", "{n} nodes"],
  "count.group": ["{n} group", "{n} groups"],
  "count.connection": ["{n} connection", "{n} connections"],
  "toolbar.folding": "Folding",
  "toolbar.minimap": "Minimap",
  "toolbar.search": "Search",
  "toolbar.searchHint": "Search (/)",
  "toolbar.present": "Presentation",
  "toolbar.presentHint": "Presentation (P)",
  "folding.noFolding": "No folding",
  "folding.enable": "Enable folding",
  "folding.hideControls": "Hide folding controls",
  "folding.showControls": "Show folding controls",
  "folding.expandAll": "Expand all",
  "folding.collapseAll": "Collapse all",
  "folding.levels": "Visible canvas levels",
  "folding.allLevels": "All levels",
  "folding.level": "Level {n}",
  "folding.restore": "Restore folding",
  "folding.hideFocus": "Hide focus controls",
  "folding.showFocus": "Show focus controls",
  "folding.exitFocus": "Exit focus",
  "folding.focusBranch": "Focus branch",
  "folding.focusTarget": "Focus {target}",
  "folding.targetNode": "node",
  "folding.targetGroup": "group",
  "folding.focusBranchCount": ["Focus branch · {n} descendant", "Focus branch · {n} descendants"],
  "folding.collapseBranchCount": ["Collapse branch · {n} descendant", "Collapse branch · {n} descendants"],
  "folding.expandBranch": "Expand branch",
  "folding.collapseBranch": "Collapse branch",
  "folding.branchHidden": "Branch hidden by folded group",
  "folding.expandGroup": "Expand group",
  "folding.collapseGroup": "Collapse group",
  "folding.groupItems": ["{action} group · {n} contained item", "{action} group · {n} contained items"],
  "folding.expand": "Expand",
  "folding.collapse": "Collapse",
  "folding.hiddenNodes": ["{n} hidden node", "{n} hidden nodes"],
  "folding.hiddenGroups": ["{n} hidden group", "{n} hidden groups"],
  "folding.and": " and ",
  "minimap.label": "Canvas minimap",
  "minimap.move": "Move minimap",
  "search.title": "Search",
  "search.close": "Close",
  "search.closeLabel": "Close search",
  "search.inputLabel": "Search canvas",
  "search.placeholder": "Enter a search term",
  "search.empty": "Enter a search term to find matching nodes.",
  "search.none": "No results found for this search term.",
  "search.results": ["{n} result · Press Enter to jump to the active result", "{n} results · Press Enter to jump to the active result"],
  "page.canvas": "Canvas",
  "page.fallbackTitle": "Page",
  "zoom.areaHint": "Release to zoom · Esc to cancel",
  "zoom.group": "Zoom",
  "zoom.out": "Zoom out",
  "zoom.outHint": "Zoom out (Ctrl −)",
  "zoom.in": "Zoom in",
  "zoom.inHint": "Zoom in (Ctrl +)",
  "zoom.fit": "Fit to screen",
  "zoom.fitHint": "Fit to screen (Ctrl 0)",
  "link.offline": "No internet connection is available.",
  "link.blocked": "This website may not allow embedded previews. Use the heading above.",
  "link.open": "Open website ↗",
  "link.interact": "Click to interact",
  "node.emptyLink": "Empty link node",
  "node.emptyPdf": "Empty PDF node",
  "node.emptyMedia": "Empty media node",
  "node.emptyFile": "Empty file node",
  "node.copyLink": "Copy link to this card",
  "node.linkCopied": "Link copied",
  "kind.markdown": "Markdown",
  "kind.image": "Image",
  "kind.pdf": "PDF",
  "kind.audio": "Audio",
  "kind.video": "Video",
  "kind.file": "File",
  "kind.link": "Link",
  "kind.group": "Group",
  "kind.text": "Text",
  "lightbox.label": "Image viewer",
  "lightbox.close": "Close (Esc)",
  "lightbox.previous": "Previous (←)",
  "lightbox.next": "Next (→)",
  "lightbox.zoomOut": "Zoom out (−)",
  "lightbox.zoomIn": "Zoom in (+)",
  "lightbox.reset": "Reset zoom (0)",
  "lightbox.original": "Open original in a new tab",
  "present.previous": "Previous (←)",
  "present.next": "Next (→)",
  "present.exit": "Exit presentation (Esc)",
  "present.counter": "{index} / {total}",
} as const;

export type MessageKey = keyof typeof EN;

const RU: Record<MessageKey, Message> = {
  "count.node": ["{n} карточка", "{n} карточки", "{n} карточек"],
  "count.group": ["{n} группа", "{n} группы", "{n} групп"],
  "count.connection": ["{n} связь", "{n} связи", "{n} связей"],
  "toolbar.folding": "Сворачивание",
  "toolbar.minimap": "Мини-карта",
  "toolbar.search": "Поиск",
  "toolbar.searchHint": "Поиск (/)",
  "toolbar.present": "Презентация",
  "toolbar.presentHint": "Презентация (P)",
  "folding.noFolding": "Без сворачивания",
  "folding.enable": "Включить сворачивание",
  "folding.hideControls": "Скрыть кнопки сворачивания",
  "folding.showControls": "Показать кнопки сворачивания",
  "folding.expandAll": "Развернуть всё",
  "folding.collapseAll": "Свернуть всё",
  "folding.levels": "Видимые уровни канваса",
  "folding.allLevels": "Все уровни",
  "folding.level": "Уровень {n}",
  "folding.restore": "Вернуть сворачивание из Obsidian",
  "folding.hideFocus": "Скрыть кнопки фокуса",
  "folding.showFocus": "Показать кнопки фокуса",
  "folding.exitFocus": "Выйти из фокуса",
  "folding.focusBranch": "Фокус на ветке",
  "folding.focusTarget": "Фокус: {target}",
  "folding.targetNode": "карточка",
  "folding.targetGroup": "группа",
  "folding.focusBranchCount": ["Фокус на ветке · {n} карточка", "Фокус на ветке · {n} карточки", "Фокус на ветке · {n} карточек"],
  "folding.collapseBranchCount": ["Свернуть ветку · {n} карточка", "Свернуть ветку · {n} карточки", "Свернуть ветку · {n} карточек"],
  "folding.expandBranch": "Развернуть ветку",
  "folding.collapseBranch": "Свернуть ветку",
  "folding.branchHidden": "Ветка скрыта свёрнутой группой",
  "folding.expandGroup": "Развернуть группу",
  "folding.collapseGroup": "Свернуть группу",
  "folding.groupItems": ["{action} группу · внутри {n} элемент", "{action} группу · внутри {n} элемента", "{action} группу · внутри {n} элементов"],
  "folding.expand": "Развернуть",
  "folding.collapse": "Свернуть",
  "folding.hiddenNodes": ["{n} скрытая карточка", "{n} скрытые карточки", "{n} скрытых карточек"],
  "folding.hiddenGroups": ["{n} скрытая группа", "{n} скрытые группы", "{n} скрытых групп"],
  "folding.and": " и ",
  "minimap.label": "Мини-карта канваса",
  "minimap.move": "Переместить мини-карту",
  "search.title": "Поиск",
  "search.close": "Закрыть",
  "search.closeLabel": "Закрыть поиск",
  "search.inputLabel": "Поиск по канвасу",
  "search.placeholder": "Что ищем?",
  "search.empty": "Введите запрос, чтобы найти карточки.",
  "search.none": "Ничего не найдено.",
  "search.results": ["{n} результат · Enter — перейти к выбранному", "{n} результата · Enter — перейти к выбранному", "{n} результатов · Enter — перейти к выбранному"],
  "page.canvas": "Канвас",
  "page.fallbackTitle": "Страница",
  "zoom.areaHint": "Отпустите, чтобы приблизить · Esc — отмена",
  "zoom.group": "Масштаб",
  "zoom.out": "Уменьшить",
  "zoom.outHint": "Уменьшить (Ctrl −)",
  "zoom.in": "Увеличить",
  "zoom.inHint": "Увеличить (Ctrl +)",
  "zoom.fit": "Вписать в экран",
  "zoom.fitHint": "Вписать в экран (Ctrl 0)",
  "link.offline": "Нет подключения к интернету.",
  "link.blocked": "Сайт не разрешает встраивание. Откройте ссылку в заголовке.",
  "link.open": "Открыть сайт ↗",
  "link.interact": "Нажмите, чтобы взаимодействовать",
  "node.emptyLink": "Пустая ссылка",
  "node.emptyPdf": "Пустой PDF",
  "node.emptyMedia": "Пустое медиа",
  "node.emptyFile": "Пустой файл",
  "node.copyLink": "Скопировать ссылку на карточку",
  "node.linkCopied": "Ссылка скопирована",
  "kind.markdown": "Заметка",
  "kind.image": "Картинка",
  "kind.pdf": "PDF",
  "kind.audio": "Аудио",
  "kind.video": "Видео",
  "kind.file": "Файл",
  "kind.link": "Ссылка",
  "kind.group": "Группа",
  "kind.text": "Текст",
  "lightbox.label": "Просмотр картинки",
  "lightbox.close": "Закрыть (Esc)",
  "lightbox.previous": "Предыдущая (←)",
  "lightbox.next": "Следующая (→)",
  "lightbox.zoomOut": "Уменьшить (−)",
  "lightbox.zoomIn": "Увеличить (+)",
  "lightbox.reset": "Сбросить масштаб (0)",
  "lightbox.original": "Открыть оригинал в новой вкладке",
  "present.previous": "Назад (←)",
  "present.next": "Дальше (→)",
  "present.exit": "Выйти из презентации (Esc)",
  "present.counter": "{index} из {total}",
};

const MESSAGES: Record<UiLanguage, Record<MessageKey, Message>> = { en: EN, ru: RU };

let activeLanguage: UiLanguage = "en";

export function normalizeUiLanguage(value: unknown): UiLanguage {
  return value === "ru" ? "ru" : "en";
}

export function getUiLanguage(): UiLanguage {
  return activeLanguage;
}

export async function withUiLanguage<T>(language: unknown, run: () => Promise<T>): Promise<T> {
  const previous = activeLanguage;
  activeLanguage = normalizeUiLanguage(language);
  try {
    return await run();
  } finally {
    activeLanguage = previous;
  }
}

function pluralIndex(language: UiLanguage, n: number): number {
  if (language === "en") return n === 1 ? 0 : 1;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 0;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
  return 2;
}

export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  const message: Message = MESSAGES[activeLanguage][key];
  const template: string = typeof message === "string"
    ? message
    : message[Math.min(pluralIndex(activeLanguage, Math.abs(Number(vars.n) || 0)), message.length - 1)] ?? "";
  return template.replace(/\{(\w+)\}/g, (match: string, name: string) => (name in vars ? String(vars[name]) : match));
}

export function buildRuntimeI18n(): string {
  return `
      const I18N_LANGUAGE = ${JSON.stringify(activeLanguage)};
      const I18N_MESSAGES = ${JSON.stringify(MESSAGES[activeLanguage]).replace(/</g, "\\u003c")};
      function i18nPluralIndex(n) {
        if (I18N_LANGUAGE === "en") return n === 1 ? 0 : 1;
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return 0;
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
        return 2;
      }
      function t(key, vars) {
        const values = vars || {};
        const message = I18N_MESSAGES[key];
        if (message === undefined) return key;
        const template = Array.isArray(message)
          ? message[Math.min(i18nPluralIndex(Math.abs(Number(values.n) || 0)), message.length - 1)]
          : message;
        return template.replace(/\\{(\\w+)\\}/g, (match, name) => (name in values ? String(values[name]) : match));
      }
`;
}
