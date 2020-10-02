#!/bin/bash
# Deployment script for LoadFormData
echo "======================================== Load Form Data ==================================================================="

export REACT_APP_FORMS_ENGINE_API="https://apidev.example.com"
cd web && npm install && npm run loadData
      
echo "====================================== Load Form data done!! ==============================================================="