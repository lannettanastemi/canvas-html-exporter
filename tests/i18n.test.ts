import assert from "node:assert/strict";
import { CanvasData, convertCanvasToHtml } from "../src/converter";
import { getUiLanguage, t, withUiLanguage } from "../src/render/i18n";

function test(name: string, fn: () => Promise<void> | void): Promise<void> | void {
  try {
    const result = fn();
    if (result) {
      return result.then(
        () => console.log(`PASS ${name}`),
        (error) => {
          console.error(`FAIL ${name}`);
          throw error;
        },
      );
    }
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

(async () => {
  await test("pluralizes russian counters", async () => {
    await withUiLanguage("ru", async () => {
      assert.equal(t("count.node", { n: 1 }), "1 карточка");
      assert.equal(t("count.node", { n: 3 }), "3 карточки");
      assert.equal(t("count.node", { n: 5 }), "5 карточек");
      assert.equal(t("count.node", { n: 11 }), "11 карточек");
      assert.equal(t("count.node", { n: 21 }), "21 карточка");
      assert.equal(t("count.connection", { n: 22 }), "22 связи");
    });
    assert.equal(getUiLanguage(), "en", "language is restored after rendering");
    assert.equal(t("count.node", { n: 2 }), "2 nodes");
  });

  await test("renders the canvas page in russian", async () => {
    const data: CanvasData = {
      nodes: [
        { id: "a", type: "text", text: "A", x: 0, y: 0, width: 100, height: 100 },
        { id: "b", type: "text", text: "B", x: 200, y: 0, width: 100, height: 100 },
      ],
      edges: [{ id: "e", fromNode: "a", toNode: "b" }],
    };
    const html = await convertCanvasToHtml(data, { darkMode: true, title: "Тест", language: "ru" });
    assert.match(html, /<html lang="ru">/);
    assert.match(html, /2 карточки · 1 связь/);
    assert.match(html, /title="Поиск \(\/\)" aria-label="Поиск"/);
    assert.match(html, /placeholder="Что ищем\?"/);
    assert.match(html, /const I18N_LANGUAGE = "ru"/);
    assert.match(html, /content: "Нажмите, чтобы взаимодействовать"/);
    assert.doesNotMatch(html, /2 nodes/);
    const english = await convertCanvasToHtml(data, { darkMode: true, title: "Test" });
    assert.match(english, /<html lang="en">/);
    assert.match(english, /2 nodes · 1 connection/);
  });
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
