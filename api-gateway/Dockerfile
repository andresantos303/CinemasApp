# Use the official Nginx image
FROM nginx:alpine
# Remove the default configuration
RUN rm /etc/nginx/conf.d/default.conf
# Copy your custom Nginx configuration
COPY api-gateway-nginx.conf /etc/nginx/conf.d/api-gateway.conf
# Expose port 80 (Swarm will handle published ports)
EXPOSE 80