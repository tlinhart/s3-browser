"use strict";

const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const command = require("@pulumi/command");
const { registerAutoTags } = require("pulumi-aws-tags");
const fs = require("node:fs");
const path = require("node:path");
const mime = require("mime");

const config = new pulumi.Config();
const faroEndpointUrl = config.getSecret("faro_endpoint_url");

// Automatically inject tags to created AWS resources.
registerAutoTags({
  "user:Project": pulumi.getProject(),
  "user:Stack": pulumi.getStack(),
});

// Create an S3 bucket.
const bucket = new aws.s3.Bucket("s3-browser-demo-bucket", {
  bucket: "s3-browser-demo.linhart.tech",
  forceDestroy: true,
});

new aws.s3.BucketPolicy("s3-browser-demo-bucket-policy", {
  bucket: bucket.id,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: pulumi.interpolate`${bucket.arn}/*`,
      },
    ],
  }),
});

new aws.s3.BucketCorsConfiguration("s3-browser-demo-bucket-cors", {
  bucket: bucket.id,
  corsRules: [
    {
      allowedHeaders: ["*"],
      allowedMethods: ["GET"],
      allowedOrigins: [pulumi.interpolate`http://${bucket.id}`],
      maxAgeSeconds: 5000,
    },
  ],
});

const bucketWebsite = new aws.s3.BucketWebsiteConfiguration(
  "s3-browser-demo-bucket-website",
  {
    bucket: bucket.id,
    indexDocument: { suffix: "index.html" },
  }
);

// Create a DNS alias record for the bucket's website endpoint.
const zone = aws.route53.getZoneOutput({ name: "linhart.tech" });

const bucketDnsAlias = new aws.route53.Record(
  "s3-browser-demo-bucket-dns-alias",
  {
    name: "s3-browser-demo.linhart.tech",
    zoneId: zone.zoneId,
    type: "A",
    aliases: [
      {
        name: bucketWebsite.websiteDomain,
        zoneId: bucket.hostedZoneId,
        evaluateTargetHealth: false,
      },
    ],
  }
);

// Create a user with permissions to list the bucket's contents.
const user = new aws.iam.User("s3-browser-demo-user", {
  name: "s3-browser-demo",
  path: "/system/",
  permissionsBoundary: "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
});

const userAccessKey = new aws.iam.AccessKey("s3-browser-demo-user-access-key", {
  user: user.name,
});

new aws.iam.UserPolicy("s3-browser-demo-user-policy", {
  user: user.name,
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource: bucket.arn,
      },
    ],
  }),
});

// Create bucket objects for the bucket's contents.
const listFiles = (dir) => {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(absPath));
    } else {
      files.push(absPath);
    }
  }
  return files;
};

for (const file of listFiles("./contents")) {
  const relPath = path.relative("./contents", file);
  new aws.s3.BucketObject(`s3-browser-demo-bucket-object-${relPath}`, {
    key: relPath,
    bucket: bucket.id,
    acl: "private",
    source: new pulumi.asset.FileAsset(file),
    contentType: mime.getType(file) || undefined,
  });
}

// Build the S3 Browser application.
const buildCommand = new command.local.Command(
  "s3-browser-demo-build-command",
  {
    create: "npm install && npm run build",
    dir: "..",
    environment: {
      AWS_REGION: aws.config.region,
      AWS_ACCESS_KEY_ID: userAccessKey.id,
      AWS_SECRET_ACCESS_KEY: userAccessKey.secret,
      BUCKET_NAME: bucket.id,
      ...(faroEndpointUrl && { FARO_ENDPOINT_URL: faroEndpointUrl }),
    },
    triggers: [Math.random()],
  }
);

// Create a bucket object for the index document.
new aws.s3.BucketObject(
  "s3-browser-demo-bucket-object-index.html",
  {
    key: "index.html",
    bucket: bucket.id,
    acl: "private",
    source: buildCommand.id.apply(
      () => new pulumi.asset.FileAsset("../dist/index.html")
    ),
    contentType: "text/html",
  },
  { dependsOn: [buildCommand] }
);

// Export stack outputs.
exports.url = pulumi.interpolate`http://${bucketDnsAlias.fqdn}`;
