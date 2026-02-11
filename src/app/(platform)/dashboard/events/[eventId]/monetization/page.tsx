
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueInsights } from "./revenue-insights";
import { Ads } from "./ads";
import { Upsells } from "./upsells";
import { Waitlist } from "./waitlist";

const MonetizationPage = () => {
  return (
    <Tabs defaultValue="revenue">
      <TabsList>
        <TabsTrigger value="revenue">Revenue Insights</TabsTrigger>
        <TabsTrigger value="ads">Ads</TabsTrigger>
        <TabsTrigger value="upsells">Upsells</TabsTrigger>
        <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
      </TabsList>
      <TabsContent value="revenue">
        <RevenueInsights />
      </TabsContent>
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