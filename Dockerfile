FROM nginx:alpine
COPY strong-the-beach-to-report.html /usr/share/nginx/html/index.html
COPY chart.min.js /usr/share/nginx/html/chart.min.js
EXPOSE 80
