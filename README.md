# Personal Budget App

A modern, full-stack personal budgeting application built with Next.js, Tailwind CSS, and LocalStorage. Track your income, expenses, and yearly savings projections with a beautiful SaaS-style interface.

## Features

✅ **Dashboard Metrics**
- Total Monthly Income
- Total Monthly Expenses
- Remaining Monthly Savings

✅ **Yearly Projection**
- Automatic calculation of yearly savings (Monthly Savings × 12)
- Month-by-month breakdown view

✅ **Transaction Manager**
- Add income and expenses
- Categorize transactions
- Delete transactions
- View recent transaction history

✅ **Category Management**
- Add custom categories (e.g., "Streaming Services", "Car Prep")
- Pre-loaded with common categories

✅ **Visual Breakdowns**
- Expense breakdown by category with percentage bars
- Income breakdown by category with percentage bars

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Persistence**: Browser LocalStorage (with API-style functions for easy database migration)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Navigate to the project directory:
```bash
cd BudgetAppje
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Transactions

1. Fill out the "Add Transaction" form on the left side:
   - **Name**: Description of the transaction (e.g., "Monthly Salary")
   - **Amount**: Dollar amount (e.g., 5000.00)
   - **Category**: Select from existing categories
   - **Type**: Choose "Income" or "Expense"

2. Click "Add Transaction"

3. Your transaction will appear in the "Recent Transactions" list and update all metrics automatically

### Managing Categories

1. In the "Manage Categories" section, enter a new category name
2. Click the green "+" button
3. The category will be added and available in the transaction form dropdown

### Viewing Yearly Projections

1. The Yearly Projection card shows your total projected yearly savings
2. Click "Show Details" to see a month-by-month breakdown
3. Click "Hide Details" to collapse the view

### Deleting Transactions

- Click the trash icon next to any transaction in the "Recent Transactions" list

## Data Persistence

All data is stored in your browser's LocalStorage, which means:
- ✅ Data persists between sessions
- ✅ No server or database setup required
- ✅ Works completely offline
- ⚠️ Data is local to your browser (clearing browser data will delete your transactions)

## Future Database Integration

The app is structured with API-style functions (`storageAPI`) that make it easy to swap LocalStorage for a real database. Simply modify the `storageAPI.getData()` and `storageAPI.saveData()` functions to connect to your backend API.

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
BudgetAppje/
├── app/
│   ├── globals.css          # Global styles with Tailwind directives
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main dashboard page
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
└── README.md                 # This file
```

## License

MIT

## Author

Built with ❤️ using Next.js and Tailwind CSS
