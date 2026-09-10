# Service Hub — decisions we need before we can build

The platform foundations are complete: sign-in, roles and permissions, the
onboarding wizard with validation, and the admin screens. The remaining work
splits into two groups — things we can simply build, and things where we need a
decision from you first.

This is the second group. Nine questions, grouped by area. Answering them
unblocks the work; guessing at them risks building the wrong thing.

---

## 1. Patch Management

The screens exist as a design, but nothing behind them has been built. Five
questions decide what it becomes.

**1.1 — Is there a WSUS instance we can connect to, and how do we reach it?**
WSUS has no web API. Connecting to it means either existing middleware on your
side, reading its database directly, or a small component running on Windows.
If there is no WSUS, we need to know where patch information should come from
instead.

**1.2 — Should the Hub carry out deployments, or record deployments made elsewhere?**
*This is the most important question on the list.* Recording means the Hub
reports on what your existing tooling already did — a few weeks of work.
Carrying out deployments means the Hub installs patches on machines, which needs
agents or integration with SCCM/Intune, and is a project in its own right.

**1.3 — What is an "endpoint"?**
The screens count endpoints. Are these the cell computers already tracked in
onboarding, or a separate inventory of servers and workstations?

**1.4 — Whose systems are being patched?**
S&B's own estate only, or do partners and customers see the machines at their
own sites? If customers see their own, we must build that separation in from the
start — it is expensive to add later.

**1.5 — What does a "patch cycle" consist of?**
The design implies test → pilot → production. Is that your actual process, who
approves each stage, and are there fixed maintenance windows?

---

## 2. Email notifications

The Hub currently sends no email at all. The settings screen offers to notify
people on submission, approval and rejection, but nothing is connected.

**2.1 — What should send the mail?**
An internal S&B mail relay, or a third-party service? We will need credentials
and a sending address that your mail systems will not treat as spam.

**2.2 — Who is notified, and when?**
For each of the three events — submitted, approved, rejected — who should
receive a message? We have no record of an agreed rule.

**2.3 — Should partners and customers receive email, or only S&B staff?**
This is a data-protection question as much as a product one.

**2.4 — Are notification preferences set per person, or for the whole platform?**
The current design contains both, and they contradict each other.

---

## 3. Four smaller items

The work here is modest, but each needs a decision before it can start.

**3.1 — Which wizard steps apply to which product?**
Step 1 tells the user the wizard will adapt to the product they select. It does
not currently adapt. We need to know which of the seven steps each of the four
products actually requires.

**3.2 — What is an "export"?**
Two settings refer to exporting, but nothing defines what is produced or who
receives it. The approved configuration as a data file for your technical team?
A document for the customer?

**3.3 — What happens when a submission is rejected?**
Today a submission can only be approved. Should a reviewer be able to send it
back — and if so, with a required reason, and returning the submitter to a
particular step?

**3.4 — Do country templates suggest values, or enforce them?**
A template can pre-fill the wizard and let the user change anything, or it can
lock certain fields. The two behave differently for your teams.

---

## If you answer only one

**Question 1.2** — whether the Hub deploys patches or reports on them. It is the
difference between a few weeks of work and a multi-month integration, and every
other Patch Management question follows from it.

We are happy to walk through any of these on a call.
