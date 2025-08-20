# Monitoring Endpoints for UptimeRobot

This document describes the monitoring endpoints available for uptime monitoring with UptimeRobot.

## 🚀 Quick Start

**Recommended endpoint for UptimeRobot:**
```
https://ims-iwiz-solutions.onrender.com/api/ping
```

## 📊 Available Endpoints

### 1. **Ping Endpoint** (Recommended)
- **URL:** `/api/ping`
- **Method:** GET
- **Response:** `pong`
- **Use Case:** Basic uptime monitoring
- **Weight:** Ultra-lightweight

### 2. **Status Endpoint**
- **URL:** `/api/status`
- **Method:** GET
- **Response:** `OK`
- **Use Case:** Simple health check
- **Weight:** Ultra-lightweight

### 3. **Uptime Endpoint**
- **URL:** `/api/uptime`
- **Method:** GET
- **Response:** JSON with uptime info
- **Use Case:** Detailed uptime monitoring
- **Weight:** Lightweight

### 4. **Health Check**
- **URL:** `/api/health`
- **Method:** GET
- **Response:** JSON with server info
- **Use Case:** General health monitoring
- **Weight:** Medium

### 5. **Database Health**
- **URL:** `/api/health/db`
- **Method:** GET
- **Response:** JSON with DB status
- **Use Case:** Database connectivity monitoring
- **Weight:** Medium

### 6. **Comprehensive Monitor**
- **URL:** `/api/monitor`
- **Method:** GET
- **Response:** JSON with detailed system info
- **Use Case:** Advanced monitoring
- **Weight:** Heavy

## 🔧 UptimeRobot Configuration

### Basic Setup
1. **URL:** `https://ims-iwiz-solutions.onrender.com/api/ping`
2. **Monitoring Type:** HTTP(s)
3. **Check Interval:** 5 minutes
4. **Expected Response:** `pong`

### Advanced Setup
1. **URL:** `https://ims-iwiz-solutions.onrender.com/api/uptime`
2. **Monitoring Type:** HTTP(s)
3. **Check Interval:** 5 minutes
4. **Expected Response:** JSON with `"status": "UP"`

## 📈 Response Examples

### Ping Response
```
pong
```

### Uptime Response
```json
{
  "status": "UP",
  "uptime": 12345.67,
  "timestamp": 1640995200000
}
```

### Health Response
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production"
}
```

### Monitor Response
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 12345.67,
  "environment": "production",
  "database": {
    "status": "connected",
    "state": 1
  },
  "memory": {
    "rss": "45 MB",
    "heapUsed": "25 MB",
    "heapTotal": "35 MB"
  },
  "responseTime": "5ms"
}
```

## ⚠️ Error Responses

### Server Down
- **Status Code:** 503, 500, or timeout
- **Response:** Error message or no response

### Database Down
- **Status Code:** 503
- **Response:** 
```json
{
  "status": "ERROR",
  "database": "disconnected",
  "state": 0,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎯 Recommended Monitoring Strategy

### Primary Monitor
- **Endpoint:** `/api/ping`
- **Interval:** 5 minutes
- **Alert:** Immediate notification

### Secondary Monitor
- **Endpoint:** `/api/uptime`
- **Interval:** 10 minutes
- **Alert:** 2 consecutive failures

### Database Monitor
- **Endpoint:** `/api/health/db`
- **Interval:** 15 minutes
- **Alert:** 1 failure

## 🔍 Troubleshooting

### If `/api/ping` fails:
1. Check if server is running
2. Check network connectivity
3. Check Render service status

### If `/api/uptime` fails:
1. Check server uptime
2. Check process health
3. Check memory usage

### If `/api/health/db` fails:
1. Check MongoDB connection
2. Check database credentials
3. Check MongoDB Atlas status

## 📊 Performance Metrics

- **Response Time:** < 100ms (ping)
- **Response Time:** < 500ms (uptime)
- **Response Time:** < 1000ms (monitor)
- **Uptime Target:** 99.9%
- **Memory Usage:** < 100MB
- **Database Connection:** Always connected
