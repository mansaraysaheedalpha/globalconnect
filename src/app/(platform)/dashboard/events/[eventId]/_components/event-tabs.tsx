"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";

export const EventTabs = () => {
    const router = useRouter();
    const pathname = usePathname();

    const onSelect = (value: string) => {
        router.push(value);
    };

    return (
        <Tabs value={pathname} onValueChange={onSelect}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
                <TabsTrigger value={`/dashboard/events/${pathname.split("/")[3]}`}>
                    Dashboard
                </TabsTrigger>
                <TabsTrigger value={`/dashboard/events/${pathname.split("/")[3]}/leaderboard`}>
                    Leaderboard
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};