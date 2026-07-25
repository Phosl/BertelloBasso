import {describe, expect, it} from "vitest";
import {languageSwitchPath, publicPath} from "./routing";

describe("photography routing", () => {
  it("builds localised gallery URLs", () => {
    expect(publicPath("it", "photography", "raccolta")).toBe(
      "/fotografie/raccolta",
    );
    expect(publicPath("en", "photography", "raccolta")).toBe(
      "/en/photography/raccolta",
    );
  });

  it("keeps the gallery slug while switching language", () => {
    expect(languageSwitchPath("/fotografie/raccolta", "en")).toBe(
      "/en/photography/raccolta",
    );
    expect(languageSwitchPath("/en/photography/raccolta", "it")).toBe(
      "/fotografie/raccolta",
    );
  });
});
