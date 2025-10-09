// src/app/(platform)/dashboard/events/[eventId]/_components/live-dashboard.tsx
"use client";

import React, { useEffect } from "react";
import { useLiveDashboard } from "@/hooks/use-live-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";
import {
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  HandThumbUpIcon,
  FaceSmileIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface LiveDashboardProps {
  eventId: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export const LiveDashboard = ({ eventId }: LiveDashboardProps) => {
  const { isConnected, dashboardData, socket } = useLiveDashboard(eventId);

  // ✅ DEBUG: Log state changes
  useEffect(() => {
    console.log("🔍 LiveDashboard render state:", {
      isConnected,
      hasDashboardData: !!dashboardData,
      dashboardData,
    });
  }, [isConnected, dashboardData]);

  // ✅ DEBUG: Manually test socket listener
  useEffect(() => {
    if (socket) {
      console.log("🧪 Setting up manual test listener on socket");
      const testListener = (data: any) => {
        console.log("🧪 MANUAL TEST: dashboard.update received!", data);
      };
      socket.on("dashboard.update", testListener);

      return () => {
        socket.off("dashboard.update", testListener);
      };
    }
  }, [socket]);

  if (!isConnected || !dashboardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-4">
            {isConnected ? (
              <>
                <p>Waiting for first data broadcast...</p>
                {/* ✅ DEBUG INFO */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✅ Socket connected</p>
                  <p>⏳ Waiting for dashboard.update event</p>
                  <p className="font-mono">Event ID: {eventId}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center">
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Connecting to real-time service...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    totalMessages,
    totalVotes,
    totalQuestions,
    totalUpvotes,
    totalReactions,
    liveCheckInFeed,
  } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Messages"
          value={totalMessages}
          icon={ChatBubbleBottomCenterTextIcon}
        />
        <StatCard title="Poll Votes" value={totalVotes} icon={ChartBarIcon} />
        <StatCard
          title="Questions Asked"
          value={totalQuestions}
          icon={QuestionMarkCircleIcon}
        />
        <StatCard
          title="Question Upvotes"
          value={totalUpvotes}
          icon={HandThumbUpIcon}
        />
        <StatCard
          title="Emoji Reactions"
          value={totalReactions}
          icon={FaceSmileIcon}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Check-in Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {liveCheckInFeed.length > 0 ? (
              <AnimatePresence>
                {liveCheckInFeed.map((checkIn, index) => (
                  <motion.div
                    key={checkIn.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <p className="ml-4 text-sm font-medium">
                      {checkIn.name} has checked in.
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No check-ins yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
