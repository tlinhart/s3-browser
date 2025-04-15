process.env.AWS_REGION = "eu-central-1";
process.env.AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
process.env.AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
process.env.BUCKET_NAME = "www.example.com";
process.env.EXCLUDE_PATTERN = "^index\\.html$";

// https://github.com/jsdom/jsdom/issues/3363#issuecomment-2283886610
global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
