

---

# G-Assistant

## Introduction
G-Assistant is a Python desktop application that acts as a personal assistant for managing emails. It provides various features to enhance productivity and organization.

## Setup
To run the application, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/PremSagarS/G-Assistant.git
   ```

2. Navigate to the project directory:
   ```bash
   cd G-Assistant/DesktopApp
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following environment variables:
   - `IMAP_USER`: Your email address
   - `IMAP_PASS`: Two-factor authentication key for login
   - `IMAP_HOST`: IMAP host (e.g., imap.gmail.com)
   - `SMTP_HOST`: SMTP host (e.g., smtp.gmail.com)
   - `WORK_MODE`: Must be set to OPENROUTERS
   - `OPEN_ROUTER_KEY`: Your open router key

5. Run the main application:
   ```bash
   python mainApp.py
   ```

## Features
- Click on a mail to:
  - View any location mentioned in the mail on a map
  - Get a summary of the mail
  - Automatically generate a reply
  - View tasks in the mail and set reminders

## Usage
Explore the various features of G-Assistant to streamline your email management and boost productivity.

---
