module.exports = {
    async rewrites() {
      return [
        {
          source: '/',
          destination: '/api/server', // Redirige a tu API Route
        },
      ];
    },
  };
  