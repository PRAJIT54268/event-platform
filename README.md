# Event Platform / Workshop Registration 🎟️

A full-stack, production-ready workshop registration and payment platform built with Next.js. This application handles user authentication, ticket purchasing via Stripe, role-based access control, and automated email confirmations.

## 🚀 Features

- **Authentication:** Passwordless login using Google & GitHub OAuth via NextAuth.
- **Payments:** Secure checkout flow utilizing Stripe Checkout.
- **Role-Based Access Control:** Differentiated `USER` and `ADMIN` roles, strictly enforced on server-side protected routes.
- **Admin Dashboard:** A dedicated portal for admins to view all registrations and their payment statuses.
- **Automated Emails:** Instant confirmation emails sent via Resend once a Stripe payment is confirmed via webhooks.
- **Robust Database:** Relational data modeled and managed using Prisma ORM with PostgreSQL.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Auth:** [NextAuth.js](https://next-auth.js.org/)
- **Payments:** [Stripe](https://stripe.com/)
- **Emails:** [Resend](https://resend.com/)

## 🏗️ Architecture & Flow

1. **Sign-In:** Users authenticate seamlessly via Google or GitHub.
2. **Checkout:** Users click "Pay & Register", which creates a Stripe Checkout Session. A `PENDING` registration row is created in the database.
3. **Payment:** The user completes the payment on a Stripe-hosted checkout page.
4. **Fulfillment (Webhook):** Stripe sends a cryptographically signed `checkout.session.completed` webhook to the application.
5. **Confirmation:** The server verifies the webhook, marks the database registration as `PAID`, and dispatches a confirmation email using Resend.

*Note: The webhook is the absolute source of truth for payment success, ensuring that users cannot bypass payment by manually navigating to the success URL.*

Below are some of the screenshots of the website, it is deployed but since I don't have a custom domain, hence no other email will recieve the link on mail:- 


<img width="488" height="282" alt="Screenshot 2026-08-31 225504" src="https://github.com/user-attachments/assets/4ad17088-3657-4004-b9c3-04a085d4edd9" />

<img width="539" height="398" alt="Screenshot 2026-08-31 225546" src="https://github.com/user-attachments/assets/e7661c93-f803-431c-aa12-d30492f500fe" />

<img width="524" height="299" alt="Screenshot 2026-08-31 224854" src="https://github.com/user-attachments/assets/b5508b30-3c4a-4892-8bcf-2717bb225797" />

<img width="575" height="269" alt="Screenshot 2026-08-31 224746" src="https://github.com/user-attachments/assets/235a55a6-142d-4964-b509-b942a6f069d7" />

<img width="458" height="239" alt="Screenshot 2026-08-31 224649" src="https://github.com/user-attachments/assets/df508754-127a-49ac-a631-1140f1c0d071" />


## 💻 Getting Started (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/yourusername/event-platform.git
cd event-platform
npm install
```

### 2. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in the `.env` with your PostgreSQL connection string, NextAuth secret, OAuth Client IDs/Secrets, Stripe keys, and Resend API key.

### 3. Database Setup
Push the schema to your PostgreSQL database and generate the Prisma client:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Stripe Webhooks (Required for local payment confirmation)
Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and forward events to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the webhook signing secret (`whsec_...`) printed in the console and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

### 5. Run the Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 👑 Making yourself an Admin
Log in once with your account to create a user record. Then, promote yourself to admin using this script:
```bash
npm run seed:admin -- you@example.com
```
You can now access the `/admin` dashboard.
