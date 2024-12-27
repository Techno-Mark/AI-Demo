/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APIKEY: process.env.APIKEY,
    APIBASE: process.env.APIBASE,
    APIVERSION: process.env.APIVERSION,
    DEPLOYMENTNAME: process.env.DEPLOYMENTNAME,
  },
};

module.exports = nextConfig;
