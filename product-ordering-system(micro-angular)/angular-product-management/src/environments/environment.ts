export const environment = {
  production : false,
 
  // API Gateway base URL – all Angular HTTP calls use this prefix
  gatewayUrl : 'http://localhost:8083',
 
  // Individual service ports (useful for health checks / debugging)
  services: {
    authService    : 'http://localhost:8086',
    demoService1   : 'http://localhost:8085',
    demoService2   : 'http://localhost:8084',
    eurekaServer   : 'http://localhost:8761',
  }
};