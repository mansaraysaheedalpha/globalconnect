// src/components/layout/OrganizationSwitcher.tsx
'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuthStore } from '@/store/auth.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, AlertTriangle } from 'lucide-react'; // Import an icon for errors
import { useRouter } from 'next/navigation';

// ... (GraphQL queries remain the same)
const GET_MY_ORGS_QUERY = gql`
  query GetMyOrgs {
    myOrganizations {
      id
      name
    }
  }
`;

const SWITCH_ORG_MUTATION = gql`
  mutation SwitchOrg($organizationId: ID!) {
    switchOrganization(organizationId: $organizationId) {
      token
      user {
        id
        email
        first_name
      }
    }
  }
`;


export function OrganizationSwitcher() {
  const { data, loading, error } = useQuery(GET_MY_ORGS_QUERY);
  const { orgId, setAuth } = useAuthStore();

  const router = useRouter(); 
  const [switchOrg, { loading: switching }] = useMutation(SWITCH_ORG_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.switchOrganization;
      if (token && user) {
        setAuth(token, user);
        router.push("/dashboard"); // <-- Smoothly navigate
      }
    },
  });

  const handleSwitch = (newOrgId: string) => {
    if (newOrgId === orgId) return;
    switchOrg({ variables: { organizationId: newOrgId } });
  };
  
  // --- NEW: Handle the error state ---
  if (error) {
    console.error("Error fetching organizations:", error);
    return (
      <Button variant="destructive" className="w-56 justify-between">
        <span className="truncate">Error Loading Orgs</span>
        <AlertTriangle className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  const currentOrg = data?.myOrganizations.find((org: {id: string}) => org.id === orgId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-56 justify-between" disabled={loading}>
          <span className="truncate">
            {loading ? 'Loading...' : (currentOrg ? currentOrg.name : 'Select Organization')}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data?.myOrganizations.map((org: { id: string, name: string }) => (
          <DropdownMenuItem key={org.id} onSelect={() => handleSwitch(org.id)} disabled={switching}>
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}