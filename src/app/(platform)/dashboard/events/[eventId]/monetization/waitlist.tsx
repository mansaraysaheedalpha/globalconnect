
import { useMonetization } from "@/hooks/use-monetization";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const Waitlist = () => {
    const params = useParams();
    const eventId = params.eventId as string;
    const { waitlistStatus, joinWaitlist } = useMonetization(eventId);
    const [isJoining, setIsJoining] = useState(false);

    const handleJoinWaitlist = () => {
        setIsJoining(true);
        joinWaitlist();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Join the Waitlist</CardTitle>
                <CardDescription>
                If this session is full, you can join the waitlist to be notified when a spot becomes available.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {waitlistStatus && <p className="text-green-500">{waitlistStatus}</p>}
            </CardContent>
            <CardFooter>
                <Button onClick={handleJoinWaitlist} disabled={isJoining}>
                    {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Join Waitlist
                </Button>
            </CardFooter>
        </Card>
    );
};