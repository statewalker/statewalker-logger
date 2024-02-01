import { describe, expect, it } from "./deps";
import { getLogger } from "../src/logger";

describe("logger", () => {
  it("should be able to define a named loggers", async () => {
    const log = getLogger("test-one");
    expect(typeof log).toBe("object");
    expect(typeof log.debug).toBe("function");
    expect(typeof log.info).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.error).toBe("function");
  });
});
