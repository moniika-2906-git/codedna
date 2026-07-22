import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScoreBadge } from "./ScoreBadge";
import { Doc } from "../../../convex/_generated/dataModel";

type SubmissionRow = Doc<"sessions"> & {
  candidateName: string;
  candidateEmail: string;
  totalPrompts: number;
};

interface CandidateTableProps {
  submissions: SubmissionRow[];
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const CandidateTable = ({ submissions }: CandidateTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-500">Candidate</TableHead>
            <TableHead className="text-zinc-500">Problem</TableHead>
            <TableHead className="text-zinc-500">Score</TableHead>
            <TableHead className="text-zinc-500">AI Interactions</TableHead>
            <TableHead className="text-zinc-500">Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow
              key={submission._id}
              onClick={() =>
                navigate(`/dashboard/candidate/${submission._id}`)
              }
              className="cursor-pointer border-zinc-800 hover:bg-zinc-800/50"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-500/20 text-xs font-medium text-indigo-400">
                      {getInitials(submission.candidateName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {submission.candidateName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {submission.candidateEmail}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                {submission.problemName}
              </TableCell>
              <TableCell>
                <ScoreBadge score={submission.score ?? 0} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                  {submission.totalPrompts}
                </div>
              </TableCell>
              <TableCell className="text-sm text-zinc-400">
                {formatDate(submission.submittedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
