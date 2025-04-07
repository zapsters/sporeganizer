export type ClassJson = {
	name: string;
	icon: string;
	notes: string;
	classId: string;
	time: Record<string, [string, string]>;
};
export type AssignmentJson = {
	name: string;
	notes: string;
	classId: string;
	assignmentId: string;
	time: string;
	completed: boolean;
};
