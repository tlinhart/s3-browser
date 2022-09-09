# S3 Browser

[![CI workflow status][badge]][actions]

[badge]: https://github.com/tlinhart/s3-browser/actions/workflows/ci.yml/badge.svg
[actions]: https://github.com/tlinhart/s3-browser/actions

Simple explorer for Amazon S3 buckets built with React.

## Motivation and Design

Suppose you have contents in an Amazon S3 bucket which you would like to make
accessible to either non-technical people or people who don't have access to an
Amazon S3 console. You are looking for a simple way without building a custom
application for the purpose. That's where S3 Browser kicks in. It's a
single-page (and single-file) application using AWS SDK to list the bucket's
contents. It relies on the bucket to have static website hosting enabled for
actually accessing the contents. S3 Browser is designed, though not required, to
be hosted from the same bucket as well.

## S3 Bucket and IAM Setup

The instructions below provide basic configuration steps for an S3 bucket named
`www.example.com`.

1. Enable static website hosting for the bucket and configure `index.html` as
   the index document.
1. Disable block public access settings and add the following bucket policy to
   grant public read access:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::www.example.com/*"
       }
     ]
   }
   ```

1. Add the following CORS configuration to enable AWS SDK API calls:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET"],
       "AllowedOrigins": ["http://www.example.com"],
       "ExposeHeaders": []
     }
   ]
   ```

   This assumes that S3 Browser is hosted from the same bucket and accessed
   using a CNAME record `www.example.com` for the website endpoint. If this is
   not the case, change the value in an `AllowedOrigins` element accordingly or
   set it to `*` to allow access from any origin.

1. Create an IAM user with programmatic access and attach the following inline
   policy to grant the user permission to list the bucket's contents:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "s3:ListBucket",
         "Resource": "arn:aws:s3:::www.example.com"
       }
     ]
   }
   ```

## Usage

Start by cloning the repository and installing the dependencies:

```sh
git clone https://github.com/tlinhart/s3-browser.git
cd s3-browser
npm install
```

Next, rename the `.env.example` file to `.env` and set the environment
variables. This will provide configuration for the application.

### Development Server

To start the webpack development server with Hot Module Replacement (HMR)
enabled, run

```sh
npm run start
```

and open the browser at `http://localhost:8080`.

### Production Build

To build the application for production, run

```sh
npm run build
```

This will bundle everything into a single distributable file `dist/index.html`
ready to be uploaded to the S3 bucket. To test the production build, run

```sh
npm run serve
```

and point the browser to `http://localhost:3000`.

### Linting and Tests

To lint the code with ESLint and automatically try to fix the issues, run

```sh
npm run lint:fix
```

To run the tests with Jest test runner, issue

```sh
npm run test
```

By default, Jest runs in silent mode which prevents console output during the
tests. To allow it (e.g. for debugging), run

```sh
npm run test -- --no-silent
```

## Demo

There is a demo of the application available at
http://s3-browser-demo.linhart.tech where S3 Browser is hosted from the same
bucket as the contents (obtained from [getsamplefiles.com][getsamplefiles]). The
whole stack is managed with Pulumi IaC and deployed using GitHub Actions.

[getsamplefiles]: https://getsamplefiles.com
