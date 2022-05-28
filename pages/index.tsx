import { GetStaticProps } from "next";
import React from "react";
import Footer from "../components/Footer";
import Main from "../components/Main";
import Rsvp from "../components/Rsvp";
import { getFeature } from "../lib/feature";
import prisma from "../lib/prisma";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import Head from "next/head";

export const getStaticProps: GetStaticProps = async () => {
  const features = await prisma.feature.findMany();
  const eventId = parseInt(getFeature("defaultEventId", features));
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
    },
  });
  const coupleName = getFeature("coupleName", features);
  const footerText = getFeature("footerText", features);
  const enableRsvpForm = getFeature("enableRsvpForm", features) == "1";

  const region = "ap-southeast-1";
  const s3 = new S3Client({
    region: region,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: region }),
      identityPoolId: `${region}:${process.env.S3_COGNITO_IDENTITY_POOL_ID}`,
    }),
  });
  const bucketName = "wedo.sg";
  var splashPhotos: string[] = [];
  try {
    const prefix = "splash/";
    const data = await s3.send(
      new ListObjectsV2Command({
        Prefix: prefix,
        Bucket: bucketName,
      })
    );
    if (!data.Contents || data.Contents.length <= 1) {
      throw new Error("No images in source bucket");
    }
    const href = "https://s3." + region + ".amazonaws.com/";
    const bucketUrl = href + bucketName + "/";
    data.Contents.forEach((photo) => {
      if (photo.Key !== prefix) {
        var key = photo.Key;
        key = key.replace(prefix, "");
        splashPhotos.push(
          bucketUrl + prefix + encodeURIComponent(key).replace(/%20/g, "+")
        );
      }
    });
  } catch (e) {
    console.error("Failed to load photos: ", e);
    splashPhotos.push("/main.png");
  }

  return {
    props: {
      eventStartTime: event.startTime,
      eventLocation: event.location,
      eventSublocation: event.sublocation,
      coupleName: coupleName,
      footerText: footerText,
      enableRsvpForm: enableRsvpForm,
      splashPhotos: splashPhotos,
    },
    revalidate: 3600,
  };
};

const Overview: React.FC = (props: any) => {
  return (
    <>
      <Head>
        <title>WeDo</title>
      </Head>
      <Main>
        <Rsvp rsvpProps={props} />
        <Footer text={props.footerText} />
      </Main>
    </>
  );
};

export default Overview;
