import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { applySeo, canonicalUrlFor, SITE_URL } from "../src/components/seo/seoCore.js";
import { routeSeoFor } from "../src/components/seo/seoRoutes.js";

class FakeElement {
  constructor(tagName, owner) {
    this.tagName = tagName.toLowerCase();
    this.owner = owner;
    this.attributes = {};
    this.dataset = {};
    this.textContent = "";
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  remove() { this.owner.elements = this.owner.elements.filter((element) => element !== this); }
}

const matches = (element, selector) => {
  if (selector === '[data-seo-optional="true"]') return element.dataset.seoOptional === "true";
  const tag = selector.match(/^[a-z]+/)?.[0];
  if (tag && element.tagName !== tag) return false;
  const attribute = selector.match(/\[([^=]+)="([^"]+)"\]/);
  return !attribute || (element.attributes[attribute[1]] ?? element[attribute[1]]) === attribute[2];
};

const installDom = () => {
  const head = {
    elements: [],
    querySelector(selector) { return this.elements.find((element) => matches(element, selector)) || null; },
    querySelectorAll(selector) { return this.elements.filter((element) => matches(element, selector)); },
    appendChild(element) { this.elements.push(element); },
  };
  globalThis.document = {
    title: "",
    documentElement: {},
    head,
    createElement(tagName) { return new FakeElement(tagName, head); },
  };
  return head;
};

const count = (head, selector) => head.querySelectorAll(selector).length;

test("shared initial HTML has no conflicting canonical or robots directive", () => {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /rel=["']canonical["']/i);
  assert.doesNotMatch(html, /<meta[^>]+name=["']robots["']/i);
});

test("route policy classifies representative public and private URLs", () => {
  assert.equal(routeSeoFor("/").noindex, false);
  assert.equal(routeSeoFor("/courses").noindex, false);
  assert.equal(routeSeoFor("/courses/example-course").noindex, false);
  assert.equal(routeSeoFor("/login").noindex, true);
  assert.equal(routeSeoFor("/learner-dashboard").noindex, true);
  assert.equal(routeSeoFor("/does-not-exist").noindex, true);
});

test("route matcher uses explicit semantics and normalizes trailing slashes", () => {
  const expectations = {
    "/admin": true,
    "/admin/": true,
    "/administrator": true,
    "/admin-course": true,
    "/student": true,
    "/student-profile": true,
    "/studentabc": true,
    "/teacher": true,
    "/teacher-dashboard": true,
    "/instructors/123": false,
    "/instructor-dashboard": true,
    "/login": true,
    "/login/help": true,
    "/courses": false,
    "/courses/example": false,
    "/certificates/verify/123": true,
  };
  Object.entries(expectations).forEach(([path, noindex]) => {
    assert.equal(routeSeoFor(path).noindex, noindex, path);
  });
});

test("canonical generation uses the production origin and normalizes tracking variants", () => {
  const expectations = {
    "/": `${SITE_URL}/`,
    "/courses": `${SITE_URL}/courses`,
    "/courses/example-course": `${SITE_URL}/courses/example-course`,
    "/courses/example-course/": `${SITE_URL}/courses/example-course`,
    "/courses/example-course?utm_source=facebook": `${SITE_URL}/courses/example-course`,
    "/courses/example-course?fbclid=123": `${SITE_URL}/courses/example-course`,
    "/courses/example-course?page=2&utm_medium=social#reviews": `${SITE_URL}/courses/example-course?page=2`,
    "/blog/example": `${SITE_URL}/blog/example`,
    "/instructors/example-instructor": `${SITE_URL}/instructors/example-instructor`,
    "/login": `${SITE_URL}/login`,
    "/unknown-page": `${SITE_URL}/unknown-page`,
    "http://localhost:5173/courses/example": `${SITE_URL}/courses/example`,
    "https://api.alacademeya.com/courses/example": `${SITE_URL}/courses/example`,
  };
  Object.entries(expectations).forEach(([value, canonical]) => {
    assert.equal(canonicalUrlFor(value), canonical, value);
  });
});

test("SPA metadata transitions replace tags and remove stale structured data", () => {
  const head = installDom();
  const sequence = [
    routeSeoFor("/"),
    { title: "Course A", description: "Course A description", path: "/courses/course-a", structuredData: { "@type": "Course", name: "Course A" } },
    { title: "Course B", description: "Course B description", path: "/courses/course-b", structuredData: { "@type": "Course", name: "Course B" } },
    routeSeoFor("/login"),
    { title: "Article", description: "Article description", path: "/blog/article", type: "article", structuredData: { "@type": "Article", headline: "Article" } },
    routeSeoFor("/does-not-exist"),
  ];

  for (const metadata of sequence) {
    applySeo(metadata);
    assert.equal(count(head, 'link[rel="canonical"]'), 1);
    assert.equal(count(head, 'meta[name="description"]'), 1);
    assert.equal(count(head, 'meta[name="robots"]'), 1);
    assert.equal(count(head, 'meta[property="og:title"]'), 1);
    assert.equal(count(head, 'meta[name="twitter:title"]'), 1);
    assert.ok(count(head, 'script[type="application/ld+json"]') <= 1);
  }

  assert.equal(head.querySelector('link[rel="canonical"]').href, `${SITE_URL}/does-not-exist`);
  assert.equal(head.querySelector('meta[name="robots"]').getAttribute("content"), "noindex, nofollow");
  assert.equal(count(head, 'script[type="application/ld+json"]'), 0);
});

test("canonical ignores query parameters when route pathname is supplied", () => {
  const head = installDom();
  applySeo({ title: "Courses", path: "/courses" });
  assert.equal(head.querySelector('link[rel="canonical"]').href, `${SITE_URL}/courses`);
});
