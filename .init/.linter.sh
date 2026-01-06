#!/bin/bash
cd /home/kavia/workspace/code-generation/personal-expense-tracker-41143-41152/expense_tracker_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

