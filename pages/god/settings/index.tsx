import { Feature } from ".prisma/client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Button, Form, Row, Table } from "react-bootstrap";
import Main from "../../../components/Main";
import prisma from "../../../lib/prisma";

export const getServerSideProps: GetServerSideProps = async () => {
  const features = await prisma.feature.findMany({
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  return { props: { features } };
};

const GodSettings: React.FC = (props: any) => {
  const router = useRouter();
  const features: Feature[] = props.features;
  const [featureSet, setFeatureSet] = useState(new Map<string, string>());
  const [isLoading, setIsLoading] = useState(false);
  const [isNoSave, setIsNoSave] = useState(true);
  const addToSet = (v: string, k: string) => {
    featureSet[k] = v;
    setFeatureSet(featureSet);
  };
  const save = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await (
        await fetch(`/api/features`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(featureSet),
        })
      ).json();
      if (response.error) {
        throw Error(JSON.stringify(response.error));
      }
    } catch (error) {
      alert(`Something went wrong. ${error}`);
      console.error(error);
    }
    router.reload();
  };
  return (
    <>
      <Head>
        <title>GOD | Settings</title>
      </Head>
      <Main>
        <Row className="m-3">
          <h3>Settings</h3>
          <Form onSubmit={save}>
            <Table responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f) => {
                  return (
                    <tr key={f.id}>
                      <td>{f.name}</td>
                      <td>
                        <Form>
                          <Form.Control
                            defaultValue={f.value}
                            onChange={(e) => {
                              addToSet(e.target.value, f.name);
                              setIsNoSave(false);
                            }}
                          />
                        </Form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Button disabled={isLoading || isNoSave} type="submit">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </Form>
        </Row>
      </Main>
    </>
  );
};

export default withPageAuthRequired(GodSettings);
