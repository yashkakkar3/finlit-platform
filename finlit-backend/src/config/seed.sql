-- ---------------------------------------------------
-- MODULES (sequential learning tree)
-- ---------------------------------------------------
INSERT INTO modules (title, description, order_index) VALUES
('Budgeting 101', 'Learn to track income vs. expenses and build your first budget.', 1),
('What is a Stock?', 'Understand equity, ownership, and how markets price companies.', 2),
('Credit Cards 101', 'How credit works, APR, utilization, and avoiding debt traps.', 3),
('Compound Interest', 'Why time in the market beats timing the market.', 4);

-- ---------------------------------------------------
-- LESSONS
-- ---------------------------------------------------
-- Module 1: Budgeting 101 (id=1)
INSERT INTO lessons (module_id, title, content, xp_reward, order_index) VALUES
(1, 'Income vs. Expenses', 'Every budget starts with knowing what comes in and what goes out.', 10, 1),
(1, 'The 50/30/20 Rule', '50% needs, 30% wants, 20% savings/debt repayment.', 10, 2);

-- Module 2: What is a Stock? (id=2)
INSERT INTO lessons (module_id, title, content, xp_reward, order_index) VALUES
(2, 'Ownership & Shares', 'A stock is a fractional ownership claim on a company.', 15, 1),
(2, 'How Prices Move', 'Prices reflect supply, demand, and expectations of future earnings.', 15, 2);

-- Module 3: Credit Cards 101 (id=3)
INSERT INTO lessons (module_id, title, content, xp_reward, order_index) VALUES
(3, 'How APR Works', 'Interest compounds on unpaid balances — pay in full to avoid it.', 15, 1),
(3, 'Credit Utilization', 'Keeping usage under 30% of your limit protects your credit score.', 15, 2);

-- Module 4: Compound Interest (id=4)
INSERT INTO lessons (module_id, title, content, xp_reward, order_index) VALUES
(4, 'The Compounding Curve', 'Interest earning interest creates exponential, not linear, growth.', 20, 1),
(4, 'Starting Early', 'A 10-year head start can outweigh decades of larger contributions later.', 20, 2);

-- ---------------------------------------------------
-- QUIZ QUESTIONS (one per lesson for MVP; add more later)
-- choices is JSON array, correct_index is 0-based
-- ---------------------------------------------------
INSERT INTO quiz_questions (lesson_id, question_text, choices, correct_index) VALUES
(1, 'Which of these is an expense, not income?', '["Salary", "Rent payment", "Freelance payment", "Cash gift"]', 1),
(2, 'In the 50/30/20 rule, what does the 20% represent?', '["Wants", "Needs", "Savings/debt repayment", "Taxes"]', 2),
(3, 'Owning a stock means you own what?', '["A loan to the company", "A fractional share of the company", "A coupon for products", "A government bond"]', 1),
(4, 'A stock price mainly reflects what?', '["The CEO''s salary", "Supply, demand, and future earnings expectations", "The company''s logo design", "The stock exchange''s location"]', 1),
(5, 'What increases the cost of carrying a credit card balance?', '["Paying in full monthly", "APR on unpaid balance", "Using a debit card instead", "Direct deposit"]', 1),
(6, 'What is a healthy credit utilization ratio?', '["Under 30% of your limit", "Exactly 100% of your limit", "Over 90% of your limit", "It does not matter"]', 0),
(7, 'Compound interest grows your money how?', '["Linearly", "Exponentially, as interest earns interest", "It shrinks over time", "Only once per year"]', 1),
(8, 'Why does starting to invest early matter?', '["It does not matter at all", "More time lets compounding do more work", "Early investors pay higher fees", "Markets only go up in the first year"]', 1);
