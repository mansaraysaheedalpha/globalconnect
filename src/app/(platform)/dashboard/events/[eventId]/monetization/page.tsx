
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ads } from "./ads";
import { Upsells } from "./upsells";
import { Waitlist } from "./waitlist";

const MonetizationPage = () => {
  return (
    <Tabs defaultValue="ads">
      <TabsList>
        <TabsTrigger value="ads">Ads</TabsTrigger>
        <TabsTrigger value="upsells">Upsells</TabsTrigger>
        <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
      </TabsList>
      <TabsContent value="ads">
        <Ads />
      </TabsContent>
      <TabsContent value="upsells">
        <Upsells />
      </TabsContent>
      <TabsContent value="waitlist">
        <Waitlist />
      </TabsContent>
    </Tabs>
  );
};

export default MonetizationPage;