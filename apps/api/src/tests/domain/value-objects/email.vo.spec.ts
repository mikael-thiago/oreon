import { describe, expect, it } from "vitest";
import { Email } from "../../../domain/value-objects/email.vo.js";
import { expectToBeOk, expectToBeFailure } from "../../helpers/assertions.js";
import { INVALID_EMAILS, VALID_EMAILS } from "../../helpers/test-data.js";

describe("Email Value Object", () => {
  describe("Creation", () => {
    it("should create valid email", () => {
      const result = Email.criar(VALID_EMAILS.EMAIL_1);

      expectToBeOk(result);
    });

    it("should create email from multiple valid formats", () => {
      const result1 = Email.criar(VALID_EMAILS.EMAIL_1);
      const result2 = Email.criar(VALID_EMAILS.EMAIL_2);
      const result3 = Email.criar(VALID_EMAILS.EMAIL_3);
      const result4 = Email.criar(VALID_EMAILS.EMAIL_4);
      const result5 = Email.criar(VALID_EMAILS.EMAIL_5);

      expectToBeOk(result1);
      expectToBeOk(result2);
      expectToBeOk(result3);
      expectToBeOk(result4);
      expectToBeOk(result5);
    });

    it("should reject empty email", () => {
      const result = Email.criar(INVALID_EMAILS.EMPTY);

      expectToBeFailure(result);
    });

    it("should reject email without @", () => {
      const result = Email.criar(INVALID_EMAILS.NO_AT);

      expectToBeFailure(result);
    });

    it("should reject email without domain", () => {
      const result = Email.criar(INVALID_EMAILS.NO_DOMAIN);

      expectToBeFailure(result);
    });

    it("should reject email without TLD", () => {
      const result = Email.criar(INVALID_EMAILS.NO_TLD);

      expectToBeFailure(result);
    });

    it("should reject email with spaces", () => {
      const result = Email.criar(INVALID_EMAILS.SPACES);

      expectToBeFailure(result);
    });

    it("should reject email too long", () => {
      const longEmail = "a".repeat(250) + "@test.com";
      const result = Email.criar(longEmail);

      expectToBeFailure(result);
    });

    it("should reject email with only spaces", () => {
      const result = Email.criar("   ");

      expectToBeFailure(result);
    });
  });

  describe("Normalization", () => {
    it("should normalize to lowercase", () => {
      const result = Email.criar("JOAO.SILVA@EXAMPLE.COM");

      if (expectToBeOk(result)) {
        expect(result.value.getValor()).toBe("joao.silva@example.com");
      }
    });

    it("should normalize mixed case email", () => {
      const result = Email.criar("JoAo.SiLvA@ExAmPlE.cOm");

      if (expectToBeOk(result)) {
        expect(result.value.getValor()).toBe("joao.silva@example.com");
      }
    });

    it("should trim whitespace", () => {
      const result = Email.criar("  joao.silva@example.com  ");

      if (expectToBeOk(result)) {
        expect(result.value.getValor()).toBe("joao.silva@example.com");
      }
    });

    it("should trim and normalize", () => {
      const result = Email.criar("  JOAO.SILVA@EXAMPLE.COM");

      if (expectToBeOk(result)) {
        expect(result.value.getValor()).toBe("joao.silva@example.com");
      }
    });
  });

  describe("Extraction Methods", () => {
    it("should extract domain correctly", () => {
      const email = Email.criar(VALID_EMAILS.EMAIL_1);

      if (expectToBeOk(email)) {
        const domain = email.value.getDominio();

        expect(domain).toBe("example.com");
      }
    });

    it("should extract domain from .edu.br", () => {
      const email = Email.criar(VALID_EMAILS.EMAIL_2);

      if (expectToBeOk(email)) {
        const domain = email.value.getDominio();

        expect(domain).toBe("escola.edu.br");
      }
    });

    it("should extract domain from .com.br", () => {
      const email = Email.criar(VALID_EMAILS.EMAIL_3);

      if (expectToBeOk(email)) {
        const domain = email.value.getDominio();

        expect(domain).toBe("oreon.com.br");
      }
    });

    it("should extract local part correctly", () => {
      const email = Email.criar(VALID_EMAILS.EMAIL_1);

      if (expectToBeOk(email)) {
        const local = email.value.getLocal();

        expect(local).toBe("joao.silva");
      }
    });

    it("should extract local part with numbers", () => {
      const email = Email.criar(VALID_EMAILS.EMAIL_5);

      if (expectToBeOk(email)) {
        const local = email.value.getLocal();

        expect(local).toBe("aluno123");
      }
    });

    it("should extract local part from simple email", () => {
      const email = Email.criar("admin@test.org");

      if (expectToBeOk(email)) {
        const local = email.value.getLocal();

        expect(local).toBe("admin");
      }
    });
  });

  describe("Value Retrieval", () => {
    it("should return email with toString", () => {
      const email = Email.criar(VALID_EMAILS.EMAIL_1);

      if (expectToBeOk(email)) {
        const str = email.value.toString();

        expect(str).toBe("joao.silva@example.com");
      }
    });

    it("should return email with getValor", () => {
      const email = Email.criar(VALID_EMAILS.EMAIL_1);

      if (expectToBeOk(email)) {
        const valor = email.value.getValor();

        expect(valor).toBe("joao.silva@example.com");
      }
    });

    it("should return normalized email", () => {
      const email = Email.criar("JOAO.SILVA@EXAMPLE.COM");

      if (expectToBeOk(email)) {
        expect(email.value.getValor()).toBe("joao.silva@example.com");
        expect(email.value.toString()).toBe("joao.silva@example.com");
      }
    });
  });

  describe("Comparison", () => {
    it("should compare emails correctly when equal", () => {
      const email1 = Email.criar(VALID_EMAILS.EMAIL_1);
      const email2 = Email.criar(VALID_EMAILS.EMAIL_1);

      if (expectToBeOk(email1) && expectToBeOk(email2)) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });

    it("should compare emails correctly when different", () => {
      const email1 = Email.criar(VALID_EMAILS.EMAIL_1);
      const email2 = Email.criar(VALID_EMAILS.EMAIL_2);

      if (expectToBeOk(email1) && expectToBeOk(email2)) {
        expect(email1.value.equals(email2.value)).toBe(false);
      }
    });

    it("should compare emails case-insensitively", () => {
      const email1 = Email.criar("joao.silva@example.com");
      const email2 = Email.criar("JOAO.SILVA@EXAMPLE.COM");

      if (expectToBeOk(email1) && expectToBeOk(email2)) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });

    it("should compare emails ignoring whitespace", () => {
      const email1 = Email.criar("joao.silva@example.com");

      const email2 = Email.criar("  joao.silva@example.com  ");

      if (expectToBeOk(email1) && expectToBeOk(email2)) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });
  });

  describe("Reconstitution", () => {
    it("should reconstitute email from database without validation", () => {
      const email = Email.reconstituir("joao.silva@example.com");

      expect(email).toBeInstanceOf(Email);
      expect(email.getValor()).toBe("joao.silva@example.com");
    });

    it("should reconstitute and normalize", () => {
      const email = Email.reconstituir("JOAO.SILVA@EXAMPLE.COM");

      expect(email.getValor()).toBe("joao.silva@example.com");
    });

    it("should reconstitute and trim", () => {
      const email = Email.reconstituir("  joao.silva@example.com  ");

      expect(email.getValor()).toBe("joao.silva@example.com");
    });
  });

  describe("Valid Email Formats", () => {
    it("should accept email with dots in local part", () => {
      const result = Email.criar("first.last@example.com");

      expectToBeOk(result);
    });

    it("should accept email with numbers", () => {
      const result = Email.criar("user123@example.com");

      expectToBeOk(result);
    });

    it("should accept email with hyphen in domain", () => {
      const result = Email.criar("user@my-domain.com");

      expectToBeOk(result);
    });

    it("should accept email with subdomain", () => {
      const result = Email.criar("user@mail.example.com");

      expectToBeOk(result);
    });

    it("should accept email with plus sign", () => {
      const result = Email.criar("user+tag@example.com");

      expectToBeOk(result);
    });

    it("should accept email with underscore", () => {
      const result = Email.criar("user_name@example.com");

      expectToBeOk(result);
    });
  });

  describe("Invalid Email Formats", () => {
    it("should reject email with double @", () => {
      const result = Email.criar("user@@example.com");

      expectToBeFailure(result);
    });

    it("should reject email starting with @", () => {
      const result = Email.criar("@example.com");

      expectToBeFailure(result);
    });

    it("should reject email ending with @", () => {
      const result = Email.criar("user@");

      expectToBeFailure(result);
    });

    it("should reject email with space in local part", () => {
      const result = Email.criar("user name@example.com");

      expectToBeFailure(result);
    });

    it("should reject email with space in domain", () => {
      const result = Email.criar("user@exam ple.com");

      expectToBeFailure(result);
    });
  });

  describe("Edge Cases", () => {
    it("should handle email at maximum valid length", () => {
      const localPart = "a".repeat(64);
      const domain = "b".repeat(63) + ".com";
      const longEmail = `${localPart}@${domain}`;

      const result = Email.criar(longEmail);

      expectToBeOk(result);
    });

    it("should validate all test emails", () => {
      Object.values(VALID_EMAILS).forEach((email) => {
        const result = Email.criar(email);
        expectToBeOk(result);
      });
    });

    it("should reject all invalid test emails", () => {
      Object.values(INVALID_EMAILS).forEach((email) => {
        const result = Email.criar(email);
        expectToBeFailure(result);
      });
    });
  });
});
