import { expect, test } from "@playwright/test";

const API = process.env.BACKEND_URL ?? "http://localhost:8000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@gov.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe-2026!";

function uniqueEmail(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`;
}

test.describe("DepartmentSense — full app e2e", () => {
	test.beforeEach(async ({ context }) => {
		await context.clearCookies();
	});

	test("backend is healthy", async ({ request }) => {
		const res = await request.get(`${API}/health`);
		expect(res.ok()).toBeTruthy();
		const body = await res.json();
		expect(body.status).toBe("ok");
		expect(["keyword", "hf-inference", "local"]).toContain(body.ml_mode);
	});

	test("backend lists 92 seeded departments", async ({ request }) => {
		const res = await request.get(`${API}/api/departments`);
		expect(res.ok()).toBeTruthy();
		const depts = await res.json();
		expect(depts.length).toBeGreaterThanOrEqual(92);
		expect(depts[0]).toHaveProperty("id");
		expect(depts[0]).toHaveProperty("officerEmail");
		expect(depts[0]).toHaveProperty("icon");
	});

	test("admin signs in with seeded credentials", async ({ page }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /administrator/i }).click();
		await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
		await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
		await page.getByRole("button", { name: /continue/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });
		await expect(page.getByRole("heading", { name: /admin overview/i })).toBeVisible();
	});

	test("citizen can sign up and submit a complaint without duplication", async ({ page, request }) => {
		const email = uniqueEmail("citizen");
		const password = "Pa55word!";

		await page.goto("/auth");
		await page.getByRole("button", { name: /citizen/i }).click();
		await page.getByRole("button", { name: /create one/i }).click();

		await page.getByLabel(/full name/i).fill("E2E Citizen");
		await page.getByLabel(/^email address$/i).fill(email);
		await page.getByLabel(/^password$/i).fill(password);
		await page.getByLabel(/confirm password/i).fill(password);
		await page.locator("#signup-terms").check();
		await page
			.getByRole("button", { name: /create account/i })
			.dispatchEvent("click");
		await page.waitForURL("**/dashboard", { timeout: 20_000 });

		await page.goto("/dashboard/submit");
		await page.getByLabel(/full name/i).fill("E2E Citizen");
		await page.getByLabel(/^email$/i).fill(email);
		await page.getByRole("button", { name: /continue/i }).click();

		await page.getByLabel(/address \/ locality/i).fill("Sector 17, Block B");
		await page.getByRole("button", { name: /continue/i }).click();

		await page.getByLabel(/^subject$/i).fill("Power outage for 12 hours");
		await page
			.getByLabel(/describe the issue/i)
			.fill(
				"Power has been completely out for 12 hours straight. Elderly residents at risk."
			);
		await page.getByRole("button", { name: /continue/i }).click();

		await page.getByRole("button", { name: /submit complaint/i }).click();
		await page.waitForURL(/\/dashboard\/processing/, { timeout: 15_000 });
		await expect(page.getByRole("heading", { name: /routed successfully/i })).toBeVisible({
			timeout: 60_000,
		});
		await expect(page.locator("text=/GRV-\\d{4}-\\d{5}/").first()).toBeVisible();
		await expect(page.getByRole("link", { name: /download PDF receipt/i })).toBeVisible();

		// Duplication check: exactly one complaint persisted for this email.
		const list = await (
			await request.get(`${API}/api/complaints?citizenEmail=${encodeURIComponent(email)}`)
		).json();
		expect(list.length).toBe(1);
	});

	test("admin: create department, generate code, dept-head signs in", async ({ page, request }) => {
		// Create department directly via API (faster + isolates the auth flow under test).
		const deptName = `Test Dept ${Date.now()}`;
		const officerEmail = uniqueEmail("head");
		const created = await (
			await request.post(`${API}/api/departments`, {
				data: {
					name: deptName,
					description: "E2E created dept",
					headName: "Head E2E",
					officerEmail,
					officerContact: "+91 00000 00000",
					officerAddress: "Test Address",
					icon: "Building2",
					color: "#3b82f6",
				},
			})
		).json();
		expect(created).toHaveProperty("id");

		const gen = await (
			await request.post(`${API}/api/departments/${created.id}/generate-code`)
		).json();
		expect(gen.verificationCode).toMatch(/^\d{6}$/);

		// Dept-head signs in (email-only step, then 6-digit code)
		await page.goto("/auth");
		await page.getByRole("button", { name: /department head/i }).click();
		await page.getByLabel(/^email address$/i).fill(officerEmail);
		await page.getByRole("button", { name: /continue/i }).click();

		// Enter the 6-digit code. The first input gets focus.
		const code = gen.verificationCode as string;
		const digits = code.split("");
		for (let i = 0; i < digits.length; i++) {
			await page.getByLabel(`Verification digit ${i + 1}`).fill(digits[i]!);
		}
		await page.getByRole("button", { name: /verify and continue/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });
	});

	test("dept-head rejected with wrong code", async ({ page, request }) => {
		const deptName = `Reject Dept ${Date.now()}`;
		const officerEmail = uniqueEmail("rejhead");
		await request.post(`${API}/api/departments`, {
			data: { name: deptName, officerEmail },
		});

		await page.goto("/auth");
		await page.getByRole("button", { name: /department head/i }).click();
		await page.getByLabel(/^email address$/i).fill(officerEmail);
		await page.getByRole("button", { name: /continue/i }).click();

		for (let i = 0; i < 6; i++) {
			await page.getByLabel(`Verification digit ${i + 1}`).fill("0");
		}
		await page.getByRole("button", { name: /verify and continue/i }).click();
		await expect(page.getByRole("alert").first()).toBeVisible();
	});

	test("citizen signup rejects weak password", async ({ page }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /citizen/i }).click();
		await page.getByRole("button", { name: /create one/i }).click();
		await page.getByLabel(/full name/i).fill("Weak Pwd User");
		await page.getByLabel(/^email address$/i).fill(uniqueEmail("weak"));
		await page.getByLabel(/^password$/i).fill("short");
		await page.getByLabel(/confirm password/i).fill("short");
		await page.locator("#signup-terms").check();
		await page.getByRole("button", { name: /create account/i }).click();
		await expect(page.getByRole("alert").first()).toBeVisible();
	});

	test("PDF endpoint streams a ticket PDF for a real submission", async ({ request }) => {
		// Create a complaint via API so the PDF endpoint has a target.
		const complaint = await (
			await request.post(`${API}/api/complaints`, {
				data: {
					citizenName: "PDF Tester",
					citizenEmail: uniqueEmail("pdf"),
					subject: "Garbage uncollected for several days",
					body: "Sanitation issue in our area; collection truck has not arrived for over a week.",
					language: "en",
					location: "Test Block 9",
				},
			})
		).json();
		const ticket = await request.get(`${API}/api/pdf/ticket/${complaint.id}`);
		expect(ticket.ok()).toBeTruthy();
		expect(ticket.headers()["content-type"]).toContain("application/pdf");
	});
});
